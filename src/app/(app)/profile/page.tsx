"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { useUser } from "@/components/AppShell";
import { useStoredSet } from "@/lib/useStoredSet";
import { API_URL } from "@/lib/api";

export default function ProfilePage() {
  const user = useUser();
  const saved = useStoredSet("epix-saved");
  const following = useStoredSet("epix-following");
  const [generations, setGenerations] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/generate/generations`, { headers: { "auth-header": `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setGenerations(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Generations", value: generations ?? "-" },
    { label: "Saved", value: saved.items.length },
    { label: "Following", value: following.items.length },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="glass-strong rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
          <UserIcon className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{user?.name ?? "..."}</h1>
          <p className="text-sm text-zinc-400 truncate">{user?.email}</p>
          {user?.created_at && (
            <p className="text-xs text-zinc-500 mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/studio/generations" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition-colors">
          My generations
        </Link>
        <Link href="/library" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition-colors">
          Library
        </Link>
      </div>
    </div>
  );
}
