"use client";

import { useEffect, useState } from "react";

type Platform = "android" | "ios" | "other";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStep, setInstallStep] = useState(0);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW registration failed:", err));
    }

    // Detect platform
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/i.test(ua);

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before (24h cooldown)
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const hoursSince = (Date.now() - dismissedTime) / 1000 / 60 / 60;
      if (hoursSince < 24) return;
    }

    // Android: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show guide after delay
    if (isIOS) {
      setTimeout(() => setShowBanner(true), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isInstalled || (!showBanner && !showIOSGuide)) return null;

  // ──────────────── ANDROID BANNER ────────────────
  if (platform === "android" && deferredPrompt && showBanner) {
    return (
      <>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
            70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(124,58,237,0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(124,58,237,0); }
          }
          .pwa-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
            padding: 16px;
          }
          .pwa-card {
            background: linear-gradient(135deg, #1a0a2e 0%, #16043a 50%, #0d0820 100%);
            border: 1px solid rgba(124,58,237,0.4);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 -8px 40px rgba(124,58,237,0.25), 0 0 80px rgba(0,0,0,0.6);
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .pwa-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            animation: pulse-ring 2s infinite;
            flex-shrink: 0;
          }
          .pwa-text { flex: 1; }
          .pwa-title {
            font-size: 17px;
            font-weight: 700;
            color: #fff;
            margin: 0 0 4px;
            letter-spacing: -0.3px;
          }
          .pwa-subtitle {
            font-size: 13px;
            color: rgba(255,255,255,0.55);
            margin: 0;
          }
          .pwa-install-btn {
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            letter-spacing: 0.2px;
            white-space: nowrap;
            box-shadow: 0 4px 20px rgba(124,58,237,0.5);
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          .pwa-install-btn:active {
            transform: scale(0.95);
          }
          .pwa-close {
            background: rgba(255,255,255,0.1);
            border: none;
            color: rgba(255,255,255,0.5);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-left: -8px;
            transition: all 0.2s;
          }
          .pwa-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
        `}</style>
        <div className="pwa-banner">
          <div className="pwa-card">
            <img src="/web-app-manifest-192x192.png" alt="PartyLyiN" className="pwa-icon" />
            <div className="pwa-text">
              <p className="pwa-title">Install PartyLyiN</p>
              <p className="pwa-subtitle">Add to home screen — works offline too</p>
            </div>
            <button className="pwa-install-btn" onClick={handleAndroidInstall}>
              Install
            </button>
            <button className="pwa-close" onClick={handleDismiss} aria-label="Dismiss">✕</button>
          </div>
        </div>
      </>
    );
  }

  // ──────────────── iOS GUIDE ────────────────
  if (platform === "ios" && showBanner) {
    const steps = [
      {
        icon: "⬆️",
        title: 'Tap the Share button',
        desc: 'At the bottom of Safari, tap the Share icon (box with arrow pointing up)',
      },
      {
        icon: "➕",
        title: '"Add to Home Screen"',
        desc: 'Scroll down in the share menu and tap "Add to Home Screen"',
      },
      {
        icon: "✅",
        title: 'Tap "Add"',
        desc: 'Confirm by tapping "Add" in the top right — PartyLyiN will appear on your home screen!',
      },
    ];

    return (
      <>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          .ios-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: flex-end;
            padding: 16px;
          }
          .ios-sheet {
            background: linear-gradient(160deg, #1a0a2e 0%, #16043a 60%, #0d0820 100%);
            border: 1px solid rgba(124,58,237,0.35);
            border-radius: 24px 24px 20px 20px;
            width: 100%;
            padding: 24px 24px 32px;
            animation: slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
            box-shadow: 0 -8px 60px rgba(124,58,237,0.3);
          }
          .ios-header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 20px;
          }
          .ios-app-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            flex-shrink: 0;
          }
          .ios-header-text h2 {
            font-size: 19px;
            font-weight: 700;
            color: #fff;
            margin: 0 0 2px;
          }
          .ios-header-text p {
            font-size: 13px;
            color: rgba(255,255,255,0.5);
            margin: 0;
          }
          .ios-close-btn {
            margin-left: auto;
            background: rgba(255,255,255,0.08);
            border: none;
            color: rgba(255,255,255,0.6);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ios-steps {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .ios-step {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 14px;
            background: rgba(124,58,237,0.08);
            border: 1px solid rgba(124,58,237,0.15);
            border-radius: 14px;
            animation: fadeIn 0.4s ease forwards;
          }
          .ios-step-num {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .ios-step-icon {
            font-size: 22px;
            line-height: 1;
            margin-top: 4px;
          }
          .ios-step-title {
            font-size: 14px;
            font-weight: 700;
            color: #e2d9f3;
            margin: 0 0 3px;
          }
          .ios-step-desc {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            margin: 0;
            line-height: 1.5;
          }
          .ios-arrow {
            position: fixed;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 32px;
            animation: bounce 1s ease infinite;
            z-index: 10000;
          }
          @keyframes bounce {
            0%,100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-6px); }
          }
          .ios-note {
            margin-top: 16px;
            padding: 10px 14px;
            background: rgba(251,191,36,0.08);
            border: 1px solid rgba(251,191,36,0.2);
            border-radius: 10px;
            font-size: 12px;
            color: rgba(251,191,36,0.85);
            text-align: center;
          }
        `}</style>
        <div className="ios-overlay" onClick={handleDismiss}>
          <div className="ios-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ios-header">
              <img src="/apple-touch-icon.png" alt="PartyLyiN" className="ios-app-icon" />
              <div className="ios-header-text">
                <h2>Install PartyLyiN</h2>
                <p>Add to your iPhone home screen</p>
              </div>
              <button className="ios-close-btn" onClick={handleDismiss} aria-label="Close">✕</button>
            </div>

            <div className="ios-steps">
              {steps.map((step, i) => (
                <div className="ios-step" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="ios-step-num">{i + 1}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="ios-step-icon">{step.icon}</span>
                      <p className="ios-step-title">{step.title}</p>
                    </div>
                    <p className="ios-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ios-note">
              ⚠️ Only works in <strong>Safari</strong> browser — open this page in Safari first
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
