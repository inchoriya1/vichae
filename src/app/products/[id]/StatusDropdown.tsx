'use client';

import { updateProductStatus } from '@/app/products/actions';

export default function StatusDropdown({ productId, currentStatus }: { productId: string, currentStatus: string }) {
  return (
    <form action={async (formData) => {
      await updateProductStatus(productId, formData);
    }}>
      <div className="flex items-center gap-2">
        <select
          key={currentStatus}
          name="status"
          defaultValue={currentStatus}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="px-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
        >
          <option value="available">판매 중</option>
          <option value="reserved">예약 중</option>
          <option value="sold">판매 완료</option>
        </select>
      </div>
    </form>
  );
}
