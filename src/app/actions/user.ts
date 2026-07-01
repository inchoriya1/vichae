'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function blockUser(blockedId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');
  if (user.id === blockedId) throw new Error('자기 자신을 차단할 수 없습니다.');

  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: user.id, blocked_id: blockedId });

  if (error && error.code !== '23505') { // 23505 is unique violation, ignore if already blocked
    throw new Error('차단 중 오류가 발생했습니다.');
  }

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true };
}

export async function unblockUser(blockedId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('blocks')
    .delete()
    .match({ blocker_id: user.id, blocked_id: blockedId });

  if (error) throw new Error('차단 해제 중 오류가 발생했습니다.');

  revalidatePath('/');
  revalidatePath('/products');
  return { success: true };
}

export async function reportUser(
  reportedId: string, 
  targetType: 'product' | 'chat' | 'user', 
  targetId: string | null, 
  reason: string, 
  details: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');
  if (user.id === reportedId) throw new Error('자기 자신을 신고할 수 없습니다.');

  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      reported_id: reportedId,
      target_type: targetType,
      target_id: targetId,
      reason,
      details
    });

  if (error) throw new Error('신고 접수 중 오류가 발생했습니다.');

  return { success: true };
}
