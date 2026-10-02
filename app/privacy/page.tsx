import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #0d0a1a 0%, #1a0d2e 50%, #0d1a0a 100%)", color: "#fff" }}>
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-purple-500/20 bg-[#0d0a1a]/80">
        <div className="wrap flex items-center py-4">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>
      
      <main className="wrap py-12 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy <span className="gtxt">Policy</span></h1>
        
        
        <div className="space-y-10 text-white/80 leading-relaxed glass p-8 md:p-10 rounded-[32px] border border-white/10">
          
          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to PartyLyiN, a service provided by Cuptoopia.com, Inc. ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, and share your personal information when you use our monetized social communication platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> When you register, we collect your username, email address, date of birth, zip code, and optionally your profile photo, spoken language, gender, and race/ethnicity.</li>
              <li><strong>Audio and Video Data:</strong> During group and 1-on-1 calls, audio and video data is streamed to connect you with other users. We do not record or store these streams unless explicitly stated for moderation purposes.</li>
              <li><strong>Wallet and Payment Information:</strong> When you purchase minutes, payment information is processed by our third-party payment processors. We do not store full credit card details.</li>
              <li><strong>Usage Data:</strong> We collect data on how you interact with the app, including the topics you select, the lies you post, and your engagement time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve the PartyLyiN matchmaking and communication services.</li>
              <li>Process transactions and manage your Wallet minutes.</li>
              <li>Enforce our Terms of Service, including investigating reports of abuse and blocking users.</li>
              <li>Communicate with you regarding updates, security alerts, and support messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">4. Safety and Moderation</h2>
            <p>
              Your safety is our priority. If you use the "Block Em'" or "I'm Out" features, we log these actions to maintain a safe environment. Users who repeatedly violate our community guidelines will have their accounts permanently suspended.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at support@cuptoopia.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
