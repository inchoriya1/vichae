import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { logout } from '@/app/login/actions';
import ProfileEditor from '@/components/ProfileEditor';

export const revalidate = 0;

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 내가 등록한 상품 가져오기
  const { data: myProducts } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  // 찜한 상품 가져오기
  const { data: likedProductIds } = await supabase
    .from('product_likes')
    .select('product_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const pIds = likedProductIds?.map(row => row.product_id) || [];
  let likedProducts: any[] = [];

  if (pIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', pIds);
      
    if (products) {
      likedProducts = pIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    }
  }

  const currentUsername = profile?.username || user.email?.split('@')[0] || '알 수 없음';

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in-up">
      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {currentUsername.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
            <ProfileEditor initialUsername={currentUsername} />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {user.email}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">{profile?.temperature || 36.5}°C</span>
                  <span className="text-xs text-zinc-400">매너온도</span>
                </div>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900 dark:text-white">{myProducts?.length || 0}</span>
                  <span className="text-xs text-zinc-400">판매 상품</span>
                </div>
              </div>
              <Link 
                href="/mypage/keywords"
                className="mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                </svg>
                관심 키워드 설정
              </Link>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {/* My Products */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          내 판매 상품
        </h2>

        {myProducts && myProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {myProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">아직 등록한 상품이 없어요</p>
          </div>
        )}
      </div>

      {/* Liked Products */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          찜한 상품 <span className="text-zinc-400 font-normal ml-2">{likedProducts.length}개</span>
        </h2>

        {likedProducts && likedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {likedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">아직 찜한 상품이 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}
