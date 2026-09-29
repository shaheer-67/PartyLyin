"use client";
import { useState } from "react";
import { Bell, Video, Mic, Sparkles, Timer , Zap  } from "lucide-react";
import { Chips } from "@/components/ui/Chips";
import type { CallMode, RoomType, Gender, AgeGroup, Location } from "@/types";

interface LobbyProps {
  /** Current wallet balance in minutes */
  walletMinutes: number;
  /** Open the wallet purchase sheet */
  onOpenWallet: () => void;
  /** User confirmed filters and wants to find a room */
  onFind: () => void;
}

/**
 * Home / Lobby screen.
 *
 * Users set call preferences (mode, room type, gender, age, location)
 * and tap "FIND MY PARTY" to enter the matching queue.
 *
 * TODO (Phase 4): persist filter prefs to Firestore user doc.
 * TODO (Phase 4): show real online count from Firestore aggregate.
 */
export default function Lobby({ walletMinutes, onOpenWallet, onFind }: LobbyProps) {
  const [mode, setMode] = useState<CallMode>("Video");
  const [type, setType] = useState<RoomType>("Group of 5");
  const [who, setWho] = useState<Gender>("Everyone");
  const [age, setAge] = useState<AgeGroup>("25–34");
  const [where, setWhere] = useState<Location>("Local");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        {/* Profile avatar */}
        <button className="w-11 h-11 rounded-full grad text-white font-extrabold" aria-label="Profile">
          M
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

        {/* Notifications */}
        <button
          className="w-11 h-11 rounded-full glass grid place-items-center relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full grad" />
        </button>
      </header>

      {/* ── Main card ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 px-4 pb-3">
        <div className="h-full rounded-[36px] p-5 flex flex-col relative overflow-hidden glass">
          {/* Decorative glow blob */}
          <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full grad opacity-40 blur-3xl" />

          {/* Online count & tagline */}
          <p className="relative text-sm font-semibold" style={{ color: "var(--mute)" }}>
            12,480 people online near you {/* TODO: real count from Firestore */}
          </p>
          <h1 className="relative text-[2.6rem] leading-none font-extrabold tracking-tight mt-1">
            Nobody
            <br />
            parties <span className="gtxt">alone.</span>
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
          <div className="relative mt-5 space-y-4 flex-1 scroll">
            <div>
              <p className="font-bold mb-2">Who's in the room?</p>
              <Chips
                opts={["1-on-1", "Group of 5", "Group of 10"]}
                value={type}
                onChange={(v) => setType(v as RoomType)}
              />
            </div>
            <div>
              <p className="font-bold mb-2">Meet</p>
              <Chips
                opts={["Everyone", "Women", "Men", "Non-binary"]}
                value={who}
                onChange={(v) => setWho(v as Gender)}
              />
            </div>
            <div>
              <p className="font-bold mb-2">Age group</p>
              <Chips
                opts={["18–24", "25–34", "35–44", "45+"]}
                value={age}
                onChange={(v) => setAge(v as AgeGroup)}
              />
            </div>
            <div>
              <p className="font-bold mb-2">Where</p>
              <Chips
                opts={["Local", "National"]}
                value={where}
                onChange={(v) => setWhere(v as Location)}
              />
            </div>
          </div>

          {/* Find button */}
          <button
            onClick={onFind}
            className="cta relative mt-4 w-full py-4 rounded-full grad text-white text-xl font-extrabold flex items-center justify-center gap-2"
          >
            FIND MY PARTY <Zap className="w-5 h-5" />
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
