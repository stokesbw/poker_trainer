"use client";

import { useState, useCallback } from "react";
import type { RangeMap } from "@/lib/poker/types";
import { getHandLabel, countCombos, rangeToPercent } from "@/lib/poker/range-utils";
import { RANGE_GRID_RANKS } from "@/lib/poker/constants";
import { cn } from "@/lib/utils";

interface RangeGridProps {
  range: RangeMap;
  highlightHand?: string;
  interactive?: boolean;
  onRangeChange?: (range: RangeMap) => void;
  showStats?: boolean;
  className?: string;
  label?: string;
  colorScheme?: "blue" | "green" | "red" | "yellow";
}

const COLOR_SCHEMES = {
  blue: {
    full: "bg-blue-600 border-blue-500 text-white",
    partial: "bg-blue-400 border-blue-300 text-white",
    highlight: "bg-yellow-400 border-yellow-300 text-black ring-2 ring-yellow-300",
    empty: "bg-poker-surface border-poker-border text-gray-600 hover:bg-poker-border",
  },
  green: {
    full: "bg-green-600 border-green-500 text-white",
    partial: "bg-green-400 border-green-300 text-white",
    highlight: "bg-yellow-400 border-yellow-300 text-black ring-2 ring-yellow-300",
    empty: "bg-poker-surface border-poker-border text-gray-600 hover:bg-poker-border",
  },
  red: {
    full: "bg-red-600 border-red-500 text-white",
    partial: "bg-red-400 border-red-300 text-white",
    highlight: "bg-yellow-400 border-yellow-300 text-black ring-2 ring-yellow-300",
    empty: "bg-poker-surface border-poker-border text-gray-600 hover:bg-poker-border",
  },
  yellow: {
    full: "bg-yellow-500 border-yellow-400 text-black",
    partial: "bg-yellow-300 border-yellow-200 text-black",
    highlight: "bg-blue-400 border-blue-300 text-white ring-2 ring-blue-300",
    empty: "bg-poker-surface border-poker-border text-gray-600 hover:bg-poker-border",
  },
};

export function RangeGrid({
  range,
  highlightHand,
  interactive = false,
  onRangeChange,
  showStats = true,
  className,
  label,
  colorScheme = "blue",
}: RangeGridProps) {
  const [hoveredHand, setHoveredHand] = useState<string | null>(null);
  const colors = COLOR_SCHEMES[colorScheme];

  const handleCellClick = useCallback(
    (hand: string) => {
      if (!interactive || !onRangeChange) return;
      const current = range[hand] ?? 0;
      const newRange = { ...range };
      if (current === 0) newRange[hand] = 1;
      else if (current === 1) delete newRange[hand];
      onRangeChange(newRange);
    },
    [interactive, onRangeChange, range]
  );

  const combos = countCombos(range);
  const pct = rangeToPercent(range);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <div className="text-sm font-semibold text-gray-300">{label}</div>
      )}
      <div className="grid grid-cols-13" style={{ gridTemplateColumns: "repeat(13, 1fr)", gap: "2px" }}>
        {RANGE_GRID_RANKS.map((r1, row) =>
          RANGE_GRID_RANKS.map((r2, col) => {
            const hand = getHandLabel(row, col);
            const freq = range[hand] ?? 0;
            const isHighlighted = highlightHand === hand;
            const isHovered = hoveredHand === hand;
            const isPair = row === col;
            const isSuited = row < col;

            let cellClass = colors.empty;
            if (isHighlighted) cellClass = colors.highlight;
            else if (freq === 1) cellClass = colors.full;
            else if (freq > 0) cellClass = colors.partial;

            return (
              <div
                key={hand}
                className={cn(
                  "relative flex items-center justify-center border rounded-sm cursor-default transition-all duration-100",
                  "text-[9px] font-semibold leading-none select-none",
                  cellClass,
                  interactive && "cursor-pointer",
                  isHovered && freq > 0 && "opacity-80",
                  isPair && "ring-inset ring-1 ring-white ring-opacity-20"
                )}
                style={{
                  aspectRatio: "1",
                  minWidth: 0,
                  fontSize: "clamp(7px, 1.2vw, 11px)",
                  opacity: freq > 0 && freq < 1 ? 0.6 + freq * 0.4 : undefined,
                }}
                onClick={() => handleCellClick(hand)}
                onMouseEnter={() => setHoveredHand(hand)}
                onMouseLeave={() => setHoveredHand(null)}
                title={`${hand} (${freq > 0 ? Math.round(freq * 100) + "%" : "not in range"})`}
              >
                <span className="truncate px-0.5">{hand}</span>
                {/* Frequency overlay bar */}
                {freq > 0 && freq < 1 && (
                  <div
                    className="absolute bottom-0 left-0 h-0.5 bg-white opacity-70 rounded-b"
                    style={{ width: `${freq * 100}%` }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {showStats && (
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>
            <span className="text-white font-semibold">{combos.toFixed(0)}</span> combos
          </span>
          <span>
            <span className="text-white font-semibold">{pct.toFixed(1)}%</span> of hands
          </span>
          {hoveredHand && (
            <span className="ml-auto text-yellow-400 font-semibold">{hoveredHand}</span>
          )}
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-600 border border-blue-500" />
          <span>In range</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-400 border border-blue-300 opacity-70" />
          <span>Mixed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-gray-400">top-left = suited, bottom-right = offsuit</div>
        </div>
      </div>
    </div>
  );
}
