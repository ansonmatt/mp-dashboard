'use client';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { DashboardStatsType } from '@/types';

export default function OverviewMetrics({ stats }: { stats: DashboardStatsType }) {
  if (!stats) return <div className="glass-card p-6 rounded-2xl animate-pulse h-32"></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105">
        <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
          <FileText size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Total Submissions</p>
          <h3 className="text-3xl font-bold text-white">{stats.total_submissions}</h3>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105">
        <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Top Category</p>
          <h3 className="text-xl font-bold text-white">{stats.top_themes?.[0]?.theme || 'N/A'}</h3>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105">
        <div className="p-4 bg-purple-500/20 text-purple-400 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Citizens Reached</p>
          <h3 className="text-3xl font-bold text-white">{stats.total_submissions * 14}</h3>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105">
        <div className="p-4 bg-orange-500/20 text-orange-400 rounded-xl">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Actionable Projects</p>
          <h3 className="text-3xl font-bold text-white">4</h3>
        </div>
      </div>
    </div>
  );
}
