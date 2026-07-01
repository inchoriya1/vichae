import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/login/actions';
import RealtimeChatBadge from './RealtimeChatBadge';
import RealtimeNotifBadge from './RealtimeNotifBadge';

export default async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let unreadCount = 0;
  let unreadChatCount = 0;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = !!data?.is_admin;

    // 안 읽은 알림 개수 조회
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    unreadCount = count || 0;

    // 내가 참여 중인 채팅방 목록 조회
    const { data: myRooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    
    if (myRooms && myRooms.length > 0) {
      const roomIds = myRooms.map(r => r.id);
      // 안 읽은 채팅 메시지 개수 조회
      const { count: chatCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('room_id', roomIds)
        .neq('sender_id', user.id)
        .eq('is_read', false);
      unreadChatCount = chatCount || 0;
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-200/50 dark:bg-zinc-950/70 dark:border-zinc-800/50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">
                ViChae
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors">
              홈
            </Link>
            <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors">
              곳간 채우기
            </Link>
            <Link href="/chat" className="relative text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors">
              채팅
              {user && <RealtimeChatBadge initialCount={unreadChatCount} userId={user.id} desktop={true} />}
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                관리자
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Mobile Chat Icon */}
                <Link href="/chat" className="relative p-2 md:hidden text-zinc-500 hover:text-emerald-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  {user && <RealtimeChatBadge initialCount={unreadChatCount} userId={user.id} />}
                </Link>

                <Link href="/notifications" className="relative p-2 text-zinc-500 hover:text-emerald-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {user && <RealtimeNotifBadge initialCount={unreadCount} userId={user.id} />}
                </Link>
                <Link href="/mypage" className="flex items-center p-2 md:p-0 text-zinc-500 hover:text-emerald-600 md:text-zinc-600 md:hover:text-zinc-900 dark:md:text-zinc-300 dark:md:hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:hidden">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="hidden md:inline-flex text-sm font-medium">
                    마이페이지
                  </span>
                </Link>
                <form action={logout}>
                  <button type="submit" className="hidden md:inline-flex text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center p-2 md:p-0 text-zinc-500 hover:text-emerald-600 md:text-zinc-600 md:hover:text-zinc-900 dark:md:text-zinc-300 dark:md:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:hidden">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span className="hidden md:inline-flex text-sm font-medium">
                  로그인
                </span>
              </Link>
            )}
            

          </div>
        </div>
      </div>
    </nav>
  );
}
