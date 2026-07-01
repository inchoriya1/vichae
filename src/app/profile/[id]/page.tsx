import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTimeAgo } from '@/utils/helpers';

export const revalidate = 0;

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 프로필 정보 가져오기
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // 이 판매자의 상품 목록 가져오기
  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, images, created_at, status')
    .eq('seller_id', id)
    .order('created_at', { ascending: false });

  // 이 판매자가 받은 후기 목록 가져오기
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at, product_id, reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url), product:products(title)')
    .eq('seller_id', id)
    .order('created_at', { ascending: false });

  const temp = profile.temperature || 36.5;
  const tempEmoji = temp >= 40 ? '🥰' : temp >= 36.5 ? '😊' : '🙂';

  return (
    <div className="max-w-4xl mx-auto pb-28 animate-fade-in-up">
      {/* 프로필 헤더 */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-3xl shadow-inner flex-shrink-0">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username || ''} fill className="object-cover" unoptimized />
          ) : (
            <span>{(profile.username || '?').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">
            {profile.username || '알 수 없는 사용자'}
          </h1>
          <div className="text-lg text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center sm:justify-start gap-1">
            매너 온도 {temp.toFixed(1)}°C <span className="text-xl">{tempEmoji}</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-sm max-w-lg">
            이 사용자가 등록한 상품들과 받은 후기를 확인해 보세요.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* 상품 목록 (좌측/상단 넓게) */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            판매 상품 <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full text-sm">{products?.length || 0}</span>
          </h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="block group">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors flex gap-4 h-full">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      {p.images && p.images.length > 0 ? (
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
                      )}
                      {p.status !== 'available' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="text-white font-bold text-xs px-2 py-1 bg-zinc-900/80 rounded-lg backdrop-blur-md border border-white/10 shadow-xl">
                            {p.status === 'reserved' ? '예약 중' : '판매 완료'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h3 className="font-bold text-zinc-900 dark:text-white truncate text-base mb-1">{p.title}</h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">{p.price.toLocaleString()}원</p>
                      <p className="text-xs text-zinc-500 truncate">{getTimeAgo(p.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400">판매 중인 상품이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 받은 후기 (우측/하단) */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            받은 후기 <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full text-sm">{reviews?.length || 0}</span>
          </h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => {
                const reviewer = review.reviewer as { username: string, avatar_url: string } | null;
                const product = review.product as { title: string } | null;
                
                return (
                  <div key={review.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                          {reviewer?.avatar_url ? (
                            <Image src={reviewer.avatar_url} alt="Reviewer" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                              {(reviewer?.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{reviewer?.username || '알 수 없음'}</p>
                          <p className="text-xs text-zinc-500 leading-none">{getTimeAgo(review.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30 text-zinc-400'}>★</span>
                        ))}
                      </div>
                    </div>
                    
                    {product && (
                      <Link href={`/products/${review.product_id}`} className="block mb-2 text-xs text-emerald-600 hover:underline truncate">
                        {product.title} 거래 후기
                      </Link>
                    )}
                    
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">아직 작성된 후기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
