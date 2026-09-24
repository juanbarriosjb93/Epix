"use client";

import { UserPlus, UserCheck, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import VideoGrid from "@/components/VideoGrid";
import { useStoredSet } from "@/lib/useStoredSet";
import { creators, videos } from "@/lib/videos";

export default function FollowingPage() {
  const following = useStoredSet("epix-following");
  const saved = useStoredSet("epix-saved");
  const feed = videos.filter((v) => following.has(v.author));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Following</h1>
        <p className="text-sm text-zinc-400 mt-1">New videos from creators you follow.</p>
      </div>

      <section>
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Creators</h3>
        <div className="flex flex-wrap gap-2">
          {creators.map((name) => {
            const on = following.has(name);
            return (
              <button
                key={name}
                onClick={() => following.toggle(name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                  on ? "bg-violet-600/20 border-violet-500/40 text-violet-200" : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
                }`}
              >
                {on ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {name}
              </button>
            );
          })}
        </div>
      </section>

      {feed.length === 0 ? (
        <EmptyState icon={Users} title="You're not following anyone yet" hint="Follow a creator above to see their videos here." />
      ) : (
        <VideoGrid videos={feed} isSaved={saved.has} onToggleSave={saved.toggle} />
      )}
    </div>
  );
}
