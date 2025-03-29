'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a placeholder component that will redirect to home
export default function CommunityPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page since this page is disabled
    router.push('/');
  }, [router]);
  
  // Return a minimal component while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
// import supabase from '@/lib/supabase';
// import { 
//   Heart, 
//   MessageCircle, 
//   Share2, 
//   Bookmark, 
//   Camera, 
//   User, 
//   Sparkles,
//   ShoppingBag,
//   Menu,
//   ChevronRight,
//   Users,
//   Hash,
//   X
// } from 'lucide-react';

// export default function CommunityPage() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('trending');
//   const [showCreatePost, setShowCreatePost] = useState(false);
//   const [newPostContent, setNewPostContent] = useState('');
//   const [newPostImage, setNewPostImage] = useState(null);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [showUserDropdown, setShowUserDropdown] = useState(false);
//   const router = useRouter();

//   // Featured beauty creators
//   const featuredCreators = [
//     { 
//       id: 1, 
//       name: 'Sophia Lee', 
//       username: '@sophiabeauty', 
//       avatar: '/api/placeholder/150/150', 
//       followers: '45K',
//       specialties: ['Skincare', 'Natural Makeup']
//     },
//     { 
//       id: 2, 
//       name: 'Alex Kim', 
//       username: '@alexglam', 
//       avatar: '/api/placeholder/150/150', 
//       followers: '32K',
//       specialties: ['Bold Lips', 'Contour']
//     },
//     { 
//       id: 3, 
//       name: 'Maya Johnson', 
//       username: '@mayaesthetic', 
//       avatar: '/api/placeholder/150/150', 
//       followers: '67K',
//       specialties: ['Eye Looks', 'Tutorials']
//     },
//   ];

//   // Popular hashtags
//   const popularTags = [
//     { id: 1, name: 'AcquiredGlow', count: 2453 },
//     { id: 2, name: 'NaturalBeauty', count: 1879 },
//     { id: 3, name: 'MakeupTips', count: 1654 },
//     { id: 4, name: 'SkincareSunday', count: 1432 },
//     { id: 5, name: 'BeautyEssentials', count: 1321 },
//   ];

//   // Featured community discussions
//   const communityDiscussions = [
//     { id: 1, title: 'Your holy grail blush?', comments: 87, likes: 142 },
//     { id: 2, title: 'Best foundation for sensitive skin?', comments: 63, likes: 98 },
//     { id: 3, title: 'How to make makeup last all day?', comments: 54, likes: 112 },
//   ];

//   // Fetch user session and posts data
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setLoading(true);
        
//         // Get current user
//         const { data: { session } } = await supabase.auth.getSession();
//         if (session?.user) {
//           setCurrentUser(session.user);
//         }
        
