'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Import Next.js Image component
import { 
  Heart, 
  ShoppingBag, 
  Search, 
  Star, 
  Sparkles,
  Menu,
  ArrowLeft
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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

// Define TypeScript interfaces
interface BlushProduct {
  id: number;
  name: string;
  price: number;
  brand: string;
  image?: string;
  rating?: number;
  type?: string;
  color?: string;
  skin_tone?: string;
  under_tone?: string;
  coverage_level?: string;
  skin_type?: string;
  restrictions?: string;
  link?: string;
  similarityScore?: number;
}

interface BlushEmbedding {
  blush_id: number;
  embedding: number[] | string | Record<string, number>;
}

// Main shop component that uses client-side features
function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comingFromQuiz = searchParams?.get('personalized') === 'true';
  
  const [products, setProducts] = useState<BlushProduct[]>([]);
  const [allProducts, setAllProducts] = useState<BlushProduct[]>([]);
  const [productEmbeddings, setProductEmbeddings] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userEmbedding, setUserEmbedding] = useState<number[] | null>(null);
  const [showingPersonalized, setShowingPersonalized] = useState<boolean>(comingFromQuiz);
  const [loadingEmbedding, setLoadingEmbedding] = useState<boolean>(false);
  const [hasQuizData, setHasQuizData] = useState<boolean>(false);
  // We'll keep this commented out since it's not being used
  const [debugInfo, setDebugInfo] = useState<string>(''); 

  // Replace the cosineSimilarity function with this improved version

  // Improved cosine similarity function with robust error handling
  function cosineSimilarity(vecA: any, vecB: any): number {
    try {
      // Check if both are arrays
      if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
        console.error('Invalid vectors', { 
          vecAType: typeof vecA, 
          vecBType: typeof vecB,
          vecA: vecA && typeof vecA === 'object' ? JSON.stringify(vecA).substring(0, 100) : vecA,
          vecB: vecB && typeof vecB === 'object' ? JSON.stringify(vecB).substring(0, 100) : vecB
        });
        
        // Try to convert to arrays if they're in string format
        if (typeof vecA === 'string') {
          try {
            vecA = JSON.parse(vecA);
          } catch (e) {
            console.error('Failed to parse vecA as JSON');
          }
        }
        
        if (typeof vecB === 'string') {
          try {
            vecB = JSON.parse(vecB);
          } catch (e) {
            console.error('Failed to parse vecB as JSON');
          }
        }
        
        // Check again after attempted conversion
        if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
          return 0;
        }
      }
      
      // Check for empty arrays
      if (vecA.length === 0 || vecB.length === 0) {
        console.warn('Empty vector detected');
        return 0;
      }
      
      // Check if dimensions match
      if (vecA.length !== vecB.length) {
        console.warn(`Vector length mismatch: vecA=${vecA.length}, vecB=${vecB.length}`);
        
        // If one is longer, truncate to match the shorter one
        const minLength = Math.min(vecA.length, vecB.length);
        vecA = vecA.slice(0, minLength);
        vecB = vecB.slice(0, minLength);
        
        console.log(`Truncated vectors to length ${minLength}`);
      }
      
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      let validDimensions = 0;
      
      for (let i = 0; i < vecA.length; i++) {
        // Make sure values are numbers
        const a = Number(vecA[i]);
        const b = Number(vecB[i]);
        
        if (isNaN(a) || isNaN(b) || !isFinite(a) || !isFinite(b)) {
          console.error(`Non-numeric or infinite values at index ${i}: ${vecA[i]}, ${vecB[i]}`);
          continue;
        }
        
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
        validDimensions++;
      }
      
      // Check if we have any valid dimensions
      if (validDimensions === 0) {
        console.warn('No valid dimensions found for similarity calculation');
        return 0;
      }
      
      if (normA <= 0 || normB <= 0) {
        console.warn('Zero norm detected', { normA, normB });
        return 0;
      }
      
      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      
      // Verify the result is valid
      if (isNaN(similarity) || !isFinite(similarity)) {
        console.error('Invalid similarity result:', similarity);
        return 0;
      }
      
      // Clamp to valid range
      return Math.max(-1, Math.min(1, similarity));
    } catch (error) {
      console.error('Error in cosineSimilarity calculation:', error);
      return 0;
    }
  }

  // Add this function to help parse embeddings that might be stored in different formats
  function parseEmbedding(embedding: number[] | string | Record<string, number>): number[] {
    if (Array.isArray(embedding)) {
      return embedding;
    }
    
    if (typeof embedding === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(embedding);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        console.error('Failed to parse embedding as JSON string', embedding);
      }
    }
    
    if (embedding && typeof embedding === 'object') {
      // It might be a Postgres array type returned from Supabase
      // Let's try to extract the values
      try {
        const values = Object.values(embedding);
        if (values.length > 0 && !isNaN(Number(values[0]))) {
          return values.map(v => Number(v));
        }
      } catch {
        console.error('Failed to extract values from embedding object', embedding);
      }
    }
    
    console.error('Could not parse embedding', embedding);
    return [];
  }
  

  // Replace the useEffect that gets the embedding from sessionStorage

  useEffect(() => {
    const getEmbedding = () => {
      try {
        setLoadingEmbedding(true);
        
        // Get URL parameters
        const fromQuiz = searchParams?.get('personalized') === 'true';
        const timestamp = searchParams?.get('t') || 'none';
        
        console.log("🔍 DEBUG: Loading embedding from sessionStorage", { 
          fromQuiz, 
          timestamp,
          currentURL: window.location.href
        });
        
        // Clear any debug info
        setDebugInfo('');
        
        // Try to get the embedding from sessionStorage
        const embeddingStr = sessionStorage.getItem('quiz_embedding');
        if (embeddingStr) {
          try {
            const embedding = JSON.parse(embeddingStr);
            
            if (!Array.isArray(embedding)) {
              console.error("🚨 ERROR: Embedding is not an array:", embedding);
              setDebugInfo(prev => prev + "\n🚨 ERROR: Embedding is not an array");
              setLoadingEmbedding(false);
              return;
            }
            
            // Calculate some statistics for the embedding to help with debugging
            const nonZeroCount = embedding.filter(v => v !== 0).length;
            const embeddingSum = embedding.reduce((sum, val) => sum + val, 0);
            const hasNaNs = embedding.some(val => isNaN(val));
            
            console.log("✅ Found embedding in sessionStorage:", { 
              length: embedding.length,
              nonZeroValues: nonZeroCount,
              sum: embeddingSum,
              hasNaNs
            });
            
            // Get profile info if available
            const profileStr = sessionStorage.getItem('quiz_profile');
            const profile = profileStr ? JSON.parse(profileStr) : null;
            
            setDebugInfo(prev => prev + `\n✅ Found embedding with length: ${embedding.length}, non-zero values: ${nonZeroCount}, sum: ${embeddingSum.toFixed(4)}`);
            if (profile) {
              setDebugInfo(prev => prev + `\n👤 Profile: ${profile.summary || JSON.stringify(profile.answers)}`);
            }
            
            // Store the embedding for use in recommendations
            setUserEmbedding(embedding);
            setHasQuizData(true);
            
            // Enable personalized view if coming from quiz
            if (fromQuiz) {
              setShowingPersonalized(true);
            }
          } catch (err) {
            console.error("🚨 Error parsing embedding JSON:", err);
            setDebugInfo(prev => prev + "\n🚨 Error parsing embedding JSON");
          }
        } else {
          console.log("⚠️ No embedding found in sessionStorage");
          setDebugInfo(prev => prev + "\n⚠️ No embedding found in sessionStorage");
          
          // Check for quiz answers as fallback
          const quizAnswers = sessionStorage.getItem('quiz_answers');
          if (quizAnswers) {
            console.log("🔄 Found quiz answers, generating embedding");
            setDebugInfo(prev => prev + "\n🔄 Found quiz answers, generating embedding");
            
            // Generate embedding from answers
            const timestamp = new Date().getTime();
            fetch(`http://localhost:8000/generate-embedding?t=${timestamp}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
              body: quizAnswers,
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to generate embedding: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (data.embedding && Array.isArray(data.embedding)) {
                console.log("✅ Generated embedding:", {
                  length: data.embedding.length,
                  sample: data.embedding.slice(0, 5)
                });
                
                setDebugInfo(prev => prev + `\n✅ Generated new embedding with length: ${data.embedding.length}`);
                setUserEmbedding(data.embedding);
                setHasQuizData(true);
                sessionStorage.setItem('quiz_embedding', JSON.stringify(data.embedding));
                
                if (fromQuiz) {
                  setShowingPersonalized(true);
                }
              } else {
                console.error("🚨 Invalid embedding received:", data);
                setDebugInfo(prev => prev + "\n🚨 Invalid embedding received from API");
              }
            })
            .catch(err => {
              console.error("🚨 Error generating embedding:", err);
              setDebugInfo(prev => prev + `\n🚨 Error generating embedding: ${err.message}`);
            });
          }
        }
        
        setLoadingEmbedding(false);
      } catch (err) {
        console.error("🚨 Error getting embedding:", err);
        setDebugInfo(prev => prev + `\n🚨 Error getting embedding: ${err instanceof Error ? err.message : String(err)}`);
        setLoadingEmbedding(false);
      }
    };
    
    // Call the function
    getEmbedding();
  }, [comingFromQuiz, searchParams]);

  // Replace the entire fetch data function with this version:

  // Fetch blush products and embeddings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products from Supabase
        const productsResponse = await fetch('/api/blush');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch blush products');
        }
        const blushProducts = await productsResponse.json();
        
        // Fetch embeddings from Supabase
        const embeddingsResponse = await fetch('/api/blush-embeddings');
        if (!embeddingsResponse.ok) {
          throw new Error('Failed to fetch blush embeddings');
        }
        const blushEmbeddings = await embeddingsResponse.json();

        // Create embeddings map for quick access
        const embeddings: Record<number, number[]> = {};
        let embeddingParseErrors = 0;

        // Debug the structure of the first embedding to understand its format
        if (blushEmbeddings.length > 0) {
          const firstEmbedding = blushEmbeddings[0];
          console.log('First product embedding structure:', {
            blush_id: firstEmbedding.blush_id,
            embedding_type: typeof firstEmbedding.embedding,
            embedding_sample: JSON.stringify(firstEmbedding.embedding).substring(0, 100) + '...'
          });
        }

        // Process all embeddings
        blushEmbeddings.forEach((item: BlushEmbedding) => {
          try {
            const parsedEmbedding = parseEmbedding(item.embedding);
            if (parsedEmbedding.length > 0) {
              embeddings[item.blush_id] = parsedEmbedding;
              console.log(`Processed embedding for product ${item.blush_id}: length = ${parsedEmbedding.length}`);
            } else {
              embeddingParseErrors++;
            }
          } catch (err) {
            console.error(`Error parsing embedding for product ${item.blush_id}:`, err);
            embeddingParseErrors++;
          }
        });

        console.log(`Successfully processed ${Object.keys(embeddings).length} embeddings with ${embeddingParseErrors} errors`);
        
        setAllProducts(blushProducts);
        setProductEmbeddings(embeddings);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Replace the useEffect that applies filters and sorting (around line 331-390)

  // Apply filters and sorting based on user embedding
  useEffect(() => {
    if (!allProducts.length) return;
    
    try {
      // Apply search filter
      let filteredProducts = [...allProducts];
      
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // If we have user embedding and showing personalized results, sort by similarity
      if (userEmbedding && showingPersonalized) {
        console.log("Calculating similarity scores for products");
        
        // Verify user embedding is valid
        if (!Array.isArray(userEmbedding) || userEmbedding.length === 0) {
          console.error("User embedding is not a valid array:", userEmbedding);
          setDebugInfo(prev => prev + "\nERROR: User embedding is not a valid array");
          setProducts(filteredProducts);
          return;
        }
        
        // Calculate similarity score for each product
        const productsWithScore = filteredProducts.map(product => {
          const embedding = productEmbeddings[product.id];
          let similarityScore = 0;
          
          if (embedding && Array.isArray(embedding) && embedding.length > 0) {
            try {
              similarityScore = cosineSimilarity(embedding, userEmbedding);
              
              // Ensure score is valid
              if (isNaN(similarityScore) || !isFinite(similarityScore)) {
                console.error(`Invalid similarity score for product ${product.id}:`, similarityScore);
                similarityScore = 0;
              }
              
              console.log(`Product ${product.id} (${product.name}) score: ${similarityScore.toFixed(4)}`);
            } catch (err) {
              console.error(`Error calculating similarity for product ${product.id}:`, err);
            }
          } else {
            console.log(`No valid embedding for product ${product.id} (${product.name})`);
          }
          
          return { 
            ...product, 
            similarityScore: similarityScore 
          };
        });
        
        // Log score distribution for debugging
        const scoreDistribution = {
          zero: productsWithScore.filter(p => p.similarityScore === 0).length,
          low: productsWithScore.filter(p => p.similarityScore > 0 && p.similarityScore < 0.3).length,
          medium: productsWithScore.filter(p => p.similarityScore >= 0.3 && p.similarityScore < 0.7).length,
          high: productsWithScore.filter(p => p.similarityScore >= 0.7).length
        };
        
        console.log("Score distribution:", scoreDistribution);
        setDebugInfo(prev => prev + `\nScore distribution: ${JSON.stringify(scoreDistribution)}`);
        
        // Sort by similarity score (highest first)
        const sortedProducts = [...productsWithScore].sort((a, b) => {
          const scoreA = a.similarityScore || 0;
          const scoreB = b.similarityScore || 0;
          return scoreB - scoreA;
        });
        
        setProducts(sortedProducts);
      } else {
        // No personalization, just use filtered products
        setProducts(filteredProducts);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
      setDebugInfo(prev => prev + `\nError applying filters: ${err instanceof Error ? err.message : String(err)}`);
      // Fallback to original products if error occurs
      setProducts(filteredProducts);
    }
  }, [allProducts, searchQuery, userEmbedding, showingPersonalized, productEmbeddings]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // Search is already handled in the effect
  };

  const togglePersonalization = (): void => {
    setShowingPersonalized(!showingPersonalized);
  };
  
  // Take the quiz button handler
  const handleTakeQuiz = (): void => {
    router.push('/quiz');
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
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <ShoppingBag className="h-6 w-6 text-rose-500" />
              <span className="text-xl font-bold text-gray-900">acquired.beauty</span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <span onClick={() => router.push('/')}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Home
                    </NavigationMenuLink>
                  </span>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/shop" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Products
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/quiz" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Beauty Quiz
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-rose-500">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>BeautyShop</SheetTitle>
                    <SheetDescription>
                      Find your perfect blush products
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Button 
                      variant="ghost" 
                      className="justify-start w-full"
                      onClick={() => router.push('/')}
                    >
                      Home
                    </Button>
                    <Link href="/shop" passHref>
                      <Button variant="ghost" className="justify-start w-full">
                        Products
                      </Button>
                    </Link>
                    <Link href="/quiz" passHref>
                      <Button variant="ghost" className="justify-start w-full">
                        Beauty Quiz
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      {/* <div className="h-10 w-full items-center bg-gradient-to-r from-rose-500 to-rose-400 justify-between"></div> */}
      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* Show "Back to Quiz" button if coming from quiz */}
        {comingFromQuiz && (
          <div className="mb-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/quiz')}
            >
              <ArrowLeft size={16} />
              Back to Quiz
            </Button>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Blush Collection</h1>
          
          {/* Show personalized message if coming from quiz */}
          {comingFromQuiz ? (
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here are your personalized blush recommendations based on your beauty quiz results!
            </p>
          ) : (
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover perfect blush products curated just for your skin tone and preferences.
            </p>
          )}
          
          {/* User didn't take quiz yet - show CTA */}
          {!hasQuizData && !comingFromQuiz && (
            <div className="mt-6">
              <Button
                onClick={handleTakeQuiz}
                className="px-6 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                <Sparkles size={16} className="text-yellow-300" />
                Take the Beauty Quiz for Personalized Recommendations
              </Button>
            </div>
          )}
          
          {/* Personalization toggle */}
          {hasQuizData && (
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

        {/* Search section */}
        <div className="mb-10 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search bar */}
            <div className="w-full">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search blush products..."
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </form>
            </div>
          </div>
        </div>

        {/* Loading state for personalization */}
        {loadingEmbedding && comingFromQuiz && (
          <div className="flex justify-center items-center p-10 bg-white rounded-xl shadow-md mb-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
              <p className="text-gray-700">Personalizing your recommendations...</p>
            </div>
          </div>
        )}

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
            <p className="text-gray-600">No products found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <a href={product.link || '#'} target="_blank" rel="noopener noreferrer">
                  {/* Product Image */}
                  <div className="relative h-56 bg-gray-100">
                    {product.image ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={product.image} 
                          alt={product.name || "Blush Product"}
                          fill
                          className="object-cover"
                          onError={() => {
                            console.error(`Error loading image for ${product.name}`);
                            // Note: We can't directly modify src in Next.js Image component on error
                            // This would require a state to track failed images
                          }}
                        />
                      </div>
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
                        e.preventDefault(); // Prevent navigation
                        // Add wishlist functionality here
                      }}
                    >
                      <Heart size={18} className="text-gray-500 hover:text-rose-500" />
                    </button>
                    
                    {/* Match score indicator - show more prominently if coming from quiz */}
                    {(showingPersonalized || comingFromQuiz) && product.similarityScore !== undefined && (
                      <div className={`
                        absolute bottom-3 left-3 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm
                        ${product.similarityScore > 0.01 
                          ? comingFromQuiz 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-white/90 text-rose-500'
                          : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        <Sparkles size={12} className={product.similarityScore > 0.01 && comingFromQuiz ? "text-yellow-300" : ""} />
                        {product.similarityScore > 0.01 
                          ? `${Math.round(product.similarityScore * 100)}% Match` 
                          : 'No Match'}
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
                      <span className="text-xs text-gray-500 ml-1">({product.rating ? product.rating.toFixed(1) : 'N/A'})</span>
                    </div>
                    
                    {/* Color if available */}
                    {product.color && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-600">Color:</span>
                        <span className="text-xs font-medium">{product.color}</span>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center mt-2">
                      <span className="font-bold text-gray-900">${product.price}</span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component to show while suspense is resolving
function ShopPageLoading() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );
}

// Export the main page component with Suspense boundary
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageLoading />}>
      <ShopPageContent />
    </Suspense>
  );
}