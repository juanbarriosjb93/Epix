"use client";

import { useUser } from "@/components/AppShell";

export default function SettingsPage() {
  const user = useUser();

  const clearLocalData = () => {
    if (!confirm("Clear your saved videos and followed creators on this device?")) return;
    localStorage.removeItem("epix-saved");
    localStorage.removeItem("epix-following");
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Account</h3>
        <div className="text-sm">
          <p className="text-zinc-500">Name</p>
          <p>{user?.name ?? "-"}</p>
        </div>
        <div className="text-sm">
          <p className="text-zinc-500">Email</p>
          <p>{user?.email ?? "-"}</p>
        </div>
      </section>

      <section className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-medium">This device</h3>
        <p className="text-sm text-zinc-400">Saved videos and followed creators are stored in this browser.</p>
        <button onClick={clearLocalData} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition-colors">
          Clear saved data
        </button>
      </section>

      <button onClick={logout} className="px-5 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors">
        Sign out
      </button>
    </div>
  );
}
