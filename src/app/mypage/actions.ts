'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const username = formData.get('username') as string;

  if (!username || username.trim() === '') {
    return { error: '닉네임을 입력해주세요.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: username.trim() })
    .eq('id', user.id);

  if (error) {
    if (error.code === '23505') { // unique constraint violation
      return { error: '이미 사용 중인 닉네임입니다.' };
    }
    return { error: '프로필 업데이트에 실패했습니다.' };
  }

  revalidatePath('/mypage');
  revalidatePath('/');
  return { success: true };
}
