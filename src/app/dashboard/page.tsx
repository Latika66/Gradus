"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import XPBar from "@/components/ui/XPBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { DashboardData, NodeStatus, getRank } from "@/types";
import { CheckCircle, Lock, Unlock, Zap, ArrowRight, Award, Map, MessageSquare, User } from "lucide-react";

// Extracted to a constant outside the component so it's never re-created
// and never touches SSR — injected only after mount via suppressHydrationWarning
const DASHBOARD_STYLES = `
  @keyframes xp-shimmer {
    0%   { transform: translateX(-120%) skewX(-15deg); }
    100% { transform: translateX(220%)  skewX(-15deg); }
  }
  @keyframes xp-orb-drift {
    0%,100% { transform: translate(0,0) scale(1);   opacity: .55; }
    50%      { transform: translate(-12px,-16px) scale(1.08); opacity: .75; }
  }
  @keyframes xp-orb-drift2 {
    0%,100% { transform: translate(0,0) scale(1);   opacity: .4; }
    50%      { transform: translate(14px,-10px) scale(1.06); opacity: .6; }
  }
  @keyframes xp-orb-drift3 {
    0%,100% { transform: translate(0,0) scale(1); opacity: .3; }
    33%      { transform: translate(8px, 12px) scale(1.04); opacity: .45; }
    66%      { transform: translate(-6px, 6px) scale(0.97); opacity: .35; }
  }
  @keyframes mesh-flow {
    0%   { opacity: 0.4; transform: scale(1) rotate(0deg); }
    50%  { opacity: 0.65; transform: scale(1.05) rotate(1deg); }
    100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:.5; transform:scale(1); }
    50%      { opacity:1;  transform:scale(1.35); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes enter-up {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes progress-shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
  @keyframes border-flow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .enter-up  { animation: enter-up .55s cubic-bezier(.16,1,.3,1) both; }
  .qa-row {
    transition: background .18s, border-color .18s, transform .18s, box-shadow .18s;
  }
  .qa-row:hover {
    transform: translateY(-1px) translateX(2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .qa-row:hover .qa-icon {
    transform: scale(1.12) rotate(-4deg);
    transition: transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .qa-icon { transition: transform .2s ease; }
  .qa-arrow  { transition: transform .2s, opacity .2s; opacity:.2; }
  .qa-row:hover .qa-arrow { transform:translateX(5px); opacity:.7; }
  .qa-glass-highlight {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    opacity: 0;
    transition: opacity .2s;
  }
  .qa-row:hover .qa-glass-highlight { opacity: 1; }
  .node-row  { transition: background .15s, transform .15s; }
  .node-row:hover { background:rgba(255,255,255,.03) !important; transform:translateX(3px); }
  .stat-card { transition: border-color .25s, box-shadow .25s, transform .2s; }
  .stat-card:hover { transform:translateY(-3px); }
  .ach-badge { transition: background .2s, border-color .2s, transform .15s, box-shadow .2s; }
  .ach-badge:hover { transform:translateY(-3px); box-shadow: 0 8px 24px rgba(255,215,0,0.08); }
  .xp-card-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,212,255,0.06) 0%, transparent 65%);
    pointer-events: none;
    transition: opacity .3s;
  }
  .progress-fill-glow {
    position: relative;
    overflow: hidden;
  }
  .progress-fill-glow::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    left: 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: progress-shimmer 2.5s ease-in-out 1.5s infinite;
  }
  .view-all-link {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    transition: color .2s;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-decoration: none;
  }
  .view-all-text {
    position: relative;
    transition: color .2s;
  }
  .view-all-text::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 1px;
    background: #67e8f9;
    opacity: 0;
    transform: scaleX(0.6);
    transform-origin: left;
    transition: opacity .2s, transform .2s;
  }
  .view-all-arrow {
    transition: transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .view-all-link:hover {
    color: #e2e8f0;
  }
  .view-all-link:hover .view-all-text {
    color: #67e8f9;
  }
  .view-all-link:hover .view-all-text::after {
    opacity: 1;
    transform: scaleX(1);
  }
  .view-all-link:hover .view-all-arrow {
    transform: translateX(3px);
  }
`;

