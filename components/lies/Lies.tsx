"use client";
import { useState } from "react";
import { Search, PenLine, MapPin, PhoneCall } from "lucide-react";
import { Chips } from "@/components/ui/Chips";
import { LieCard } from "./LieCard";
import { toggleSet } from "@/lib/utils";
import { SEED_LIES, LIE_TAGS, LOCATION_SCOPES } from "@/lib/constants";
import type { Lie, LieTag } from "@/types";
import type { LocationScope } from "@/lib/constants";

// Colour per scope for the scope pill badge
const SCOPE_COLORS: Record<LocationScope, string> = {
  Local:    "#1db954",
  City:     "#3b82f6",
  County:   "#f97316",
  State:    "#9b1fad",
  National: "#e91e8c",
};

interface LiesProps {
  /**
   * When set, Lies is opened from "Find My Party" flow.
   * Shows a discovery banner and a "Join Party Call" CTA.
   */
  findPartyMode?: boolean;
  /** Called when user taps "Join Party Call" in findPartyMode */
  onJoinCall?: () => void;
}

/**
 * Lies feed screen.
 *
 * In normal mode  → searchable / filterable lies feed.
 * In findPartyMode → shows location scope selector (Local → National)
 *   so user picks a lie they vibe with BEFORE joining a call room.
 *
 * TODO (Phase 4): replace SEED_LIES with real-time Firestore subscription per scope.
 * TODO (Phase 4): replace prompt() post flow with PostLieModal component.
 */
export default function Lies({ findPartyMode = false, onJoinCall }: LiesProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [lies, setLies] = useState<Lie[]>(SEED_LIES);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<LieTag>("All");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [openChatIds, setOpenChatIds] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<LocationScope>("Local");
  const [selectedLieId, setSelectedLieId] = useState<string | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const shownLies = lies.filter(
    (l) =>
      l.text.toLowerCase().includes(query.toLowerCase()) &&
      (activeTag === "All" || l.tag === activeTag)
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleLike(id: string) {
    setLikedIds((prev) => toggleSet(prev, id));
  }

  function handleChat(id: string) {
    setOpenChatIds((prev) => toggleSet(prev, id));
    // In findPartyMode, selecting a lie means choosing it as conversation starter
    if (findPartyMode) setSelectedLieId(id);
  }

  function handlePostLie() {
    // TODO (Phase 4): replace with PostLieModal + Firestore write
    const text = prompt("Your lie (keep it funny):");
    if (!text) return;
    const newLie: Lie = {
      id: Date.now().toString(),
      text,
      tag: "Social",
      n: 0,
    };
    setLies((prev) => [newLie, ...prev]);
  }

  const scopeColor = SCOPE_COLORS[scope];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">

      {/* ── Find-Party discovery banner ───────────────────────────── */}
      {findPartyMode && (
        <div
          className="mx-4 mt-4 rounded-3xl p-4 flex flex-col gap-3"
          style={{
            background: "linear-gradient(135deg,#4f1b7c22,#1db95422)",
            border: "1px solid rgba(155,31,173,0.25)",
          }}
        >
          {/* Title row */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: scopeColor }} />
            <p className="font-extrabold text-sm">
              Pick a Lie · Start a{" "}
              <span style={{ color: scopeColor }}>{scope}</span> Party
            </p>
          </div>

          {/* Location scope chips */}
          <div className="flex gap-2 overflow-x-auto scroll pb-0.5">
            {LOCATION_SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className="chip whitespace-nowrap"
                aria-pressed={scope === s}
                style={
                  scope === s
                    ? {
                        background: SCOPE_COLORS[s],
                        color: "#fff",
                        borderColor: "transparent",
                        boxShadow: `0 4px 14px ${SCOPE_COLORS[s]}55`,
                      }
                    : undefined
                }
              >
                {s}
              </button>
            ))}
          </div>

          <p className="text-xs" style={{ color: "var(--mute)" }}>
            Select a lie below that sparks your interest — it will start the conversation when you join your party call.
          </p>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-5 pt-4">
        <h2 className="text-4xl font-extrabold tracking-tight leading-none">
          Conversation <span className="gtxt">Lies</span>
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
          {findPartyMode
            ? "Choose a lie to kick off your party conversation."
            : "Tell a small lie. Start a real chat."}
        </p>

        {/* Search */}
        <label className="glass rounded-full mt-3 px-4 py-2.5 flex items-center gap-2">
          <Search className="w-4 h-4" style={{ color: "var(--mute)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lies"
            className="bg-transparent flex-1 outline-none text-sm"
            aria-label="Search lies"
          />
        </label>

        {/* Tag filter chips */}
        <div className="mt-3 overflow-x-auto scroll pb-1">
          <Chips opts={LIE_TAGS} value={activeTag} onChange={(v) => setActiveTag(v as LieTag)} />
        </div>
      </div>

      {/* ── Lies list ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 scroll px-4 py-3 space-y-3" style={{ paddingBottom: findPartyMode ? "5rem" : "4rem" }}>
        {shownLies.length === 0 && (
          <p className="text-center py-10" style={{ color: "var(--mute)" }}>
            No lies match. Post yours with the pen button.
          </p>
        )}
        {shownLies.map((lie) => (
          <div
            key={lie.id}
            style={
              findPartyMode && selectedLieId === lie.id
                ? {
                    outline: `2px solid ${scopeColor}`,
                    borderRadius: "24px",
                    boxShadow: `0 0 0 4px ${scopeColor}22`,
                  }
                : undefined
            }
          >
            <LieCard
              lie={lie}
              liked={likedIds.has(lie.id)}
              chatOpened={openChatIds.has(lie.id)}
              onLike={() => handleLike(lie.id)}
              onChat={() => handleChat(lie.id)}
            />
          </div>
        ))}
      </div>

      {/* ── "Join Party Call" sticky CTA (findPartyMode only) ────── */}
      {findPartyMode && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2" style={{ background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
          <button
            onClick={onJoinCall}
            disabled={!selectedLieId}
            className="cta w-full py-4 rounded-full text-white font-extrabold text-lg flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: selectedLieId ? `linear-gradient(135deg,#9b1fad,#1db954)` : "rgba(128,128,128,0.3)",
              opacity: selectedLieId ? 1 : 0.5,
              cursor: selectedLieId ? "pointer" : "not-allowed",
            }}
          >
            <PhoneCall className="w-5 h-5" />
            {selectedLieId ? `Join ${scope} Party Call` : "Pick a Lie First"}
          </button>
        </div>
      )}

      {/* ── Post lie FAB ─────────────────────────────────────────── */}
      {!findPartyMode && (
        <button
          onClick={handlePostLie}
          className="absolute right-5 bottom-4 w-14 h-14 rounded-full grad text-white grid place-items-center shadow-xl"
          aria-label="Post a lie"
        >
          <PenLine className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
