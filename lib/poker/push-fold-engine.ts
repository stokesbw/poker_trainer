import type { Position, TableSize, RangeMap } from "./types";
import { parseRangeString } from "./range-utils";

// ============================================================
// Push/Fold Engine
// GTO-approximated push ranges by stack depth (in BBs) and position
// Ranges derived from Nash equilibrium / ICM solver outputs
// ============================================================

export interface PushFoldEntry {
  position: Position;
  stackBB: number;
  pushRange: RangeMap;
  callRange?: RangeMap;
}

// ============================================================
// Push Ranges (9-max, ante tournaments)
// Ranges tighten based on position and stack depth
// ============================================================

const PUSH_RANGES_9MAX: Record<Position, Record<number, string>> = {
  // Stacks: 3bb, 5bb, 7bb, 10bb, 12bb, 15bb
  BTN: {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,QJs,QTs,Q9s,Q8s,Q7s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,76s,65s,54s,43s,32s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,KQo,KJo,KTo,K9o,K8o,K7o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o,65o",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,K7s,QJs,QTs,Q9s,Q8s,JTs,J9s,J8s,T9s,T8s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,KQo,KJo,KTo,K9o,K8o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,KTo,K9o,QJo,QTo,JTo,T9o,98o,87o",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,KTo,QJo,JTo,T9o",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,A4o,KQo,KJo,KTo,QJo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,KQo,KJo,QJo",
    20: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A8s,A5s,A4s,KQs,KJs,KTs,QJs,JTs,T9s,98s,AKo,AQo,AJo,ATo,KQo,KJo",
  },
  CO: {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,KQo,KJo,KTo,K9o,QJo,QTo,JTo,T9o,98o,87o",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,J9s,T9s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,KQo,KJo,KTo,QJo,JTo,T9o,98o",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,KTo,QJo,JTo,T9o",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,A4o,KQo,KJo,QJo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,A3s,KQs,KJs,KTs,QJs,JTs,T9s,98s,87s,AKo,AQo,AJo,ATo,A9o,A8o,A6o,A5o,KQo,KJo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,JTs,T9s,98s,AKo,AQo,AJo,ATo,A9o,A7o,A5o,KQo",
    20: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A9s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,KQo",
  },
  HJ: {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,QJo,JTo,T9o",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,QJs,JTs,T9s,98s,87s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,JTo",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,KTs,QJs,JTs,T9s,98s,AKo,AQo,AJo,ATo,A9o,A8o,A6o,A5o,KQo,KJo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,QJs,JTs,T9s,AKo,AQo,AJo,ATo,A9o,A7o,A5o,KQo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A8s,A5s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,ATo,A8o,A5o,KQo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,ATo,KQo",
    20: "AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,KQs,AKo,AQo,AJo",
  },
  LJ: {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,QJs,JTs,T9s,AKo,AQo,AJo,ATo,A9o,A7o,A5o,KQo,KJo",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,ATo,A8o,A5o,KQo",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,ATo,A7o,A5o,KQo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,ATo,KQo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A8s,A5s,KQs,QJs,AKo,AQo,AJo,KQo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,KQs,AKo,AQo,AJo",
    20: "AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,KQs,AKo,AQo",
  },
  "UTG+2": {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A5s,KQs,KJs,QJs,JTs,T9s,AKo,AQo,AJo,ATo,A8o,KQo",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,ATo,KQo",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A5s,KQs,KJs,AKo,AQo,AJo,KQo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A5s,KQs,AKo,AQo,AJo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,KQs,AKo,AQo,AJo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,KQs,AKo,AQo",
    20: "AA,KK,QQ,JJ,TT,99,AKs,AQs,AKo",
  },
  "UTG+1": {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A5s,KQs,JTs,AKo,AQo,AJo,ATo,KQo",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A5s,KQs,JTs,AKo,AQo,AJo,KQo",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A5s,KQs,AKo,AQo,AJo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,KQs,AKo,AQo,AJo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,KQs,AKo,AQo",
    15: "AA,KK,QQ,JJ,TT,99,88,AKs,AQs,KQs,AKo",
    20: "AA,KK,QQ,JJ,TT,99,AKs,AQs,AKo",
  },
  UTG: {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A5s,KQs,AKo,AQo,AJo,KQo",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A5s,KQs,AKo,AQo,AJo",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,KQs,AKo,AQo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,KQs,AKo,AQo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AKo",
    15: "AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AKo",
    20: "AA,KK,QQ,JJ,TT,99,AKs,AKo",
  },
  SB: {
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,KQo,KJo,KTo,K9o,QJo,QTo,JTo,T9o,98o,87o",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,J9s,T9s,98s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,KQo,KJo,KTo,QJo,JTo,T9o,98o",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,KTo,QJo,JTo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,QJs,JTs,T9s,98s,87s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,A4o,KQo,KJo,JTo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,KQs,KJs,QJs,JTs,T9s,98s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,KQo,KJo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,JTs,T9s,AKo,AQo,AJo,ATo,A9o,A8o,A6o,A5o,KQo",
    20: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A8s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,ATo,A8o,A5o,KQo",
  },
  BB: {
    // BB calling ranges vs shove
    3: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,KQo,KJo,KTo",
    5: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,QJs,JTs,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo",
    7: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,AKs,AQs,AJs,ATs,A9s,A8s,A5s,KQs,KJs,JTs,AKo,AQo,AJo,ATo,A9o,KQo",
    10: "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A5s,KQs,KJs,AKo,AQo,AJo,ATo,KQo",
    12: "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,KQs,AKo,AQo,AJo,KQo",
    15: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,KQs,AKo,AQo,AJo",
    20: "AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AKo,AQo",
  },
};

export const STACK_BREAKPOINTS = [3, 5, 7, 10, 12, 15, 20];

/**
 * Get the closest push/fold range for a given stack depth
 */
export function getPushRange(position: Position, stackBB: number): RangeMap {
  const posRanges = PUSH_RANGES_9MAX[position];
  if (!posRanges) return {};

  // Find closest breakpoint
  const breakpoints = Object.keys(posRanges)
    .map(Number)
    .sort((a, b) => a - b);

  let closest = breakpoints[0];
  for (const bp of breakpoints) {
    if (stackBB >= bp) closest = bp;
    else break;
  }

  return parseRangeString(posRanges[closest]);
}

/**
 * Is the given hand a push from this position/stack?
 */
export function isPushHand(hand: string, position: Position, stackBB: number): boolean {
  const range = getPushRange(position, stackBB);
  return (range[hand] ?? 0) > 0;
}

/**
 * Get a recommended action for push/fold spot
 */
export function getPushFoldRecommendation(
  hand: string,
  position: Position,
  stackBB: number
): { action: "push" | "fold"; range: RangeMap; inRange: boolean } {
  const range = getPushRange(position, stackBB);
  const inRange = isPushHand(hand, position, stackBB);
  return {
    action: inRange ? "push" : "fold",
    range,
    inRange,
  };
}
