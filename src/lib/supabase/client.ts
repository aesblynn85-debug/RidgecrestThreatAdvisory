"use client";

import { createBrowserClient } from "@supabase/ssr";

// Note: deliberately untyped (no `<Database>` generic). This project hand-maintains
// src/lib/supabase/types.ts as plain row shapes for component props, but the
// generic Supabase Database type (with a `Relationships` graph) is normally
// produced by `supabase gen types typescript`. Passing our simplified type in
// here would make every `.select()` with a joined/embedded resource (e.g.
// `cases(title)`) fight the type checker. Once you run the Supabase CLI and
// generate real types, wire them back in here for full query type-safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
