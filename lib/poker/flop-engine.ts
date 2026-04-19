import type { Card, Rank } from "./types";
import { RANK_VALUE } from "./constants";

// ============================================================
// Flop Texture Analysis Engine
// ============================================================

export type BoardTexture =
  | "dry-rainbow"
  | "dry-two-tone"
  | "wet-two-tone"
  | "wet-rainbow"
  | "monotone"
  | "paired-dry"
  | "paired-wet"
  | "trips";

export type ConnectednessLevel = "disconnected" | "semi-connected" | "connected" | "very-connected";

export interface FlopAnalysis {
  texture: BoardTexture;
  connectedness: ConnectednessLevel;
  highCard: Rank;
  isBroadway: boolean;         // Has a J/Q/K/A
  isLowBoard: boolean;         // All cards 8 or below
  isPaired: boolean;
  isTrips: boolean;
  isMonotone: boolean;
  isTwoTone: boolean;
  hasFlushDraw: boolean;
  hasStraightDraw: boolean;
  hasOpenEndedDraw: boolean;
  suitCount: number;
  gapSize: number;             // Max gap between adjacent cards
  rangeAdvantage: "ip" | "oop" | "neutral"; // Who benefits more
  cbetFrequency: number;       // 0-100, recommended c-bet frequency
  cbetSizing: string;          // e.g. "25-33%", "50-67%", "75%+"
  cbetSizingRatio: number;     // as a fraction of pot (0.33, 0.5, 0.75)
  description: string;
  tips: string[];
}

export interface CbetRecommendation {
  action: "bet" | "check";
  frequency: number;        // 0-100%
  sizing: string;
  reasoning: string;
  strength: "strong" | "medium" | "weak" | "bluff";
}

function rankV(r: Rank): number { return RANK_VALUE[r]; }

export function analyzeFlop(board: Card[]): FlopAnalysis {
  if (board.length < 3) throw new Error("Need 3 cards for flop analysis");
  const [c1, c2, c3] = board.slice(0, 3);

  const ranks = [c1, c2, c3].map(c => c.rank).sort((a, b) => rankV(b) - rankV(a));
  const suits = [c1.suit, c2.suit, c3.suit];
  const suitSet = new Set(suits);
  const suitCount = suitSet.size;

  const rankVals = ranks.map(rankV).sort((a, b) => b - a);

  const isPaired = ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2];
  const isTrips = ranks[0] === ranks[1] && ranks[1] === ranks[2];
  const isMonotone = suitCount === 1;
  const isTwoTone = suitCount === 2;
  const hasFlushDraw = isMonotone || isTwoTone;

  // Connectedness: look at gaps between sorted rank values
  const gaps = [
    Math.abs(rankVals[0] - rankVals[1]),
    Math.abs(rankVals[1] - rankVals[2]),
  ];
  const maxGap = Math.max(...gaps);
  const totalSpan = rankVals[0] - rankVals[2];

  // Check for straight possibilities
  // Cards within a 4-card window can make a straight
  const hasOpenEndedDraw = totalSpan <= 4 && !isPaired;
  const hasStraightDraw = totalSpan <= 5 || (rankVals[0] === 14 && totalSpan <= 6);

  let connectedness: ConnectednessLevel;
  if (maxGap <= 1 && totalSpan <= 4) connectedness = "very-connected";
  else if (totalSpan <= 5) connectedness = "connected";
  else if (maxGap <= 3) connectedness = "semi-connected";
  else connectedness = "disconnected";

  const highCard = ranks[0];
  const isBroadway = rankV(highCard) >= 11; // J or higher
  const isLowBoard = rankVals[0] <= 8;

  // Determine texture
  let texture: BoardTexture;
  if (isTrips) texture = "trips";
  else if (isPaired) {
    texture = (isMonotone || isTwoTone) ? "paired-wet" : "paired-dry";
  } else if (isMonotone) texture = "monotone";
  else if (connectedness === "very-connected" || connectedness === "connected") {
    texture = isTwoTone ? "wet-two-tone" : "wet-rainbow";
  } else {
    texture = isTwoTone ? "dry-two-tone" : "dry-rainbow";
  }

  // Range advantage assessment
  // IP (in-position, preflop raiser) favors: high boards, dry boards, paired boards
  // OOP (BB) favors: low connected boards, two-pair boards
  let rangeAdvantage: "ip" | "oop" | "neutral";
  if (isPaired || (isBroadway && connectedness === "disconnected") || isLowBoard === false && connectedness !== "very-connected") {
    rangeAdvantage = "ip";
  } else if (isLowBoard && (connectedness === "connected" || connectedness === "very-connected")) {
    rangeAdvantage = "oop";
  } else {
    rangeAdvantage = "neutral";
  }

  // C-bet frequency and sizing based on texture
  let cbetFrequency: number;
  let cbetSizing: string;
  let cbetSizingRatio: number;

  if (texture === "dry-rainbow" && rangeAdvantage === "ip") {
    cbetFrequency = 85;
    cbetSizing = "25-33%";
    cbetSizingRatio = 0.30;
  } else if (texture === "dry-two-tone" && isBroadway) {
    cbetFrequency = 75;
    cbetSizing = "25-40%";
    cbetSizingRatio = 0.33;
  } else if (texture === "paired-dry") {
    cbetFrequency = 80;
    cbetSizing = "25-33%";
    cbetSizingRatio = 0.30;
  } else if (texture === "paired-wet") {
    cbetFrequency = 65;
    cbetSizing = "33-50%";
    cbetSizingRatio = 0.40;
  } else if (texture === "wet-two-tone") {
    cbetFrequency = 50;
    cbetSizing = "50-67%";
    cbetSizingRatio = 0.60;
  } else if (texture === "wet-rainbow" && connectedness === "very-connected") {
    cbetFrequency = 45;
    cbetSizing = "50-67%";
    cbetSizingRatio = 0.55;
  } else if (texture === "monotone") {
    cbetFrequency = 35;
    cbetSizing = "33-50%";
    cbetSizingRatio = 0.40;
  } else if (texture === "trips") {
    cbetFrequency = 70;
    cbetSizing = "25-33%";
    cbetSizingRatio = 0.30;
  } else {
    cbetFrequency = 60;
    cbetSizing = "33-50%";
    cbetSizingRatio = 0.40;
  }

  const description = buildDescription(texture, ranks, suitCount, connectedness);
  const tips = buildTips(texture, rangeAdvantage, cbetFrequency, connectedness, isLowBoard, isBroadway);

  return {
    texture,
    connectedness,
    highCard,
    isBroadway,
    isLowBoard,
    isPaired,
    isTrips,
    isMonotone,
    isTwoTone,
    hasFlushDraw,
    hasStraightDraw,
    hasOpenEndedDraw,
    suitCount,
    gapSize: maxGap,
    rangeAdvantage,
    cbetFrequency,
    cbetSizing,
    cbetSizingRatio,
    description,
    tips,
  };
}

