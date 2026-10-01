"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Globe, Zap, Eye, EyeOff, ArrowLeft } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Screen = "login" | "register" | "forgot";

const LANGUAGES = [
  "English", "Spanish", "French", "Portuguese", "Arabic",
  "Hindi", "Urdu", "Mandarin", "Japanese", "Korean",
  "German", "Italian", "Russian", "Swahili", "Other",
];

const GENDERS = ["Male", "Female", "TransMale", "TransFemale", "NonBinary"] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── AuthScreen ───────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(135deg, #0d0a1a 0%, #1a0d2e 50%, #0d1a0a 100%)",
        minHeight: "100dvh",
      }}
    >
      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "-80px", left: "-60px", width: "340px", height: "340px", borderRadius: "50%", background: "rgba(109,40,217,0.25)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-60px", right: "-40px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(219,39,119,0.20)", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "440px" }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/60">The UN declared Loneliness a Global Epidemic</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Party<span className="gtxt">LyiN</span>
          </h1>
          <p className="text-sm mt-1 text-white/50">Monetized social video &amp; voice calls</p>
        </div>

        {/* Card */}
        <div className="glass rounded-[28px] p-7" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
          {screen === "login"    && <LoginForm    onSwitch={setScreen} />}
          {screen === "register" && <RegisterForm onSwitch={setScreen} />}
          {screen === "forgot"   && <ForgotForm   onSwitch={setScreen} />}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LOGIN FORM
// ────────────────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: (s: Screen) => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Incorrect email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-5">
      <h2 className="text-2xl font-extrabold text-white">Welcome back 👋</h2>

      <Field label="Email Address">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. hello@example.com" className="auth-input"
          autoComplete="email" required
        />
      </Field>

      <Field label="Password">
        <div className="relative">
          <input
            type={showPw ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password" className="auth-input pr-12" required
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}

      <button type="submit" disabled={loading}
        className="btn grad text-white cta w-full justify-center text-base mt-1"
        style={{ opacity: loading ? 0.7 : 1 }}>
        <Zap className="w-4 h-4" />
        {loading ? "Signing in..." : "Login"}
      </button>

      <div className="flex justify-between text-sm text-white/50 mt-1">
        <button type="button" onClick={() => onSwitch("forgot")}
          className="hover:text-white transition-colors">
          Forgot password?
        </button>
        <button type="button" onClick={() => onSwitch("register")}
          className="hover:text-white transition-colors font-bold text-purple-400">
          Register →
        </button>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// REGISTER FORM
// ────────────────────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: (s: Screen) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [zipCode, setZipCode]   = useState("");
  const [dob, setDob]           = useState("");
  const [language, setLanguage] = useState("English");
  const [gender, setGender]     = useState<typeof GENDERS[number]>("Male");
  const [race, setRace]         = useState("Prefer not to say");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!email.trim())    { setError("Email is required."); return; }
    if (!zipCode.trim())  { setError("Zip code is required."); return; }
    if (!dob)             { setError("Date of birth is required."); return; }
    setStep(2);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6)    { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)    { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      let geo = { country: "United States", state: "Unknown", city: "Unknown" };
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_name) {
          geo = { country: data.country_name, state: data.region, city: data.city };
        }
      } catch (e) {
        console.warn("Geo fetch failed", e);
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid:          cred.user.uid,
        username:     username.trim(),
        email:        email.trim(),
        zipCode:      zipCode.trim(),
        country:      geo.country,
        state:        geo.state,
        city:         geo.city,
        dob,
        language,
        gender,
        race,
        role:         "user",
        walletMinutes: 1000,
        partiesJoined: 0,
        createdAt:     serverTimestamp(),
      });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered. Try logging in.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {step === 2 && (
          <button type="button" onClick={() => setStep(1)} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-2xl font-extrabold text-white">
          {step === 1 ? "Create account" : "Almost done!"}
        </h2>
        <span className="ml-auto text-xs font-bold text-white/40">Step {step} / 2</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full grad transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>

      {step === 1 ? (
        <form onSubmit={nextStep} className="flex flex-col gap-4">
          <Field label="Username">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. coolvibes99" className="auth-input" required />
          </Field>
          <Field label="Email Address">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. hello@example.com" className="auth-input" required />
          </Field>
          <Field label="Zip Code">
            <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g. 90001" className="auth-input" maxLength={10} required />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
              className="auth-input" required />
          </Field>

          {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}

          <button type="submit"
            className="btn grad text-white w-full justify-center text-base mt-1">
            Continue →
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Field label="Primary Spoken Language">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="auth-input">
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>

          <Field label="Gender">
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button key={g} type="button"
                  onClick={() => setGender(g)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                    gender === g
                      ? "grad text-white border-transparent"
                      : "border-white/20 text-white/60 hover:border-white/40"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Race / Ethnicity">
            <select value={race} onChange={(e) => setRace(e.target.value)} className="auth-input">
              {[
                "Asian",
                "Black / African American",
                "Hispanic / Latino",
                "White / Caucasian",
                "Native American",
                "Mixed / Multiracial",
                "Prefer not to say",
              ].map((r) => (
                <option key={r} value={r} className="bg-[#191724]">
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Password">
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters" className="auth-input pr-12" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password">
            <input type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" className="auth-input" required />
          </Field>

          {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}

          <button type="submit" disabled={loading}
            className="btn grad text-white cta w-full justify-center text-base mt-1"
            style={{ opacity: loading ? 0.7 : 1 }}>
            <Zap className="w-4 h-4" />
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-white/50">
        Already have an account?{" "}
        <button onClick={() => onSwitch("login")} className="text-purple-400 font-bold hover:text-purple-300">
          Login
        </button>
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD FORM
// ────────────────────────────────────────────────────────────────────────────
function ForgotForm({ onSwitch }: { onSwitch: (s: Screen) => void }) {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Enter your email address."); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("user-not-found")) {
        setError("This email is not registered with us.");
      } else {
        setError(msg || "Could not send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onSwitch("login")} className="text-white/50 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
      </div>

      {sent ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-white font-bold text-lg">Reset link sent!</p>
          <p className="text-white/50 text-sm mt-1">Check your inbox for the reset link.</p>
          <button onClick={() => onSwitch("login")}
            className="btn grad text-white mt-6 w-full justify-center">
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <p className="text-white/60 text-sm">Enter your registered email address and we&apos;ll send a reset link.</p>
          <Field label="Email Address">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. hello@example.com" className="auth-input" required />
          </Field>
          {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}
          <button type="submit" disabled={loading}
            className="btn grad text-white w-full justify-center"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Field wrapper
// ────────────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-white/50">{label}</label>
      {children}
    </div>
  );
}
