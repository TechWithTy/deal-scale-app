import { createClient } from '@supabase/supabase-js';

// ✅ Safe storage adapter to prevent server-side `localStorage` errors
const safeStorage: Storage | undefined =
  typeof window !== 'undefined' ? localStorage : undefined;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Use PKCE for LinkedIn OAuth and handle storage safely
export const supabaseClient = createClient(
  SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      detectSessionInUrl: true, // ✅ Detect & handle OAuth redirects
      flowType: 'pkce', // ✅ Required for LinkedIn OAuth
      storage: safeStorage, // ✅ Use localStorage only on client-side
      autoRefreshToken: true, // ✅ Keep user logged in
      persistSession: true // ✅ Ensure session persists across reloads
    }
  }
);
