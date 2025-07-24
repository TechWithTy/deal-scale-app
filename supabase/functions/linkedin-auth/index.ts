import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment Variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')!;
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')!;
const LINKEDIN_REDIRECT_URI = Deno.env.get('LINKEDIN_REDIRECT_URI')!;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code required' }),
        { status: 400 }
      );
    }

    console.log('📢 Received LinkedIn OAuth Code:', code);

    // Step 1: Exchange Authorization Code for Access Token
    const tokenRes = await fetch(
      'https://www.linkedin.com/oauth/v2/accessToken',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: LINKEDIN_REDIRECT_URI,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET
        })
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('❌ LinkedIn Token Error:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to get access token' }),
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;
    console.log('✅ LinkedIn Access Token:', accessToken);

    // Step 2: Get User Profile from LinkedIn
    const profileRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const emailRes = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const profile = await profileRes.json();
    const emailData = await emailRes.json();
    if (!profileRes.ok || !emailRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to get LinkedIn profile' }),
        { status: 400 }
      );
    }

    const userEmail = emailData.elements[0]['handle~'].emailAddress;
    const userId = profile.id;
    const userName =
      profile.localizedFirstName + ' ' + profile.localizedLastName;

    console.log(`✅ LinkedIn User: ${userName} (${userEmail})`);

    // Step 3: Check if User Exists in Supabase
    let { data: existingUser } =
      await supabase.auth.admin.getUserByEmail(userEmail);

    if (!existingUser) {
      // Step 4: Create a New User in Supabase Auth
      console.log('🆕 Creating new Supabase user...');
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: userEmail,
        email_confirm: true // Auto confirm since LinkedIn verified it
      });

      if (error) {
        console.error('❌ Supabase User Creation Error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500 }
        );
      }
      existingUser = newUser.user;
    }

    // Step 5: Store Session in Supabase
    console.log('💾 Storing session for user...');
    await supabase
      .from('UserSessions')
      .upsert([
        {
          user_id: existingUser.id,
          access_token: accessToken,
          provider: 'linkedin'
        }
      ]);

    return new Response(
      JSON.stringify({ message: 'Login successful', user: existingUser }),
      {
        status: 200
      }
    );
  } catch (err) {
    console.error('❌ Unexpected Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500
    });
  }
});
