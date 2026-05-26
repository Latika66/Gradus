"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Map, Zap, Rocket, Brain, Save, TrendingUp, Sprout } from "lucide-react";

const levelOptions = [
  { value: "beginner",     label: <div className="flex items-center gap-2"><Sprout className="w-4 h-4" /> Beginner</div>,     desc: "Little to no experience" },
  { value: "intermediate", label: <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Intermediate</div>,     desc: "Some basics, want to go deeper" },
  { value: "advanced",     label: <div className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Advanced</div>,      desc: "Want to master & specialize" },
];

const popularSkills = [
  "Full Stack Developer", "Frontend Developer", "Backend Developer",
  "Data Scientist", "Machine Learning Engineer", "DevOps Engineer",
  "Mobile Developer", "UI/UX Designer", "Cloud Architect", "Cybersecurity Analyst",
];

export default function RoadmapPage() {
  const router = useRouter();
  const [form, setForm] = useState({ skill: "", level: "beginner", targetRole: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skill.trim()) { setError("Please enter a skill or career goal."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/roadmap/${data.data.roadmapId}`);
      } else {
        setError(data.error ?? "Failed to generate roadmap. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-x-hidden">

      <style>{`
        /* Premium input focus states */
        .rm-input {
          width: 100%;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }
        .rm-input::placeholder {
          color: rgba(148,163,184,0.55);
        }
        .rm-input:focus {
          border-color: rgba(0,212,255,0.38);
          background: rgba(0,212,255,0.04);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.08), 0 0 16px rgba(0,212,255,0.06);
        }
      `}</style>

      {/* ── Ambient background — toned down, single soft orb ── */}
      {/* Main central glow — very soft */}
      <div className="absolute pointer-events-none" style={{
        top: "20%", left: "50%",
        width: "700px", height: "500px",
        transform: "translateX(-50%)",
        background: "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(0,180,220,0.06) 0%, rgba(99,102,241,0.03) 55%, transparent 75%)",
        filter: "blur(80px)",
      }} />
      {/* Single muted side orb — left, small + blurry */}
      <div className="absolute pointer-events-none" style={{
        top: "35%", left: "-5%",
        width: "320px", height: "320px",
        background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 65%)",
        filter: "blur(90px)",
      }} />

      <Navbar />

      <div className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-static border border-[rgba(0,212,255,0.2)] text-xs text-[#00d4ff] mb-4">
            <Map className="w-3.5 h-3.5" /> AI Roadmap Generator
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Generate Your <span className="gradient-text">Learning Path</span>
          </h1>
          <p className="text-[#64748b] text-sm md:text-base">
            Tell our AI your goal and experience level. Get a personalized roadmap in seconds.
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-5 md:p-7 mb-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#f87171] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Skill input */}
            <div>
              <label htmlFor="skill-input" className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
                What do you want to learn / become?
              </label>
              <input
                id="skill-input"
                type="text"
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: e.target.value })}
                placeholder="e.g. Full Stack Developer, Machine Learning, React..."
                className="rm-input"
              />
              {/* Popular skills chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {popularSkills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, skill: s })}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 ${
                      form.skill === s
                        ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.35)] text-[#00d4ff]"
                        : "border-[#1a2942] text-[#64748b] hover:border-[rgba(0,212,255,0.2)] hover:text-[#94a3b8]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Level selector */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
                Your current level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {levelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, level: opt.value })}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 ${
                      form.level === opt.value
                        ? "border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.07)] text-white"
                        : "border-[#1a2942] bg-[rgba(5,8,22,0.4)] text-[#64748b] hover:border-[rgba(0,212,255,0.18)] hover:text-[#94a3b8]"
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-[11px] mt-0.5 opacity-60">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target role — optional */}
            <div>
              <label htmlFor="target-role" className="flex items-center gap-2 text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
                Target role / company type
                <span
                  className="text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded"
                  style={{ color: "rgba(148,163,184,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  optional
                </span>
              </label>
              <input
                id="target-role"
                type="text"
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                placeholder="e.g. Senior Frontend at FAANG, Startup CTO, Freelancer..."
                className="rm-input"
              />
            </div>

            <button
              id="generate-roadmap-btn"
              type="submit"
              disabled={loading}
              className="neon-btn-primary w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>AI is generating your roadmap...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" /> Generate My Roadmap
                </div>
              )}
            </button>

            {loading && (
              <p className="text-center text-xs text-[#475569]">
                This usually takes 10–20 seconds. Hang tight!
              </p>
            )}
          </form>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: <Brain className="w-5 h-5 text-white" />,     title: "Gemini Powered",  desc: "Real AI, not templates" },
            { icon: <Save className="w-5 h-5 text-white" />,      title: "Auto-Saved",      desc: "Roadmap saved to your account" },
            { icon: <TrendingUp className="w-5 h-5 text-white" />, title: "Track Progress", desc: "Complete nodes, earn XP" },
          ].map((info) => (
            <div key={info.title} className="glass-card rounded-xl p-3.5 text-center">
              <div className="flex justify-center mb-1.5">{info.icon}</div>
              <p className="text-xs font-medium text-white mt-1">{info.title}</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">{info.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}