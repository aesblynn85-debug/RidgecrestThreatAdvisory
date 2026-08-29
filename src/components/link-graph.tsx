"use client";

import { useMemo, useState } from "react";
import type { EntityLinkRow, EntityRow } from "@/lib/supabase/types";

const CONFIDENCE_COLOR: Record<string, string> = {
  low: "#3a4a5c",
  moderate: "#2dd4bf",
  high: "#5eead4",
  confirmed: "#22c55e",
};

/**
 * Deterministic circular layout — no charting/graph dependency required.
 * Good enough for a handful to a few dozen nodes; swap for a real
 * force-directed layout later if case graphs grow large.
 */
export function LinkGraph({
  entities,
  links,
}: {
  entities: EntityRow[];
  links: (EntityLinkRow & { from: EntityRow; to: EntityRow })[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const size = 520;
  const center = size / 2;
  const radius = size / 2 - 70;

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    entities.forEach((e, i) => {
      const angle = (2 * Math.PI * i) / Math.max(entities.length, 1) - Math.PI / 2;
      map.set(e.id, {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      });
    });
    return map;
  }, [entities, center, radius]);

  if (!entities.length) return null;

  return (
    <div className="card overflow-x-auto">
      <svg width={size} height={size} className="mx-auto max-w-full">
        {links.map((l) => {
          const from = positions.get(l.from_entity_id);
          const to = positions.get(l.to_entity_id);
          if (!from || !to) return null;
          const active = hovered === l.from_entity_id || hovered === l.to_entity_id;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <g key={l.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={CONFIDENCE_COLOR[l.confidence] ?? "#3a4a5c"}
                strokeWidth={active ? 2 : 1.25}
                opacity={hovered && !active ? 0.15 : 0.8}
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                fontSize={10}
                fill="#8896a6"
                opacity={hovered && !active ? 0.15 : 1}
              >
                {l.relationship_type}
              </text>
            </g>
          );
        })}

        {entities.map((e) => {
          const pos = positions.get(e.id);
          if (!pos) return null;
          const dim = hovered && hovered !== e.id && !links.some(
            (l) =>
              (l.from_entity_id === hovered && l.to_entity_id === e.id) ||
              (l.to_entity_id === hovered && l.from_entity_id === e.id)
          );
          return (
            <g
              key={e.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <circle
                r={9}
                fill="#0d121a"
                stroke="#2dd4bf"
                strokeWidth={1.5}
                opacity={dim ? 0.3 : 1}
              />
              <text
                y={-16}
                textAnchor="middle"
                fontSize={11}
                fontWeight={500}
                fill="#e2e8f0"
                opacity={dim ? 0.3 : 1}
              >
                {e.name.length > 20 ? e.name.slice(0, 18) + "…" : e.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500">
        Hover a node to trace its relationships. Line color reflects confidence
        (dim = low, bright teal = high, green = confirmed).
      </p>
    </div>
  );
}
