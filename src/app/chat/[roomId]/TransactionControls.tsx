'use client';

import { updateProductStatus } from '@/app/products/actions';
import { useTransition } from 'react';

export default function TransactionControls({ 
  productId, 
  currentStatus 
}: { 
  productId: string, 
  currentStatus: string 
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('status', newStatus);
      await updateProductStatus(productId, formData);
    });
  };

  if (currentStatus === 'sold') {
    return <span className="text-xs text-zinc-500 bg-zinc-200 px-2 py-1 rounded-md font-bold">판매 완료됨</span>;
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'available' && (
        <button 
          onClick={() => handleStatusChange('reserved')}
          disabled={isPending}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? '처리중...' : '예약하기'}
        </button>
      )}
      
      {currentStatus === 'reserved' && (
        <>
          <button 
            onClick={() => handleStatusChange('available')}
            disabled={isPending}
            className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            예약 취소
          </button>
          <button 
            onClick={() => handleStatusChange('sold')}
            disabled={isPending}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-200 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? '처리중...' : '거래 완료'}
          </button>
        </>
      )}
    </div>
  );
}
