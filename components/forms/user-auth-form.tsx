'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LinkedInLoginButton } from 'react-social-login-buttons';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const supabase = createClientComponentClient(); // Supabase client

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: UserFormValue) => {
    const endpoint = isSignUp
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/signup`
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/login`;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || 'Authentication failed');

      alert(
        `${
          isSignUp
            ? 'Signup successful! Check your email.'
            : 'Login successful!'
        }`
      );
    } catch (err) {
      setError(err.message);
      console.error('Authentication Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    setLoading(true);
    try {
      console.log('📢 Initiating LinkedIn Login');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // ✅ Ensure correct redirect URL
          skipBrowserRedirect: false, // ✅ Ensure Supabase handles redirection
          scopes: 'openid profile email', // ✅ Ensure LinkedIn scopes are correct
          pkce: true // ✅ Enable PKCE flow
        }
      });

      if (error) throw error;
      console.log('✅ LinkedIn Login Data:', data);
    } catch (err) {
      setError(err.message);
      console.error('❌ LinkedIn Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-center text-xl font-semibold">
        {isSignUp ? 'Sign Up' : 'Log In'}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
        </form>
      </Form>

      {/* LinkedIn Login Button */}
      <LinkedInLoginButton onClick={handleLinkedInLogin} disabled={loading}>
        <span>
          {isSignUp ? 'Sign Up with LinkedIn' : 'Log In with LinkedIn'}
        </span>
      </LinkedInLoginButton>

      <div className="text-center">
        <p className="text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            className="text-primary underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
