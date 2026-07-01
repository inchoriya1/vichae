'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RealtimeChatBadge({ 
  initialCount, 
  userId, 
  desktop 
}: { 
  initialCount: number; 
  userId: string; 
  desktop?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chat_badge_${desktop ? 'desktop' : 'mobile'}`)
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
          const { count: newCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('room_id', roomIds)
            .neq('sender_id', userId)
            .eq('is_read', false);
          setCount(newCount || 0);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, desktop]);

  if (count === 0) return null;

  if (desktop) {
    return (
      <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
        {count > 99 ? '99+' : count}
      </span>
    );
  }

  return (
    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-zinc-950">
      {count > 99 ? '99+' : count}
    </span>
  );
}
