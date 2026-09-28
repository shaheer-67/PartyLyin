"use client";
import { useEffect, useState } from "react";
import { Timer, Plus, Mic, MicOff, Video, VideoOff, MessageCircle, PhoneOff } from "lucide-react";
import { fmt } from "./ui";
const PEOPLE = [["Ava", "#ff7a59", "#ffb020"], ["Noah", "#7c5cff", "#ff4f9a"], ["Zara", "#00c2a8", "#3b82f6"], ["Leo", "#f97316", "#ef4444"], ["You", "#334155", "#0f172a"]] as const;
export default function CallRoom({ minutes, onReup, onLeave }: { minutes: number; onReup: () => void; onLeave: () => void }) {
  const [tick, setTick] = useState(0), [bonus, setBonus] = useState(0), [muted, setMuted] = useState(false), [cam, setCam] = useState(true);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(t); }, []);
  const speaker = Math.floor(tick / 120) % 5, turnLeft = 120 - (tick % 120), left = Math.max(0, minutes * 60 + bonus - tick);
  const ctl = "w-12 h-12 rounded-full grid place-items-center bg-white/15";
  return (
    <div className="flex flex-col flex-1 min-h-0 relative text-white" style={{ background: "#101114" }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="rounded-full px-4 py-2 flex items-center gap-2 font-extrabold text-lg bg-white/10 border border-white/10"><Timer className="w-5 h-5 text-amber-400" />{fmt(left)}</div>
        <button onClick={() => { setBonus(b => b + 900); onReup(); }} className="grad rounded-full px-4 py-2 font-extrabold text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" />ReUp +15 Mins</button>
      </div>
      <p className="px-4 pb-1 text-xs text-white/60">Group of 5 · Video · 2 min each, auto-speaker</p>
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 p-4 pb-28" style={{ gridTemplateRows: "repeat(3,1fr)" }}>
        {PEOPLE.map(([name, a, b], i) => (
          <div key={name} className={`tile ${i === 4 ? "col-span-2" : ""} ${i === speaker ? "speak" : ""}`} style={{ background: `linear-gradient(160deg,${a}66,${b}bb 60%,#15161a)` }}>
            <div className="absolute inset-0 grid place-items-center"><div className="w-16 h-16 rounded-full bg-white/20 grid place-items-center text-2xl font-extrabold">{name[0]}</div></div>
            <span className="absolute left-3 bottom-3 bg-black/40 rounded-full px-3 py-1 text-xs font-bold">{name}</span>
            {i === speaker && <span className="absolute top-3 right-3 grad rounded-full px-3 py-1 text-xs font-extrabold flex items-center gap-1"><Mic className="w-3 h-3" />{fmt(turnLeft).slice(1)}</span>}
            {i === (speaker + 1) % 5 && <span className="absolute top-3 left-3 bg-black/40 rounded-full px-2.5 py-1 text-[11px] font-bold">Next</span>}
          </div>))}
      </div>
      <div className="absolute left-4 right-4 bottom-5 rounded-full p-2.5 flex items-center justify-around backdrop-blur-xl border border-white/15" style={{ background: "rgba(255,255,255,.14)" }}>
        <button className={`${ctl} ${muted ? "!bg-rose-600" : ""}`} onClick={() => setMuted(!muted)} aria-label="Mute">{muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
        <button className={`${ctl} ${!cam ? "!bg-rose-600" : ""}`} onClick={() => setCam(!cam)} aria-label="Camera">{cam ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}</button>
        <button className={`${ctl} relative`} aria-label="Chat"><MessageCircle className="w-5 h-5" /><span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-[11px] font-bold grid place-items-center">3</span></button>
        <button onClick={onLeave} className="h-12 px-5 rounded-full bg-rose-600 font-extrabold flex items-center gap-2"><PhoneOff className="w-5 h-5" />Leave</button>
      </div>
    </div>
  );
}
