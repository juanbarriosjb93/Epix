"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Palette,
  Download,
  Search,
  Menu,
  X,
  ChevronRight,
  Crown,
  Star,
  Check,
  Video,
  Wand2,
  BarChart3,
  Heart,
  Users,
  XCircle,
  ImagePlus,
  Loader2,
} from "lucide-react";

type VideoItem = {
  id: string;
  title: string;
  author: string;
  likes: string;
  thumbnail: string;
  gradient: string;
};

const categories = [
  { label: "All", icon: Sparkles },
  { label: "Cinematic", icon: Video },
  { label: "Cyberpunk", icon: Zap },
  { label: "Nature", icon: Palette },
  { label: "Abstract", icon: Wand2 },
  { label: "Business", icon: TrendingUp },
  { label: "Fitness", icon: Zap },
  { label: "Food", icon: Heart },
];

const videos: VideoItem[] = [
  { id: "1", title: "Neon City Dance", author: "AI Studio", likes: "24.1K", thumbnail: "https://videos.pexels.com/video-files/5805069/5805069-uhd_1440_2560_25fps.mp4", gradient: "from-violet-600 to-fuchsia-500" },
  { id: "2", title: "Studio Vibes", author: "Wave AI", likes: "18.5K", thumbnail: "https://videos.pexels.com/video-files/7570258/7570258-uhd_1440_2732_25fps.mp4", gradient: "from-pink-500 to-rose-600" },
  { id: "3", title: "Groove Mode", author: "Synth Labs", likes: "31.2K", thumbnail: "https://videos.pexels.com/video-files/7230792/7230792-uhd_1440_2560_25fps.mp4", gradient: "from-fuchsia-500 to-purple-600" },
  { id: "4", title: "Dance Floor", author: "Nature AI", likes: "12.8K", thumbnail: "https://videos.pexels.com/video-files/6452552/6452552-uhd_1440_2560_30fps.mp4", gradient: "from-orange-400 to-pink-500" },
  { id: "5", title: "Night Out", author: "Art AI", likes: "45.3K", thumbnail: "https://videos.pexels.com/video-files/8111663/8111663-hd_1080_1920_30fps.mp4", gradient: "from-blue-500 to-violet-600" },
  { id: "6", title: "Model Flow", author: "Cosmos AI", likes: "28.7K", thumbnail: "https://cdn.pixabay.com/video/2024/06/03/215093_large.mp4", gradient: "from-rose-500 to-orange-500" },
  { id: "7", title: "Silhouette Dance", author: "City AI", likes: "19.9K", thumbnail: "https://cdn.pixabay.com/video/2022/11/27/140631-775595881_large.mp4", gradient: "from-purple-600 to-indigo-700" },
  { id: "8", title: "Hair & Beat", author: "Light AI", likes: "33.4K", thumbnail: "https://cdn.pixabay.com/video/2024/04/27/209715_large.mp4", gradient: "from-teal-500 to-emerald-600" },
];

