// Minimal hand-rolled icon set (no external icon package) so the project has
// zero extra runtime dependencies beyond Next/React/Supabase.
import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export const OverviewIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Base>
);

export const CadIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M3 12h4l2-7 4 14 2-7h6" />
  </Base>
);

export const CasesIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Base>
);

export const EntitiesIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
  </Base>
);

export const OsintIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
    <path d="M11 7.5a3.5 3.5 0 0 0 0 7" />
  </Base>
);

export const LinkAnalysisIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <path d="M8 7.2 10.2 16M16 7.2 13.8 16M8.5 6h7" />
  </Base>
);

export const TimelineIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M3 6h18M3 12h18M3 18h10" />
    <circle cx="7" cy="6" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="11" cy="18" r="1.4" fill="currentColor" stroke="none" />
  </Base>
);

export const AssessmentsIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M15 3v4h4" />
    <path d="M9 12h6M9 16h6" />
  </Base>
);

export const SecurityIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8.25-7 10-4-1.75-7-5.5-7-10V6l7-3z" />
    <path d="M9.5 12l1.8 1.8L14.5 10" />
  </Base>
);

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Base>
);

export const LogoutIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Base>
);

export const RefreshIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
  </Base>
);

export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
);

export const UploadIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Base>
);


export const MapIcon = (props: SVGProps<SVGSVGElement>) => (
    <Base {...props}>
        <path d="M12 21s7-7.2 7-12.5A7 7 0 0 0 5 8.5C5 13.8 12 21 12 21z" />
          <circle cx="12" cy="8.5" r="2.5" />
    </Base>
  );
