'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Filter, Search, Star } from 'lucide-react';

export default function ShopPage() {

  const getProxiedImageUrl = (originalUrl) => {
    return `/api/image?url=${encodeURIComponent(originalUrl)}`;
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Categories for filter buttons
  const categories = ['all', 'foundation', 'concealer', 'blush', 'eyeshadow', 'mascara', 'lipstick'];

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let query = supabase.from('product').select('*');

        // Apply category filter if not "all"
        if (category !== 'all') {
          query = query.eq('category', category);
        }

        // Apply search filter if there's a query
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
        console.log("Fetched products:", data); // Debug log
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, searchQuery]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already triggered by the effect above
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-100 rounded-bl-[40%] opacity-20 z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-100 rounded-tr-[40%] opacity-20 z-0" />

      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Beauty Shop</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover products curated just for you based on your beauty profile.
          </p>
        </div>

        {/* Search and filter section */}
        <div className="mb-10 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search bar */}
            <div className="w-full md:w-1/3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </form>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start flex-grow">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                    category === cat
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700">
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-rose-500 hover:bg-rose-600"
            >
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
            <p className="text-gray-600">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/shop/product/${product.id}`)}
              >
                {/* Product Image */}
                <div className="relative h-56 bg-gray-100">
                  {product.image_url ? (
                    <img 
                    src={getProxiedImageUrl(product.image_url)} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error(`Error loading image for ${product.name}:`, e);
                        e.target.src = "/placeholder-product.png";
                        e.target.onerror = null;
                    }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag size={40} className="text-gray-300" />
                    </div>
                  )}
                  
                  {/* Wishlist button */}
                  <button 
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onClick
                      // Add wishlist functionality here
                    }}
                  >
                    <Heart size={18} className="text-gray-500 hover:text-rose-500" />
                  </button>

                  {/* Sale tag if discounted */}
                  {product.discount_price && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                      Sale
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="p-4">
                  {/* Brand */}
                  <p className="text-xs text-gray-500 mb-1 uppercase">{product.brand}</p>
                  
                  {/* Name */}
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < Math.round(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.reviews || 0})</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center">
                    {product.discount_price ? (
                      <>
                        <span className="font-bold text-rose-500">${product.discount_price}</span>
                        <span className="text-gray-400 text-sm line-through ml-2">${product.price}</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">${product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}