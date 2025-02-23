import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            <Link href="/" className="hover:text-rose-500 transition-colors">
              ACQUIRED BEAUTY
            </Link>
          </h1>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="/reccomendations" className="hover:text-rose-500 transition-colors">
              PRODUCTS
            </Link>
            <Link href="/quiz" className="hover:text-rose-500 transition-colors">
              QUIZ
            </Link>
            <Link href="/about" className="hover:text-rose-500 transition-colors">
              ABOUT
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">{children}</main>

      {/* Footer */}
      <footer className="bg-white shadow-inner">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold tracking-tight">
                ACQUIRED BEAUTY
              </h2>
              <p className="text-sm text-gray-600">
                Discover your perfect beauty routine with personalized recommendations.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wider">Quick Links</h3>
              <div className="flex flex-col space-y-2 text-sm text-gray-600">
                <Link href="/reccomendations" className="hover:text-rose-500 transition-colors">
                  Products
                </Link>
                <Link href="/quiz" className="hover:text-rose-500 transition-colors">
                  Take the Quiz
                </Link>
                <Link href="/about" className="hover:text-rose-500 transition-colors">
                  About Us
                </Link>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wider">Connect</h3>
              <div className="flex flex-col space-y-2 text-sm text-gray-600">
                <a href="mailto:contactacquired.beauty@gmail.com" className="hover:text-rose-500 transition-colors">
                    contactacquired.beauty@gmail.com
                </a>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com/acquired.beauty/" className="hover:text-rose-500 transition-colors">Instagram</a>
                  <a href="https://pin.it/53hF5IU97" className="hover:text-rose-500 transition-colors">Pinterest</a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Acquired Beauty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
