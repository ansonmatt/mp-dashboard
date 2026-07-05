'use client';
import { useState } from 'react';
import { Send, MapPin, Loader2, CheckCircle } from 'lucide-react';

export default function SubmitRequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate slight location randomization around New Delhi
      const lat = 28.6139 + (Math.random() - 0.5) * 0.1;
      const lng = 77.2090 + (Math.random() - 0.5) * 0.1;
      
      const res = await fetch('http://localhost:8000/submissions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_content: text,
          location_lat: lat,
          location_lng: lng
        }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setText('');
        setTimeout(() => setSuccess(false), 3000);
        onSubmitted();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl mb-8">
      <h3 className="text-xl font-bold text-white mb-2">Citizen Submission Simulator</h3>
      <p className="text-slate-400 text-sm mb-6">Type a simulated public grievance or development request below.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            placeholder="e.g. The main road near the community center is full of potholes. We need urgent repair."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-400 text-sm gap-2">
            <MapPin size={16} />
            <span>Auto-attaching mock GPS coordinates</span>
          </div>
          
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? 'Processing via AI...' : 'Submit Request'}
          </button>
        </div>
        
        {success && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm flex items-center gap-2 mt-4">
            <CheckCircle size={16} />
            Submission received, categorized, and added to dashboard!
          </div>
        )}
      </form>
    </div>
  );
}
