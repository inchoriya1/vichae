import Image from 'next/image';
import Link from 'next/link';
import ImageGallery from './ImageGallery';
import LikeButton from '@/components/LikeButton';
import { createClient } from '@/utils/supabase/server';
import { getTimeAgo, getStatusLabel } from '@/utils/helpers';
import { notFound } from 'next/navigation';
import ProductActions from './ProductActions';
import ReviewModal from './ReviewModal';

export const revalidate = 0;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 현재 접속한 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser();

  // 상품 데이터 가져오기
  const { data: product, error } = await supabase
    .from('products')
    .select('*, profiles(username, avatar_url, temperature)')
    .eq('id', id)
    .single();

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-fade-in-up">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">삭제된 상품입니다</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8">판매자가 상품을 삭제했거나 존재하지 않는 페이지입니다.</p>
        <Link 
          href="/products" 
          className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium rounded-xl transition-colors shadow-sm"
        >
          다른 상품 곳간 채우기
        </Link>
      </div>
    );
  }

  // 조회수 증가
  await supabase
    .from('products')
    .update({ views: (product.views || 0) + 1 })
    .eq('id', id);

  const seller = product.profiles as { username: string; avatar_url: string | null; temperature: number } | null;
  const images = product.images as string[] || [];
  const statusInfo = getStatusLabel(product.status);
  const timeAgo = getTimeAgo(product.created_at);

  // 내가 찜했는지 여부 확인
  let isLiked = false;
  let isChatting = false;

  if (user) {
    const { data: likeData } = await supabase
      .from('product_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .single();
    if (likeData) {
      isLiked = true;
    }

    // 내가 이 상품에 대해 이미 채팅 중인지 여부 확인 (판매자가 아닌 경우)
    if (user.id !== product.seller_id) {
      const { data: chatRoomData } = await supabase
        .from('chat_rooms')
        .select('id, buyer_left')
        .eq('buyer_id', user.id)
        .eq('product_id', id)
        .single();
      
      if (chatRoomData && !chatRoomData.buyer_left) {
        isChatting = true;
      }
    }
  }

  // --- 시세 조회 (비슷한 상품) 로직 ---
  // 제목의 첫 두 단어로 AND 검색
  const words = product.title.split(' ').filter(Boolean);
  const searchWords = words.slice(0, 2);
  
  let similarProducts: any[] = [];
  let avgPrice = 0;

  if (searchWords.length > 0) {
    let query = supabase
      .from('products')
      .select('id, title, price, images, status')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(6);
      
    searchWords.forEach(w => {
      query = query.ilike('title', `%${w}%`);
    });

    const { data: sims } = await query;
    if (sims && sims.length > 0) {
      similarProducts = sims;
      const sum = sims.reduce((acc, curr) => acc + Number(curr.price), 0);
      avgPrice = Math.round(sum / sims.length);
    }
  }

  return (
    <div className="max-w-[1380px] mx-auto pb-28 animate-fade-in-up px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">홈</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-emerald-600 transition-colors">상품</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-white truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Content */}
      <div className="w-full">
        
        {/* Top Section: Title & Price */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            <span>{timeAgo}</span>
            <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
            <span>조회 {(product.views || 0) + 1}</span>
            <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
            <span>찜 {product.likes || 0}</span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-3 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight truncate flex-1">
              {product.title}
            </h1>
            <div className="-mt-1 flex-shrink-0 flex items-center gap-2">
              <LikeButton productId={id} currentLikes={product.likes || 0} initialLiked={isLiked} />
              {user && user.id !== product.seller_id && (
                <ProductActions productId={id} sellerId={product.seller_id} />
              )}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            {product.price.toLocaleString()}원
          </div>
        </div>

        {/* 2-Column Section: Image and Description */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Product Images */}
          <div className="w-full md:w-2/5 flex-shrink-0 min-w-0">
            <ImageGallery images={images} title={product.title} statusInfo={statusInfo} />
          </div>

          {/* Right Column: Description */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Product Description */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-5">상품 설명</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 text-lg">
                {product.description || '상품 설명이 없습니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 비슷한 상품 시세 영역 */}
        {similarProducts.length > 0 && (
          <div className="mt-12 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  비슷한 상품 시세
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  이 상품과 비슷한 조건의 다른 매물들입니다.
                </p>
              </div>
              <div className="text-right bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-2xl">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block mb-0.5">최근 평균가</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {avgPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarProducts.map(sim => (
                <Link key={sim.id} href={`/products/${sim.id}`} className="group block bg-zinc-50 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-md transition-all">
                  <div className="aspect-[4/3] bg-zinc-200 relative overflow-hidden">
                    {sim.images?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={sim.images[0]} alt="thumb" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">NO IMAGE</div>
                    )}
                    {sim.status !== 'available' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-3 py-1 bg-zinc-900/80 text-white text-xs font-bold rounded-lg border border-zinc-700/50">
                          판매완료
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate mb-1 group-hover:text-emerald-500 transition-colors">
                      {sim.title}
                    </h4>
                    <p className="font-bold text-zinc-900 dark:text-white">
                      {sim.price.toLocaleString()}원
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          {/* Seller Info (Bottom Left) */}
          <Link href={`/profile/${product.seller_id}`} className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-2 -ml-2 rounded-2xl transition-colors">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
              {seller?.avatar_url ? (
                <Image src={seller.avatar_url} alt={seller.username || ''} fill className="object-cover" unoptimized />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center">
                  {(seller?.username || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                {seller?.username || '알 수 없음'}
                <span className="text-emerald-500 text-xs flex items-center gap-0.5">
                  {seller?.temperature || 36.5}°C {(seller?.temperature || 36.5) >= 40 ? '😊' : '🙂'}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {product.location || '위치 미지정'}
              </div>
            </div>
          </Link>
            
          <div className="flex gap-2">
            {user && user.id === product.seller_id ? (
                <>
                  <Link 
                    href={`/products/${id}/edit`}
                    className="px-6 py-3.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-base rounded-2xl transition-all"
                  >
                    수정
                  </Link>
                  <form action={async () => {
                    'use server';
                    const { deleteProduct } = await import('@/app/products/actions');
                    await deleteProduct(id);
                  }}>
                    <button 
                      type="submit"
                      className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-rose-500/20 active:scale-[0.97] transition-all"
                    >
                      삭제
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {product.status === 'sold' && user && (
                    <ReviewModal productId={id} sellerId={product.seller_id} reviewerId={user.id} />
                  )}
                  <form action={async () => {
                    'use server';
                    const { createOrJoinChatRoom } = await import('@/app/chat/actions');
                    await createOrJoinChatRoom(id);
                  }}>
                    <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition-all">
                      {isChatting ? '현재 채팅중' : '채팅하기'}
                    </button>
                  </form>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
