"use client";

import { useState } from "react";
import Link from "next/link";
import { Wand2, ArrowRight } from "lucide-react";
import Chips from "@/components/Chips";
import VideoGrid from "@/components/VideoGrid";
import { useStoredSet } from "@/lib/useStoredSet";
import { useUser } from "@/components/AppShell";
import { categories, videos } from "@/lib/videos";

export default function HomePage() {
  const user = useUser();
  const [category, setCategory] = useState("All");
  const saved = useStoredSet("epix-saved");
  const list = category === "All" ? videos : videos.filter((v) => v.category === category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="text-sm text-zinc-400 mt-1">Fresh AI-generated vertical videos picked for you.</p>
      </div>

      <Link
        href="/studio/video"
        className="flex items-center justify-between gap-4 rounded-2xl p-5 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-white/10 hover:border-white/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Create in Studio</p>
            <p className="text-sm text-zinc-300">Turn an image and a prompt into a vertical video.</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 shrink-0" />
      </Link>

      <Chips items={categories} active={category} onChange={setCategory} />
      <VideoGrid videos={list} isSaved={saved.has} onToggleSave={saved.toggle} />
    </div>
  );
}
