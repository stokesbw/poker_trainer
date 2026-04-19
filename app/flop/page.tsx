"use client";

import { useState, useCallback } from "react";
import type { Card as CardType } from "@/lib/poker/types";
import { Card } from "@/components/poker/Card";
import {
  analyzeFlop,
  generateRandomFlop,
  getCbetRecommendation,
  type BoardTexture,
  type FlopAnalysis,
} from "@/lib/poker/flop-engine";
import { RANGE_GRID_RANKS } from "@/lib/poker/constants";
import { getHandLabel } from "@/lib/poker/range-utils";
import { cn } from "@/lib/utils";
import {
  Layers,
  RefreshCw,
  Shuffle,
  Check,
  X,
  TrendingUp,
  Info,
  Brain,
} from "lucide-react";

const TEXTURE_LABELS: Record<BoardTexture, string> = {
  "dry-rainbow": "Dry Rainbow",
  "dry-two-tone": "Dry Two-Tone",
  "wet-two-tone": "Wet Two-Tone",
  "wet-rainbow": "Wet Rainbow",
  "monotone": "Monotone",
  "paired-dry": "Paired Dry",
  "paired-wet": "Paired Wet",
  "trips": "Trips on Board",
};

const TEXTURE_COLORS: Record<BoardTexture, string> = {
  "dry-rainbow": "text-green-400 bg-green-900/30 border-green-700/50",
  "dry-two-tone": "text-blue-400 bg-blue-900/30 border-blue-700/50",
  "wet-two-tone": "text-yellow-400 bg-yellow-900/30 border-yellow-700/50",
  "wet-rainbow": "text-orange-400 bg-orange-900/30 border-orange-700/50",
  "monotone": "text-purple-400 bg-purple-900/30 border-purple-700/50",
  "paired-dry": "text-cyan-400 bg-cyan-900/30 border-cyan-700/50",
  "paired-wet": "text-red-400 bg-red-900/30 border-red-700/50",
  "trips": "text-pink-400 bg-pink-900/30 border-pink-700/50",
};

const TEXTURE_FILTERS: (BoardTexture | "all")[] = [
  "all", "dry-rainbow", "dry-two-tone", "wet-two-tone", "monotone", "paired-dry", "trips",
];

// Quiz mode
interface FlopQuiz {
  board: CardType[];
  analysis: FlopAnalysis;
  question: "texture" | "cbet-freq" | "advantage";
  correctAnswer: string;
  options: string[];
  userAnswer: string | null;
}

function generateQuiz(textureFilter?: BoardTexture): FlopQuiz {
  const board = generateRandomFlop(textureFilter);
  const analysis = analyzeFlop(board);

  const qType: FlopQuiz["question"] = ["texture", "cbet-freq", "advantage"][
    Math.floor(Math.random() * 3)
  ] as FlopQuiz["question"];

  if (qType === "texture") {
    const allTextures = Object.keys(TEXTURE_LABELS) as BoardTexture[];
    const wrong = allTextures
      .filter(t => t !== analysis.texture)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [...wrong, analysis.texture].sort(() => Math.random() - 0.5);
    return {
      board, analysis,
      question: "texture",
      correctAnswer: analysis.texture,
      options,
      userAnswer: null,
    };
  }

  if (qType === "cbet-freq") {
    const freq = analysis.cbetFrequency;
    const buckets = ["< 40% (selective)", "40-60% (moderate)", "60-75% (frequent)", "75%+ (range bet)"];
    let correct: string;
    if (freq < 40) correct = "< 40% (selective)";
    else if (freq < 60) correct = "40-60% (moderate)";
    else if (freq < 75) correct = "60-75% (frequent)";
    else correct = "75%+ (range bet)";

    return {
      board, analysis,
      question: "cbet-freq",
      correctAnswer: correct,
      options: buckets,
      userAnswer: null,
    };
  }

  // Range advantage
  const options = ["IP has range advantage", "OOP has range advantage", "Roughly neutral"];
  let correct: string;
  if (analysis.rangeAdvantage === "ip") correct = "IP has range advantage";
  else if (analysis.rangeAdvantage === "oop") correct = "OOP has range advantage";
  else correct = "Roughly neutral";

  return { board, analysis, question: "advantage", correctAnswer: correct, options, userAnswer: null };
}

const QUESTION_LABELS: Record<FlopQuiz["question"], string> = {
  "texture": "What is the board texture?",
  "cbet-freq": "What is the ideal c-bet frequency from IP?",
  "advantage": "Who has the range advantage on this board?",
};

