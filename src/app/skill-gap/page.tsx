"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  Sparkles, Brain, Award, GraduationCap, History, ArrowRight, 
  ShieldAlert, Plus, X, CheckCircle2, ChevronDown, Search, FolderKanban 
} from "lucide-react";

interface SkillGapReport {
  id?: string;
  targetRole: string;
  experienceLevel: string;
  matchScore: number;
  currentSkills: string[];
  missingSkills: Array<{
    name: string;
    importance: "high" | "medium" | "low";
    category: "beginner" | "intermediate" | "advanced";
  }>;
  suggestions: string[];
  createdAt?: string;
}

// ── Role Categorization & Expansion (25+ Realistic Tech Paths) ──
const ROLE_CATEGORIES = [
  {
    category: "Software Development",
    roles: [
      "Frontend Developer", "Backend Developer", "Full Stack Developer", 
      "Mobile Developer (iOS/Android)", "Embedded Systems Engineer", 
      "Game Developer", "Graphics Engineer"
    ]
  },
  {
    category: "AI, Data & Analytics",
    roles: [
      "AI/ML Engineer", "Data Scientist", "Data Analyst", 
      "Data Engineer", "Computer Vision Engineer", "NLP Specialist"
    ]
  },
  {
    category: "Infrastructure & Security",
    roles: [
      "DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Architect", 
      "Cybersecurity Analyst", "Security Engineer", "Database Administrator"
    ]
  },
  {
    category: "Product, Design & Growth",
    roles: [
      "Product Manager", "Technical Product Manager", "UI/UX Designer", 
      "Product Designer", "Growth Hacker", "Scrum Master"
    ]
  }
];

// Flat list helper for unified keyboard navigation indexing
const ALL_ROLES = ROLE_CATEGORIES.flatMap(c => c.roles);

