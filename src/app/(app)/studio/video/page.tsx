"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import { Play, ImagePlus, X, Loader2, ChevronRight, Video } from "lucide-react";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
    }
  }, []);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const token = localStorage.getItem("token") || "";
      const body: any = { prompt };
      if (imageUrl) body.image_url = imageUrl;
      const res = await fetch(`${API_URL}/generate/image-to-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-header": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Generation failed");
      const videoUrl = data.video_url ? `${API_URL}${data.video_url}` : null;
      setResult(videoUrl);
      setRecent((prev) => [data, ...prev]);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Video Generation</h1>
            <p className="text-sm text-zinc-400">Image-to-video with MiniMax H3</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="glass-strong rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
              placeholder="Describe the motion or animation you want..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Reference Image</label>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const base64 = await toBase64(file);
                setImageUrl(base64);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors text-sm text-zinc-400"
            >
              <ImagePlus className="w-4 h-4" />
              {imageUrl ? "Change image" : "Upload image"}
            </button>
            {imageUrl && (
              <div className="relative w-32 h-32 mt-3 rounded-lg overflow-hidden bg-black">
                <img src={imageUrl} alt="Reference" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Generating video..." : "Generate Video"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-4 mb-8"
          >
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Result</h3>
            <video src={result} controls autoPlay loop className="w-full max-w-sm mx-auto rounded-xl" />
          </motion.div>
        )}

        {recent.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
            <div className="grid gap-4">
              {recent.map((gen) => (
                <div key={gen.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {gen.video_url ? (
                      <video src={`${API_URL}${gen.video_url}`} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Video className="w-8 h-8 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{gen.prompt}</p>
                    <p className="text-xs text-zinc-400 mt-1">{new Date(gen.created_at).toLocaleString()}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                        gen.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : gen.status === "processing"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {gen.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
