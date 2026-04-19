"use client";

import type { HandActionBreakdown, ActionFrequency } from "@/lib/poker/action-frequencies";
import { cn } from "@/lib/utils";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HandDetailPanelProps {
  breakdown: HandActionBreakdown | null;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

const COLOR_MAP = {
  green: {
    bar: "bg-green-500",
    text: "text-green-400",
    bg: "bg-green-900/30 border-green-700/40",
    badge: "bg-green-600",
  },
  blue: {
    bar: "bg-blue-500",
    text: "text-blue-400",
    bg: "bg-blue-900/30 border-blue-700/40",
    badge: "bg-blue-600",
  },
  red: {
    bar: "bg-red-500",
    text: "text-red-400",
    bg: "bg-red-900/20 border-red-800/30",
    badge: "bg-red-700",
  },
  yellow: {
    bar: "bg-yellow-500",
    text: "text-yellow-400",
    bg: "bg-yellow-900/20 border-yellow-800/30",
    badge: "bg-yellow-600",
  },
};

function ActionBar({ action, compact }: { action: ActionFrequency; compact?: boolean }) {
  const colors = COLOR_MAP[action.color as keyof typeof COLOR_MAP] ?? COLOR_MAP.blue;
  const isEmpty = action.frequency === 0;

  return (
    <div className={cn("rounded-xl border p-3", colors.bg, isEmpty && "opacity-40")}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{action.label}</span>
          {action.sizing && (
            <span className="text-xs text-gray-400 bg-poker-bg px-1.5 py-0.5 rounded font-mono">
              {action.sizing}
            </span>
          )}
        </div>
        <span className={cn("text-2xl font-black tabular-nums", colors.text)}>
          {action.frequency}%
        </span>
      </div>

      {/* Frequency bar */}
      <div className="h-2.5 bg-poker-bg rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
          style={{ width: `${action.frequency}%` }}
        />
      </div>

      {action.ev && (
        <div className="text-xs text-gray-400 mt-1.5">{action.ev}</div>
      )}
    </div>
  );
}

export function HandDetailPanel({
  breakdown,
  onClose,
  className,
  compact = false,
}: HandDetailPanelProps) {
  if (!breakdown) {
    return (
      <div className={cn(
        "bg-poker-surface rounded-xl border border-poker-border p-6 text-center text-gray-500 text-sm",
        className
      )}>
        Click any hand in the grid to see action frequencies
      </div>
    );
  }

  const primaryAction = breakdown.actions.find(a => a.action !== "fold");
  const foldAction = breakdown.actions.find(a => a.action === "fold");

  return (
    <div className={cn("bg-poker-surface rounded-xl border border-poker-border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-poker-border">
        <div className="flex items-center gap-3">
          {/* Big hand label */}
          <div className="text-3xl font-black text-white tracking-wide">{breakdown.hand}</div>
          <div>
            <div className="text-xs text-gray-400">{breakdown.spotName}</div>
            <div className="text-xs text-gray-500">{breakdown.position}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Primary action badge */}
          <div className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
            breakdown.primaryAction === "fold" ? "bg-red-700 text-white" :
            breakdown.primaryAction === "call" ? "bg-blue-600 text-white" :
            "bg-green-600 text-white"
          )}>
            {breakdown.primaryAction === "all-in" ? "SHOVE" :
             breakdown.primaryAction === "raise" ? "RAISE" :
             breakdown.primaryAction === "call" ? "CALL" :
             breakdown.primaryAction === "bet" ? "BET" :
             breakdown.primaryAction.toUpperCase()}
          </div>
          {onClose && (
            <button onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Action Bars */}
      <div className="p-4 flex flex-col gap-2">
        {breakdown.actions.map((action, i) => (
          <ActionBar key={i} action={action} compact={compact} />
        ))}
      </div>

      {/* Visual summary bar */}
      <div className="px-4 pb-3">
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {breakdown.actions.map((action, i) => {
            const colors = COLOR_MAP[action.color as keyof typeof COLOR_MAP];
            return action.frequency > 0 ? (
              <div
                key={i}
                className={cn("h-full transition-all duration-500", colors.bar)}
                style={{ width: `${action.frequency}%` }}
                title={`${action.label}: ${action.frequency}%`}
              />
            ) : null;
          })}
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <div className="flex gap-3">
            {breakdown.actions.filter(a => a.frequency > 0).map((a, i) => {
              const colors = COLOR_MAP[a.color as keyof typeof COLOR_MAP];
              return (
                <span key={i} className={cn("flex items-center gap-1", colors.text)}>
                  <div className={cn("w-2 h-2 rounded-sm", colors.bar)} />
                  {a.label}
                </span>
              );
            })}
          </div>
          <span>100%</span>
        </div>
      </div>

      {/* Notes */}
      {breakdown.notes && !compact && (
        <div className="px-4 pb-4">
          <div className="bg-poker-bg rounded-xl p-3 text-xs text-gray-400 leading-relaxed border border-poker-border">
            {breakdown.notes}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Compact inline version for hovering over the range grid
// ============================================================

export function HandFrequencyTooltip({ breakdown }: { breakdown: HandActionBreakdown }) {
  return (
    <div className="bg-poker-bg border border-poker-border rounded-xl p-3 shadow-2xl min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-black text-xl">{breakdown.hand}</span>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          breakdown.primaryAction === "fold" ? "bg-red-700 text-white" :
          breakdown.primaryAction === "call" ? "bg-blue-600 text-white" :
          "bg-green-600 text-white"
        )}>
          {breakdown.primaryAction === "all-in" ? "SHOVE" : breakdown.primaryAction.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {breakdown.actions.map((action, i) => {
          const colors = COLOR_MAP[action.color as keyof typeof COLOR_MAP];
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <div className={cn("w-2 h-2 rounded-sm shrink-0", colors.bar)} />
                <span className="text-gray-300 text-xs">{action.label}</span>
              </div>
              <span className={cn("font-bold text-sm tabular-nums", colors.text)}>
                {action.frequency}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