export default function FlopPage() {
  const [board, setBoard] = useState<CardType[]>(() => generateRandomFlop());
  const [analysis, setAnalysis] = useState<FlopAnalysis>(() => analyzeFlop(generateRandomFlop()));
  const [textureFilter, setTextureFilter] = useState<BoardTexture | "all">("all");
  const [mode, setMode] = useState<"study" | "quiz">("study");
  const [quiz, setQuiz] = useState<FlopQuiz | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [selectedHand, setSelectedHand] = useState<string | null>(null);

  const generateBoard = useCallback(() => {
    const newBoard = generateRandomFlop(textureFilter !== "all" ? textureFilter : undefined);
    setBoard(newBoard);
    setAnalysis(analyzeFlop(newBoard));
    setSelectedHand(null);
  }, [textureFilter]);

  const startQuiz = useCallback(() => {
    setMode("quiz");
    setQuizScore({ correct: 0, total: 0 });
    setQuiz(generateQuiz(textureFilter !== "all" ? textureFilter : undefined));
  }, [textureFilter]);

  const handleQuizAnswer = useCallback((answer: string) => {
    if (!quiz || quiz.userAnswer) return;
    const correct = answer === quiz.correctAnswer;
    setQuiz(prev => prev ? { ...prev, userAnswer: answer } : null);
    setQuizScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  }, [quiz]);

  const nextQuiz = useCallback(() => {
    setQuiz(generateQuiz(textureFilter !== "all" ? textureFilter : undefined));
  }, [textureFilter]);

  const handRec = selectedHand && analysis
    ? getCbetRecommendation(selectedHand, analysis, "ip")
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Flop Texture Trainer</h1>
          <p className="text-gray-400 text-sm">Learn GTO c-bet strategy by board texture</p>
        </div>
        {/* Mode toggle */}
        <div className="ml-auto flex items-center gap-2 bg-poker-surface border border-poker-border rounded-xl p-1">
          <button onClick={() => setMode("study")}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              mode === "study" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white")}>
            Study
          </button>
          <button onClick={startQuiz}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              mode === "quiz" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white")}>
            Quiz
          </button>
        </div>
      </div>

      {/* Texture Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {TEXTURE_FILTERS.map(t => (
          <button key={t} onClick={() => { setTextureFilter(t); generateBoard(); }}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize",
              textureFilter === t
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-poker-surface border-poker-border text-gray-400 hover:text-white")}>
            {t === "all" ? "All Textures" : TEXTURE_LABELS[t]}
          </button>
        ))}
      </div>

      {mode === "study" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Board + Controls */}
          <div className="flex flex-col gap-4">
            {/* Board Display */}
            <div className="bg-poker-surface rounded-xl border border-poker-border p-6 text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-4">Current Board</div>
              <div className="flex justify-center gap-3 mb-4">
                {board.map((card, i) => <Card key={i} card={card} size="lg" animate />)}
              </div>
              {analysis && (
                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border",
                  TEXTURE_COLORS[analysis.texture])}>
                  {TEXTURE_LABELS[analysis.texture]}
                </div>
              )}
            </div>

            {/* Regenerate */}
            <button onClick={generateBoard}
              className="w-full flex items-center justify-center gap-2 bg-poker-surface border border-poker-border hover:border-emerald-500 text-white font-semibold py-3 rounded-xl transition-all">
              <Shuffle size={16} />
              New Board
            </button>

            {/* Analysis Stats */}
            {analysis && (
              <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
                <div className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">Board Properties</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Flush draw", val: analysis.hasFlushDraw, bool: true },
                    { label: "Straight draw", val: analysis.hasStraightDraw, bool: true },
                    { label: "OESD possible", val: analysis.hasOpenEndedDraw, bool: true },
                    { label: "Broadway board", val: analysis.isBroadway, bool: true },
                    { label: "Low board", val: analysis.isLowBoard, bool: true },
                    { label: "Paired board", val: analysis.isPaired, bool: true },
                    { label: "Connectedness", val: analysis.connectedness, bool: false },
                    { label: "Range advantage", val: analysis.rangeAdvantage.toUpperCase(), bool: false },
                  ].map(({ label, val, bool }) => (
                    <div key={label} className="flex items-center justify-between bg-poker-bg rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">{label}</span>
                      {bool ? (
                        val ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-red-400" />
                      ) : (
                        <span className="text-white font-semibold capitalize">{String(val)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hand lookup */}
            <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
              <div className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">Check Any Hand</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. AKs, TT, 98s"
                  value={selectedHand ?? ""}
                  onChange={e => setSelectedHand(e.target.value || null)}
                  className="flex-1 bg-poker-bg border border-poker-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              {handRec && (
                <div className={cn("mt-3 p-3 rounded-xl border text-sm",
                  handRec.action === "bet"
                    ? "bg-green-900/30 border-green-700/50 text-green-300"
                    : "bg-gray-800/50 border-gray-600/50 text-gray-300")}>
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    {handRec.action === "bet" ? <TrendingUp size={14} /> : <X size={14} />}
                    {handRec.action.toUpperCase()} {handRec.frequency.toFixed(0)}%
                    {handRec.sizing && <span className="text-xs opacity-70">({handRec.sizing})</span>}
                  </div>
                  <p className="text-xs opacity-80">{handRec.reasoning}</p>
                </div>
              )}
            </div>
          </div>

          {/* Center + Right: Analysis */}
          {analysis && (
            <div className="xl:col-span-2 flex flex-col gap-4">
              {/* C-Bet Recommendation */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
                <div className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
                  C-Bet Strategy
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-poker-bg rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-emerald-400">{analysis.cbetFrequency}%</div>
                    <div className="text-xs text-gray-400 mt-1">Frequency</div>
                  </div>
                  <div className="bg-poker-bg rounded-xl p-4 text-center">
                    <div className="text-xl font-black text-blue-400">{analysis.cbetSizing}</div>
                    <div className="text-xs text-gray-400 mt-1">Sizing (of pot)</div>
                  </div>
                  <div className="bg-poker-bg rounded-xl p-4 text-center">
                    <div className={cn("text-xl font-black",
                      analysis.rangeAdvantage === "ip" ? "text-green-400" :
                        analysis.rangeAdvantage === "oop" ? "text-red-400" : "text-yellow-400")}>
                      {analysis.rangeAdvantage === "ip" ? "IP" : analysis.rangeAdvantage === "oop" ? "OOP" : "Even"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Range edge</div>
                  </div>
                </div>

                {/* Frequency bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Bet frequency</span>
                    <span>{analysis.cbetFrequency}%</span>
                  </div>
                  <div className="h-3 bg-poker-bg rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.cbetFrequency}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Selective</span>
                    <span>Range bet</span>
                  </div>
                </div>

                <div className="text-sm text-gray-300 bg-poker-bg rounded-xl p-3">
                  {analysis.description}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-yellow-400" />
                  <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Strategy Notes</div>
                </div>
                <ul className="space-y-2">
                  {analysis.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-emerald-500 font-mono text-xs mt-0.5 shrink-0">{String(i+1).padStart(2,"0")}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Texture Reference Card */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
                <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Texture Reference
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(Object.entries(TEXTURE_LABELS) as [BoardTexture, string][]).map(([t, label]) => (
                    <div key={t}
                      className={cn("flex items-center justify-between px-3 py-2 rounded-lg border",
                        t === analysis.texture ? TEXTURE_COLORS[t] : "bg-poker-bg border-poker-border text-gray-500")}>
                      <span className={t === analysis.texture ? "font-bold" : ""}>{label}</span>
                      {t === analysis.texture && <Check size={12} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Mode */
        <div className="max-w-2xl mx-auto">
          {/* Score */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-poker-surface border border-poker-border rounded-xl px-4 py-2 text-sm">
              <span className="text-gray-400">Score: </span>
              <span className="text-white font-bold">{quizScore.correct}/{quizScore.total}</span>
              {quizScore.total > 0 && (
                <span className={cn("ml-2 font-bold",
                  (quizScore.correct / quizScore.total) >= 0.7 ? "text-green-400" : "text-red-400")}>
                  ({Math.round((quizScore.correct / quizScore.total) * 100)}%)
                </span>
              )}
            </div>
            <button onClick={() => setMode("study")}
              className="text-gray-400 hover:text-white text-sm transition-colors">
              Exit quiz
            </button>
          </div>

          {quiz && (
            <div className="flex flex-col gap-4">
              {/* Board */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-6 text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-4">Board</div>
                <div className="flex justify-center gap-3">
                  {quiz.board.map((card, i) => <Card key={i} card={card} size="lg" />)}
                </div>
              </div>

              {/* Question */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
                <div className="text-white font-semibold text-lg mb-4">
                  {QUESTION_LABELS[quiz.question]}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quiz.options.map(option => {
                    const isCorrect = option === quiz.correctAnswer;
                    const isSelected = option === quiz.userAnswer;
                    const answered = quiz.userAnswer !== null;

                    return (
                      <button key={option} onClick={() => handleQuizAnswer(option)} disabled={answered}
                        className={cn(
                          "p-4 rounded-xl border text-sm font-semibold text-left transition-all",
                          !answered ? "bg-poker-bg border-poker-border text-gray-300 hover:border-emerald-500 hover:text-white" :
                            isCorrect ? "bg-green-900/40 border-green-600/60 text-green-300" :
                              isSelected ? "bg-red-900/40 border-red-600/60 text-red-300" :
                                "bg-poker-bg border-poker-border text-gray-600 opacity-50"
                        )}>
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{option}</span>
                          {answered && isCorrect && <Check size={16} className="text-green-400" />}
                          {answered && isSelected && !isCorrect && <X size={16} className="text-red-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation after answer */}
                {quiz.userAnswer && (
                  <div className={cn("mt-4 p-4 rounded-xl border text-sm",
                    quiz.userAnswer === quiz.correctAnswer
                      ? "bg-green-900/30 border-green-700/50 text-green-200"
                      : "bg-red-900/30 border-red-700/50 text-red-200")}>
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      {quiz.userAnswer === quiz.correctAnswer
                        ? <><Check size={16} /> Correct!</>
                        : <><X size={16} /> Incorrect — Answer: {quiz.correctAnswer}</>}
                    </div>
                    <p>{quiz.analysis.tips[0]}</p>
                  </div>
                )}
              </div>

              {quiz.userAnswer && (
                <button onClick={nextQuiz}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">
                  Next Board
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
