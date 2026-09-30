import Link from "next/link";
import { Sparkles, Globe, Zap, Timer, Mic, MessageSquareQuote, LogOut, UserPlus, LogIn, Clock, Users, Video, PartyPopper, ArrowLeftRight, ShieldOff, Clock3 } from "lucide-react";
const features = [
  { I: Timer, t: "Pay for minutes, not months", d: "Buy time when you want company. No subscription, and unused minutes stay in your wallet." },
  { I: Mic, t: "Auto-Speaker", d: "Each person gets a glowing two-minute turn. Shy people finally get a real chance to talk." },
  { I: MessageSquareQuote, t: "Conversation Lies", d: "“I only hit snooze once.” Heart a funny lie and start a chat with someone who agrees." }];
const SIX_STEPS = [
  { Icon: UserPlus, title: "Register", desc: "Create your free PartyLyiN account in seconds." },
  { Icon: LogIn, title: "Login", desc: "Sign in and pick up right where you left off." },
  { Icon: Clock, title: "Add Time or Use Time", desc: "Top up your wallet — 15, 30, 45 or 60 minutes. Unused minutes never expire." },
  { Icon: Users, title: "Select Your Group Chat", desc: "Individual One on One, Group of 5, or Group of 10 — you choose the vibe." },
  { Icon: Video, title: "Choose Video or Mic", desc: "Go full video or keep it voice-only — whatever feels right." },
  { Icon: PartyPopper, title: "Start PartyLyiN", desc: "We match you in seconds. Everyone gets their two-minute turn. Let the party begin!" },
];
const SAFETY_FEATURES = [
  { Icon: ArrowLeftRight, label: "Switch Group", color: "#9b1fad" },
  { Icon: ShieldOff, label: "Block Em\'", color: "#e91e8c" },
  { Icon: LogOut, label: "I'm Out!", color: "#1db954" },
  { Icon: Clock3, label: "ReUp Time", color: "#ffb020" },
];
const tiers = [[15, "1.00"], [30, "3.00"], [45, "5.00"], [60, "10.00"]] as const;
export default function Home() {
  return (
    <>
      <header
        className="sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: "rgba(13,10,26,0.85)", borderBottom: "1px solid rgba(124,58,237,0.20)" }}
      >
        <div className="wrap flex items-center justify-between py-3.5">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">
            Party<span className="gtxt">LyiN</span>
          </Link>
          <nav className="hidden md:flex gap-7 font-semibold text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#safety" className="hover:text-white transition-colors">Safety</a>
          </nav>
          <Link href="/app" className="px-4 py-2 rounded-full font-bold text-sm text-white grad flex items-center gap-1.5" style={{ boxShadow: "0 4px 14px rgba(124,58,237,0.45)" }}>
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Register
          </Link>
        </div>
      </header>
      {/* ── HERO SECTION — fills full viewport ──────────────────────── */}
      <section
        style={{
          minHeight: "calc(100svh - 56px)",
          background: "linear-gradient(135deg, #471d1d 0%, #000000 30%, #578353 70%, #000000 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Ambient blobs */}
        <div style={{ position: "absolute", top: "-100px", left: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(109,40,217,0.35)", filter: "blur(90px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-60px", width: "380px", height: "380px", borderRadius: "50%", background: "rgba(219,39,119,0.28)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "45%", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(22,163,74,0.12)", filter: "blur(70px)", pointerEvents: "none" }} />

        {/* Full-width wrapper — zIndex above blobs */}
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <div className="wrap py-14 md:py-20" style={{ maxWidth: "1240px" }}>

            {/* ── 2-column grid: 50% text | 50% video ─────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", alignItems: "center" }}>

              {/* LEFT — text */}
              <div style={{ minWidth: 0 }}>

                {/* Heading — sized to fit nicely beside video */}
                <h1
                  className="font-extrabold tracking-tight leading-[1]"
                  style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", textShadow: "0 4px 24px rgba(0,0,0,0.30)" }}
                >
                  Ɪt starts with{" "}
                  <span style={{
                    background: "linear-gradient(90deg,#86efac,#22c55e)",
                    WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                  }}>
                    PartyLyiN.
                  </span>
                </h1>

                {/* Description */}
                <p style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.65, marginTop: "1.25rem", fontSize: "1rem", maxWidth: "34rem" }}>
                  PartyLyiN is a monetized social communication platform between individuals and
                  groups using video or phone to connect, be social, be lying and be chatting for fun.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.75rem" }}>
                  <Link href="/app" className="btn grad text-white cta text-base flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-black-300 fill-purple-300" />
                    <span>Go PartyLyiN</span>
                  </Link>
                  <a href="#how" className="btn" style={{ background: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(8px)" }}>
                    See how it works
                  </a>
                </div>
              </div>

              {/* RIGHT — video placeholder */}
              <div style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "14px",
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(24px)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "0.85rem",
                boxShadow: "0 24px 60px rgba(0,0,0,0.60), inset 0 0 0 1px rgba(255,255,255,0.10)",
              }}>
                {/* Play button */}
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg,#16a34a,#86efac)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 28px rgba(22,163,74,0.55)", cursor: "pointer",
                  transition: "transform 0.2s",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.02em" }}>
                  Watch how PartyLyiN works
                </p>
              </div>

            </div>
          </div>
        </div>

      </section>
      {/* ── FEATURES SECTION ─────────────────────────────────────── */}
      <section id="features" className="wrap py-16">
        {/* Section label */}
        <p className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--mute)" }}>
          Features
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight mt-2">
          With Video Group Chats on PartyLyiN starts with selecting an{" "}
          <span className="gtxt">Interesting Lie</span> to get the conversation started!
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {features.map(({ I, t, d }) => (
            <article key={t} className="glass rounded-[32px] p-6">
              <div className="w-14 h-14 rounded-2xl grad grid place-items-center text-white"><I /></div>
              <h3 className="text-2xl font-extrabold mt-4">{t}</h3>
              <p className="mt-2" style={{ color: "var(--mute)" }}>{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS — SIX STEPS ─────────────────────────────── */}
      <section id="how" style={{ background: "var(--alt)" }}>
        <div className="wrap py-16">

          {/* Section label */}
          <p className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--mute)" }}>
            How it works
          </p>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
            Six Steps To A <span className="gtxt">PartyLyiN</span>
          </h2>

          {/* 6-step grid: 3 columns × 2 rows */}
          <ol className="grid md:grid-cols-3 gap-5 mt-10">
            {SIX_STEPS.map(({ Icon, title, desc }, i) => (
              <li
                key={title}
                className="glass rounded-[32px] p-6 flex flex-col gap-3"
                style={{ position: "relative", overflow: "hidden" }}
              >
                {/* Step number watermark */}
                <span
                  className="font-extrabold"
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "16px",
                    fontSize: "5rem",
                    lineHeight: 1,
                    opacity: 0.07,
                    userSelect: "none",
                    color: "var(--ink)",
                  }}
                >
                  {i + 1}
                </span>

                {/* Icon badge */}
                <div
                  className="w-12 h-12 rounded-2xl grad grid place-items-center text-white shrink-0"
                  style={{ boxShadow: "0 6px 18px rgba(155,31,173,0.35)" }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Step number + title */}
                <div>
                  <span
                    className="text-xs font-extrabold tracking-widest uppercase"
                    style={{ color: "var(--mute)" }}
                  >
                    Step {i + 1}
                  </span>
                  <h3 className="text-xl font-extrabold mt-0.5 leading-snug">{title}</h3>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: "var(--mute)" }}>
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section id="pricing" className="wrap py-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Simple prices.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">{tiers.map(([m, p]) => (
          <div key={m} className={`rounded-[28px] p-5 relative ${m === 60 ? "grad text-white" : "glass"}`}>
            {m === 60 && <span className="absolute -top-3 right-4 bg-white text-rose-600 text-xs font-extrabold rounded-full px-3 py-1 shadow">Best value</span>}
            <p className="text-4xl font-extrabold">{m}<span className="text-base"> mins</span></p><p className={`font-bold mt-1 ${m === 60 ? "" : "gtxt"}`}>${p}</p></div>))}</div>
      </section>
      {/* ── SAFETY / ACTIONS SECTION ────────────────────────────── */}
      <section id="safety" style={{ background: "var(--alt)" }}>
        <div className="wrap py-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Switch Group, I&apos;m Out, Block Em&apos;, ReUp Time
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {SAFETY_FEATURES.map(({ Icon, label, color }) => (
              <div key={label} className="glass rounded-3xl p-6 flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl grid place-items-center"
                  style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <p className="font-extrabold text-lg">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap py-20 text-center">
        <Link href="/app" className="btn grad text-white cta text-lg">Get PartyLyiN</Link>
      </section>
      <footer style={{ borderTop: "1px solid var(--line)" }}><div className="wrap py-8 flex flex-wrap gap-4 justify-between text-sm" style={{ color: "var(--mute)" }}>
        <span className="font-extrabold text-lg" style={{ color: "var(--ink)" }}>Party<span className="gtxt">LyiN</span></span><span>© 2026 PartyLyiN</span></div></footer>
    </>
  );
}
