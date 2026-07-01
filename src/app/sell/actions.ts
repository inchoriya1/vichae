'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const title = formData.get('title') as string;
  const price = Number(formData.get('price'));
  const description = formData.get('description') as string;
  const location = (formData.get('location') as string) || '위치 미지정';

  if (!title || !price) {
    return { error: '제목과 가격은 필수입니다.' };
  }

  // 이미지 업로드 처리
  const imageUrls: string[] = [];
  const imageFiles = formData.getAll('images') as File[];

  for (const file of imageFiles) {
    if (file.size === 0) continue;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    imageUrls.push(publicUrl);
  }

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      price,
      description,
      images: imageUrls,
      location,
      status: 'available',
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  // ==== 키워드 알림 로직 ====
  if (newProduct) {
    // 관리자 권한 클라이언트를 사용해 모든 유저의 키워드를 조회 (RLS 우회)
    const adminSupabase = await createAdminClient();
    
    // 본인을 제외한 다른 유저들의 키워드 목록 가져오기
    const { data: allKeywords, error: keywordError } = await adminSupabase
      .from('keywords')
      .select('user_id, keyword')
      .neq('user_id', user.id);

    console.log('[DEBUG] allKeywords fetch error:', keywordError);
    console.log('[DEBUG] allKeywords data:', allKeywords);

    if (allKeywords && allKeywords.length > 0) {
      const searchTarget = `${title} ${description}`.toLowerCase();
      const cleanSearchTarget = searchTarget.replace(/\s+/g, '');
      
      const notificationsToInsert = allKeywords
        .filter(k => {
          const cleanKeyword = k.keyword.toLowerCase().replace(/\s+/g, '');
          return cleanSearchTarget.includes(cleanKeyword);
        })
        .map(k => ({
          user_id: k.user_id,
          product_id: newProduct.id,
          message: `'${k.keyword}' 키워드 알림: 관심 키워드가 포함된 새 상품이 등록되었습니다!`,
        }));

      console.log('[DEBUG] notificationsToInsert:', notificationsToInsert);

      // 중복 알림 방지 (한 유저가 여러 키워드에 매칭될 경우 1개만 발송)
      const uniqueNotifications = Array.from(
        new Map(notificationsToInsert.map(item => [item.user_id, item])).values()
      );

      if (uniqueNotifications.length > 0) {
        // 관리자 권한 클라이언트를 사용해 다른 유저에게 알림 생성 (RLS 우회)
        const { error: notiError } = await adminSupabase.from('notifications').insert(uniqueNotifications);
        console.log('[DEBUG] notifications insert error:', notiError);
      }
    }
  }

  revalidatePath('/');
  redirect('/');
}