//         // For demonstration, we'll create mock posts
//         // In a real app, you'd fetch these from Supabase
//         const mockPosts = [
//           {
//             id: 1,
//             author: {
//               id: 101,
//               name: 'Jessica Williams',
//               username: '@jessicabeauty',
//               avatar: '/api/placeholder/50/50'
//             },
//             content: "Just tried the new Acquired Beauty blush in \"Sunset Glow\" and I'm obsessed! The pigmentation is amazing and it blends like a dream. Who else has tried it? #AcquiredGlow #BlushCrush",
//             image: '/api/placeholder/600/400',
//             createdAt: '2 hours ago',
//             likes: 124,
//             comments: 32,
//             isLiked: false,
//             isBookmarked: false,
//             tags: ['AcquiredGlow', 'BlushCrush']
//           },
//           {
//             id: 2,
//             author: {
//               id: 102,
//               name: 'Emma Chen',
//               username: '@emmachen',
//               avatar: '/api/placeholder/50/50'
//             },
//             content: 'My everyday makeup routine using all Acquired Beauty products! This foundation is a game-changer for my combination skin. What are your go-to everyday products? #DailyGlam #AcquiredBeauty',
//             image: '/api/placeholder/600/400',
//             createdAt: '5 hours ago',
//             likes: 89,
//             comments: 17,
//             isLiked: true,
//             isBookmarked: true,
//             tags: ['DailyGlam', 'AcquiredBeauty']
//           },
//           {
//             id: 3,
//             author: {
//               id: 103,
//               name: 'Olivia Rodriguez',
//               username: '@oliviabeauty',
//               avatar: '/api/placeholder/50/50'
//             },
//             content: `Beauty tip: Apply your blush slightly higher on the cheekbones for a more lifted look! I've been using "Blossom Pink" from Acquired Beauty and it gives such a natural flush. #BeautyTips #BlushPlacement`,
//             image: null,
//             createdAt: '8 hours ago',
//             likes: 156,
//             comments: 42,
//             isLiked: false,
//             isBookmarked: false,
//             tags: ['BeautyTips', 'BlushPlacement']
//           },
//           {
//             id: 4,
//             author: {
//               id: 104,
//               name: 'Maya Johnson',
//               username: '@mayaesthetic',
//               avatar: '/api/placeholder/50/50'
//             },
//             content: 'Filmed a tutorial using the new Acquired Beauty eyeshadow palette! The formula is so buttery and pigmented. Link to full video in my bio! #MakeupTutorial #AcquiredBeauty',
//             image: '/api/placeholder/600/400',
//             createdAt: '1 day ago',
//             likes: 211,
//             comments: 56,
//             isLiked: false,
//             isBookmarked: true,
//             tags: ['MakeupTutorial', 'AcquiredBeauty']
//           }
//         ];

//         setPosts(mockPosts);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   // Handle user logout
//   const handleLogout = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();
      
//       if (error) {
//         console.error("Error signing out:", error);
//       } else {
//         setCurrentUser(null);
//         // Redirection will be handled by auth route handler
//       }
//     } catch (err) {
//       console.error("Error in logout:", err);
//     }
//   };

//   // Toggle like on a post
//   const toggleLike = (postId) => {
//     setPosts(posts.map(post => 
//       post.id === postId 
//         ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } 
//         : post
//     ));
//   };

//   // Toggle bookmark on a post
//   const toggleBookmark = (postId) => {
//     setPosts(posts.map(post => 
//       post.id === postId 
//         ? { ...post, isBookmarked: !post.isBookmarked } 
//         : post
//     ));
//   };

//   // Handle create post submission
//   const handleCreatePost = () => {
//     if (!newPostContent.trim()) return;
    
//     // In a real app, you would submit to Supabase here
//     const newPost = {
//       id: Date.now(),
//       author: {
//         id: currentUser?.id || 999,
//         name: currentUser?.user_metadata?.full_name || 'Beauty Enthusiast',
//         username: `@${currentUser?.email?.split('@')[0] || 'user'}`,
//         avatar: currentUser?.user_metadata?.avatar_url || '/api/placeholder/50/50'
//       },
//       content: newPostContent,
//       image: newPostImage,
//       createdAt: 'Just now',
//       likes: 0,
//       comments: 0,
//       isLiked: false,
//       isBookmarked: false,
//       tags: newPostContent.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []
//     };
    
//     setPosts([newPost, ...posts]);
//     setNewPostContent('');
//     setNewPostImage(null);
//     setShowCreatePost(false);
//   };

//   // Filter posts based on selected tab
//   const getFilteredPosts = () => {
//     switch (selectedTab) {
//       case 'trending':
//         return [...posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
//       case 'latest':
//         return [...posts];
//       case 'following':
//         // In a real app, you would filter by followed users
//         return posts.filter((_, index) => index % 2 === 0);
//       default:
//         return posts;
//     }
//   };

//   // Simple Avatar component
//   const Avatar = ({ src, alt, fallback, className = "" }) => (
//     <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 ${className}`}>
//       {src ? (
//         <Image 
//           src={src} 
//           alt={alt || "Avatar"}
//           className="aspect-square h-full w-full object-cover"
//           width={40}
//           height={40}
//         />
//       ) : (
//         <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-300 text-gray-600">
//           {fallback || "U"}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50">
//       {/* Decorative elements */}
//       <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-100 rounded-bl-[40%] opacity-20 z-0" />
//       <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-100 rounded-tr-[40%] opacity-20 z-0" />