function buildDescription(texture: BoardTexture, ranks: Rank[], suitCount: number, conn: ConnectednessLevel): string {
  const parts = [];
  const highCard = ranks[0];
  const suitDesc = suitCount === 1 ? "monotone" : suitCount === 2 ? "two-tone" : "rainbow";

  switch (texture) {
    case "dry-rainbow": parts.push(`Dry rainbow board (${highCard}-high)`); break;
    case "dry-two-tone": parts.push(`Dry two-tone board (${highCard}-high)`); break;
    case "wet-two-tone": parts.push(`Wet two-tone board (${highCard}-high, straight + flush draws)`); break;
    case "wet-rainbow": parts.push(`Wet rainbow board (connected, ${highCard}-high)`); break;
    case "monotone": parts.push(`Monotone board (all same suit, ${highCard}-high)`); break;
    case "paired-dry": parts.push(`Paired dry board (${highCard}-high)`); break;
    case "paired-wet": parts.push(`Paired wet board (${highCard}-high)`); break;
    case "trips": parts.push(`Trips on board (${highCard}-high)`); break;
  }

  if (conn === "very-connected") parts.push("Very connected — many straight possibilities");
  if (conn === "connected") parts.push("Connected board — straight draws present");

  return parts.join(". ");
}

function buildTips(
  texture: BoardTexture,
  advantage: string,
  freq: number,
  conn: ConnectednessLevel,
  isLow: boolean,
  isBroadway: boolean
): string[] {
  const tips: string[] = [];

  if (advantage === "ip") tips.push("Range advantage for IP player (preflop raiser) — bet frequently at small sizing");
  if (advantage === "oop") tips.push("Range advantage for OOP player (BB) — IP should bet more selectively");

  switch (texture) {
    case "dry-rainbow":
      tips.push("Use small sizing (25-33% pot) with high frequency — villain can't draw");
      tips.push("Even weak holdings (backdoor draws) can profitably c-bet on this texture");
      break;
    case "dry-two-tone":
      tips.push("Two-tone boards have one flush draw — size up slightly vs rainbow to charge it");
      tips.push("Top pair+ and all draws are clear bets; medium pairs can check back");
      break;
    case "wet-two-tone":
      tips.push("Many draws available — use larger sizing (50%+ pot) to charge equity");
      tips.push("Polarize your range: bet your strongest hands and best draws, check medium holdings");
      tips.push("This board favors villain's BB range — don't auto-c-bet your entire range");
      break;
    case "monotone":
      tips.push("Monotone boards reduce your c-betting frequency significantly");
      tips.push("Without the flush, your equity is limited. Bet when you have the flush or a strong hand");
      tips.push("Many players over-bet on monotone boards with non-flush hands — this is a leak");
      break;
    case "paired-dry":
      tips.push("Paired boards heavily favor the preflop raiser who has most full houses/trips");
      tips.push("Small size (25-33%) with high frequency — villain rarely has trips");
      break;
    case "paired-wet":
      tips.push("Paired + flush draw is tricky — villain has more draws to go with pairs");
      tips.push("Selectively bet your best hands; check draws that will improve on a blank turn");
      break;
    case "trips":
      tips.push("Trips on board — most of the effective hand values are the kicker");
      tips.push("The board is very draw-light; small bet or check-then-bet is common");
      break;
    case "wet-rainbow":
      tips.push("Rainbow reduces flush draws but straight draws remain — use medium sizing");
      tips.push("Connected boards give BB many strong hands from their wide defending range");
      break;
  }

  if (isLow) tips.push("Low boards (8 or below) hit the BB's defending range harder — be selective");
  if (isBroadway) tips.push("Broadway boards favor UTG/CO/BTN openers who hold more Ace-King high hands");

  return tips;
}

