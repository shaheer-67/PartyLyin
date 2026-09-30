"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { ShieldAlert, Lock, Eye, EyeOff, KeyRound, LogOut } from "lucide-react";

export default function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const sessionAdmin = sessionStorage.getItem("partylyin_admin_session");
    if (sessionAdmin === "true") {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Direct master credentials check
    if (
      (cleanUsername === "admin@partylyin.com" || cleanUsername === "admin") &&
      cleanPassword === "admin123456"
    ) {
      sessionStorage.setItem("partylyin_admin_session", "true");
      setIsAdminAuthenticated(true);
      setLoading(false);
      return;
    }

    // 2. Fallback to Firebase Auth admin check
    try {
      const email = cleanUsername.includes("@")
        ? cleanUsername
        : `${cleanUsername}@partylyin.com`;
      const cred = await signInWithEmailAndPassword(auth, email, cleanPassword);
      
      const userSnap = await getDoc(doc(db, "users", cred.user.uid));
      if (userSnap.exists() && userSnap.data().role === "admin") {
        sessionStorage.setItem("partylyin_admin_session", "true");
        setIsAdminAuthenticated(true);
      } else {
        setError("Access denied. This account does not have Admin privileges.");
        await signOut(auth);
      }
    } catch {
      setError("Invalid admin credentials. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    sessionStorage.removeItem("partylyin_admin_session");
    setIsAdminAuthenticated(false);
    try {
      await signOut(auth);
    } catch {}
  };

  const fillDemoAdmin = () => {
    setUsername("admin@partylyin.com");
    setPassword("admin123456");
  };

  // If Admin is Authenticated, show full Admin Dashboard
  if (isAdminAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0b0a12] text-white flex flex-col">
        {/* Top Admin Bar */}
        <header className="px-6 py-3 bg-[#12111d] border-b border-purple-500/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="font-extrabold text-lg tracking-tight">
              Party<span className="gtxt">LyiN</span> <span className="text-xs text-purple-400 font-mono ml-2">/admin</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Admin Session Active
            </span>
            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-full glass hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout Admin
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 flex flex-col min-h-0">
          <AdminDashboard />
        </div>
      </main>
    );
  }

  // Admin Login Screen
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #090714 0%, #150926 50%, #07140b 100%)",
        minHeight: "100dvh",
      }}
    >
      {/* Glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-emerald-600/15 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Restricted Admin Portal
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Party<span className="gtxt">LyiN</span> <span className="text-purple-400 text-2xl">Admin</span>
          </h1>
          <p className="text-xs text-white/50">
            Authorized personnel only. Access Stripe payments & demographic tracking.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-7 border border-purple-500/30 shadow-2xl space-y-5">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Admin Email / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@partylyin.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-purple-500 pr-12 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl grad font-extrabold text-white text-base shadow-xl flex items-center justify-center gap-2 cta disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-5 h-5" /> Login to Admin Portal
                </>
              )}
            </button>
          </form>

          {/* Preset Fill Demo Button */}
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-white/40">Demo Admin Credentials:</span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-purple-400 font-bold hover:underline flex items-center gap-1"
            >
              Fill Credentials ✨
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-white/30 font-mono">
          URL: localhost:3000/admin · Encrypted TLS 1.3
        </p>
      </div>
    </main>
  );
}
