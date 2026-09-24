"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { API_URL } from "@/lib/api";

type Generation = {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  video_url?: string;
  image_url?: string;
  outputs?: string[];
};

const abs = (u: string) => (u.startsWith("http") || u.startsWith("data:") ? u : `${API_URL}${u}`);

export default function GenerationsPage() {
  const [items, setItems] = useState<Generation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/generate/generations`, { headers: { "auth-header": `Bearer ${token}` } });
        if (!res.ok || stop) return;
        const data: Generation[] = await res.json();
        setItems(data);
        setLoaded(true);
        if (data.some((g) => g.status === "pending" || g.status === "processing")) timer = setTimeout(load, 3000);
      } catch {
        setLoaded(true);
      }
    };
    let timer: ReturnType<typeof setTimeout>;
    load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Generations</h1>
          <p className="text-sm text-zinc-400 mt-1">Everything you have made in Studio.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/video" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition-colors">
            New video
          </Link>
          <Link href="/studio/image" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition-colors">
            New image
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Sparkles} title="No generations yet" hint="Create a video or an image in Studio to get started." />
      ) : (
        <div className="grid gap-4">
          {items.map((gen) => (
            <div key={gen.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {gen.status === "completed" && gen.outputs && gen.outputs.length > 0 ? (
                  <img src={abs(gen.outputs[0])} alt="Generated" className="w-full h-full object-cover" />
                ) : gen.status === "completed" && gen.video_url ? (
                  <video src={abs(gen.video_url)} className="w-full h-full object-cover" muted />
                ) : gen.status === "processing" ? (
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                ) : gen.status === "pending" ? (
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                ) : gen.image_url ? (
                  <img src={gen.image_url.split("|")[0]} alt="Input" className="w-full h-full object-cover" />
                ) : gen.video_url ? (
                  <Video className="w-8 h-8 text-zinc-600" />
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
                      : gen.status === "processing" || gen.status === "pending"
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
  );
}
