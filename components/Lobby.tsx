"use client";
import { useState } from "react";
import { Bell, Video, Mic, Sparkles, Timer } from "lucide-react";
import { Chips } from "./ui";
export default function Lobby({ wallet, onWallet, onFind }: { wallet: number; onWallet: () => void; onFind: () => void }) {
  const [mode, setMode] = useState("Video"), [type, setType] = useState("Group of 5"), [who, setWho] = useState("Everyone"), [age, setAge] = useState("25–34"), [where, setWhere] = useState("Local");
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <button className="w-11 h-11 rounded-full grad text-white font-extrabold" aria-label="Profile">M</button>
        <button onClick={onWallet} className="glass rounded-full px-4 py-2 flex items-center gap-2 font-extrabold" style={{ boxShadow: "0 0 22px rgba(255,176,32,.5)" }}>
          <Timer className="w-4 h-4 text-amber-500" />{wallet} mins</button>
        <button className="w-11 h-11 rounded-full glass grid place-items-center relative" aria-label="Notifications"><Bell className="w-5 h-5" /><span className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full grad" /></button>
      </header>
      <div className="flex-1 min-h-0 px-4 pb-3">
        <div className="h-full rounded-[36px] p-5 flex flex-col relative overflow-hidden glass">
          <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full grad opacity-40 blur-3xl" />
          <p className="relative text-sm font-semibold" style={{ color: "var(--mute)" }}>12,480 people online near you</p>
          <h1 className="relative text-[2.6rem] leading-none font-extrabold tracking-tight mt-1">Nobody<br />parties <span className="gtxt">alone.</span></h1>
          <div className="relative mt-5 flex p-1 rounded-full glass">
            {[["Video", Video], ["Voice", Mic]].map(([n, I]) => { const Icon = I as typeof Video; return (
              <button key={n as string} onClick={() => setMode(n as string)} className={`flex-1 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 ${mode === n ? "grad text-white" : ""}`}><Icon className="w-4 h-4" />{n as string}</button>); })}
          </div>
          <div className="relative mt-5 space-y-4 flex-1 scroll">
            <div><p className="font-bold mb-2">Who's in the room?</p><Chips opts={["1-on-1", "Group of 5", "Group of 10"]} value={type} onChange={setType} /></div>
            <div><p className="font-bold mb-2">Meet</p><Chips opts={["Everyone", "Women", "Men", "Non-binary"]} value={who} onChange={setWho} /></div>
            <div><p className="font-bold mb-2">Age group</p><Chips opts={["18–24", "25–34", "35–44", "45+"]} value={age} onChange={setAge} /></div>
            <div><p className="font-bold mb-2">Where</p><Chips opts={["Local", "National"]} value={where} onChange={setWhere} /></div>
          </div>
          <button onClick={onFind} className="cta relative mt-4 w-full py-4 rounded-full grad text-white text-xl font-extrabold flex items-center justify-center gap-2">FIND MY PARTY <Sparkles className="w-5 h-5" /></button>
          <p className="relative text-center text-xs mt-2" style={{ color: "var(--mute)" }}>{mode} · {type} · {age} · {where}</p>
        </div>
      </div>
    </div>
  );
}
