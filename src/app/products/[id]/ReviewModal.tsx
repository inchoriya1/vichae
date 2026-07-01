'use client';

import { useState } from 'react';
import { createReview } from '@/app/products/actions';
import { useRouter } from 'next/navigation';

export default function ReviewModal({ productId, sellerId, reviewerId }: { productId: string, sellerId: string, reviewerId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('rating', rating.toString());
    formData.append('seller_id', sellerId);
    
    try {
      await createReview(productId, formData);
      alert('후기가 등록되었습니다.');
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || '후기 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-base rounded-2xl shadow-lg active:scale-[0.97] transition-all"
      >
        판매자 후기 남기기
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">판매자 후기 작성</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">별점</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform ${star <= rating ? 'text-yellow-400 scale-110' : 'text-zinc-300 dark:text-zinc-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  후기 내용
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  placeholder="판매자와의 거래는 어떠셨나요?"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
