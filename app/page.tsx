import Link from "next/link";
import {
  TrendingUp,
  BookOpen,
  Layers,
  Brain,
  Calculator,
  ArrowRight,
  Spade,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    href: "/trainer",
    icon: TrendingUp,
    title: "Push/Fold Trainer",
    description:
      "Master GTO shove ranges for every position and stack depth. Practice with instant feedback on every hand.",
    color: "blue",
    badge: "Most Popular",
    stats: "20BB and under",
  },
  {
    href: "/ranges",
    icon: Layers,
    title: "Range Viewer",
    description:
      "Explore pre-solved open raise, 3-bet, and calling ranges for all positions at various stack depths.",
    color: "green",
    stats: "All positions",
  },
  {
    href: "/replayer",
    icon: BookOpen,
    title: "Hand Replayer",
    description:
      "Step through real MTT hands with annotations and study notes. Learn from key decision points.",
    color: "purple",
    stats: "Step-by-step",
  },
  {
    href: "/quiz",
    icon: Brain,
    title: "Spot Drills",
    description:
      "Test your push/fold decisions in a quiz format. Get scored on accuracy vs GTO ranges.",
    color: "yellow",
    badge: "Train Mode",
    stats: "Instant feedback",
  },
  {
    href: "/icm",
    icon: Calculator,
    title: "ICM Calculator",
    description:
      "Calculate ICM equity for any tournament setup. Understand how stack sizes translate to real dollar equity.",
    color: "red",
    stats: "Multi-table support",
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "from-blue-900/40 to-blue-950/20 border-blue-800/50 hover:border-blue-600/70",
  green: "from-green-900/40 to-green-950/20 border-green-800/50 hover:border-green-600/70",
  purple: "from-purple-900/40 to-purple-950/20 border-purple-800/50 hover:border-purple-600/70",
  yellow: "from-yellow-900/40 to-yellow-950/20 border-yellow-800/50 hover:border-yellow-600/70",
  red: "from-red-900/40 to-red-950/20 border-red-800/50 hover:border-red-600/70",
};

const ICON_COLOR_MAP: Record<string, string> = {
  blue: "text-blue-400 bg-blue-900/50",
  green: "text-green-400 bg-green-900/50",
  purple: "text-purple-400 bg-purple-900/50",
  yellow: "text-yellow-400 bg-yellow-900/50",
  red: "text-red-400 bg-red-900/50",
};

const QUICK_TIPS = [
  "At 10BB or less, your entire range should be shove or fold - never min-raise",
  "BTN can profitably shove ~60% of hands at 10BB due to positional advantage",
  "ICM significantly tightens calling ranges near bubble vs chip EV alone",
  "SB vs BB heads up is the widest shoving spot - you only face one caller",
  "Suited aces (A2s-A5s) are great 3-bet bluffs: block villain's best hands",
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-800/50 px-4 py-2 rounded-full text-blue-300 text-sm mb-6">
          <Spade size={14} />
          MTT-focused GTO study tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Level up your{" "}
          <span className="text-blue-400">tournament game</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Pre-solved GTO ranges, push/fold charts, ICM calculations, and hand
          replays - everything you need to study MTT poker like a pro.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/trainer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start Training
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-poker-surface border border-poker-border hover:border-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Take a Quiz
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {FEATURES.map(({ href, icon: Icon, title, description, color, badge, stats }) => (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col gap-4 p-6 rounded-xl border bg-gradient-to-br transition-all duration-200 group ${COLOR_MAP[color]}`}
          >
            {badge && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {badge}
              </div>
            )}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ICON_COLOR_MAP[color]}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-white font-semibold text-lg mb-1">{title}</div>
              <div className="text-gray-400 text-sm leading-relaxed">{description}</div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-gray-500 bg-poker-bg/50 px-2 py-1 rounded-md">
                {stats}
              </span>
              <ChevronRight
                size={16}
                className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-poker-surface rounded-xl border border-poker-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
            <Brain size={14} className="text-yellow-400" />
          </div>
          <span className="text-white font-semibold">Quick MTT Strategy Tips</span>
        </div>
        <ul className="space-y-2">
          {QUICK_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-blue-500 font-mono text-xs mt-0.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
