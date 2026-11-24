"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_disabled: "Google sign-in isn't set up on this server yet.",
  oauth_state: "Your Google sign-in session expired. Please try again.",
  oauth_cancelled: "Google sign-in was cancelled.",
  oauth_exchange: "We couldn't verify your Google account. Please try again.",
  oauth_unverified: "Your Google email address isn't verified yet.",
  oauth_account: "We couldn't create or link your account. Please try again.",
  session: "We couldn't start your session. Please try again.",
};

export function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return OAUTH_ERROR_MESSAGES[code] ?? "Google sign-in could not complete. Please try again.";
}

// Cached across mounts so login <-> signup navigation doesn't refetch.
let providersPromise: Promise<boolean> | null = null;

function loadGoogleEnabled(): Promise<boolean> {
  if (!providersPromise) {
    providersPromise = api
      .authProviders()
      .then((p) => p.google_enabled)
      .catch(() => {
        providersPromise = null;
        return false;
      });
  }
  return providersPromise;
}

/**
 * "Continue with Google" button plus the "or ..." divider below it.
 * Renders nothing when the API reports Google OAuth isn't configured.
 */
export function GoogleAuthButton({ dividerLabel }: { dividerLabel: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    loadGoogleEnabled().then((v) => {
      if (active) setEnabled(v);
    });
    return () => {
      active = false;
    };
  }, []);

  if (enabled === false) return null;

  return (
    <>
      <a
        href={api.googleAuthStartUrl()}
        aria-disabled={enabled === null}
        className={`pressable mt-5 flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] ${
          enabled === null ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.2c-.2-.7-.4-1.5-.4-2.2s.1-1.5.4-2.2V6.7H1.3C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.7l4 3.1c.9-2.9 3.6-5 6.7-5z" />
        </svg>
        Continue with Google
      </a>

      <div className="my-5 flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <span className="h-px flex-1 bg-[var(--border-hairline)]" />
        <span>{dividerLabel}</span>
        <span className="h-px flex-1 bg-[var(--border-hairline)]" />
      </div>
    </>
  );
}
