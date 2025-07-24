// Import dependencies
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import 'https://deno.land/x/dotenv/load.ts';

// Define CORS Headers
const corsHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// ✅ Use the Service Role Key for authentication (not the Anon Key)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// ✅ Ensure environment variables exist before proceeding
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables.');
  throw new Error('Missing Supabase environment variables.');
}

// ✅ Initialize Supabase client with the Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

serve(async (req) => {
  console.log('📢 Login function triggered:', req.method);

  // ✅ Handle CORS Preflight Request (OPTIONS)
  if (req.method === 'OPTIONS') {
    console.log('📢 Handling OPTIONS request for CORS');
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    console.log('📢 Received request:', { email });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return new Response(
        JSON.stringify({ error: 'Email and password are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Authenticate User via Supabase Auth
    console.log('📢 Authenticating user...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Authentication failed:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: corsHeaders
      });
    }

    console.log('✅ Login successful for user:', data.user?.id);

    // ✅ Return user session token
    return new Response(
      JSON.stringify({ token: data.session?.access_token, user: data.user }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('❌ Unexpected Login Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
