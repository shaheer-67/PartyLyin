"use client";
import { useState } from "react";
import { Search, Heart, MessageCircle, PenLine } from "lucide-react";
import { Chips } from "./ui";
type Lie = { text: string; tag: string; n: number };
const SEED: Lie[] = [
  { text: "I only hit snooze once.", tag: "Sleep", n: 128 }, { text: "I'm leaving in 5 minutes.", tag: "Social", n: 96 },
  { text: "I read the terms and conditions.", tag: "Work", n: 211 }, { text: "I never open my phone at dinner.", tag: "Food", n: 74 },
  { text: "I'll reply to that email right after this.", tag: "Work", n: 157 }, { text: "I sleep eight hours every night.", tag: "Sleep", n: 302 }];
export default function Lies() {
  const [lies, setLies] = useState<Lie[]>(SEED), [q, setQ] = useState(""), [tag, setTag] = useState("All"), [liked, setLiked] = useState<Set<string>>(new Set()), [chat, setChat] = useState<Set<string>>(new Set());
  const toggle = (s: Set<string>, k: string) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; };
  const shown = lies.filter(l => l.text.toLowerCase().includes(q.toLowerCase()) && (tag === "All" || l.tag === tag));
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <div className="px-5 pt-5">
        <h2 className="text-4xl font-extrabold tracking-tight leading-none">Conversation <span className="gtxt">Lies</span></h2>
        <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>Tell a small lie. Start a real chat.</p>
        <label className="glass rounded-full mt-3 px-4 py-2.5 flex items-center gap-2"><Search className="w-4 h-4" style={{ color: "var(--mute)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search lies" className="bg-transparent flex-1 outline-none text-sm" /></label>
        <div className="mt-3 overflow-x-auto scroll pb-1"><Chips opts={["All", "Sleep", "Work", "Food", "Social"]} value={tag} onChange={setTag} /></div>
      </div>
      <div className="flex-1 min-h-0 scroll px-4 py-3 space-y-3">
        {shown.length === 0 && <p className="text-center py-10" style={{ color: "var(--mute)" }}>No lies match. Post yours with the pen button.</p>}
        {shown.map(l => (
          <article key={l.text} className="glass rounded-3xl p-5">
            <p className="text-xs font-bold" style={{ color: "var(--mute)" }}>{l.tag}</p>
            <p className="text-2xl font-extrabold leading-tight mt-1">“{l.text}”</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm" style={{ color: "var(--mute)" }}>{l.n + (liked.has(l.text) ? 1 : 0)} liars agree</span>
              <div className="flex gap-2">
                <button onClick={() => setLiked(toggle(liked, l.text))} aria-label="Like" className={`w-11 h-11 rounded-full glass grid place-items-center ${liked.has(l.text) ? "grad !text-white" : ""}`}><Heart className="w-5 h-5" /></button>
                <button onClick={() => setChat(toggle(chat, l.text))} className="h-11 px-4 rounded-full grad text-white font-bold text-sm flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{chat.has(l.text) ? "Chat opened ✓" : "Start chat"}</button>
              </div>
            </div>
          </article>))}
      </div>
      <button onClick={() => { const t = prompt("Your lie (keep it funny):"); if (t) setLies([{ text: t, tag: "Social", n: 0 }, ...lies]); }} className="absolute right-5 bottom-4 w-14 h-14 rounded-full grad text-white grid place-items-center shadow-xl" aria-label="Post a lie"><PenLine className="w-6 h-6" /></button>
    </div>
  );
}
