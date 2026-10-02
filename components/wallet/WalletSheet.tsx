"use client";
import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { TierCard } from "./TierCard";
import { WALLET_TIERS } from "@/lib/constants";

interface WalletSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called with the number of minutes the user purchased */
  onBuy: (minutes: number) => void;
}

/**
 * Bottom-sheet overlay for purchasing call minutes.
 * Writes purchased minutes directly to Firestore user doc.
 * NOTE: In production, replace handleBuy with a Stripe payment flow
 *       that calls a Cloud Function to verify payment before writing Firestore.
 */
export default function WalletSheet({ open, onClose, onBuy }: WalletSheetProps) {
  const [selectedIndex, setSelectedIndex] = useState(3); // default: best-value tier
  const [autoReup, setAutoReup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const selected = WALLET_TIERS[selectedIndex];

  async function handleBuy() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierIndex: selectedIndex, uid }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment initialization failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Wallet purchase redirect failed:", e);
      alert("Failed to connect to payment provider.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-end bg-black/55"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full rounded-t-[32px] p-5" style={{ background: "var(--bg)" }}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Buy <span className="gtxt">Time</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
              Minutes never expire — they're saved to your wallet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full glass grid place-items-center"
            aria-label="Close wallet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {WALLET_TIERS.map((tier, i) => (
            <TierCard
              key={tier.minutes}
              tier={tier}
              index={i}
              isSelected={selectedIndex === i}
              onSelect={() => setSelectedIndex(i)}
            />
          ))}
        </div>

        {/* Auto-ReUp toggle */}
        <div className="glass rounded-3xl p-4 mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold">Auto-ReUp</p>
            <p className="text-xs" style={{ color: "var(--mute)" }}>
              Auto-add 15 mins when your call balance runs low
            </p>
          </div>
          <button
            role="switch"
            aria-checked={autoReup}
            onClick={() => setAutoReup((a) => !a)}
            className={`w-14 h-8 rounded-full relative shrink-0 transition-all ${autoReup ? "grad" : "bg-neutral-400/50"}`}
            aria-label="Toggle Auto-ReUp"
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${autoReup ? "right-1" : "right-7"}`}
            />
          </button>
        </div>

        {/* Confirm and Cancel buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading || success}
            className="w-1/3 py-4 rounded-full glass text-white text-lg font-extrabold flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ opacity: loading ? 0.75 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={loading || success}
            className="cta w-2/3 py-4 rounded-full grad text-white text-lg font-extrabold flex items-center justify-center gap-2"
            style={{ opacity: loading ? 0.75 : 1 }}
          >
            {loading ? (
              "Redirecting to Stripe..."
            ) : (
              `Get ${selected.minutes} Mins · $${selected.price}.00`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
