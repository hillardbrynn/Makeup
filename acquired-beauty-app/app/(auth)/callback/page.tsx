'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle the authentication callback
    const handleCallback = async () => {
      try {
        // Get the query params from the URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          throw new Error(errorDescription || 'An error occurred during authentication');
        }
        
        // Exchange the code for a session
        await supabase.auth.getSession();
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Determine where to redirect the user
          // Check if the user has completed the quiz
          const { data: userPreferences } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (userPreferences) {
            // User has completed the quiz, redirect to shop
            router.push('/shop');
          } else {
            // User hasn't completed the quiz, redirect them there
            router.push('/quiz');
          }
        } else {
          // Not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error during authentication callback:', error);
        router.push('/login?error=' + encodeURIComponent(error.message));
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      <p className="ml-4 text-gray-600">Completing authentication...</p>
    </div>
  );
}