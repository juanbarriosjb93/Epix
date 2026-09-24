export type VideoItem = {
  id: string;
  title: string;
  author: string;
  likes: string;
  likesNum: number;
  category: string;
  src: string;
  gradient: string;
};

export const categories = ["All", "Cinematic", "Cyberpunk", "Nature", "Abstract", "Business", "Fitness", "Food"];

// Sample catalogue until the backend exposes a public feed endpoint.
export const videos: VideoItem[] = [
  { id: "1", title: "Neon City Dance", author: "AI Studio", likes: "24.1K", likesNum: 24100, category: "Cyberpunk", src: "https://videos.pexels.com/video-files/5805069/5805069-uhd_1440_2560_25fps.mp4", gradient: "from-violet-600 to-fuchsia-500" },
  { id: "2", title: "Studio Vibes", author: "Wave AI", likes: "18.5K", likesNum: 18500, category: "Cinematic", src: "https://videos.pexels.com/video-files/7570258/7570258-uhd_1440_2732_25fps.mp4", gradient: "from-pink-500 to-rose-600" },
  { id: "3", title: "Groove Mode", author: "Synth Labs", likes: "31.2K", likesNum: 31200, category: "Abstract", src: "https://videos.pexels.com/video-files/7230792/7230792-uhd_1440_2560_25fps.mp4", gradient: "from-fuchsia-500 to-purple-600" },
  { id: "4", title: "Dance Floor", author: "Nature AI", likes: "12.8K", likesNum: 12800, category: "Nature", src: "https://videos.pexels.com/video-files/6452552/6452552-uhd_1440_2560_30fps.mp4", gradient: "from-orange-400 to-pink-500" },
  { id: "5", title: "Night Out", author: "Art AI", likes: "45.3K", likesNum: 45300, category: "Cinematic", src: "https://videos.pexels.com/video-files/8111663/8111663-hd_1080_1920_30fps.mp4", gradient: "from-blue-500 to-violet-600" },
  { id: "6", title: "Model Flow", author: "Cosmos AI", likes: "28.7K", likesNum: 28700, category: "Business", src: "https://cdn.pixabay.com/video/2024/06/03/215093_large.mp4", gradient: "from-rose-500 to-orange-500" },
  { id: "7", title: "Silhouette Dance", author: "City AI", likes: "19.9K", likesNum: 19900, category: "Fitness", src: "https://cdn.pixabay.com/video/2022/11/27/140631-775595881_large.mp4", gradient: "from-purple-600 to-indigo-700" },
  { id: "8", title: "Hair & Beat", author: "Light AI", likes: "33.4K", likesNum: 33400, category: "Food", src: "https://cdn.pixabay.com/video/2024/04/27/209715_large.mp4", gradient: "from-teal-500 to-emerald-600" },
];

export const creators = Array.from(new Set(videos.map((v) => v.author)));
