"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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
    let unsubSnapshot: (() => void) | null = null;
    
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        
        // Listen to wallet minutes from Firestore in real-time
        unsubSnapshot = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (snap.exists()) {
            setWalletMinutes(snap.data().walletMinutes ?? 0);
          }
        });

        // Check Stripe redirect
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const payment = params.get("payment");
          const sessionId = params.get("session_id");
          
          if (payment === "success" && sessionId) {
            // Remove the URL parameters so it doesn't trigger again on refresh
            window.history.replaceState(null, "", "/app");
            
            try {
              const res = await fetch("/api/verify-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
              });
              const data = await res.json();
              
              if (data.success && data.uid === user.uid && data.minutes > 0) {
                // Apply minutes to Firestore
                const { updateDoc, increment } = await import("firebase/firestore");
                await updateDoc(doc(db, "users", user.uid), {
                  walletMinutes: increment(data.minutes)
                });
                // Local state is auto-updated by onSnapshot
                alert(`Payment successful! Added ${data.minutes} minutes to your wallet.`);
              }
            } catch (err) {
              console.error("Payment verification failed", err);
            }
          } else if (payment === "cancelled") {
            window.history.replaceState(null, "", "/app");
            alert("Payment was cancelled.");
          }
        }
      } else {
        setUid(null);
        setWalletMinutes(0);
        if (unsubSnapshot) unsubSnapshot();
      }
      setAuthReady(true);
    });
    
    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
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

  /** "Join Party Call" pressed inside Lies → enter call */
  async function handleJoinCall(topic?: string) {
    if (!currentRoomId) {
      try {
        const { quickJoinAnyRoom } = await import("@/lib/matchmaking");
        const matchedRoomId = await quickJoinAnyRoom("Video", topic);
        setCurrentRoomId(matchedRoomId);
      } catch (e) {
        console.error("Quick join error", e);
        setCurrentRoomId(`room-party-${Date.now()}`);
      }
    }
    if (callMinutes <= 0) {
      setCallMinutes(walletMinutes > 0 ? walletMinutes : 15);
    }
    setFindPartyMode(false);
    setTab("call");
  }

  function handleReup() {
    setWalletSheetOpen(true);
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
