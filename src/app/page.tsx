import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0; // 항상 최신 데이터 가져오기

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let blockedIds: string[] = [];
  if (user) {
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', user.id);
    if (blocks) {
      blockedIds = blocks.map(b => b.blocked_id);
    }
  }

  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (blockedIds.length > 0) {
    query = query.not('seller_id', 'in', `(${blockedIds.join(',')})`);
  }
  
  const { data: products } = await query.limit(12);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative w-full rounded-3xl overflow-hidden px-6 py-16 sm:px-12 sm:py-20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between shadow-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-20 w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute right-1/4 top-1/2 w-2 h-2 bg-white/40 rounded-full" />
          <div className="absolute right-1/3 top-1/4 w-1.5 h-1.5 bg-white/30 rounded-full" />
          <div className="absolute left-1/4 bottom-1/3 w-1 h-1 bg-white/50 rounded-full" />
        </div>

        <div className="z-10 text-white max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            지금 바로 시작하세요
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm leading-tight">
            비우고 채우는<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">가치 있는 거래</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 font-medium mb-8 leading-relaxed">
            안 쓰는 물건은 비우고, 내게 필요한 물건으로 채워보세요.<br className="hidden sm:block" />
            ViChae에서 시작하는 합리적인 중고 라이프.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center px-7 py-3.5 text-base font-bold text-emerald-700 bg-white rounded-2xl hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/10"
            >
              내 물건 비우기
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-7 py-3.5 text-base font-bold text-white bg-white/15 backdrop-blur-sm rounded-2xl hover:bg-white/25 transition-all border border-white/20"
            >
              곳간 채우기
            </Link>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              최근 등록 상품
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              새로 올라온 물건들을 확인해보세요
            </p>
          </div>
          <Link href="/products" className="text-emerald-600 hover:text-emerald-500 font-semibold text-sm flex items-center gap-1 transition-colors group">
            전체보기
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
              <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h3 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 mb-2">아직 등록된 상품이 없어요</h3>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">첫 번째 상품을 등록해보세요!</p>
            <Link
              href="/sell"
              className="inline-flex items-center px-6 py-3 font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors"
            >
              상품 등록하기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
