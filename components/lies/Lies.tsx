"use client";
import { useState, useEffect } from "react";
import { Search, PenLine, MapPin, PhoneCall, Filter, X, Video } from "lucide-react";
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
  /** Called when user taps "Join Party Call" */
  onJoinCall?: (topic?: string) => void;
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
  const [showFilters, setShowFilters] = useState(true);
  const [showScopeSelector, setShowScopeSelector] = useState(true);
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
      const fetched: Lie[] = snap.docs.map((d) => ({
        id: d.id,
        text: d.data().text,
        tag: d.data().tag,
        n: d.data().n ?? 0,
        likedBy: d.data().likedBy || [],
        authorId: d.data().authorId,
      }));
      // Always merge Firestore lies with seed lies so new users always
      // have content. Seed lies whose text already exists in Firestore
      // are deduplicated to avoid duplicates.
      const fetchedTexts = new Set(fetched.map((l) => l.text.toLowerCase()));
      const seedFallbacks = SEED_LIES.filter(
        (s) => !fetchedTexts.has(s.text.toLowerCase())
      );
      setLies([...fetched, ...seedFallbacks]);
    });
    return () => unsub();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const shownLies = lies.filter(
    (l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.text.toLowerCase().includes(q) ||
        l.tag.toLowerCase().includes(q);
      const matchesTag = activeTag === "All" || l.tag === activeTag;
      return matchesSearch && matchesTag;
    }
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
    // Always toggle selected lie on chat click
    setSelectedLieId((prev) => (prev === id ? null : id));
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
        showScopeSelector ? (
          <div
            className="mx-4 mt-4 rounded-3xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              background: "linear-gradient(135deg,#4f1b7c22,#1db95422)",
              border: "1px solid rgba(155,31,173,0.25)",
            }}
          >
            {/* Title row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: scopeColor }} />
                <p className="font-extrabold text-sm">
                  Pick a Lie · Start a{" "}
                  <span style={{ color: scopeColor }}>{scope}</span> PartyLyiN
                </p>
              </div>
              <button
                onClick={() => setShowScopeSelector(false)}
                className="w-6 h-6 rounded-full glass grid place-items-center hover:bg-white/10"
              >
                <X className="w-3 h-3 text-white/70" />
              </button>
            </div>

            {/* Location scope chips */}
            <div className="flex gap-2 overflow-x-auto scroll pb-0.5">
              {LOCATION_SCOPES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScope(s);
                    setShowScopeSelector(false);
                  }}
                  className="chip whitespace-nowrap"
                  aria-pressed={scope === s}
                  style={
                    scope === s
                      ? {
                          background: SCOPE_COLORS[s],
                          color: "#fff",
                          borderColor: "transparent",
                          boxShadow: `0 4px 14px ${SCOPE_COLORS[s]}55`,
                          padding: "0.3rem 0.8rem",
                          fontSize: "0.8rem",
                        }
                      : { padding: "0.3rem 0.8rem", fontSize: "0.8rem" }
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="text-[10px] leading-tight" style={{ color: "var(--mute)" }}>
              Select a lie below that sparks your interest — it will start the conversation when you join your PartyLyiN call.
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowScopeSelector(true)}
            className="mx-4 mt-4 px-4 py-3 rounded-2xl glass flex items-center justify-between border border-white/10 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: scopeColor }} />
              <p className="font-bold text-xs">
                PartyLyiN Location: <span style={{ color: scopeColor }}>{scope}</span>
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Change</span>
          </button>
        )
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-5 pt-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-none">
              Conversation <span className="gtxt">Lies</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
              {findPartyMode
                ? "Choose a lie to kick off your PartyLyiN conversation."
                : "Tell a small lie. Start a real chat."}
            </p>
          </div>
          <button
            onClick={() => {
              const closing = showFilters;
              setShowFilters(!showFilters);
              if (closing) setSearch(""); // clear stale search when closing
            }}
            className="h-10 px-4 rounded-full glass flex items-center gap-2 shrink-0 border border-purple-500/30 shadow-lg hover:scale-105 transition-transform"
            aria-label="Toggle Filters"
          >
            {showFilters ? <X className="w-4 h-4 text-white/80" /> : <Filter className="w-4 h-4 text-purple-400" />}
            <span className="text-xs font-bold text-white/80">{showFilters ? "Close" : "Filter"}</span>
          </button>
        </div>

        {/* Collapsible Search & Filters */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-200 mt-4 mb-2 pb-2">
            {/* Search */}
            <label className="glass rounded-full px-4 py-2.5 flex items-center gap-2">
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
            <div className="mt-3 overflow-y-auto scroll max-h-48 border border-white/5 rounded-2xl p-2 glass">
              <Chips 
                opts={LIE_TAGS} 
                value={activeTag} 
                onChange={(v) => {
                  setActiveTag(v as LieTag);
                  setShowFilters(false); // auto-close when selecting a category
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Lies list ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 scroll px-4 py-3 space-y-3" style={{ paddingBottom: "5rem" }}>
        {shownLies.length === 0 && (
          <p className="text-center py-10" style={{ color: "var(--mute)" }}>
            No lies match. Post yours with the pen button.
          </p>
        )}
        {shownLies.map((lie) => (
          <div
            key={lie.id}
            onClick={() => handleChat(lie.id)}
            className="cursor-pointer transition-all rounded-[24px]"
            style={
              selectedLieId === lie.id
                ? {
                    outline: `2px solid ${scopeColor || "#a855f7"}`,
                    boxShadow: `0 0 0 4px ${(scopeColor || "#a855f7")}33`,
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

      {/* ── Sticky bottom control bar: Join Video Call & Post Lie FAB ────── */}
      <div
        className="sticky bottom-0 left-0 right-0 px-4 py-3 z-30 flex items-center gap-3"
        style={{
          background: "linear-gradient(to top, rgba(13,10,26,0.98) 80%, transparent)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(124,58,237,0.25)",
        }}
      >
        <button
          onClick={() => {
            const selectedLieText = lies.find((l) => l.id === selectedLieId)?.text;
            onJoinCall?.(selectedLieText);
          }}
          className="cta flex-1 py-3.5 rounded-full text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.02]"
          style={{
            background: selectedLieId
              ? `linear-gradient(135deg, ${scopeColor}, #7c3aed, #ec4899)`
              : "linear-gradient(135deg, #7c3aed, #ec4899, #16a34a)",
            boxShadow: "0 6px 24px rgba(124,58,237,0.5)",
          }}
        >
          <Video className="w-5 h-5 text-amber-300 fill-amber-300" />
          <span>
            {selectedLieId
              ? `Join ${scope} Call with Lie`
              : "Join Video Call"}
          </span>
        </button>

        <button
          onClick={() => setShowPostModal(true)}
          className="w-12 h-12 rounded-full grad text-white flex items-center justify-center shrink-0 shadow-lg hover:scale-105 transition-transform"
          aria-label="Post a lie"
        >
          <PenLine className="w-5 h-5" />
        </button>
      </div>

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
