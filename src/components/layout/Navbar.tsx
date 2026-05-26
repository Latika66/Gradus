"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Map, MessageSquare, User, FileSearch, Sparkles } from "lucide-react";

const navLinks = [
  { href: "/dashboard",       label: "Dashboard",   icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/roadmap",         label: "Roadmap",     icon: <Map className="w-4 h-4" /> },
  { href: "/skill-gap",       label: "Skill Gap",   icon: <Sparkles className="w-4 h-4" /> },
  { href: "/resume-analyzer", label: "Resume",      icon: <FileSearch className="w-4 h-4" /> },
  { href: "/doubt-solver",    label: "Doubt Solver",icon: <MessageSquare className="w-4 h-4" /> },
  { href: "/profile",         label: "Profile",     icon: <User className="w-4 h-4" /> },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.04)] bg-[rgba(8,12,20,0.88)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <span className="font-semibold text-sm text-[#94a3b8] hidden sm:block tracking-tight">
              SkillPulse
            </span>
          </Link>

          {/* Desktop Nav */}
          {session && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                      color: isActive ? "#94a3b8" : "#334155",
                      borderBottom: isActive ? "1px solid rgba(14,165,233,0.2)" : "1px solid transparent",
                    }}>
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-xs text-[#1e293b]">{session.user?.email}</span>
                  <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="neon-btn-danger text-xs px-3 py-1.5 rounded-lg">
                    Sign Out
                  </button>
                </div>
                <button className="md:hidden p-2 rounded-lg neon-btn"
                  onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                  <div className="w-4 h-3.5 flex flex-col justify-between">
                    <span className={`block h-px bg-[#475569] transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                    <span className={`block h-px bg-[#475569] transition-all ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block h-px bg-[#475569] transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                  </div>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="neon-btn text-xs px-4 py-2 rounded-lg">Sign In</Link>
                <Link href="/register" className="neon-btn-primary text-xs px-4 py-2 rounded-lg">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {session && menuOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.04)] bg-[rgba(8,12,20,0.97)] px-5 py-4">
          <div className="flex flex-col gap-0.5 mb-4">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{ color: isActive ? "#94a3b8" : "#334155", background: isActive ? "rgba(255,255,255,0.03)" : "transparent" }}>
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.04)] pt-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#64748b]">{session.user?.name}</div>
              <div className="text-xs text-[#1e293b]">{session.user?.email}</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="neon-btn-danger text-xs px-3 py-1.5 rounded-lg">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}