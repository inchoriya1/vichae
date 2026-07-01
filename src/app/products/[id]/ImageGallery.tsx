'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  title: string;
  statusInfo: {
    text: string;
    className: string;
  };
}

export default function ImageGallery({ images, title, statusInfo }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-zinc-300 dark:text-zinc-700">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div>
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 shadow-md mb-4 group">
        <Image
          src={images[currentIndex]}
          alt={`${title} - 이미지 ${currentIndex + 1}`}
          fill
          className="object-contain" 
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={100} 
          priority
        />
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.className} z-10 shadow-sm`}>
          {statusInfo.text}
        </div>

        {/* Image count */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full z-10">
            📷 {currentIndex + 1}/{images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 text-zinc-800 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-black hover:scale-110 z-10"
              aria-label="이전 사진"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 text-zinc-800 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-black hover:scale-110 z-10"
              aria-label="다음 사진"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Extra images grid */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 transition-all ${currentIndex === idx ? 'border-emerald-500 opacity-100 scale-100' : 'border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100'}`}
            >
              <Image src={img} alt={`thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" quality={80} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
