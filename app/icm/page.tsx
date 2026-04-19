"use client";

import { useState, useCallback } from "react";
import { calculateICM, PAYOUT_STRUCTURES } from "@/lib/poker/icm-calculator";
import { cn } from "@/lib/utils";
import { Calculator, Plus, Trash2, Info } from "lucide-react";

interface PlayerEntry {
  id: string;
  name: string;
  chips: number;
}

interface PayoutEntry {
  place: number;
  amount: number;
}

const PRESET_STRUCTURES = [
  {
    label: "9-Player Final Table",
    payouts: [50, 30, 12, 5, 2, 1],
    stacks: [45000, 38000, 31000, 27000, 22000, 18000, 14000, 10000, 6000],
  },
  {
    label: "6-Max Final Table",
    payouts: [50, 28, 16, 6],
    stacks: [55000, 42000, 30000, 22000, 15000, 8000],
  },
  {
    label: "Satellite (2 seats)",
    payouts: [100, 100, 0, 0, 0, 0],
    stacks: [35000, 30000, 25000, 20000, 15000, 10000],
  },
  {
    label: "Heads Up",
    payouts: [65, 35],
    stacks: [80000, 40000],
  },
];

export default function ICMPage() {
  const [players, setPlayers] = useState<PlayerEntry[]>([
    { id: "1", name: "Hero", chips: 35000 },
    { id: "2", name: "Player 2", chips: 28000 },
    { id: "3", name: "Player 3", chips: 22000 },
    { id: "4", name: "Player 4", chips: 15000 },
  ]);

  const [payouts, setPayouts] = useState<PayoutEntry[]>([
    { place: 1, amount: 5000 },
    { place: 2, amount: 3000 },
    { place: 3, amount: 1500 },
    { place: 4, amount: 500 },
  ]);

  const [icmResults, setIcmResults] = useState<number[] | null>(null);

  const totalChips = players.reduce((sum, p) => sum + p.chips, 0);
  const totalPrize = payouts.reduce((sum, p) => sum + p.amount, 0);

  const calculate = useCallback(() => {
    const stacks = players.map((p) => p.chips);
    const payoutAmounts = payouts.map((p) => p.amount);
    const results = calculateICM(stacks, payoutAmounts);
    setIcmResults(results);
  }, [players, payouts]);

  const addPlayer = () => {
    setIcmResults(null);
    setPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `Player ${prev.length + 1}`, chips: 10000 },
    ]);
  };

  const removePlayer = (id: string) => {
    setIcmResults(null);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlayer = (id: string, field: keyof PlayerEntry, value: string | number) => {
    setIcmResults(null);
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const loadPreset = (preset: typeof PRESET_STRUCTURES[0]) => {
    setIcmResults(null);
    const newPlayers = preset.stacks.map((chips, i) => ({
      id: (i + 1).toString(),
      name: i === 0 ? "Hero" : `Player ${i + 1}`,
      chips,
    }));
    setPlayers(newPlayers);
    setPayouts(preset.payouts.map((amount, i) => ({ place: i + 1, amount })));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">ICM Calculator</h1>
          <p className="text-gray-400 text-sm">Calculate tournament equity for any stack configuration</p>
        </div>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-gray-400 text-sm">Presets:</span>
        {PRESET_STRUCTURES.map((preset) => (
          <button
            key={preset.label}
            onClick={() => loadPreset(preset)}
            className="px-3 py-1.5 rounded-lg bg-poker-surface border border-poker-border text-gray-300 text-sm hover:border-red-500 hover:text-white transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="flex flex-col gap-4">
          {/* Players */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Players ({players.length})
              </div>
              <button
                onClick={addPlayer}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add Player
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {players.map((player, i) => (
                <div key={player.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(player.id, "name", e.target.value)}
                    className="flex-1 bg-poker-bg border border-poker-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Player name"
                  />
                  <input
                    type="number"
                    value={player.chips}
                    onChange={(e) => updatePlayer(player.id, "chips", parseInt(e.target.value) || 0)}
                    className="w-28 bg-poker-bg border border-poker-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 text-right"
                    placeholder="Chips"
                  />
                  <span className="text-gray-500 text-xs w-12 text-right">
                    {totalChips > 0 ? Math.round((player.chips / totalChips) * 100) : 0}%
                  </span>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    disabled={players.length <= 2}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-poker-border flex justify-between text-xs text-gray-400">
              <span>Total chips:</span>
              <span className="text-white font-mono">{totalChips.toLocaleString()}</span>
            </div>
          </div>

          {/* Payouts */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
            <div className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
              Payout Structure
            </div>
            <div className="flex flex-col gap-2">
              {payouts.map((payout, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm w-16">
                    {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th"}`}
                  </span>
                  <input
                    type="number"
                    value={payout.amount}
                    onChange={(e) => {
                      setIcmResults(null);
                      setPayouts((prev) =>
                        prev.map((p, j) =>
                          j === i ? { ...p, amount: parseInt(e.target.value) || 0 } : p
                        )
                      );
                    }}
                    className="flex-1 bg-poker-bg border border-poker-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 text-right"
                    placeholder="$"
                  />
                  <span className="text-green-400 text-xs w-16 text-right font-mono">
                    {totalPrize > 0 ? Math.round((payout.amount / totalPrize) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-poker-border flex justify-between text-xs text-gray-400">
              <span>Total prize pool:</span>
              <span className="text-white font-mono">${totalPrize.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
          >
            Calculate ICM Equity
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {icmResults ? (
            <div className="bg-poker-surface rounded-xl border border-poker-border p-5">
              <div className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
                ICM Results
              </div>
              <div className="flex flex-col gap-3">
                {players.map((player, i) => {
                  const equity = icmResults[i];
                  const chipPct = totalChips > 0 ? (player.chips / totalChips) * 100 : 0;
                  const icmPct = totalPrize > 0 ? (equity / totalPrize) * 100 : 0;
                  const diff = icmPct - chipPct;
                  const isHero = player.name === "Hero" || i === 0;

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "rounded-xl border p-4",
                        isHero
                          ? "bg-blue-950/30 border-blue-800/50"
                          : "bg-poker-bg border-poker-border"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn("font-semibold", isHero ? "text-blue-300" : "text-white")}>
                          {player.name}
                          {isHero && <span className="ml-2 text-xs text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded">YOU</span>}
                        </span>
                        <span className="text-white font-bold text-lg">
                          ${equity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">Chips: </span>
                          <span className="text-white">{player.chips.toLocaleString()}</span>
                          <span className="text-gray-500 ml-1">({chipPct.toFixed(1)}%)</span>
                        </div>
                        <div>
                          <span className="text-gray-400">ICM%: </span>
                          <span className="text-white">{icmPct.toFixed(1)}%</span>
                        </div>
                        <div className={cn(diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-400")}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}% vs chip EV
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="mt-2 h-1.5 bg-poker-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(icmPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ICM Insight */}
              <div className="mt-4 bg-poker-bg rounded-xl p-4 border border-poker-border">
                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <Info size={12} className="mt-0.5 shrink-0 text-blue-400" />
                  <div>
                    <span className="text-gray-300 font-semibold">ICM Insight: </span>
                    ICM equity is lower than chip % for large stacks because of the risk of elimination. This is why chip leaders should be more conservative near bubble/money spots, and short stacks have more incentive to gamble when desperate.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-poker-surface rounded-xl border border-poker-border p-12 text-center">
              <Calculator size={40} className="text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400">
                Enter stacks and payouts, then click Calculate to see ICM equity
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Or load a preset from the top to get started quickly
              </div>
            </div>
          )}

          {/* ICM Info */}
          <div className="mt-4 bg-poker-surface rounded-xl border border-poker-border p-5">
            <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              What is ICM?
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-2">
              <p>
                ICM (Independent Chip Model) converts chip stacks into dollar equity based on the probability of finishing in each payout position.
              </p>
              <p>
                Key insight: doubling your chips doesn't double your $EV. A chip leader going from 50% to 100% of chips gains far less than 50% of the prize pool because winning is the only way to capitalize.
              </p>
              <p>
                This is why tournament play requires tighter ranges than chip-EV would suggest, especially near pay jumps and the bubble.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
