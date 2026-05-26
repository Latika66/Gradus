"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { RoadmapNode, NodeStatus } from "@/types";
import { ArrowLeft, Clock, CheckCircle2, Circle, Lock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";

interface RoadmapData {
  id: string;
  title: string;
  targetRole: string;
  description: string;
  nodes: RoadmapNode[];
  nodeProgress: Record<string, NodeStatus>;
  totalXp: number;
  earnedXp: number;
  isActive: boolean;
  createdAt: string;
}

const NODE_TYPE_LABEL: Record<string, string> = {
  foundation: "Foundation",
  skills: "Skills",
  learning: "Learning",
  project: "Project",
  mastery: "Mastery",
  job: "Job Ready",
};

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status } = useSession();

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchRoadmap = useCallback(async () => {
    try {
      const res = await fetch(`/api/roadmap/${id}`);
      const json = await res.json();
      if (json.success) {
        setRoadmap(json.data);
      } else {
        setError(json.error ?? "Failed to load roadmap");
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchRoadmap();
  }, [status, fetchRoadmap, router]);

  const handleCompleteNode = async (nodeId: string) => {
    if (!roadmap) return;
    setCompleting(nodeId);
    try {
      const res = await fetch(`/api/user/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId: roadmap.id, nodeId, status: "completed" }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchRoadmap();
      } else {
        alert(json.error ?? "Failed to complete node");
      }
    } catch {
      alert("Network error.");
    } finally {
      setCompleting(null);
    }
  };

  const toggleExpand = (nodeId: string) => {
    setExpanded((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your roadmap..." />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center gap-4">
        <p className="text-[#f87171] text-sm">{error || "Roadmap not found"}</p>
        <Link href="/roadmap" className="text-sm text-[#94a3b8] hover:text-white transition-colors">
          ← Generate a new roadmap
        </Link>
      </div>
    );
  }

  const completedNodes = Object.values(roadmap.nodeProgress).filter((s) => s === "completed").length;
  const progressPct = roadmap.nodes.length > 0 ? Math.round((completedNodes / roadmap.nodes.length) * 100) : 0;
  const estimatedMonths = Math.ceil(
    roadmap.nodes.reduce((acc, n) => acc + (n.estimatedDays ?? 7), 0) / 30
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      <div className="pt-24 pb-24 px-4 md:px-8 max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 text-[#475569] hover:text-[#94a3b8] text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div
          className="rounded-xl p-7 mb-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-md"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
            >
              Active Roadmap
            </span>
            <span className="text-sm text-[#475569]">{progressPct}% complete</span>
          </div>

          <h1 className="text-xl font-semibold text-white mb-2 leading-snug">{roadmap.title}</h1>
          <p className="text-sm text-[#64748b] leading-relaxed mb-6">{roadmap.description}</p>

          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-[#3b82f6]"
              style={{ width: `${progressPct}%`, transition: "width 0.6s ease" }}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#475569]">
            <span>{roadmap.targetRole}</span>
            <span>~{estimatedMonths} month{estimatedMonths !== 1 ? "s" : ""}</span>
            <span>{roadmap.earnedXp} / {roadmap.totalXp} XP</span>
            <span>{completedNodes} / {roadmap.nodes.length} nodes</span>
          </div>
        </div>

        {/* Nodes */}
        <div className="space-y-3">
          {roadmap.nodes.map((node, index) => {
            const nodeStatus = (roadmap.nodeProgress[node.id] ?? "locked") as NodeStatus;
            const isCompleted = nodeStatus === "completed";
            const isLocked = nodeStatus === "locked";
            const isActive = nodeStatus === "unlocked" || nodeStatus === "in_progress";
            const isExpandable = !isLocked && node.resources?.length > 0;
            const isOpen = expanded[node.id] ?? false;

            return (
              <div
                key={node.id}
                className="rounded-xl transition-all"
                style={{
                  background: isCompleted
                    ? "rgba(255,255,255,0.02)"
                    : isLocked
                    ? "rgba(255,255,255,0.01)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid rgba(59,130,246,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                  opacity: isLocked ? 0.45 : 1,
                }}
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Step indicator */}
                  <div className="shrink-0 flex flex-col items-center mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="text-[#22c55e]" style={{ width: 20, height: 20 }} />
                    ) : isLocked ? (
                      <Lock className="text-[#2d3748]" style={{ width: 18, height: 18 }} />
                    ) : (
                      <Circle className="text-[#3b82f6]" style={{ width: 20, height: 20 }} />
                    )}
                    {index < roadmap.nodes.length - 1 && (
                      <div
                        className="w-px mt-2"
                        style={{
                          height: 24,
                          background: isCompleted ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-[#475569]">
                          Step {index + 1} &middot; {NODE_TYPE_LABEL[node.type] ?? node.type}
                        </span>
                        {isCompleted && (
                          <span className="text-xs text-[#22c55e]">Completed</span>
                        )}
                        {isActive && (
                          <span className="text-xs text-[#3b82f6]">In progress</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive && (
                          <button
                            onClick={() => handleCompleteNode(node.id)}
                            disabled={completing === node.id}
                            className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              border: "1px solid rgba(34,197,94,0.25)",
                              color: "#4ade80",
                            }}
                          >
                            {completing === node.id ? "Saving…" : "Mark done"}
                          </button>
                        )}
                        {isExpandable && (
                          <button
                            onClick={() => toggleExpand(node.id)}
                            className="p-1 text-[#475569] hover:text-[#94a3b8] transition-colors"
                          >
                            {isOpen
                              ? <ChevronUp style={{ width: 16, height: 16 }} />
                              : <ChevronDown style={{ width: 16, height: 16 }} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <h3
                      className="text-base font-medium mb-2 leading-snug"
                      style={{ color: isCompleted ? "#64748b" : "#e2e8f0" }}
                    >
                      {node.title}
                    </h3>

                    <p className="text-sm text-[#64748b] leading-relaxed mb-3">{node.description}</p>

                    {node.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {node.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2 py-0.5 rounded-md"
                            style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-5 text-xs text-[#334155]">
                      <span className="flex items-center gap-1.5">
                        <Clock style={{ width: 13, height: 13 }} />
                        {node.estimatedDays} days
                      </span>
                      <span>{node.xpReward} XP</span>
                      {node.resources?.length > 0 && (
                        <span>{node.resources.length} resource{node.resources.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable resources */}
                {isExpandable && isOpen && (
                  <div
                    className="mx-5 mb-5 pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-xs font-medium text-[#475569] mb-3">Resources</p>
                    <div className="space-y-2.5">
                      {node.resources.map((r, ri) => (
                        <a
                          key={ri}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors group"
                        >
                          <ExternalLink
                            className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity"
                            style={{ width: 13, height: 13 }}
                          />
                          <span className="truncate">{r.title}</span>
                          <span className="shrink-0 text-xs text-[#334155] uppercase tracking-wide">{r.type}</span>
                          {r.free && <span className="shrink-0 text-xs text-[#22c55e]">free</span>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion banner */}
        {completedNodes === roadmap.nodes.length && roadmap.nodes.length > 0 && (
          <div
            className="mt-8 rounded-xl p-7 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-base font-semibold text-white mb-2">Roadmap complete</p>
            <p className="text-sm text-[#475569] mb-5">
              {roadmap.earnedXp} XP earned &middot; {roadmap.nodes.length} nodes completed
            </p>
            <Link
              href="/roadmap"
              className="inline-block text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
              }}
            >
              Generate new roadmap
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
