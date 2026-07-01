'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = error.message;
    if (errorMessage === 'Email not confirmed') {
      errorMessage = '메일 인증 후 사용해주세요.';
    } else if (errorMessage === 'Invalid login credentials') {
      errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    return { error: errorMessage };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const headersList = await import('next/headers').then(m => m.headers());
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // 기본 닉네임을 이메일 아이디 부분으로 설정
        username: email.split('@')[0],
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    let errorMessage = error.message;
    if (errorMessage === 'User already registered') {
      errorMessage = '이미 가입된 이메일입니다.';
    }
    return { error: errorMessage };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vichae.vercel.app'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
