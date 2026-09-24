"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import Chips from "@/components/Chips";
import EmptyState from "@/components/EmptyState";
import VideoGrid from "@/components/VideoGrid";
import { useStoredSet } from "@/lib/useStoredSet";
import { categories, videos } from "@/lib/videos";

function ExploreInner() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const [category, setCategory] = useState("All");
  const saved = useStoredSet("epix-saved");

  const list = videos.filter(
    (v) =>
      (category === "All" || v.category === category) &&
      (!q || v.title.toLowerCase().includes(q) || v.author.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-sm text-zinc-400 mt-1">{q ? `Results for "${q}"` : "Browse by category."}</p>
      </div>
      <Chips items={categories} active={category} onChange={setCategory} />
      {list.length === 0 ? (
        <EmptyState icon={SearchX} title="No videos found" hint="Try a different search or category." />
      ) : (
        <VideoGrid videos={list} isSaved={saved.has} onToggleSave={saved.toggle} />
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreInner />
    </Suspense>
  );
}
