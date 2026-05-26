"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getRank, getLevel } from "@/types";
import { 
  Target, Edit2, Shield, Award, Clock, Code2, User, Briefcase 
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  xp: number;
  level: number;
  currentStreak: number;
  totalDays: number;
  skills: string[];
  interests: string[];
  targetRole: string | null;
  bio: string | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    bio: "",
    targetRole: "",
    skillInput: "",
    skills: [] as string[],
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.success) {
        const p = data.data.profile;
        setProfile(p);
        setForm({
          name: p.name ?? "",
          bio: p.bio ?? "",
          targetRole: p.targetRole ?? "",
          skillInput: "",
          skills: p.skills ?? [],
        });
      }
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSkill = () => {
    const s = form.skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s], skillInput: "" }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          targetRole: form.targetRole,
          skills: form.skills,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Profile updated successfully!");
        setEditing(false);
        fetchProfile();
      } else {
        setError(data.error ?? "Failed to save.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const rawRank = profile ? getRank(getLevel(profile.xp)) : "Beginner";
  const rank = rawRank === "Rookie" ? "Beginner" : rawRank;
  const level = profile ? getLevel(profile.xp) : 1;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading profile..." />
          </div>
        )}

        {profile && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            
            {/* Minimal Profile Header Banner */}
            <div className="relative w-full h-28 md:h-36 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent border border-slate-800/80 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-purple-500/0 to-transparent"></div>
            </div>

            <div className="px-2 md:px-4">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Left Panel: Profile Card & Overview */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                  
                  {/* Account Overview Card */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 relative backdrop-blur-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-3xl font-bold border border-slate-700/50 text-slate-200">
                          {(profile.name ?? session?.user?.email ?? "?")[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-medium text-cyan-400">
                          Level {level}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditing(!editing)}
                        className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400 hover:text-slate-200 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 mb-4">
                      <h1 className="text-xl font-semibold tracking-tight text-slate-100">{profile.name ?? "User"}</h1>
                      <p className="text-xs text-slate-500 font-mono">{profile.email}</p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium tracking-wide mb-4">
                      <Shield className="w-3 h-3 text-cyan-500" /> {rank}
                    </div>

                    {profile.bio ? (
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">{profile.bio}</p>
                    ) : (
                      <p className="text-sm text-slate-600 italic mb-4">No bio summary configured.</p>
                    )}

                    {/* Developer Identity Meta Panel (Replaced Streak System) */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/60">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Preferred Role</span>
                        <span className="text-xs font-medium text-slate-300 mt-0.5 truncate">
                          {profile.targetRole || "No role selected"}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Experience Level</span>
                        <span className="text-xs font-medium text-slate-300 mt-0.5 font-mono truncate">
                          {profile.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-slate-500" /> Skills
                    </h2>
                    {profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-800 bg-slate-950/20 rounded-lg">
                        <p className="text-xs text-slate-500">No skills added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Config & Objectives */}
                <div className="w-full md:w-2/3 flex flex-col gap-6">
                  
                  {/* Edit Section Contextual View */}
                  {editing && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="font-medium text-slate-200 text-base flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" /> Profile Settings
                        </h2>
                        <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                      </div>

                      {error && <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-xs">{error}</div>}
                      {success && <div className="mb-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-xs">{success}</div>}

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Display Name</label>
                            <input
                              type="text"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Target Job Title</label>
                            <input
                              type="text"
                              value={form.targetRole}
                              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                              placeholder="e.g. Frontend Engineer"
                              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Bio Summary</label>
                          <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            rows={3}
                            placeholder="Write a brief intro regarding your development background..."
                            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 resize-none focus:outline-none focus:border-slate-700 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Manage Skills</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={form.skillInput}
                              onChange={(e) => setForm({ ...form, skillInput: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                              placeholder="Type a technology skill..."
                              className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                            />
                            <button onClick={handleAddSkill} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors">Add</button>
                          </div>
                          {form.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                              {form.skills.map((s) => (
                                <span key={s} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                  {s}
                                  <button onClick={() => handleRemoveSkill(s)} className="text-slate-500 hover:text-red-400 ml-1 transition-colors">×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="w-full py-2.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-950 hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          {saving ? <LoadingSpinner size="sm" /> : "Save Profile"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Goals Column */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-3.5 h-3.5 text-slate-400" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Goals</h2>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-slate-800/80 bg-slate-950/10">
                        <Target className="w-5 h-5 text-slate-600 mb-2 stroke-[1.5]" />
                        <p className="text-xs text-slate-500">No learning goals added</p>
                      </div>
                    </div>

                    {/* Achievements Column */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Achievements</h2>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-slate-800/80 bg-slate-950/10">
                        <Award className="w-5 h-5 text-slate-600 mb-2 stroke-[1.5]" />
                        <p className="text-xs text-slate-500">No achievements unlocked yet</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Log */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Activity Logs</h2>
                    </div>

                    <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-slate-800/80 bg-slate-950/10">
                      <Clock className="w-5 h-5 text-slate-600 mb-2 stroke-[1.5]" />
                      <p className="text-xs text-slate-500">No recent activity</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}