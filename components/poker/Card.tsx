"use client";

import type { Card as CardType } from "@/lib/poker/types";
import { SUIT_SYMBOLS } from "@/lib/poker/constants";
import { cn } from "@/lib/utils";

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const SIZE_CLASSES = {
  xs: "w-7 h-10 text-xs",
  sm: "w-10 h-14 text-sm",
  md: "w-14 h-20 text-base",
  lg: "w-20 h-28 text-lg",
};

const RANK_FONT = {
  xs: "text-xs font-bold leading-none",
  sm: "text-sm font-bold leading-none",
  md: "text-base font-bold leading-none",
  lg: "text-xl font-bold leading-none",
};

const SUIT_FONT = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Card({ card, faceDown = false, size = "md", className, animate = false }: CardProps) {
  const isRed = card?.suit === "h" || card?.suit === "d";

  if (faceDown || !card) {
    return (
      <div
        className={cn(
          SIZE_CLASSES[size],
          "rounded-md border border-poker-border bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center shadow-lg",
          animate && "animate-deal-card",
          className
        )}
      >
        <div className="text-blue-700 text-opacity-50 grid grid-cols-2 gap-0.5 p-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-700 opacity-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        SIZE_CLASSES[size],
        "rounded-md border border-gray-300 bg-card-bg flex flex-col justify-between p-1 shadow-lg select-none",
        animate && "animate-deal-card",
        className
      )}
    >
      {/* Top-left rank + suit */}
      <div className={cn("flex flex-col items-start", isRed ? "text-card-red" : "text-card-black")}>
        <span className={RANK_FONT[size]}>{card.rank}</span>
        <span className={SUIT_FONT[size]}>{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      {/* Center suit */}
      <div className={cn("flex items-center justify-center", isRed ? "text-card-red" : "text-card-black")}>
        <span className={size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
      </div>
      {/* Bottom-right (rotated) */}
      <div className={cn("flex flex-col items-end rotate-180", isRed ? "text-card-red" : "text-card-black")}>
        <span className={RANK_FONT[size]}>{card.rank}</span>
        <span className={SUIT_FONT[size]}>{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
}

// Compact inline card for text display
interface InlineCardProps {
  cardStr: string; // e.g. "Ah", "Ks"
  className?: string;
}

export function InlineCard({ cardStr, className }: InlineCardProps) {
  const rank = cardStr[0];
  const suit = cardStr[1] as "s" | "h" | "d" | "c";
  const isRed = suit === "h" || suit === "d";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold border",
        "bg-card-bg text-sm",
        isRed ? "text-card-red border-red-200" : "text-card-black border-gray-300",
        className
      )}
    >
      {rank}
      <span>{SUIT_SYMBOLS[suit]}</span>
    </span>
  );
}
