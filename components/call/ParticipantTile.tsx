"use client";
import { Mic } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { Participant } from "@/types";
import { auth } from "@/lib/firebase";

interface ParticipantTileProps {
  participant: Participant;
  index: number;
  isSpeaker: boolean;
  isNext: boolean;
  turnSecondsLeft: number;
}

/**
 * Single video tile for a call participant.
 * Shows avatar, name, speaker indicator, and "Next" badge.
 */
export function ParticipantTile({
  participant,
  index,
  isSpeaker,
  isNext,
  turnSecondsLeft,
}: ParticipantTileProps) {
  const { name, colorA, colorB } = participant;

  return (
    <div
      className={`tile ${index === 4 ? "col-span-2" : ""} ${isSpeaker ? "speak" : ""}`}
      style={{ background: `linear-gradient(160deg,${colorA}66,${colorB}bb 60%,#15161a)` }}
    >
      {/* Video element for Zego */}
      <video
        id={`video-${participant.uid || index}`}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted={participant.uid === auth.currentUser?.uid}
      />

      {/* Avatar (Fallback if no video) */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-white/20 grid place-items-center text-2xl font-extrabold backdrop-blur-sm shadow-xl">
          {name[0]}
        </div>
      </div>

      {/* Name */}
      <span className="absolute left-3 bottom-3 bg-black/40 rounded-full px-3 py-1 text-xs font-bold">
        {name}
      </span>

      {/* Speaking timer badge */}
      {isSpeaker && (
        <span className="absolute top-3 right-3 grad rounded-full px-3 py-1 text-xs font-extrabold flex items-center gap-1">
          <Mic className="w-3 h-3" />
          {/* Show only the seconds portion like "1:45" */}
          {formatTime(turnSecondsLeft).slice(1)}
        </span>
      )}

      {/* "Next" badge */}
      {isNext && (
        <span className="absolute top-3 left-3 bg-black/40 rounded-full px-2.5 py-1 text-[11px] font-bold">
          Next
        </span>
      )}
    </div>
  );
}
