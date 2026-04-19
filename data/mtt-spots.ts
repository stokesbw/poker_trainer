import type { Spot } from "@/lib/poker/types";
import { parseRangeString } from "@/lib/poker/range-utils";

// ============================================================
// Pre-solved MTT Spot Library
// Covers the most common and highest-value study spots
// ============================================================

export const MTT_SPOTS: Spot[] = [
  // ============================================================
  // PUSH / FOLD SPOTS
  // ============================================================
  {
    id: "pf-btn-10bb",
    name: "BTN Push/Fold (10BB)",
    description: "Button shove vs SB/BB with 10 big blinds",
    format: "MTT",
    category: "push-fold",
    stackDepthBB: 10,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,KTo,QJo,JTo,T9o"
    ),
    gtoAction: "all-in",
    explanation:
      "At 10BB on the button with no limpers, your entire range should be either shove or fold. The BTN push range at 10BB is extremely wide (roughly 60% of hands) because: (1) fold equity is high, (2) you close the action preflop, (3) antes make it +EV to accumulate. Any pair, any ace, most suited connectors/broadways, and many suited/connected hands are profitable shoves.",
    tags: ["push-fold", "btn", "10bb", "late-stage"],
  },
  {
    id: "pf-co-10bb",
    name: "CO Push/Fold (10BB)",
    description: "Cutoff shove with 10 big blinds, folded to hero",
    format: "MTT",
    category: "push-fold",
    stackDepthBB: 10,
    position: "CO",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,A4o,KQo,KJo,QJo"
    ),
    gtoAction: "all-in",
    explanation:
      "CO 10BB shove range is still very wide (approx 48% of hands) but we respect the BTN/SB/BB behind us. We cut the very bottom of connected suits but still shove all pairs, all aces, most broadway combos, and suited connectors down to 76s.",
    tags: ["push-fold", "co", "10bb", "late-stage"],
  },
  {
    id: "pf-utg-10bb",
    name: "UTG Push/Fold (10BB)",
    description: "UTG shove with 10 big blinds at a 9-handed table",
    format: "MTT",
    category: "push-fold",
    stackDepthBB: 10,
    position: "UTG",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,A4o,KQo,KJo"
    ),
    gtoAction: "all-in",
    explanation:
      "UTG 10BB is tighter than BTN/CO because 8 players act behind you. We still shove nearly all pairs (except 55 and below are marginal), all aces, broadways, and suited connectors to 76s. The key difference from BTN: no suited gappers, tighter with offsuit hands.",
    tags: ["push-fold", "utg", "10bb", "late-stage"],
  },
  {
    id: "pf-sb-vs-bb-10bb",
    name: "SB vs BB Push/Fold (10BB)",
    description: "SB shove vs BB heads up at 10 big blinds",
    format: "MTT",
    category: "push-fold",
    stackDepthBB: 10,
    position: "SB",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,J9s,T9s,T8s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,KQo,KJo,JTo"
    ),
    gtoAction: "all-in",
    explanation:
      "SB vs BB is the widest push spot since you only have one caller behind. At 10BB, the SB shove range is approximately 65% of hands. You add hands like 33-22, K9s, J9s, T8s that are too weak to shove through multiple players. Mixed game theory suggests limping some strong hands at very shallow depths, but for simplicity, most spots are pure shove.",
    tags: ["push-fold", "sb", "blind-vs-blind", "10bb"],
  },
  {
    id: "pf-btn-15bb",
    name: "BTN Push/Fold (15BB)",
    description: "Button shove with 15 big blinds",
    format: "MTT",
    category: "push-fold",
    stackDepthBB: 15,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A5o,KQo,KJo,QJo"
    ),
    gtoAction: "all-in",
    explanation:
      "At 15BB from BTN, we start excluding some of the very weakest hands but still maintain a wide shoving range (approx 40%). Key hands that become folds: 44-22, A2o-A4o (mostly), low suited gappers. Key hands that stay in: all suited aces, all pairs from 55+, broadways, suited connectors to 76s.",
    tags: ["push-fold", "btn", "15bb"],
  },
  // ============================================================
  // OPEN RAISE SPOTS
  // ============================================================
  {
    id: "open-btn-25bb",
    name: "BTN Open Raise (25BB)",
    description: "BTN standard open raise range at 25 big blinds",
    format: "MTT",
    category: "open-raise",
    stackDepthBB: 25,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,QJs,QTs,Q9s,Q8s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o"
    ),
    gtoAction: "raise",
    explanation:
      "At 25BB from BTN, we switch from shove/fold to min-raise or 2.2x open strategy. The BTN range is extremely wide here (approx 60%). With this stack depth, you have enough chips to use a standard raise and still fold to 3-bets profitably. Key additions vs shove range: suited gappers, more offsuit hands, low pocket pairs.",
    tags: ["open-raise", "btn", "25bb", "mid-stack"],
  },
  {
    id: "open-co-25bb",
    name: "CO Open Raise (25BB)",
    description: "CO standard open raise range at 25 big blinds",
    format: "MTT",
    category: "open-raise",
    stackDepthBB: 25,
    position: "CO",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,T8s,98s,87s,76s,65s,54s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,KQo,KJo,KTo,QJo,QTo,JTo,T9o"
    ),
    gtoAction: "raise",
    explanation:
      "CO at 25BB opens about 42% of hands. Similar to BTN but tighter in offsuit marginal hands. Still opens all small pairs, all suited aces, most suited broadways, suited connectors, and strong offsuit broadways.",
    tags: ["open-raise", "co", "25bb", "mid-stack"],
  },
  {
    id: "open-utg-25bb",
    name: "UTG Open Raise (25BB)",
    description: "UTG raise range at 25 big blinds, 9-handed",
    format: "MTT",
    category: "open-raise",
    stackDepthBB: 25,
    position: "UTG",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,AKs,AQs,AJs,ATs,A9s,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,AKo,AQo,AJo,ATo,KQo,KJo"
    ),
    gtoAction: "raise",
    explanation:
      "UTG range at 25BB is significantly tighter (approx 18%). We open value hands and strong drawing hands but avoid marginal speculative hands given 8 players behind. Pairs: 55+, Suited aces: A9s+ and A4s-A5s (wheel draws), Suited broadways, some suited connectors (T9s-JTs), Strong offsuit: AJo+, KQo-KJo.",
    tags: ["open-raise", "utg", "25bb", "mid-stack"],
  },
  // ============================================================
  // 3-BET SPOTS
  // ============================================================
  {
    id: "3bet-btn-vs-co-25bb",
    name: "BTN 3-Bet vs CO (25BB)",
    description: "BTN 3-bet range facing a CO open at 25 big blinds",
    format: "MTT",
    category: "3bet",
    stackDepthBB: 25,
    position: "BTN",
    villainPosition: "CO",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,QJs,JTs,T9s,98s,AKo,AQo,AJo,KQo"
    ),
    gtoAction: "raise",
    explanation:
      "BTN 3-bet range vs CO is polarized: strong value hands (AA-JJ, AK-AJ, KQs) plus bluffs with good blocker/equity properties (A5s, A4s, suited connectors). Hands like 99-77 and ATo are often flat-calls from BTN vs CO at this depth since you have position. The bluffs are suited aces and connectors that have equity when called.",
    tags: ["3bet", "btn", "vs-co", "25bb", "polarized"],
  },
  {
    id: "3bet-bb-vs-btn-25bb",
    name: "BB 3-Bet vs BTN (25BB)",
    description: "BB 3-bet range facing a BTN open at 25 big blinds",
    format: "MTT",
    category: "3bet",
    stackDepthBB: 25,
    position: "BB",
    villainPosition: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,ATs,A5s,A4s,A3s,A2s,KQs,KJs,K5s,QJs,JTs,T9s,98s,87s,76s,AKo,AQo,AJo,KQo"
    ),
    gtoAction: "raise",
    explanation:
      "BB vs BTN 3-bet is wider than other spots because: (1) BTN opens very wide, (2) BB has worst position but already has 1BB invested. Range includes strong value, suited connectors as bluffs, and low suited aces that block villain's strong aces while having reasonable equity. Always out of position postflop so we 3-bet to take initiative.",
    tags: ["3bet", "bb", "vs-btn", "blind-vs-blind", "25bb"],
  },
  // ============================================================
  // BLIND VS BLIND SPOTS
  // ============================================================
  {
    id: "bvb-sb-complete-25bb",
    name: "SB vs BB (Complete/Raise) 25BB",
    description: "SB facing BB with no other action at 25 big blinds",
    format: "MTT",
    category: "blind-vs-blind",
    stackDepthBB: 25,
    position: "SB",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,QJs,QTs,Q9s,Q8s,Q7s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,76s,65s,54s,43s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,KQo,KJo,KTo,K9o,K8o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o,76o"
    ),
    gtoAction: "raise",
    explanation:
      "SB vs BB is a unique spot. Modern GTO solvers advocate for a limping strategy at many stack depths, but for training purposes, playing a raise/fold approach with a wide range is solid. The SB should complete/min-raise roughly 80%+ of hands due to price. Never just fold to BB without serious stack depth considerations.",
    tags: ["blind-vs-blind", "sb", "25bb"],
  },
  // ============================================================
  // 4-BET SPOTS
  // ============================================================
  {
    id: "4bet-btn-vs-bb-3bet-25bb",
    name: "BTN 4-Bet vs BB 3-Bet (25BB)",
    description: "BTN faces a BB 3-bet at 25BB, deciding 4-bet or fold",
    format: "MTT",
    category: "4bet",
    stackDepthBB: 25,
    position: "BTN",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,AKs,AQs,A5s,A4s,KQs,AKo,AQo"
    ),
    gtoAction: "raise",
    explanation:
      "BTN 4-bet range vs BB 3-bet at 25BB is polar: pure value (AA-JJ, AKs, AQs, AKo) plus bluffs with blockers (A5s, A4s, KQs). Everything else folds or calls. At 25BB, 4-betting is often just shoving or setting up a shove. Suited aces as bluffs block villain's strongest holdings while having some equity when called. Hands like TT-88, ATs, KQo fall into a flat-call range.",
    tags: ["4bet", "btn", "vs-bb", "25bb", "polarized"],
  },
  {
    id: "4bet-utg-vs-btn-3bet-30bb",
    name: "UTG 4-Bet vs BTN 3-Bet (30BB)",
    description: "UTG open faces a BTN 3-bet at 30BB",
    format: "MTT",
    category: "4bet",
    stackDepthBB: 30,
    position: "UTG",
    villainPosition: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,AKs,AKo,A5s,A4s"
    ),
    gtoAction: "raise",
    explanation:
      "UTG 4-bet range is very tight due to range disadvantage and being out of position. We 4-bet AA, KK, QQ for value, AK for value/protection, and A4s-A5s as balanced bluffs. JJ and AQs are usually calls (too strong to fold, not strong enough to build pot out of position). At 30BB, 4-betting into a 3-bet creates a near-committed pot.",
    tags: ["4bet", "utg", "vs-btn", "30bb", "oop"],
  },
  // ============================================================
  // SQUEEZE SPOTS
  // ============================================================
  {
    id: "squeeze-bb-vs-btn-open-sb-call-25bb",
    name: "BB Squeeze (25BB)",
    description: "BTN opens, SB calls, BB squeezes at 25BB",
    format: "MTT",
    category: "vs-squeeze",
    stackDepthBB: 25,
    position: "BB",
    villainPosition: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,A3s,KQs,KJs,QJs,JTs,T9s,98s,AKo,AQo,AJo,KQo"
    ),
    gtoAction: "raise",
    explanation:
      "BB squeeze is a powerful play when BTN opens wide and SB flats. You isolate a wide BTN range while applying pressure to the SB cold-caller who has already shown weakness. The squeeze range includes strong value (QQ+, AK-AJ) and bluffs that block villains' continuing ranges (A3s-A5s, suited connectors). SB's call weakens their range significantly, making your squeeze more profitable.",
    tags: ["squeeze", "bb", "25bb", "multiway", "isolation"],
  },
  {
    id: "squeeze-co-vs-utg-open-25bb",
    name: "CO Squeeze vs UTG (25BB)",
    description: "UTG opens, fold to CO who squeezes at 25BB",
    format: "MTT",
    category: "vs-squeeze",
    stackDepthBB: 25,
    position: "CO",
    villainPosition: "UTG",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,A5s,A4s,KQs,QJs,JTs,AKo,AQo,AJo,KQo"
    ),
    gtoAction: "raise",
    explanation:
      "CO 3-betting UTG is a high-commitment play since UTG has a strong range. The CO squeeze range here is tight: premium value (JJ+, AK-AJ) and strong bluffs (A4s-A5s, KQs). Hands like 99-88, ATo, KQo are usually folds against UTG's tight range. The goal is polarization - credibly representing a very strong hand.",
    tags: ["squeeze", "co", "vs-utg", "25bb", "polarized"],
  },
  // ============================================================
  // BUBBLE / ICM SPOTS
  // ============================================================
  {
    id: "bubble-btn-shove-15bb",
    name: "Bubble BTN Shove (15BB, ICM)",
    description: "Near bubble, BTN shoves 15BB - ICM tightens all ranges",
    format: "MTT",
    category: "push-fold",
    stackDepthBB: 15,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,KQs,KJs,KTs,QJs,JTs,T9s,98s,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo"
    ),
    gtoAction: "all-in",
    explanation:
      "Near the money bubble, BTN shove range tightens vs pure chip-EV because shorter stacks get ICM protection. Big stacks can still shove wide, but the BB's calling range also tightens due to ICM pain of busting on the bubble. Key adjustment: cut marginal suited connectors and weak offsuit aces. Keep strong aces, pairs, and broadways. The bigger your stack relative to the field, the wider you can shove.",
    tags: ["push-fold", "bubble", "icm", "btn", "15bb"],
  },
  {
    id: "final-table-btn-open-30bb",
    name: "Final Table BTN Open (30BB, ICM)",
    description: "Final table BTN open range with ICM pressure at 30BB",
    format: "MTT",
    category: "open-raise",
    stackDepthBB: 30,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,KQs,KJs,KTs,K9s,QJs,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,A8o,A7o,KQo,KJo,KTo,QJo,JTo"
    ),
    gtoAction: "raise",
    explanation:
      "Final table BTN opens tighter than a regular MTT because pay jumps are massive. You avoid marginal hands that flip for a significant portion of your ICM equity. Key differences from a regular MTT: drop the weakest offsuit hands, tighten with small suited gappers. Strong hands (pairs, suited aces, broadways) remain opens. Against very short stacks, you can widen; against big stacks who 3-bet wide, tighten further.",
    tags: ["open-raise", "btn", "final-table", "icm", "30bb"],
  },
  // ============================================================
  // SATELLITE SPOTS
  // ============================================================
  {
    id: "satellite-bubble-shove-15bb",
    name: "Satellite Bubble Shove (15BB)",
    description: "Satellite bubble: 2 seats left, 3 players, hero has 15BB",
    format: "Satellite",
    category: "push-fold",
    stackDepthBB: 15,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,A9s,A8s,KQs,KJs,AKo,AQo,AJo,ATo,KQo"
    ),
    gtoAction: "all-in",
    explanation:
      "Satellite bubble play is completely different from chip-EV or standard ICM. When seats are prizes (all equal value), busting in any non-seat position is equally bad. The math says: ONLY shove when you can guarantee winning vs the shortest stack, or when there is a stack shorter than you that will bust before you. Against any caller who can bust you, folding is often correct with 15BB unless your hand is a huge favorite. Never be the one to get into a flip on the satellite bubble.",
    tags: ["satellite", "bubble", "push-fold", "15bb", "icm"],
  },
  {
    id: "satellite-chip-leader-fold",
    name: "Satellite Chip Leader Strategy",
    description: "Chip leader with 3 players left, 2 seats - optimal folding strategy",
    format: "Satellite",
    category: "push-fold",
    stackDepthBB: 40,
    position: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,AKs,AKo"
    ),
    gtoAction: "all-in",
    explanation:
      "As satellite chip leader with enough chips to guarantee a seat, your strategy is to FOLD almost everything and let the two short stacks battle it out. You only get involved with ultra-premium hands that are near-certain winners. AKo, QQ, KK, AA are standard plays. Everything else - even JJ - can be folded. The EV of not risking your stack outweighs any pot you can win. Let the bubble burst on its own.",
    tags: ["satellite", "chip-leader", "fold-equity", "icm"],
  },
  // ============================================================
  // FLOP C-BET SPOTS
  // ============================================================
  {
    id: "cbet-btn-vs-bb-dry-25bb",
    name: "BTN C-Bet vs BB - Dry Board (25BB)",
    description: "BTN raised, BB called. Dry flop (e.g., K72r). C-bet range.",
    format: "MTT",
    category: "cbet-flop",
    stackDepthBB: 25,
    position: "BTN",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,QJs,QTs,JTs,T9s,98s,87s,76s,65s,AKo,AQo,AJo,ATo,A9o,KQo,KJo"
    ),
    gtoAction: "bet",
    explanation:
      "On a dry K72 rainbow board, the BTN has a significant range advantage (K-high boards favor the preflop raiser). C-bet very frequently (80-90%) with a small size (25-33% pot). Bet your entire range of Kx hands for thin value, all your strong airs (flush draws didn't hit, so JTs-T9s-98s have backdoor equity), and your overpairs. The BB cannot have many strong holdings here. Small sizing with high frequency is the GTO approach.",
    tags: ["cbet-flop", "btn", "dry-board", "range-bet", "k-high"],
  },
  {
    id: "cbet-btn-vs-bb-wet-25bb",
    name: "BTN C-Bet vs BB - Wet Board (25BB)",
    description: "BTN raised, BB called. Wet flop (e.g., 987 two-tone). C-bet range.",
    format: "MTT",
    category: "cbet-flop",
    stackDepthBB: 25,
    position: "BTN",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,AKs,AQs,KQs,JTs,T9s,98s,87s,76s,AKo,AQo"
    ),
    gtoAction: "bet",
    explanation:
      "On a wet 987 connected board, the BB has range equity (they defend wider and connect better with low/medium boards). The BTN should c-bet less frequently with a larger sizing (50-75% pot). Bet your strong made hands (sets, two pairs, overpairs), nut draws (open-ended, flush draws), and some bluffs with backdoor equity. Many top-pair hands (KK, QQ) may check back due to reverse implied odds.",
    tags: ["cbet-flop", "btn", "wet-board", "polarized", "connected"],
  },
  {
    id: "cbet-co-vs-bb-paired-25bb",
    name: "CO C-Bet vs BB - Paired Board (25BB)",
    description: "CO c-bet strategy on a paired board (e.g., AA5r)",
    format: "MTT",
    category: "cbet-flop",
    stackDepthBB: 25,
    position: "CO",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,AKs,AQs,AJs,ATs,KQs,QJs,JTs,AKo,AQo,AJo"
    ),
    gtoAction: "bet",
    explanation:
      "Paired boards heavily favor the preflop raiser. On AA5r, the CO should bet the majority of their range at a small size. Key holdings to bet: all Ax hands (tons of trips/full houses), overpairs (KK, QQ), and most floats. Key checks: hands with some showdown value but no improvement (e.g., 88-77 that might get raised off). The BB cannot have AA in their range after flatting preflop from BB.",
    tags: ["cbet-flop", "co", "paired-board", "range-advantage"],
  },
  // ============================================================
  // TURN C-BET SPOTS
  // ============================================================
  {
    id: "cbet-turn-btn-double-barrel-25bb",
    name: "BTN Double Barrel Turn (25BB)",
    description: "BTN bet flop, BB called. Turn barrel range on a brick.",
    format: "MTT",
    category: "cbet-turn",
    stackDepthBB: 25,
    position: "BTN",
    villainPosition: "BB",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,AKs,AQs,AJs,ATs,KQs,JTs,T9s,98s,AKo,AQo"
    ),
    gtoAction: "bet",
    explanation:
      "Double barreling on a blank turn should be more polarized than the flop c-bet. After BB calls the flop, they have a range of hands that can continue. On a brick turn, bet your strongest value hands and best draws/bluffs. Check medium-strength hands (one pair, top pair weak kicker) with good showdown value. The turn barrel with a larger size (66-75% pot) denies equity and builds the pot with strong hands.",
    tags: ["cbet-turn", "btn", "double-barrel", "polarized", "25bb"],
  },
  // ============================================================
  // CHECK-RAISE SPOTS
  // ============================================================
  {
    id: "check-raise-bb-vs-btn-flop-25bb",
    name: "BB Check-Raise Flop vs BTN (25BB)",
    description: "BB check-raise range on the flop vs a BTN c-bet",
    format: "MTT",
    category: "check-raise",
    stackDepthBB: 25,
    position: "BB",
    villainPosition: "BTN",
    heroRange: parseRangeString(
      "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A5s,A4s,A3s,A2s,KQs,KJs,QJs,JTs,T9s,98s,87s,76s,65s,54s"
    ),
    gtoAction: "raise",
    explanation:
      "BB check-raise range should be polarized: strong made hands plus strong draws. The BB can profitably check-raise on many board textures because they have many low-connected hands in their defending range. Check-raise for value with sets, two pairs, and top pair top kicker. Check-raise as a bluff with open-ended straight draws, flush draws, and combo draws. Avoid check-raising with medium pairs that are better played as bluff-catchers.",
    tags: ["check-raise", "bb", "oop", "polarized", "25bb"],
  },
];

export const SPOT_CATEGORIES = [
  { id: "push-fold", label: "Push/Fold", icon: "arrows" },
  { id: "open-raise", label: "Open Raising", icon: "trending-up" },
  { id: "3bet", label: "3-Bet Spots", icon: "zap" },
  { id: "4bet", label: "4-Bet Spots", icon: "chevrons-up" },
  { id: "vs-squeeze", label: "Squeeze", icon: "compress" },
  { id: "blind-vs-blind", label: "Blind vs Blind", icon: "shield" },
  { id: "cbet-flop", label: "Flop C-Bet", icon: "layers" },
  { id: "cbet-turn", label: "Turn Barrel", icon: "layers" },
  { id: "check-raise", label: "Check-Raise", icon: "arrow-up" },
];

export function getSpotsByCategory(category: string): Spot[] {
  return MTT_SPOTS.filter((s) => s.category === category);
}

export function getSpotsByStack(minBB: number, maxBB: number): Spot[] {
  return MTT_SPOTS.filter(
    (s) => s.stackDepthBB >= minBB && s.stackDepthBB <= maxBB
  );
}

export function getSpotsByPosition(position: string): Spot[] {
  return MTT_SPOTS.filter((s) => s.position === position);
}
