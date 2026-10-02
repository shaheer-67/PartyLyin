import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #0d0a1a 0%, #1a0d2e 50%, #0d1a0a 100%)", color: "#fff" }}>
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-purple-500/20 bg-[#0d0a1a]/80">
        <div className="wrap flex items-center py-4">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>
      
      <main className="wrap py-12 max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-10">Support</h1>
        
        <div className="space-y-6 text-white/80 leading-relaxed text-left glass p-8 md:p-12 rounded-[32px] border border-white/10">
          <p>
            Welcome PartyLyiN, a monetized social media platform for interactive voice and video conversations. We're dedicated to providing you the very best interactive social media experience that allows users to communicate safely and earn from their time.
          </p>
          <p>
            PartyLyiN is committed to providing you with support.
          </p>
          <p>
            We hope you enjoy our social media platform. If you have any questions or comments, please contact us at <a href="mailto:support@cuptoopia.com" className="text-purple-400 hover:underline">support@cuptoopia.com</a>.
          </p>
          <div className="pt-4">
            <p>Sincerely,</p>
            <p className="font-bold mt-1">PartyLyiN Management.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
