// pages/index.js
import React from 'react';
import Link from 'next/link';
import '../styles/globals.css';
import { Star, Heart, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100 to-neutral-50 opacity-50" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-serif font-bold mb-6">Discover Your Perfect Match</h2>
          <p className="text-xl mb-8 text-neutral-800">
            Personalized beauty recommendations backed by science and tailored to your unique needs
          </p>
          <Link href="/quiz" passHref>
            <button className="bg-black text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition-transform transform hover:scale-105 text-lg font-medium">
              Take The Beauty Quiz
            </button>
          </Link>
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
    </div>
  );
};

export default Home;
