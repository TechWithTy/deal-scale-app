import { createClient } from '@supabase/supabase-js';

// ✅ Use the Service Role Key for server-side calls
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ NEVER expose this on the client side!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('🚨 Supabase environment variables are missing!');
}

// ✅ Create a server-side Supabase client
export const supabaseServer = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
