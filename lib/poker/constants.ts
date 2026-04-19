import type { Rank, Suit, Position } from "./types";

export const RANKS: Rank[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A",
];

export const SUITS: Suit[] = ["s", "h", "d", "c"];

export const RANK_VALUE: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
};

// Grid order for range display (high to low, A first)
export const RANGE_GRID_RANKS: Rank[] = [
  "A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2",
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣",
};

export const SUIT_COLORS: Record<Suit, string> = {
  s: "#1a1a1a",
  h: "#dc2626",
  d: "#dc2626",
  c: "#1a1a1a",
};

export const SUIT_COLORS_DARK: Record<Suit, string> = {
  s: "#94a3b8",
  h: "#f87171",
  d: "#fb923c",
  c: "#4ade80",
};

// Positions in order (UTG first)
export const POSITIONS_9MAX: Position[] = [
  "UTG", "UTG+1", "UTG+2", "LJ", "HJ", "CO", "BTN", "SB", "BB",
];

export const POSITIONS_6MAX: Position[] = [
  "UTG", "HJ", "CO", "BTN", "SB", "BB",
];

export const POSITION_COLORS: Record<Position, string> = {
  UTG: "#ef4444",
  "UTG+1": "#f97316",
  "UTG+2": "#f59e0b",
  LJ: "#84cc16",
  HJ: "#22c55e",
  CO: "#06b6d4",
  BTN: "#3b82f6",
  SB: "#8b5cf6",
  BB: "#ec4899",
};

// Hand combo counts
export const PAIR_COMBOS = 6;      // e.g., AA = 6 combos
export const SUITED_COMBOS = 4;    // e.g., AKs = 4 combos
export const OFFSUIT_COMBOS = 12;  // e.g., AKo = 12 combos
