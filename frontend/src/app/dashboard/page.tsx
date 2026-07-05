"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, FileText, TrendingUp,
  RefreshCw, Zap, BarChart2, MapPin, Users,
  MessageSquare, Clock, Flame, ChevronDown, ChevronUp,
} from "lucide-react";
import axios from "axios";
import { DashboardStatsType, Project, Hotspot, ThemeCount, Submission } from "@/types";
import HotspotMap from "@/components/HotspotMap";

/* ─── Score ring ────────────────────────────── */
function ScoreRing({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#262626" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#2563eb" strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold text-[#f5f5f5]">{score.toFixed(0)}</span>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
}
function StatCard({ icon, label, value, sub, colorClass }: StatCardProps) {
  return (
    <div className={`glass-card rounded-lg p-5 flex items-start gap-4 ${colorClass}`}>
      <div className="p-2.5 rounded-md bg-[#111111] border border-[#262626] flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">{label}</p>
        <p className="text-3xl font-bold text-[#f5f5f5] mt-1.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-[#525252] mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Urgency badge ─────────────────────────── */
function UrgencyBadge({ score }: { score: number }) {
  if (score >= 0.75) return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20">
      <Flame size={10} /> High
    </span>
  );
  if (score >= 0.45) return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20">
      <AlertTriangle size={10} /> Medium
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-[#0d9488]/10 text-[#0d9488] border border-[#0d9488]/20">
      Low
    </span>
  );
}

/* ─── Sentiment chip ─────────────────────────── */
function SentimentChip({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null;
  const styles: Record<string, string> = {
    Negative: "bg-[#e11d48]/10 text-[#e11d48]",
    Positive: "bg-[#059669]/10 text-[#059669]",
    Neutral:  "bg-[#404040]/30 text-[#a3a3a3]",
  };
  return (
    <span className={`px-2 py-0.5 text-[11px] rounded font-medium ${styles[sentiment] ?? styles.Neutral}`}>
      {sentiment}
    </span>
  );
}

/* ─── Pure time-ago helper ──────────────────── */
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = (new Date().getTime() - date.getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Submission Card ────────────────────────── */
function SubmissionCard({ sub }: { sub: Submission }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = sub.text_content.length > 180;
  const displayText = !expanded && isLong
    ? sub.text_content.slice(0, 180) + "…"
    : sub.text_content;

  return (
    <div className="glass-card rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {sub.extracted_theme && (
          <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-[#262626] text-[#d4d4d4]">
            {sub.extracted_theme}
          </span>
        )}
        <UrgencyBadge score={sub.urgency_score} />
        <SentimentChip sentiment={sub.sentiment} />
        <span className="ml-auto flex items-center gap-1 text-[11px] text-[#737373]">
          <Clock size={10} />{timeAgo(sub.created_at)}
        </span>
      </div>

      <p className="text-sm text-[#d4d4d4] leading-relaxed">{displayText}</p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
        >
          {expanded ? <><ChevronUp size={12} />Show less</> : <><ChevronDown size={12} />Read more</>}
        </button>
      )}

      {sub.location_lat && (
        <div className="flex items-center gap-1 text-[11px] text-[#737373]">
          <MapPin size={10} className="text-[#a3a3a3]" />
          {sub.location_lat.toFixed(4)}°N · {sub.location_lng?.toFixed(4)}°E
        </div>
      )}
    </div>
  );
}

/* ─── Project Row ───────────────────────────── */
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const rankClass = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "rank-n";
  const categoryColors: Record<string, string> = {
    Infrastructure: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20",
    Healthcare:     "bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/20",
    Education:      "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20",
    Sanitation:     "bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/20",
    Roads:          "bg-[#404040] text-[#f5f5f5] border-[#525252]",
  };
  const catStyle = categoryColors[project.category] ?? "bg-[#262626] text-[#a3a3a3] border-[#404040]";
  return (
    <div className="glass-card rounded-lg p-5 flex flex-col sm:flex-row items-start gap-4">
      <div className={`rank-badge ${rankClass}`}>#{index + 1}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${catStyle}`}>{project.category}</span>
        </div>
        <h3 className="text-sm font-semibold text-[#f5f5f5] leading-snug">{project.title}</h3>
        <p className="text-xs text-[#a3a3a3] mt-1 line-clamp-2">{project.description}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <ScoreRing score={project.total_score} max={100} />
        <span className="text-[10px] text-[#737373]">Base {project.base_score.toFixed(0)} · AI +{project.dynamic_score.toFixed(0)}</span>
      </div>
    </div>
  );
}

