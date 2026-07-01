'use client';

import { useTransition } from 'react';
import { unblockUser } from '@/app/actions/user';

export default function UnblockButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUnblock = () => {
    if (!confirm('차단을 해제하시겠습니까?')) return;
    startTransition(async () => {
      try {
        await unblockUser(userId);
        alert('차단이 해제되었습니다.');
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  return (
    <button
      onClick={handleUnblock}
      disabled={isPending}
      className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {isPending ? '해제 중...' : '차단 해제'}
    </button>
  );
}
