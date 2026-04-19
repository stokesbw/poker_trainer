import type { Spot, RangeMap, Position, ActionType } from "./types";
import { parseRangeString } from "./range-utils";
import { RANK_VALUE } from "./constants";
import type { Rank } from "./types";

// ============================================================
// Action Frequency Engine
// For any hand + spot, returns fold/call/raise frequencies
// ============================================================

export interface ActionFrequency {
  action: ActionType | "check";
  label: string;        // Display label e.g. "Raise (3-bet)", "Call", "Fold"
  frequency: number;    // 0-100
  sizing?: string;      // e.g. "2.5x", "All-in", "33% pot"
  color: string;        // Tailwind color class
  ev?: string;          // Optional EV note
}

export interface HandActionBreakdown {
  hand: string;
  position: string;
  spotName: string;
  actions: ActionFrequency[];
  primaryAction: ActionType | "check";
  notes: string;
  isInRange: boolean;
}

// ============================================================
// Calling ranges by spot category + position
// These are the flat-call / defense ranges that complement
// the 3-bet/raise ranges already defined in spots
// ============================================================

const FLAT_CALL_RANGES: Partial<Record<string, string>> = {
  // BTN flat-call vs CO open (hands that call instead of 3-bet)
  "3bet-btn-vs-co-25bb": "TT,99,88,ATs,A9s,KQs,KJs,QTs,JTs,T9s,98s,ATo,KQo",
  // BB flat-call vs BTN (hands BB calls instead of 3-bet)
  "3bet-bb-vs-btn-25bb": "TT,99,88,77,66,ATs,A9s,A8s,A7s,A6s,KTs,K9s,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,ATo,KJo,KTo,QJo",
  // 4-bet call ranges
  "4bet-btn-vs-bb-3bet-25bb": "TT,99,AQs,AJs,KQs,AQo",
  "4bet-utg-vs-btn-3bet-30bb": "JJ,TT,AQs,AJs,AKo",
  // Open raise: some hands are limp/complete in SB
  "open-btn-25bb": "",  // pure raise range, no limping
  "bvb-sb-complete-25bb": "33,22,K4s,K3s,K2s,Q6s,Q5s,Q4s,J7s,J6s,T6s,T5s,95s,85s,75s,64s,53s,42s",
};

// Calling ranges for open raises (villain's perspective) - not used here
// but useful for future "vs open" perspective

// ============================================================
// Bet sizing labels by spot category
// ============================================================

const SIZING_BY_CATEGORY: Record<string, { raise: string; call: string }> = {
  "push-fold": { raise: "All-in", call: "" },
  "open-raise": { raise: "2.2-2.5x", call: "Call / Complete" },
  "3bet": { raise: "3-Bet (~3x)", call: "Flat call" },
  "4bet": { raise: "4-Bet / Shove", call: "Call 3-bet" },
  "vs-squeeze": { raise: "Squeeze (3-4x)", call: "Flat call" },
  "blind-vs-blind": { raise: "Raise (3x)", call: "Complete" },
  "cbet-flop": { raise: "Bet (33-67% pot)", call: "" },
  "cbet-turn": { raise: "Bet (50-75% pot)", call: "" },
  "check-raise": { raise: "Check-Raise (3x)", call: "Check-Call" },
};

const ACTION_LABELS: Record<string, { raise: string; call: string; fold: string }> = {
  "push-fold": { raise: "Shove All-In", call: "—", fold: "Fold" },
  "open-raise": { raise: "Open Raise", call: "Limp / Complete", fold: "Fold" },
  "3bet": { raise: "3-Bet", call: "Flat Call", fold: "Fold" },
  "4bet": { raise: "4-Bet", call: "Call 3-Bet", fold: "Fold" },
  "vs-squeeze": { raise: "Squeeze", call: "Flat Call", fold: "Fold" },
  "blind-vs-blind": { raise: "Raise", call: "Complete BB", fold: "Fold" },
  "cbet-flop": { raise: "Bet", call: "—", fold: "Check" },
  "cbet-turn": { raise: "Bet", call: "—", fold: "Check" },
  "check-raise": { raise: "Check-Raise", call: "Check-Call", fold: "Check-Fold" },
};

// ============================================================
// Main function: get action breakdown for a hand + spot
// ============================================================

export function getHandActionBreakdown(
  hand: string,
  spot: Spot
): HandActionBreakdown {
  const raiseFreq = (spot.heroRange[hand] ?? 0) * 100;
  const callRangeStr = FLAT_CALL_RANGES[spot.id];
  const callRange: RangeMap = callRangeStr ? parseRangeString(callRangeStr) : {};
  const callFreq = (callRange[hand] ?? 0) * 100;

  // For mixed-strategy hands (frequency between 0 and 1)
  const adjustedRaiseFreq = raiseFreq;
  const adjustedCallFreq = callFreq > 0 && raiseFreq === 0 ? callFreq : callFreq;

  const foldFreq = Math.max(0, 100 - adjustedRaiseFreq - adjustedCallFreq);

  const labels = ACTION_LABELS[spot.category] ?? { raise: "Raise", call: "Call", fold: "Fold" };
  const sizings = SIZING_BY_CATEGORY[spot.category] ?? { raise: "", call: "" };

  const actions: ActionFrequency[] = [];

  // Always add raise/primary action
  if (adjustedRaiseFreq > 0 || (adjustedCallFreq === 0 && foldFreq < 100)) {
    actions.push({
      action: spot.gtoAction,
      label: labels.raise,
      frequency: Math.round(adjustedRaiseFreq),
      sizing: sizings.raise || undefined,
      color: "green",
    });
  }

  // Add call if there's a calling range
  if (callRangeStr !== undefined && callRangeStr !== "") {
    actions.push({
      action: "call",
      label: labels.call,
      frequency: Math.round(adjustedCallFreq),
      sizing: sizings.call || undefined,
      color: "blue",
    });
  }

  // Always add fold
  actions.push({
    action: "fold",
    label: labels.fold,
    frequency: Math.round(foldFreq),
    color: "red",
  });

  const isInRange = raiseFreq > 0 || callFreq > 0;
  const primaryAction = raiseFreq > 0 ? spot.gtoAction : callFreq > 0 ? "call" : "fold";

  // Build contextual notes
  const notes = buildNotes(hand, spot, raiseFreq, callFreq, foldFreq);

  return {
    hand,
    position: spot.position,
    spotName: spot.name,
    actions,
    primaryAction,
    notes,
    isInRange,
  };
}

