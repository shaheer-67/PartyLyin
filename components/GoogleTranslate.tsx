"use client";
import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check, X } from "lucide-react";

// All Google Translate supported languages
const LANGUAGES = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "as", name: "Assamese" },
  { code: "ay", name: "Aymara" },
  { code: "az", name: "Azerbaijani" },
  { code: "bm", name: "Bambara" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bho", name: "Bhojpuri" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "ca", name: "Catalan" },
  { code: "ceb", name: "Cebuano" },
  { code: "ny", name: "Chichewa" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "co", name: "Corsican" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "dv", name: "Dhivehi" },
  { code: "doi", name: "Dogri" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian" },
  { code: "ee", name: "Ewe" },
  { code: "tl", name: "Filipino" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "fy", name: "Frisian" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gn", name: "Guarani" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "haw", name: "Hawaiian" },
  { code: "iw", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hmn", name: "Hmong" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "ig", name: "Igbo" },
  { code: "ilo", name: "Ilocano" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jw", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "gom", name: "Konkani" },
  { code: "ko", name: "Korean" },
  { code: "kri", name: "Krio" },
  { code: "ku", name: "Kurdish (Kurmanji)" },
  { code: "ckb", name: "Kurdish (Sorani)" },
  { code: "ky", name: "Kyrgyz" },
  { code: "lo", name: "Lao" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "ln", name: "Lingala" },
  { code: "lt", name: "Lithuanian" },
  { code: "lg", name: "Luganda" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mai", name: "Maithili" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mr", name: "Marathi" },
  { code: "mni-Mtei", name: "Meitei (Manipuri)" },
  { code: "lus", name: "Mizo" },
  { code: "mn", name: "Mongolian" },
  { code: "my", name: "Myanmar (Burmese)" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "or", name: "Odia" },
  { code: "om", name: "Oromo" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "qu", name: "Quechua" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sm", name: "Samoan" },
  { code: "sa", name: "Sanskrit" },
  { code: "gd", name: "Scots Gaelic" },
  { code: "nso", name: "Sepedi" },
  { code: "sr", name: "Serbian" },
  { code: "st", name: "Sesotho" },
  { code: "sn", name: "Shona" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "tt", name: "Tatar" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "ti", name: "Tigrinya" },
  { code: "ts", name: "Tsonga" },
  { code: "tr", name: "Turkish" },
  { code: "tk", name: "Turkmen" },
  { code: "ak", name: "Twi" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "ug", name: "Uyghur" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "xh", name: "Xhosa" },
  { code: "yi", name: "Yiddish" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Inject Google Translate hidden element + script
  useEffect(() => {
    // Create hidden container for Google Translate
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.style.cssText = "position:absolute;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";
      document.body.appendChild(el);
    }

    // Inject Google Translate script only once
    if (!document.getElementById("gt-script")) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
      };
      const script = document.createElement("script");
      script.id = "gt-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }

    // Suppress Google Translate top bar / banner
    const style = document.createElement("style");
    style.id = "gt-hide";
    style.innerHTML = `
      body { top: 0 !important; }
      .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame,
      .goog-logo-link, .goog-te-gadget-simple, .goog-te-menu-value,
      .goog-te-spinner-pos, #goog-gt-vt { display: none !important; }
      .skiptranslate { display: none !important; }
      font.notranslate { display: none !important; }
    `;
    if (!document.getElementById("gt-hide")) {
      document.head.appendChild(style);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  function selectLanguage(lang: { code: string; name: string }) {
    setSelected(lang);
    setOpen(false);
    setSearch("");

    // Trigger Google Translate via the hidden combo element
    const attemptTranslate = (attempts = 0) => {
      const combo = document.querySelector(
        ".goog-te-combo, select.goog-te-combo"
      ) as HTMLSelectElement | null;

      if (combo) {
        combo.value = lang.code;
        combo.dispatchEvent(new Event("change"));
      } else if (attempts < 15) {
        setTimeout(() => attemptTranslate(attempts + 1), 300);
      }
    };
    attemptTranslate();
  }

  function resetLanguage() {
    setSelected(null);
    // Reset to English
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      combo.value = "en";
      combo.dispatchEvent(new Event("change"));
    }
    // Also try the Google Translate restore link
    const banner = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement | null;
    if (banner) {
      const restore = banner.contentDocument?.querySelector(".goog-close-link") as HTMLElement | null;
      restore?.click();
    }
  }

  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes gt-slide-down {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .gt-dropdown {
          animation: gt-slide-down 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .gt-lang-item:hover {
          background: rgba(124,58,237,0.18);
          color: #fff;
        }
        .gt-lang-item.active {
          background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(236,72,153,0.20));
          color: #fff;
        }
      `}</style>

      <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
        {/* ── Trigger Button ──────────────────────────────────────────── */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(124,58,237,0.35)",
            color: selected ? "#e2d9f3" : "rgba(255,255,255,0.65)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            boxShadow: open ? "0 0 0 2px rgba(124,58,237,0.4)" : "none",
          }}
          aria-label="Select Language"
          aria-expanded={open}
        >
          <Globe style={{ width: "15px", height: "15px", color: "#a78bfa" }} />
          <span className="notranslate">
            {selected ? selected.name : "Language"}
          </span>
          {selected ? (
            <span
              onClick={(e) => { e.stopPropagation(); resetLanguage(); }}
              style={{
                display: "flex", alignItems: "center",
                marginLeft: "2px", color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}
            >
              <X style={{ width: "12px", height: "12px" }} />
            </span>
          ) : (
            <ChevronDown
              style={{
                width: "13px", height: "13px",
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          )}
        </button>

        {/* ── Dropdown Panel ──────────────────────────────────────────── */}
        {open && (
          <div
            className="gt-dropdown"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "260px",
              maxHeight: "380px",
              borderRadius: "18px",
              background: "linear-gradient(145deg, #1a0a2e, #160434)",
              border: "1px solid rgba(124,58,237,0.30)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.60), 0 0 0 1px rgba(124,58,237,0.10)",
              backdropFilter: "blur(24px)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Search */}
            <div
              style={{
                padding: "12px 12px 8px",
                borderBottom: "1px solid rgba(124,58,237,0.15)",
                flexShrink: 0,
              }}
            >
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search language..."
                className="notranslate"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Language List */}
            <div
              style={{
                overflowY: "auto",
                flex: 1,
                padding: "6px 6px",
                scrollbarWidth: "none",
              }}
            >
              {filtered.length === 0 ? (
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "12px", padding: "20px 0" }}>
                  No language found
                </p>
              ) : (
                filtered.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang)}
                    className={`gt-lang-item notranslate ${selected?.code === lang.code ? "active" : ""}`}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "transparent",
                      border: "none",
                      color: selected?.code === lang.code ? "#fff" : "rgba(255,255,255,0.65)",
                      fontSize: "13px",
                      fontWeight: selected?.code === lang.code ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{lang.name}</span>
                    {selected?.code === lang.code && (
                      <Check style={{ width: "13px", height: "13px", color: "#a78bfa", flexShrink: 0 }} />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "8px 12px",
                borderTop: "1px solid rgba(124,58,237,0.12)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", flexShrink: 0 }}>
                <path fill="#4285F4" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"/>
                <path fill="#fff" d="M11 7h2v2h-2zm0 4h2v6h-2z"/>
              </svg>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                Powered by Google Translate · {LANGUAGES.length} languages
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
