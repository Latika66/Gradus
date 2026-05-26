"use client";

import { useState } from "react";
import { RoadmapNode, NodeStatus, getNodeTypeConfig } from "@/types";
import { Check, Zap, Unlock, Lock, PlaySquare, GraduationCap, FileText, BookOpen, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface NodeCardProps {
  node: RoadmapNode;
  status: NodeStatus;
  index: number;
  onMarkComplete: (nodeId: string) => void;
  isLoading?: boolean;
}

export default function NodeCard({ node, status, index, onMarkComplete, isLoading }: NodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = getNodeTypeConfig(node.type);

  const statusClasses: Record<NodeStatus, string> = {
    completed: "node-completed",
    in_progress: "node-in-progress",
    unlocked: "node-unlocked",
    locked: "node-locked",
  };

  const statusLabels: Record<NodeStatus, React.ReactNode> = {
    completed: <div className="flex items-center gap-1"><Check className="w-3 h-3"/> Completed</div>,
    in_progress: <div className="flex items-center gap-1"><Zap className="w-3 h-3"/> In Progress</div>,
    unlocked: <div className="flex items-center gap-1"><Unlock className="w-3 h-3"/> Unlocked</div>,
    locked: <div className="flex items-center gap-1"><Lock className="w-3 h-3"/> Locked</div>,
  };

  return (
    <div className="relative flex gap-4">
      {/* Connector line */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg border-2 z-10"
          style={{
            background: config.bg,
            borderColor: status === "locked" ? "#1a2942" : config.color,
            boxShadow: status !== "locked" ? `0 0 15px ${config.color}40` : "none",
          }}
        >
          {config.icon}
        </div>
        {index >= 0 && (
          <div className="node-connector flex-1 min-h-[2rem] mt-1" />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 glass-card rounded-xl p-4 mb-4 border ${statusClasses[status]} cursor-pointer transition-all`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: config.bg, color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-xs text-[#64748b]">{statusLabels[status]}</span>
            </div>
            <h3 className="font-semibold text-sm md:text-base text-white">{node.title}</h3>
            <p className="text-xs text-[#64748b] mt-1">{node.estimatedDays} days · +{node.xpReward} XP</p>
          </div>
          <span className="text-[#64748b] mt-1">{expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}</span>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-[#94a3b8]">{node.description}</p>

            {/* Skills */}
            {node.skills?.length > 0 && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {node.skills.map((skill, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-md bg-[rgba(0,212,255,0.08)] text-[#00d4ff] border border-[rgba(0,212,255,0.15)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {node.resources?.length > 0 && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Resources</p>
                <div className="space-y-2">
                  {node.resources.slice(0, 3).map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(13,27,42,0.6)] border border-[#1a2942] hover:border-[rgba(0,212,255,0.3)] transition-colors"
                    >
                      <span className="flex items-center justify-center text-[#64748b]">
                        {res.type === "video" ? <PlaySquare className="w-4 h-4" /> : res.type === "course" ? <GraduationCap className="w-4 h-4" /> : res.type === "article" ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 text-xs text-[#94a3b8] truncate">{res.title}</span>
                      {res.free && <span className="text-xs text-[#00ff94] shrink-0">Free</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {node.tips && node.tips.length > 0 && (
              <div className="p-3 rounded-lg bg-[rgba(121,40,202,0.08)] border border-[rgba(121,40,202,0.2)]">
                <p className="flex items-center gap-1 text-xs text-[#7928ca] font-medium mb-1"><Lightbulb className="w-3 h-3"/> Tips</p>
                <ul className="space-y-1">
                  {node.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-[#94a3b8]">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action button */}
            {status !== "locked" && status !== "completed" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkComplete(node.id);
                }}
                disabled={isLoading}
                className="w-full neon-btn-primary text-sm py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Updating..." : <div className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Mark as Complete</div>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
