'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50">
      {/* <SidebarTrigger /> */}
      
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Design Element */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-rose-100 rounded-bl-[30%] opacity-30" />
        
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center h-full">
          {/* Text Content */}
          <div className="md:w-1/2 z-10">
            <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl mb-6 text-gray-900 leading-tight">
              <span className="text-rose-600">acquired</span>.beauty
            </h1>
            <h2 className="text-2xl md:text-3xl mb-6 text-gray-700 font-light italic">
              Discover your perfect match
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Personalized beauty recommendations tailored specifically for you. Let our beauty matching 
              algorithm find products that complement your unique style and enhance your natural beauty.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <Button 
                onClick={() => router.push("/login")}
                className="px-8 py-6 text-lg bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Log in
              </Button>
               */}
              <Button 
                onClick={() => router.push("/quiz")}
                className="px-8 py-6 text-lg bg-white hover:bg-gray-50 text-rose-500 border border-rose-300 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
          
          {/* Image/Visual Element */}
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center z-10">
            <div className="relative w-full max-w-md">
              {/* Decorative elements */}
              <div className="absolute -top-8 -left-8 w-64 h-64 rounded-full bg-pink-200 opacity-40 blur-md" />
              <div className="absolute -bottom-12 -right-8 w-48 h-48 rounded-full bg-rose-300 opacity-40 blur-md" />
              
              {/* Product Image Grid */}
              <div className="relative grid grid-cols-2 gap-4 p-6 bg-white/90 backdrop-blur-sm rounded-[15%] shadow-xl border border-rose-100">
                <div className="aspect-square relative rounded-[15%] overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-300 to-purple-300" />
                </div>
                <div className="aspect-square relative rounded-[15%] overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-rose-200" />
                </div>
                <div className="aspect-square relative rounded-[15%] overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200" />
                </div>
                <div className="aspect-square relative rounded-[15%] overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-200" />
                </div>
                
                {/* Center brand logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
                    <div className="text-rose-500 font-bold text-4xl">AB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Acquired Beauty?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We help you find beauty products that are perfect for your unique features
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-500 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Matches</h3>
            <p className="text-gray-600">Find products that complement your unique features and preferences</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-500 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Curated Collections</h3>
            <p className="text-gray-600">Expertly selected products that work beautifully together</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-500 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-600">Beauty tips and tutorials to enhance your natural beauty</p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-rose-500 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to discover your perfect beauty match?</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Take our quick beauty quiz and get personalized recommendations in minutes.
          </p>
          <Button 
            onClick={() => router.push("/quiz")}
            className="px-8 py-6 text-lg bg-white hover:bg-gray-100 text-rose-500 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Start Your Beauty Journey
          </Button>
        </div>
      </div>
    </div>
  );
}