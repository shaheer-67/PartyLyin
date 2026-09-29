"use client";
import { Heart, MessageCircle } from "lucide-react";
import type { Lie } from "@/types";

interface LieCardProps {
  lie: Lie;
  liked: boolean;
  chatOpened: boolean;
  onLike: () => void;
  onChat: () => void;
}

/**
 * Single lie card displayed in the Lies feed.
 * Shows the lie text, tag, like count, and action buttons.
 */
export function LieCard({ lie, liked, chatOpened, onLike, onChat }: LieCardProps) {
  return (
    <article className="glass rounded-3xl p-5">
      {/* Tag */}
      <p className="text-xs font-bold" style={{ color: "var(--mute)" }}>
        {lie.tag}
      </p>

      {/* Lie text */}
      <p className="text-2xl font-extrabold leading-tight mt-1">"{lie.text}"</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm" style={{ color: "var(--mute)" }}>
          {lie.n + (liked ? 1 : 0)} liars agree
        </span>

        <div className="flex gap-2">
          {/* Like button */}
          <button
            onClick={onLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`w-11 h-11 rounded-full glass grid place-items-center ${liked ? "grad !text-white" : ""}`}
          >
            <Heart className="w-5 h-5" />
          </button>

          {/* Chat button */}
          <button
            onClick={onChat}
            className="h-11 px-4 rounded-full grad text-white font-bold text-sm flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            {chatOpened ? "Chat opened ✓" : "Start chat"}
          </button>
        </div>
      </div>
    </article>
  );
}