//       {/* Navbar */}
//       <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
//         <div className="container mx-auto flex h-16 items-center justify-between px-6">
//           {/* Logo */}
//           <div className="flex items-center gap-2">
//             <div 
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={async () => {
//                 const { data: { session } } = await supabase.auth.getSession();
//                 if (!session?.user) {
//                   router.push('/');
//                 }
//               }}
//             >
//               <ShoppingBag className="h-6 w-6 text-rose-500" />
//               <span className="text-xl font-bold text-gray-900">acquired.beauty</span>
//             </div>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-1">
//             <button 
//               onClick={async () => {
//                 const { data: { session } } = await supabase.auth.getSession();
//                 if (!session?.user) {
//                   router.push('/');
//                 }
//               }}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
//             >
//               Home
//             </button>
//             <Link href="/shop" passHref>
//               <span className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
//                 Products
//               </span>
//             </Link>
//             <Link href="/community" passHref>
//               <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-md cursor-pointer flex items-center gap-1">
//                 <Users className="h-4 w-4" />
//                 <span>Community</span>
//               </span>
//             </Link>
//             <Link href="/quiz" passHref>
//               <span className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
//                 Beauty Quiz
//               </span>
//             </Link>
//           </div>

//           {/* Right side icons */}
//           <div className="flex items-center gap-4">
//             <div className="relative">
//               <button 
//                 onClick={() => setShowUserDropdown(!showUserDropdown)}
//                 className="p-2 text-gray-700 hover:text-rose-500 rounded-full hover:bg-gray-100"
//               >
//                 <User className="h-5 w-5" />
//                 {currentUser && (
//                   <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500" />
//                 )}
//               </button>
              
//               {/* User Dropdown */}
//               {showUserDropdown && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
//                   {currentUser ? (
//                     <>
//                       <div className="px-4 py-2 border-b">
//                         <p className="text-sm font-medium">Logged in as</p>
//                         <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
//                       </div>
//                       <Link href="/profile" passHref>
//                         <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
//                           My Profile
//                         </span>
//                       </Link>
//                       <Link href="/orders" passHref>
//                         <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
//                           My Orders
//                         </span>
//                       </Link>
//                       <Link href="/quiz" passHref>
//                         <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
//                           Beauty Quiz
//                         </span>
//                       </Link>
//                       <div className="border-t my-1"></div>
//                       <button 
//                         onClick={handleLogout} 
//                         className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <div className="px-4 py-2 border-b">
//                         <p className="text-sm font-medium">Not logged in</p>
//                       </div>
//                       <Link href="/login" passHref>
//                         <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
//                           Login
//                         </span>
//                       </Link>
//                       <Link href="/signup" passHref>
//                         <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
//                           Create Account
//                         </span>
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>

//             <Link href="/wishlist" passHref>
//               <span className="p-2 text-gray-700 hover:text-rose-500 rounded-full hover:bg-gray-100 cursor-pointer">
//                 <Heart className="h-5 w-5" />
//               </span>
//             </Link>

//             {/* Mobile menu button */}
//             <div className="md:hidden">
//               <button 
//                 onClick={() => setShowMobileMenu(!showMobileMenu)}
//                 className="p-2 text-gray-700 hover:text-rose-500 rounded-full hover:bg-gray-100"
//               >
//                 <Menu className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Mobile menu */}
//         {showMobileMenu && (
//           <div className="md:hidden bg-white border-t">
//             <div className="py-2">
//               <button
//                 className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                 onClick={async () => {
//                   const { data: { session } } = await supabase.auth.getSession();
//                   if (!session?.user) {
//                     router.push('/');
//                   }
//                   setShowMobileMenu(false);
//                 }}
//               >
//                 Home
//               </button>
//               <Link href="/shop" passHref>
//                 <span className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
//                   Products
//                 </span>
//               </Link>
//               <Link href="/community" passHref>
//                 <span className="block w-full text-left px-4 py-2 bg-rose-100 text-rose-700 cursor-pointer">
//                   Community
//                 </span>
//               </Link>
//               <Link href="/quiz" passHref>
//                 <span className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
//                   Beauty Quiz
//                 </span>
//               </Link>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Hero section */}
//       <section className="relative z-10 bg-gradient-to-r from-rose-100 to-pink-100">
//         <div className="container mx-auto px-6 py-16 md:py-24">
//           <div className="max-w-3xl mx-auto text-center">
//             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//               Join Our Beauty Community
//             </h1>
//             <p className="text-lg md:text-xl text-gray-700 mb-8">
//               Connect with beauty enthusiasts, share your looks, and discover new inspiration from our community of makeup lovers.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               {currentUser ? (
//                 <button 
//                   onClick={() => setShowCreatePost(true)} 
//                   className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 rounded-full text-lg font-medium"
//                 >
//                   Share Your Beauty Story
//                 </button>
//               ) : (
//                 <button 
//                   onClick={() => router.push('/signup')} 
//                   className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 rounded-full text-lg font-medium"
//                 >
//                   Join the Community
//                 </button>
//               )}
//               <button 
//                 onClick={() => document.getElementById('feed').scrollIntoView({ behavior: 'smooth' })} 
//                 className="border border-rose-300 hover:bg-rose-50 text-rose-700 px-8 py-6 rounded-full text-lg font-medium"
//               >
//                 Explore Posts
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Curved edge */}
//         <div className="h-16 bg-[url('/path-to-curve.svg')] bg-no-repeat bg-cover"></div>
//       </section>

//       {/* Main content */}
//       <div className="container mx-auto px-6 py-12 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left sidebar */}
//           <div className="hidden lg:block">
//             <div className="sticky top-24">
//               {/* Community stats */}
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md mb-6">
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold">Community Highlights</h3>
//                 </div>
//                 <div className="p-6 pt-0">
//                   <div className="grid grid-cols-3 gap-2 text-center">
//                     <div className="p-3">
//                       <p className="text-2xl font-bold text-rose-500">12.5K</p>
//                       <p className="text-xs text-gray-500">Members</p>
//                     </div>
//                     <div className="p-3">
//                       <p className="text-2xl font-bold text-rose-500">8.2K</p>
//                       <p className="text-xs text-gray-500">Posts</p>
//                     </div>
//                     <div className="p-3">
//                       <p className="text-2xl font-bold text-rose-500">45K</p>
//                       <p className="text-xs text-gray-500">Comments</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Featured creators */}
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md mb-6">
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold">Featured Beauty Creators</h3>
//                 </div>
//                 <div className="p-6 pt-0">
//                   <div className="space-y-4">
//                     {featuredCreators.map((creator) => (
//                       <div key={creator.id} className="flex items-center gap-3">
//                         <Avatar 
//                           src={creator.avatar} 
//                           alt={creator.name} 
//                           fallback={creator.name.substring(0, 2)}
//                           className="h-12 w-12 border-2 border-rose-100"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-900 truncate">{creator.name}</p>
//                           <p className="text-xs text-gray-500 truncate">{creator.username}</p>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {creator.specialties.map((specialty, index) => (
//                               <span key={index} className="inline-block text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
//                                 {specialty}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                         <button className="px-3 py-1 text-xs border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-md">
//                           Follow
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="p-4 border-t">
//                   <button className="w-full py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md">
//                     View All Creators
//                   </button>
//                 </div>
//               </div>
              
//               {/* Popular hashtags */}
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md">
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold">Trending Hashtags</h3>
//                 </div>
//                 <div className="p-6 pt-0">
//                   <div className="space-y-2">
//                     {popularTags.map((tag) => (
//                       <button 
//                         key={tag.id} 
//                         className="flex items-center gap-2 w-full p-2 hover:bg-rose-50 rounded-lg transition-colors"
//                       >
//                         <Hash className="h-4 w-4 text-rose-400" />
//                         <span className="font-medium text-gray-900">#{tag.name}</span>
//                         <span className="text-xs text-gray-500 ml-auto">{tag.count} posts</span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="p-4 border-t">
//                   <button className="w-full py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md">
//                     Explore More Hashtags
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Main feed */}
//           <div className="lg:col-span-2" id="feed">
//             {/* Create post */}
//             {currentUser && (
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md mb-6">
//                 <div className="p-6">
//                   <div className="flex items-start gap-3">
//                     <Avatar 
//                       src={currentUser?.user_metadata?.avatar_url || '/api/placeholder/50/50'} 
//                       fallback={currentUser?.user_metadata?.full_name?.substring(0, 2) || 'U'}
//                     />
//                     <div 
//                       onClick={() => setShowCreatePost(true)}
//                       className="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2.5 cursor-text"
//                     >
//                       <p className="text-gray-500">Share your beauty thoughts...</p>
//                     </div>
//                     <button 
//                       onClick={() => setShowCreatePost(true)} 
//                       className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full"
//                     >
//                       <Camera className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Create post modal */}
//             {showCreatePost && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//                 <div className="bg-white rounded-lg max-w-lg w-full p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-xl font-semibold">Create Post</h3>
//                     <button 
//                       onClick={() => setShowCreatePost(false)}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <p className="text-gray-500 mb-4">
//                     Share your beauty tips, experiences, or questions with the community.
//                   </p>
//                   <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                       <Avatar 
//                         src={currentUser?.user_metadata?.avatar_url || '/api/placeholder/50/50'} 
//                         fallback={currentUser?.user_metadata?.full_name?.substring(0, 2) || 'U'}
//                       />
//                       <div className="flex-1">
//                         <p className="font-medium text-gray-900">
//                           {currentUser?.user_metadata?.full_name || 'Beauty Enthusiast'}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           @{currentUser?.email?.split('@')[0] || 'user'}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <textarea 
//                       placeholder="What's on your beauty mind? Use # to add hashtags..."
//                       value={newPostContent}
//                       onChange={(e) => setNewPostContent(e.target.value)}
//                       className="w-full min-h-24 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-300"
//                     />
                    
