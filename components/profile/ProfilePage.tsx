"use client";
import { Grid3X3, Settings, LogOut, BadgeCheck } from "lucide-react";

interface ProfilePageProps {
  onSignOut?: () => void;
}

/**
 * User profile screen.
 *
 * Shows avatar, display name, stats, and account actions.
 * TODO (Phase 4): pull real data from Firebase Auth + Firestore user doc.
 * TODO (Phase 4): add photo upload via Firebase Storage.
 */
export default function ProfilePage({ onSignOut }: ProfilePageProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 scroll">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">Profile</h2>
        <button className="w-10 h-10 rounded-full glass grid place-items-center" aria-label="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ── Avatar + name ────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full grad grid place-items-center text-4xl font-extrabold text-white">
            M
          </div>
        </div>
        <h3 className="text-2xl font-extrabold mt-3">Maya, 29</h3>
        <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
          @maya · Verified
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-6">
        {[
          { label: "Parties", value: "18" },
          { label: "Lies Posted", value: "7" },
          { label: "Mins Used", value: "540" },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold gtxt">{value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--mute)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Bio ──────────────────────────────────────────────────── */}
      <div className="glass rounded-3xl mx-5 p-4 mb-4">
        <p className="font-bold mb-1">Bio</p>
        <p className="text-sm" style={{ color: "var(--mute)" }}>
          Love good convos and terrible puns. Always up for a party. 🎉
          {/* TODO (Phase 4): editable bio */}
        </p>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="mx-5 space-y-3">
        <button className="glass w-full rounded-2xl p-4 flex items-center gap-3 font-bold">
          <Grid3X3 className="w-5 h-5 text-amber-500" />
          My Lies
        </button>
        <button
          onClick={onSignOut}
          className="glass w-full rounded-2xl p-4 flex items-center gap-3 font-bold text-rose-500"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