// ============================================================
// Get c-bet recommendation for a specific hand + board
// ============================================================

export function getCbetRecommendation(
  handLabel: string, // e.g. "AKs", "99"
  analysis: FlopAnalysis,
  position: "ip" | "oop"
): CbetRecommendation {
  // Simple heuristic-based recommendation
  const rank1 = handLabel[0];
  const rank2 = handLabel[1];
  const suited = handLabel.endsWith("s");
  const isPair = rank1 === rank2;
  const highCardVal = RANK_VALUE[rank1 as Rank] ?? 0;
  const lowCardVal = RANK_VALUE[(rank2.replace("s","").replace("o","")) as Rank] ?? 0;

  const highBoardVal = RANK_VALUE[analysis.highCard];

  // Over-pair
  if (isPair && highCardVal > highBoardVal) {
    return { action: "bet", frequency: 90, sizing: analysis.cbetSizing, strength: "strong",
      reasoning: `Over-pair (${handLabel}) on this board — strong value bet. Use ${analysis.cbetSizing} sizing.` };
  }

  // Top pair (estimated)
  if (!isPair && (highCardVal === highBoardVal || lowCardVal === highBoardVal)) {
    return { action: "bet", frequency: 80, sizing: analysis.cbetSizing, strength: "strong",
      reasoning: `Top pair — c-bet for value at ${analysis.cbetSizing}. Extract value while protecting your hand.` };
  }

  // Premium pocket pair below board - may still bet
  if (isPair && highCardVal >= 9 && highCardVal < highBoardVal) {
    const check = analysis.texture === "wet-two-tone" || analysis.texture === "monotone";
    return {
      action: check ? "check" : "bet",
      frequency: check ? 30 : 65,
      sizing: analysis.cbetSizing,
      strength: "medium",
      reasoning: check
        ? `Medium pair (${handLabel}) on a draw-heavy board — check to control pot size`
        : `Medium over-pair with showdown value — bet at ${analysis.cbetSizing} to deny equity`,
    };
  }

  // Draw (suited connectors on wet board)
  if (suited && analysis.hasFlushDraw) {
    return { action: "bet", frequency: 75, sizing: analysis.cbetSizing, strength: "bluff",
      reasoning: `Suited hand on ${analysis.isTwoTone ? "two-tone" : "monotone"} board — bet draw as bluff with equity. ${analysis.cbetSizing} sizing.` };
  }

  // Ace-high with backdoor potential
  if (rank1 === "A" || rank2 === "A") {
    const freq = analysis.cbetFrequency * 0.8;
    return { action: "bet", frequency: freq, sizing: analysis.cbetSizing, strength: "bluff",
      reasoning: `Ace-high with potential overcards + backdoor equity — c-bet at ${analysis.cbetSizing} to fold out weak pairs.` };
  }

  // Default: check
  return { action: "check", frequency: 100, sizing: "", strength: "weak",
    reasoning: `Weak holding — check to protect range and avoid building pot in bad spots. Look to check-raise with strong hands or fold to aggression.` };
}

// ============================================================
// Random board generator
// ============================================================

export function generateRandomFlop(texture?: BoardTexture): Card[] {
  const ranks = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"] as Rank[];
  const suits = ["s","h","d","c"] as const;

  function randomCard(used: Set<string>): Card {
    let card: Card;
    do {
      card = { rank: ranks[Math.floor(Math.random() * ranks.length)], suit: suits[Math.floor(Math.random() * 4)] };
    } while (used.has(`${card.rank}${card.suit}`));
    used.add(`${card.rank}${card.suit}`);
    return card;
  }

  const used = new Set<string>();

  if (!texture) {
    return [randomCard(used), randomCard(used), randomCard(used)];
  }

  // Generate board that matches requested texture (approximate)
  let attempts = 0;
  while (attempts < 100) {
    const used2 = new Set<string>();
    const board = [randomCard(used2), randomCard(used2), randomCard(used2)];
    try {
      const analysis = analyzeFlop(board);
      if (analysis.texture === texture) return board;
    } catch {}
    attempts++;
  }

  // Fallback
  return [randomCard(new Set()), randomCard(new Set()), randomCard(new Set())];
}
