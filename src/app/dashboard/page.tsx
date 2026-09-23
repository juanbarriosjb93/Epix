"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Menu, X, Plus, Image as ImageIcon, Video, Sparkles, LogOut, User, Loader2 } from "lucide-react";

type Generation = {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  video_url?: string;
  image_url?: string;
  outputs?: string[];
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [mode, setMode] = useState<"image-to-video" | "image-to-image">("image-to-video");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { "auth-header": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
    };
    fetchUser();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = mode === "image-to-video" ? "/generate/image-to-video" : "/generate/image-to-image";
      const body: any = { prompt };
      if (mode === "image-to-video") {
        body.image_url = uploadedImages[0] || null;
      } else {
        body.image_urls = uploadedImages;
        body.strength = 0.6;
      }
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-header": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setGenerations((prev) => [data, ...prev]);
      setPrompt("");
      setUploadedImages([]);
      setPolling(true);
    } catch (err) {
      alert("Generation failed. Make sure backend is running.");
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
        const res = await fetch("http://localhost:8000/generate/generations", {
          headers: { "auth-header": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGenerations(data);
          const stillProcessing = data.some((g: Generation) => g.status === "pending" || g.status === "processing");
          if (!stillProcessing) setPolling(false);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [polling]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(files[i]);
        })
      );
    }
    Promise.all(readers).then((results) => {
      setUploadedImages((prev) => [...prev, ...results]);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-strong border-r border-white/10 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold">Epix</span>
          </div>

          <nav className="space-y-2">
            <a href="/create" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 text-white">
              <Video className="w-4 h-4" />
              <span className="text-sm">Video Generation</span>
            </a>
            <a href="/image-gen" className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Image Generation</span>
            </a>
            <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">My Generations</span>
            </a>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          {user && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-lg font-semibold">Generate</h2>
            <div className="w-8" />
          </div>
        </header>

        <main className="p-6 max-w-4xl mx-auto">
          {/* Generate form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 mb-8"
          >
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                  placeholder="Describe the motion or transformation you want..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  {mode === "image-to-video" ? "Image (optional)" : "Images (multiple allowed)"}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple={mode === "image-to-image"}
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/50 cursor-pointer transition-colors"
                  >
                    {uploadedImages.length > 0 ? (
                      <img src={uploadedImages[0]} alt="Preview" className="max-h-32 rounded-lg" />
                    ) : (
                      <span className="text-sm text-zinc-400">Click to upload image{uploadedImages.length > 0 ? "s" : ""}</span>
                    )}
                  </label>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {uploadedImages.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`Uploaded ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {loading ? "Generating..." : mode === "image-to-image" ? "Generate Images" : "Generate Video"}
              </button>
            </form>
          </motion.div>

          {/* Recent generations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
            {generations.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <Video className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No generations yet</p>
                <p className="text-sm text-zinc-500 mt-1">Upload an image and enter a prompt to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {generations.map((gen) => (
                  <div key={gen.id} className="glass rounded-xl p-4 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      {gen.status === "completed" && gen.outputs && gen.outputs.length > 0 ? (
                        <img src={gen.outputs[0].startsWith("http") ? gen.outputs[0] : `http://localhost:8000${gen.outputs[0]}`} alt="Generated" className="w-full h-full object-cover rounded-lg" />
                      ) : gen.status === "processing" ? (
                        <div className="flex items-center justify-center w-full h-full">
                          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                        </div>
                      ) : gen.status === "pending" ? (
                        <div className="flex items-center justify-center w-full h-full">
                          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                        </div>
                      ) : gen.video_url ? (
                        <video src={gen.video_url} className="w-full h-full object-cover rounded-lg" />
                      ) : gen.image_url && !gen.video_url ? (
                        <img src={gen.image_url.split("|")[0]} alt="Input" className="w-full h-full object-cover rounded-lg" />
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