const pricingTiers = [
  {
    name: "Creator",
    price: "$9",
    description: "For individual creators",
    features: ["100 AI videos/mo", "1080p downloads", "Basic templates", "Email support"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For professional studios",
    features: ["Unlimited AI videos", "4K downloads", "Premium templates", "Priority support", "API access", "Team collaboration"],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For large organizations",
    features: ["Unlimited everything", "8K downloads", "Custom models", "24/7 dedicated support", "White-label option", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const openVideo = (video: VideoItem) => setSelectedVideo(video);
  const closeVideo = () => setSelectedVideo(null);

  const handleMouseEnter = (id: string) => {
    const el = videoRefs.current[id];
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
      setPlayingId(id);
    }
  };

  const handleMouseLeave = (id: string) => {
    const el = videoRefs.current[id];
    if (el) {
      el.pause();
      setPlayingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/epix-logo.svg" alt="Epix" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold tracking-tight">Epix</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#feed" className="text-sm text-zinc-400 hover:text-white transition-colors">Feed</a>
              <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
              <a href="/auth/login" className="text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                Sign In
              </a>
              <a href="/auth/register" className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-opacity">
                Get Started
              </a>
            </div>

            <button
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-strong border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-zinc-400 hover:text-white">Features</a>
              <a href="#feed" className="block text-sm text-zinc-400 hover:text-white">Feed</a>
              <a href="#pricing" className="block text-sm text-zinc-400 hover:text-white">Pricing</a>
              <div className="pt-3 flex gap-3">
                <a href="/auth/login" className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10">Sign In</a>
                <a href="/auth/register" className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">Get Started</a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-fuchsia-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse-glow" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-zinc-300">AI-Powered Vertical Video Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              Create stunning
              <br />
              <span className="text-gradient">vertical videos</span>
              <br />
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
            >
              Generate premium-quality short-form content in seconds. No filming, no editing experience required.
              Just describe, create, and share.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="/auth/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Start Creating Free
                <ChevronRight className="w-4 h-4" />
              </a>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full glass hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 relative max-w-5xl mx-auto"
            >
              <div className="glass-strong rounded-2xl p-2 shadow-2xl">
                <div className="bg-zinc-900/50 rounded-xl overflow-hidden">
                  <div className="relative max-w-sm mx-auto">
                    <video
                      className="w-full aspect-vertical object-cover rounded-xl"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster=""
                    >
                      <source src="https://videos.pexels.com/video-files/7570258/7570258-uhd_1440_2732_25fps.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.label
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                    : "glass text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Feed */}
      <section id="feed" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trending Now</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Explore AI-generated vertical videos from creators around the world
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
                onClick={() => openVideo(video)}
                onMouseEnter={() => handleMouseEnter(video.id)}
                onMouseLeave={() => handleMouseLeave(video.id)}
              >
                <div className="relative aspect-vertical rounded-xl overflow-hidden card-hover bg-black">
                  <video
                    ref={(el) => { videoRefs.current[video.id] = el; }}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={video.thumbnail}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-sm font-medium text-white mb-1 truncate">{video.title}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>{video.author}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {video.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={closeVideo}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white transition-colors"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <video
                className="w-full aspect-vertical object-cover"
                src={selectedVideo.thumbnail}
                controls
                autoPlay
                loop
                playsInline
              />
              <div className="p-4 bg-zinc-900">
                <h3 className="text-lg font-semibold text-white">{selectedVideo.title}</h3>
                <p className="text-sm text-zinc-400">{selectedVideo.author}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <section id="features" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Epix?</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Everything you need to create, manage, and monetize AI-generated vertical content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wand2, title: "AI Generation", desc: "Create videos from text prompts using advanced diffusion models" },
              { icon: Zap, title: "Lightning Fast", desc: "Generate high-quality vertical videos in under 30 seconds" },
              { icon: Shield, title: "Commercial Safe", desc: "All content is royalty-free and cleared for commercial use" },
              { icon: TrendingUp, title: "Monetization", desc: "Earn revenue from your AI-generated content instantly" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10M+", label: "Videos Generated", icon: Video },
              { value: "500K+", label: "Active Creators", icon: Users },
              { value: "99.9%", label: "Uptime SLA", icon: Shield },
              { value: "150+", label: "Countries", icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 card-hover ${
                  tier.highlighted
                    ? "bg-gradient-to-b from-violet-900/40 to-zinc-900 border-violet-500/30"
                    : "glass"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{tier.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    <span className="text-zinc-400">/mo</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="/auth/register"
                  className={`block text-center w-full py-3 rounded-full font-medium transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90"
                      : "glass hover:bg-white/10"
                  }`}
                >
                  {tier.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Ready to create?</h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Join 500,000+ creators using Epix to generate stunning AI vertical videos
              </p>
              <a href="/auth/register" className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 transition-opacity">
                Start Creating Free
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/epix-logo.svg" alt="Epix" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold tracking-tight">Epix</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-zinc-500">© 2026 Epix. All rights reserved.</p>
          </div>
        </div>
        </footer>

        {/* Image-to-Image Tester */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <a
            href="/image-gen"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            Image Generation
          </a>
        </div>
    </div>
  );
}