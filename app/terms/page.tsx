import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Terms of <span className="gtxt">Service</span></h1>
        
        <div className="space-y-10 text-white/80 leading-relaxed glass p-8 md:p-10 rounded-[32px] border border-white/10">
          
          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PartyLyiN, provided by Cuptoopia.com, Inc., you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to use PartyLyiN. By registering for an account, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">3. Wallet and Minutes</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Purchases:</strong> PartyLyiN operates on a pay-per-minute model. You may purchase minutes ("Time") to participate in calls.</li>
              <li><strong>No Expiration:</strong> Unused minutes do not expire and will remain in your wallet as long as your account is active.</li>
              <li><strong>Refunds:</strong> All purchases of minutes are final and non-refundable, except as required by law.</li>
              <li><strong>Account Deletion:</strong> If you choose to permanently delete your account, any remaining minutes in your wallet will be forfeited without compensation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">4. User Conduct</h2>
            <p className="mb-2">You agree not to use PartyLyiN to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Engage in harassment, bullying, or hate speech.</li>
              <li>Share illegal, explicit, or unauthorized content.</li>
              <li>Spam other users or artificially manipulate the platform.</li>
            </ul>
            <p className="mt-4">
              We reserve the right to ban users and terminate accounts that violate these rules. Users can utilize the "Block Em'" feature to immediately sever contact with abusive individuals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-white mb-4">5. Disclaimer of Warranties</h2>
            <p>
              PartyLyiN is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee uninterrupted, secure, or error-free operation of the platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
