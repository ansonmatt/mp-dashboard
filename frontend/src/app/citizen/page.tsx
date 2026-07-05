"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, MapPin, UploadCloud, Mic, Zap, Loader2 } from "lucide-react";
import axios from "axios";

export default function CitizenPortal() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // New interactive states
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    if (location) {
      setLocation(null); // Toggle off
      return;
    }
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Location error:", error);
          alert("Could not fetch location. Please enable permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoName(e.target.files[0].name);
    }
  };

  const handleVoiceNote = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    // Simulate listening for 3 seconds
    setTimeout(() => {
      setIsListening(false);
      setContent((prev) => prev + (prev ? " " : "") + "This is a simulated transcribed voice note.");
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      // Use real location if available, otherwise random Delhi coords for demo
      const lat = location ? location.lat : 28.6 + (Math.random() * 0.2 - 0.1);
      const lng = location ? location.lng : 77.2 + (Math.random() * 0.2 - 0.1);
      await axios.post(`${API_URL}/submissions/`, {
        text_content: content + (photoName ? ` [Attached Photo: ${photoName}]` : ""),
        location_lat: lat,
        location_lng: lng,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
        <div className="glass-card rounded-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-[#059669] bg-[#059669]/10 border border-[#059669]/20">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#f5f5f5] mb-2">Request Submitted</h2>
          <p className="text-[#a3a3a3] text-sm mb-8 leading-relaxed">
            Our AI has processed your feedback and added it to the MP&apos;s development queue.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => { setSubmitted(false); setContent(""); setPhotoName(null); setLocation(null); }}
              className="btn-accent w-full py-2.5 px-4 rounded-lg font-medium text-sm"
            >
              Submit Another Request
            </button>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-lg font-medium text-sm text-[#d4d4d4] bg-[#171717] border border-[#262626] hover:bg-[#262626] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/" className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#171717] transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#262626]">
              <Zap size={12} className="text-[#3b82f6]" />
            </div>
            <h1 className="font-semibold text-sm text-[#f5f5f5]">Citizen Portal</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Share Your Concern</h2>
          <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-lg mx-auto">
            Describe the development work needed in your area. Our AI will automatically translate and route it to your MP.
          </p>
        </div>

        {/* Tips grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { emoji: "🛣️", tip: "Roads & Infra" },
            { emoji: "🏥", tip: "Health & Sanitation" },
            { emoji: "🏫", tip: "Education & Power" },
          ].map(({ emoji, tip }) => (
            <div key={tip} className="rounded-lg p-3 text-center bg-[#111111] border border-[#262626]">
              <div className="text-xl mb-1">{emoji}</div>
              <p className="text-[11px] text-[#a3a3a3] font-medium">{tip}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="glass-card rounded-xl overflow-hidden bg-[#171717] border-[#262626]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E.g., The main road near the central market is filled with potholes..."
              className="w-full h-48 p-5 bg-transparent resize-none outline-none text-[#f5f5f5] placeholder-[#525252] text-sm leading-relaxed"
              required
            />
            
            <div className="px-5 py-3 border-t border-[#262626] bg-[#111111] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                
                {/* Voice Note Button */}
                <button
                  type="button"
                  onClick={handleVoiceNote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isListening ? "bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/30 animate-pulse" : "bg-[#171717] text-[#a3a3a3] border-[#262626] hover:text-[#f5f5f5] hover:bg-[#262626]"
                  }`}
                >
                  <Mic size={14} />
                  {isListening ? "Listening..." : "Voice Note"}
                </button>

                {/* Upload Photo Button */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    photoName ? "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/30" : "bg-[#171717] text-[#a3a3a3] border-[#262626] hover:text-[#f5f5f5] hover:bg-[#262626]"
                  }`}
                >
                  <UploadCloud size={14} />
                  {photoName ? photoName.slice(0, 15) + (photoName.length > 15 ? "..." : "") : "Photo"}
                </button>

                {/* Location Button */}
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    location 
                      ? "bg-[#059669]/10 text-[#059669] border-[#059669]/30" 
                      : "bg-[#171717] text-[#a3a3a3] border-[#262626] hover:text-[#f5f5f5] hover:bg-[#262626]"
                  }`}
                >
                  {isLocating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {location ? "Location Attached" : "Add Location"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="btn-accent flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>Submit <Send size={14} /></>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#525252] mt-4 font-medium">
            Submissions are anonymized and processed securely.
          </p>
        </form>
      </main>
    </div>
  );
}
