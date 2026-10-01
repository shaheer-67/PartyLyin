"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Flame, Wallet, MessageSquareQuote, UserRound, ShieldAlert } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import AuthScreen from "@/components/auth/AuthScreen";
import Lobby from "@/components/lobby/Lobby";
import CallRoom from "@/components/call/CallRoom";
import Lies from "@/components/lies/Lies";
import WalletSheet from "@/components/wallet/WalletSheet";
import ProfilePage from "@/components/profile/ProfilePage";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { AppTab } from "@/types";

// ── Bottom nav config ─────────────────────────────────────────────────────────
const NAV_ITEMS: Array<{ id: AppTab | "wallet"; label: string; Icon: typeof Flame }> = [
  { id: "home",   label: "Home",    Icon: Flame             },
  { id: "wallet", label: "Wallet",  Icon: Wallet            },
  { id: "lies",   label: "Lies",    Icon: MessageSquareQuote },
  { id: "me",     label: "Profile", Icon: UserRound         },
];

export default function AppPage() {
  const [authReady, setAuthReady]         = useState(false);
  const [uid, setUid]                     = useState<string | null>(null);
  const [walletMinutes, setWalletMinutes] = useState(0);
  const [tab, setTab]                     = useState<AppTab>("home");
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [callMinutes, setCallMinutes]     = useState(0);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [findPartyMode, setFindPartyMode] = useState(false);

  // ── Listen to Firebase Auth state ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        // Load wallet minutes from Firestore
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setWalletMinutes(snap.data().walletMinutes ?? 0);
        }
      } else {
        setUid(null);
        setWalletMinutes(0);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Apply mobile app shell styling to body
  useEffect(() => {
    document.body.classList.add("appbody");
    return () => document.body.classList.remove("appbody");
  }, []);

  /** "FIND MY PARTY" pressed in Lobby → go to Lies in discovery mode */
  function handleFindParty(roomId: string, filters: { mode: string; type: string }) {
    setCurrentRoomId(roomId);
    setCallMinutes(walletMinutes);
    setFindPartyMode(true);
    // Store mode so we can pass it to CallRoom
    (window as any).__partyCallMode = filters.mode;
    setTab("lies");
  }

  /** "Join Party Call" pressed inside Lies (findPartyMode) → enter call */
  function handleJoinCall() {
    setFindPartyMode(false);
    setTab("call");
  }

  function handleReup() {
    setWalletMinutes((m) => m + 15);
  }

  function handleBuy(minutes: number) {
    setWalletMinutes((m) => m + minutes);
  }

  function handleNavClick(id: AppTab | "wallet") {
    if (id === "wallet") {
      setWalletSheetOpen(true);
    } else {
      if (id === "lies") setFindPartyMode(false);
      setTab(id);
    }
  }

  // ── Loading splash ────────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0d0a1a 0%, #1a0d2e 50%, #0d1a0a 100%)",
      }}>
        <div className="text-4xl font-extrabold tracking-tight text-white mb-4">
          Party<span className="gtxt">LyiN</span>
        </div>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          border: "3px solid rgba(124,58,237,0.3)",
          borderTop: "3px solid #7c3aed",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not logged in → show Auth ─────────────────────────────────────────────
  if (!uid) return <AuthScreen />;

  // ── Logged in → show app ──────────────────────────────────────────────────
  return (
    <main className="phone">
      {/* ── Screens ─────────────────────────────────────────────── */}
      {tab === "home" && (
        <Lobby
          walletMinutes={walletMinutes}
          onOpenWallet={() => setWalletSheetOpen(true)}
          onFind={handleFindParty}
        />
      )}
      {tab === "call" && (
        <CallRoom
          minutes={callMinutes}
          roomId={currentRoomId ?? undefined}
          callMode={((window as any).__partyCallMode as "Video" | "Voice") || "Video"}
          onReup={handleReup}
          onLeave={() => { setCurrentRoomId(null); setTab("home"); }}
        />
      )}
      {tab === "lies" && (
        <Lies
          findPartyMode={findPartyMode}
          onJoinCall={handleJoinCall}
        />
      )}
      {tab === "me" && (
        <ProfilePage

          onSignOut={async () => {
            const { signOut } = await import("firebase/auth");
            await signOut(auth);
          }}
        />
      )}

      {/* ── Bottom navigation (hidden in call) ──────────────────── */}
      {tab !== "call" && (
        <nav className="glass mx-4 mb-4 rounded-full flex justify-around p-2" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => handleNavClick(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-full text-[11px] font-bold ${
                tab === id ? "grad text-white" : ""
              }`}
              style={tab === id ? undefined : { color: "var(--mute)" }}
              aria-label={label}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon className="w-[22px] h-[22px]" />
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* ── Wallet sheet overlay ─────────────────────────────────── */}
      <WalletSheet
        open={walletSheetOpen}
        onClose={() => setWalletSheetOpen(false)}
        onBuy={handleBuy}
      />
    </main>
  );
}
