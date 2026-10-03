import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WELCOME_BONUS_MINUTES } from "@/lib/constants";

/**
 * Normalise an email so trivial variants map to the same identity:
 *  - lower-case + trim
 *  - Gmail/Googlemail: ignore dots and "+tag" suffix (a.b+x@gmail.com === ab@gmail.com)
 *  - other providers: ignore "+tag" suffix
 */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  local = local.split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
}

/**
 * Credit the ONE-TIME welcome bonus.
 *
 * A permanent claim record `signupBonuses/{normalizedEmail}` is created atomically
 * the first time an email registers. It is NEVER deleted (not even when the account
 * is deleted), so re-registering with the same email — or logging out/in — can never
 * grant the bonus again.
 *
 * Returns the number of minutes to credit (0 if already claimed or on any error —
 * failing closed so a glitch can never hand out free time).
 */
export async function claimWelcomeBonus(email: string, uid: string): Promise<number> {
  const claimRef = doc(db, "signupBonuses", encodeURIComponent(normalizeEmail(email)));
  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(claimRef);
      if (snap.exists()) return 0;
      tx.set(claimRef, {
        uid,
        minutes: WELCOME_BONUS_MINUTES,
        claimedAt: serverTimestamp(),
      });
      return WELCOME_BONUS_MINUTES;
    });
  } catch (e) {
    console.error("Welcome bonus claim failed (no bonus granted):", e);
    return 0;
  }
}
