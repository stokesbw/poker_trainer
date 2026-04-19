"use client";

import { useState, useCallback } from "react";
import type { HandHistory, StreetState, Action, Player } from "@/lib/poker/types";
import { Card } from "./Card";
import { cn } from "@/lib/utils";
import { POSITION_COLORS } from "@/lib/poker/constants";
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Play,
  Pause,
} from "lucide-react";

interface HandReplayerProps {
  hand: HandHistory;
  className?: string;
}

interface ReplayStep {
  streetIndex: number;
  actionIndex: number;
  label: string;
  description: string;
}

function buildSteps(hand: HandHistory): ReplayStep[] {
  const steps: ReplayStep[] = [];
  // Initial deal step
  steps.push({ streetIndex: 0, actionIndex: -1, label: "Deal", description: "Cards are dealt" });

  hand.streets.forEach((street, si) => {
    if (si > 0) {
      steps.push({
        streetIndex: si,
        actionIndex: -1,
        label: street.street.charAt(0).toUpperCase() + street.street.slice(1),
        description: `${street.street.charAt(0).toUpperCase() + street.street.slice(1)} is dealt`,
      });
    }
    street.actions.forEach((action, ai) => {
      const actionStr = action.amount
        ? `${action.action} ${action.amount}`
        : action.action;
      steps.push({
        streetIndex: si,
        actionIndex: ai,
        label: `${action.position}: ${actionStr}`,
        description: `${action.position} ${action.isAllIn ? "goes ALL-IN for" : action.action}${action.amount ? " " + action.amount : ""}`,
      });
    });
  });

  steps.push({
    streetIndex: hand.streets.length - 1,
    actionIndex: hand.streets[hand.streets.length - 1].actions.length,
    label: "Showdown",
    description: "Hand complete",
  });

  return steps;
}

const ACTION_COLORS: Record<string, string> = {
  fold: "text-red-400",
  check: "text-gray-400",
  call: "text-blue-400",
  bet: "text-green-400",
  raise: "text-yellow-400",
  "all-in": "text-orange-400 font-bold",
  post: "text-gray-500",
};

const ACTION_BG: Record<string, string> = {
  fold: "bg-red-900/30 border-red-800/50",
  check: "bg-gray-800/50 border-gray-700/50",
  call: "bg-blue-900/30 border-blue-800/50",
  bet: "bg-green-900/30 border-green-800/50",
  raise: "bg-yellow-900/30 border-yellow-800/50",
  "all-in": "bg-orange-900/40 border-orange-700/50",
  post: "bg-gray-800/30 border-gray-700/30",
};

export function HandReplayer({ hand, className }: HandReplayerProps) {
  const steps = buildSteps(hand);
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const currentStreet = hand.streets[step.streetIndex];

  // Collect all actions up to current step
  const visibleActions: { action: Action; street: string }[] = [];
  for (let si = 0; si <= step.streetIndex; si++) {
    const street = hand.streets[si];
    const maxAction =
      si < step.streetIndex
        ? street.actions.length
        : step.actionIndex + 1;
    for (let ai = 0; ai < maxAction; ai++) {
      visibleActions.push({ action: street.actions[ai], street: street.street });
    }
  }

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goStart = useCallback(() => setCurrentStep(0), []);
  const goEnd = useCallback(() => setCurrentStep(steps.length - 1), [steps.length]);

  return (
    <div className={cn("flex flex-col gap-4 bg-poker-surface rounded-xl border border-poker-border p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">
            {hand.format} - {hand.effectiveStack}BB effective
          </div>
          <div className="text-gray-400 text-sm">
            Blinds: {hand.blinds.sb}/{hand.blinds.bb}
            {hand.blinds.ante ? `/${hand.blinds.ante} ante` : ""}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Step {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Board + Hero Cards */}
      <div className="flex flex-col gap-3">
        {/* Board */}
        <div>
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Board</div>
          <div className="flex items-center gap-2">
            {currentStreet.board.length > 0 ? (
              currentStreet.board.map((card, i) => (
                <Card key={i} card={card} size="sm" animate />
              ))
            ) : (
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} faceDown size="sm" />
                ))}
              </div>
            )}
            {/* Placeholder cards for remaining streets */}
            {currentStreet.board.length > 0 && currentStreet.board.length < 5 &&
              [...Array(5 - currentStreet.board.length)].map((_, i) => (
                <Card key={`ph-${i}`} faceDown size="sm" />
              ))
            }
          </div>
        </div>

        {/* Hero Cards */}
        <div>
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
            Hero ({hand.heroPosition})
          </div>
          <div className="flex gap-2">
            {hand.heroCards ? (
              hand.heroCards.map((card, i) => (
                <Card key={i} card={card} size="sm" />
              ))
            ) : (
              <>
                <Card faceDown size="sm" />
                <Card faceDown size="sm" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Step Description */}
      <div className="bg-poker-bg rounded-lg px-4 py-3 border border-poker-border">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Action</div>
        <div className="text-white font-medium">{step.description}</div>
        <div className="text-xs text-gray-400 mt-1 capitalize">{currentStreet.street} street</div>
      </div>

      {/* Action Log */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Action Log</div>
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
          {visibleActions.length === 0 && (
            <div className="text-gray-500 text-sm italic">No actions yet</div>
          )}
          {visibleActions.map(({ action, street }, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between px-3 py-1.5 rounded-lg border text-sm",
                ACTION_BG[action.action] ?? "bg-gray-800/50 border-gray-700/50",
                i === visibleActions.length - 1 && "ring-1 ring-white/20"
              )}
            >
              <span
                className="font-semibold text-xs"
                style={{ color: POSITION_COLORS[action.position] ?? "#9ca3af" }}
              >
                {action.position}
              </span>
              <span className={cn("capitalize", ACTION_COLORS[action.action] ?? "text-white")}>
                {action.action}
                {action.isAllIn ? " (ALL-IN)" : ""}
              </span>
              {action.amount && (
                <span className="text-white font-mono text-xs">{action.amount.toLocaleString()}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-poker-border">
        <button
          onClick={goStart}
          disabled={currentStep === 0}
          className="p-2 rounded-lg bg-poker-bg border border-poker-border text-gray-400 hover:text-white hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="p-2 rounded-lg bg-poker-bg border border-poker-border text-gray-400 hover:text-white hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={goNext}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
        >
          Next
        </button>
        <button
          onClick={goNext}
          disabled={currentStep === steps.length - 1}
          className="p-2 rounded-lg bg-poker-bg border border-poker-border text-gray-400 hover:text-white hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={goEnd}
          disabled={currentStep === steps.length - 1}
          className="p-2 rounded-lg bg-poker-bg border border-poker-border text-gray-400 hover:text-white hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-poker-bg rounded-full h-1">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Notes */}
      {hand.notes && (
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 text-sm text-blue-200">
          <div className="text-xs text-blue-400 uppercase tracking-wide mb-1 font-semibold">Study Note</div>
          {hand.notes}
        </div>
      )}
    </div>
  );
}
