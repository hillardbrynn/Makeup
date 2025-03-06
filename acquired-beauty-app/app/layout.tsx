'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import supabase from '@/lib/supabase'; // Make sure to update the path

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define which routes require authentication
const protectedRoutes = ['/dashboard', '/recommendations'];
// Define public routes that should redirect if user is already logged in
const authRoutes = ['/auth'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
          router.push('/');
        }
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (loading) return;
    
    // Handle protected routes
    if (protectedRoutes.includes(pathname) && !user) {
      localStorage.setItem('returnUrl', pathname);
      router.push('/auth');
    }
    
    // Handle auth routes (redirect to dashboard if already logged in)
    if (authRoutes.includes(pathname) && user) {
      router.push('/');
    }
  }, [pathname, user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}