'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function RealtimeBadges({ 
  initialUnreadCount, 
  initialUnreadChatCount, 
  userId 
}: { 
  initialUnreadCount: number;
  initialUnreadChatCount: number;
  userId: string;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [unreadChatCount, setUnreadChatCount] = useState(initialUnreadChatCount);
  const supabase = createClient();

  useEffect(() => {
    // 1. 알림 채널 구독
    const notifChannel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${userId}` 
      }, async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      })
      .subscribe();

    // 2. 메시지 채널 구독
    // 모든 메시지 변경 이벤트를 수신한 뒤 내 채팅방인지 확인 후 개수 갱신
    const messagesChannel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, async () => {
        const { data: myRooms } = await supabase
          .from('chat_rooms')
          .select('id')
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
        
        if (myRooms && myRooms.length > 0) {
          const roomIds = myRooms.map(r => r.id);
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('room_id', roomIds)
            .neq('sender_id', userId)
            .eq('is_read', false);
          setUnreadChatCount(count || 0);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [userId, supabase]);

  return (
    <>
      <Link href="/chat" className="relative p-2 text-zinc-500 hover:text-emerald-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:hidden">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <span className="hidden md:inline-flex text-sm font-medium">채팅</span>
        {unreadChatCount > 0 && (
          <span className="absolute top-1 right-1 md:-top-1 md:-right-2 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-zinc-950">
            {unreadChatCount > 99 ? '99+' : unreadChatCount}
          </span>
        )}
      </Link>

      <Link href="/notifications" className="relative p-2 text-zinc-500 hover:text-emerald-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:hidden">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span className="hidden md:inline-flex text-sm font-medium">알림</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 md:-top-1 md:-right-2 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-zinc-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </>
  );
}
