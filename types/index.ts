// ─── Domain Types ────────────────────────────────────────────────────────────

export type CallMode = "Video" | "Voice";
export type RoomType = "1-on-1" | "Group of 5" | "Group of 10";
export type Gender = "Everyone" | "Women" | "Men" | "Non-binary";
export type AgeGroup = "18–24" | "25–34" | "35–44" | "45+";
export type Location = "Local" | "National";
export type LieTag = "All" | "Sleep" | "Work" | "Food" | "Social";
export type AppTab = "home" | "lies" | "me" | "call";

export interface Lie {
  id: string;
  text: string;
  tag: Exclude<LieTag, "All">;
  n: number;
  authorId?: string;
  createdAt?: number;
}

export interface Participant {
  name: string;
  colorA: string;
  colorB: string;
}

export interface LobbyFilters {
  mode: CallMode;
  type: RoomType;
  who: Gender;
  age: AgeGroup;
  where: Location;
}

export interface WalletTier {
  minutes: number;
  price: number;
}

// ─── Firebase / Future User Types ────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  age?: number;
  photoURL?: string;
  bio?: string;
  walletMinutes: number;
  partiesJoined: number;
  verified: boolean;
  createdAt: number;
}

export interface Room {
  id: string;
  mode: CallMode;
  type: RoomType;
  participants: string[]; // uids
  status: "waiting" | "active" | "ended";
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}
