"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Timer, Plus, MessageCircle, ShieldOff, LogOut, ArrowLeftRight } from "lucide-react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { formatTime } from "@/lib/utils";
import { TURN_DURATION_SECONDS } from "@/lib/constants";
import { leaveRoom, subscribeToRoom } from "@/lib/matchmaking";
import { auth, db } from "@/lib/firebase";
import type { Participant } from "@/types";

interface CallRoomProps {
  minutes: number;
  roomId?: string;
  callMode?: "Video" | "Voice";
  onReup: () => void;
  onLeave: () => void;
}

const CTL = "flex flex-col items-center gap-1";
const ICON_BTN = "w-12 h-12 rounded-full grid place-items-center transition-all";

export default function CallRoom({ minutes, roomId, callMode = "Video", onReup, onLeave }: CallRoomProps) {
  const localUid = auth.currentUser?.uid || "local-test-uid";
  const [activeTick, setActiveTick] = useState(0);
  const [bonusSeconds, setBonusSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [skipOffset, setSkipOffset] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const [realParticipants, setRealParticipants] = useState<Participant[]>([]);
  const [roomStatus, setRoomStatus] = useState<"waiting" | "active" | "ended">("waiting");
  const [roomTopic, setRoomTopic] = useState<string>("General Chit-Chat");
  const [zegoReady, setZegoReady] = useState(false);
  const leavingRef = useRef(false);

  // Zego UIKit ref
  const zpRef = useRef<any>(null);
  const zegoContainerRef = useRef<HTMLDivElement>(null);
  const initCalledRef = useRef(false);

  // Ref to hold handleLeave to avoid stale closures in Zego callbacks
  const handleLeaveRef = useRef<() => void>();

  // ── ZegoCloud UIKit Prebuilt Integration ─────────────────────────────────
  useEffect(() => {
    if (!roomId || initCalledRef.current) return;
    initCalledRef.current = true;

    const initZegoUIKit = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

        const appID = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET || "";

        if (!appID || !serverSecret) {
          console.error("ZegoCloud AppID or ServerSecret missing!");
          return;
        }

        // Get user display name from Firestore
        let userName = "User";
        try {
          const userDoc = await getDoc(doc(db, "users", localUid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userName = data.username || data.displayName || "User";
          } else if (auth.currentUser?.displayName) {
            userName = auth.currentUser.displayName;
          }
        } catch (e) {
          console.warn("Could not fetch user profile for Zego", e);
          userName = auth.currentUser?.displayName || "User";
        }

        // Generate Kit Token for testing (uses serverSecret directly)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          localUid,
          userName
        );

        // Create Zego instance
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // Wait a bit for the container to be in the DOM
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!zegoContainerRef.current) {
          console.error("Zego container ref not found");
          return;
        }

        const isVideoCall = callMode === "Video";

        // Join the room with prebuilt UI
        zp.joinRoom({
          container: zegoContainerRef.current,
          scenario: {
            mode: isVideoCall
              ? ZegoUIKitPrebuilt.GroupCall
              : ZegoUIKitPrebuilt.GroupCall,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: isVideoCall,
          showMyCameraToggleButton: isVideoCall,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false,
          showTextChat: false,
          showUserList: false,
          showLayoutButton: false,
          showRoomDetailsButton: false,
          showLeavingView: false,
          showLeaveRoomConfirmDialog: true,
          showPreJoinView: false,
          maxUsers: 10,
          layout: "Auto",
          showNonVideoUser: true,
          showOnlyAudioUser: true,
          videoResolutionDefault: ZegoUIKitPrebuilt.VideoResolution_360P,
          onLeaveRoom: () => {
            handleLeaveRef.current?.();
          },
          onUserJoin: (users: any[]) => {
            console.log("Users joined:", users.map((u: any) => u.userName));
          },
          onUserLeave: (users: any[]) => {
            console.log("Users left:", users.map((u: any) => u.userName));
          },
        });

        setZegoReady(true);
        console.log("✅ ZegoCloud UIKit Prebuilt initialized successfully!");
      } catch (e) {
        console.error("ZegoCloud UIKit init failed:", e);
      }
    };

    initZegoUIKit();

    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying Zego instance", e);
        }
        zpRef.current = null;
      }
      initCalledRef.current = false;
    };
  }, [roomId, localUid, callMode]);

  // ── Local active timer & Global clock ────────────────────────────────
  useEffect(() => {
    const activeTimer = setInterval(() => {
      if (roomStatus === "active") setActiveTick((x) => x + 1);
    }, 1000);
    return () => clearInterval(activeTimer);
  }, [roomStatus]);

  useEffect(() => {
    const globalTimer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(globalTimer);
  }, []);

  // ── Subscribe to Firestore room in real-time ─────────────────────────
  const fetchParticipantProfiles = useCallback(async (uids: string[]) => {
    const GRADIENT_COLORS = [
      { colorA: "#ff7a59", colorB: "#ffb020" },
      { colorA: "#7c5cff", colorB: "#ff4f9a" },
      { colorA: "#00c2a8", colorB: "#3b82f6" },
      { colorA: "#f97316", colorB: "#ef4444" },
      { colorA: "#a855f7", colorB: "#ec4899" },
      { colorA: "#06b6d4", colorB: "#8b5cf6" },
      { colorA: "#10b981", colorB: "#3b82f6" },
      { colorA: "#f43f5e", colorB: "#f97316" },
      { colorA: "#eab308", colorB: "#ef4444" },
      { colorA: "#334155", colorB: "#0f172a" },
    ];
    const profiles: Participant[] = [];
    for (let i = 0; i < uids.length; i++) {
      const uid = uids[i];
      const colors = GRADIENT_COLORS[i % GRADIENT_COLORS.length];
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          profiles.push({
            uid,
            name: uid === localUid ? "You" : (data.username || data.displayName || "User"),
            colorA: colors.colorA,
            colorB: colors.colorB,
          });
        } else {
          profiles.push({ uid, name: uid === localUid ? "You" : "User", ...colors });
        }
      } catch {
        profiles.push({ uid, name: uid === localUid ? "You" : "User", ...colors });
      }
    }
    setRealParticipants(profiles);
  }, [localUid]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, (data) => {
      const parts = (data.participants as string[]) ?? [];
      setRoomStatus(data.status as "waiting" | "active" | "ended");
      if (data.topic) setRoomTopic(data.topic as string);
      if (data.startedAt) setStartedAt(data.startedAt as number);
      if (data.skipOffset !== undefined) setSkipOffset(data.skipOffset as number);
      fetchParticipantProfiles(parts);
    });
    return () => unsub();
  }, [roomId, fetchParticipantProfiles]);

  const totalSeconds = minutes * 60 + bonusSeconds;
  const secondsLeft = Math.max(0, totalSeconds - activeTick);

  // Auto-leave when time is up
  useEffect(() => {
    if (activeTick > 0 && secondsLeft <= 0) {
      alert("⏳ Time's up! Your minutes have run out. Please buy more to keep PartyLyiN.");
      handleLeaveRef.current?.();
    }
  }, [secondsLeft, activeTick]);

  const displayParticipants = realParticipants.length > 0
    ? realParticipants
    : [{ uid: localUid, name: "You", colorA: "#334155", colorB: "#0f172a" }];

  const effectiveActiveSeconds = startedAt && roomStatus === "active" 
    ? Math.floor((now - startedAt) / 1000) + skipOffset 
    : 0;
  
  const totalIntroSeconds = displayParticipants.length * TURN_DURATION_SECONDS;
  const isPhase2 = effectiveActiveSeconds >= totalIntroSeconds;

  const speakerIndex = isPhase2 ? -1 : Math.floor(effectiveActiveSeconds / TURN_DURATION_SECONDS) % displayParticipants.length;
  const activeSpeaker = isPhase2 ? null : displayParticipants[speakerIndex];
  const isMyTurn = activeSpeaker?.uid === localUid;
  
  const turnSecondsLeft = TURN_DURATION_SECONDS - (effectiveActiveSeconds % TURN_DURATION_SECONDS);

  async function handleDoneTurn() {
    if (!roomId || !isMyTurn || isPhase2) return;
    const remaining = turnSecondsLeft;
    await updateDoc(doc(db, "rooms", roomId), {
      skipOffset: increment(remaining)
    });
  }

  async function handleLeave() {
    if (leavingRef.current) return;
    leavingRef.current = true;
    const spentMins = Math.ceil(activeTick / 60);

    // Destroy Zego first
    if (zpRef.current) {
      try {
        zpRef.current.destroy();
      } catch (e) {
        console.warn("Error destroying Zego on leave", e);
      }
      zpRef.current = null;
    }

    if (roomId) {
      try { await leaveRoom(roomId, spentMins); } catch {}
    }
    onLeave();
  }

  function handleReup() {
    onReup();
  }

  handleLeaveRef.current = handleLeave;

  return (
    <div className="flex flex-col flex-1 min-h-0 relative text-white" style={{ background: "#101114" }}>

      {/* ══ TOP BAR — always visible ════════════════════════════════ */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0" style={{ zIndex: 20 }}>
        {/* Top bar layout showing remaining minutes */}
        <div className="rounded-full px-4 py-2 flex items-center gap-2 font-extrabold text-sm bg-white/10 border border-white/10">
          <Timer className="w-4 h-4 text-amber-400" />
          {formatTime(secondsLeft)}
        </div>

        {/* Room info badge */}
        <span className="text-xs text-white/50 font-medium">
          {roomStatus === "waiting" ? "⏳ Waiting for others..." : `${displayParticipants.length} in room`}
        </span>

        {/* ReUp button */}
        <button
          onClick={handleReup}
          className="grad rounded-full px-3 py-2 font-extrabold text-xs flex items-center gap-1"
          aria-label="Add 15 more minutes"
        >
          <Plus className="w-3.5 h-3.5" />+15 Mins
        </button>
      </div>

      {/* ── Topic Banner & Turn Info ────────────────────────────────────── */}
      <div className="flex flex-col gap-2 mx-4 mb-2" style={{ zIndex: 20 }}>
        {roomTopic && (
          <div className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center gap-2 text-xs font-bold text-purple-200">
            <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Topic: &quot;{roomTopic}&quot;</span>
          </div>
        )}
        
        {roomStatus === "active" && !isPhase2 && activeSpeaker && (
          <div className="px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-between text-xs font-bold text-blue-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{isMyTurn ? "Your Turn!" : `${activeSpeaker.name}'s Turn`}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono bg-blue-500/30 px-2 py-0.5 rounded text-blue-100">
                {formatTime(turnSecondsLeft)}
              </span>
              {isMyTurn && (
                <button onClick={handleDoneTurn} className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white transition-colors">
                  Done
                </button>
              )}
            </div>
          </div>
        )}
        {roomStatus === "active" && isPhase2 && (
          <div className="px-3.5 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center gap-2 text-xs font-bold text-green-200">
            <span>Open Floor - Speak Freely!</span>
          </div>
        )}
      </div>

      {/* ══ ZEGO VIDEO CONTAINER — fills remaining space ══════════════════════ */}
      <div className="relative flex-1 min-h-0 px-3 pb-3">

        {/* ZegoCloud UIKit Prebuilt renders here */}
        <div
          ref={zegoContainerRef}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ zIndex: 1 }}
        />

        {/* Loading overlay while Zego initializes */}
        {!zegoReady && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl" style={{ background: "rgba(16,17,20,0.9)", zIndex: 5 }}>
            <div className="flex flex-col items-center gap-4">
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                border: "3px solid rgba(124,58,237,0.3)",
                borderTop: "3px solid #7c3aed",
                animation: "spin 0.8s linear infinite",
              }} />
              <span className="text-sm text-white/60 font-semibold">
                {callMode === "Video" ? "Starting video call..." : "Starting voice call..."}
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        )}
      </div>

      {/* ── Custom Floating Controls ─────────────────────────────────────── */}
      {zegoReady && (
        <div className="absolute bottom-28 left-4 flex items-center justify-center pointer-events-auto" style={{ zIndex: 20 }}>
          <button 
            onClick={handleLeave} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 border border-purple-500/40 backdrop-blur-md shadow-xl hover:scale-105 transition-transform"
          >
            <ArrowLeftRight className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white drop-shadow-md">Switch Group</span>
          </button>
        </div>
      )}
    </div>
  );
}
