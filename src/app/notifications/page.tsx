import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { getTimeAgo } from '@/utils/helpers';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 알림 목록 가져오기 (가장 최근 순)
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      id,
      message,
      is_read,
      created_at,
      product:products(id, title, images)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 알림 모두 읽음 처리 서버 액션
  async function markAllAsRead() {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) return;

    await supabaseServer
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);
    
    revalidatePath('/notifications');
    revalidatePath('/', 'layout'); // NavBar 업데이트
  }

  // 특정 알림 읽음 처리 후 이동하는 서버 액션
  async function readAndRedirect(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const id = formData.get('id') as string;
    const productId = formData.get('product_id') as string;

    await supabaseServer
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    revalidatePath('/', 'layout');
    redirect(`/products/${productId}`);
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            새로운 알림
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            등록하신 관심 키워드의 새 상품 소식을 확인하세요.
          </p>
        </div>
        <form action={markAllAsRead}>
          <button
            type="submit"
            className="text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl"
          >
            모두 읽음 처리
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {notifications && notifications.length > 0 ? (
            notifications.map((noti: any) => (
              <li key={noti.id} className={`transition-colors ${noti.is_read ? 'bg-transparent' : 'bg-emerald-50/50 dark:bg-emerald-900/10'}`}>
                <form action={readAndRedirect} className="w-full text-left">
                  <input type="hidden" name="id" value={noti.id} />
                  <input type="hidden" name="product_id" value={noti.product?.id} />
                  <button type="submit" className="w-full flex items-start gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="mt-1">
                      {noti.is_read ? (
                        <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                      <p className={`text-sm font-medium mb-1 ${noti.is_read ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                        {noti.message}
                      </p>
                      <span className="text-xs text-zinc-400">{getTimeAgo(noti.created_at)}</span>
                    </div>
                    {noti.product?.images?.[0] && (
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={noti.product.images[0]} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </button>
                </form>
              </li>
            ))
          ) : (
            <li className="p-16 text-center text-zinc-500 dark:text-zinc-400 text-sm">
              새로운 알림이 없습니다.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
