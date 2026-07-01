'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createOrJoinChatRoom(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 상품 정보 및 판매자 확인
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, seller_id')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    throw new Error('상품을 찾을 수 없습니다.');
  }

  // 자신이 올린 상품이면 채팅 불가 (또는 나중에 방어 로직 추가)
  if (product.seller_id === user.id) {
    throw new Error('자신이 등록한 상품에는 채팅을 할 수 없습니다.');
  }

  // 이미 생성된 채팅방이 있는지 확인
  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select('id, buyer_left, seller_left')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .single();

  if (existingRoom) {
    // 만약 나간 상태였다면 다시 들어올 때 나감 상태 해제
    if (existingRoom.buyer_left || existingRoom.seller_left) {
      await supabase
        .from('chat_rooms')
        .update({ 
          buyer_left: false,
          seller_left: false 
        })
        .eq('id', existingRoom.id);
    }
    // 기존 방이 있으면 해당 방으로 이동
    redirect(`/chat/${existingRoom.id}`);
  }

  // 방이 없으면 새로 생성
  const { data: newRoom, error: createError } = await supabase
    .from('chat_rooms')
    .insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: product.seller_id,
      buyer_left: false,
      seller_left: false
    })
    .select('id')
    .single();

  if (createError || !newRoom) {
    throw new Error('채팅방을 생성할 수 없습니다.');
  }

  // 방 생성 성공 후 이동
  redirect(`/chat/${newRoom.id}`);
}

export async function leaveChatRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { data: room, error: roomError } = await supabase
    .from('chat_rooms')
    .select('buyer_id, seller_id')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    throw new Error('채팅방을 찾을 수 없습니다.');
  }

  let updateData = {};
  if (room.buyer_id === user.id) {
    updateData = { buyer_left: true };
  } else if (room.seller_id === user.id) {
    updateData = { seller_left: true };
  } else {
    throw new Error('권한이 없습니다.');
  }

  const { error } = await supabase
    .from('chat_rooms')
    .update(updateData)
    .eq('id', roomId);

  if (error) {
    throw new Error('채팅방을 나가는 중 오류가 발생했습니다.');
  }

  revalidatePath('/chat');
}
