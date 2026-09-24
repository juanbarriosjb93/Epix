"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import VideoGrid from "@/components/VideoGrid";
import { useStoredSet } from "@/lib/useStoredSet";
import { videos } from "@/lib/videos";

export default function LibraryPage() {
  const saved = useStoredSet("epix-saved");
  const list = videos.filter((v) => saved.has(v.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-sm text-zinc-400 mt-1">Videos you have saved.</p>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet" hint="Tap the bookmark on any video to keep it here.">
          <Link href="/explore" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition-colors">
            Explore videos
          </Link>
        </EmptyState>
      ) : (
        <VideoGrid videos={list} isSaved={saved.has} onToggleSave={saved.toggle} />
      )}
    </div>
  );
}
