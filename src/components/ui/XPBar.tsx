"use client";

import { getLevelProgress, getXPForNextLevel, getRank } from "@/types";

interface XPBarProps {
  xp: number;
  level: number;
  showDetails?: boolean;
}

export default function XPBar({ xp, level, showDetails = true }: XPBarProps) {
  const progress = getLevelProgress(xp);
  const nextLevelXp = getXPForNextLevel(level);
  const rank = getRank(level);

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#00d4ff]">LVL {level}</span>
            <span className="text-xs text-[#64748b]">·</span>
            <span className="text-xs text-[#94a3b8]">{rank}</span>
          </div>
          <span className="text-xs font-mono text-[#64748b]">
            {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="xp-bar-track h-2 w-full">
        <div
          className="xp-bar h-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showDetails && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#00d4ff] font-mono">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
