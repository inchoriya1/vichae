'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RealtimeNotifBadge({ 
  initialCount, 
  userId 
}: { 
  initialCount: number; 
  userId: string;
}) {
  const [count, setCount] = useState(initialCount);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notif_badge')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${userId}` 
      }, async () => {
        const { count: newCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);
        setCount(newCount || 0);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  if (count === 0) return null;

  return (
    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-zinc-950">
      {count > 99 ? '99+' : count}
    </span>
  );
}
