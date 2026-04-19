import type { RangeMap, RangeCombo } from "./types";
import { RANGE_GRID_RANKS, PAIR_COMBOS, SUITED_COMBOS, OFFSUIT_COMBOS } from "./constants";

// ============================================================
// Range Utilities
// ============================================================

/**
 * Returns the canonical hand label for the range grid cell at [row][col].
 * row=0,col=0 = AA (top-left)
 * Above diagonal = suited (e.g., AKs)
 * Below diagonal = offsuit (e.g., AKo)
 * Diagonal = pairs (e.g., AA, KK...)
 */
export function getHandLabel(row: number, col: number): string {
  const r1 = RANGE_GRID_RANKS[row];
  const r2 = RANGE_GRID_RANKS[col];

  if (row === col) return `${r1}${r2}`; // pair
  if (row < col) return `${r1}${r2}s`; // suited (upper triangle)
  return `${r2}${r1}o`; // offsuit (lower triangle)
}

export function isHandInRange(hand: string, range: RangeMap): boolean {
  return (range[hand] ?? 0) > 0;
}

export function getHandFrequency(hand: string, range: RangeMap): number {
  return range[hand] ?? 0;
}

export function countCombos(range: RangeMap): number {
  let total = 0;
  for (const [hand, freq] of Object.entries(range)) {
    if (!freq) continue;
    const combos = hand.endsWith("s")
      ? SUITED_COMBOS
      : hand.endsWith("o")
      ? OFFSUIT_COMBOS
      : PAIR_COMBOS;
    total += combos * freq;
  }
  return Math.round(total * 10) / 10;
}

export function rangeToPercent(range: RangeMap): number {
  const totalCombos = 1326; // total possible starting hands
  const inRange = countCombos(range);
  return Math.round((inRange / totalCombos) * 1000) / 10;
}

/**
 * Parse a range string like "AA,KK,QQ,AKs,AQs-ATs,AKo" into a RangeMap
 */
export function parseRangeString(rangeStr: string): RangeMap {
  const range: RangeMap = {};
  if (!rangeStr.trim()) return range;

  const parts = rangeStr.split(",").map((p) => p.trim());

  for (const part of parts) {
    // Handle ranges like AQs-ATs or 88-55
    if (part.includes("-")) {
      const [from, to] = part.split("-");
      const fromHand = from.trim();
      const toHand = to.trim();

      // Pair range like 88-55
      if (fromHand.length === 2 && toHand.length === 2 && fromHand[0] === fromHand[1]) {
        const fromIdx = RANGE_GRID_RANKS.indexOf(fromHand[0] as typeof RANGE_GRID_RANKS[0]);
        const toIdx = RANGE_GRID_RANKS.indexOf(toHand[0] as typeof RANGE_GRID_RANKS[0]);
        const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
        for (let i = start; i <= end; i++) {
          const r = RANGE_GRID_RANKS[i];
          range[`${r}${r}`] = 1;
        }
        continue;
      }

      // Suited/offsuit connector range like AQs-ATs
      if (fromHand[0] === toHand[0]) {
        const suit = fromHand.endsWith("s") ? "s" : "o";
        const topRank = fromHand[0];
        const fromSecond = RANGE_GRID_RANKS.indexOf(fromHand[1] as typeof RANGE_GRID_RANKS[0]);
        const toSecond = RANGE_GRID_RANKS.indexOf(toHand[1] as typeof RANGE_GRID_RANKS[0]);
        const [start, end] = fromSecond < toSecond ? [fromSecond, toSecond] : [toSecond, fromSecond];
        for (let i = start; i <= end; i++) {
          const r = RANGE_GRID_RANKS[i];
          if (r !== topRank) {
            range[`${topRank}${r}${suit}`] = 1;
          }
        }
        continue;
      }
    }

    // Frequency format: AKs:0.5
    if (part.includes(":")) {
      const [hand, freqStr] = part.split(":");
      range[hand.trim()] = parseFloat(freqStr);
      continue;
    }

    // Simple hand
    range[part] = 1;
  }

  return range;
}

/**
 * Convert a RangeMap to a sorted range string
 */
export function rangeToString(range: RangeMap): string {
  return Object.entries(range)
    .filter(([, f]) => f > 0)
    .map(([h, f]) => (f === 1 ? h : `${h}:${f}`))
    .join(",");
}

/**
 * Merge two ranges (union)
 */
export function mergeRanges(r1: RangeMap, r2: RangeMap): RangeMap {
  const merged: RangeMap = { ...r1 };
  for (const [hand, freq] of Object.entries(r2)) {
    merged[hand] = Math.max(merged[hand] ?? 0, freq);
  }
  return merged;
}

/**
 * Get all combos as structured objects
 */
export function getRangeCombos(range: RangeMap): RangeCombo[] {
  return Object.entries(range)
    .filter(([, f]) => f > 0)
    .map(([hand, frequency]) => {
      const suited = hand.endsWith("s");
      const offsuit = hand.endsWith("o");
      const pair = !suited && !offsuit && hand[0] === hand[1];
      const combos = pair ? PAIR_COMBOS : suited ? SUITED_COMBOS : OFFSUIT_COMBOS;
      return { hand, suited, offsuit, pair, frequency, combos };
    });
}

/**
 * Check if hand beats a threshold frequency
 */
export function isHandInTopPercent(hand: string, range: RangeMap, threshold: number): boolean {
  const freq = getHandFrequency(hand, range);
  return freq >= threshold;
}

// Prebuilt common MTT ranges
export const OPEN_RAISE_RANGES: Record<string, RangeMap> = {
  UTG_9max: parseRangeString(
    "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,KQs,KJs,QJs,JTs,AKo,AQo,AJo,KQo"
  ),
  HJ_9max: parseRangeString(
    "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo"
  ),
  CO_9max: parseRangeString(
    "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,AKo,AQo,AJo,ATo,A9o,KQo,KJo,KTo,QJo,QTo"
  ),
  BTN_9max: parseRangeString(
    "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,K7s,QJs,QTs,Q9s,Q8s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o"
  ),
  SB_9max: parseRangeString(
    "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,QJs,QTs,Q9s,Q8s,Q7s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,76s,65s,54s,43s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,A4o,A3o,KQo,KJo,KTo,K9o,K8o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o"
  ),
};
