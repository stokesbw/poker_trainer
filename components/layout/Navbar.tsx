"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Spade,
  BookOpen,
  TrendingUp,
  Layers,
  Brain,
  Calculator,
  Home,
  Percent,
  Upload,
  FlipVertical,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trainer", label: "Push/Fold", icon: TrendingUp },
  { href: "/ranges", label: "Ranges", icon: Layers },
  { href: "/quiz", label: "Quiz", icon: Brain },
  { href: "/flop", label: "Flop", icon: FlipVertical },
  { href: "/equity", label: "Equity", icon: Percent },
  { href: "/icm", label: "ICM", icon: Calculator },
  { href: "/replayer", label: "Replayer", icon: BookOpen },
  { href: "/import", label: "Import", icon: Upload },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-poker-bg border-b border-poker-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Spade size={18} className="text-white" />
          </div>
          <span>PokerTrainer</span>
          <span className="text-xs text-blue-400 font-normal bg-blue-950/50 px-1.5 py-0.5 rounded ml-1">MTT</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-poker-surface"
                )}
              >
                <Icon size={14} />
                <span className="hidden md:block">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
