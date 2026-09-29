"use client";
import type { WalletTier } from "@/types";

interface TierCardProps {
  tier: WalletTier;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Single wallet tier purchase card.
 * The last tier (index 3) gets the "Best value" badge and gradient styling.
 */
export function TierCard({ tier, index, isSelected, onSelect }: TierCardProps) {
  const isBestValue = index === 3;

  return (
    <button
      onClick={onSelect}
      className={[
        "glass rounded-3xl p-4 text-left relative",
        isBestValue ? "col-span-2 grad !text-white" : "",
        isSelected ? "outline outline-[2.5px] outline-rose-500" : "",
      ].join(" ")}
      aria-pressed={isSelected}
    >
      {isBestValue && (
        <span className="absolute -top-2.5 right-4 bg-white text-rose-600 text-[11px] font-extrabold rounded-full px-3 py-1 shadow">
          Best value
        </span>
      )}

      <p className="text-4xl font-extrabold leading-none">
        {tier.minutes}
        <span className="text-base font-semibold ml-1">mins</span>
      </p>

      <p className={`font-bold mt-2 ${isBestValue ? "" : "gtxt"}`}>
        ${tier.price}.00
      </p>
    </button>
  );
}
