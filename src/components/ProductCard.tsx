import Image from 'next/image';
import Link from 'next/link';
import { getTimeAgo, getStatusLabel } from '@/utils/helpers';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  location: string;
  created_at: string;
  likes: number;
  status: string;
}

export default function ProductCard({
  id,
  title,
  price,
  images,
  location,
  created_at,
  likes,
  status,
}: ProductCardProps) {
  const timeAgo = getTimeAgo(created_at);
  const statusInfo = getStatusLabel(status);
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : '/placeholder.svg';

  return (
    <Link href={`/products/${id}`} className="group flex flex-col gap-3 animate-fade-in-up">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        {imageUrl !== '/placeholder.svg' ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-zinc-300 dark:text-zinc-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Status Badge */}
        {status !== 'available' && (
          <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.className}`}>
            {statusInfo.text}
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col px-0.5">
        <h3 className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100 truncate leading-snug">
          {title}
        </h3>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          {location} · {timeAgo}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[17px] font-bold text-zinc-900 dark:text-white">
            {price.toLocaleString()}원
          </span>
          {likes > 0 && (
            <div className="flex items-center text-zinc-400 dark:text-zinc-500 gap-1 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-rose-400">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span>{likes}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
