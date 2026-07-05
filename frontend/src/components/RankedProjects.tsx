'use client';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/types';

export default function RankedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return <div className="glass-card p-6 rounded-2xl animate-pulse h-64"></div>;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
      <h3 className="text-xl font-bold text-white mb-6">AI Prioritized Projects</h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {projects.map((project, idx) => (
          <div key={project.id} className="glass p-4 rounded-xl flex items-start gap-4 group hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50 text-white font-bold shrink-0">
              #{idx + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{project.title}</h4>
              <p className="text-slate-400 text-sm mt-1">{project.description}</p>
              <div className="flex gap-3 mt-3">
                <span className="px-2 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300">{project.category}</span>
                <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/20 text-emerald-300">Score: {project.total_score.toFixed(1)}</span>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
