import type { WalletTier, Participant, LieTag, Lie } from "@/types";

// ─── Location Scopes for "Find My Party" discovery ────────────────────────────
export const LOCATION_SCOPES = ["Local", "City", "County", "State", "National"] as const;
export type LocationScope = typeof LOCATION_SCOPES[number];

// ─── Wallet Tiers ─────────────────────────────────────────────────────────────
export const WALLET_TIERS: WalletTier[] = [
  { minutes: 15, price: 1 },
  { minutes: 30, price: 3 },
  { minutes: 45, price: 5 },
  { minutes: 60, price: 10 },
];

// ─── Call Room Participants (placeholder until real users) ─────────────────────
export const PLACEHOLDER_PARTICIPANTS: Participant[] = [
  { name: "Ava",  colorA: "#ff7a59", colorB: "#ffb020" },
  { name: "Noah", colorA: "#7c5cff", colorB: "#ff4f9a" },
  { name: "Zara", colorA: "#00c2a8", colorB: "#3b82f6" },
  { name: "Leo",  colorA: "#f97316", colorB: "#ef4444" },
  { name: "You",  colorA: "#334155", colorB: "#0f172a" },
];

// ─── Auto-speaker turn duration (seconds) ─────────────────────────────────────
export const TURN_DURATION_SECONDS = 120;

// ─── Lie Tags ─────────────────────────────────────────────────────────────────
export const LIE_TAGS: LieTag[] = ["All", "Sleep", "Work", "Food", "Social"];

// ─── Seed Lies (shown before Firestore data loads) ────────────────────────────
export const SEED_LIES: Lie[] = [
  { id: "1", text: "I only hit snooze once.",              tag: "Sleep",  n: 128 },
  { id: "2", text: "I'm leaving in 5 minutes.",            tag: "Social", n: 96  },
  { id: "3", text: "I read the terms and conditions.",     tag: "Work",   n: 211 },
  { id: "4", text: "I never open my phone at dinner.",     tag: "Food",   n: 74  },
  { id: "5", text: "I'll reply to that email right after this.", tag: "Work", n: 157 },
  { id: "6", text: "I sleep eight hours every night.",    tag: "Sleep",  n: 302 },
];
