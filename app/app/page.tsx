"use client";
import { useEffect, useState } from "react";
import { Flame, Wallet, MessageSquareQuote, UserRound } from "lucide-react";
import Lobby from "@/components/lobby/Lobby";
import CallRoom from "@/components/call/CallRoom";
import Lies from "@/components/lies/Lies";
import WalletSheet from "@/components/wallet/WalletSheet";
import ProfilePage from "@/components/profile/ProfilePage";
import type { AppTab } from "@/types";

// ── Bottom nav config ─────────────────────────────────────────────────────────
const NAV_ITEMS: Array<{ id: AppTab | "wallet"; label: string; Icon: typeof Flame }> = [
  { id: "home",   label: "Home",    Icon: Flame             },
  { id: "wallet", label: "Wallet",  Icon: Wallet            },
  { id: "lies",   label: "Lies",    Icon: MessageSquareQuote },
  { id: "me",     label: "Profile", Icon: UserRound         },
];

/**
 * Root screen for the /app route.
 *
 * Flow for "Find My Party":
 *   Lobby → Lies (findPartyMode=true, location filter) → CallRoom
 *
 * Normal "Lies" tab → Lies (standard feed, no findPartyMode)
 *
 * TODO (Phase 4): replace useState wallet with useWallet hook (Firestore-backed).
 * TODO (Phase 4): replace tab state with Next.js router for deep-linking.
 */
export default function AppPage() {
  const [tab, setTab] = useState<AppTab>("home");
  const [walletMinutes, setWalletMinutes] = useState(45);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [callMinutes, setCallMinutes] = useState(45);

  /**
   * findPartyMode — true when user arrives at Lies from "FIND MY PARTY".
   * False when user navigates via the bottom-nav Lies tab directly.
   */
  const [findPartyMode, setFindPartyMode] = useState(false);

  // Apply mobile app shell styling to body
  useEffect(() => {
    document.body.classList.add("appbody");
    return () => document.body.classList.remove("appbody");
  }, []);

  /** "FIND MY PARTY" pressed in Lobby → go to Lies in discovery mode */
  function handleFindParty() {
    setCallMinutes(walletMinutes);
    setFindPartyMode(true);
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
      // Direct nav always clears findPartyMode
      if (id === "lies") setFindPartyMode(false);
      setTab(id);
    }
  }

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
          onReup={handleReup}
          onLeave={() => setTab("home")}
        />
      )}
      {tab === "lies" && (
        <Lies
          findPartyMode={findPartyMode}
          onJoinCall={handleJoinCall}
        />
      )}
      {tab === "me" && <ProfilePage onSignOut={() => {/* TODO: Firebase sign-out */}} />}

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
