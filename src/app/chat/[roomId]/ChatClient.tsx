'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getTimeAgo } from '@/utils/helpers';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatClientProps {
  roomId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export default function ChatClient({ roomId, currentUserId, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 상대방이 보낸 안읽음 메시지를 읽음으로 자동 업데이트
  useEffect(() => {
    const unreadMessages = messages.filter(m => m.sender_id !== currentUserId && !m.is_read);
    
    if (unreadMessages.length > 0) {
      const markAsRead = async () => {
        const unreadIds = unreadMessages.map(m => m.id);
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds);

        if (!error) {
          setMessages(prev => prev.map(m => 
            unreadIds.includes(m.id) ? { ...m, is_read: true } : m
          ));
        }
      };
      markAsRead();
    }
  }, [messages, currentUserId, supabase]);

  // 실시간 메시지 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // 내가 보낸 메시지는 로컬 상태에서 이미 추가했을 수 있으므로 중복 방지
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    const updateChannel = supabase
      .channel(`room_${roomId}_updates`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(updateChannel);
    };
  }, [roomId, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage(''); // 즉각적인 UI 반응을 위해 입력창 먼저 비우기
    setIsSending(true);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: content
      })
      .select()
      .single();

    if (!error && data) {
      // 메시지 전송 성공 시:
      // 1. last_message_at 업데이트
      // 2. 상대방이 방을 나갔더라도 새 메시지가 오면 다시 방이 보이도록 buyer_left, seller_left를 모두 false로 초기화
      await supabase
        .from('chat_rooms')
        .update({ 
          last_message_at: new Date().toISOString(),
          buyer_left: false,
          seller_left: false
        })
        .eq('id', roomId);
    }

    setIsSending(false);

    if (error) {
      console.error('메시지 전송 실패:', error.message);
      alert('메시지 전송에 실패했습니다.');
    } else if (data) {
      // 로컬 화면에 즉시 반영 (실시간 구독보다 먼저 뜰 수 있도록)
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, data as Message];
      });
    }
  };

  return (
    <>
      {/* 대화 내용 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-sm text-zinc-500">
            아직 대화가 없습니다. 인사를 건네보세요!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;
            // 내가 보낸 가장 마지막 메시지인지 확인 (읽음/안읽음 표시용)
            const lastMyMessageId = [...messages].reverse().find(m => m.sender_id === currentUserId)?.id;
            const isLastMyMsg = msg.id === lastMyMessageId;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-emerald-500 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-700 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap word-break break-words">{msg.content}</p>
                </div>
                {/* 메시지 발송 시간 및 안읽음 표시 */}
                <div className={`flex flex-col justify-end text-[10px] text-zinc-400 mb-1 mx-1 ${isMe ? 'order-first mr-2 items-end' : 'ml-2 items-start'}`}>
                  {isMe && isLastMyMsg && !msg.is_read && (
                    <span className="text-emerald-500 dark:text-emerald-400 font-medium mb-0.5 whitespace-nowrap">
                      안읽음
                    </span>
                  )}
                  <span className="whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-all"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
