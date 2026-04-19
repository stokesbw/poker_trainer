// ============================================================
// ICM Calculator (Independent Chip Model)
// ============================================================

/**
 * Standard ICM calculation using recursive probability model.
 * Calculates each player's $EV based on their chip stack relative to others
 * and the tournament payout structure.
 */
export function calculateICM(stacks: number[], payouts: number[]): number[] {
  const n = stacks.length;
  const totalChips = stacks.reduce((a, b) => a + b, 0);
  const equities = new Array(n).fill(0);

  // Recursive helper: probability player [playerIdx] finishes in [place]
  // given a subset of players still in
  function calcProb(
    playerIdx: number,
    remainingPlayers: number[],
    targetPlace: number
  ): number {
    if (remainingPlayers.length === 0) return 0;
    if (targetPlace === 1) {
      const totalRemaining = remainingPlayers.reduce(
        (sum, i) => sum + stacks[i],
        0
      );
      return stacks[playerIdx] / totalRemaining;
    }

    let prob = 0;
    const totalRemaining = remainingPlayers.reduce(
      (sum, i) => sum + stacks[i],
      0
    );

    for (const finishFirst of remainingPlayers) {
      if (finishFirst === playerIdx) continue;
      const pFinishFirst = stacks[finishFirst] / totalRemaining;
      const newRemaining = remainingPlayers.filter((p) => p !== finishFirst);
      prob +=
        pFinishFirst *
        calcProb(playerIdx, newRemaining, targetPlace - 1);
    }

    return prob;
  }

  const allPlayers = stacks.map((_, i) => i);

  for (let player = 0; player < n; player++) {
    for (let place = 0; place < Math.min(payouts.length, n); place++) {
      const prob = calcProb(player, allPlayers, place + 1);
      equities[player] += prob * payouts[place];
    }
  }

  return equities.map((e) => Math.round(e * 100) / 100);
}

/**
 * Simplified ICM for large fields - uses chip-count proportional model
 * with payout weighting (faster but less accurate)
 */
export function calculateSimpleICM(stacks: number[], payouts: number[]): number[] {
  const totalChips = stacks.reduce((a, b) => a + b, 0);
  const totalPrize = payouts.reduce((a, b) => a + b, 0);

  // Weight by stack proportion, adjusted for top-heavy payouts
  return stacks.map((stack) => {
    const chipPct = stack / totalChips;
    // Simple linear approximation
    return Math.round(chipPct * totalPrize * 100) / 100;
  });
}

/**
 * Calculate ICM pressure for a push/fold decision
 * Returns how much EV (in $) you gain or lose vs chip EV
 */
export interface PushFoldICMResult {
  chipEV: number;
  icmEV_push: number;
  icmEV_fold: number;
  icmAdvantage: number; // positive = push is better
  recommendation: "push" | "fold" | "marginal";
}

export function calculatePushFoldICM(
  heroStack: number,
  bbStack: number,
  otherStacks: number[],
  payouts: number[],
  winProbability: number // 0-1, hero's equity vs BB's calling range
): PushFoldICMResult {
  const totalChips = heroStack + bbStack + otherStacks.reduce((a, b) => a + b, 0);

  // Current ICM equity
  const currentStacks = [heroStack, bbStack, ...otherStacks];
  const currentICM = calculateICM(currentStacks, payouts);

  // Win scenario: hero doubles up
  const winStack = heroStack + bbStack;
  const winStacks = [winStack, 0, ...otherStacks]; // BB busts (simplified)
  const actualWinStacks = winStacks.filter((s) => s > 0);
  const winPayouts = payouts.slice(0, actualWinStacks.length);
  const winICM = calculateICM(actualWinStacks, winPayouts);

  // Lose scenario: hero busts
  const loseStacks = [0, heroStack + bbStack, ...otherStacks].filter((s) => s > 0);
  const losePayouts = payouts.slice(0, loseStacks.length);
  const loseICM = calculateICM(loseStacks, losePayouts);

  const icmEV_push =
    winProbability * winICM[0] + (1 - winProbability) * (loseICM[0] ?? 0);

  const icmEV_fold = currentICM[0]; // fold keeps current stack

  const chipEV =
    winProbability * (heroStack + bbStack) +
    (1 - winProbability) * 0;

  const icmAdvantage = icmEV_push - icmEV_fold;

  let recommendation: "push" | "fold" | "marginal";
  if (icmAdvantage > icmEV_fold * 0.02) recommendation = "push";
  else if (icmAdvantage < -icmEV_fold * 0.02) recommendation = "fold";
  else recommendation = "marginal";

  return {
    chipEV: Math.round(chipEV * 100) / 100,
    icmEV_push: Math.round(icmEV_push * 100) / 100,
    icmEV_fold: Math.round(icmEV_fold * 100) / 100,
    icmAdvantage: Math.round(icmAdvantage * 100) / 100,
    recommendation,
  };
}

// ============================================================
// Common MTT Payout Structures
// ============================================================

export const PAYOUT_STRUCTURES = {
  "9-handed_final_table": [50, 30, 12, 5, 3], // as percentages
  "180-man_final_18": [100, 60, 40, 25, 18, 14, 10, 8, 7, 6, 5, 4, 3, 3, 3, 2, 2, 2],
  satellite_2seats: [1, 1, 0, 0, 0, 0, 0, 0, 0], // top 2 win seat
  satellite_1seat: [1, 0, 0, 0, 0, 0, 0, 0, 0], // top 1 wins seat
};