function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// Mouse-reactive glow hook
function useMouseGlow(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const xpCardRef = useRef<HTMLDivElement>(null);

  // Runs only on client — prevents style string hydration mismatch
  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        const json = await res.json();
        if (json.success) { setData(json.data); setTimeout(() => setAnimate(true), 120); }
        else setError(json.error ?? "Failed to load dashboard");
      } catch { setError("Network error. Please refresh."); }
      finally { setLoading(false); }
    })();
  }, []);

  const xpCount       = useCountUp(data?.stats.xp ?? 0, 1100, animate);
  const levelCount    = useCountUp(data?.stats.level ?? 0, 800, animate);
  const achieveCount  = useCountUp(data?.stats.achievements ?? 0, 900, animate);
  const nodesComplete = data?.stats.completedNodes ?? 0;
  const nodesTotal    = data?.stats.totalNodes ?? 0;
  const xpToNext      = (data?.stats.xpToNextLevel ?? 0) - (data?.stats.xp ?? 0);
  const nodesPct      = nodesTotal > 0 ? (nodesComplete / nodesTotal) * 100 : 0;

  const isEmpty = !data?.activeRoadmap;

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-x-hidden">
      {/* Styles injected client-side only to prevent SSR/hydration mismatch */}
      {isMounted && <style dangerouslySetInnerHTML={{ __html: DASHBOARD_STYLES }} />}

      {/* ── Ambient background ── */}
      <div className="absolute pointer-events-none" style={{ top:"-10%", left:"50%", width:"1000px", height:"600px", transform:"translateX(-50%)", background:"radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,180,220,0.07) 0%, rgba(0,100,180,0.04) 45%, transparent 72%)", filter:"blur(80px)" }} />
      <div className="absolute pointer-events-none" style={{ top:"15%", left:"-8%",  width:"550px",  height:"500px", background:"radial-gradient(ellipse 55% 50% at 25% 50%, rgba(100,30,180,0.06) 0%, transparent 70%)", filter:"blur(90px)" }} />
      <div className="absolute pointer-events-none" style={{ top:"25%", right:"-6%", width:"450px",  height:"400px", background:"radial-gradient(ellipse 50% 45% at 75% 45%, rgba(0,200,180,0.04) 0%, transparent 68%)", filter:"blur(80px)" }} />
      <div className="absolute pointer-events-none" style={{ top:"55%", left:"30%",  width:"600px",  height:"400px", background:"radial-gradient(ellipse 55% 45% at 50% 50%, rgba(80,40,160,0.035) 0%, transparent 70%)", filter:"blur(100px)" }} />

      <Navbar />

      <div className="pt-20 pb-14 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">

        {loading && <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" text="Loading your dashboard..." /></div>}

        {error && <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171] text-sm text-center mt-8">{error}</div>}

        {data && !loading && (<>

          {/* ── Welcome ── */}
          <div className="enter-up flex flex-col md:flex-row md:items-start justify-between gap-3 mb-8 mt-4" style={{ animationDelay:"0ms" }}>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Welcome back, <span className="gradient-text">{data.profile.name ?? "Explorer"}</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#7928ca]/20 text-[#c084fc] border border-[#7928ca]/25">{getRank(data.stats.level)}</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#00d4ff]/15 text-[#7dd3fc] border border-[#00d4ff]/20">LVL {data.stats.level}</span>
                <span className="text-xs text-[#334155]">· {data.stats.currentStreak} day streak</span>
              </div>
            </div>
            <Link href="/roadmap" id="dashboard-generate-roadmap" className="neon-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 self-start">
              + Generate Roadmap
            </Link>
          </div>

          {/* ══════════════════════════════════════════
              XP FOCAL HERO
          ══════════════════════════════════════════ */}
          <div
            ref={xpCardRef}
            className="enter-up xp-card-glow relative rounded-2xl overflow-hidden mb-5"
            style={{
              animationDelay: "60ms",
              background: "linear-gradient(135deg, rgba(0,212,255,0.10) 0%, rgba(5,8,22,0.92) 45%, rgba(121,40,202,0.08) 100%)",
              border: "1px solid rgba(0,212,255,0.14)",
              boxShadow: "0 0 60px rgba(0,212,255,0.06) inset, 0 1px 0 rgba(0,212,255,0.2)",
            }}
          >
            {/* Animated orb — top left */}
            <div className="absolute pointer-events-none" style={{
              top: "-30%", left: "5%", width: "320px", height: "320px",
              background: "radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 65%)",
              filter: "blur(40px)",
              animation: "xp-orb-drift 7s ease-in-out infinite",
            }} />
            {/* Animated orb — bottom right */}
            <div className="absolute pointer-events-none" style={{
              bottom: "-20%", right: "8%", width: "260px", height: "260px",
              background: "radial-gradient(circle, rgba(121,40,202,0.12) 0%, transparent 65%)",
              filter: "blur(40px)",
              animation: "xp-orb-drift2 9s ease-in-out infinite",
            }} />
            {/* NEW — right-center ambient fill to kill dead zone */}
            <div className="absolute pointer-events-none" style={{
              top: "20%", right: "15%", width: "220px", height: "220px",
              background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, rgba(121,40,202,0.05) 50%, transparent 70%)",
              filter: "blur(50px)",
              animation: "xp-orb-drift3 13s ease-in-out 1s infinite",
            }} />
            {/* NEW — slow diagonal mesh gradient across right half */}
            <div className="absolute pointer-events-none" style={{
              top: 0, right: 0, width: "55%", height: "100%",
              background: "linear-gradient(135deg, transparent 20%, rgba(0,212,255,0.03) 50%, rgba(121,40,202,0.04) 75%, transparent 90%)",
              animation: "mesh-flow 10s ease-in-out infinite",
            }} />
            {/* Center mesh fill */}
            <div className="absolute pointer-events-none" style={{
              top: "50%", left: "50%",
              width: "380px", height: "260px",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,212,255,0.05) 0%, rgba(121,40,202,0.03) 55%, transparent 75%)",
              filter: "blur(50px)",
              animation: "xp-orb-drift 11s ease-in-out 2s infinite",
            }} />
            {/* Shimmer sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div style={{
                position:"absolute", inset:0,
                background: "linear-gradient(105deg, transparent 30%, rgba(0,212,255,0.06) 50%, transparent 70%)",
                animation: "xp-shimmer 4.5s ease-in-out 1s infinite",
              }} />
            </div>
            {/* Top edge glow */}
            <div className="absolute top-0 left-12 right-12 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }} />

            <div className="relative z-10 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left — XP number hero */}
                <div>
                  <p className="text-[10px] text-[#334155] uppercase tracking-widest font-medium mb-2">Experience Points</p>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-4xl md:text-5xl font-black text-white tabular-nums leading-none" style={{ textShadow:"0 0 40px rgba(0,212,255,0.3)" }}>
                      {xpCount.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#475569] font-medium">XP</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {/* Pulse dot with ring */}
                    <div style={{ position:"relative", width:10, height:10, flexShrink:0 }}>
                      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(0,212,255,0.3)", animation:"pulse-ring 1.8s ease-out infinite" }} />
                      <div style={{ position:"absolute", inset:2, borderRadius:"50%", background:"#00d4ff", boxShadow:"0 0 8px rgba(0,212,255,0.9)" }} />
                    </div>
                    <span className="text-xs text-[#334155]">Active · Level {data.stats.level}</span>
                  </div>
                </div>
                {/* Right — compact context */}
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs text-[#334155] mb-0.5">to next level</div>
                    <div className="text-lg font-bold text-white tabular-nums">+{xpToNext.toLocaleString()}<span className="text-xs text-[#334155] font-normal ml-1">XP</span></div>
                  </div>
                </div>
              </div>

              {/* XP bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#334155]">Progress to Level {data.stats.level + 1}</span>
                  <span className="text-[#475569] font-mono">+{xpToNext.toLocaleString()} XP needed</span>
                </div>
                {/* Outer glow wrapper */}
                <div style={{ filter:"drop-shadow(0 0 10px rgba(0,212,255,0.3)) drop-shadow(0 0 4px rgba(0,212,255,0.2))" }}>
                  {/* Track */}
                  <div style={{ height:10, borderRadius:9999, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.04)", overflow:"hidden", position:"relative" }}>
                    {/* Fill with shimmer */}
                    <div
                      className="progress-fill-glow"
                      style={{
                        height:"100%",
                        borderRadius:9999,
                        background:"linear-gradient(90deg, #00d4ff, #7928ca, #00d4ff)",
                        backgroundSize:"200% 100%",
                        boxShadow:"0 0 12px rgba(0,212,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                        width: animate ? `${data.stats.xpToNextLevel > 0 ? Math.min(((data.stats.xp) / data.stats.xpToNextLevel) * 100, 100) : 0}%` : "0%",
                        transition:"width 1.4s cubic-bezier(0.4,0,0.2,1) 0.6s",
                        animation: "border-flow 3s linear infinite",
                      }}
                    />
                  </div>
                </div>
              </div>

              {isEmpty && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background:"rgba(0,212,255,0.04)", border:"1px solid rgba(0,212,255,0.08)" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#00d4ff", opacity:.5, flexShrink:0 }} />
                  <p className="text-xs text-[#475569]">Generate your first roadmap to start earning XP and leveling up.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="enter-up grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" style={{ animationDelay:"160ms" }}>
            {[
              {
                // Flame icon — matches reference: rounded teardrop body, inner curl
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C12 2 7 8 7 13a5 5 0 0 0 10 0c0-2.5-1.5-5-2.5-6.5C14 8 13.5 9.5 12 10c0-2.5-.5-5.5 0-8Z"/>
                    <path d="M12 17.5c-1.1 0-2-.9-2-2 0-.9.6-1.6 1-2.2.1.5.5.8 1 .8s.9-.3 1-.8c.4.6 1 1.3 1 2.2 0 1.1-.9 2-2 2Z" strokeWidth="1.4"/>
                  </svg>
                ),
                label: "STREAK",
                value: data.stats.currentStreak,
                unit: "days",
                sub: data.stats.currentStreak === 0 ? "Start a streak today" : `Personal best: ${data.stats.currentStreak}`,
                color: "#f97316",
              },
              {
                // Hub/nodes icon — matches reference: center ring + 6 spokes with endpoint dots
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="12" cy="3.5" r="1.5"/>
                    <circle cx="12" cy="20.5" r="1.5"/>
                    <circle cx="3.5" cy="12" r="1.5"/>
                    <circle cx="20.5" cy="12" r="1.5"/>
                    <circle cx="5.5" cy="5.5" r="1.5"/>
                    <circle cx="18.5" cy="18.5" r="1.5"/>
                    <line x1="12" y1="9" x2="12" y2="5"/>
                    <line x1="12" y1="15" x2="12" y2="19"/>
                    <line x1="9" y1="12" x2="5" y2="12"/>
                    <line x1="15" y1="12" x2="19" y2="12"/>
                    <line x1="9.8" y1="9.8" x2="6.9" y2="6.9"/>
                    <line x1="14.2" y1="14.2" x2="17.1" y2="17.1"/>
                  </svg>
                ),
                label: "NODES",
                value: nodesComplete,
                unit: `/ ${nodesTotal || 7}`,
                sub: nodesComplete === 0 ? `${nodesTotal || 7} remaining` : `${nodesTotal - nodesComplete} remaining`,
                color: "#00d4ff",
              },
              {
                // Trophy icon — matches reference: cup with handles, stem, base, star cutout
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12v7a6 6 0 0 1-12 0V3Z"/>
                    <path d="M3 4.5h3M18 4.5h3"/>
                    <path d="M12 16v3"/>
                    <path d="M8 21h8"/>
                    <path d="M9.5 18.5h5"/>
                    <path d="M12 6.5l.7 2h2.1l-1.7 1.2.6 2L12 10.5l-1.7 1.2.6-2L9.2 8.5h2.1Z" strokeWidth="1.2"/>
                  </svg>
                ),
                label: "ACHIEVEMENTS",
                value: achieveCount,
                unit: `/ ${data.stats.achievements > 0 ? data.stats.achievements + 2 : 6}`,
                sub: achieveCount === 0 ? "Keep going" : `${achieveCount} earned`,
                color: "#eab308",
              },
              {
                // Rank/level icon — matches reference: stacked bars (pyramid) with star on top
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l1.2 3.6H17l-3 2.2 1.1 3.5L12 9.1l-3.1 2.2 1.1-3.5-3-2.2h3.8Z" strokeWidth="1.5"/>
                    <rect x="7" y="12" width="10" height="2.5" rx="1"/>
                    <rect x="5" y="15.5" width="14" height="2.5" rx="1"/>
                    <rect x="3" y="19" width="18" height="2.5" rx="1"/>
                  </svg>
                ),
                label: "RANK",
                value: getRank(data.stats.level),
                unit: "",
                sub: `Level ${data.stats.level}`,
                color: "#c084fc",
                large: true,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="stat-card relative rounded-2xl p-5 overflow-hidden"
                style={{
                  background: "rgba(8,14,28,0.85)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${card.color}28`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${card.color}10, 0 0 0 1px ${card.color}10 inset`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{
                  background: `radial-gradient(circle at 100% 0%, ${card.color}14 0%, transparent 65%)`,
                  filter: "blur(10px)",
                }} />
                <div className="flex items-center gap-2 mb-4">
                  {/* Monochrome glyph icon — always white */}
                  <span style={{ color: "rgba(255,255,255,0.55)", display:"flex", alignItems:"center" }}>{card.icon}</span>
                  <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#334155" }}>{card.label}</span>
                </div>
                {(card as any).large ? (
                  <div className="text-2xl font-black text-white leading-none mb-2">{card.value}</div>
                ) : (
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-3xl font-black text-white tabular-nums leading-none">{card.value}</span>
                    {card.unit && <span className="text-sm font-medium" style={{ color: "#334155" }}>{card.unit}</span>}
                  </div>
                )}
                <p className="text-xs" style={{ color: "#334155" }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Active Roadmap */}
            <div className="enter-up lg:col-span-2" style={{ animationDelay:"280ms" }}>
              <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden h-full"
                style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                <div className="absolute top-0 left-0 w-56 h-40 pointer-events-none"
                  style={{ background:"radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.05) 0%, transparent 60%)", filter:"blur(24px)" }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-white text-sm">Active Roadmap</h2>
                    {data.activeRoadmap && (
                      <button
                        onClick={() => router.push(data.activeRoadmap?.id ? `/roadmap/${data.activeRoadmap.id}` : "/roadmap")}
                        className="view-all-link"
                      >
                        <span className="view-all-text">view all</span>
                        <ArrowRight className="view-all-arrow w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {!data.activeRoadmap ? (
                    <div className="py-8">
                      <div className="p-4 rounded-xl mb-4" style={{ background:"rgba(0,212,255,0.03)", border:"1px solid rgba(0,212,255,0.07)" }}>
                        <p className="text-xs font-medium text-[#7dd3fc] mb-1">Ready to get started?</p>
                        <p className="text-xs text-[#475569] leading-relaxed">Tell the AI your target role — Frontend Engineer, Data Scientist, Product Manager — and get a step-by-step roadmap in seconds.</p>
                      </div>
                      <div className="space-y-2 mb-5">
                        {["Define your target role", "Generate a personalized roadmap", "Complete nodes and earn XP"].map((hint, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.15)" }}>
                              <span className="text-[8px] font-bold text-[#00d4ff]">{i + 1}</span>
                            </div>
                            <span className="text-xs text-[#334155]">{hint}</span>
                          </div>
                        ))}
                      </div>
                      <Link href="/roadmap" className="neon-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
                        Generate My Roadmap <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-3.5 rounded-xl" style={{ background:"rgba(0,212,255,0.03)", border:"1px solid rgba(0,212,255,0.07)" }}>
                        <h3 className="font-medium text-white text-sm">{data.activeRoadmap.title}</h3>
                        <p className="text-xs text-[#334155] mt-0.5">{data.activeRoadmap.targetRole}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#475569]">{Object.values(data.activeRoadmap.nodeProgress).filter(s => s === "completed").length} / {data.activeRoadmap.nodes.length} nodes</span>
                            <span className="text-[#334155]">{data.activeRoadmap.earnedXp} / {data.activeRoadmap.totalXp} XP</span>
                          </div>
                          {/* Progress bar — taller + glow */}
                          <div style={{ filter:"drop-shadow(0 0 6px rgba(0,212,255,0.2))" }}>
                            <div style={{ height:8, borderRadius:9999, background:"rgba(255,255,255,0.05)", overflow:"hidden", position:"relative" }}>
                              <div
                                className="progress-fill-glow"
                                style={{
                                  height:"100%", borderRadius:9999,
                                  background:"linear-gradient(90deg, #00d4ff, #7928ca)",
                                  boxShadow:"0 0 8px rgba(0,212,255,0.4)",
                                  width: animate ? `${data.activeRoadmap.nodes.length > 0 ? (Object.values(data.activeRoadmap.nodeProgress).filter(s => s === "completed").length / data.activeRoadmap.nodes.length) * 100 : 0}%` : "0%",
                                  transition:"width 1.2s cubic-bezier(0.4,0,0.2,1) 0.6s",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
                        {data.activeRoadmap.nodes.slice(0, 6).map((node) => {
                          const status = (data.activeRoadmap!.nodeProgress[node.id] ?? "locked") as NodeStatus;
                          const cfg: Record<NodeStatus, { color:string; icon:React.ReactNode }> = {
                            completed: { color:"#00ff94", icon:<CheckCircle className="w-3 h-3" /> },
                            in_progress:{ color:"#7928ca", icon:<Zap className="w-3 h-3" /> },
                            unlocked:   { color:"#00d4ff", icon:<Unlock className="w-3 h-3" /> },
                            locked:     { color:"#1e2d3d", icon:<Lock className="w-3 h-3" /> },
                          };
                          return (
                            <div key={node.id} className="node-row flex items-center gap-3 px-3 py-2 rounded-lg cursor-default"
                              style={{ border:"1px solid transparent", opacity:status === "locked" ? .35 : 1 }}>
                              <span style={{ color:cfg[status].color, flexShrink:0 }}>{cfg[status].icon}</span>
                              <span className="flex-1 text-xs text-[#64748b] truncate">{node.title}</span>
                              <span className="text-[10px] font-mono" style={{ color:status === "locked" ? "#1e2d3d" : cfg[status].color }}>+{node.xpReward}</span>
                            </div>
                          );
                        })}
                        {data.activeRoadmap.nodes.length > 6 && (
                          <p className="text-[10px] text-center text-[#1e2d3d] pt-2">+{data.activeRoadmap.nodes.length - 6} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">

              {/* Quick Actions */}
              <div
                className="enter-up rounded-2xl p-5 relative overflow-hidden"
                style={{
                  animationDelay: "350ms",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 0 30px rgba(121,40,202,0.06) inset",
                }}
              >
                <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
                  style={{ background:"radial-gradient(circle at 100% 100%, rgba(121,40,202,0.1) 0%, transparent 65%)", filter:"blur(20px)" }} />
                <div className="absolute top-0 left-6 right-6 h-px pointer-events-none"
                  style={{ background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

                <p className="text-[10px] text-[#475569] uppercase tracking-widest font-medium mb-4 relative z-10">Quick Actions</p>
                <div className="space-y-1 relative z-10">
                  {[
                    { href:"/roadmap",      icon:<Map className="w-3.5 h-3.5" />,          label:"Generate Roadmap", sub:"New path",    color:"#00d4ff" },
                    { href:"/doubt-solver", icon:<MessageSquare className="w-3.5 h-3.5" />, label:"Ask AI Mentor",    sub:"Get unstuck",  color:"#7928ca" },
                    { href:"/profile",      icon:<User className="w-3.5 h-3.5" />,          label:"Edit Profile",     sub:"Your info",    color:"#00ff94" },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="qa-row relative flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ border:"1px solid transparent" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = `${action.color}08`;
                        (e.currentTarget as HTMLElement).style.borderColor = `${action.color}22`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${action.color}0a`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      {/* Glass highlight line on hover */}
                      <div className="qa-glass-highlight" />
                      <div
                        className="qa-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:`${action.color}10`, color:action.color, opacity:.85 }}
                      >
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#94a3b8] font-medium leading-none mb-0.5">{action.label}</p>
                        <p className="text-[10px] text-[#334155]">{action.sub}</p>
                      </div>
                      <ArrowRight className="qa-arrow w-3.5 h-3.5 text-[#475569] flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div
                className="enter-up rounded-2xl p-5 relative overflow-hidden"
                style={{
                  animationDelay: "420ms",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
                  style={{ background:"radial-gradient(circle at 100% 0%, rgba(255,215,0,0.07) 0%, transparent 65%)", filter:"blur(16px)" }} />
                <p className="text-[10px] text-[#334155] uppercase tracking-widest font-medium mb-4 relative z-10">Achievements</p>

                {data.achievements.length === 0 ? (
                  <div className="relative z-10">
                    <p className="text-xs text-[#1e2d3d] mb-3">Complete roadmap nodes to unlock badges.</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl p-2 text-center" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)" }}>
                          <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background:"rgba(255,255,255,0.04)" }} />
                          <div className="h-1.5 rounded-full mx-auto w-8" style={{ background:"rgba(255,255,255,0.04)" }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#1e2d3d] text-center mt-2">6 badges waiting</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 relative z-10">
                    {data.achievements.slice(0, 6).map((a) => (
                      <div key={a.id} className="ach-badge rounded-xl p-2 text-center cursor-default"
                        style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.08)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,215,0,0.09)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(255,215,0,0.16)"; (e.currentTarget as HTMLElement).style.boxShadow="0 8px 24px rgba(255,215,0,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,215,0,0.04)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(255,215,0,0.08)"; (e.currentTarget as HTMLElement).style.boxShadow="none"; }}
                        title={a.title}>
                        <Award className="w-4 h-4 mx-auto" style={{ color:"#ffd700", opacity:.6 }} />
                        <p className="text-[9px] text-[#334155] mt-1 truncate">{a.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}