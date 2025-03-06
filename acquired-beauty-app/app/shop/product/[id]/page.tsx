'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ChevronLeft, 
  Minus, 
  Plus, 
  Share2, 
  Check 
} from 'lucide-react';

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedShade, setSelectedShade] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setProduct(data);
        
        // If product has shades, select the first one by default
        if (data && data.shades && data.shades.length > 0) {
          setSelectedShade(data.shades[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load the product. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    // In a real app, this would add to cart in the database
    // For now, we'll just show a confirmation state
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = () => {
    // In a real app, this would toggle wishlist status in the database
    setAddedToWishlist(!addedToWishlist);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-100 rounded-bl-[40%] opacity-20 z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-100 rounded-tr-[40%] opacity-20 z-0" />

      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* Back button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} />
          <span>Back to Shop</span>
        </button>

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
        ) : product ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image Section */}
              <div className="p-8">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <div 
                      className="w-full h-full bg-center bg-cover" 
                      style={{ backgroundImage: `url(${product.image_url})` }}
                    />
                  ) : (
                    <ShoppingBag size={80} className="text-gray-300" />
                  )}
                </div>
                
                {/* Thumbnails - if you have multiple images */}
                {product.additional_images && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.additional_images.map((img, index) => (
                      <div 
                        key={index}
                        className="aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                      >
                        <div 
                          className="w-full h-full bg-center bg-cover"
                          style={{ backgroundImage: `url(${img})` }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Details Section */}
              <div className="p-8">
                {/* Brand name */}
                <p className="text-sm text-gray-500 uppercase mb-1">{product.brand}</p>
                
                {/* Product name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.round(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{product.rating} ({product.reviews || 0} reviews)</span>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  {product.discount_price ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-rose-500">${product.discount_price}</span>
                      <span className="text-gray-400 text-lg line-through ml-3">${product.price}</span>
                      <span className="ml-3 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md">
                        {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  )}
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
                
                {/* Shades (if applicable) */}
                {product.shades && product.shades.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Shade</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.shades.map((shade, index) => (
                        <button
                          key={index}
                          className={`w-10 h-10 rounded-full border-2 ${
                            selectedShade === shade ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-200'
                          }`}
                          style={{ background: shade.color || '#F5F5F5' }}
                          onClick={() => setSelectedShade(shade)}
                          title={shade.name}
                        >
                          {selectedShade === shade && (
                            <Check size={16} className="text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedShade && (
                      <p className="text-sm text-gray-500 mt-2">{selectedShade.name}</p>
                    )}
                  </div>
                )}
                
                {/* Quantity */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                  <div className="flex items-center">
                    <button 
                      onClick={decrementQuantity}
                      className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center font-medium">
                      {quantity}
                    </div>
                    <button 
                      onClick={incrementQuantity}
                      className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart & Wishlist */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button 
                    onClick={handleAddToCart}
                    className={`px-10 py-6 rounded-lg shadow transition-all ${
                      addedToCart 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-rose-500 hover:bg-rose-600'
                    } text-white flex-grow`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={20} className="mr-2" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} className="mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleToggleWishlist}
                    className={`p-6 rounded-lg border ${
                      addedToWishlist 
                        ? 'border-rose-500 text-rose-500 bg-rose-50 hover:bg-rose-100' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                    variant="outline"
                  >
                    <Heart size={20} className={addedToWishlist ? 'fill-rose-500' : ''} />
                  </Button>
                  
                  <Button 
                    className="p-6 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                    variant="outline"
                  >
                    <Share2 size={20} />
                  </Button>
                </div>
                
                {/* Details/specs */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Details</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {product.product_details && product.product_details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                    {!product.product_details && (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Category: {product.category}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Product ID: {product.id}</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
            <p className="text-gray-600">Product not found.</p>
            <Button 
              onClick={() => router.push('/shop')} 
              className="mt-4 bg-rose-500 hover:bg-rose-600"
            >
              Return to Shop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}