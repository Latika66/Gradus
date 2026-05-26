// ============================================
// SkillPulse AI - Core TypeScript Types
// ============================================

export type NodeType =
  | "foundation"
  | "skills"
  | "learning"
  | "project"
  | "mastery"
  | "job";

export type NodeStatus =
  | "locked"
  | "unlocked"
  | "in_progress"
  | "completed";

export type ResourceType =
  | "video"
  | "article"
  | "course"
  | "book"
  | "tool"
  | "documentation";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  free: boolean;
  estimatedHours?: number;
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  tech: string[];
  estimatedHours: number;
}

export interface RoadmapNode {
  id: string;
  order: number;
  title: string;
  description: string;
  type: NodeType;
  xpReward: number;
  skills: string[];
  resources: Resource[];
  projects: ProjectSuggestion[];
  estimatedDays: number;
  tips?: string[];
  status?: NodeStatus;
}

export interface GeneratedRoadmap {
  title: string;
  description: string;
  targetRole: string;
  estimatedMonths: number;
  totalXp: number;
  nodes: RoadmapNode[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  totalDays: number;
  skills: string[];
  interests: string[];
  targetRole: string | null;
  bio: string | null;
}

export interface UserStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number; // 0-100 percentage
  completedNodes: number;
  totalNodes: number;
  currentStreak: number;
  achievements: number;
  rank: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: string;
  earnedAt?: Date;
}

export interface DashboardData {
  profile: UserProfile;
  stats: UserStats;
  activeRoadmap: {
    id: string;
    title: string;
    targetRole: string;
    nodes: RoadmapNode[];
    nodeProgress: Record<string, NodeStatus>;
    totalXp: number;
    earnedXp: number;
  } | null;
  achievements: Achievement[];
  xpHistory: { date: string; xp: number }[];
}

// XP level calculation helpers (exported for reuse)
export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function getXPForNextLevel(level: number): number {
  return level * level * 100;
}

export function getLevelProgress(xp: number): number {
  const level = getLevel(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForNextLevel(level);
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
}

export function getRank(level: number): string {
  if (level <= 2) return "Rookie";
  if (level <= 4) return "Explorer";
  if (level <= 6) return "Developer";
  if (level <= 9) return "Engineer";
  if (level <= 12) return "Senior";
  if (level <= 16) return "Lead";
  if (level <= 20) return "Architect";
  return "Legend";
}

import { createElement, ReactNode } from "react";
import { Key, Zap, BookOpen, Rocket, Trophy, Briefcase } from "lucide-react";

export function getNodeTypeConfig(type: NodeType) {
  const configs: Record<
    NodeType,
    { label: string; icon: ReactNode; color: string; bg: string }
  > = {
    foundation: {
      label: "Foundation",
      icon: createElement(Key, { className: "w-5 h-5" }),
      color: "#00d4ff",
      bg: "rgba(0,212,255,0.1)",
    },
    skills: {
      label: "Skills",
      icon: createElement(Zap, { className: "w-5 h-5" }),
      color: "#7928ca",
      bg: "rgba(121,40,202,0.1)",
    },
    learning: {
      label: "Learning",
      icon: createElement(BookOpen, { className: "w-5 h-5" }),
      color: "#00ff94",
      bg: "rgba(0,255,148,0.1)",
    },
    project: {
      label: "Project",
      icon: createElement(Rocket, { className: "w-5 h-5" }),
      color: "#ff6b00",
      bg: "rgba(255,107,0,0.1)",
    },
    mastery: {
      label: "Mastery",
      icon: createElement(Trophy, { className: "w-5 h-5" }),
      color: "#ffd700",
      bg: "rgba(255,215,0,0.1)",
    },
    job: {
      label: "Job Ready",
      icon: createElement(Briefcase, { className: "w-5 h-5" }),
      color: "#00fff0",
      bg: "rgba(0,255,240,0.1)",
    },
  };
  return configs[type];
}
