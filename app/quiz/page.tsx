"use client";

import { useState, useCallback, useEffect } from "react";
import type { Position } from "@/lib/poker/types";
import { RangeGrid } from "@/components/poker/RangeGrid";
import {
  getPushRange,
  isPushHand,
  STACK_BREAKPOINTS,
} from "@/lib/poker/push-fold-engine";
import { RANGE_GRID_RANKS } from "@/lib/poker/constants";
import { getHandLabel, countCombos, rangeToPercent } from "@/lib/poker/range-utils";
import { MTT_SPOTS } from "@/data/mtt-spots";
import { cn } from "@/lib/utils";
import { POSITION_COLORS } from "@/lib/poker/constants";
import {
  Brain,
  Check,
  X,
  Trophy,
  RefreshCw,
  ChevronRight,
  Zap,
} from "lucide-react";

type QuizType = "push-fold" | "spot-recognition";

interface QuizState {
  type: QuizType;
  position: Position;
  stackBB: number;
  hand: string;
  correctAnswer: "push" | "fold";
  userAnswer: "push" | "fold" | null;
  showExplanation: boolean;
}

interface SessionStats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
  history: { hand: string; correct: boolean; position: Position; stack: number }[];
}

const ALL_POSITIONS: Position[] = ["UTG", "UTG+1", "HJ", "CO", "BTN", "SB"];
const ALL_STACKS = [5, 7, 10, 12, 15, 20];

function generateHand(): string {
  const row = Math.floor(Math.random() * 13);
  const col = Math.floor(Math.random() * 13);
  return getHandLabel(row, col);
}

function generateQuiz(): QuizState {
  const position = ALL_POSITIONS[Math.floor(Math.random() * ALL_POSITIONS.length)];
  const stackBB = ALL_STACKS[Math.floor(Math.random() * ALL_STACKS.length)];
  const hand = generateHand();
  const inRange = isPushHand(hand, position, stackBB);

  return {
    type: "push-fold",
    position,
    stackBB,
    hand,
    correctAnswer: inRange ? "push" : "fold",
    userAnswer: null,
    showExplanation: false,
  };
}

