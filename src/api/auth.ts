/**
 * Auth helpers. The app uses anonymous sign-in so users can start without an
 * account; it can be upgraded to email/social later via supabase.auth.
 */
import { supabase } from '@/lib/supabase';

export async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return anon.session;
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
