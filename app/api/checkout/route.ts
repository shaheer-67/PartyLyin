import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WALLET_TIERS } from "@/lib/constants";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: Request) {
  try {
    const { tierIndex, uid } = await req.json();
    
    if (tierIndex === undefined || !uid) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const tier = WALLET_TIERS[tierIndex];
    if (!tier) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.minutes} Minutes PartyLyiN Wallet Recharge`,
              description: "Minutes never expire — they're saved to your wallet.",
            },
            unit_amount: tier.price * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app?payment=cancelled`,
      metadata: {
        uid: uid,
        minutes: tier.minutes.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
