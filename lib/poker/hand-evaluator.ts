import type { Card, HandResult, HandCategory, Rank, Suit } from "./types";
import { RANK_VALUE } from "./constants";

// ============================================================
// Hand Evaluator - 5/7 card best hand detection
// ============================================================

function rankVal(r: Rank): number {
  return RANK_VALUE[r];
}

function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankVal(b.rank) - rankVal(a.rank));
}

function getCombinations(cards: Card[], k: number): Card[][] {
  const result: Card[][] = [];
  function combine(start: number, current: Card[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

function evaluateFive(cards: Card[]): { score: number; category: HandCategory; description: string } {
  const sorted = sortCards(cards);
  const ranks = sorted.map((c) => rankVal(c.rank));
  const suits = sorted.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHighCard = ranks[0];
  if (
    ranks[0] - ranks[4] === 4 &&
    new Set(ranks).size === 5
  ) {
    isStraight = true;
    straightHighCard = ranks[0];
  }
  // Wheel (A-2-3-4-5)
  if (
    ranks[0] === 14 &&
    ranks[1] === 5 &&
    ranks[2] === 4 &&
    ranks[3] === 3 &&
    ranks[4] === 2
  ) {
    isStraight = true;
    straightHighCard = 5;
  }

  // Count rank frequencies
  const freq: Record<number, number> = {};
  ranks.forEach((r) => { freq[r] = (freq[r] || 0) + 1; });
  const freqVals = Object.values(freq).sort((a, b) => b - a);
  const ranksByFreq = Object.entries(freq)
    .sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]))
    .map(([r]) => Number(r));

  // Scoring: higher = better hand
  // Base scores: RF=9, SF=8, Quads=7, FH=6, Flush=5, Straight=4, Trips=3, 2P=2, Pair=1, HC=0
  // Each category encoded as: category * 10^10 + kickers

  function kicker(rankArr: number[], positions = 5): number {
    let score = 0;
    for (let i = 0; i < Math.min(positions, rankArr.length); i++) {
      score += rankArr[i] * Math.pow(15, positions - 1 - i);
    }
    return score;
  }

  if (isFlush && isStraight) {
    const cat: HandCategory = straightHighCard === 14 ? "Royal Flush" : "Straight Flush";
    return {
      score: (cat === "Royal Flush" ? 9 : 8) * 1e10 + straightHighCard,
      category: cat,
      description: cat === "Royal Flush" ? "Royal Flush" : `Straight Flush, ${sorted[0].rank}-high`,
    };
  }
  if (freqVals[0] === 4) {
    return {
      score: 7 * 1e10 + kicker(ranksByFreq),
      category: "Four of a Kind",
      description: `Four of a Kind, ${ranksByFreq[0]}s`,
    };
  }
  if (freqVals[0] === 3 && freqVals[1] === 2) {
    return {
      score: 6 * 1e10 + kicker(ranksByFreq),
      category: "Full House",
      description: `Full House, ${ranksByFreq[0]}s full of ${ranksByFreq[1]}s`,
    };
  }
  if (isFlush) {
    return {
      score: 5 * 1e10 + kicker(ranks),
      category: "Flush",
      description: `Flush, ${sorted[0].rank}-high`,
    };
  }
  if (isStraight) {
    return {
      score: 4 * 1e10 + straightHighCard,
      category: "Straight",
      description: `Straight, ${sorted[0].rank}-high`,
    };
  }
  if (freqVals[0] === 3) {
    return {
      score: 3 * 1e10 + kicker(ranksByFreq),
      category: "Three of a Kind",
      description: `Three of a Kind, ${ranksByFreq[0]}s`,
    };
  }
  if (freqVals[0] === 2 && freqVals[1] === 2) {
    return {
      score: 2 * 1e10 + kicker(ranksByFreq),
      category: "Two Pair",
      description: `Two Pair, ${ranksByFreq[0]}s and ${ranksByFreq[1]}s`,
    };
  }
  if (freqVals[0] === 2) {
    return {
      score: 1 * 1e10 + kicker(ranksByFreq),
      category: "One Pair",
      description: `One Pair, ${ranksByFreq[0]}s`,
    };
  }
  return {
    score: kicker(ranks),
    category: "High Card",
    description: `${sorted[0].rank}-high`,
  };
}

export function evaluateBestHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    throw new Error("Need at least 5 cards");
  }

  const combos = getCombinations(cards, 5);
  let best: { score: number; category: HandCategory; description: string; cards: Card[] } | null = null;

  for (const combo of combos) {
    const result = evaluateFive(combo);
    if (!best || result.score > best.score) {
      best = { ...result, cards: combo };
    }
  }

  return {
    category: best!.category,
    score: best!.score,
    description: best!.description,
    bestFive: best!.cards,
  };
}

// ============================================================
// Equity Calculation (Monte Carlo)
// ============================================================

export function parseCard(str: string): Card {
  const rank = str[0] as Rank;
  const suit = str[1] as Suit;
  return { rank, suit };
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function createDeck(): Card[] {
  const ranks: Rank[] = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  const suits: Suit[] = ["s","h","d","c"];
  const deck: Card[] = [];
  for (const rank of ranks) {
    for (const suit of suits) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface EquityResult {
  heroEquity: number;   // 0-100%
  villainEquity: number;
  ties: number;
  simulations: number;
}

export function calculateEquityMonteCarlo(
  heroCards: [Card, Card],
  villainCards: [Card, Card],
  board: Card[] = [],
  simulations = 5000
): EquityResult {
  const knownCards = new Set([
    ...heroCards.map(cardToString),
    ...villainCards.map(cardToString),
    ...board.map(cardToString),
  ]);

  const deck = createDeck().filter((c) => !knownCards.has(cardToString(c)));
  const boardNeeded = 5 - board.length;

  let heroWins = 0;
  let villainWins = 0;
  let ties = 0;

  for (let i = 0; i < simulations; i++) {
    const shuffled = shuffle(deck);
    const runout = [...board, ...shuffled.slice(0, boardNeeded)];

    const heroHand = evaluateBestHand([...heroCards, ...runout]);
    const villainHand = evaluateBestHand([...villainCards, ...runout]);

    if (heroHand.score > villainHand.score) heroWins++;
    else if (villainHand.score > heroHand.score) villainWins++;
    else ties++;
  }

  return {
    heroEquity: Math.round(((heroWins + ties / 2) / simulations) * 1000) / 10,
    villainEquity: Math.round(((villainWins + ties / 2) / simulations) * 1000) / 10,
    ties: Math.round((ties / simulations) * 1000) / 10,
    simulations,
  };
}
