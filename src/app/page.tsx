"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  Map,
  MessageSquare,
  Zap,
  Trophy,
  BookOpen,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: <Map className="w-4 h-4" />,
    title: "AI Roadmap Generator",
    description:
      "Input your target role. Get a step-by-step learning path built for your level in seconds.",
    iconColor: "#0ea5e9",
  },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    title: "AI Doubt Solver",
    description:
      "Stuck on a concept? Your personal AI career mentor gives clear, actionable answers instantly.",
    iconColor: "#8b5cf6",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "XP & Progress Tracking",
    description:
      "Complete milestones, earn XP, maintain streaks — structured progress that keeps you accountable.",
    iconColor: "#22c55e",
  },
  {
    icon: <Trophy className="w-4 h-4" />,
    title: "Achievements System",
    description:
      "Unlock badges as you hit milestones. A visual record of how far you've come.",
    iconColor: "#eab308",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Curated Resources",
    description:
      "Every roadmap node includes vetted videos, courses, and projects — no searching required.",
    iconColor: "#f97316",
  },
  {
    icon: <Briefcase className="w-4 h-4" />,
    title: "Career-Focused",
    description:
      "Built for software engineers, data scientists, and designers navigating tech careers.",
    iconColor: "#0ea5e9",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Account",
    desc: "Sign up for free in under 30 seconds.",
  },
  {
    step: "02",
    title: "Generate Roadmap",
    desc: "Tell the AI your goal. Get a personalized path instantly.",
  },
  {
    step: "03",
    title: "Learn & Progress",
    desc: "Complete nodes, use curated resources, track your XP daily.",
  },
  {
    step: "04",
    title: "Land Your Role",
    desc: "Follow the path to job-readiness and hit your career goal.",
  },
];

const outcomes = [
  {
    title: "No more \"what do I learn next?\"",
    desc: "Your roadmap tells you exactly what to do today, this week, this month.",
  },
  {
    title: "Stop collecting courses, start finishing them",
    desc: "Structured nodes with clear completion criteria mean you actually finish what you start.",
  },
  {
    title: "See progress you can point to",
    desc: "XP, streaks, and completed milestones give you a record to show — yourself and others.",
  },
  {
    title: "Ask questions without judgment",
    desc: "The AI doubt solver never makes you feel dumb for not knowing something.",
  },
  {
    title: "Built around your goal, not a generic curriculum",
    desc: "Frontend Engineer at a startup is a different path than Data Scientist at a bank. SkillPulse knows the difference.",
  },
  {
    title: "Free to start, no credit card needed",
    desc: "Get your roadmap, start learning, and decide later if you want more.",
  },
];

