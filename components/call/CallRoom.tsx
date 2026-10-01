"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Timer, Mic, MicOff, Video, VideoOff, MessageCircle, PhoneOff, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { formatTime } from "@/lib/utils";
import { TURN_DURATION_SECONDS } from "@/lib/constants";
import { ParticipantTile } from "./ParticipantTile";
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

/**
 * Full-screen call room.
 *
 * Tools are rendered in TWO places (per client requirement):
 *  1. TOP BAR  — timer + ReUp + room info (always visible)
 *  2. VIDEO OVERLAY TOOLBAR — mute, camera, chat, leave
 *     - Pinned to the BOTTOM of the video grid (above the grid bottom edge)
 *     - User can collapse it with the chevron arrow; it re-expands on hover/tap
 *
 * TODO (Phase 4): wire chat panel, real participants, real media streams.
 */
export default function CallRoom({ minutes, roomId, callMode = "Video", onReup, onLeave }: CallRoomProps) {
  const localUid = auth.currentUser?.uid || "local-test-uid";
  const [tick, setTick] = useState(0);
  const [bonusSeconds, setBonusSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(callMode === "Video");
  const [toolsVisible, setToolsVisible] = useState(true);
  const [realParticipants, setRealParticipants] = useState<Participant[]>([]);
  const [roomStatus, setRoomStatus] = useState<"waiting" | "active" | "ended">("waiting");
  const [roomTopic, setRoomTopic] = useState<string>("General Chit-Chat");
  const leavingRef = useRef(false);

  // Zego refs
  const zgRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localStreamIdRef = useRef<string>("");

  // ── Zego Integration ───────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    
    let isMounted = true;

    const initZego = async () => {
      try {
        const { ZegoExpressEngine } = await import("zego-express-engine-webrtc");
        // @ts-ignore
        const { generateToken04 } = await import("zego-token-generator");

        const appID = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET || "";
        const server = `wss://webliveroom${appID}-api.zegocloud.com/ws`;

        const zg = new ZegoExpressEngine(appID, server);
        zgRef.current = zg;

        const userName = auth.currentUser?.displayName || "User";

        // Generate temporary token for dev
        const token = generateToken04(appID, localUid, serverSecret, 3600, "");

        zg.on("roomStreamUpdate", async (rID: string, updateType: string, streamList: any[]) => {
          if (updateType === "ADD") {
            for (const stream of streamList) {
              const remoteVideo = document.getElementById(`video-${stream.user.userID}`) as HTMLVideoElement;
              if (remoteVideo) {
                const mediaStream = await zg.startPlayingStream(stream.streamID);
                remoteVideo.srcObject = mediaStream;
              }
            }
          } else if (updateType === "DELETE") {
            for (const stream of streamList) {
              zg.stopPlayingStream(stream.streamID);
            }
          }
        });

        await zg.loginRoom(roomId, token, { userID: localUid, userName }, { userUpdate: true });

        if (!isMounted) return;

        const isVideoCall = callMode === "Video";
        const localStream = await zg.createStream({
          camera: { video: isVideoCall, audio: true },
        });
        localStreamRef.current = localStream;
        const localStreamId = `${roomId}_${localUid}`;
        localStreamIdRef.current = localStreamId;

        const localVideo = document.getElementById(`video-${localUid}`) as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = localStream;
        }

        zg.startPublishingStream(localStreamId, localStream);
      } catch (e) {
        console.error("Zego init failed", e);
      }
    };

    initZego();

    return () => {
      isMounted = false;
      if (zgRef.current) {
        if (localStreamIdRef.current) {
          zgRef.current.stopPublishingStream(localStreamIdRef.current);
        }
        if (localStreamRef.current) {
          zgRef.current.destroyStream(localStreamRef.current);
        }
        zgRef.current.logoutRoom(roomId);
      }
    };
  }, [roomId, localUid]);

  // Sync mute/cam state to Zego stream
  useEffect(() => {
    if (zgRef.current && localStreamRef.current) {
      zgRef.current.mutePublishStreamAudio(localStreamRef.current, muted);
    }
  }, [muted]);

  useEffect(() => {
    if (zgRef.current && localStreamRef.current) {
      zgRef.current.mutePublishStreamVideo(localStreamRef.current, !camOn);
    }
  }, [camOn]);

  // ── Local tick timer ───────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Subscribe to Firestore room in real-time ─────────────────────────
  // Fetch real user profiles for each participant UID
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
      fetchParticipantProfiles(parts);
    });
    return () => unsub();
  }, [roomId, fetchParticipantProfiles]);

  const totalSeconds = minutes * 60 + bonusSeconds;
  const secondsLeft = Math.max(0, totalSeconds - tick);

  // Use real participants fetched from Firestore
  const displayParticipants = realParticipants.length > 0
    ? realParticipants
    : [{ uid: localUid, name: "You", colorA: "#334155", colorB: "#0f172a" }];

  const speakerIndex = Math.floor(tick / TURN_DURATION_SECONDS) % displayParticipants.length;
  const turnSecondsLeft = TURN_DURATION_SECONDS - (tick % TURN_DURATION_SECONDS);
  const nextSpeakerIndex = (speakerIndex + 1) % displayParticipants.length;

  async function handleLeave() {
    if (leavingRef.current) return;
    leavingRef.current = true;
    const remainingMins = Math.floor(secondsLeft / 60);
    if (roomId) {
      try { await leaveRoom(roomId, remainingMins); } catch {}
    }
    onLeave();
  }

  function handleReup() {
    setBonusSeconds((b) => b + 15 * 60);
    onReup();
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative text-white" style={{ background: "#101114" }}>

      {/* ══ TOP BAR — always visible ════════════════════════════════ */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        {/* Session countdown */}
        <div className="rounded-full px-4 py-2 flex items-center gap-2 font-extrabold text-lg bg-white/10 border border-white/10">
          <Timer className="w-5 h-5 text-amber-400" />
          {formatTime(secondsLeft)}
        </div>

        {/* Room info badge */}
        <span className="text-xs text-white/50 font-medium">
          {roomStatus === "waiting" ? "⏳ Waiting for others..." : `${displayParticipants.length} in room · 2 min / turn`}
        </span>

        {/* ReUp button — also in top bar for quick access */}
        <button
          onClick={handleReup}
          className="grad rounded-full px-3 py-2 font-extrabold text-xs flex items-center gap-1"
          aria-label="Add 15 more minutes"
        >
          <Plus className="w-3.5 h-3.5" />+15 Mins
        </button>
      </div>

      {/* ── Topic Banner ────────────────────────────────────────── */}
      {roomTopic && (
        <div className="mx-4 mb-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center gap-2 text-xs font-bold text-purple-200">
          <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Topic: "{roomTopic}"</span>
        </div>
      )}

      {/* ══ VIDEO GRID — fills remaining space ══════════════════════ */}
      <div className="relative flex-1 min-h-0 px-3 pb-3">

        {/* Participant tiles */}
        <div
          className="h-full grid grid-cols-2 gap-2"
          style={{ gridTemplateRows: "repeat(3,1fr)" }}
        >
          {displayParticipants.map((participant, i) => (
            <ParticipantTile
              key={participant.uid || i}
              participant={participant}
              index={i}
              isSpeaker={i === speakerIndex}
              isNext={i === nextSpeakerIndex}
              turnSecondsLeft={turnSecondsLeft}
            />
          ))}
        </div>

        {/* ── VIDEO OVERLAY TOOLBAR ─────────────────────────────────
            Pinned to the bottom of the video grid so it sits ON TOP
            of the video tiles — fulfilling "tools on the video display screen".
            Has a toggle chevron to collapse/expand.                         */}
        <div
          className="absolute left-3 right-3 bottom-0"
          style={{ transition: "transform 0.3s ease" }}
        >
          {/* Collapse/expand handle */}
          <div className="flex justify-center mb-1">
            <button
              onClick={() => setToolsVisible((v) => !v)}
              className="w-8 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-label={toolsVisible ? "Hide controls" : "Show controls"}
            >
              {toolsVisible
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Toolbar pill — slides down when hidden */}
          <div
            className="rounded-2xl px-4 py-3 flex items-end justify-around backdrop-blur-xl border border-white/15"
            style={{
              background: "rgba(10,10,14,0.72)",
              transform: toolsVisible ? "translateY(0)" : "translateY(110%)",
              transition: "transform 0.3s ease",
              pointerEvents: toolsVisible ? "auto" : "none",
            }}
          >
            {/* Mute */}
            <button
              className={`${CTL}`}
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <span className={`${ICON_BTN} ${muted ? "bg-rose-600" : "bg-white/15"}`}>
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </span>
              <span className="text-[10px] text-white/60 font-semibold">{muted ? "Unmute" : "Mute"}</span>
            </button>

            {/* Camera — only show in Video mode */}
            {callMode === "Video" && (
            <button
              className={`${CTL}`}
              onClick={() => setCamOn((c) => !c)}
              aria-label={camOn ? "Stop camera" : "Start camera"}
            >
              <span className={`${ICON_BTN} ${!camOn ? "bg-rose-600" : "bg-white/15"}`}>
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </span>
              <span className="text-[10px] text-white/60 font-semibold">{camOn ? "Camera" : "No Cam"}</span>
            </button>
            )}

            {/* ReUp — also in toolbar for thumb reach */}
            <button className={`${CTL}`} onClick={handleReup} aria-label="Add 15 minutes">
              <span className={`${ICON_BTN} grad`}>
                <Plus className="w-5 h-5" />
              </span>
              <span className="text-[10px] text-white/60 font-semibold">ReUp</span>
            </button>

            {/* Leave */}
            <button className={`${CTL}`} onClick={handleLeave} aria-label="Leave call">
              <span className={`${ICON_BTN} bg-rose-600`}>
                <PhoneOff className="w-5 h-5" />
              </span>
              <span className="text-[10px] text-white/60 font-semibold">Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
