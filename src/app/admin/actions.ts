'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteProductByAdmin(productId: string) {
  const supabase = await createClient();

  // 1. 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: '권한이 없습니다.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: '관리자 권한이 필요합니다.' };
  }

  // 2. 상품 이미지 조회 (스토리지에서 지우기 위함)
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single();

  // 3. 상품 삭제 (DB)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    return { error: error.message };
  }

  // 4. 스토리지 이미지 삭제 (옵션)
  if (product && product.images && product.images.length > 0) {
    const filePaths = product.images.map((url: string) => {
      // url에서 스토리지 경로 추출
      const parts = url.split('/product-images/');
      return parts.length > 1 ? parts[1] : null;
    }).filter(Boolean);

    if (filePaths.length > 0) {
      await supabase.storage.from('product-images').remove(filePaths);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}
