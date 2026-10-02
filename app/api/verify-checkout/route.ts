import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // In a full production app, we would use firebase-admin here to securely update the user's minutes
      // Since this is a demo environment without firebase-admin, we return the validated minutes to the client
      // The client will then securely (for demo purposes) apply the update.
      return NextResponse.json({
        success: true,
        uid: session.metadata?.uid,
        minutes: parseInt(session.metadata?.minutes || "0", 10),
      });
    }

    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (error: any) {
    console.error("Stripe Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
