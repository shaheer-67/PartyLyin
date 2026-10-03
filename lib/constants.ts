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
  { name: "milly", colorA: "#00c2a8", colorB: "#3b82f6" },
  { name: "Leo",  colorA: "#f97316", colorB: "#ef4444" },
  { name: "You",  colorA: "#334155", colorB: "#0f172a" },
];

// ─── Auto-speaker turn duration (seconds) ─────────────────────────────────────
export const TURN_DURATION_SECONDS = 120;

// ─── Lie Tags ─────────────────────────────────────────────────────────────────
export const LIE_TAGS: LieTag[] = ["All", "Sex", "Religion", "Politics", "Love", "Family", "Sports", "Money", "Relationship", "Entertainment", "Technology", "Porn", "Work", "Food", "Music", "Government", "Education", "Death", "Taxes", "Hate", "War"];

// ─── Seed Lies (always shown as fallback for new users) ───────────────────────
export const SEED_LIES: Lie[] = [
  // Entertainment
  { id: "seed-1",  text: "I never watch reality TV.",                        tag: "Entertainment",  n: 128 },
  { id: "seed-2",  text: "I've seen every episode of that show they cancelled.", tag: "Entertainment", n: 64 },
  // Relationship
  { id: "seed-3",  text: "I'm leaving in 5 minutes.",                        tag: "Relationship",   n: 96  },
  { id: "seed-4",  text: "I'm totally over my ex.",                           tag: "Relationship",   n: 83  },
  // Technology
  { id: "seed-5",  text: "I read the terms and conditions.",                  tag: "Technology",     n: 211 },
  { id: "seed-6",  text: "I only check my phone twice a day.",                tag: "Technology",     n: 145 },
  // Food
  { id: "seed-7",  text: "I never open my phone at dinner.",                  tag: "Food",           n: 74  },
  { id: "seed-8",  text: "I eat salad because I love salad.",                 tag: "Food",           n: 91  },
  // Work
  { id: "seed-9",  text: "I'll reply to that email right after this.",        tag: "Work",           n: 157 },
  { id: "seed-10", text: "I never procrastinate.",                            tag: "Work",           n: 203 },
  // Politics
  { id: "seed-11", text: "I don't care about politics.",                      tag: "Politics",       n: 302 },
  { id: "seed-12", text: "I always vote.",                                    tag: "Politics",       n: 187 },
  // Sports
  { id: "seed-13", text: "I was totally watching that game live.",            tag: "Sports",         n: 119 },
  { id: "seed-14", text: "I exercise every morning without fail.",            tag: "Sports",         n: 241 },
  // Love
  { id: "seed-15", text: "I wasn't jealous at all.",                          tag: "Love",           n: 88  },
  { id: "seed-16", text: "I'm not looking for anything serious.",             tag: "Love",           n: 176 },
  // Money
  { id: "seed-17", text: "I'm really good with my budget.",                   tag: "Money",          n: 134 },
  { id: "seed-18", text: "I'll just have one drink — it's cheaper that way.", tag: "Money",          n: 99  },
  // Family
  { id: "seed-19", text: "I call my parents every week.",                     tag: "Family",         n: 112 },
  { id: "seed-20", text: "The holidays are my favorite time of year.",        tag: "Family",         n: 78  },
  // Sex
  { id: "seed-21", text: "I have never lied about that.",                     tag: "Sex",            n: 267 },
  { id: "seed-22", text: "I'm perfectly comfortable talking about it.",       tag: "Sex",            n: 190 },
  // Music
  { id: "seed-23", text: "I knew that artist before they were famous.",       tag: "Music",          n: 153 },
  { id: "seed-24", text: "I listen to all kinds of music.",                   tag: "Music",          n: 107 },
  // Education
  { id: "seed-25", text: "I studied for this test.",                          tag: "Education",      n: 231 },
  { id: "seed-26", text: "I read the whole textbook.",                        tag: "Education",      n: 189 },
  // Government
  { id: "seed-27", text: "I trust the government on this one.",               tag: "Government",     n: 298 },
  // Religion
  { id: "seed-28", text: "I've read most of the holy book.",                  tag: "Religion",       n: 144 },
];