// ── Neural graph — slow, asymmetric, atmospheric ──────────
function NeuralGraph({ brightened = false }: { brightened?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brightenedRef = useRef(brightened);

  useEffect(() => {
    brightenedRef.current = brightened;
  }, [brightened]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;

    const clusters = [
      { cx: w * 0.18, cy: h * 0.28, spread: 0.14, count: 5 },
      { cx: w * 0.72, cy: h * 0.20, spread: 0.12, count: 4 },
      { cx: w * 0.55, cy: h * 0.70, spread: 0.16, count: 6 },
      { cx: w * 0.25, cy: h * 0.75, spread: 0.09, count: 3 },
      { cx: w * 0.85, cy: h * 0.60, spread: 0.13, count: 4 },
    ];
    const outliers = [
      { cx: w * 0.42, cy: h * 0.12, spread: 0.05, count: 1 },
      { cx: w * 0.90, cy: h * 0.10, spread: 0.04, count: 1 },
      { cx: w * 0.08, cy: h * 0.52, spread: 0.04, count: 1 },
    ];

    type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number; baseOpacity: number };
    const nodes: Node[] = [];

    const placeCluster = (cx: number, cy: number, spread: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * spread * Math.min(w, h);
        nodes.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.10,
          vy: (Math.random() - 0.5) * 0.10,
          r: Math.random() * 1.5 + 0.8,
          pulse: Math.random() * Math.PI * 2,
          baseOpacity: 0.18 + Math.random() * 0.18,
        });
      }
    };

    [...clusters, ...outliers].forEach(c => placeCluster(c.cx, c.cy, c.spread, c.count));

    let frame: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.006;

      const bright = brightenedRef.current;
      const brightMult = bright ? 2.2 : 1;

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.012;
        if (n.x < 0)  { n.vx =  Math.abs(n.vx); }
        if (n.x > w)  { n.vx = -Math.abs(n.vx); }
        if (n.y < 0)  { n.vy =  Math.abs(n.vy); }
        if (n.y > h)  { n.vy = -Math.abs(n.vy); }
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const proximity = (1 - dist / 90);
            const pulseWave = (Math.sin(t + nodes[i].pulse * 0.5) + 1) / 2;
            const alpha = proximity * (0.06 + pulseWave * 0.06) * brightMult;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${Math.min(alpha, 0.3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const glow = (Math.sin(n.pulse) + 1) / 2;
        const opacity = (n.baseOpacity + glow * 0.12) * brightMult;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${Math.min(opacity, 0.6)})`;
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ── Scanning loader ───────────────────────────────────────
const PIPELINE_STEPS = [
  "Parsing skill profile...",
  "Querying role requirements...",
  "Cross-referencing industry benchmarks...",
  "Mapping skill gaps...",
  "Calculating match score...",
  "Generating recommendations...",
  "Compiling report...",
];

function ScanningLoader({ visible }: { visible: boolean }) {
  const [step, setStep]               = useState(0);
  const [progress, setProgress]       = useState(0);
  const [completedSteps, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    if (!visible) { setStep(0); setProgress(0); setCompleted([]); return; }
    const interval     = setInterval(() => {
      setStep(s => { const next = Math.min(s + 1, PIPELINE_STEPS.length - 1); setCompleted(p => [...p, s]); return next; });
    }, 900);
    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1.2, 95));
    }, 80);
    return () => { clearInterval(interval); clearInterval(progInterval); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{
        background: "#0a1628",
        border: "1px solid rgba(14,165,233,0.12)",
        boxShadow: "0 0 60px rgba(14,165,233,0.06), inset 0 0 60px rgba(14,165,233,0.025)",
        minHeight: "420px",
      }}>

      <div className="absolute inset-0" style={{ opacity: 0.75 }}>
        <NeuralGraph brightened />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent opacity-60 animate-pulse shadow-[0_0_12px_rgba(14,165,233,0.4)]" />
      </div>

      <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full" style={{ minHeight: "420px" }}>
        <div className="relative mb-8">
          <div className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-[radial-gradient(circle,rgba(14,165,233,0.18)_0%,transparent_65%)] blur-md animate-pulse" />
          <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10 bg-[rgba(14,165,233,0.08)] border border-[rgba(14,165,233,0.2)] shadow-[0_0_40px_rgba(14,165,233,0.15)] animate-pulse">
            <Brain className="w-9 h-9 text-[#0ea5e9]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#334155] mb-2">AI Processing</p>
          <p className="text-sm font-medium text-[#94a3b8] font-mono min-h-[20px]">{PIPELINE_STEPS[step]}</p>
        </div>

        <div className="w-full max-w-xs mb-6">
          <div className="relative h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.1)" }}>
            <div className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8)",
                boxShadow: "0 0 8px rgba(14,165,233,0.5)",
                transition: "width 0.1s linear",
              }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-[#1e293b] font-mono">Analyzing</span>
            <span className="text-[10px] text-[#334155] font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-1.5">
          {PIPELINE_STEPS.slice(0, step + 1).map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs transition-opacity duration-300"
              style={{ opacity: i < step ? 0.35 : 1 }}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: i < step ? "#1e293b" : "#0ea5e9" }} />
              <span style={{ color: i < step ? "#1e293b" : "#64748b", fontFamily: "monospace" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Match score ring ──────────────────────────────────────
function MatchRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const circumference = 251.2;

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      setDisplayScore(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 200);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 70 ? "#0ea5e9" : score >= 40 ? "#6366f1" : "#475569";
  const dashoffset = circumference - (circumference * displayScore) / 100;

  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
        <circle cx="48" cy="48" r="40" fill="transparent" stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear", filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <span className="absolute text-xl font-black text-[#f1f5f9] font-mono">{displayScore}%</span>
    </div>
  );
}

function RevealItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      {children}
    </div>
  );
}

export default function SkillGapPage() {
  const [targetRole, setTargetRole]           = useState("Frontend Developer");
  const [experienceLevel, setExperienceLevel] = useState("Junior");
  const [currentSkills, setCurrentSkills]     = useState<string[]>([]);
  const [skillInput, setSkillInput]           = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [loading, setLoading]   = useState(false);
  const [report, setReport]     = useState<SkillGapReport | null>(null);
  const [error, setError]       = useState("");
  const [history, setHistory]   = useState<SkillGapReport[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const [filterCategory, setFilterCategory] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  // ── Custom Dropdown State Engine ──
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const optionsRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    fetch("/api/ai/skill-gap").then(r => r.json()).then(d => { if (d.success) setHistory(d.data); });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredRoles = () => {
    return ALL_ROLES.filter(role => 
      role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredRolesList = getFilteredRoles();

  useEffect(() => {
    if (focusedIndex >= 0 && filteredRolesList[focusedIndex]) {
      const activeRoleName = filteredRolesList[focusedIndex];
      const activeElement = optionsRefs.current.get(activeRoleName);
      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [focusedIndex, filteredRolesList]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsDropdownOpen(true);
        const matchedIdx = filteredRolesList.indexOf(targetRole);
        setFocusedIndex(matchedIdx >= 0 ? matchedIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % filteredRolesList.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + filteredRolesList.length) % filteredRolesList.length);
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredRolesList[focusedIndex]) {
          setTargetRole(filteredRolesList[focusedIndex]);
          setIsDropdownOpen(false);
          setSearchQuery("");
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        setSearchQuery("");
        break;
      case "Tab":
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const skill = skillInput.trim();
    if (skill && !currentSkills.includes(skill)) { setCurrentSkills([...currentSkills, skill]); setSkillInput(""); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setReport(null);
    if (currentSkills.length === 0) { setError("Please add at least one current skill."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, experienceLevel, currentSkills, experienceSummary }),
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setReport(data.data); setLoading(false);
          fetch("/api/ai/skill-gap").then(r => r.json()).then(d => { if (d.success) setHistory(d.data); });
        }, 6500);
      } else {
        setError(data.error ?? "Failed to perform skill gap analysis."); setLoading(false);
      }
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  const filteredMissingSkills = report
    ? report.missingSkills.filter(s => filterCategory === "all" || s.category === filterCategory)
    : [];

  const importanceCfg = {
    high:   { bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)",  text: "#7c6ea8", label: "High" },
    medium: { bg: "rgba(14,165,233,0.06)",  border: "rgba(14,165,233,0.15)", text: "#5b9ab5", label: "Medium" },
    low:    { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", text: "#334155", label: "Low" },
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-[#e2e8f0]">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{
          position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "600px",
          background: "radial-gradient(ellipse, rgba(14,165,233,0.04) 0%, transparent 65%)",
          filter: "blur(40px)",
        }} />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#1e293b] mb-1">Analysis</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#f1f5f9] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
              </div>
              Skill Gap Engine
            </h1>
            <p className="text-sm text-[#334155] mt-1.5">
              Map your capabilities against target role requirements and get prioritized learning paths.
            </p>
          </div>

          <div className="flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { key: "analyze", icon: <Brain className="w-3.5 h-3.5" />, label: "Analyze" },
              { key: "history", icon: <History className="w-3.5 h-3.5" />, label: `History (${history.length})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab.key ? "rgba(255,255,255,0.05)" : "transparent",
                  color: activeTab === tab.key ? "#94a3b8" : "#334155",
                  borderBottom: activeTab === tab.key ? "1px solid rgba(14,165,233,0.2)" : "1px solid transparent",
                }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "analyze" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <div className="rounded-2xl p-6"
                style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h2 className="text-sm font-bold text-[#94a3b8] mb-5 tracking-wide">Target Profile</h2>

                {error && (
                  <div className="mb-4 p-3 rounded-xl text-xs text-[#f87171]"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Command-Palette Style Dropdown */}
                  <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334155] mb-2">Target Role</label>
                    
                    {/* Trigger Button Field */}
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                        if (!isDropdownOpen) {
                          const matchedIdx = filteredRolesList.indexOf(targetRole);
                          setFocusedIndex(matchedIdx >= 0 ? matchedIdx : 0);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-[#080c14] border border-white/5 text-left flex items-center justify-between transition-all duration-200 hover:border-sky-500/30 focus:outline-none focus:border-sky-500/50 group"
                      style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)" }}
                    >
                      <span className={targetRole ? "text-[#f1f5f9] font-medium" : "text-[#334155]"}>
                        {targetRole || "Select career track..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#334155] transition-transform duration-300 group-hover:text-[#94a3b8] ${isDropdownOpen ? "rotate-180 text-sky-400" : ""}`} />
                    </button>

                    {/* Dropdown Popover Card Overlay */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute z-50 left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#0d1520]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.75)] overflow-hidden transition-all duration-200 animate-[step-appear_0.15s_ease_forwards]"
                      >
                        {/* Search Bar Wrapper */}
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/5 bg-[#080c14]/50">
                          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setFocusedIndex(0);
                            }}
                            placeholder="Search career roles..."
                            className="bg-transparent text-xs text-[#cbd5e1] placeholder-slate-600 w-full focus:outline-none font-medium"
                            autoFocus
                          />
                          {searchQuery && (
                            <button type="button" onClick={() => { setSearchQuery(""); setFocusedIndex(0); }} className="text-slate-500 hover:text-slate-300">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* List Options Inner Scroller Container */}
                        <div 
                          ref={scrollContainerRef}
                          role="listbox"
                          className="max-h-52 overflow-y-auto pt-3 pb-1.5 px-1 scrollbar-thin scrollbar-thumb-white/5"
                        >
                          {(() => {
                            let runningGlobalIndex = 0;
                            let matchesFound = false;

                            const content = ROLE_CATEGORIES.map((catGroup) => {
                              const matchingRoles = catGroup.roles.filter(role => 
                                role.toLowerCase().includes(searchQuery.toLowerCase())
                              );

                              if (matchingRoles.length === 0) return null;
                              matchesFound = true;

                              return (
                                <div key={catGroup.category} className="space-y-0.5 mb-2.5 last:mb-0">
                                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500/70 px-3 py-1 flex items-center gap-1.5 select-none">
                                    <FolderKanban className="w-3 h-3 opacity-40" />
                                    {catGroup.category}
                                  </div>
                                  
                                  {matchingRoles.map((role) => {
                                    const currentItemIndex = runningGlobalIndex;
                                    runningGlobalIndex++;
                                    const isFocused = currentItemIndex === focusedIndex;
                                    const isSelected = targetRole === role;

                                    return (
                                      <button
                                        key={role}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        ref={(el) => {
                                          if (el) optionsRefs.current.set(role, el);
                                          else optionsRefs.current.delete(role);
                                        }}
                                        onMouseEnter={() => setFocusedIndex(currentItemIndex)}
                                        onClick={() => {
                                          setTargetRole(role);
                                          setIsDropdownOpen(false);
                                          setSearchQuery("");
                                        }}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-150 ease-out flex items-center justify-between transform ${
                                          isFocused 
                                            ? "bg-white/[0.04] text-white translate-x-[3px]" 
                                            : isSelected 
                                              ? "bg-sky-500/5 text-sky-400"
                                              : "text-[#cbd5e1]/80 hover:text-white"
                                        } ${isSelected ? "font-medium" : "font-normal"}`}
                                      >
                                        <span>{role}</span>
                                        {isSelected && (
                                          <div className="w-1 h-1 rounded-full bg-sky-400 shadow-[0_0_8px_#0ea5e9]" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            });

                            return matchesFound ? content : (
                              <div className="text-center py-6 text-xs text-slate-500 font-mono select-none">
                                No tracks match "{searchQuery}"
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334155] mb-2">Experience Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Junior","Mid-Level","Senior"].map(lvl => (
                        <button key={lvl} type="button" onClick={() => setExperienceLevel(lvl)}
                          className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out transform hover:-translate-y-[2px] active:translate-y-0"
                          style={{
                            background: experienceLevel === lvl ? "rgba(14,165,233,0.07)" : "rgba(255,255,255,0.02)",
                            border: experienceLevel === lvl ? "1px solid rgba(14,165,233,0.25)" : "1px solid rgba(255,255,255,0.05)",
                            color: experienceLevel === lvl ? "#5b9ab5" : "#334155",
                            boxShadow: experienceLevel === lvl ? "0 4px 12px rgba(14,165,233,0.08)" : "none"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(14,165,233,0.12)";
                            if (experienceLevel !== lvl) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = experienceLevel === lvl ? "0 4px 12px rgba(14,165,233,0.08)" : "none";
                            if (experienceLevel !== lvl) e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                          }}>
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334155] mb-2">Current Skills</label>
                    <div className="flex gap-2">
                      <input type="text" value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        placeholder="e.g. React, Python, Git"
                        className="neon-input flex-1 px-4 py-3 rounded-xl text-sm"
                        onKeyDown={e => e.key === "Enter" && handleAddSkill(e)} />
                      <button type="button" onClick={() => handleAddSkill()}
                        className="neon-btn px-4 py-3 rounded-xl text-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {currentSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-3 p-3 rounded-xl max-h-36 overflow-y-auto"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        {currentSkills.map(skill => (
                          <span key={skill}
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                            style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)", color: "#5b9ab5" }}>
                            {skill}
                            <button type="button" onClick={() => setCurrentSkills(currentSkills.filter(s => s !== skill))}
                              className="text-[#1e293b] hover:text-[#f87171] transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#1e293b] mt-2">No skills added yet.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334155] mb-2">
                      Context <span className="normal-case font-normal">(optional)</span>
                    </label>
                    <textarea value={experienceSummary} onChange={e => setExperienceSummary(e.target.value)}
                      placeholder="e.g. 6 months internship, built a React dashboard, self-taught..."
                      rows={3} className="neon-input w-full px-4 py-3 rounded-xl text-sm resize-none" />
                  </div>

                  <button type="submit" disabled={loading}
                    className="neon-btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200"
                    style={{ letterSpacing: "0.03em" }}
                    onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}>
                    <Brain className="w-4 h-4" />
                    {loading ? "Analyzing..." : "Analyze Skill Gaps"}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              {loading && <ScanningLoader visible={loading} />}

              {!loading && !report && (
                <div className="rounded-2xl flex flex-col items-center justify-center text-center py-20 relative overflow-hidden"
                  style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.05)", minHeight: "420px" }}>
                  <div className="absolute inset-0" style={{ opacity: 0.18 }}>
                    <NeuralGraph brightened={false} />
                  </div>
                  <div className="absolute pointer-events-none" style={{
                    top: "50%", left: "50%",
                    width: "180px", height: "180px",
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)",
                    filter: "blur(30px)",
                  }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)" }}>
                      <Brain className="w-7 h-7 text-[#64748b]" />
                    </div>
                    <h3 className="text-base font-bold text-[#94a3b8] mb-1">No Analysis Yet</h3>
                    <p className="text-xs text-[#5f7594] max-w-xs px-4">
                      Add your skills and target role, then hit Analyze to see your gap report.
                    </p>
                  </div>
                </div>
              )}

              {!loading && report && (
                <div className="space-y-4">
                  <RevealItem delay={0}>
                    <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
                      style={{ background: "#0d1520", border: "1px solid rgba(14,165,233,0.1)", boxShadow: "inset 0 0 40px rgba(14,165,233,0.025)" }}>
                      <MatchRing score={report.matchScore} />
                      <div>
                        <h3 className="text-lg font-bold text-[#f1f5f9]">
                          {report.matchScore}% match for{" "}
                          <span className="gradient-text">{report.targetRole}</span>
                        </h3>
                        <p className="text-xs text-[#334155] mt-1.5 leading-relaxed">
                          You match {report.matchScore}% of requirements for a {report.experienceLevel} role.
                          We identified {report.missingSkills.length} skill gaps to close.
                        </p>
                      </div>
                    </div>
                  </RevealItem>

                  <RevealItem delay={200}>
                    <div className="rounded-2xl p-6"
                      style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                        <h3 className="font-bold text-[#94a3b8] text-sm flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-[#475569]" />
                          Skill Gaps — {filteredMissingSkills.length} identified
                        </h3>
                        <div className="flex gap-1 p-1 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          {["all","beginner","intermediate","advanced"].map(cat => (
                            <button key={cat} onClick={() => setFilterCategory(cat as any)}
                              className="px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-all"
                              style={{
                                background: filterCategory === cat ? "rgba(255,255,255,0.05)" : "transparent",
                                color: filterCategory === cat ? "#64748b" : "#1e293b",
                              }}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                      {filteredMissingSkills.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredMissingSkills.map((skill, i) => {
                            const cfg = importanceCfg[skill.importance];
                            return (
                              <div key={i}
                                className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-150"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                                <div>
                                  <p className="font-semibold text-sm text-[#cbd5e1]">{skill.name}</p>
                                  <span className="text-[9px] uppercase font-bold text-[#1e293b] mt-0.5 block tracking-widest">{skill.category}</span>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
                                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
                                  {cfg.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-xs text-[#1e293b]">No gaps for "{filterCategory}" filter.</p>
                      )}
                    </div>
                  </RevealItem>

                  <RevealItem delay={400}>
                    <div className="rounded-2xl p-6"
                      style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <h3 className="font-bold text-[#94a3b8] text-sm flex items-center gap-2 mb-4">
                        <GraduationCap className="w-4 h-4 text-[#475569]" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2.5">
                        {report.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-[#475569] leading-relaxed">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold font-mono"
                              style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.1)", color: "#334155" }}>
                              {i + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </RevealItem>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6"
            style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="text-sm font-bold text-[#94a3b8] mb-5 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#475569]" />
              Analysis History
            </h2>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={item.id ?? idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4 transition-all duration-150"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(14,165,233,0.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)"; }}>
                    <div>
                      <h3 className="font-semibold text-[#94a3b8] text-sm">{item.targetRole} · {item.experienceLevel}</h3>
                      <p className="text-xs text-[#1e293b] mt-0.5">{item.missingSkills?.length || 0} gaps identified</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black font-mono text-[#475569]">{item.matchScore}%</span>
                      <button onClick={() => { setReport(item); setActiveTab("analyze"); }}
                        className="neon-btn text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 group transition-all"
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#67e8f9"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = ""; }}>
                        Load <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-10 h-10 mx-auto mb-3 text-[#0f172a]" />
                <p className="text-xs text-[#0f172a]">No analyses run yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}