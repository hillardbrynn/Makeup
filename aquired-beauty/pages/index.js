import React, { useState, useEffect } from 'react';
import '../styles/globals.css';
import { Star, Heart, TrendingUp } from 'lucide-react';

const Home = () => {
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
          <h1 className="text-2xl font-serif font-bold tracking-tight">AQUIRED BEAUTY</h1>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-rose-500 transition-colors">
              SHOP
            </a>
            <a href="#" className="hover:text-rose-500 transition-colors">
              QUIZ
            </a>
            <a href="#" className="hover:text-rose-500 transition-colors">
              ABOUT
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100 to-neutral-50 opacity-50" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-serif font-bold mb-6">Discover Your Perfect Match</h2>
          <p className="text-xl mb-8 text-neutral-800">
            Personalized beauty recommendations backed by science and tailored to your unique needs
          </p>
          <button className="bg-black text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition-transform transform hover:scale-105 text-lg font-medium">
            Take The Beauty Quiz
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-8 rounded-2xl bg-neutral-50 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-6 text-rose-500">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Personalized Analysis</h3>
              <p className="text-neutral-600">
                Advanced skin analysis technology to match you with perfect products
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-neutral-50 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-6 text-rose-500">
                <Star size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Curation</h3>
              <p className="text-neutral-600">
                Carefully selected products from premium beauty brands
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-neutral-50 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-6 text-rose-500">
                <Heart size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Ongoing Support</h3>
              <p className="text-neutral-600">
                Regular check-ins and routine adjustments as your needs change
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="py-24 bg-gradient-to-r from-rose-100 to-neutral-100 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl font-serif font-bold mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-lg mb-8 text-neutral-700">
            Take our beauty quiz and discover products tailored specifically to your needs and preferences.
          </p>
          <button className="bg-black text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition-transform transform hover:scale-105 text-lg font-medium">
            Start Your Beauty Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-bold mb-4">AQUIRED BEAUTY</h3>
              <p className="text-neutral-400 text-sm">
                Personalized beauty recommendations for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li>All Products</li>
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Offers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">About</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li>Our Story</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Connect</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li>Instagram</li>
                <li>Twitter</li>
                <li>Facebook</li>
                <li>YouTube</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
            © 2025 Aquired Beauty. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
