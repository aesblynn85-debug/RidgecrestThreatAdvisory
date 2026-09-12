"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AssessmentsIcon,
  CadIcon,
  CasesIcon,
  EntitiesIcon,
  LinkAnalysisIcon,
  LogoutIcon,
  MapIcon,
  OsintIcon,
  OverviewIcon,
  SecurityIcon,
  TimelineIcon,
} from "./icons";

const NAV = [
  { href: "/overview", label: "Overview", icon: OverviewIcon },
  { href: "/cad", label: "CAD Intelligence", icon: CadIcon },
  { href: "/crime-map", label: "Crime Map", icon: MapIcon },
  { href: "/cases", label: "Cases", icon: CasesIcon },
  { href: "/entities", label: "Entities", icon: EntitiesIcon },
  { href: "/osint", label: "Live OSINT", icon: OsintIcon },
  { href: "/links", label: "Link Analysis", icon: LinkAnalysisIcon },
  { href: "/timeline", label: "Timeline", icon: TimelineIcon },
  { href: "/assessments", label: "Assessments", icon: AssessmentsIcon },
  { href: "/security", label: "Security & Sync", icon: SecurityIcon },
];

export function Sidebar({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-base-700 bg-base-900 text-slate-300 md:hidden"
      >
        <span className="sr-only">Open menu</span>
        <span className="block space-y-1">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 -translate-x-full flex-col border-r border-base-700 bg-base-900 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-base-700 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <SecurityIcon className="h-4 w-4" />
          </div>
          <div className="leading-tight" title="Respond, Assess, Verify, Engage, Negate">
            <p className="text-[13px] font-bold uppercase tracking-wide text-white">
              {orgName.split(" ")[0]}
            </p>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">
              {orgName.split(" ").slice(1).join(" ") || "Intelligence"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="ml-auto text-lg leading-none text-slate-500 hover:text-white md:hidden"
          >
            &times;
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-slate-300 hover:bg-base-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-base-700 p-3">
          <div className="mb-2 truncate rounded-lg px-3 py-2 text-xs text-slate-400">
            Signed in as
            <br />
            <span className="text-slate-200">{userEmail}</span>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-base-800 hover:text-white"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
