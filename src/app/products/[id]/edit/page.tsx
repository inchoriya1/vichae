import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { updateProduct } from '@/app/products/actions';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`);
  }

  const updateAction = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          상품 수정
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          등록한 상품의 정보를 수정할 수 있습니다.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <form action={updateAction} className="space-y-6">
          
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              상품명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={product.title}
              placeholder="예) 맥북 프로 M3 미개봉 (최대 40자)"
              required
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              가격 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                defaultValue={product.price}
                placeholder="가격을 입력하세요"
                required
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-shadow"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">원</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              판매 상태 <span className="text-rose-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-shadow"
            >
              <option value="available">판매 중</option>
              <option value="reserved">예약 중</option>
              <option value="sold">판매 완료</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              상품 설명 <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product.description}
              placeholder="상품에 대한 상세한 설명을 적어주세요. (사용 기간, 하자 여부 등)"
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-shadow resize-y"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
            <a 
              href={`/products/${product.id}`}
              className="px-6 py-3 font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              취소
            </a>
            <button
              type="submit"
              className="px-6 py-3 font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors active:scale-95 shadow-md shadow-emerald-500/20"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
