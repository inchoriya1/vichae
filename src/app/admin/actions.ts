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

export async function dismissReport(reportId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('권한이 없습니다.');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) throw new Error('관리자 권한이 필요합니다.');

  const { error } = await supabase
    .from('reports')
    .update({ status: 'resolved' })
    .eq('id', reportId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/reports');
  return { success: true };
}

export async function applySanction(reportId: string, reportedId: string, actionType: 'warning' | 'suspend' | 'ban', days?: number) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('권한이 없습니다.');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) throw new Error('관리자 권한이 필요합니다.');

  // 1. 신고 상태를 resolved로 변경
  const { error: reportError } = await supabase
    .from('reports')
    .update({ status: 'resolved' })
    .eq('id', reportId);

  if (reportError) throw new Error(reportError.message);

  // 2. 유저 제재 처리 (현재 DB 구조상 제재 내역 테이블이 없으므로 로그만 남기거나 프로필 업데이트 생략)
  // 추후 users 테이블이나 별도 sanctions 테이블에 제재 내역을 기록하는 로직을 추가할 수 있습니다.
  console.log(`[Sanction Applied] User ${reportedId} received ${actionType} (Days: ${days || 'N/A'})`);

  revalidatePath('/admin/reports');
  return { success: true };
}