/* ─── Theme Bar ─────────────────────────────── */
function ThemeBar({ theme, count, maxCount }: { theme: string; count: number; maxCount: number; index: number }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-[#d4d4d4]">{theme}</span>
        <span className="text-[#a3a3a3]">{count}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className ?? ""}`} />;
}

/* ─── FILTER TABS ───────────────────────────── */
const FILTERS = ["All", "High Urgency", "Education", "Infrastructure", "Health", "Water", "Other"] as const;
type FilterLabel = typeof FILTERS[number];

/* ─── Main Dashboard ────────────────────────── */
export default function Dashboard() {
  const [stats, setStats]           = useState<DashboardStatsType | null>(null);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<"projects" | "submissions">("projects");
  const [filter, setFilter]         = useState<FilterLabel>("All");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, projectsRes, subsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`),
        axios.get(`${API_URL}/projects/`),
        axios.get(`${API_URL}/submissions/`),
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
      setSubmissions(subsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const maxThemeCount = stats?.top_themes?.reduce((m, t) => Math.max(m, t.count), 0) ?? 1;

  /* Apply submission filter */
  const filteredSubs = submissions.filter(s => {
    if (filter === "All")          return true;
    if (filter === "High Urgency") return s.urgency_score >= 0.75;
    return s.extracted_theme?.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#171717] transition-all">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-[#262626]">
                <Zap size={12} className="text-[#3b82f6]" />
              </div>
              <h1 className="font-semibold text-sm text-[#f5f5f5]">MP Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#737373]">
              <span className="pulse-dot" /><span>Live</span>
            </div>
            <button onClick={() => fetchData(true)} disabled={refreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-[#171717] text-[#a3a3a3] border border-[#262626] hover:bg-[#262626] hover:text-[#f5f5f5] transition-all disabled:opacity-50">
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />Refresh
            </button>
            <Link href="/citizen" className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs rounded">
              <Users size={12} />Citizen Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8 space-y-8">
        {/* ── Page Title ── */}
        <div>
          <h2 className="text-xl font-bold text-white">Development Intelligence Hub</h2>
          <p className="text-sm text-[#a3a3a3] mt-1">Analytics and project prioritization based on citizen feedback.</p>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<FileText size={18} className="text-[#2563eb]" />}   label="Total Submissions" value={stats?.total_submissions ?? 0}  sub="Citizen feedback received"   colorClass="stat-blue" />
            <StatCard icon={<AlertTriangle size={18} className="text-[#e11d48]" />} label="High Urgency"   value={stats?.hotspot_locations?.filter((h: Hotspot) => h.weight > 7).length ?? 0} sub="Requests needing attention" colorClass="stat-rose" />
            <StatCard icon={<TrendingUp size={18} className="text-[#0d9488]" />}  label="Top Theme"       value={stats?.top_themes?.[0]?.theme ?? "—"}  sub={`${stats?.top_themes?.[0]?.count ?? 0} mentions`} colorClass="stat-teal" />
            <StatCard icon={<BarChart2 size={18} className="text-[#d97706]" />}   label="Active Projects" value={projects.length}  sub="AI-ranked for action"        colorClass="stat-amber" />
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Left: Tabbed Projects / Submissions ── */}
          <div className="xl:col-span-2 space-y-4">
            {/* Tab switcher */}
            <div className="flex items-center p-1 rounded-md bg-[#111111] border border-[#262626] w-fit">
              <button
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === "projects" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#d4d4d4]"}`}
              >
                <BarChart2 size={14} />AI Projects
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === "submissions" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#d4d4d4]"}`}
              >
                <MessageSquare size={14} />Citizen Messages
                {submissions.length > 0 && (
                  <span className="px-1 py-0.5 text-[9px] font-bold rounded bg-[#404040] text-[#f5f5f5]">
                    {submissions.length}
                  </span>
                )}
              </button>
            </div>

            {/* ── PROJECTS TAB ── */}
            {activeTab === "projects" && (
              <>
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
                ) : projects.length === 0 ? (
                  <div className="glass-card rounded-lg py-16 flex flex-col items-center justify-center gap-3 text-[#525252]">
                    <BarChart2 size={32} />
                    <p className="text-sm">No projects found. Seed the database first.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((p, i) => <ProjectRow key={p.id} project={p} index={i} />)}
                  </div>
                )}
              </>
            )}

            {/* ── SUBMISSIONS TAB ── */}
            {activeTab === "submissions" && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-all ${filter === f ? "bg-[#e5e5e5] text-[#0a0a0a] border-[#e5e5e5]" : "bg-[#111111] text-[#a3a3a3] border-[#262626] hover:bg-[#171717] hover:text-[#d4d4d4]"}`}
                    >{f}</button>
                  ))}
                </div>

                {loading ? (
                  <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
                ) : filteredSubs.length === 0 ? (
                  <div className="glass-card rounded-lg py-16 flex flex-col items-center justify-center gap-3 text-[#525252]">
                    <MessageSquare size={32} />
                    <p className="text-sm">No submissions found for this filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubs.map(s => <SubmissionCard key={s.id} sub={s} />)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Themes */}
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#262626] bg-[#111111] flex items-center gap-2">
                <TrendingUp size={14} className="text-[#a3a3a3]" />
                <h3 className="text-sm font-semibold text-[#f5f5f5]">Emerging Themes</h3>
              </div>
              <div className="p-5 space-y-4">
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
                ) : stats?.top_themes?.length ? (
                  stats.top_themes.map((t: ThemeCount, i: number) => (
                    <ThemeBar key={i} theme={t.theme} count={t.count} maxCount={maxThemeCount} index={i} />
                  ))
                ) : (
                  <p className="text-xs text-[#737373]">No themes detected yet.</p>
                )}
              </div>
            </div>

            {/* Hotspot Map */}
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#262626] bg-[#111111] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#a3a3a3]" />
                  <h3 className="text-sm font-semibold text-[#f5f5f5]">Demand Hotspots</h3>
                </div>
                <span className="text-[10px] text-[#737373] uppercase tracking-wider">Delhi NCR</span>
              </div>
              <div className="h-64 bg-[#111111]">
                <HotspotMap hotspots={stats?.hotspot_locations ?? []} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
