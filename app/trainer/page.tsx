"use client";

import { useState, useCallback } from "react";
import type { Position } from "@/lib/poker/types";
import { RangeGrid } from "@/components/poker/RangeGrid";
import {
  getPushRange,
  isPushHand,
  STACK_BREAKPOINTS,
} from "@/lib/poker/push-fold-engine";
import { RANGE_GRID_RANKS } from "@/lib/poker/constants";
import { getHandLabel, rangeToPercent, countCombos } from "@/lib/poker/range-utils";
import { cn } from "@/lib/utils";
import { POSITION_COLORS } from "@/lib/poker/constants";
import { TrendingUp, Info, Check, X } from "lucide-react";

const POSITIONS: Position[] = ["UTG", "UTG+1", "UTG+2", "LJ", "HJ", "CO", "BTN", "SB", "BB"];

const POSITION_LABELS: Partial<Record<Position, string>> = {
  UTG: "UTG",
  "UTG+1": "UTG+1",
  "UTG+2": "UTG+2",
  LJ: "LJ",
  HJ: "HJ",
  CO: "CO",
  BTN: "BTN",
  SB: "SB",
  BB: "BB (Call)",
};

export default function TrainerPage() {
  const [selectedPosition, setSelectedPosition] = useState<Position>("BTN");
  const [selectedStack, setSelectedStack] = useState(10);
  const [customStack, setCustomStack] = useState("");
  const [highlightedHand, setHighlightedHand] = useState<string | undefined>();
  const [quizMode, setQuizMode] = useState(false);
  const [quizHand, setQuizHand] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(null);
  const [quizCount, setQuizCount] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);

  const effectiveStack = customStack ? parseFloat(customStack) : selectedStack;
  const pushRange = getPushRange(selectedPosition, effectiveStack);
  const pct = rangeToPercent(pushRange);
  const combos = countCombos(pushRange);

  // Generate a random hand for quiz mode
  const generateQuizHand = useCallback(() => {
    const allHands: string[] = [];
    RANGE_GRID_RANKS.forEach((r1, row) => {
      RANGE_GRID_RANKS.forEach((r2, col) => {
        allHands.push(getHandLabel(row, col));
      });
    });
    const hand = allHands[Math.floor(Math.random() * allHands.length)];
    setQuizHand(hand);
    setQuizResult(null);
  }, []);

  const handleQuizAnswer = useCallback(
    (action: "push" | "fold") => {
      if (!quizHand) return;
      const correct = isPushHand(quizHand, selectedPosition, effectiveStack);
      const isCorrect =
        (action === "push" && correct) || (action === "fold" && !correct);

      setQuizResult(isCorrect ? "correct" : "incorrect");
      setQuizCount((c) => c + 1);
      if (isCorrect) setQuizCorrect((c) => c + 1);
    },
    [quizHand, selectedPosition, effectiveStack]
  );

  const startQuiz = useCallback(() => {
    setQuizMode(true);
    setQuizCount(0);
    setQuizCorrect(0);
    generateQuizHand();
  }, [generateQuizHand]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Push/Fold Trainer</h1>
          <p className="text-gray-400 text-sm">GTO shove ranges for MTT tournaments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          {/* Position Selector */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Position</div>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={cn(
                    "px-2 py-2 rounded-lg text-xs font-semibold border transition-all",
                    selectedPosition === pos
                      ? "text-white border-transparent"
                      : "bg-poker-bg border-poker-border text-gray-400 hover:text-white hover:border-gray-500"
                  )}
                  style={
                    selectedPosition === pos
                      ? { backgroundColor: POSITION_COLORS[pos], borderColor: POSITION_COLORS[pos] }
                      : {}
                  }
                >
                  {POSITION_LABELS[pos] ?? pos}
                </button>
              ))}
            </div>
          </div>

          {/* Stack Depth */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Stack Depth
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {STACK_BREAKPOINTS.map((bb) => (
                <button
                  key={bb}
                  onClick={() => { setSelectedStack(bb); setCustomStack(""); }}
                  className={cn(
                    "px-2 py-2 rounded-lg text-xs font-semibold border transition-all",
                    selectedStack === bb && !customStack
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-poker-bg border-poker-border text-gray-400 hover:text-white hover:border-gray-500"
                  )}
                >
                  {bb}BB
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Custom (e.g. 11)"
                value={customStack}
                onChange={(e) => setCustomStack(e.target.value)}
                className="flex-1 bg-poker-bg border border-poker-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-400 text-sm">BB</span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Range Stats
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-poker-bg rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{pct.toFixed(1)}%</div>
                <div className="text-xs text-gray-400 mt-0.5">of all hands</div>
              </div>
              <div className="bg-poker-bg rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{combos.toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-0.5">total combos</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400 bg-poker-bg/50 rounded-lg p-2">
              <Info size={12} className="inline mr-1" />
              <span className="font-semibold text-gray-300">{selectedPosition}</span> with{" "}
              <span className="font-semibold text-blue-400">{effectiveStack}BB</span> vs 9-max field
            </div>
          </div>

          {/* Quiz Mode */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Drill Mode
            </div>
            {!quizMode ? (
              <button
                onClick={startQuiz}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Start Push/Fold Drill
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Score */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Score:</span>
                  <span className="text-white font-semibold">
                    {quizCorrect}/{quizCount}
                    {quizCount > 0 && (
                      <span className="text-gray-400 ml-1">
                        ({Math.round((quizCorrect / quizCount) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>

                {/* Quiz Hand */}
                {quizHand && !quizResult && (
                  <>
                    <div className="bg-poker-bg rounded-xl p-4 text-center">
                      <div className="text-gray-400 text-xs mb-1">Your hand:</div>
                      <div className="text-4xl font-bold text-white">{quizHand}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {selectedPosition} | {effectiveStack}BB
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleQuizAnswer("push")}
                        className="py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg text-sm transition-colors"
                      >
                        PUSH
                      </button>
                      <button
                        onClick={() => handleQuizAnswer("fold")}
                        className="py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-sm transition-colors"
                      >
                        FOLD
                      </button>
                    </div>
                  </>
                )}

                {/* Result */}
                {quizResult && quizHand && (
                  <>
                    <div
                      className={cn(
                        "rounded-xl p-4 text-center border",
                        quizResult === "correct"
                          ? "bg-green-900/30 border-green-700/50"
                          : "bg-red-900/30 border-red-700/50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {quizResult === "correct" ? (
                          <Check className="text-green-400" size={20} />
                        ) : (
                          <X className="text-red-400" size={20} />
                        )}
                        <span
                          className={cn(
                            "font-bold",
                            quizResult === "correct" ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {quizResult === "correct" ? "Correct!" : "Wrong"}
                        </span>
                      </div>
                      <div className="text-white text-lg font-bold">{quizHand}</div>
                      <div className="text-gray-300 text-sm mt-1">
                        GTO action:{" "}
                        <span
                          className={cn(
                            "font-bold",
                            isPushHand(quizHand, selectedPosition, effectiveStack)
                              ? "text-green-400"
                              : "text-red-400"
                          )}
                        >
                          {isPushHand(quizHand, selectedPosition, effectiveStack) ? "PUSH" : "FOLD"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={generateQuizHand}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Next Hand
                    </button>
                  </>
                )}

                <button
                  onClick={() => setQuizMode(false)}
                  className="text-gray-500 hover:text-gray-300 text-xs text-center transition-colors"
                >
                  Exit drill mode
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Range Grid */}
        <div className="xl:col-span-2">
          <div className="bg-poker-surface rounded-xl border border-poker-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-semibold">
                  {selectedPosition} Push Range at {effectiveStack}BB
                </div>
                <div className="text-gray-400 text-sm">
                  {selectedPosition === "BB"
                    ? "Calling range vs all-in shove"
                    : "Shove all-in with these hands"}
                </div>
              </div>
              <div
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: POSITION_COLORS[selectedPosition] + "33",
                  color: POSITION_COLORS[selectedPosition],
                  border: `1px solid ${POSITION_COLORS[selectedPosition]}66`,
                }}
              >
                {POSITION_LABELS[selectedPosition]}
              </div>
            </div>

            <RangeGrid
              range={pushRange}
              highlightHand={quizHand ?? highlightedHand}
              showStats
              colorScheme="blue"
            />

            {/* Legend explanation */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-poker-bg rounded-lg p-3">
                <div className="text-blue-400 font-semibold mb-1">Blue cells = PUSH</div>
                <div className="text-gray-400">
                  Shove all-in preflop with these hands. Top-left triangle = suited, bottom-right = offsuit, diagonal = pairs.
                </div>
              </div>
              <div className="bg-poker-bg rounded-lg p-3">
                <div className="text-gray-400 font-semibold mb-1">Dark cells = FOLD</div>
                <div className="text-gray-400">
                  These hands do not have sufficient EV to profitably shove from this position and stack depth.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
