import type { HandHistory, Player, StreetState, Action, ActionType, Position, Card } from "./types";

// ============================================================
// Hand History Parser
// Supports PokerStars and GGPoker text formats
// ============================================================

type ParsedSeat = { seatNum: number; name: string; chips: number };

const RANK_MAP: Record<string, string> = {
  "2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
  "T":"T","J":"J","Q":"Q","K":"K","A":"A",
};
const SUIT_MAP: Record<string, string> = { s:"s", h:"h", d:"d", c:"c" };

function parseCardStr(s: string): Card | null {
  if (!s || s.length < 2) return null;
  const rank = RANK_MAP[s[0].toUpperCase()];
  const suit = SUIT_MAP[s[1].toLowerCase()];
  if (!rank || !suit) return null;
  return { rank: rank as Card["rank"], suit: suit as Card["suit"] };
}

function parseCards(str: string): Card[] {
  const tokens = str.trim().split(/\s+/);
  return tokens.map(parseCardStr).filter(Boolean) as Card[];
}

function detectFormat(text: string): "pokerstars" | "ggpoker" | "unknown" {
  if (text.includes("PokerStars Hand #") || text.includes("PokerStars Game #")) return "pokerstars";
  if (text.includes("GGPoker Hand #") || text.includes("Poker Hand #")) return "ggpoker";
  return "unknown";
}

// ============================================================
// PokerStars Parser
// ============================================================

