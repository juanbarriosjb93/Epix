"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import { ImagePlus, X, Loader2, Image as ImageIcon, Video } from "lucide-react";

type Generation = {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  video_url?: string;
  image_url?: string;
  outputs?: string[];
  error?: string | null;
};

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [strength, setStrength] = useState(0.6);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Generation[]>([]);
  const [polling, setPolling] = useState(false);
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

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList).slice(0, 5);
    setFiles(arr);
    const base64s = await Promise.all(arr.map(toBase64));
    setPreviews(base64s);
    setResults([]);
    setError("");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || files.length === 0) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const token = localStorage.getItem("token") || "";
      const base64Images = await Promise.all(files.map(toBase64));
      const res = await fetch(`${API_URL}/generate/image-to-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-header": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          image_urls: base64Images,
          strength,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Generation failed");
      const outputs = (data.outputs || []).map((u: string) => {
        if (u.startsWith("http")) return u;
        if (u.startsWith("data:")) return u;
        const base = `${API_URL}${u}`;
        return base.includes("?") ? `${base}&t=${Date.now()}` : `${base}?t=${Date.now()}`;
      });
      setResults(outputs);
      setRecent((prev) => [data, ...prev]);
      setPolling(true);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!polling) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/generate/generations`, {
          headers: { "auth-header": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRecent(data);
          const stillProcessing = data.some((g: Generation) => g.status === "pending" || g.status === "processing");
          if (!stillProcessing) setPolling(false);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [polling]);

  return (
    <div>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Image Generation</h1>
            <p className="text-sm text-zinc-400">Image-to-image with Stable Diffusion</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="glass-strong rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
              placeholder="Describe the transformation or style you want..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Reference Images (up to 5)</label>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors text-sm text-zinc-400"
            >
              <ImagePlus className="w-4 h-4" />
              {previews.length > 0 ? `Change images (${previews.length})` : "Upload images"}
            </button>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img src={src} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => prev.filter((_, i) => i !== idx));
                        setPreviews((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Strength: {strength}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Image"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-4 mb-8"
          >
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Result</h3>
            <div className="grid grid-cols-2 gap-4">
              {results.map((src, i) => (
                <img key={i} src={src} alt={`Result ${i + 1}`} className="w-full rounded-xl" />
              ))}
            </div>
          </motion.div>
        )}

        {recent.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
            <div className="grid gap-4">
              {recent.map((gen) => (
                <div key={gen.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {gen.outputs && gen.outputs.length > 0 ? (
                      <img src={(gen.outputs && gen.outputs.length > 0 ? (gen.outputs[0].startsWith("http") ? gen.outputs[0] : gen.outputs[0].startsWith("data:") ? gen.outputs[0] : `${API_URL}${gen.outputs[0]}`) : "").split("?")[0] + "?t=" + Date.now()} alt="Generated" className="w-full h-full object-cover rounded-lg" />
                    ) : gen.status === "processing" ? (
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    ) : gen.status === "pending" ? (
                      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-600" />
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
