import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import { deleteProductByAdmin } from './actions';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. 전체 통계 데이터 조회
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // 2. 최근 등록된 상품 조회 (프로필 JOIN)
  const { data: recentProducts } = await supabase
    .from('products')
    .select('*, profiles(username, email)')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2">
          대시보드 요약
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          서비스 전체 현황과 등록된 상품들을 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">총 가입 유저</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{usersCount || 0}<span className="text-lg font-normal text-zinc-400 ml-1">명</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">누적 등록 상품</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{productsCount || 0}<span className="text-lg font-normal text-zinc-400 ml-1">개</span></p>
          </div>
        </div>
      </div>

      {/* 최근 상품 관리 목록 */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="font-bold text-zinc-900 dark:text-white text-lg">최근 등록 상품 관리</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="px-6 py-4">상품 (ID)</th>
                <th className="px-6 py-4">판매자</th>
                <th className="px-6 py-4">가격</th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4 text-right">관리 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {recentProducts?.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">?</div>
                        )}
                      </div>
                      <div className="min-w-[120px] max-w-[200px] truncate font-medium text-zinc-900 dark:text-zinc-100">
                        {product.title}
                        <div className="text-[10px] text-zinc-400 truncate mt-0.5" title={product.id}>{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{product.profiles?.username || '알 수 없음'}</div>
                    <div className="text-xs text-zinc-400">{product.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {product.price.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                      product.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteProductByAdmin.bind(null, product.id)}>
                      <button 
                        type="submit"
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors active:scale-95"
                        onClick={(e) => {
                          if (!confirm('정말로 이 상품을 강제 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        삭제
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              
              {(!recentProducts || recentProducts.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