// ============================================================
// Push/fold specific breakdown (used on trainer page)
// ============================================================

export function getPushFoldBreakdown(
  hand: string,
  position: Position,
  stackBB: number,
  pushRange: RangeMap
): HandActionBreakdown {
  const freq = (pushRange[hand] ?? 0) * 100;
  const isMixed = freq > 0 && freq < 100;

  return {
    hand,
    position,
    spotName: `${position} Push/Fold @ ${stackBB}BB`,
    isInRange: freq > 0,
    primaryAction: freq > 0 ? "all-in" : "fold",
    actions: [
      {
        action: "all-in",
        label: "Shove All-In",
        frequency: Math.round(freq),
        sizing: "All-in",
        color: "green",
        ev: freq === 100 ? "Clear shove" : freq > 50 ? "Slight edge to shove" : undefined,
      },
      {
        action: "fold",
        label: "Fold",
        frequency: Math.round(100 - freq),
        color: "red",
        ev: freq === 0 ? "Clear fold" : freq < 50 ? "Slight edge to fold" : undefined,
      },
    ],
    notes: buildPushFoldNotes(hand, position, stackBB, freq),
  };
}

// ============================================================
// Note builders
// ============================================================

function buildNotes(
  hand: string,
  spot: Spot,
  raiseFreq: number,
  callFreq: number,
  foldFreq: number
): string {
  const rank1 = hand[0];
  const rank2 = hand[1]?.replace("s","").replace("o","");
  const suited = hand.endsWith("s");
  const isPair = rank1 === rank2;

  if (raiseFreq === 100) {
    if (spot.category === "push-fold") return `${hand} is a clear shove from ${spot.position} at ${spot.stackDepthBB}BB. Strong enough to push profitably vs any calling range.`;
    if (spot.category === "3bet") return `${hand} is a pure 3-bet. ${suited ? "Suited hands have better equity when called." : "Strong blocking value against villain's continuing range."}`;
    if (spot.category === "open-raise") return `${hand} is a standard open from ${spot.position}. Raise to 2.2-2.5x in position, 2.5-3x from early position.`;
    return `${hand} is a pure ${spot.gtoAction} at ${spot.stackDepthBB}BB from ${spot.position}.`;
  }

  if (raiseFreq === 0 && callFreq === 0) {
    if (spot.category === "push-fold") return `${hand} is a clear fold from ${spot.position} at ${spot.stackDepthBB}BB. Not enough equity vs calling ranges.`;
    return `${hand} is not in the ${spot.gtoAction} or call range for this spot. Fold and move on.`;
  }

  if (raiseFreq > 0 && raiseFreq < 100) {
    return `${hand} is played at a mixed frequency (${Math.round(raiseFreq)}% ${spot.gtoAction}, ${Math.round(100 - raiseFreq)}% fold). This hand is on the borderline of the range — in practice, lean toward ${raiseFreq > 50 ? spot.gtoAction : "fold"}.`;
  }

  if (callFreq === 100) {
    return `${hand} is a flat call in this spot. ${isPair ? "Medium pairs play better as a flat call to keep villain's bluffs in." : suited ? "Suited hands have good implied odds when flat-calling." : "This hand isn't strong enough to raise for value but too strong to fold."}`;
  }

  return `${hand} has a mixed strategy in this spot.`;
}

function buildPushFoldNotes(
  hand: string,
  position: Position,
  stackBB: number,
  freq: number
): string {
  if (freq === 100) {
    if (stackBB <= 7) return `${hand} is a clear shove — at ${stackBB}BB you should be shoving almost any reasonable hand from ${position}. Fold equity + pot odds make this strongly +EV.`;
    return `${hand} is in the GTO push range from ${position} at ${stackBB}BB. Shoving here is profitable even vs a tight calling range.`;
  }
  if (freq === 0) {
    if (hand.startsWith("A") || hand.startsWith("K")) return `${hand} is a fold from ${position} at ${stackBB}BB. The offsuit / low kicker version of this hand doesn't have enough equity vs the calling range to make shoving profitable.`;
    return `${hand} is a fold from ${position} at ${stackBB}BB. Not enough equity or fold equity to shove profitably here. Wait for a better spot.`;
  }
  return `${hand} is on the boundary of the push range from ${position} at ${stackBB}BB. Mixed strategy — slight lean toward ${freq > 50 ? "shove" : "fold"}.`;
}
