import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  glowClass?: string;
}

export default function StatCard({ icon, label, value, subValue, color = "#00d4ff", glowClass }: StatCardProps) {
  return (
    <div className={`glass-card rounded-xl p-4 md:p-5 ${glowClass ?? ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-bold" style={{ color }}>{value}</p>
          {subValue && <p className="text-xs text-[#64748b] mt-1">{subValue}</p>}
        </div>
        <span className="text-[#94a3b8]" style={{ color }}>{icon}</span>
      </div>
    </div>
  );
}
