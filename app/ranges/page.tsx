"use client";

import { useState, useCallback } from "react";
import { RangeGrid } from "@/components/poker/RangeGrid";
import { HandDetailPanel } from "@/components/poker/HandDetailPanel";
import { MTT_SPOTS } from "@/data/mtt-spots";
import { getHandActionBreakdown, type HandActionBreakdown } from "@/lib/poker/action-frequencies";
import { cn } from "@/lib/utils";
import { Layers, MousePointerClick } from "lucide-react";
import { POSITION_COLORS } from "@/lib/poker/constants";
import { rangeToPercent, countCombos } from "@/lib/poker/range-utils";

const CATEGORIES = [
  { id: "push-fold", label: "Push/Fold" },
  { id: "open-raise", label: "Open Raise" },
  { id: "3bet", label: "3-Bet" },
  { id: "4bet", label: "4-Bet" },
  { id: "vs-squeeze", label: "Squeeze" },
  { id: "blind-vs-blind", label: "Blind vs Blind" },
  { id: "cbet-flop", label: "Flop C-Bet" },
  { id: "cbet-turn", label: "Turn Barrel" },
  { id: "check-raise", label: "Check-Raise" },
];

const STACK_FILTERS = [
  { label: "All stacks", min: 0, max: 999 },
  { label: "Shove zone (1-20BB)", min: 1, max: 20 },
  { label: "Mid-stack (20-40BB)", min: 20, max: 40 },
  { label: "Deep (40BB+)", min: 40, max: 999 },
];

export default function RangesPage() {
  const [activeCategory, setActiveCategory] = useState("push-fold");
  const [activeSpotId, setActiveSpotId] = useState(MTT_SPOTS[0].id);
  const [stackFilter, setStackFilter] = useState(0);
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<HandActionBreakdown | null>(null);

  const filter = STACK_FILTERS[stackFilter];
  const filteredSpots = MTT_SPOTS.filter(
    (s) =>
      s.category === activeCategory &&
      s.stackDepthBB >= filter.min &&
      s.stackDepthBB <= filter.max
  );

  const activeSpot =
    filteredSpots.find((s) => s.id === activeSpotId) ?? filteredSpots[0];

  const pct = activeSpot ? rangeToPercent(activeSpot.heroRange) : 0;
  const combos = activeSpot ? countCombos(activeSpot.heroRange) : 0;

  const handleHandClick = useCallback((hand: string) => {
    if (!activeSpot) return;
    setSelectedHand(hand);
    setBreakdown(getHandActionBreakdown(hand, activeSpot));
  }, [activeSpot]);

  const handleSpotChange = (spotId: string) => {
    setActiveSpotId(spotId);
    setSelectedHand(null);
    setBreakdown(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Range Library</h1>
          <p className="text-gray-400 text-sm">Click any hand to see fold / call / raise frequencies</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              const firstSpot = MTT_SPOTS.find((s) => s.category === cat.id);
              if (firstSpot) handleSpotChange(firstSpot.id);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
              activeCategory === cat.id
                ? "bg-green-600 border-green-500 text-white"
                : "bg-poker-surface border-poker-border text-gray-400 hover:text-white hover:border-gray-500"
            )}
          >
            {cat.label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={stackFilter}
            onChange={(e) => setStackFilter(Number(e.target.value))}
            className="bg-poker-surface border border-poker-border text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
          >
            {STACK_FILTERS.map((f, i) => (
              <option key={i} value={i}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Spot List */}
        <div className="lg:col-span-1">
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              {filteredSpots.length} Spots
            </div>
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredSpots.length === 0 && (
                <div className="text-gray-500 text-sm italic py-4 text-center">No spots match this filter</div>
              )}
              {filteredSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotChange(spot.id)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    activeSpotId === spot.id
                      ? "bg-green-900/30 border-green-600/50 text-white"
                      : "bg-poker-bg border-poker-border text-gray-400 hover:text-white hover:border-gray-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{spot.name}</span>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{
                        color: POSITION_COLORS[spot.position] ?? "#9ca3af",
                        backgroundColor: (POSITION_COLORS[spot.position] ?? "#9ca3af") + "22",
                      }}
                    >
                      {spot.position}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {spot.stackDepthBB}BB | {spot.format}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Range Grid */}
        <div className="lg:col-span-2">
          {activeSpot ? (
            <div className="flex flex-col gap-4">
              {/* Spot Header */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeSpot.name}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">{activeSpot.description}</p>
                  </div>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full shrink-0 ml-3"
                    style={{
                      color: POSITION_COLORS[activeSpot.position],
                      backgroundColor: POSITION_COLORS[activeSpot.position] + "22",
                      border: `1px solid ${POSITION_COLORS[activeSpot.position]}44`,
                    }}
                  >
                    {activeSpot.position}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div className="bg-poker-bg rounded-lg px-3 py-1.5">
                    <span className="text-green-400 font-bold">{pct.toFixed(1)}%</span>
                    <span className="text-gray-400 ml-1 text-xs">of hands</span>
                  </div>
                  <div className="bg-poker-bg rounded-lg px-3 py-1.5">
                    <span className="text-blue-400 font-bold">{combos.toFixed(0)}</span>
                    <span className="text-gray-400 ml-1 text-xs">combos</span>
                  </div>
                  <div className="bg-poker-bg rounded-lg px-3 py-1.5">
                    <span className="text-yellow-400 font-bold capitalize">{activeSpot.gtoAction}</span>
                    <span className="text-gray-400 ml-1 text-xs">GTO action</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                    <MousePointerClick size={12} />
                    Click any hand for breakdown
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
                <RangeGrid
                  range={activeSpot.heroRange}
                  selectedHand={selectedHand ?? undefined}
                  onHandClick={handleHandClick}
                  showStats
                  colorScheme="green"
                />
              </div>

              {/* Explanation */}
              <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
                <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">GTO Explanation</div>
                <p className="text-gray-300 text-sm leading-relaxed">{activeSpot.explanation}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeSpot.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-poker-bg text-gray-400 border border-poker-border px-2 py-0.5 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-poker-surface rounded-xl border border-poker-border p-12 text-center text-gray-500">
              Select a spot from the left panel
            </div>
          )}
        </div>

        {/* Hand Detail Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <HandDetailPanel
              breakdown={breakdown}
              onClose={() => { setSelectedHand(null); setBreakdown(null); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
