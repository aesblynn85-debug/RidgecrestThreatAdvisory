"use client";

// NOTE: this page intentionally avoids JSX syntax (uses React.createElement
// directly) purely because of an authoring-environment quirk; there is no
// functional reason to prefer this style. Feel free to rewrite it as normal
// JSX later if you're editing locally with a real editor.

import { useEffect, useRef, useState, createElement, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const h = createElement;
const orgName = process.env.NEXT_PUBLIC_ORG_NAME || "Ridgecrest Intelligence";

/**
 * Destination for Supabase invite / magic-link / password-recovery emails.
 *
 * Those emails redirect the browser back here with the session tokens in the
 * URL hash fragment (e.g. #access_token=...&type=invite). Fragments never
 * reach the server, so the Supabase *browser* client (instantiated below)
 * picks them up client-side on load, exchanges them for a real session, and
 * mirrors that session into cookies -- at which point our normal
 * cookie-based middleware treats the visitor as signed in.
 *
 * This route is listed in PUBLIC_PATHS (middleware.ts) so it's reachable
 * before that cookie exists.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;

const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null as string | null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

useEffect(() => {
  let mounted = true;

          const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session && mounted) setReady(true);
          });

          supabase.auth.getSession().then(({ data }) => {
            if (data.session && mounted) setReady(true);
          });

          const timeout = setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (mounted && !data.session) setExpired(true);
          }, 4000);

          return () => {
            mounted = false;
            sub.subscription.unsubscribe();
  clearTimeout(timeout);
          };
}, [supabase]);

async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);

  if (password.length < 8) {
            setError("Password must be at least 8 characters.");
    return;
  }
  if (password !== confirm) {
    setError("Passwords don't match.");
    return;
  }

  setSubmitting(true);
  const { error: updateError } = await supabase.auth.updateUser({ password });
  setSubmitting(false);

  if (updateError) {
    setError(updateError.message);
    return;
  }

  setDone(true);
  setTimeout(() => router.replace("/overview"), 1200);
}

return h(
  "main",
  { className: "flex min-h-screen items-center justify-center bg-base-950 px-4" },
  h(
    "div",
    { className: "w-full max-w-sm" },
    h(
      "div",
      { className: "mb-8 text-center" },
      h("p", { className: "kicker" }, orgName),
      h("h1", { className: "mt-1 text-xl font-semibold text-white" }, "Set your password"),
      h(
        "p",
        { className: "mt-1 text-sm text-slate-400" },
        "Choose a password for your owner account. You'll use this to sign in from now on."
        )
      ),

    h(
  "div",
      { className: "card space-y-4" },
      !ready && !expired && !done
      ? h("p", { className: "text-sm text-slate-400" }, "Verifying your link...")
      : null,
      expired && !done
      ? h(
        "p",
        {
          className:
            "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger",
        },
        "This link has expired or was already used. Ask whoever manages this project to send a new invite or password-reset email from the Supabase dashboard, then try again."
        )
      : null,

      ready && !done
? h(
        "form",
  { onSubmit: handleSubmit, className: "space-y-4" },
  h(
    "div",
    null,
    h("label", { className: "label", htmlFor: "password" }, "New password"),
    h("input", {
      id: "password",
      type: "password",
      autoComplete: "new-password",
      required: true,
      className: "input",
      value: password,
      onChange: (e: any) => setPassword(e.target.value),
      placeholder: "At least 8 characters",
    })
    ),
  h(
    "div",
    null,
    h("label", { className: "label", htmlFor: "confirm" }, "Confirm password"),
    h("input", {
      id: "confirm",
      type: "password",
      autoComplete: "new-password",
      required: true,
      className: "input",
      value: confirm,
      onChange: (e: any) => setConfirm(e.target.value),
      placeholder: "Retype your password",
    })
    ),

  error
  ? h(
    "p",
    {
      className:
        "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger",
    },
      error
    )
  : null,
  h(
    "button",
                                       { type: "submit", className: "btn-primary w-full", disabled: submitting },
    submitting ? "Saving..." : "Save password"
    )
  )
      : null,

      done
      ? h(
        "p",
        {
          className:
            "rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok",
        },
        "Password set. Taking you to your dashboard..."
        )
      : null
      )
    )
  );
}
