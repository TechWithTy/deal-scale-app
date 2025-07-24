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

// ✅ Use Service Role Key for authentication
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables.');
  throw new Error('Missing Supabase environment variables.');
}

// ✅ Initialize Supabase client with Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

serve(async (req) => {
  console.log('📢 Third-party account connection triggered:', req.method);

  // ✅ Handle CORS Preflight Request (OPTIONS)
  if (req.method === 'OPTIONS') {
    console.log('📢 Handling OPTIONS request for CORS');
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { provider, redirectTo, accessToken } = await req.json();
    console.log('📢 Received request:', { provider, redirectTo });

    if (!provider) {
      console.log('❌ Missing provider');
      return new Response(JSON.stringify({ error: 'Provider is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // ✅ Step 1: Check if user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header.' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: user, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ Invalid user session:', userError);
      return new Response(JSON.stringify({ error: 'Invalid user session.' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    console.log('✅ Authenticated user:', user);

    // ✅ Step 2: Connect third-party provider via OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${SUPABASE_URL}/callback`
      }
    });

    if (error) {
      console.error('❌ Error connecting provider:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: corsHeaders
      });
    }

    console.log('✅ OAuth connection successful:', data.url);

    return new Response(
      JSON.stringify({
        message: 'Third-party account connected!',
        authUrl: data.url
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('❌ Unexpected Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
