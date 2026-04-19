// ============================================================
// Core Poker Types
// ============================================================

export type Suit = "s" | "h" | "d" | "c";
export type Rank =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HandCategory =
  | "High Card"
  | "One Pair"
  | "Two Pair"
  | "Three of a Kind"
  | "Straight"
  | "Flush"
  | "Full House"
  | "Four of a Kind"
  | "Straight Flush"
  | "Royal Flush";

export interface HandResult {
  category: HandCategory;
  score: number;
  description: string;
  bestFive: Card[];
}

// ============================================================
// Position Types
// ============================================================

export type Position =
  | "UTG" | "UTG+1" | "UTG+2" | "LJ" | "HJ" | "CO" | "BTN" | "SB" | "BB";

export type TableSize = 2 | 3 | 4 | 5 | 6 | 8 | 9;

export interface PositionInfo {
  name: Position;
  shortName: string;
  order: number; // 0 = UTG, higher = later position
}

// ============================================================
// Range Types
// ============================================================

// A range is a map from combo string (e.g. "AKs", "QQ") to frequency [0,1]
export type RangeMap = Record<string, number>;

export interface RangeCombo {
  hand: string; // e.g. "AKs", "TT", "A5o"
  suited: boolean;
  offsuit: boolean;
  pair: boolean;
  frequency: number;
  combos: number; // total combos in deck: pairs=6, suited=4, offsuit=12
}

// ============================================================
// Action Types
// ============================================================

export type ActionType =
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise"
  | "all-in"
  | "post";

export interface Action {
  playerId: string;
  position: Position;
  action: ActionType;
  amount?: number;
  isAllIn?: boolean;
}

// ============================================================
// Street Types
// ============================================================

export type Street = "preflop" | "flop" | "turn" | "river";

export interface StreetState {
  street: Street;
  board: Card[];
  actions: Action[];
  pot: number;
}

// ============================================================
// Player Types
// ============================================================

export interface Player {
  id: string;
  name: string;
  position: Position;
  stack: number;
  holeCards?: [Card, Card];
  isHero: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  betAmount: number;
  seatIndex: number;
}

// ============================================================
// Hand History Types
// ============================================================

export interface HandHistory {
  id: string;
  format: TournamentFormat;
  blinds: { sb: number; bb: number; ante?: number };
  effectiveStack: number; // in BBs
  players: Player[];
  streets: StreetState[];
  result?: HandResult;
  heroCards?: [Card, Card];
  heroPosition: Position;
  notes?: string;
  tags?: string[];
}

// ============================================================
// Tournament / Format Types
// ============================================================

export type TournamentFormat = "MTT" | "Cash" | "Satellite" | "SpinGo" | "HU";

export interface MTTContext {
  format: TournamentFormat;
  stackDepthBB: number;
  position: Position;
  tableSize: TableSize;
  payoutStructure?: PayoutStructure;
  playersRemaining?: number;
  totalPlayers?: number;
  blindLevel: number;
}

export interface PayoutStructure {
  totalPrize: number;
  payouts: { place: number; amount: number }[];
}

// ============================================================
// ICM Types
// ============================================================

export interface ICMInput {
  stacks: number[];
  payouts: number[];
}

export interface ICMResult {
  equities: number[]; // dollar equity for each player
  chipEvDiff: number; // how much $ you gain/lose vs chip EV
}

// ============================================================
// Spot Library Types
// ============================================================

export type SpotCategory =
  | "push-fold"
  | "open-raise"
  | "3bet"
  | "4bet"
  | "vs-squeeze"
  | "blind-vs-blind"
  | "cbet-flop"
  | "cbet-turn"
  | "check-raise";

export interface Spot {
  id: string;
  name: string;
  description: string;
  format: TournamentFormat;
  category: SpotCategory;
  stackDepthBB: number;
  position: Position;
  villainPosition?: Position;
  context?: Partial<MTTContext>;
  heroRange: RangeMap;
  gtoAction: ActionType;
  gtoFrequency?: number; // mixed strategy frequency
  explanation: string;
  tags: string[];
}

// ============================================================
// Quiz / Training Types
// ============================================================

export interface QuizQuestion {
  id: string;
  spot: Spot;
  heroHand: string; // e.g. "AKs"
  correctAction: ActionType;
  correctFrequency?: number;
  explanation: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: { questionId: string; action: ActionType; correct: boolean }[];
  score: number;
}

// ============================================================
// Push/Fold Chart Types
// ============================================================

export interface PushFoldChart {
  format: TournamentFormat;
  position: Position;
  tableSize: TableSize;
  stackBB: number;
  pushRange: RangeMap;
  callRange?: RangeMap;
}
