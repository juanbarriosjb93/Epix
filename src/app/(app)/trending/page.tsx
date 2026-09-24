"use client";

import VideoGrid from "@/components/VideoGrid";
import { useStoredSet } from "@/lib/useStoredSet";
import { videos } from "@/lib/videos";

const ranked = [...videos].sort((a, b) => b.likesNum - a.likesNum);

export default function TrendingPage() {
  const saved = useStoredSet("epix-saved");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trending</h1>
        <p className="text-sm text-zinc-400 mt-1">The most-liked videos right now.</p>
      </div>
      <VideoGrid videos={ranked} isSaved={saved.has} onToggleSave={saved.toggle} showRank />
    </div>
  );
}
