// ─── Domain Types ────────────────────────────────────────────────────────────

export type CallMode = "Video" | "Voice";
export type RoomType = "1-on-1" | "Group of 5" | "Group of 10";
export type Gender = "Mixed Group" | "All Females" | "All Males" | "All TransMales" | "All TransFemales";
export type AgeGroup = "Any Age" | "18 to 24 Young Adults" | "25 to 30 Adults" | "31 to 50 Grown Folks" | "51 to 65 Seniors" | "66 to 85 Elderly" | "86+";
export type Location = "Zip Code" | "City" | "County" | "State" | "National";
export type LieTag = "All" | "Sleep" | "Work" | "Food" | "Social";
export type AppTab = "home" | "lies" | "wallet" | "me" | "call";
export type Race = "Asian" | "Black / African American" | "Hispanic / Latino" | "White / Caucasian" | "Native American" | "Mixed / Multiracial" | "Prefer not to say";

export interface Lie {
  id: string;
  text: string;
  tag: Exclude<LieTag, "All">;
  n: number;
  likedBy?: string[];
  authorId?: string;
  createdAt?: number;
}

export interface Participant {
  uid?: string;
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
  race?: Race;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  role?: "admin" | "user";
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
