"use client";
import Link from "next/link";
import { BarChart2, Users, ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Logo */}
      <div
        className="flex items-center justify-center w-16 h-16 rounded-xl mb-8 bg-[#262626] border border-[#404040]"
      >
        <Zap size={28} className="text-[#3b82f6]" />
      </div>

      {/* Hero */}
      <h1 className="text-5xl sm:text-6xl font-bold text-center leading-tight max-w-2xl text-white">
        People&apos;s Priorities
      </h1>
      <p className="mt-5 text-lg text-[#a3a3a3] text-center max-w-xl leading-relaxed">
        Platform that consolidates citizen feedback and helps MPs prioritize
        development projects based on real community needs.
      </p>

      {/* Feature pills */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {[
          { icon: Globe,    text: "Multilingual Processing" },
          { icon: Shield,   text: "Urgency Detection" },
          { icon: BarChart2, text: "Smart Ranking" },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#d4d4d4] bg-[#171717] border border-[#262626]"
          >
            <Icon size={14} className="text-[#a3a3a3]" />
            {text}
          </span>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="btn-accent flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg font-medium text-base shadow-sm"
        >
          <BarChart2 size={18} />
          MP Dashboard
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/citizen"
          className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg font-medium text-[#f5f5f5] bg-[#171717] border border-[#404040] hover:bg-[#262626] transition-colors shadow-sm"
        >
          <Users size={18} />
          Submit a Request
        </Link>
      </div>

      {/* Divider / stat strip */}
      <div className="mt-16 flex gap-10 text-center border-t border-[#262626] pt-12">
        {[
          { val: "AI", label: "Analysis" },
          { val: "∞", label: "Languages" },
          { val: "Real-time", label: "Prioritization" },
        ].map(({ val, label }) => (
          <div key={label}>
            <p className="text-xl font-semibold text-white">{val}</p>
            <p className="text-xs text-[#a3a3a3] mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
