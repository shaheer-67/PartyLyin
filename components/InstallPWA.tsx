"use client";
import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already dismissed or installed
    if (localStorage.getItem("pwa-prompt-dismissed")) return;
    
    // Listen for the standard PWA event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Fallback for demo purposes if not running in PWA mode
    const timer = setTimeout(() => {
      if (!deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
    } else {
      // Fallback instruction for iOS or browsers that don't support native prompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To install PartyLyiN on your iPhone, tap the Share icon at the bottom and select 'Add to Home Screen'.");
      } else {
        alert("To install PartyLyiN, please use the 'Add to Home Screen' option in your browser menu.");
      }
      setShowPrompt(false);
      localStorage.setItem("pwa-prompt-dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 glass rounded-2xl p-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grad grid place-items-center text-white shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <p className="font-extrabold text-sm text-white">Install PartyLyiN App</p>
          <p className="text-xs text-white/60">Add to your home screen for the best experience.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleInstall} className="px-3 py-1.5 rounded-full grad text-white text-xs font-bold whitespace-nowrap">
          Install
        </button>
        <button onClick={handleDismiss} className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
