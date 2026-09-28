import Link from "next/link";
import { Sparkles, Timer, Mic, MessageSquareQuote, BadgeCheck, Flag, LogOut } from "lucide-react";
const features = [
  { I: Timer, t: "Pay for minutes, not months", d: "Buy time when you want company. No subscription, and unused minutes stay in your wallet." },
  { I: Mic, t: "Auto-Speaker", d: "Each person gets a glowing two-minute turn. Shy people finally get a real chance to talk." },
  { I: MessageSquareQuote, t: "Conversation Lies", d: "“I only hit snooze once.” Heart a funny lie and start a chat with someone who agrees." }];
const steps = [["Add time", "Pick 15, 30, 45 or 60 minutes."], ["Choose your room", "Video or voice, 1-on-1 or groups of 5 or 10, filtered by age, gender and location."], ["Find my party", "We match you in seconds. Top up with ReUp if the vibe is good."]];
const tiers = [[15, "1.00"], [30, "3.00"], [45, "5.00"], [60, "10.00"]] as const;
const safety = [[BadgeCheck, "Verified profiles"], [Flag, "Report in a tap"], [LogOut, "Leave anytime"]] as const;
export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 backdrop-blur-lg" style={{ background: "color-mix(in srgb,var(--bg) 80%,transparent)" }}>
        <div className="wrap flex items-center justify-between py-3">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">Party<span className="gtxt">LyiN</span></Link>
          <nav className="hidden md:flex gap-7 font-semibold text-sm" style={{ color: "var(--mute)" }}><a href="#how">How it works</a><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#safety">Safety</a></nav>
          <Link href="/app" className="px-4 py-2 rounded-full font-bold text-sm text-white grad">Get the app</Link>
        </div>
      </header>
      <section className="grad" style={{ color: "#1d1b1a" }}>
        <div className="wrap py-16 md:py-24">
          <p className="font-bold mb-3">Live video and voice, with real people, right now</p>
          <h1 className="text-6xl md:text-8xl font-extrabold leading-[.95] tracking-tight max-w-3xl">It starts with a call.</h1>
          <p className="text-lg mt-5 max-w-md font-medium">Buy a few minutes, join a small group, and talk. Everyone gets two minutes to speak, so nobody gets talked over.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/app" className="btn cta" style={{ background: "#1d1b1a", color: "#fff" }}><Sparkles className="w-5 h-5" />Find my party</Link>
            <a href="#how" className="btn" style={{ background: "rgba(255,255,255,.35)" }}>See how it works</a>
          </div>
        </div>
      </section>
      <section id="features" className="wrap py-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-xl leading-tight">Group chats were never meant to feel this quiet.</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-8">{features.map(({ I, t, d }) => (
          <article key={t} className="glass rounded-[32px] p-6"><div className="w-14 h-14 rounded-2xl grad grid place-items-center text-white"><I /></div><h3 className="text-2xl font-extrabold mt-4">{t}</h3><p className="mt-2" style={{ color: "var(--mute)" }}>{d}</p></article>))}</div>
      </section>
      <section id="how" style={{ background: "var(--alt)" }}><div className="wrap py-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Three taps to a room full of people.</h2>
        <ol className="grid md:grid-cols-3 gap-4 mt-8">{steps.map(([t, d], i) => (
          <li key={t} className="glass rounded-[32px] p-6"><span className="gtxt text-6xl font-extrabold">{i + 1}</span><h3 className="text-xl font-extrabold mt-2">{t}</h3><p className="mt-1" style={{ color: "var(--mute)" }}>{d}</p></li>))}</ol>
      </div></section>
      <section id="pricing" className="wrap py-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Simple prices.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">{tiers.map(([m, p]) => (
          <div key={m} className={`rounded-[28px] p-5 relative ${m === 60 ? "grad text-white" : "glass"}`}>
            {m === 60 && <span className="absolute -top-3 right-4 bg-white text-rose-600 text-xs font-extrabold rounded-full px-3 py-1 shadow">Best value</span>}
            <p className="text-4xl font-extrabold">{m}<span className="text-base"> mins</span></p><p className={`font-bold mt-1 ${m === 60 ? "" : "gtxt"}`}>${p}</p></div>))}</div>
      </section>
      <section id="safety" style={{ background: "var(--alt)" }}><div className="wrap py-16 grid md:grid-cols-2 gap-8 items-center">
        <div><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">Talk with more confidence.</h2><p className="mt-4 text-lg" style={{ color: "var(--mute)" }}>Photo verification, one-tap report and block, and a Leave button that is always in reach.</p></div>
        <div className="grid grid-cols-3 gap-3 text-center">{safety.map(([Icon, t]) => (
          <div key={t} className="glass rounded-3xl p-4"><Icon className="mx-auto text-rose-500" /><p className="font-bold text-sm mt-2">{t}</p></div>))}</div>
      </div></section>
      <section className="wrap py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none">You&apos;ve read enough.<br /><span className="gtxt">Go find your party.</span></h2>
        <Link href="/app" className="btn grad text-white cta mt-8 text-lg">Get PartyLyiN</Link>
      </section>
      <footer style={{ borderTop: "1px solid var(--line)" }}><div className="wrap py-8 flex flex-wrap gap-4 justify-between text-sm" style={{ color: "var(--mute)" }}>
        <span className="font-extrabold text-lg" style={{ color: "var(--ink)" }}>Party<span className="gtxt">LyiN</span></span><span>© 2026 PartyLyiN</span></div></footer>
    </>
  );
}