// Mock roadmap data for the product preview
const mockRoadmapNodes = [
  { label: "HTML & CSS Fundamentals", status: "done", xp: 200 },
  { label: "JavaScript Core", status: "done", xp: 350 },
  { label: "React & State Management", status: "active", xp: 400 },
  { label: "TypeScript Basics", status: "locked", xp: 300 },
  { label: "Node.js & APIs", status: "locked", xp: 450 },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-[#080c14] overflow-x-hidden">

      {/* ── Global hero animations ───────────────────────── */}
      <style>{`
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px) translateX(-50%); }
          50% { transform: translateY(-18px) translateX(-50%); }
        }
        @keyframes blob-drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-48%, -52%) scale(1.04); opacity: 0.55; }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(12px, -10px) scale(1.03); opacity: 0.38; }
        }

        /* Layer 1: tiny distant lights — very small, slow, dim */
        @keyframes tiny-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-80px) translateX(8px); opacity: 0; }
        }

        /* Layer 2: medium orbs — softer, blurrier, dimmer */
        @keyframes orb-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          12% { opacity: 0.6; }
          88% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(14px); opacity: 0; }
        }

        /* Layer 3: rare bright accent — cinematic focal lights */
        @keyframes accent-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes grid-shimmer {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.38; }
        }
        @keyframes text-reveal-1 {
          0% { opacity: 0; transform: translateY(24px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes text-reveal-2 {
          0% { opacity: 0; transform: translateY(24px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cta-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); }
          50% { box-shadow: 0 0 24px 6px rgba(14,165,233,0.25); }
        }
        @keyframes stat-pop {
          0% { opacity: 0; transform: scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .hero-line-1 {
          animation: text-reveal-1 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .hero-line-2 {
          animation: text-reveal-2 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both;
        }
        .hero-sub {
          animation: fade-up 0.7s ease 0.4s both;
        }
        .hero-ctas {
          animation: fade-up 0.7s ease 0.55s both;
        }
        .hero-stats {
          animation: fade-up 0.7s ease 0.7s both;
        }
        .stat-card-1 { animation: stat-pop 0.5s ease 0.75s both; }
        .stat-card-2 { animation: stat-pop 0.5s ease 0.85s both; }
        .stat-card-3 { animation: stat-pop 0.5s ease 0.95s both; }
        .cta-primary-glow {
          animation: cta-pulse 2.5s ease-in-out 1.2s infinite;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .cta-primary-glow:hover {
          transform: scale(1.03);
          box-shadow: 0 0 32px 8px rgba(14,165,233,0.35) !important;
        }
        .cta-primary-glow:active { transform: scale(0.98); }
        .direction-highlight {
          position: relative;
          background: rgba(14,165,233,0.08);
          border-radius: 10px;
          padding: 0px 14px 1px;
          display: inline-block;
          margin-bottom: 8px;
          box-shadow: inset 0 0 20px rgba(14,165,233,0.08), 0 0 0 1px rgba(14,165,233,0.18), 0 0 18px rgba(14,165,233,0.12);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: #7dd3fc;
        }
        .stat-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .stat-glass:hover {
          background: rgba(14,165,233,0.05);
          border-color: rgba(14,165,233,0.18);
        }
        .stat-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 6px;
          font-size: 14px;
        }

        /* Feature cards — premium borderless style */
        .feature-card {
          background: #080c14;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 32px 28px;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .feature-card:hover {
          background: rgba(14,165,233,0.03);
          border-color: rgba(14,165,233,0.1);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(14,165,233,0.05);
        }
        .feature-icon {
          color: #475569;
          transition: color 0.2s ease;
          margin-bottom: 16px;
        }
        .feature-card:hover .feature-icon {
          color: var(--icon-color);
        }
      `}</style>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20" style={{ overflow: "hidden", isolation: "isolate" }}>

        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "grid-shimmer 4s ease-in-out infinite",
          }}
        />

        {/* === Cinematic ambient glow system === */}

        {/* Layer A — main wide cyan bloom, centered behind heading */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "38%",
            left: "50%",
            width: "900px",
            height: "600px",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse 70% 55% at 52% 48%, rgba(14,165,233,0.13) 0%, rgba(6,130,210,0.07) 45%, transparent 72%)",
            filter: "blur(72px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Layer B — deep indigo bloom, offset top-right, organic shape */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "18%",
            right: "-4%",
            width: "680px",
            height: "520px",
            background: "radial-gradient(ellipse 60% 50% at 60% 40%, rgba(99,102,241,0.09) 0%, rgba(79,70,229,0.05) 50%, transparent 74%)",
            filter: "blur(90px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Layer C — cyan accent, offset lower-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "52%",
            left: "-6%",
            width: "560px",
            height: "480px",
            background: "radial-gradient(ellipse 55% 48% at 38% 55%, rgba(6,182,212,0.08) 0%, rgba(8,145,178,0.04) 55%, transparent 76%)",
            filter: "blur(80px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Layer D — faint violet warmth, upper center */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "8%",
            left: "30%",
            width: "500px",
            height: "380px",
            background: "radial-gradient(ellipse 50% 44% at 45% 35%, rgba(139,92,246,0.06) 0%, transparent 68%)",
            filter: "blur(100px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Layer E — deep blue base wash, full width, low */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            left: "50%",
            width: "1100px",
            height: "700px",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(2,60,120,0.12) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />

        {/* Layer 1: Tiny distant lights — very small, very slow, atmospheric */}
        {[
          { left: "15%", top: "75%", delay: "0s", dur: 12 },
          { left: "28%", top: "68%", delay: "3s", dur: 16 },
          { left: "42%", top: "82%", delay: "6s", dur: 11 },
          { left: "57%", top: "71%", delay: "1.5s", dur: 14 },
          { left: "70%", top: "78%", delay: "4.5s", dur: 13 },
          { left: "82%", top: "65%", delay: "8s", dur: 15 },
          { left: "91%", top: "73%", delay: "2s", dur: 17 },
          { left: "8%", top: "60%", delay: "7s", dur: 12 },
          { left: "35%", top: "58%", delay: "9s", dur: 16 },
          { left: "64%", top: "85%", delay: "5s", dur: 13 },
        ].map((p, i) => (
          <div
            key={`tiny-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: "2px",
              height: "2px",
              background: i % 3 === 0 ? "rgba(14,165,233,0.55)" : i % 3 === 1 ? "rgba(99,102,241,0.45)" : "rgba(6,182,212,0.45)",
              animation: `tiny-float ${p.dur}s linear ${p.delay} infinite`,
            }}
          />
        ))}

        {/* Layer 2: Medium orbs — fewer, softer, blurrier */}
        {[
          { left: "22%", top: "72%", delay: "0s", size: 4, color: "rgba(14,165,233,0.45)", dur: 9 },
          { left: "68%", top: "63%", delay: "3s", size: 5, color: "rgba(99,102,241,0.4)", dur: 11 },
          { left: "48%", top: "79%", delay: "6s", size: 3, color: "rgba(6,182,212,0.4)", dur: 10 },
        ].map((p, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              filter: "blur(1px)",
              boxShadow: `0 0 8px 3px ${p.color}`,
              animation: `orb-float ${p.dur}s ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

        {/* Layer 3: Rare bright accent — only 2, cinematic focal lights */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: "38%",
            top: "55%",
            width: "6px",
            height: "6px",
            background: "rgba(14,165,233,0.95)",
            boxShadow: "0 0 12px 4px rgba(14,165,233,0.5), 0 0 24px 8px rgba(14,165,233,0.2)",
            animation: "accent-pulse 4s ease-in-out 1s infinite",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: "72%",
            top: "42%",
            width: "5px",
            height: "5px",
            background: "rgba(139,92,246,0.9)",
            boxShadow: "0 0 10px 4px rgba(139,92,246,0.45), 0 0 20px 8px rgba(139,92,246,0.18)",
            animation: "accent-pulse 5s ease-in-out 2.5s infinite",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">

          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(14,165,233,0.05)",
              border: "1px solid rgba(14,165,233,0.1)",
              color: "#7dd3fc",
              animation: "fade-up 0.6s ease 0s both",
            }}
          >
            Personalized AI Learning Paths
          </div>

          {/* Heading — "Learn with direction." on one line */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            <span className="block text-[#f1f5f9] hero-line-1">
              Learn with <span className="direction-highlight">direction.</span>
            </span>
            <span className="block text-[#f1f5f9] hero-line-2">Not just motivation.</span>
          </h1>

          {/* Updated subtext */}
          <p className="hero-sub text-lg text-[#64748b] max-w-xl mx-auto mb-10 leading-relaxed">
            Personalized AI roadmaps, skill-gap analysis, and career guidance{" "}
            <br className="hidden sm:block" />all designed to help you grow with direction.
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/register"
              className="cta-primary-glow neon-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="neon-btn w-full sm:w-auto flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:border-[rgba(14,165,233,0.3)] hover:bg-[rgba(14,165,233,0.04)]"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats flex items-center justify-center gap-3 flex-wrap">
            <div className="stat-glass stat-card-1">
              <div
                className="stat-icon"
                style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)" }}
              >
                <span style={{ color: "#38bdf8" }}>✦</span>
              </div>
              <div className="text-base font-bold text-[#f1f5f9]">Gemini</div>
              <div className="text-xs text-[#475569]">Powered by</div>
            </div>
            <div className="stat-glass stat-card-2">
              <div
                className="stat-icon"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <span style={{ color: "#22c55e" }}>◈</span>
              </div>
              <div className="text-base font-bold text-[#f1f5f9]">Free</div>
              <div className="text-xs text-[#475569]">To get started</div>
            </div>
            <div className="stat-glass stat-card-3">
              <div
                className="stat-icon"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <span style={{ color: "#a78bfa" }}>⬡</span>
              </div>
              <div className="text-base font-bold text-[#f1f5f9]">Any role</div>
              <div className="text-xs text-[#475569]">Your goal</div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #080c14)" }}
        />
      </section>

      {/* ── Product Preview ───────────────────────────────── */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">

          <div className="mb-12 text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-[#0ea5e9] mb-3">
              See it in action
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">
              Your roadmap, built in{" "}
              <span className="gradient-text">seconds</span>
            </h2>
            <p className="text-[#64748b] text-sm mt-3 max-w-md mx-auto">
              This is what your dashboard looks like after generating a roadmap for Frontend Engineer.
            </p>
          </div>

          {/* Browser chrome mockup */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0d1117",
              boxShadow: "0 0 80px rgba(14,165,233,0.06), 0 40px 80px rgba(0,0,0,0.4)",
            }}
          >
            {/* Browser bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0d14" }}
            >
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div
                className="flex-1 max-w-xs mx-auto text-center text-xs py-1 px-3 rounded-md"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "#475569",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                skillpulse.io/dashboard
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 md:p-8">

              {/* Top bar */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs text-[#475569] mb-1">Your Roadmap</p>
                  <h3 className="text-[#f1f5f9] font-semibold text-lg">Frontend Engineer</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "rgba(234,179,8,0.1)",
                      border: "1px solid rgba(234,179,8,0.2)",
                      color: "#eab308",
                    }}
                  >
                    <Zap className="w-3 h-3" />
                    1,240 XP
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "rgba(14,165,233,0.1)",
                      border: "1px solid rgba(14,165,233,0.2)",
                      color: "#38bdf8",
                    }}
                  >
                    🔥 5 day streak
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-[#475569] mb-2">
                  <span>Overall Progress</span>
                  <span>2 / 5 completed</span>
                </div>
                <div
                  className="h-1.5 rounded-full w-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "40%",
                      background: "linear-gradient(90deg, #0ea5e9, #6366f1)",
                    }}
                  />
                </div>
              </div>

              {/* Roadmap nodes */}
              <div className="space-y-3">
                {mockRoadmapNodes.map((node, i) => (
                  <div
                    key={node.label}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                    style={{
                      background:
                        node.status === "active"
                          ? "rgba(14,165,233,0.06)"
                          : node.status === "done"
                          ? "rgba(34,197,94,0.04)"
                          : "rgba(255,255,255,0.02)",
                      border:
                        node.status === "active"
                          ? "1px solid rgba(14,165,233,0.2)"
                          : node.status === "done"
                          ? "1px solid rgba(34,197,94,0.12)"
                          : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {node.status === "done" && (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#22c55e]" />
                    )}
                    {node.status === "active" && (
                      <div
                        className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(14,165,233,0.2)", border: "1px solid #0ea5e9" }}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                      </div>
                    )}
                    {node.status === "locked" && (
                      <Lock className="w-5 h-5 flex-shrink-0 text-[#1e2d3d]" />
                    )}
                    <span
                      className="flex-1 text-sm font-medium"
                      style={{
                        color:
                          node.status === "done"
                            ? "#475569"
                            : node.status === "active"
                            ? "#f1f5f9"
                            : "#1e2d3d",
                        textDecoration: node.status === "done" ? "line-through" : "none",
                      }}
                    >
                      {node.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{
                        background:
                          node.status === "done"
                            ? "rgba(34,197,94,0.1)"
                            : node.status === "active"
                            ? "rgba(14,165,233,0.1)"
                            : "rgba(255,255,255,0.03)",
                        color:
                          node.status === "done"
                            ? "#22c55e"
                            : node.status === "active"
                            ? "#38bdf8"
                            : "#1e2d3d",
                      }}
                    >
                      +{node.xp} XP
                    </span>
                    {node.status === "active" && (
                      <ChevronRight className="w-4 h-4 text-[#0ea5e9]" />
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-[#1e2d3d] mt-6">
                Your roadmap is generated based on your target role and current skill level
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">

          <div className="mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-[#0ea5e9] mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] max-w-md">
              Everything you need to{" "}
              <span className="gradient-text">grow fast</span>
            </h2>
          </div>

          {/* Features grid — no icon containers, borderless premium style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(255,255,255,0.03)] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card group"
                style={{ "--icon-color": f.iconColor } as React.CSSProperties}
              >
                {/* Bare monochrome icon — no container */}
                <div className="feature-icon">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#f1f5f9] mb-2 text-sm">{f.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8 grid-bg-sm">
        <div className="max-w-5xl mx-auto">

          <div className="mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-[#0ea5e9] mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">
              From zero to{" "}
              <span className="gradient-text">job ready</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className="relative glass-card rounded-xl p-6 hover:border-[rgba(14,165,233,0.2)] transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-3xl font-black font-mono text-[#0ea5e9] opacity-20 mb-4 leading-none">
                  {s.step}
                </div>
                <h3 className="font-semibold text-[#f1f5f9] text-sm mb-2">{s.title}</h3>
                <p className="text-[#64748b] text-xs leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-2.5 text-[#1e2d3d] text-lg z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outcomes ─────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-[#0ea5e9] mb-3">
              Why it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] max-w-md">
              Built to solve the problems{" "}
              <span className="gradient-text">every self-taught dev faces</span>
            </h2>
            <p className="text-[#64748b] text-sm mt-4 max-w-lg">
              We built SkillPulse because we lived these problems. These are the outcomes it's designed around.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outcomes.map((o, i) => (
              <div
                key={i}
                className="rounded-xl p-6 group hover:-translate-y-1 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(14,165,233,0.1)",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#0ea5e9]" />
                </div>
                <h3 className="font-semibold text-[#f1f5f9] text-sm mb-2 leading-snug">
                  {o.title}
                </h3>
                <p className="text-[#64748b] text-xs leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.18) 0%, transparent 65%)",
                filter: "blur(24px)",
                transform: "translateY(-20px) scaleX(0.8)",
              }}
            />

            <div
              className="relative rounded-2xl p-12 md:p-16 text-center overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(14,165,233,0.07) 0%, rgba(9,11,20,0.95) 40%, rgba(99,102,241,0.06) 100%)",
                border: "1px solid rgba(14,165,233,0.18)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 80px rgba(14,165,233,0.06)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: "60%",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)",
                }}
              />

              <div className="relative z-10">
                <p className="text-xs font-medium tracking-widest uppercase text-[#0ea5e9] mb-4">
                  Get started
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
                  Ready to stop winging it?
                </h2>
                <p className="text-[#64748b] mb-2 text-sm leading-relaxed max-w-sm mx-auto">
                  Join developers using AI-powered guidance to build their careers
                  with clarity and direction.
                </p>
                <p className="text-[#334155] mb-8 text-xs">
                  No credit card. No setup. Your roadmap in 60 seconds.
                </p>

                <Link
                  href="/register"
                  className="cta-primary-glow neon-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold"
                >
                  Start for Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <span className="text-sm font-medium text-[#94a3b8]">SkillPulse</span>
          </div>
          <p className="text-xs text-[#334155]">
            © 2026 SkillPulse. Built by a developer, for developers.
          </p>
        </div>
      </footer>
    </div>
  );
}