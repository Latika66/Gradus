export default function LoadingSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeMap = { sm: "w-6 h-6", md: "w-10 h-10", lg: "w-16 h-16" };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeMap[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,212,255,0.1)]" />

      </div>
      {text && <p className="text-sm text-[#64748b]">{text}</p>}
    </div>
  );
}
