"use client";
import { Mic, MicOff, Video, VideoOff, MessageCircle, PhoneOff, Plus } from "lucide-react";

interface CallControlsProps {
  muted: boolean;
  camOn: boolean;
  unreadMessages: number;
  onToggleMute: () => void;
  onToggleCam: () => void;
  onOpenChat: () => void;
  onLeave: () => void;
  onReup: () => void;
}

const CTL_BASE = "w-12 h-12 rounded-full grid place-items-center bg-white/15";

/**
 * Bottom control bar shown inside the call room.
 * Handles mute, camera, chat, leave, and ReUp actions.
 */
export function CallControls({
  muted,
  camOn,
  unreadMessages,
  onToggleMute,
  onToggleCam,
  onOpenChat,
  onLeave,
  onReup,
}: CallControlsProps) {
  return (
    <div
      className="absolute left-4 right-4 bottom-5 rounded-full p-2.5 flex items-center justify-around backdrop-blur-xl border border-white/15"
      style={{ background: "rgba(255,255,255,.14)" }}
    >
      {/* Mute */}
      <button
        className={`${CTL_BASE} ${muted ? "!bg-rose-600" : ""}`}
        onClick={onToggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Camera */}
      <button
        className={`${CTL_BASE} ${!camOn ? "!bg-rose-600" : ""}`}
        onClick={onToggleCam}
        aria-label={camOn ? "Turn off camera" : "Turn on camera"}
      >
        {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* Chat */}
      <button className={`${CTL_BASE} relative`} onClick={onOpenChat} aria-label="Open chat">
        <MessageCircle className="w-5 h-5" />
        {unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-[11px] font-bold grid place-items-center">
            {unreadMessages}
          </span>
        )}
      </button>

      {/* ReUp */}
      <button
        onClick={onReup}
        className="grad rounded-full px-3 py-2 font-extrabold text-xs flex items-center gap-1"
        aria-label="Add 15 more minutes"
      >
        <Plus className="w-3.5 h-3.5" />
        +15 Mins
      </button>

      {/* Leave */}
      <button
        onClick={onLeave}
        className="h-12 px-5 rounded-full bg-rose-600 font-extrabold flex items-center gap-2"
        aria-label="Leave call"
      >
        <PhoneOff className="w-5 h-5" />
        Leave
      </button>
    </div>
  );
}
