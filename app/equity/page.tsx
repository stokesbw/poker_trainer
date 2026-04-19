"use client";

import { useState, useCallback, useRef } from "react";
import type { Card as CardType } from "@/lib/poker/types";
import { Card } from "@/components/poker/Card";
import {
  calculateEquityMonteCarlo,
  type EquityResult,
  parseCard,
  cardToString,
  createDeck,
} from "@/lib/poker/hand-evaluator";
import { RANKS, SUITS, SUIT_SYMBOLS, SUIT_COLORS_DARK } from "@/lib/poker/constants";
import { cn } from "@/lib/utils";
import { Percent, RefreshCw, Play, X, Info } from "lucide-react";

type Slot = "hero1" | "hero2" | "villain1" | "villain2" | "board1" | "board2" | "board3" | "board4" | "board5";

const SLOT_LABELS: Record<Slot, string> = {
  hero1: "Hero card 1", hero2: "Hero card 2",
  villain1: "Villain card 1", villain2: "Villain card 2",
  board1: "Flop 1", board2: "Flop 2", board3: "Flop 3",
  board4: "Turn", board5: "River",
};

const ALL_SLOTS: Slot[] = ["hero1","hero2","villain1","villain2","board1","board2","board3","board4","board5"];

function rankLabel(r: string) { return r; }

