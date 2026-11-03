"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

/** Compact account control used in the corporate and tournament navigation.
 * Works with both identity providers (built-in passwordless, or Clerk when
 * it is configured) behind the same `useAuth()` contract. */
export function AccountMenu() {
  const { status, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status !== "signed-in" || !user) {
    return (
      <Link
        href="/tournament/register"
        className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
      >
        Sign in
      </Link>
    );
  }

  const initials = (user.full_name || user.email || "P")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-2 py-1.5 text-sm text-paper transition hover:border-flare-500/60"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-flare-500/20 font-mono text-[11px] font-semibold text-flare-300">
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate text-xs text-paper-dim sm:inline">
          {user.full_name || user.email}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-arena-900/95 shadow-arena backdrop-blur-xl"
        >
          <div className="border-b border-white/5 px-4 py-3">
            <p className="truncate text-sm font-medium text-paper">{user.full_name || "Participant"}</p>
            <p className="truncate text-xs text-ash">{user.email}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-flare-300/80">
              {user.email_verified ? "Email verified" : "Email unverified"}
            </p>
          </div>
          <Link
            href="/tournament/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-paper-dim transition hover:bg-white/5 hover:text-paper"
          >
            My tournament dashboard
          </Link>
          <Link
            href="/tournament/leaderboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-paper-dim transition hover:bg-white/5 hover:text-paper"
          >
            Leaderboard
          </Link>
          {user.is_admin && (
            <Link
              href="/admin/tournament"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-flare-300 transition hover:bg-flare-500/10"
            >
              Tournament admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="block w-full border-t border-white/5 px-4 py-2.5 text-left text-sm text-paper-dim transition hover:bg-white/5 hover:text-paper"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
