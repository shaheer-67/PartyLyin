"use client";
import { useEffect, useState } from "react";
import { Flame, Wallet, MessageSquareQuote, UserRound } from "lucide-react";
import Lobby from "@/components/Lobby";
import CallRoom from "@/components/CallRoom";
import Lies from "@/components/Lies";
import WalletSheet from "@/components/WalletSheet";
type Tab = "home" | "lies" | "me" | "call";
export default function AppPage() {
  const [tab, setTab] = useState<Tab>("home"), [wallet, setWallet] = useState(45), [sheet, setSheet] = useState(false), [callMins, setCallMins] = useState(45);
  useEffect(() => { document.body.classList.add("appbody"); return () => document.body.classList.remove("appbody"); }, []);
  const nav: [Tab | "wallet", string, typeof Flame][] = [["home", "Home", Flame], ["wallet", "Wallet", Wallet], ["lies", "Lies", MessageSquareQuote], ["me", "Profile", UserRound]];
  return (
    <main className="phone">
      {tab === "home" && <Lobby wallet={wallet} onWallet={() => setSheet(true)} onFind={() => { setCallMins(wallet); setTab("call"); }} />}
      {tab === "call" && <CallRoom minutes={callMins} onReup={() => setWallet(w => w + 15)} onLeave={() => setTab("home")} />}
      {tab === "lies" && <Lies />}
      {tab === "me" && <div className="flex-1 grid place-items-center text-center"><div><div className="w-24 h-24 mx-auto rounded-full grad grid place-items-center text-4xl font-extrabold text-white">M</div><h2 className="text-2xl font-extrabold mt-4">Maya, 29</h2><p className="text-sm" style={{ color: "var(--mute)" }}>18 parties joined</p></div></div>}
      {tab !== "call" && (
        <nav className="glass mx-4 mb-4 rounded-full flex justify-around p-2">
          {nav.map(([id, label, Icon]) => (
            <button key={id} onClick={() => id === "wallet" ? setSheet(true) : setTab(id)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-full text-[11px] font-bold ${tab === id ? "grad text-white" : ""}`} style={tab === id ? undefined : { color: "var(--mute)" }}>
              <Icon className="w-[22px] h-[22px]" />{label}</button>))}
        </nav>)}
      <WalletSheet open={sheet} onClose={() => setSheet(false)} onBuy={m => setWallet(w => w + m)} />
    </main>
  );
}
