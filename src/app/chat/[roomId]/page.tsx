import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ChatClient from './ChatClient';
import Link from 'next/link';
import TransactionControls from './TransactionControls';
import LeaveChatButton from './LeaveChatButton';
import ChatActions from './ChatActions';

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 채팅방 정보 가져오기
  const { data: room, error: roomError } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      product:products ( id, title, price, images, status ),
      buyer:profiles!chat_rooms_buyer_id_fkey ( id, username, avatar_url ),
      seller:profiles!chat_rooms_seller_id_fkey ( id, username, avatar_url )
    `)
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // 대화 상대방 정보 결정
  const buyer = room.buyer as any;
  const seller = room.seller as any;

  // 본인이 참여한 방이 아니면 접근 차단
  if (buyer?.id !== user.id && seller?.id !== user.id) {
    redirect('/chat');
  }

  const partner = buyer?.id === user.id ? seller : buyer;

  // 파트너와의 상호 차단 여부 확인
  if (partner?.id) {
    const { data: block } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${partner.id}),and(blocker_id.eq.${partner.id},blocked_id.eq.${user.id})`)
      .single();
      
    if (block) {
      redirect('/chat'); // 차단된 상태면 채팅 목록으로 강제 이동
    }
  }

  // 이전 메시지 내역 불러오기
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-zinc-50 dark:bg-zinc-950 z-40 flex justify-center">
      <div className="w-full max-w-2xl h-full flex flex-col bg-white dark:bg-zinc-950 sm:border-x border-zinc-200 dark:border-zinc-800 relative shadow-sm">
      
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/chat" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <span className="font-bold text-lg text-zinc-900 dark:text-white">
            {partner?.username || '알 수 없음'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {partner?.id && <ChatActions roomId={roomId} partnerId={partner.id} />}
          <LeaveChatButton roomId={roomId} />
        </div>
      </div>

      {/* 상품 요약 바 */}
      {room.product && (() => {
        const product = room.product as any;
        return (
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 gap-3">
            <Link href={`/products/${product.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
              {product.images?.[0] && (
                <div className="w-12 h-12 rounded-lg bg-zinc-200 overflow-hidden flex-shrink-0 relative border border-zinc-200 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[0]} alt="thumb" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-900 dark:text-white font-medium truncate">
                  {product.title}
                </div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  {product.price.toLocaleString()}원
                  {product.status === 'reserved' && <span className="text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">예약중</span>}
                </div>
              </div>
            </Link>
            {seller?.id === user.id && (
              <TransactionControls 
                productId={product.id} 
                currentStatus={product.status || 'available'} 
              />
            )}
          </div>
        );
      })()}

      {/* 클라이언트 컴포넌트 (실시간 채팅 로직) */}
      <ChatClient 
        roomId={roomId} 
        currentUserId={user.id} 
        initialMessages={initialMessages || []} 
      />
      </div>
    </div>
  );
}
