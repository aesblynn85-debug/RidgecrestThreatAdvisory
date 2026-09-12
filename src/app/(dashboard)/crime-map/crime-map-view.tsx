"use client";

import { useState } from "react";
import { SearchIcon, MapIcon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import type { CadRecordRow } from "@/lib/supabase/types";

// Ridgecrest, CA — default center until an address is searched.
const DEFAULT_CENTER = { lat: 35.6225, lon: -117.6709, label: "Ridgecrest, CA" };

type Center = { lat: number; lon: number; label: string };

function wazeEmbedUrl(lat: number, lon: number, zoom = 15) {
  // Waze's official Live Map embed — public, no API key required.
  return `https://embed.waze.com/iframe?zoom=${zoom}&lat=${lat}&lon=${lon}&pin=1`;
}

export function CrimeMapView({ incidents }: { incidents: CadRecordRow[] }) {
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<Center>(DEFAULT_CENTER);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function locate(address?: string) {
    const q = (address ?? query).trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (!data?.length) {
        setError("No match found for that address.");
        return;
      }
      setCenter({
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        label: data[0].display_name,
      });
    } catch {
      setError("Address lookup failed. Try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Street address, intersection, or client site…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && locate()}
            />
          </div>
          <button className="btn-primary shrink-0" onClick={() => locate()} disabled={searching}>
            {searching ? (
              "Locating…"
            ) : (
              <>
                <MapIcon className="h-4 w-4" /> Locate
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        <p className="mt-2 text-xs text-slate-500">
          Geocoded via OpenStreetMap Nominatim, then centered on Waze's live traffic map. Currently
          showing {center.label}.
        </p>
      </div>

      <div className="card mt-4 overflow-hidden p-0">
        <iframe
          key={`${center.lat},${center.lon}`}
          title="Live traffic map"
          className="h-[480px] w-full"
          src={wazeEmbedUrl(center.lat, center.lon)}
          style={{ border: 0 }}
          allowFullScreen
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-slate-300">Recent CAD incidents</h2>
        {incidents.length ? (
          <div className="card divide-y divide-base-700 p-0">
            {incidents.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">{inc.record_type}</p>
                  <p className="truncate text-xs text-slate-500">
                    {inc.location || "No location on file"} · {formatDateTime(inc.occurred_at)}
                  </p>
                </div>
                {inc.location && (
                  <button
                    className="btn-secondary shrink-0 text-xs"
                    onClick={() => locate(inc.location!)}
                  >
                    View on map
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="card text-sm text-slate-500">No CAD incidents recorded yet.</p>
        )}
      </div>
    </div>
  );
}
