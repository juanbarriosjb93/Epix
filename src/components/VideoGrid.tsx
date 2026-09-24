"use client";

import { useRef, useState } from "react";
import { Play, Heart, Bookmark, X } from "lucide-react";
import type { VideoItem } from "@/lib/videos";

type Props = {
  videos: VideoItem[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  showRank?: boolean;
};

export default function VideoGrid({ videos, isSaved, onToggleSave, showRank }: Props) {
  const [selected, setSelected] = useState<VideoItem | null>(null);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});

  const play = (id: string) => {
    const el = refs.current[id];
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  };
  const stop = (id: string) => refs.current[id]?.pause();

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video, i) => (
          <div
            key={video.id}
            className="group cursor-pointer"
            onClick={() => setSelected(video)}
            onMouseEnter={() => play(video.id)}
            onMouseLeave={() => stop(video.id)}
          >
            <div className="relative aspect-vertical rounded-xl overflow-hidden card-hover bg-black">
              <video
                ref={(el) => {
                  refs.current[video.id] = el;
                }}
                className="absolute inset-0 w-full h-full object-cover"
                src={video.src}
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              {showRank && (
                <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              )}
              <button
                type="button"
                aria-label={isSaved(video.id) ? "Remove from library" : "Save to library"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(video.id);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Bookmark className={`w-4 h-4 ${isSaved(video.id) ? "fill-violet-400 text-violet-400" : "text-white"}`} />
              </button>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-sm font-medium text-white mb-1 truncate">{video.title}</p>
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="truncate">{video.author}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Heart className="w-3 h-3" />
                    {video.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-zinc-300 hover:text-white"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <video src={selected.src} controls autoPlay loop playsInline className="w-full rounded-2xl bg-black aspect-vertical object-cover" />
            <div className="mt-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">{selected.title}</p>
                <p className="text-sm text-zinc-400">{selected.author}</p>
              </div>
              <button
                onClick={() => onToggleSave(selected.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm hover:border-white/20 transition-colors"
              >
                <Bookmark className={`w-4 h-4 ${isSaved(selected.id) ? "fill-violet-400 text-violet-400" : ""}`} />
                {isSaved(selected.id) ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
