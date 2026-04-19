"use client";

import { useState } from "react";
import { HandReplayer } from "@/components/poker/HandReplayer";
import { SAMPLE_HANDS } from "@/data/sample-hands";
import { cn } from "@/lib/utils";
import { BookOpen, Tag } from "lucide-react";

export default function ReplayerPage() {
  const [selectedHandId, setSelectedHandId] = useState(SAMPLE_HANDS[0].id);
  const selectedHand = SAMPLE_HANDS.find((h) => h.id === selectedHandId)!;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Hand Replayer</h1>
          <p className="text-gray-400 text-sm">Step through MTT hands to study key spots</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hand List */}
        <div className="lg:col-span-1">
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Hand Library
            </div>
            <div className="flex flex-col gap-2">
              {SAMPLE_HANDS.map((hand) => (
                <button
                  key={hand.id}
                  onClick={() => setSelectedHandId(hand.id)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    selectedHandId === hand.id
                      ? "bg-purple-900/30 border-purple-600/50 text-white"
                      : "bg-poker-bg border-poker-border text-gray-400 hover:text-white hover:border-gray-500"
                  )}
                >
                  <div className="font-semibold text-sm mb-1">
                    {hand.heroPosition} - {hand.effectiveStack}BB
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {hand.format} | {hand.blinds.sb}/{hand.blinds.bb}
                    {hand.blinds.ante ? `/${hand.blinds.ante}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hand.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 text-xs bg-purple-950/50 text-purple-300 border border-purple-800/30 px-1.5 py-0.5 rounded"
                      >
                        <Tag size={9} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Add your own hint */}
            <div className="mt-4 p-3 bg-poker-bg/50 rounded-xl border border-poker-border text-xs text-gray-500 text-center">
              More hands coming soon. Export hands from your HUD and import them here.
            </div>
          </div>
        </div>

        {/* Replayer */}
        <div className="lg:col-span-2">
          <HandReplayer hand={selectedHand} />
        </div>
      </div>
    </div>
  );
}