//                     {newPostImage && (
//                       <div className="relative">
//                         <Image 
//                           src={newPostImage} 
//                           alt="Post preview" 
//                           className="w-full rounded-lg max-h-56 object-cover"
//                           width={600}
//                           height={400}
//                         />
//                         <button 
//                           className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
//                           onClick={() => setNewPostImage(null)}
//                         >
//                           ×
//                         </button>
//                       </div>
//                     )}
                    
//                     <div className="flex items-center justify-between">
//                       <button 
//                         className="flex items-center px-3 py-1 border border-rose-200 text-rose-500 rounded-md hover:bg-rose-50"
//                         onClick={() => setNewPostImage('/api/placeholder/600/400')}
//                       >
//                         <Camera className="h-4 w-4 mr-2" />
//                         Add Photo
//                       </button>
                      
//                       <button
//                         disabled={!newPostContent.trim()}
//                         onClick={handleCreatePost}
//                         className={`px-4 py-2 bg-rose-500 text-white rounded-md font-medium ${!newPostContent.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-600'}`}
//                       >
//                         Post
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Tabs for filtering */}
//             <div className="mb-6">
//               <div className="flex flex-row bg-white/80 backdrop-blur-sm rounded-lg p-1 space-x-1">
//                 <button 
//                   onClick={() => setSelectedTab('trending')}
//                   className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium
//                     ${selectedTab === 'trending' ? 'bg-rose-100 text-rose-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
//                 >
//                   <Sparkles className="h-4
// <Sparkles className="h-4 w-4 mr-2" />
//                   Trending
//                 </button>
//                 <button 
//                   onClick={() => setSelectedTab('latest')}
//                   className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium
//                     ${selectedTab === 'latest' ? 'bg-rose-100 text-rose-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
//                 >
//                   Latest
//                 </button>
//                 {currentUser && (
//                   <button 
//                     onClick={() => setSelectedTab('following')}
//                     className={`flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium
//                       ${selectedTab === 'following' ? 'bg-rose-100 text-rose-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
//                   >
//                     Following
//                   </button>
//                 )}
//               </div>
//             </div>
            
