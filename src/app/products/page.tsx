import ProductCard from '@/components/ProductCard';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function ProductsPage() {
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

  const { data: products } = await query;

  return (
    <div className="pb-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          곳간 채우기
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          등록된 모든 상품을 확인해보세요
        </p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h3 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 mb-2">등록된 상품이 없습니다</h3>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">첫 번째 상품을 등록해보세요!</p>
        </div>
      )}
    </div>
  );
}
