// 시간 차이를 사람이 읽을 수 있는 형태로 변환하는 유틸리티
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}주 전`;
  return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
}

// 상태 뱃지에 대한 한국어 텍스트 및 스타일
export function getStatusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case 'reserved':
      return { text: '예약 중', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' };
    case 'sold':
      return { text: '판매 완료', className: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400' };
    default:
      return { text: '판매 중', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' };
  }
}