export default function EquityPage() {
  const [cards, setCards] = useState<Partial<Record<Slot, CardType>>>({});
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [simCount, setSimCount] = useState(10000);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usedCards = new Set(Object.values(cards).map(c => c ? cardToString(c) : "").filter(Boolean));

  const handleCardPick = useCallback((rank: string, suit: string) => {
    if (!activeSlot) return;
    const key = `${rank}${suit}`;
    if (usedCards.has(key)) return;
    setCards(prev => ({ ...prev, [activeSlot]: { rank: rank as CardType["rank"], suit: suit as CardType["suit"] } }));
    // Auto-advance to next empty slot
    const order: Slot[] = ["hero1","hero2","villain1","villain2","board1","board2","board3","board4","board5"];
    const idx = order.indexOf(activeSlot);
    const next = order.slice(idx + 1).find(s => !cards[s]);
    setActiveSlot(next ?? null);
    setResult(null);
    setError(null);
  }, [activeSlot, usedCards, cards]);

  const clearSlot = useCallback((slot: Slot) => {
    setCards(prev => { const n = {...prev}; delete n[slot]; return n; });
    setResult(null);
  }, []);

  const clearAll = useCallback(() => {
    setCards({});
    setResult(null);
    setError(null);
    setActiveSlot(null);
  }, []);

  const runEquity = useCallback(() => {
    const h1 = cards.hero1; const h2 = cards.hero2;
    const v1 = cards.villain1; const v2 = cards.villain2;
    if (!h1 || !h2 || !v1 || !v2) {
      setError("Please select all 4 hole cards (2 for hero, 2 for villain)");
      return;
    }
    setError(null);
    setRunning(true);
    // Run in a timeout to allow UI to update
    setTimeout(() => {
      const board = [cards.board1, cards.board2, cards.board3, cards.board4, cards.board5].filter(Boolean) as CardType[];
      const res = calculateEquityMonteCarlo([h1, h2], [v1, v2], board, simCount);
      setResult(res);
      setRunning(false);
    }, 10);
  }, [cards, simCount]);

  const heroCards = [cards.hero1, cards.hero2].filter(Boolean) as CardType[];
  const villainCards = [cards.villain1, cards.villain2].filter(Boolean) as CardType[];
  const boardCards = [cards.board1, cards.board2, cards.board3, cards.board4, cards.board5];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
          <Percent size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Equity Calculator</h1>
          <p className="text-gray-400 text-sm">Monte Carlo simulation — up to 10,000 runouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Card Selection */}
        <div className="flex flex-col gap-4">

          {/* Hole Cards */}
          {(["hero","villain"] as const).map(player => (
            <div key={player} className="bg-poker-surface rounded-xl border border-poker-border p-4">
              <div className={cn("text-sm font-semibold mb-3 uppercase tracking-wide",
                player === "hero" ? "text-blue-400" : "text-red-400")}>
                {player === "hero" ? "Hero" : "Villain"}
              </div>
              <div className="flex gap-3">
                {([`${player}1`, `${player}2`] as Slot[]).map((slot, i) => {
                  const card = cards[slot];
                  const isActive = activeSlot === slot;
                  return (
                    <div key={slot} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => setActiveSlot(isActive ? null : slot)}
                        className={cn(
                          "relative rounded-lg border-2 transition-all",
                          isActive ? "border-yellow-400 ring-2 ring-yellow-400/30" :
                            card ? "border-transparent" : "border-dashed border-poker-border hover:border-gray-500"
                        )}
                      >
                        {card ? (
                          <div className="relative">
                            <Card card={card} size="md" />
                            <button
                              onClick={(e) => { e.stopPropagation(); clearSlot(slot); }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 z-10"
                            >
                              <X size={10} className="text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-14 h-20 rounded-md flex items-center justify-center text-gray-600 text-xs">
                            {isActive ? <span className="text-yellow-400 animate-pulse">Pick</span> : "—"}
                          </div>
                        )}
                      </button>
                      <span className="text-xs text-gray-500">Card {i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Board */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide">
              Board (optional)
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["board1","board2","board3","board4","board5"] as Slot[]).map((slot, i) => {
                const card = cards[slot];
                const isActive = activeSlot === slot;
                const label = i < 3 ? "Flop" : i === 3 ? "Turn" : "River";
                return (
                  <div key={slot} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setActiveSlot(isActive ? null : slot)}
                      className={cn(
                        "relative rounded-lg border-2 transition-all",
                        isActive ? "border-yellow-400 ring-2 ring-yellow-400/30" :
                          card ? "border-transparent" : "border-dashed border-poker-border hover:border-gray-500"
                      )}
                    >
                      {card ? (
                        <div className="relative">
                          <Card card={card} size="sm" />
                          <button
                            onClick={(e) => { e.stopPropagation(); clearSlot(slot); }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 z-10"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-14 rounded-md flex items-center justify-center text-gray-600 text-xs">
                          {isActive ? <span className="text-yellow-400 animate-pulse text-[10px]">Pick</span> : "—"}
                        </div>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sim count */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Simulations</div>
            <div className="flex gap-2">
              {[1000, 5000, 10000, 50000].map(n => (
                <button key={n} onClick={() => setSimCount(n)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    simCount === n ? "bg-cyan-600 border-cyan-500 text-white" : "bg-poker-bg border-poker-border text-gray-400 hover:text-white")}>
                  {(n/1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={runEquity} disabled={running}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
              {running ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              {running ? "Running..." : "Calculate Equity"}
            </button>
            <button onClick={clearAll}
              className="px-4 py-3 bg-poker-surface border border-poker-border rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right: Card Picker + Results */}
        <div className="flex flex-col gap-4">
          {/* Card Picker */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              {activeSlot ? `Selecting: ${SLOT_LABELS[activeSlot]}` : "Select a slot above to pick a card"}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
              {RANKS.slice().reverse().map(rank => (
                SUITS.map(suit => {
                  const key = `${rank}${suit}`;
                  const used = usedCards.has(key);
                  const isRed = suit === "h" || suit === "d";
                  return (
                    <button
                      key={key}
                      disabled={used || !activeSlot}
                      onClick={() => handleCardPick(rank, suit)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded text-[9px] font-bold border transition-all",
                        used ? "opacity-20 cursor-not-allowed bg-poker-bg border-poker-border" :
                          !activeSlot ? "opacity-40 cursor-not-allowed bg-poker-bg border-poker-border" :
                          "bg-card-bg border-gray-300 hover:scale-110 hover:ring-2 hover:ring-yellow-400 cursor-pointer"
                      )}
                      style={{ color: isRed ? "#dc2626" : "#1a1a1a" }}
                      title={key}
                    >
                      <span>{rank}</span>
                      <span style={{ fontSize: "8px" }}>{SUIT_SYMBOLS[suit]}</span>
                    </button>
                  );
                })
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Rows: A K Q J T 9 8 7 6 5 4 3 2 | Cols: ♠ ♥ ♦ ♣
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
              <div className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
                Equity Results — {result.simulations.toLocaleString()} simulations
              </div>

              {/* Visual bars */}
              <div className="space-y-3 mb-4">
                {[
                  { label: "Hero", equity: result.heroEquity, color: "bg-blue-500", cards: heroCards },
                  { label: "Villain", equity: result.villainEquity, color: "bg-red-500", cards: villainCards },
                ].map(({ label, equity, color, cards: hcards }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{label}</span>
                        <div className="flex gap-1">
                          {hcards.map((c, i) => <Card key={i} card={c} size="xs" />)}
                        </div>
                      </div>
                      <span className={cn("text-xl font-black", label === "Hero" ? "text-blue-400" : "text-red-400")}>
                        {equity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-poker-bg rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", color)}
                        style={{ width: `${equity}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tie */}
              {result.ties > 0 && (
                <div className="text-xs text-gray-400 text-center">
                  Ties: {result.ties.toFixed(1)}%
                </div>
              )}

              {/* Head to head breakdown */}
              <div className="mt-4 bg-poker-bg rounded-xl p-3">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-blue-400 font-bold text-lg">{result.heroEquity.toFixed(1)}%</div>
                    <div className="text-gray-400 text-xs">Hero wins</div>
                  </div>
                  <div className="text-gray-600 font-bold text-xl">vs</div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-lg">{result.villainEquity.toFixed(1)}%</div>
                    <div className="text-gray-400 text-xs">Villain wins</div>
                  </div>
                </div>

                {boardCards.filter(Boolean).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-poker-border">
                    <div className="text-xs text-gray-400 mb-2 text-center">Board</div>
                    <div className="flex justify-center gap-1">
                      {boardCards.map((c, i) => c ? <Card key={i} card={c} size="xs" /> : null)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-500">
                <Info size={11} className="mt-0.5 shrink-0" />
                Results are approximate. Higher simulation counts give more accurate results but take longer.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
