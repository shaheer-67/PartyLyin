"use client";
import { useState, useEffect } from "react";
import { Search, PenLine, MapPin, PhoneCall } from "lucide-react";
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, updateDoc, doc, increment, serverTimestamp, arrayUnion, arrayRemove
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
  const [lies, setLies] = useState<Lie[]>(SEED_LIES); // seed shown while Firestore loads
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<LieTag>("All");
  const [openChatIds, setOpenChatIds] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<LocationScope>("Local");
  const [selectedLieId, setSelectedLieId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newLieText, setNewLieText] = useState("");
  const [newLieTag, setNewLieTag] = useState<Exclude<LieTag, "All">>("Entertainment");

  // ── Firestore real-time subscription ─────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "lies"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return; // keep seed data if collection empty
      const fetched: Lie[] = snap.docs.map((d) => ({
        id: d.id,
        text: d.data().text,
        tag: d.data().tag,
        n: d.data().n ?? 0,
        likedBy: d.data().likedBy || [],
        authorId: d.data().authorId,
      }));
      setLies(fetched);
    });
    return () => unsub();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const shownLies = lies.filter(
    (l) =>
      l.text.toLowerCase().includes(search.toLowerCase()) &&
      (activeTag === "All" || l.tag === activeTag)
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleLike(lie: Lie) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const wasLiked = lie.likedBy?.includes(uid);
    try {
      await updateDoc(doc(db, "lies", lie.id), {
        n: increment(wasLiked ? -1 : 1),
        likedBy: wasLiked ? arrayRemove(uid) : arrayUnion(uid),
      });
    } catch (e) {
      console.error("Like error", e);
    }
  }

  function handleChat(id: string) {
    setOpenChatIds((prev) => toggleSet(prev, id));
    if (findPartyMode) setSelectedLieId(id);
  }

  async function handlePostLie() {
    if (!newLieText.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "lies"), {
        text: newLieText.trim(),
        tag: newLieTag,
        n: 0,
        likedBy: [],
        authorId: auth.currentUser?.uid ?? "anonymous",
        createdAt: serverTimestamp(),
      });
      setNewLieText("");
      setShowPostModal(false);
    } catch (e) {
      console.error("Failed to post lie:", e);
    } finally {
      setPosting(false);
    }
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
              <span style={{ color: scopeColor }}>{scope}</span> PartyLyiN
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
            Select a lie below that sparks your interest — it will start the conversation when you join your PartyLyiN call.
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
            ? "Choose a lie to kick off your PartyLyiN conversation."
            : "Tell a small lie. Start a real chat."}
        </p>

        {/* Search */}
        <label className="glass rounded-full mt-3 px-4 py-2.5 flex items-center gap-2">
          <Search className="w-4 h-4" style={{ color: "var(--mute)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              liked={lie.likedBy?.includes(auth.currentUser?.uid || "") || false}
              chatOpened={openChatIds.has(lie.id)}
              onLike={() => handleLike(lie)}
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
            {selectedLieId ? `Join ${scope} PartyLyiN Call` : "Pick a Lie First"}
          </button>
        </div>
      )}

      {/* ── Post lie FAB ─────────────────────────────────────────── */}
      {!findPartyMode && (
        <button
          onClick={() => setShowPostModal(true)}
          className="absolute right-5 bottom-4 w-14 h-14 rounded-full grad text-white grid place-items-center shadow-xl"
          aria-label="Post a lie"
        >
          <PenLine className="w-6 h-6" />
        </button>
      )}

      {/* ── Post Lie Modal ───────────────────────────────────────── */}
      {showPostModal && (
        <div
          className="absolute inset-0 z-40 flex items-end bg-black/60"
          onClick={(e) => e.target === e.currentTarget && setShowPostModal(false)}
        >
          <div className="w-full rounded-t-[28px] p-5 flex flex-col gap-4" style={{ background: "var(--bg)" }}>
            <h3 className="text-xl font-extrabold">Post a Lie 🤥</h3>
            <textarea
              value={newLieText}
              onChange={(e) => setNewLieText(e.target.value)}
              placeholder={`"I only hit snooze once." (keep it funny!)`}
              className="auth-input resize-none"
              rows={3}
              maxLength={140}
              autoFocus
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--mute)" }}>Tag</p>
              <div className="flex flex-wrap gap-2">
                {LIE_TAGS.filter(t => t !== "All").map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewLieTag(t as Exclude<LieTag, "All">)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                      newLieTag === t
                        ? "grad text-white border-transparent"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPostModal(false)}
                className="flex-1 py-3 rounded-full font-bold glass"
              >
                Cancel
              </button>
              <button
                onClick={handlePostLie}
                disabled={posting || !newLieText.trim()}
                className="flex-1 py-3 rounded-full font-bold grad text-white cta"
                style={{ opacity: posting || !newLieText.trim() ? 0.6 : 1 }}
              >
                {posting ? "Posting..." : "Post It!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
