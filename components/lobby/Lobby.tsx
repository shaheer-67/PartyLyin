"use client";
import { useState, useEffect } from "react";
import { Video, Mic, Timer, Zap, AlertCircle, Hash } from "lucide-react";
import { Chips } from "@/components/ui/Chips";
import { findOrCreateRoom } from "@/lib/matchmaking";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { CallMode, RoomType, Gender, AgeGroup, Location } from "@/types";



interface LobbyProps {
  /** Current wallet balance in minutes */
  walletMinutes: number;
  /** Open the wallet purchase sheet */
  onOpenWallet: () => void;
  /** User confirmed filters — passes back the matched roomId */
  onFind: (roomId: string, filters: { mode: CallMode; type: RoomType }) => void;
}

export default function Lobby({ walletMinutes, onOpenWallet, onFind }: LobbyProps) {
  const [mode, setMode] = useState<CallMode>("Video");
  const [type, setType] = useState<RoomType>("Group of 5");
  const [who, setWho] = useState<Gender>("Mixed Group");
  const [age, setAge] = useState<AgeGroup>("Any Age");
  const [where, setWhere] = useState<Location>("National");
  const [topic, setTopic] = useState("");
  const [finding, setFinding] = useState(false);
  const [error, setError] = useState("");

  const [userProfile, setUserProfile] = useState<{ username?: string; photoURL?: string } | null>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        setUserProfile({
          username: snap.data().username,
          photoURL: snap.data().photoURL,
        });
      }
    });
    return () => unsub();
  }, []);

  const uid = auth.currentUser?.uid;
  const initial = userProfile?.username
    ? userProfile.username[0].toUpperCase()
    : uid ? (uid[0]?.toUpperCase() ?? "?") : "?";

  async function handleFind() {
    setError("");
    if (walletMinutes <= 0) {
      onOpenWallet();
      return;
    }
    setFinding(true);
    try {
      const roomId = await findOrCreateRoom({
        mode,
        type,
        gender: who,
        ageGroup: age,
        location: where,
        topic: topic.trim() || "General Chit-Chat",
      });
      onFind(roomId, { mode, type });
    } catch (e) {
      console.error("Matchmaking error:", e);
      setError("Could not find a room. Please try again.");
    } finally {
      setFinding(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        {/* Profile avatar */}
        <button className="w-11 h-11 rounded-full grad text-white font-extrabold flex items-center justify-center overflow-hidden border border-white/20 shadow-sm" aria-label="Profile">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </button>

        {/* Wallet balance */}
        <button
          onClick={onOpenWallet}
          className="glass rounded-full px-4 py-2 flex items-center gap-2 font-extrabold"
          style={{ boxShadow: "0 0 22px rgba(255,176,32,.5)" }}
          aria-label={`Wallet: ${walletMinutes} minutes`}
        >
          <Timer className="w-4 h-4 text-amber-500" />
          {walletMinutes} mins
        </button>


      </header>

      {/* ── Main card ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 px-4 pb-3">
        <div className="h-full rounded-[36px] p-5 flex flex-col relative overflow-hidden glass">
          {/* Decorative glow blob */}
          <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full grad opacity-40 blur-3xl" />

          {/* Tagline */}
          <h1 className="relative text-[2.6rem] leading-none font-extrabold tracking-tight mt-1">
            Let's Start
            <br />
            <span className="gtxt">PartyLyiN</span>
          </h1>

          {/* Mode toggle: Video / Voice */}
          <div className="relative mt-5 flex p-1 rounded-full glass">
            {([["Video", Video], ["Voice", Mic]] as const).map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => setMode(label as CallMode)}
                className={`flex-1 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 ${
                  mode === label ? "grad text-white" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Filter chips */}
          <div className="relative mt-4 space-y-4 flex-1 scroll">
            {/* ── Create A PartyLyiN Topic (Pure Hashtag style) ──────── */}
            <div className="p-4 rounded-3xl glass border border-purple-500/40 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-lg flex items-center gap-2 text-white">
                  <Hash className="w-5 h-5 text-purple-400" />
                  Create A PartyLyiN Topic
                </p>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30 uppercase tracking-wider">
                  #Hashtags
                </span>
              </div>

              {/* Topic Input Field */}
              <div className="relative flex items-center">
                <span className="absolute left-3 text-purple-400 font-extrabold text-sm">#</span>
                <input
                  type="text"
                  value={topic.startsWith("#") ? topic.slice(1) : topic}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTopic(val ? (val.startsWith("#") ? val : `#${val}`) : "");
                  }}
                  placeholder="Enter hashtag topic (e.g. #SpillASecret)..."
                  className="w-full pl-7 pr-3 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold outline-none focus:border-purple-500 placeholder:text-white/40"
                />
              </div>

              {/* Hashtag Presets Bar */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/40 uppercase">Popular Hashtags:</p>
                <div className="flex gap-1.5 overflow-x-auto scroll pb-1">
                  {[
                    "#Sex", "#Religion", "#Politics", "#Love", "#Family", "#Sports", "#Money", "#Relationship", "#Entertainment", "#Technology", "#Porn", "#Work", "#Food", "#Music", "#Government", "#Education", "#Death", "#Taxes", "#Hate", "#War"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopic(preset)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border whitespace-nowrap transition-all ${
                        topic === preset
                          ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30 scale-105"
                          : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold mb-2">Who&apos;s in the room?</p>
              <div className="flex flex-wrap gap-2">
                {([
                  { label: "1-on-1", color: "#3b82f6" },
                  { label: "Group of 5", color: "#a855f7" },
                  { label: "Group of 10", color: "#f97316" }
                ] as const).map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setType(opt.label as RoomType)}
                    className="chip whitespace-nowrap"
                    aria-pressed={type === opt.label}
                    style={type === opt.label ? { background: opt.color, color: "#fff", borderColor: "transparent", boxShadow: `0 4px 14px ${opt.color}55` } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold mb-2 text-sm uppercase tracking-wider" style={{ color: "var(--mute)" }}>Meet</p>
              <Chips
                opts={["Mixed Group", "All Females", "All Males", "All TransMales", "All TransFemales"]}
                value={who}
                onChange={(v) => setWho(v as Gender)}
              />
            </div>
            <div>
              <p className="font-bold mb-2 text-sm uppercase tracking-wider" style={{ color: "var(--mute)" }}>Age group</p>
              <Chips
                opts={["Any Age", "18 to 24 Young Adults", "25 to 30 Adults", "31 to 50 Grown Folks", "51 to 65 Seniors", "66 to 85 Elderly", "86+"]}
                value={age}
                onChange={(v) => setAge(v as AgeGroup)}
              />
            </div>
            <div>
              <p className="font-bold mb-2 text-sm uppercase tracking-wider" style={{ color: "var(--mute)" }}>Where</p>
              <Chips
                opts={["Zip Code", "City", "County", "State", "National"]}
                value={where}
                onChange={(v) => setWhere(v as Location)}
              />
            </div>
          </div>

          {/* No minutes warning */}
          {walletMinutes <= 0 && (
            <div className="relative flex items-center gap-2 mt-3 px-3 py-2 rounded-2xl text-sm font-semibold"
              style={{ background: "rgba(233,30,140,0.15)", border: "1px solid rgba(233,30,140,0.3)", color: "#e91e8c" }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              No minutes left — tap to buy time first!
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="relative text-center text-xs mt-2 text-rose-400 font-semibold">{error}</p>
          )}

          {/* Find button */}
          <button
            onClick={handleFind}
            disabled={finding}
            className="cta relative mt-4 w-full py-4 rounded-full grad text-white text-xl font-extrabold flex items-center justify-center gap-2"
            style={{ opacity: finding ? 0.75 : 1 }}
          >
            {finding ? (
              <>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", animation: "spin 0.7s linear infinite" }} />
                Finding PartyLyiN...
              </>
            ) : (
              <>FIND MY PartyLyiN <Zap className="w-5 h-5" /></>
            )}
          </button>

          {/* Selected filters summary */}
          <p className="relative text-center text-xs mt-2" style={{ color: "var(--mute)" }}>
            {mode} · {type} · {age} · {where}
          </p>
        </div>
      </div>


    </div>
  );
}