function parsePokerStars(text: string): HandHistory | null {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);

  // Hand ID and blinds from header
  const headerLine = lines[0];
  const blindMatch = headerLine.match(/\((\d+)\/(\d+)(?:\/(\d+))?\s+(?:No Limit Hold'em|NL Hold'em|Hold'em No Limit)/i);
  const sbVal = blindMatch ? parseInt(blindMatch[1]) : 10;
  const bbVal = blindMatch ? parseInt(blindMatch[2]) : 20;
  const anteVal = blindMatch?.[3] ? parseInt(blindMatch[3]) : undefined;

  const isTourney = headerLine.toLowerCase().includes("tournament") || headerLine.includes("T#");
  const format = isTourney ? "MTT" : "Cash";

  // Parse seats
  const seats: ParsedSeat[] = [];
  const seatRegex = /^Seat (\d+): (.+?) \((\d+(?:,\d+)*) in chips\)/;
  for (const line of lines) {
    const m = line.match(seatRegex);
    if (m) {
      seats.push({
        seatNum: parseInt(m[1]),
        name: m[2].trim(),
        chips: parseInt(m[3].replace(/,/g, "")),
      });
    }
  }

  if (seats.length < 2) return null;

  // Find dealer button position
  const btnMatch = text.match(/Seat #?(\d+) is the button/i);
  const btnSeat = btnMatch ? parseInt(btnMatch[1]) : seats[seats.length - 1].seatNum;

  // Determine positions based on dealer button
  const positionOrder = assignPositions(seats, btnSeat);

  // Find hero (player with hole cards shown)
  const holeCardMatch = text.match(/Dealt to (.+?) \[([^\]]+)\]/);
  const heroName = holeCardMatch ? holeCardMatch[1].trim() : seats[0].name;
  const heroCardStrs = holeCardMatch ? parseCards(holeCardMatch[2]) : [];

  // Build player list
  const players: Player[] = seats.map((seat, i) => ({
    id: seat.name,
    name: seat.name,
    position: positionOrder[seat.seatNum] ?? "UTG",
    stack: seat.chips,
    isHero: seat.name === heroName,
    isFolded: false,
    isAllIn: false,
    betAmount: 0,
    seatIndex: i,
    holeCards: seat.name === heroName && heroCardStrs.length === 2
      ? [heroCardStrs[0], heroCardStrs[1]]
      : undefined,
  }));

  const heroPlayer = players.find(p => p.isHero);
  const heroPos = heroPlayer?.position ?? "BTN";

  // Parse streets
  const streets: StreetState[] = [];

  // Split by street markers
  const preflopStart = text.indexOf("*** HOLE CARDS ***");
  const flopStart = text.indexOf("*** FLOP ***");
  const turnStart = text.indexOf("*** TURN ***");
  const riverStart = text.indexOf("*** RIVER ***");
  const showdownStart = text.indexOf("*** SHOW DOWN ***");
  const summaryStart = text.indexOf("*** SUMMARY ***");

  const end = summaryStart > -1 ? summaryStart : text.length;

  function extractStreetText(start: number, nextStart: number): string {
    if (start < 0) return "";
    return text.slice(start, nextStart > 0 ? nextStart : end);
  }

  function parseStreetActions(strText: string, pot: number): Action[] {
    const actions: Action[] = [];
    const actionRegex = /^(.+?): (folds|checks|calls|bets|raises|is all-in)(?:\s+(\d+(?:,\d+)*))?(?:\s+to\s+(\d+(?:,\d+)*))?/i;
    const posMap = Object.fromEntries(players.map(p => [p.name, p.position]));

    for (const line of strText.split("\n").map(l => l.trim())) {
      const m = line.match(actionRegex);
      if (!m) continue;
      const name = m[1].trim();
      const actionWord = m[2].toLowerCase();
      const amount = m[3] ? parseInt(m[3].replace(/,/g, "")) : m[4] ? parseInt(m[4].replace(/,/g, "")) : undefined;

      let action: ActionType = "fold";
      if (actionWord === "folds") action = "fold";
      else if (actionWord === "checks") action = "check";
      else if (actionWord === "calls") action = "call";
      else if (actionWord === "bets") action = "bet";
      else if (actionWord === "raises") action = "raise";
      else if (actionWord === "is all-in") action = "all-in";

      const isAllIn = line.toLowerCase().includes("all-in") || actionWord === "is all-in";

      actions.push({
        playerId: name,
        position: posMap[name] ?? "UTG",
        action,
        amount,
        isAllIn,
      });
    }
    return actions;
  }

  function extractBoard(marker: string): Card[] {
    const m = text.match(new RegExp(`\\*\\*\\* ${marker} \\*\\*\\*[^[]*\\[([^\\]]+)\\]`));
    if (!m) return [];
    return parseCards(m[1]);
  }

  // Preflop
  const preflopText = extractStreetText(preflopStart, flopStart > 0 ? flopStart : turnStart > 0 ? turnStart : riverStart > 0 ? riverStart : end);
  const preflopActions = parseStreetActions(preflopText, bbVal);
  streets.push({ street: "preflop", board: [], actions: preflopActions, pot: bbVal * 2 + (anteVal ?? 0) * seats.length });

  // Flop
  if (flopStart > -1) {
    const flopText = extractStreetText(flopStart, turnStart > 0 ? turnStart : riverStart > 0 ? riverStart : end);
    const flopBoard = extractBoard("FLOP");
    const flopActions = parseStreetActions(flopText, 0);
    streets.push({ street: "flop", board: flopBoard, actions: flopActions, pot: 0 });
  }

  // Turn
  if (turnStart > -1) {
    const turnText = extractStreetText(turnStart, riverStart > 0 ? riverStart : end);
    const flopBoard = extractBoard("FLOP");
    const turnCard = extractBoard("TURN");
    const turnBoard = [...flopBoard, ...turnCard.slice(-1)];
    const turnActions = parseStreetActions(turnText, 0);
    streets.push({ street: "turn", board: turnBoard, actions: turnActions, pot: 0 });
  }

  // River
  if (riverStart > -1) {
    const riverText = extractStreetText(riverStart, showdownStart > 0 ? showdownStart : end);
    const flopBoard = extractBoard("FLOP");
    const turnCard = extractBoard("TURN");
    const riverCard = extractBoard("RIVER");
    const riverBoard = [...flopBoard, ...turnCard.slice(-1), ...riverCard.slice(-1)];
    const riverActions = parseStreetActions(riverText, 0);
    streets.push({ street: "river", board: riverBoard, actions: riverActions, pot: 0 });
  }

  // Effective stack
  const sortedChips = seats.map(s => s.chips).sort((a, b) => a - b);
  const effectiveStack = Math.round((sortedChips[0] ?? bbVal * 20) / bbVal);

  return {
    id: `imported-${Date.now()}`,
    format,
    blinds: { sb: sbVal, bb: bbVal, ante: anteVal },
    effectiveStack,
    players,
    streets,
    heroPosition: heroPos,
    heroCards: heroPlayer?.holeCards,
    tags: ["imported"],
  };
}

function assignPositions(seats: ParsedSeat[], btnSeat: number): Record<number, Position> {
  const n = seats.length;
  const positions: Position[] = n >= 9
    ? ["BTN","SB","BB","UTG","UTG+1","UTG+2","LJ","HJ","CO"]
    : n === 6
    ? ["BTN","SB","BB","UTG","HJ","CO"]
    : n === 5
    ? ["BTN","SB","BB","UTG","CO"]
    : n === 4
    ? ["BTN","SB","BB","UTG"]
    : ["BTN","BB"];

  const btnIdx = seats.findIndex(s => s.seatNum === btnSeat);
  const result: Record<number, Position> = {};
  for (let i = 0; i < seats.length; i++) {
    const relIdx = (i - btnIdx + seats.length) % seats.length;
    result[seats[i].seatNum] = positions[relIdx] ?? "UTG";
  }
  return result;
}

// ============================================================
// Main parse function - auto-detects format
// ============================================================

export function parseHandHistory(text: string): HandHistory | null {
  const fmt = detectFormat(text);
  // GGPoker is similar enough to PokerStars for basic parsing
  if (fmt === "pokerstars" || fmt === "ggpoker" || text.includes("Seat ")) {
    return parsePokerStars(text);
  }
  return null;
}

/**
 * Split a multi-hand history file into individual hand texts
 */
export function splitHands(text: string): string[] {
  // PokerStars hands start with "PokerStars Hand #" or similar
  const hands = text.split(/(?=PokerStars (?:Hand|Game) #|GGPoker Hand #|Poker Hand #)/g)
    .map(h => h.trim())
    .filter(h => h.length > 50);
  return hands;
}

export function parseMultipleHands(text: string): HandHistory[] {
  const handTexts = splitHands(text);
  if (handTexts.length === 0) {
    // Try as a single hand
    const single = parseHandHistory(text);
    return single ? [single] : [];
  }
  return handTexts.map(parseHandHistory).filter(Boolean) as HandHistory[];
}
