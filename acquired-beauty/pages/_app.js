// pages/_app.js
import '../styles/globals.css';
import Layout from '../components/layout';
import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { useRouter } from 'next/router';

// Define which routes require authentication
const protectedRoutes = ['/dashboard', '/quiz', '/recommendations'];
// Define public routes that should redirect if user is already logged in
const authRoutes = ['/auth'];

export default function MyApp({ Component, pageProps }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check current session
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error('Error getting user:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        // Set up auth state listener
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user || null);
            
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setTimeout(() => {
                    router.replace('/auth');
                }, 100); 
            } else if (event === 'SIGNED_IN') {
                const returnUrl = localStorage.getItem('returnUrl');
                if (returnUrl) {
                    localStorage.removeItem('returnUrl');
                    router.push(returnUrl);
                } else {
                    router.push('/dashboard');
                }
            }
        });

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        if (loading) return;

        const path = router.pathname;

        // Handle protected routes
        if (protectedRoutes.includes(path) && !user) {
            localStorage.setItem('returnUrl', path);
            router.push('/auth');
        }

        // Handle auth routes (redirect to dashboard if already logged in)
        if (authRoutes.includes(path) && user) {
            router.push('/dashboard');
        }
    }, [router.pathname, user, loading, router]);

    // Show loading state
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>;
    }

    return (
        <Layout user={user}>
            <Component {...pageProps} user={user} />
        </Layout>
    );
}