//             {/* Posts list */}
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <div className="animate-spin h-8 w-8 border-2 border-rose-500 rounded-full border-t-transparent"></div>
//               </div>
//             ) : getFilteredPosts().length === 0 ? (
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md">
//                 <div className="flex flex-col items-center py-12 px-4">
//                   <div className="bg-rose-100 p-4 rounded-full mb-4">
//                     <MessageCircle className="h-8 w-8 text-rose-500" />
//                   </div>
//                   <h3 className="text-xl font-medium text-gray-900 mb-2">No posts to show</h3>
//                   <p className="text-gray-500 mb-6 text-center max-w-md">
//                     {selectedTab === 'following' 
//                       ? 'Follow some creators to see their posts here!'
//                       : 'Be the first to share your beauty inspiration and tips with the community.'}
//                   </p>
//                   {currentUser ? (
//                     <button 
//                       onClick={() => setShowCreatePost(true)}
//                       className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-medium"
//                     >
//                       Create a Post
//                     </button>
//                   ) : (
//                     <button 
//                       onClick={() => router.push('/login')}
//                       className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-medium"
//                     >
//                       Login to Participate
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {getFilteredPosts().map((post) => (
//                   <div key={post.id} className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md overflow-hidden">
//                     <div className="p-6 pb-3">
//                       <div className="flex justify-between items-start">
//                         <div className="flex items-center gap-3">
//                           <Avatar 
//                             src={post.author.avatar} 
//                             alt={post.author.name}
//                             fallback={post.author.name.substring(0, 2)}
//                           />
//                           <div>
//                             <p className="font-medium text-gray-900">{post.author.name}</p>
//                             <p className="text-xs text-gray-500">{post.author.username} • {post.createdAt}</p>
//                           </div>
//                         </div>
//                         <div className="relative">
//                           <button 
//                             className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
//                             onClick={() => {
//                               // Implementation of post options dropdown would go here
//                               alert('Post options');
//                             }}
//                           >
//                             •••
//                           </button>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="px-6 pb-3">
//                       <p className="whitespace-pre-line text-gray-800 mb-3">{post.content}</p>
                      
//                       {/* Post tags */}
//                       {post.tags && post.tags.length > 0 && (
//                         <div className="flex flex-wrap gap-1.5 mb-3">
//                           {post.tags.map((tag, index) => (
//                             <button 
//                               key={index} 
//                               className="h-7 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs"
//                             >
//                               #{tag}
//                             </button>
//                           ))}
//                         </div>
//                       )}
                      
//                       {/* Post image */}
//                       {post.image && (
//                         <div className="mt-3 -mx-6">
//                           <Image 
//                             src={post.image} 
//                             alt="Post" 
//                             className="w-full max-h-96 object-cover"
//                             width={600}
//                             height={400}
//                           />
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="border-t border-gray-100 pt-3 px-6 pb-4 flex flex-wrap gap-1 justify-between">
//                       <div className="flex items-center gap-1">
//                         <button 
//                           className={`flex items-center px-2 py-1 text-sm rounded-md ${post.isLiked ? 'text-rose-500' : 'text-gray-500 hover:bg-gray-100'}`}
//                           onClick={() => toggleLike(post.id)}
//                         >
//                           <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-rose-500' : ''}`} />
//                           {post.likes}
//                         </button>
//                         <button className="flex items-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
//                           <MessageCircle className="h-4 w-4 mr-1" />
//                           {post.comments}
//                         </button>
//                         <button className="flex items-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
//                           <Share2 className="h-4 w-4 mr-1" />
//                           Share
//                         </button>
//                       </div>
//                       <button 
//                         className={`flex items-center px-2 py-1 text-sm rounded-md ${post.isBookmarked ? 'text-rose-500' : 'text-gray-500 hover:bg-gray-100'}`}
//                         onClick={() => toggleBookmark(post.id)}
//                       >
//                         <Bookmark className={`h-4 w-4 mr-1 ${post.isBookmarked ? 'fill-rose-500' : ''}`} />
//                         Save
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
            
//             {/* Load more button */}
//             {getFilteredPosts().length > 0 && (
//               <div className="mt-8 text-center">
//                 <button 
//                   className="px-6 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-md font-medium"
//                 >
//                   Load More
//                 </button>
//               </div>
//             )}
//           </div>
          
//           {/* Right sidebar */}
//           <div className="hidden lg:block">
//             <div className="sticky top-24">
//               {/* Community discussions */}
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md mb-6">
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold">Hot Discussions</h3>
//                 </div>
//                 <div className="px-6 pb-4">
//                   <div className="space-y-4">
//                     {communityDiscussions.map((discussion) => (
//                       <div key={discussion.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
//                         <Link href={`/community/discussion/${discussion.id}`} passHref>
//                           <h3 className="font-medium text-gray-900 hover:text-rose-600 transition-colors mb-2 cursor-pointer">
//                             {discussion.title}
//                           </h3>
//                         </Link>
//                         <div className="flex items-center text-xs text-gray-500">
//                           <span className="flex items-center">
//                             <MessageCircle className="h-3 w-3 mr-1" />
//                             {discussion.comments} comments
//                           </span>
//                           <span className="mx-2">•</span>
//                           <span className="flex items-center">
//                             <Heart className="h-3 w-3 mr-1" />
//                             {discussion.likes} likes
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="p-4 border-t">
//                   <Link href="/community/discussions" passHref>
//                     <button className="w-full py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md">
//                       View All Discussions
//                     </button>
//                   </Link>
//                 </div>
//               </div>
              
//               {/* Featured products */}
//               <div className="rounded-lg border bg-white/80 backdrop-blur-sm shadow-md">
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold">Community Favorites</h3>
//                   <p className="text-sm text-gray-500">Products our community loves</p>
//                 </div>
//                 <div className="px-6 pb-4">
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                         <Image src="/api/placeholder/64/64" alt="Blush" className="w-full h-full object-cover" width={64} height={64} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-gray-900 truncate">Sunset Glow Blush</p>
//                         <div className="flex items-center">
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <svg 
//                                 key={i} 
//                                 className={`h-3 w-3 ${i < 5 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
//                                 xmlns="http://www.w3.org/2000/svg" 
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
//                               </svg>
//                             ))}
//                           </div>
//                           <span className="text-xs text-gray-500 ml-1">(128)</span>
//                         </div>
//                         <p className="text-sm text-rose-600 font-semibold">$24.00</p>
//                       </div>
//                       <button className="px-3 py-1 h-8 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-md text-sm">
//                         View
//                       </button>
//                     </div>
                    
//                     <div className="flex items-center gap-3">
//                       <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                         <Image src="/api/placeholder/64/64" alt="Foundation" className="w-full h-full object-cover" width={64} height={64} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-gray-900 truncate">Silk Finish Foundation</p>
//                         <div className="flex items-center">
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <svg 
//                                 key={i} 
//                                 className={`h-3 w-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
//                                 xmlns="http://www.w3.org/2000/svg" 
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
//                               </svg>
//                             ))}
//                           </div>
//                           <span className="text-xs text-gray-500 ml-1">(86)</span>
//                         </div>
//                         <p className="text-sm text-rose-600 font-semibold">$32.00</p>
//                       </div>
//                       <button className="px-3 py-1 h-8 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-md text-sm">
//                         View
//                       </button>
//                     </div>
                    
//                     <div className="flex items-center gap-3">
//                       <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                         <Image src="/api/placeholder/64/64" alt="Eyeshadow" className="w-full h-full object-cover" width={64} height={64} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-gray-900 truncate">Everyday Eyeshadow Palette</p>
//                         <div className="flex items-center">
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <svg 
//                                 key={i} 
//                                 className={`h-3 w-3 ${i < 5 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
//                                 xmlns="http://www.w3.org/2000/svg" 
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
//                               </svg>
//                             ))}
//                           </div>
//                           <span className="text-xs text-gray-500 ml-1">(211)</span>
//                         </div>
//                         <p className="text-sm text-rose-600 font-semibold">$42.00</p>
//                       </div>
//                       <button className="px-3 py-1 h-8 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-md text-sm">
//                         View
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="p-4 border-t">
//                   <Link href="/shop" passHref>
//                     <button className="w-full py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md">
//                       Shop All Products
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Community events banner */}
//       <section className="relative z-10 bg-gradient-to-r from-rose-100 to-pink-100 mt-12">
//         <div className="container mx-auto px-6 py-12">
//           <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
//             <div className="md:w-1/2">
//               <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Beauty Events</h2>
//               <p className="text-gray-700 mb-6">
//                 Connect with beauty enthusiasts, learn from experts, and discover new techniques in our virtual and in-person beauty events.
//               </p>
//               <button className="px-4 py-2 bg-white text-rose-600 hover:bg-gray-100 rounded-md font-medium flex items-center">
//                 Explore Events
//                 <ChevronRight className="h-4 w-4 ml-2" />
//               </button>
//             </div>
//             <div className="md:w-1/2">
//               <div className="bg-white p-5 rounded-xl shadow-md">
//                 <div className="mb-4 bg-rose-50 text-rose-600 px-3 py-1 rounded-full inline-block text-sm font-medium">
//                   Upcoming
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">Summer Beauty Trends Masterclass</h3>
//                 <p className="text-gray-700 mb-4">
//                   Learn how to create the perfect summer glow with our expert makeup artists.
//                 </p>
//                 <div className="flex items-center text-gray-500 text-sm mb-4">
//                   <span>June 15, 2023 • 6:00 PM EST</span>
//                 </div>
//                 <button className="w-full py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-md font-medium">
//                   Register Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
      
//       {/* Footer */}
//       <footer className="bg-white border-t">
//         <div className="container mx-auto px-6 py-12">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <ShoppingBag className="h-6 w-6 text-rose-500" />
//                 <span className="text-xl font-bold text-gray-900">acquired.beauty</span>
//               </div>
//               <p className="text-gray-600 mb-4">
//                 Your beauty, your way. Find products that match your unique beauty needs.
//               </p>
//               <div className="flex space-x-4">
//                 <button className="p-2 text-gray-600 hover:text-rose-500 rounded-full hover:bg-gray-100">
//                   <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
//                   </svg>
//                 </button>
//                 <button className="p-2 text-gray-600 hover:text-rose-500 rounded-full hover:bg-gray-100">
//                   <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
//                   </svg>
//                 </button>
//                 <button className="p-2 text-gray-600 hover:text-rose-500 rounded-full hover:bg-gray-100">
//                   <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
//                   </svg>
//                 </button>
//                 <button className="p-2 text-gray-600 hover:text-rose-500 rounded-full hover:bg-gray-100">
//                   <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
//                   </svg>
//                 </button>
//               </div>
//             </div>
            
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
//               <ul className="space-y-2">
//                 <li><Link href="/shop" className="text-gray-600 hover:text-rose-500">All Products</Link></li>
//                 <li><Link href="/shop?category=blush" className="text-gray-600 hover:text-rose-500">Blush</Link></li>
//                 <li><Link href="#" className="text-gray-600 hover:text-rose-500">New Arrivals</Link></li>
//                 <li><Link href="#" className="text-gray-600 hover:text-rose-500">Bestsellers</Link></li>
//                 <li><Link href="#" className="text-gray-600 hover:text-rose-500">Gift Cards</Link></li>
//               </ul>
//             </div>
            
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
//               <ul className="space-y-2">
//                 <li><Link href="#" className="text-gray-600 hover:text-rose-500">About Us</Link></li>
//                 <li><Link href="/community" className="text-gray-600 hover:text-rose-500">Community</Link></li>
//                 <li><Link href="#" className="text-gray-600 hover:text-rose-500">Careers</Link></li>
//                 <li><Link href="/privacy" className="text-gray-600 hover:text-rose-500">Privacy Policy</Link></li>
//                 <li><Link href="/terms" className="text-gray-600 hover:text-rose-500">Terms of Service</Link></li>
//               </ul>
//             </div>
            
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Stay Updated</h3>
//               <p className="text-gray-600 mb-4">Subscribe to our newsletter for beauty tips and exclusive offers.</p>
//               <div className="flex gap-2">
//                 <input
//                   type="email"
//                   placeholder="Your email"
//                   className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
//                 />
//                 <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-medium">
//                   Subscribe
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
//             <p>© 2023 Acquired Beauty. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }