"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { 
  FileSearch, UploadCloud, CheckCircle2, AlertCircle, GraduationCap,
  History, ArrowRight, FileText, X, ChevronDown, Search, Folder,
  Eye, BarChart, Key, Target, Activity, Check
} from "lucide-react";

interface ProjectSuggestion { title: string; description: string; tech: string[]; }
interface ResumeAnalysisReport {
  id?: string; fileName: string; atsScore: number;
  summary: string;
  strengths: string[]; weaknesses: string[]; missingKeywords: string[];
  projectSuggestions: ProjectSuggestion[]; fitScore: number; createdAt?: string;
}

const ROLE_CATEGORIES = [
  {
    category: "Software Development",
    roles: ["Frontend Developer","Backend Developer","Full Stack Developer","Mobile Developer","Embedded Systems Engineer","Game Developer"]
  },
  {
    category: "Data & AI",
    roles: ["AI/ML Engineer","Data Scientist","Data Analyst","Data Engineer"]
  },
  {
    category: "Cloud & DevOps",
    roles: ["DevOps Engineer","Site Reliability Engineer","Cloud Architect","Platform Engineer"]
  },
  {
    category: "Security",
    roles: ["Cybersecurity Analyst","Penetration Tester","Security Engineer"]
  },
  {
    category: "Design",
    roles: ["UI/UX Designer","Product Designer","Design Systems Engineer"]
  },
  {
    category: "Product & Management",
    roles: ["Product Manager","Technical Product Manager","Scrum Master","Engineering Manager"]
  },
];
const ALL_ROLES = ROLE_CATEGORIES.flatMap(c => c.roles);

export default function ResumeAnalyzerPage() {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ResumeAnalysisReport | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ResumeAnalysisReport[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<"analyze" | "history">("analyze");
  const [reportTab, setReportTab] = useState<"overview" | "skills" | "suggestions">("overview");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionsRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/ai/resume-analyze");
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) { console.error("Failed to load history", err); }
  };
  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isDropdownOpen]);

  const filteredCategories = ROLE_CATEGORIES.map(cat => ({
    ...cat,
    roles: cat.roles.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())),
  })).filter(cat => cat.roles.length > 0);
  const filteredRolesList = filteredCategories.flatMap(c => c.roles);

  useEffect(() => {
    if (focusedIndex >= 0 && filteredRolesList[focusedIndex]) {
      const el = optionsRefs.current.get(filteredRolesList[focusedIndex]);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, filteredRolesList]);

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsDropdownOpen(true);
        setFocusedIndex(Math.max(0, filteredRolesList.indexOf(targetRole)));
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault();
        setFocusedIndex(p => (p + 1) % filteredRolesList.length); break;
      case "ArrowUp":   e.preventDefault();
        setFocusedIndex(p => (p - 1 + filteredRolesList.length) % filteredRolesList.length); break;
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
      case "Tab": setIsDropdownOpen(false); break;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      setSelectedFile(file);
      setError("");
    } else { setError("Please upload a valid PDF file."); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      setSelectedFile(file); setError("");
    } else { setError("Please upload a valid PDF file."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setReport(null);
    if (!selectedFile) { setError("Please choose a resume to scan."); return; }
    setLoading(true); setReportTab("overview");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("targetRole", targetRole);
      const res = await fetch("/api/ai/resume-analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) { setReport(data.data);
      fetchHistory(); }
      else setError(data.error ?? "Could not read your resume. Try another file.");
    } catch { setError("Network issue. Please try scanning again."); }
    finally { setLoading(false); }
  };

  const currentStep = report ? 4 : loading ? 3 : selectedFile ? 2 : 1;

  let globalOptionIndex = 0;
  return (
    <div className="min-h-screen bg-[#07111F] text-[#F5F7FA] font-sans selection:bg-[#00D1FF]/30 selection:text-white pb-24">
      <style>{`
        /* Premium dropdown animations */
        @keyframes dropdown-open {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes step-appear {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scan-line {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .dropdown-open { animation: dropdown-open 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        /* Custom scrollbar — thinner, darker, cyan thumb */
        .dropdown-scroll::-webkit-scrollbar { width: 3px; }
        .dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 209, 255, 0.18);
          border-radius: 99px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 209, 255, 0.32);
        }
        .dropdown-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,209,255,0.18) transparent; }

        /* Trigger button */
        .role-trigger {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #F5F7FA;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: left;
          outline: none;
          user-select: none;
        }
        .role-trigger:hover {
          border-color: rgba(0,255,255,0.18);
          background: rgba(0,209,255,0.025);
        }
        .role-trigger[aria-expanded="true"] {
          border-color: rgba(0,255,255,0.18);
          background: rgba(0,209,255,0.03);
          box-shadow: 0 0 0 1px rgba(0,255,255,0.04);
        }

        /* Dropdown panel — reduced glow, backdrop blur */
        .dropdown-panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          z-index: 100;
          background: rgba(11,22,38,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,255,255,0.18);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0,255,255,0.04), 0 20px 40px rgba(0,0,0,0.45);
        }

        /* Search input inside dropdown */
        .dropdown-search {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: #F5F7FA;
          padding: 0;
        }
        .dropdown-search::placeholder { color: rgba(159,179,200,0.42); }

        /* Option row — more padding, full transition */
        .dropdown-option {
          width: 100%;
          text-align: left;
          padding: 8px 14px;
          font-size: 13px;
          color: rgba(159,179,200,0.75);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.18s ease;
          border: none;
          background: transparent;
        }
        .dropdown-option:hover,
        .dropdown-option.focused {
          background: rgba(255,255,255,0.05);
          color: #F5F7FA;
        }
        .dropdown-option.selected { color: #F5F7FA; }
        .dropdown-option.selected .option-dot { opacity: 1; }
        .option-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(0,209,255,0.75);
          opacity: 0;
          flex-shrink: 0;
          transition: opacity 0.18s ease;
        }

        /* Category label — smaller, more muted */
        .dropdown-category {
          padding: 10px 14px 3px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(159,179,200,0.38);
          opacity: 0.55;
        }
        .dropdown-category:not(:first-child) {
          border-top: 1px solid rgba(255,255,255,0.04);
          margin-top: 6px;
          padding-top: 12px;
        }
      `}</style>

      <Navbar />

      <div className="pt-24 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#1F3347]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0D1B2A] border border-[rgba(0,209,255,0.2)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,209,255,0.08)]">
                <FileSearch className="w-5 h-5 md:w-6 md:h-6 text-[#00D1FF]" />
              </div>
              <h1 className="text-3xl md:text-[42px] font-bold text-[#F5F7FA] tracking-tight">Resume Analyzer</h1>
            </div>
            <p className="text-[15px] text-[#CBD5E1] max-w-xl leading-relaxed mt-2">
              Scan your resume against real career descriptions to find keyword gaps, identify skill matches, and optimize your ATS performance.
            </p>
          </div>
          <div className="flex gap-1.5 p-1 rounded-lg bg-[#0D1B2A] border border-[#1F3347] self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveMainTab("analyze")}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all ${activeMainTab === "analyze" ? "bg-[#1F3347] text-[#00D1FF]" : "text-[#9FB3C8] hover:text-[#F5F7FA]"}`}
            >Analyze</button>
            <button
              onClick={() => setActiveMainTab("history")}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeMainTab === "history" ? "bg-[#1F3347] text-[#00D1FF]" : "text-[#9FB3C8] hover:text-[#F5F7FA]"}`}
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
          </div>
        </div>

        {activeMainTab === "analyze" ? (
          <>
            {/* Stepper */}
            <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 px-4">
              {[{ step:1, label:"Role" },{ step:2, label:"Upload" },{ step:3, label:"Analysis" },{ step:4, label:"Results" }].map((s, i) => (
                <div key={i} className="flex flex-col items-center relative z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-500 ${currentStep >= s.step ? "bg-[#00D1FF] text-[#07111F] shadow-[0_0_12px_rgba(0,209,255,0.3)]" : "bg-[#0D1B2A] border border-[#1F3347] text-[#9FB3C8]"}`}>
                    {currentStep > s.step ? <Check className="w-3.5 h-3.5 text-[#07111F]" /> : s.step}
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${currentStep >= s.step ? "text-[#F5F7FA]" : "text-[#9FB3C8]"}`}>{s.label}</span>
                </div>
              ))}
              <div className="absolute left-0 right-0 top-3.5 h-[2px] bg-[#0D1B2A] -z-0 max-w-2xl mx-auto px-10">
                <div className="h-full bg-[#00D1FF] transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,209,255,0.4)]" style={{ width:`${((currentStep-1)/3)*100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {/* Left: Config & Upload */}
              <div className="lg:col-span-4 flex">
                <div className="w-full p-7 rounded-2xl border border-[#1F3347] bg-[#0D1B2A] shadow-xl flex flex-col">
                  {error && (
                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] font-medium text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
                    <div className="relative" ref={dropdownRef} onKeyDown={handleDropdownKeyDown}>
                      <label className="block text-[11px] font-semibold text-[#9FB3C8] uppercase tracking-widest mb-2">
                        Target Role
                      </label>

                      {/* Trigger */}
                      <button
                        type="button"
                        className="role-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                        onClick={() => {
                          setIsDropdownOpen(o => !o);
                          if (!isDropdownOpen) setFocusedIndex(Math.max(0, filteredRolesList.indexOf(targetRole)));
                        }}
                      >
                        <span style={{ fontSize:13, fontWeight:500 }}>{targetRole}</span>
                        <ChevronDown
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{
                            color: isDropdownOpen ? "rgba(0,209,255,0.7)" : "rgba(159,179,200,0.5)",
                            transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease, color 0.2s ease",
                          }}
                        />
                      </button>

                      {/* Dropdown panel */}
                      {isDropdownOpen && (
                        <div className="dropdown-panel dropdown-open" role="listbox">
                          {/* Sticky search bar */}
                          <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0c1929", position: "sticky", top: 0, zIndex: 2 }}>
                            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(0,209,255,0.5)" }} />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchQuery}
                              onChange={e => { setSearchQuery(e.target.value); setFocusedIndex(0); }}
                              placeholder="Search career roles..."
                              className="dropdown-search"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                style={{ color: "rgba(159,179,200,0.4)", padding:2, lineHeight:1, background:"none", border:"none", cursor:"pointer" }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Options list */}
                          <div ref={listRef} className="dropdown-scroll" style={{ maxHeight: 300, overflowY: "auto", padding: "6px 6px 8px" }}>
                            {filteredCategories.length === 0 ? (
                              <div style={{ padding: "24px 12px", textAlign: "center", fontSize: 13, color: "rgba(159,179,200,0.45)" }}>No roles found</div>
                            ) : (
                              filteredCategories.map(cat => {
                                return (
                                  <div key={cat.category}>
                                    <div className="dropdown-category">{cat.category}</div>
                                    {cat.roles.map(role => {
                                      const idx = globalOptionIndex++;
                                      const isFocused = idx === focusedIndex;
                                      const isSelected = role === targetRole;
                                      return (
                                        <button
                                          key={role}
                                          type="button"
                                          role="option"
                                          aria-selected={isSelected}
                                          ref={el => { if (el) optionsRefs.current.set(role, el); else optionsRefs.current.delete(role); }}
                                          onMouseEnter={() => setFocusedIndex(idx)}
                                          onClick={() => { setTargetRole(role); setIsDropdownOpen(false); setSearchQuery(""); }}
                                          className={`dropdown-option${isFocused ? " focused" : ""}${isSelected ? " selected" : ""}`}
                                        >
                                          <span>{role}</span>
                                          <span className="option-dot" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload area */}
                    {!selectedFile ? (
                      <div
                        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                        className={`group relative flex flex-col items-center justify-center border-2 bg-[#07111F] rounded-2xl p-8 text-center transition-all duration-300 ${dragActive ? "border-[rgba(0,209,255,0.35)] shadow-[0_0_15px_rgba(0,209,255,0.08)] bg-[rgba(0,209,255,0.03)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,209,255,0.2)] hover:bg-[rgba(0,209,255,0.02)]"}`}
                      >
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-11 h-11 rounded-full bg-[#0D1B2A] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-[rgba(0,209,255,0.2)] group-hover:shadow-[0_0_12px_rgba(0,209,255,0.08)] transition-all duration-300">
                          <UploadCloud className="w-5 h-5 text-[#00D1FF]" />
                        </div>
                        <p className="text-[15px] font-semibold text-[#F5F7FA]">Upload your resume for detailed insights</p>
                        <p className="text-[13px] text-[#9FB3C8] mt-1.5">Drag & drop or click to browse files</p>
                        <div className="mt-5">
                          <span className="text-[11px] font-bold text-[#9FB3C8] bg-[#0D1B2A] border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-full">PDF • Max 5MB</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#00D1FF]/30 bg-[#00D1FF]/5 p-5 relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-14 bg-[#0D1B2A] border border-[#1F3347] rounded-lg flex flex-col items-center justify-center shrink-0 shadow-lg relative">
                            <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-[#1F3347] to-transparent rounded-bl-lg" />
                            <FileText className="w-5 h-5 text-[#00D1FF]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-[#F5F7FA] truncate">{selectedFile.name}</p>
                            <p className="text-[12px] text-[#9FB3C8] mt-1 flex items-center gap-2">
                              <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span className="w-1 h-1 rounded-full bg-[#1F3347]" />
                              <span className="text-[#00D1FF] flex items-center gap-1 font-medium"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                            </p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setSelectedFile(null)} className="text-[#9FB3C8] hover:text-red-400 p-2 rounded-lg hover:bg-[#07111F] transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-center pt-2 mt-auto">
                      <button
                        type="submit"
                        disabled={loading || !selectedFile}
                        className="w-full sm:w-3/4 py-3.5 rounded-xl text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
                        style={{
                          background: (!selectedFile || loading) ? "#1F3347" : "linear-gradient(90deg, #00D1FF 0%, #2563EB 100%)",
                          color: (!selectedFile || loading) ? "#9FB3C8" : "#FFFFFF",
                          boxShadow: (!selectedFile || loading) ? "none" : "0 8px 25px rgba(0,209,255,0.35)",
                        }}
                      >
                        {loading ? (
                          <><LoadingSpinner size="sm" /><span className="animate-pulse">Processing (est. 5s)...</span></>
                        ) : (
                          <><Activity className="w-4 h-4 group-hover:animate-pulse" /> Scan & Analyze Resume</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right: Results */}
              <div className="lg:col-span-8 flex">
                {loading ? (
                  <div className="w-full rounded-2xl border border-[#1F3347] bg-[#0D1B2A] shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-[#00D1FF]/10 to-transparent h-[200%] animate-[scan-line_2.5s_linear_infinite]" />
                    <div className="flex border-b border-[#1F3347] bg-[#07111F]">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex-1 py-4 flex justify-center border-b-2 border-transparent">
                          <div className="h-4 w-20 bg-[#1F3347] rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                    <div className="p-8 space-y-5 flex-1 relative z-10 flex flex-col justify-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#1F3347]/30 rounded-full border border-[#1F3347]">
                          <LoadingSpinner size="sm" />
                          <span className="text-[#9FB3C8] text-[13px] font-medium">Evaluating ATS & Skills Matching...</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-28 rounded-xl bg-[#1F3347]/30 animate-pulse border border-[#1F3347]/50" />
                        <div className="h-28 rounded-xl bg-[#1F3347]/30 animate-pulse border border-[#1F3347]/50" />
                      </div>
                      <div className="h-32 rounded-xl bg-[#1F3347]/30 animate-pulse border border-[#1F3347]/50" />
                    </div>
                  </div>
                ) : report ? (
                  <div className="w-full rounded-2xl border border-[#1F3347] bg-[#0D1B2A] shadow-2xl animate-[step-appear_0.3s_ease_forwards] overflow-hidden flex flex-col">
                    <div className="flex border-b border-[#1F3347] bg-[#07111F]">
                      {[{id:"overview",label:"Overview",icon:BarChart},{id:"skills",label:"Skills & Keywords",icon:Key},{id:"suggestions",label:"Portfolio Match",icon:Target}].map(tab => (
                        <button key={tab.id} onClick={() => setReportTab(tab.id as any)}
                          className={`flex-1 py-4 text-[14px] font-semibold flex items-center justify-center gap-2 transition-all ${reportTab === tab.id ? "text-[#00D1FF] border-b-2 border-[#00D1FF] bg-[#00D1FF]/5" : "text-[#9FB3C8] hover:text-[#F5F7FA] hover:bg-[#1F3347]/30 border-b-2 border-transparent"}`}>
                          <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-8 flex-1 overflow-auto">
                      {reportTab === "overview" && (
                        <div className="space-y-6 animate-[step-appear_0.2s_ease_forwards]">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl border border-[#1F3347] bg-[#07111F] flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart className="w-16 h-16" /></div>
                              <span className="text-[12px] font-bold text-[#9FB3C8] uppercase tracking-widest">ATS Score</span>
                              <div className="mt-4 flex items-end gap-2">
                                <span className={`text-[42px] font-bold leading-none ${report.atsScore >= 80 ? "text-[#00FF94]" : report.atsScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{report.atsScore}</span>
                                <span className="text-[#9FB3C8] text-[16px] mb-1">/100</span>
                              </div>
                            </div>
                            <div className="p-5 rounded-xl border border-[#1F3347] bg-[#07111F] flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-16 h-16" /></div>
                              <span className="text-[12px] font-bold text-[#9FB3C8] uppercase tracking-widest">Role Fit</span>
                              <div className="mt-4 flex items-end gap-2">
                                <span className="text-[42px] font-bold leading-none text-[#00D1FF]">{report.fitScore}%</span>
                                <span className="text-[#9FB3C8] text-[16px] mb-1">Match</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 rounded-xl border border-[#1F3347] bg-[#07111F]">
                            <h3 className="text-[16px] font-semibold text-[#F5F7FA] mb-2 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-[#00D1FF]" /> Executive Summary
                            </h3>
                            <p className="text-[15px] text-[#9FB3C8] leading-relaxed">{report.summary}</p>
                            <div className="mt-4 flex items-center gap-4 pt-4 border-t border-[#1F3347]">
                              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#00FF94] bg-[#00FF94]/10 px-2.5 py-1 rounded">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Parse Status: Success
                              </div>
                              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#00D1FF] bg-[#00D1FF]/10 px-2.5 py-1 rounded">
                                <Activity className="w-3.5 h-3.5" /> AI Confidence: 94%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {reportTab === "skills" && (
                        <div className="space-y-6 animate-[step-appear_0.2s_ease_forwards]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="p-5 rounded-xl border border-[#00FF94]/20 bg-[#00FF94]/5">
                              <h4 className="font-semibold text-[#00FF94] mb-3 flex items-center gap-2 text-[14px]"><CheckCircle2 className="w-4 h-4" /> Detected Strengths</h4>
                              <ul className="space-y-2.5">{report.strengths.map((str,idx) => <li key={idx} className="text-[14px] text-[#F5F7FA] leading-snug flex items-start gap-2"><span className="text-[#00FF94] font-bold mt-0.5">•</span>{str}</li>)}</ul>
                            </div>
                            <div className="p-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5">
                              <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2 text-[14px]"><AlertCircle className="w-4 h-4" /> Identified Weaknesses</h4>
                              <ul className="space-y-2.5">{report.weaknesses.map((weak,idx) => <li key={idx} className="text-[14px] text-[#F5F7FA] leading-snug flex items-start gap-2"><span className="text-yellow-400 font-bold mt-0.5">•</span>{weak}</li>)}</ul>
                            </div>
                          </div>
                          <div className="p-6 rounded-xl border border-[#1F3347] bg-[#07111F]">
                            <h3 className="font-semibold text-[#F5F7FA] mb-1.5 text-[16px] flex items-center gap-2"><Key className="w-4 h-4 text-[#00D1FF]" /> Missing Keywords</h3>
                            <p className="text-[14px] text-[#9FB3C8] mb-4">Add these industry keywords to increase match rates for <strong className="text-white">{targetRole}</strong>.</p>
                            {report.missingKeywords.length > 0 ? (
                              <div className="flex flex-wrap gap-2">{report.missingKeywords.map((kw,idx) => <span key={idx} className="text-[13px] px-3 py-1.5 rounded-lg bg-[#1F3347] border border-[#2A4365] text-[#F5F7FA] font-medium shadow-sm">+ {kw}</span>)}</div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] text-[14px] font-semibold"><CheckCircle2 className="w-4 h-4" /> Optimal keyword saturation achieved.</div>
                            )}
                          </div>
                        </div>
                      )}
                      {reportTab === "suggestions" && (
                        <div className="space-y-5 animate-[step-appear_0.2s_ease_forwards]">
                          <div className="flex items-center gap-2 mb-2"><GraduationCap className="w-5 h-5 text-[#00D1FF]" /><h3 className="font-semibold text-[#F5F7FA] text-[16px]">Portfolio Recommendations</h3></div>
                          {report.projectSuggestions.map((proj,idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-[#1F3347] bg-[#07111F] hover:border-[#00D1FF]/40 transition-colors group">
                              <h4 className="font-semibold text-[16px] text-[#F5F7FA] group-hover:text-[#00D1FF] transition-colors">{proj.title}</h4>
                              <p className="text-[14px] text-[#9FB3C8] mt-2 leading-relaxed">{proj.description}</p>
                              {proj.tech?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#1F3347]">
                                  {proj.tech.map((t,ti) => <span key={ti} className="text-[12px] px-2.5 py-1 rounded bg-[#0D1B2A] border border-[#1F3347] text-[#00D1FF] font-semibold font-mono">{t}</span>)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ══════════════════════════════════════════════════════
                      UPDATED PRE-UPLOAD PANEL (MATCHING DESIGN LAYOUT)
                     ══════════════════════════════════════════════════════ */
                  <div className="w-full relative rounded-2xl bg-[#07111F] border border-[#1F3347]/60 flex flex-col items-center justify-center overflow-hidden min-h-[480px]">
                    
                    {/* Ghost/Skeletal background blocks replicating image grid context */}
                    <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8 opacity-25 pointer-events-none select-none">
                      <div className="bg-[#0D1B2A]/40 border border-[#1F3347]/40 rounded-xl h-28"></div>
                      <div className="bg-[#0D1B2A]/40 border border-[#1F3347]/40 rounded-xl h-28"></div>
                      <div className="bg-[#0D1B2A]/40 border border-[#1F3347]/40 rounded-xl h-44"></div>
                      <div className="bg-[#0D1B2A]/40 border border-[#1F3347]/40 rounded-xl h-44"></div>
                      <div className="bg-[#0D1B2A]/40 border border-[#1F3347]/40 rounded-xl h-24"></div>
                      <div className="bg-[#0D1B2A]/40 border border-[#1F3347]/40 rounded-xl h-24"></div>
                    </div>

                    {/* Central Focused Card */}
                    <div className="relative z-10 bg-[#0B1523] border border-[#1F3347] rounded-2xl p-8 max-w-sm w-full mx-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                      
                      {/* Upload Ring Icon with Radial Glow */}
                      <div className="w-14 h-14 rounded-full bg-[#07111F] border border-[#00D1FF]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,209,255,0.12)]">
                        <UploadCloud className="w-6 h-6 text-[#00D1FF]" />
                      </div>

                      <h3 className="text-[17px] font-semibold text-[#F5F7FA] text-center mb-6 leading-snug tracking-tight">
                        Upload a resume to see insights
                      </h3>

                      <ul className="space-y-3">
                        {[{label:"ATS Score & Benchmarking",icon:BarChart},{label:"Keyword Match Insights",icon:Target},{label:"Resume Formatting Review",icon:FileSearch}].map((feat,idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3.5 text-[13.5px] font-medium text-[#9FB3C8] p-2 rounded-lg transition-all duration-200 hover:bg-white/5 hover:text-[#F5F7FA] group cursor-default"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#1F3347]/40 border border-transparent flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-[#00D1FF]/10 group-hover:border-[#00D1FF]/20">
                              <feat.icon className="w-3.5 h-3.5 text-[#00D1FF]" />
                            </div>
                            {feat.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 rounded-2xl border border-[#1F3347] bg-[#0D1B2A] shadow-2xl animate-[step-appear_0.2s_ease_forwards]">
            <h2 className="text-[18px] font-bold text-[#F5F7FA] mb-6 flex items-center gap-2 pb-4 border-b border-[#1F3347]">
              <History className="w-5 h-5 text-[#00D1FF]" /> Analysis History
            </h2>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item,idx) => (
                  <div key={item.id ?? idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-[#07111F] border border-[#1F3347] hover:border-[#00D1FF]/40 transition-all gap-4 group">
                    <div>
                      <h3 className="font-semibold text-[#F5F7FA] text-[16px] group-hover:text-[#00D1FF] transition-colors">{item.fileName}</h3>
                      <p className="text-[14px] text-[#9FB3C8] mt-1.5">ATS Score: <span className="font-bold text-white">{item.atsScore}</span> <span className="mx-2 text-[#1F3347]">|</span> Role Match: <span className="font-bold text-[#00D1FF]">{item.fitScore}%</span></p>
                    </div>
                    <button onClick={() => { setReport(item); setActiveMainTab("analyze"); }} className="text-[14px] font-semibold px-4 py-2 rounded-lg bg-[#1F3347] border border-[#2A4365] text-[#F5F7FA] hover:bg-[#00D1FF] hover:text-[#07111F] hover:border-[#00D1FF] transition-all flex items-center gap-2 shadow-sm self-end sm:self-auto">
                      View Insights <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#07111F] border border-[#1F3347] flex items-center justify-center mx-auto mb-4"><History className="w-8 h-8 text-[#9FB3C8]" /></div>
                <p className="text-[16px] font-medium text-[#F5F7FA] mb-1">No scan history found</p>
                <p className="text-[14px] text-[#9FB3C8]">Your previous AI resume analyses will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}