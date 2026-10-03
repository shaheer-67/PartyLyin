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
import type { AppTab, CallMode } from "@/types";
import { leaveRoom, quickJoinAnyRoom, findOrCreateRoom, DEFAULT_TOPIC, type MatchFilters } from "@/lib/matchmaking";

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
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [findPartyMode, setFindPartyMode] = useState(false);
  /** Filters (incl. hashtag topic) chosen in the Lobby, while the user is picking a lie */
  const [pendingFilters, setPendingFilters] = useState<MatchFilters | null>(null);
  const [callMode, setCallMode]             = useState<CallMode>("Video");
  const [joining, setJoining]               = useState(false);

  const [toastMessage, setToastMessage]   = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }

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
                showToast(`${data.minutes} mins added to your wallet! 🎉`);
              }
            } catch (err) {
              console.error("Payment verification failed", err);
            }
          } else if (payment === "cancelled") {
            window.history.replaceState(null, "", "/app");
            showToast("Payment was cancelled.");
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

  /** Room joined in Lobby but call not started yet → leave it quietly (no minutes charged) */
  async function abandonPendingRoom() {
    const rid = currentRoomId;
    setCurrentRoomId(null);
    setPendingFilters(null);
    setFindPartyMode(false);
    if (rid) {
      try { await leaveRoom(rid, 0); } catch (e) { console.warn("abandonPendingRoom", e); }
    }
  }

  /** "FIND MY PARTY" pressed in Lobby → go to Lies, carrying the chosen topic */
  function handleFindParty(roomId: string, filters: MatchFilters) {
    setCurrentRoomId(roomId);
    setPendingFilters(filters);
    setCallMode(filters.mode);
    setFindPartyMode(true);
    setTab("lies");
  }

  /**
   * "Join Video Call" pressed inside Lies.
   *  - Lie selected  → move the user into the room for THAT lie (join existing or create).
   *  - No lie, came from Lobby → enter the room already found for the Lobby topic.
   *  - No lie, direct → join ANY available room.
   */
  async function handleJoinCall(lieText?: string) {
    if (joining) return;
    if (walletMinutes <= 0) {
      setWalletSheetOpen(true);
      showToast("Buy minutes to join a PartyLyiN call");
      return;
    }

    setJoining(true);
    try {
      const mode: CallMode = pendingFilters?.mode ?? "Video";
      let roomId = currentRoomId;

      if (lieText) {
        const sameAsPending = !!roomId && pendingFilters?.topic === lieText;
        if (!sameAsPending) {
          if (roomId) {
            try { await leaveRoom(roomId, 0); } catch {}
            roomId = null;
          }
          roomId = pendingFilters
            ? await findOrCreateRoom({ ...pendingFilters, topic: lieText })
            : await quickJoinAnyRoom(mode, lieText);
        }
      } else if (!roomId) {
        roomId = await quickJoinAnyRoom(mode);
      }

      setCurrentRoomId(roomId);
      setCallMode(mode);
      setFindPartyMode(false);
      setTab("call");
    } catch (e) {
      console.error("Join call error", e);
      showToast("Could not join a room. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  function handleLeaveCall() {
    setCurrentRoomId(null);
    setPendingFilters(null);
    setFindPartyMode(false);
    setTab("home");
  }

  function handleReup() {
    setWalletSheetOpen(true);
  }

  function handleBuy(minutes: number) {
    showToast(`${minutes} mins added to your wallet! 🎉`);
  }

  function handleNavClick(id: AppTab | "wallet") {
    if (id === "wallet") {
      setWalletSheetOpen(true);
      return;
    }
    // Leaving the Lies screen mid-matchmaking → free the room we reserved
    if (id !== "lies" && findPartyMode && currentRoomId) {
      abandonPendingRoom();
    }
    setTab(id);
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
    <main className="phone relative">
      {/* ── Auto-dismissing 2-second Toast Popup ──────────────────── */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full glass border border-purple-500/40 bg-purple-950/80 text-white font-extrabold text-xs shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

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
          minutes={walletMinutes}
          roomId={currentRoomId ?? undefined}
          callMode={callMode}
          onReup={handleReup}
          onLeave={handleLeaveCall}
        />
      )}
      {tab === "lies" && (
        <Lies
          findPartyMode={findPartyMode}
          presetTopic={
            findPartyMode && pendingFilters?.topic && pendingFilters.topic !== DEFAULT_TOPIC
              ? pendingFilters.topic
              : undefined
          }
          joining={joining}
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
