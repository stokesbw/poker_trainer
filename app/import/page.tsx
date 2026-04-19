"use client";

import { useState, useCallback, useRef } from "react";
import type { HandHistory } from "@/lib/poker/types";
import { HandReplayer } from "@/components/poker/HandReplayer";
import { parseMultipleHands } from "@/lib/poker/hand-parser";
import { SAMPLE_HANDS } from "@/data/sample-hands";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, Check, AlertCircle, Tag, ChevronRight, Info } from "lucide-react";

const SAMPLE_HH = `PokerStars Hand #240123456789: Tournament #3456789012, $10+$1 USD Hold'em No Limit - Level VI (100/200) - 2024/01/15 20:45:00 ET
Table '3456789012 4' 9-max Seat #4 is the button
Seat 1: Player1 (4800 in chips)
Seat 2: Player2 (6200 in chips)
Seat 3: Player3 (5100 in chips)
Seat 4: Player4 (3900 in chips)
Seat 5: Hero (4200 in chips)
Seat 6: Player6 (7800 in chips)
Seat 7: Player7 (5500 in chips)
Seat 8: Player8 (4400 in chips)
Seat 9: Player9 (6100 in chips)
Player1: posts ante 25
Player2: posts ante 25
Player3: posts ante 25
Player4: posts ante 25
Hero: posts ante 25
Player6: posts ante 25
Player7: posts ante 25
Player8: posts ante 25
Player9: posts ante 25
Player5: posts small blind 100
Hero: posts big blind 200
*** HOLE CARDS ***
Dealt to Hero [Ah Kd]
Player6: folds
Player7: folds
Player8: raises 400 to 600
Player9: folds
Player1: folds
Player2: folds
Player3: folds
Player4: folds
Player5: folds
Hero: raises 1400 to 2000
Player8: folds
Hero collected 1525 from pot
*** SUMMARY ***
Total pot 1525 | Rake 0`;

export default function ImportPage() {
  const [rawText, setRawText] = useState("");
  const [parsedHands, setParsedHands] = useState<HandHistory[]>([]);
  const [selectedHand, setSelectedHand] = useState<HandHistory | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [sessionHands, setSessionHands] = useState<HandHistory[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = useCallback(() => {
    if (!rawText.trim()) {
      setParseError("Paste a hand history first");
      return;
    }
    try {
      const hands = parseMultipleHands(rawText);
      if (hands.length === 0) {
        setParseError("Could not parse any hands. Make sure you're pasting PokerStars or GGPoker hand history format.");
        setParseSuccess(false);
      } else {
        setParsedHands(hands);
        setSelectedHand(hands[0]);
        setParseError(null);
        setParseSuccess(true);
        setSessionHands(prev => [...hands, ...prev]);
      }
    } catch (e) {
      setParseError("Parse error: " + String(e));
    }
  }, [rawText]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  }, []);

  const clearAll = useCallback(() => {
    setRawText("");
    setParsedHands([]);
    setSelectedHand(null);
    setParseError(null);
    setParseSuccess(false);
  }, []);

  const allHands = [...sessionHands.filter(h => !SAMPLE_HANDS.find(s => s.id === h.id))];
  const displayHands = allHands.length > 0 ? allHands : parsedHands;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
          <Upload size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Import Hands</h1>
          <p className="text-gray-400 text-sm">Paste PokerStars or GGPoker hand histories to replay and study them</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          {/* Format info */}
          <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 flex gap-3 text-sm">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-blue-200">
              Supports <span className="font-semibold">PokerStars</span> and <span className="font-semibold">GGPoker</span> hand history format.
              Copy from your HUD (PT4, HM3, DriveHUD) or directly from the client. You can paste a single hand or an entire session file.
            </div>
          </div>

          {/* Paste box */}
          <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Paste Hand History</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRawText(SAMPLE_HH)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Load sample
                </button>
                {rawText && (
                  <button onClick={() => setRawText("")} className="text-gray-500 hover:text-gray-300 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={rawText}
              onChange={e => { setRawText(e.target.value); setParseSuccess(false); setParseError(null); }}
              placeholder={`Paste hand history here...\n\nExample:\nPokerStars Hand #240123456789: Tournament...\nSeat 1: Player1 (4800 in chips)\n...`}
              className="w-full h-64 bg-poker-bg border border-poker-border rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 font-mono resize-none focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* File upload */}
          <div
            className="border-2 border-dashed border-poker-border rounded-xl p-6 text-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-950/10 transition-all"
            onClick={() => fileRef.current?.click()}
          >
            <FileText size={24} className="text-gray-500 mx-auto mb-2" />
            <div className="text-gray-400 text-sm">Or drop a .txt hand history file here</div>
            <div className="text-gray-500 text-xs mt-1">Click to browse</div>
            <input ref={fileRef} type="file" accept=".txt,.hh" onChange={handleFile} className="hidden" />
          </div>

          {/* Parse button */}
          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            Parse Hand History
          </button>

          {/* Feedback */}
          {parseError && (
            <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/50 rounded-xl p-3 text-red-300 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}
          {parseSuccess && (
            <div className="flex items-center gap-2 bg-green-950/40 border border-green-800/50 rounded-xl p-3 text-green-300 text-sm">
              <Check size={16} />
              Parsed {parsedHands.length} hand{parsedHands.length !== 1 ? "s" : ""} successfully
            </div>
          )}

          {/* Parsed hand list */}
          {parsedHands.length > 0 && (
            <div className="bg-poker-surface rounded-xl border border-poker-border p-4">
              <div className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                Parsed Hands ({parsedHands.length})
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {parsedHands.map((hand, i) => (
                  <button
                    key={hand.id}
                    onClick={() => setSelectedHand(hand)}
                    className={cn(
                      "text-left p-3 rounded-xl border transition-all text-sm",
                      selectedHand?.id === hand.id
                        ? "bg-orange-900/30 border-orange-600/50 text-white"
                        : "bg-poker-bg border-poker-border text-gray-400 hover:text-white hover:border-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Hand {i + 1}: {hand.heroPosition} ({hand.effectiveStack}BB)</span>
                      <ChevronRight size={14} />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {hand.format} | {hand.blinds.sb}/{hand.blinds.bb} | {hand.players.length} players
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Replayer */}
        <div>
          {selectedHand ? (
            <div className="flex flex-col gap-4">
              <div className="bg-orange-950/20 border border-orange-800/30 rounded-xl p-3 text-sm text-orange-200 flex items-center gap-2">
                <Check size={14} className="text-orange-400" />
                Hand imported successfully — stepping through below
              </div>
              <HandReplayer hand={selectedHand} />
            </div>
          ) : (
            <div className="bg-poker-surface rounded-xl border border-poker-border p-12 text-center h-full flex flex-col items-center justify-center gap-4">
              <Upload size={40} className="text-gray-600" />
              <div className="text-gray-400">
                Paste a hand history and click Parse to replay it here
              </div>
              <div className="text-gray-500 text-sm">
                Supports single hands or full session files
              </div>
              <button
                onClick={() => { setRawText(SAMPLE_HH); }}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Try with a sample hand
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
