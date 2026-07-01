import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { productId, liked } = await request.json();
  const supabase = await createClient();

  // 로그인 상태 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (liked) {
    // 찜하기 (insert)
    const { error } = await supabase
      .from('product_likes')
      .insert({ user_id: user.id, product_id: productId });
      
    // 23505 = Postgres 중복 키 에러 (이미 찜한 상태면 무시)
    if (error && error.code !== '23505') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // 찜 해제 (delete)
    const { error } = await supabase
      .from('product_likes')
      .delete()
      .match({ user_id: user.id, product_id: productId });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // 트리거(DB)에 의해 업데이트된 최신 좋아요 수 조회 후 반환
  const { data: product } = await supabase
    .from('products')
    .select('likes')
    .eq('id', productId)
    .single();

  return NextResponse.json({ likes: product?.likes || 0 });
}
