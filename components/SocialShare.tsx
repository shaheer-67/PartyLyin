"use client";
import { useState, useEffect } from "react";
import { Share2, Copy, Check, X, Send, Sparkles } from "lucide-react";

interface SocialShareProps {
  /** Optional custom URL to share. Defaults to window.location.href */
  url?: string;
  /** Optional title for the share */
  title?: string;
  /** Optional text description to include */
  text?: string;
  /** If true, renders only the button which opens the modal sheet when clicked */
  variant?: "modal" | "inline" | "button";
}

interface Platform {
  id: string;
  name: string;
  color: string;
  bgGradient: string;
  icon: (props: { className?: string; style?: React.CSSProperties }) => JSX.Element;
  getUrl: (url: string, title: string, text: string) => string;
}

const PLATFORMS: Platform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    color: "#25D366",
    bgGradient: "linear-gradient(135deg, #25D366, #128C7E)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.11 1.519 5.842L0 24l6.326-1.48C7.986 23.468 9.941 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.849 0-3.582-.496-5.084-1.363l-.365-.211-3.761.88.892-3.666-.231-.377A9.948 9.948 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
      </svg>
    ),
    getUrl: (u, t, desc) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${t} - ${desc}\n${u}`)}`,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    color: "#1DA1F2",
    bgGradient: "linear-gradient(135deg, #000000, #1DA1F2)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (u, t, desc) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${t}: ${desc}`)}&url=${encodeURIComponent(u)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    bgGradient: "linear-gradient(135deg, #1877F2, #0056b3)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getUrl: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#0088cc",
    bgGradient: "linear-gradient(135deg, #0088cc, #005f9e)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.462-.17.585-.434.781-.685.801-.546.043-.961-.322-1.488-.667-.825-.541-1.293-.878-2.094-1.405-.925-.609-.325-.944.202-1.492.138-.143 2.536-2.325 2.583-2.525.006-.025.011-.119-.044-.169-.055-.05-.136-.033-.195-.02-.084.019-1.422.906-4.015 2.658-.38.261-.724.388-1.032.381-.34-.007-.994-.192-1.48-.35-.597-.193-1.071-.296-1.03-.625.022-.172.261-.348.717-.528 2.809-1.223 4.681-2.03 5.617-2.42 2.671-1.114 3.228-1.307 3.589-1.313.08 0 .257.02.372.114.097.08.124.188.136.275.012.086.026.287.015.447z"/>
      </svg>
    ),
    getUrl: (u, t, desc) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(`${t} - ${desc}`)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    bgGradient: "linear-gradient(135deg, #0A66C2, #004182)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    getUrl: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    color: "#FF4500",
    bgGradient: "linear-gradient(135deg, #FF4500, #cc3700)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.187-.491.956 0 1.733.778 1.733 1.734 0 .668-.378 1.246-.93 1.536.03.22.046.442.046.666 0 3.377-3.963 6.118-8.851 6.118-4.887 0-8.85-2.74-8.85-6.118 0-.214.015-.427.042-.637a1.732 1.732 0 0 1-.98-1.565c0-.956.777-1.734 1.733-1.734.464 0 .888.184 1.198.498 1.205-.865 2.879-1.428 4.717-1.488l.926-4.341 3.23.681c.075-.487.495-.86.999-.86z"/>
      </svg>
    ),
    getUrl: (u, t) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    color: "#BD081C",
    bgGradient: "linear-gradient(135deg, #BD081C, #8b0413)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026h.032z"/>
      </svg>
    ),
    getUrl: (u, t, desc) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}&description=${encodeURIComponent(`${t}: ${desc}`)}`,
  },
  {
    id: "email",
    name: "Email",
    color: "#EA4335",
    bgGradient: "linear-gradient(135deg, #EA4335, #b31405)",
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
    getUrl: (u, t, desc) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${desc}\n\nCheck it out here: ${u}`)}`,
  },
];

export default function SocialShare({
  url,
  title = "PartyLyiN - Timed Video & Voice Calls",
  text = "Join me on PartyLyiN! The UN declared loneliness a global epidemic - let's connect, talk and beat loneliness together! 🚀",
  variant = "modal",
}: SocialShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || "");
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!url) setShareUrl(window.location.href);
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        setHasNativeShare(true);
      }
    }
  }, [url]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        console.warn("Native share error/cancelled:", err);
      }
    } else {
      setOpen(true);
    }
  };

  const openPlatform = (platform: Platform) => {
    const shareLink = platform.getUrl(shareUrl, title, text);
    window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const renderContent = () => (
    <div className="flex flex-col gap-4">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full grad grid place-items-center text-white">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base leading-tight">
              Share <span className="gtxt">PartyLyiN</span>
            </h3>
            <p className="text-xs text-white/50">Invite friends &amp; spread the vibe</p>
          </div>
        </div>
        {variant === "modal" && (
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full glass grid place-items-center hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Copy Link Input Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass border border-purple-500/30">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white/80 font-mono outline-none truncate"
        />
        <button
          onClick={handleCopyLink}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            copied
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : "grad text-white hover:scale-105"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Native Mobile Share Button (if supported) */}
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <Send className="w-3.5 h-3.5 text-purple-400" />
          Share via Mobile Apps
        </button>
      )}

      {/* Social Media Grid */}
      <div className="grid grid-cols-4 gap-3 pt-1">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <button
              key={platform.id}
              onClick={() => openPlatform(platform)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-200 group hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl grid place-items-center text-white shadow-md transition-transform group-hover:scale-110"
                style={{ background: platform.bgGradient }}
              >
                <Icon />
              </div>
              <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">
                {platform.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="p-5 rounded-[28px] glass border border-purple-500/20 shadow-2xl">
        {renderContent()}
      </div>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          if (hasNativeShare) {
            handleNativeShare();
          } else {
            setOpen(true);
          }
        }}
        className="px-4 py-2 rounded-full glass border border-purple-500/30 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        aria-label="Share PartyLyiN"
      >
        <Share2 className="w-4 h-4 text-purple-400" />
        <span>Share</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full maxWidth-md rounded-[32px] p-6 glass border border-purple-500/40 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{
              maxWidth: "420px",
              background: "linear-gradient(145deg, #180c2e, #0e051c)",
            }}
          >
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
