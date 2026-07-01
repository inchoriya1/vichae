'use client';

import { useRouter } from 'next/navigation';
import { leaveChatRoom } from '@/app/chat/actions';

export default function LeaveChatButton({ roomId }: { roomId: string }) {
  const router = useRouter();

  const handleLeave = async () => {
    if (window.confirm('채팅방을 나가시겠습니까? 나간 채팅방은 목록에서 삭제됩니다.')) {
      try {
        await leaveChatRoom(roomId);
        router.push('/chat');
        router.refresh();
      } catch (error: any) {
        alert(error.message || '오류가 발생했습니다.');
      }
    }
  };

  return (
    <button 
      onClick={handleLeave}
      className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors"
      title="채팅방 나가기"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
    </button>
  );
}
