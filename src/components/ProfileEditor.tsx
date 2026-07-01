'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/mypage/actions';

interface ProfileEditorProps {
  initialUsername: string;
}

export default function ProfileEditor({ initialUsername }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else {
      setIsEditing(false);
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {username}
        </h1>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          수정
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="새 닉네임"
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setUsername(initialUsername);
            setErrorMsg(null);
          }}
          className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          취소
        </button>
      </div>
      {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}
    </form>
  );
}
