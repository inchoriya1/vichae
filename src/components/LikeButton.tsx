'use client';

import { useState } from 'react';

interface LikeButtonProps {
  productId: string;
  currentLikes: number;
  initialLiked?: boolean;
}

export default function LikeButton({ productId, currentLikes, initialLiked = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(currentLikes);

  const handleToggleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    // Supabase에 likes 카운트 업데이트
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, liked: !liked }),
      });
      if (!res.ok) {
        // 실패 시 롤백
        setLiked(liked);
        setLikeCount(currentLikes);
      }
    } catch {
      setLiked(liked);
      setLikeCount(currentLikes);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      className={`flex items-center justify-center w-14 h-14 rounded-2xl border transition-all active:scale-90 ${
        liked 
          ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-500' 
          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 hover:border-rose-300'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
        className="w-7 h-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
