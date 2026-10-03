"use client";
import { useRef, useState } from "react";

/**
 * "Watch how PartyLyiN works" video.
 * Occupies exactly the same 16:9 glass box as the old placeholder and never
 * overflows it (object-fit: contain + overflow hidden).
 * preload="metadata" so the large file is only streamed once the user hits play.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.controls = true;
    v.play().catch(() => {
      /* autoplay blocked – user can use native controls */
    });
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#000",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.60), inset 0 0 0 1px rgba(255,255,255,0.10)",
      }}
    >
      <video
        ref={videoRef}
        src="/PartyLyiN.mp4#t=0.1"
        preload="metadata"
        playsInline
        onPlay={() => setStarted(true)}
        onEnded={() => setStarted(false)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
          display: "block",
        }}
      />

      {/* Play overlay (hidden while playing) */}
      {!started && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Watch how PartyLyiN works"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.85rem",
            background: "rgba(0,0,0,0.38)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#16a34a,#86efac)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 28px rgba(22,163,74,0.55)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </span>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.02em" }}>
            Watch how PartyLyiN works
          </span>
        </button>
      )}
    </div>
  );
}
