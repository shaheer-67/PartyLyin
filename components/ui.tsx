"use client";
export function Chips({ opts, value, onChange }: { opts: string[]; value: string; onChange: (v: string) => void }) {
  return (<div className="flex flex-wrap gap-2">{opts.map(o => (
    <button key={o} className="chip whitespace-nowrap" aria-pressed={o === value} onClick={() => onChange(o)}>{o}</button>))}</div>);
}
export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
