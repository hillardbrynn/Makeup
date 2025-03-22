'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  ShoppingBag, 
  Filter, 
  Search, 
  Star, 
  Sparkles,
  User,
  ShoppingCart,
  Menu,
  Users
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function ShopPage() {
  const getProxiedImageUrl = (originalUrl) => {
    return `/api/image?url=${encodeURIComponent(originalUrl)}`;
  };
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmbedding, setUserEmbedding] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [showingPersonalized, setShowingPersonalized] = useState(false);
  const router = useRouter();

  // Categories for filter buttons
  const categories = ['all', 'foundation', 'concealer', 'blush', 'eyeshadow', 'mascara', 'lipstick'];

  // Cosine similarity function to measure product match
  function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Fetch user's quiz embedding
  useEffect(() => {
    async function fetchUserQuizEmbedding() {
      try {
        // Get current user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          return null;
        }
        
        if (!session?.user) {
          console.log("No user logged in - skipping personalization");
          return null;
        }
        
        const userId = session.user.id;
        console.log("Fetching quiz embedding for user:", userId);
        
        // Get the user's latest quiz data
        const { data: quizData, error: quizError } = await supabase
          .from('quiz')
          .select('id')
          .eq('user_id', userId)
          .order('id', { ascending: false })
          .limit(1);
        
        if (quizError) {
          console.error("Error fetching quiz data:", quizError);
          return null;
        }
        
        if (!quizData || quizData.length === 0) {
          console.log("No quiz data found for user");
          return null;
        }
        
        const quizId = quizData[0].id;
        console.log("Found latest quiz ID:", quizId);
        
        // Get the quiz embedding
        const { data: embeddingData, error: embeddingError } = await supabase
          .from('quiz_embedding')
          .select('embedding')
          .eq('quiz_id', quizId)
          .limit(1);
        
        if (embeddingError) {
          console.error("Error fetching embedding:", embeddingError);
          return null;
        }
        
        if (!embeddingData || embeddingData.length === 0) {
          console.log("No embedding found for quiz");
          return null;
        }
        
        console.log("Found user embedding");
        return embeddingData[0].embedding;
      } catch (err) {
        console.error("Error in fetchUserQuizEmbedding:", err);
        return null;
      }
    }
    
    async function initialize() {
      const embedding = await fetchUserQuizEmbedding();
      setUserEmbedding(embedding);
      setIsPersonalized(!!embedding);
    }
    
    initialize();
  }, []);

  // Fetch products and calculate similarity scores if user has an embedding
  useEffect(() => {
    async function fetchProductsWithSimilarity() {
      try {
        setLoading(true);
        
        // Fetch all products
        let query = supabase.from('products').select('*');
        
        // Apply category filter if not "all"
        if (category !== 'all') {
          query = query.eq('category', category);
        }
        
        // Apply search filter if there's a query
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        
        const { data: productsData, error: productsError } = await query;
        
        if (productsError) {
          throw productsError;
        }
        
        // If we have user embeddings, fetch product embeddings and calculate similarity
        if (userEmbedding) {
          // Fetch all product embeddings
          const { data: embeddings, error: embeddingsError } = await supabase
            .from('product_embeddings')
            .select('product_id, embedding');
          
          if (embeddingsError) {
            throw embeddingsError;
          }
          
          // Create mapping of product_id to embedding
          const embeddingMap = {};
          embeddings.forEach(item => {
            embeddingMap[item.product_id] = item.embedding;
          });
          
          // Calculate similarity score for each product
          const productsWithScore = productsData.map(product => {
            const embedding = embeddingMap[product.id];
            let similarityScore = 0;
            
            if (embedding) {
              similarityScore = cosineSimilarity(embedding, userEmbedding);
            }
            
            return { ...product, similarityScore };
          });
          
          // Sort by similarity score (highest first)
          productsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);
          
          setPersonalizedProducts(productsWithScore);
          
          // If we're showing personalized results, use the sorted list
          if (showingPersonalized) {
            setProducts(productsWithScore);
          } else {
            setProducts(productsData || []);
          }
        } else {
          // No user embedding, just use regular products
          setProducts(productsData || []);
        }
        
        console.log("Fetched products:", productsData?.length || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductsWithSimilarity();
  }, [category, searchQuery, userEmbedding, showingPersonalized]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already triggered by the effect above
  };

  const togglePersonalization = () => {
    setShowingPersonalized(!showingPersonalized);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-100 rounded-bl-[40%] opacity-20 z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-100 rounded-tr-[40%] opacity-20 z-0" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold text-gray-900">acquired.beauty</span>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/shop" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Shop
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.slice(1).map((category) => (
                        <li key={category} className="row-span-1">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-rose-50 to-white p-6 no-underline outline-none focus:shadow-md"
                              href={`/shop?category=${category}`}
                            >
                              <div className="mb-2 mt-4 text-lg font-medium capitalize text-rose-500">
                                {category}
                              </div>
                              <p className="text-sm leading-tight text-gray-500">
                                Shop our collection of {category} products
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/quiz" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Beauty Quiz
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      <Users />
                      Community
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* <Button variant="ghost" size="icon" className="text-gray-700 hover:text-rose-500"> */}

              <DropdownMenu>
                <DropdownMenuTrigger variant="ghost" size="icon" className="text-gray-700 hover:text-rose-500"><User className="h-5 w-5" /></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            {/* </Button> */}
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-rose-500">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-rose-500">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>BeautyShop</SheetTitle>
                    <SheetDescription>
                      Find your perfect beauty products
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/">Home</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/shop">Shop</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/quiz">Beauty Quiz</Link>
                    </Button>
                    <div className="py-2">
                      <p className="text-sm font-medium text-gray-500 mb-2">Categories</p>
                      {categories.slice(1).map((cat) => (
                        <Button 
                          key={cat} 
                          variant="ghost" 
                          className="justify-start capitalize w-full text-gray-700"
                          asChild
                        >
                          <Link href={`/shop?category=${cat}`}>{cat}</Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className="h-10 w-full items-center bg-gradient-to-r from-rose-500 to-rose-400 justify-between"></div>
      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Product Book</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover products curated just for you based on your beauty profile.
          </p>
          
          {/* Personalization toggle */}
          {isPersonalized && (
            <div className="mt-4">
              <button
                onClick={togglePersonalization}
                className={`
                  flex items-center gap-2 mx-auto px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${showingPersonalized 
                    ? 'bg-rose-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <Sparkles size={16} className={showingPersonalized ? "text-yellow-300" : "text-gray-500"} />
                {showingPersonalized ? 'Showing Personalized Results' : 'Show Personalized Results'}
              </button>
            </div>
          )}
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
                  
                  {/* Match score indicator */}
                  {showingPersonalized && product.similarityScore > 0 && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 text-rose-500 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles size={12} />
                      {Math.round(product.similarityScore * 100)}% Match
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