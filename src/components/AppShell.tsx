"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  Flame,
  Users,
  Bookmark,
  Video,
  Image as ImageIcon,
  Sparkles,
  Clapperboard,
  Bell,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react";
import { API_URL } from "@/lib/api";

export type AppUser = { id?: string; name: string; email: string; created_at?: string };

const UserContext = createContext<AppUser | null>(null);
export const useUser = () => useContext(UserContext);

const mainNav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/following", label: "Following", icon: Users },
  { href: "/library", label: "Library", icon: Bookmark },
];

const studioNav = [
  { href: "/studio/video", label: "Video Generation", icon: Video },
  { href: "/studio/image", label: "Image Generation", icon: ImageIcon },
  { href: "/studio/generations", label: "My Generations", icon: Sparkles },
];

const accountNav = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

const titles: Record<string, string> = Object.fromEntries(
  [...mainNav, ...studioNav, ...accountNav].map((n) => [n.href, n.label])
);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    setReady(true);
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { "auth-header": `Bearer ${token}` } });
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
          return;
        }
        if (res.ok) setUser(await res.json());
      } catch {}
    })();
  }, []);

  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (pathname.startsWith("/studio")) setStudioOpen(true);
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-white/10 text-white"
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    }`;

  if (!ready) return <div className="min-h-screen bg-[#050508]" />;

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-[#050508]">
        {drawerOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setDrawerOpen(false)} />}

        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-[#08080d] border-r border-white/10 z-50 flex flex-col transform transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <Link href="/home" className="flex items-center gap-2 px-6 h-16 shrink-0">
            <img src="/epix-logo.svg" alt="Epix" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">Epix</span>
          </Link>

          <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
            <div className="space-y-1">
              {mainNav.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={linkClass(href)}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            <div>
              <button
                onClick={() => setStudioOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Clapperboard className="w-3.5 h-3.5" />
                  Studio
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${studioOpen ? "" : "-rotate-90"}`} />
              </button>
              {studioOpen && (
                <div className="space-y-1">
                  {studioNav.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className={linkClass(href)}>
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              {accountNav.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={linkClass(href)}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-white/10 shrink-0">
            {user && (
              <Link href="/profile" className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="md:ml-64">
          <header className="sticky top-0 z-30 bg-[#050508]/80 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-3 h-16 px-4 sm:px-6">
              <button
                onClick={() => setDrawerOpen((o) => !o)}
                className="md:hidden text-zinc-400 hover:text-white"
                aria-label="Toggle menu"
              >
                {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h2 className="text-lg font-semibold shrink-0 hidden sm:block">{titles[pathname] ?? "Epix"}</h2>

              <form onSubmit={submitSearch} className="flex-1 max-w-md mx-auto">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search videos and creators"
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </form>

              <Link
                href="/studio/video"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Link>
              <Link href="/notifications" className="text-zinc-400 hover:text-white transition-colors" aria-label="Notifications">
                <Bell className="w-5 h-5" />
              </Link>
            </div>
          </header>

          <main className="p-4 sm:p-6 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
