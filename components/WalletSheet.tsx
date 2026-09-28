"use client";
import { useState } from "react";
import { X } from "lucide-react";
const TIERS = [{ m: 15, p: 1 }, { m: 30, p: 3 }, { m: 45, p: 5 }, { m: 60, p: 10 }];
export default function WalletSheet({ open, onClose, onBuy }: { open: boolean; onClose: () => void; onBuy: (m: number) => void }) {
  const [pick, setPick] = useState(3), [auto, setAuto] = useState(true);
  if (!open) return null;
  const t = TIERS[pick];
  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/55" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full rounded-t-[32px] p-5" style={{ background: "var(--bg)" }}>
        <div className="flex justify-between items-start">
          <div><h2 className="text-3xl font-extrabold tracking-tight">Buy <span className="gtxt">Time</span></h2><p className="text-sm mt-1" style={{ color: "var(--mute)" }}>Minutes never expire.</p></div>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass grid place-items-center" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          {TIERS.map((x, i) => (
            <button key={x.m} onClick={() => setPick(i)} className={`glass rounded-3xl p-4 text-left relative ${i === 3 ? "col-span-2 grad !text-white" : ""} ${pick === i ? "outline outline-[2.5px] outline-rose-500" : ""}`}>
              {i === 3 && <span className="absolute -top-2.5 right-4 bg-white text-rose-600 text-[11px] font-extrabold rounded-full px-3 py-1 shadow">Best value</span>}
              <p className="text-4xl font-extrabold leading-none">{x.m}<span className="text-base font-semibold ml-1">mins</span></p>
              <p className={`font-bold mt-2 ${i === 3 ? "" : "gtxt"}`}>${x.p}.00</p>
            </button>))}
        </div>
        <div className="glass rounded-3xl p-4 mt-4 flex items-center justify-between gap-3">
          <div><p className="font-bold">Auto-ReUp</p><p className="text-xs" style={{ color: "var(--mute)" }}>Add 15 mins when a call is about to end</p></div>
          <button role="switch" aria-checked={auto} onClick={() => setAuto(!auto)} className={`w-14 h-8 rounded-full relative shrink-0 ${auto ? "grad" : "bg-neutral-400/50"}`}>
            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${auto ? "right-1" : "right-7"}`} /></button>
        </div>
        <button onClick={() => { onBuy(t.m); onClose(); }} className="cta w-full mt-4 py-4 rounded-full grad text-white text-lg font-extrabold">Get {t.m} Mins · ${t.p}.00</button>
      </div>
    </div>
  );
}