const INITIAL_STATS: SessionStats = {
  total: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  history: [],
};

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS);
  const [showRange, setShowRange] = useState(false);
  const [filterPosition, setFilterPosition] = useState<Position | "all">("all");
  const [filterStack, setFilterStack] = useState<number | "all">("all");

  const startSession = useCallback(() => {
    setStarted(true);
    setStats(INITIAL_STATS);
    setQuiz(generateQuiz());
    setShowRange(false);
  }, []);

  const handleAnswer = useCallback(
    (answer: "push" | "fold") => {
      if (!quiz || quiz.userAnswer) return;

      const correct = answer === quiz.correctAnswer;
      const newQuiz = { ...quiz, userAnswer: answer, showExplanation: true };
      setQuiz(newQuiz);

      setStats((prev) => {
        const newStreak = correct ? prev.streak + 1 : 0;
        return {
          total: prev.total + 1,
          correct: prev.correct + (correct ? 1 : 0),
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          history: [
            { hand: quiz.hand, correct, position: quiz.position, stack: quiz.stackBB },
            ...prev.history.slice(0, 19),
          ],
        };
      });
    },
    [quiz]
  );

  const nextQuestion = useCallback(() => {
    setShowRange(false);
    setQuiz(generateQuiz());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!quiz || quiz.userAnswer) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P" || e.key === "1") handleAnswer("push");
      if (e.key === "f" || e.key === "F" || e.key === "2") handleAnswer("fold");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [quiz, handleAnswer]);

  useEffect(() => {
    if (!quiz?.userAnswer) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") nextQuestion();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [quiz, nextQuestion]);

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Brain size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Push/Fold Quiz</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          You'll be shown random hands in random positions and stack depths. Decide
          whether to push all-in or fold based on GTO MTT ranges.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Zap, label: "Instant feedback", color: "yellow" },
            { icon: Trophy, label: "Track your accuracy", color: "green" },
            { icon: Brain, label: "All positions & stacks", color: "blue" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-poker-surface border border-poker-border rounded-xl p-4">
              <div className={`w-8 h-8 bg-${color}-900/50 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} className={`text-${color}-400`} />
              </div>
              <div className="text-gray-300 text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-poker-surface border border-poker-border rounded-xl p-4 mb-6 text-left text-sm text-gray-400">
          <div className="font-semibold text-gray-200 mb-2">Keyboard shortcuts:</div>
          <div className="flex gap-6">
            <span><kbd className="bg-poker-bg border border-poker-border px-2 py-0.5 rounded text-xs">P</kbd> or <kbd className="bg-poker-bg border border-poker-border px-2 py-0.5 rounded text-xs">1</kbd> = Push</span>
            <span><kbd className="bg-poker-bg border border-poker-border px-2 py-0.5 rounded text-xs">F</kbd> or <kbd className="bg-poker-bg border border-poker-border px-2 py-0.5 rounded text-xs">2</kbd> = Fold</span>
            <span><kbd className="bg-poker-bg border border-poker-border px-2 py-0.5 rounded text-xs">Enter</kbd> = Next hand</span>
          </div>
        </div>

        <button
          onClick={startSession}
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Start Quiz
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-poker-surface border border-poker-border rounded-xl px-4 py-2 text-sm">
            <span className="text-gray-400">Score: </span>
            <span className="text-white font-bold">{stats.correct}/{stats.total}</span>
            {stats.total > 0 && (
              <span className={cn("ml-2 font-bold", accuracy >= 70 ? "text-green-400" : "text-red-400")}>
                {accuracy}%
              </span>
            )}
          </div>
          {stats.streak >= 3 && (
            <div className="bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-2 text-sm text-orange-400 font-bold">
              🔥 {stats.streak} streak
            </div>
          )}
          {stats.bestStreak > 0 && (
            <div className="text-gray-500 text-sm hidden md:block">
              Best: {stats.bestStreak}
            </div>
          )}
        </div>
        <button
          onClick={startSession}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} />
          Reset
        </button>
      </div>

      {quiz && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Card */}
          <div className="flex flex-col gap-4">
            {/* Hand Display */}
            <div className="bg-poker-surface rounded-2xl border border-poker-border p-8 text-center">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Your Hand</div>
              <div className="text-7xl font-black text-white tracking-wide mb-4">{quiz.hand}</div>

              <div className="flex items-center justify-center gap-3 text-sm">
                <span
                  className="font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    color: POSITION_COLORS[quiz.position],
                    backgroundColor: POSITION_COLORS[quiz.position] + "22",
                    border: `1px solid ${POSITION_COLORS[quiz.position]}44`,
                  }}
                >
                  {quiz.position}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-blue-400 font-semibold">{quiz.stackBB}BB stack</span>
              </div>

              {!quiz.userAnswer && (
                <div className="text-gray-500 text-xs mt-4">Push all-in or fold?</div>
              )}
            </div>

            {/* Answer Buttons */}
            {!quiz.userAnswer ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAnswer("push")}
                  className="py-5 bg-green-700 hover:bg-green-600 text-white font-black text-xl rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  PUSH
                  <div className="text-xs font-normal text-green-300 mt-1">All-in</div>
                </button>
                <button
                  onClick={() => handleAnswer("fold")}
                  className="py-5 bg-red-800 hover:bg-red-700 text-white font-black text-xl rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  FOLD
                  <div className="text-xs font-normal text-red-300 mt-1">Muck it</div>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Result */}
                <div
                  className={cn(
                    "rounded-xl p-5 border text-center",
                    quiz.userAnswer === quiz.correctAnswer
                      ? "bg-green-900/30 border-green-700/50"
                      : "bg-red-900/30 border-red-700/50"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {quiz.userAnswer === quiz.correctAnswer ? (
                      <Check className="text-green-400" size={24} />
                    ) : (
                      <X className="text-red-400" size={24} />
                    )}
                    <span
                      className={cn(
                        "text-xl font-bold",
                        quiz.userAnswer === quiz.correctAnswer ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {quiz.userAnswer === quiz.correctAnswer ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    GTO says:{" "}
                    <span
                      className={cn(
                        "font-bold text-base",
                        quiz.correctAnswer === "push" ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {quiz.correctAnswer.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {quiz.hand} from {quiz.position} at {quiz.stackBB}BB
                  </div>
                </div>

                <button
                  onClick={nextQuestion}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Next Hand
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => setShowRange(!showRange)}
                  className="text-gray-400 hover:text-white text-xs text-center transition-colors"
                >
                  {showRange ? "Hide" : "Show"} full push range
                </button>
              </div>
            )}
          </div>

          {/* Range Display / History */}
          <div className="flex flex-col gap-4">
            {showRange && quiz.userAnswer && (
              <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
                <div className="text-sm text-gray-400 mb-3">
                  {quiz.position} push range at {quiz.stackBB}BB
                </div>
                <RangeGrid
                  range={getPushRange(quiz.position, quiz.stackBB)}
                  highlightHand={quiz.hand}
                  showStats
                  colorScheme={quiz.correctAnswer === "push" ? "green" : "blue"}
                />
              </div>
            )}

            {/* Recent History */}
            {stats.history.length > 0 && (
              <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
                <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Recent Answers
                </div>
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {stats.history.slice(0, 15).map((h, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs",
                        h.correct ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"
                      )}
                    >
                      <span className="font-bold">{h.hand}</span>
                      <span
                        className="text-gray-400"
                        style={{ color: POSITION_COLORS[h.position] + "cc" }}
                      >
                        {h.position} {h.stack}BB
                      </span>
                      <span>{h.correct ? "✓" : "✗"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
