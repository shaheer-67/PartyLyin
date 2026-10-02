import {
  collection, query, where, orderBy, limit,
  getDocs, addDoc, updateDoc, doc, getDoc, onSnapshot,
  serverTimestamp, arrayUnion, arrayRemove, increment,
  QueryConstraint
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { RoomType, Gender, AgeGroup, Location } from "@/types";

export interface MatchFilters {
  mode: "Video" | "Voice";
  type: RoomType;
  gender: Gender;
  ageGroup: AgeGroup;
  location: Location;
  topic?: string;
}

/** Max participants per room type */
const ROOM_CAPACITY: Record<RoomType, number> = {
  "1-on-1":     2,
  "Group of 5":  5,
  "Group of 10": 10,
};

/**
 * Find an existing waiting room matching the filters,
 * or create a new one. Returns the room ID.
 */
export async function findOrCreateRoom(filters: MatchFilters): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");

  // Fetch current user's geo-location profile
  const userDoc = await getDoc(doc(db, "users", uid));
  const userProfile = userDoc.data();
  const userCountry = userProfile?.country || "United States";
  const userState   = userProfile?.state   || "Unknown";
  const userCity    = userProfile?.city    || "Unknown";
  const userZipCode = userProfile?.zipCode || "Unknown";

  const capacity = ROOM_CAPACITY[filters.type];

  // 1. Search for a waiting room with matching mode and type
  // To avoid needing complex composite indexes for every filter combination,
  // we fetch all waiting rooms for this mode/type and filter in memory.
  const q = query(
    collection(db, "rooms"),
    where("status", "==", "waiting"),
    where("mode", "==", filters.mode),
    where("type", "==", filters.type),
    limit(50)
  );
  
  try {
    const snap = await getDocs(q);

    // Find a room that has space and matches our filters
    for (const roomDoc of snap.docs) {
      const data = roomDoc.data();
      const participants: string[] = data.participants ?? [];

      // Don't re-join a room you're already in
      if (participants.includes(uid)) continue;

      // Check if room has space
      if (participants.length >= capacity) continue;

      // Check location match
      if (filters.location !== "National") {
        if (filters.location === "City" && data.city !== userCity) continue;
        if (filters.location === "State" && data.state !== userState) continue;
        if (filters.location === "Zip Code" && data.zipCode !== userZipCode) continue;
      } else {
        // National -> match country
        if (data.country !== userCountry) continue;
      }

      // Check gender match (if not Mixed Group)
      if (filters.gender !== "Mixed Group" && data.gender !== filters.gender) continue;
      
      // Check age group match (if not Any Age)
      if (filters.ageGroup !== "Any Age" && data.ageGroup !== filters.ageGroup) continue;

      // Room matches all criteria!
      const isNowActive = participants.length + 1 >= capacity;
      await updateDoc(doc(db, "rooms", roomDoc.id), {
        participants: arrayUnion(uid),
        status: isNowActive ? "active" : "waiting",
        ...(isNowActive ? { startedAt: Date.now(), skipOffset: 0 } : {})
      });
      return roomDoc.id;
    }
  } catch (err) {
    console.warn("Matchmaking search error, creating room instead:", err);
  }

  // 2. No suitable room found (or query failed) — create a new one
  const newRoom = await addDoc(collection(db, "rooms"), {
    mode:          filters.mode,
    type:          filters.type,
    gender:        filters.gender,
    ageGroup:      filters.ageGroup,
    location:      filters.location,
    country:       userCountry,
    state:         userState,
    city:          userCity,
    zipCode:       userZipCode,
    topic:         filters.topic || "General Chit-Chat",
    capacity,
    participants:  [uid],
    status:        "waiting",
    speakerIndex:  0,
    speakerStartedAt: serverTimestamp(),
    createdAt:     serverTimestamp(),
  });

  return newRoom.id;
}

/**
 * Leave a room — removes uid from participants.
 * If room becomes empty, marks it as ended.
 * Returns remaining minutes to save.
 */
export async function leaveRoom(
  roomId: string,
  spentMinutes: number
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const roomRef = doc(db, "rooms", roomId);
  const userRef = doc(db, "users", uid);

  await updateDoc(roomRef, {
    participants: arrayRemove(uid),
    status: "ended",
  });

  // Subtract spent minutes from wallet
  if (spentMinutes > 0) {
    await updateDoc(userRef, {
      walletMinutes: increment(-spentMinutes),
      partiesJoined: increment(1),
    });
  }
}

/**
 * Subscribe to a room document in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToRoom(
  roomId: string,
  onChange: (data: Record<string, unknown>) => void
): () => void {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    if (snap.exists()) onChange(snap.data() as Record<string, unknown>);
  });
}
