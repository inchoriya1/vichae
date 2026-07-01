'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTimeAgo } from '@/utils/helpers';

export default function ChatListClient({ activeRooms, userId }: { activeRooms: any[], userId: string }) {
  const [visibleCount, setVisibleCount] = useState(5);

  const visibleRooms = activeRooms.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-3">
      {visibleRooms.map((room: any) => {
        const isBuyer = room.buyer?.id === userId;
        const partner = isBuyer ? room.seller : room.buyer;
        const product = room.product;

        return (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            {/* 파트너 아바타 */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
              {partner?.avatar_url ? (
                <Image src={partner.avatar_url} alt="avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                  {(partner?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-zinc-900 dark:text-white truncate">
                  {partner?.username || '알 수 없음'}
                </span>
                <span className="text-xs text-zinc-400">
                  {room.last_message_at ? getTimeAgo(room.last_message_at) : '최근'}
                </span>
              </div>
              <div className="text-sm text-zinc-500 truncate">
                {product?.title}
              </div>
            </div>

            {/* 상품 썸네일 */}
            {product?.images?.[0] && (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-zinc-800">
                <Image src={product.images[0]} alt="product" fill className="object-cover" />
              </div>
            )}
          </Link>
        );
      })}

      {visibleCount < activeRooms.length && (
        <button
          onClick={() => setVisibleCount(v => v + 5)}
          className="mt-2 w-full py-3.5 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl transition-colors border border-transparent dark:border-zinc-800"
        >
          더보기 ({activeRooms.length - visibleCount}개 남음)
        </button>
      )}
    </div>
  );
}
