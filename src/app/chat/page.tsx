import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getTimeAgo } from '@/utils/helpers';
import ChatListClient from './ChatListClient';

export const revalidate = 0;

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 사용자가 참여 중인 채팅방 목록 가져오기
  const { data: rooms, error } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      last_message_at,
      product:products ( id, title, images ),
      buyer:profiles!chat_rooms_buyer_id_fkey ( id, username, avatar_url ),
      seller:profiles!chat_rooms_seller_id_fkey ( id, username, avatar_url )
    `)
    .or(`and(buyer_id.eq.${user.id},buyer_left.eq.false),and(seller_id.eq.${user.id},seller_left.eq.false)`)
    .order('last_message_at', { ascending: false });

  // 차단 내역 조회 (상호 차단 포함)
  const { data: blocks } = await supabase
    .from('blocks')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
    
  const blockedUserIds = new Set(
    blocks?.map(b => b.blocker_id === user.id ? b.blocked_id : b.blocker_id) || []
  );

  // 채팅을 아직 한 마디도 안 했을 경우(last_message_at === null) 필터링, 그리고 차단된 유저 필터링
  const activeRooms = rooms?.filter((room: any) => {
    const isSeller = room.seller?.id === user.id;
    if (isSeller && !room.last_message_at) {
      return false;
    }
    
    // 파트너 ID 확인
    const partnerId = isSeller ? room.buyer?.id : room.seller?.id;
    if (partnerId && blockedUserIds.has(partnerId)) {
      return false;
    }
    
    return true;
  }) || [];

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          채팅
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          판매자 혹은 구매자와 대화를 나눠보세요
        </p>
      </div>

      {activeRooms.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-10 h-10 text-emerald-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            아직 채팅이 없어요
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
            관심있는 상품의 상세 페이지에서<br />
            <strong className="text-emerald-600 dark:text-emerald-400">&lsquo;채팅하기&rsquo;</strong> 버튼을 눌러 대화를 시작해보세요!
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl hover:from-emerald-500 hover:to-teal-400 transition-all active:scale-[0.97] shadow-lg shadow-emerald-500/20"
          >
            상품 곳간 채우기
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      ) : (
        <ChatListClient activeRooms={activeRooms} userId={user.id} />
      )}
    </div>
  );
}
