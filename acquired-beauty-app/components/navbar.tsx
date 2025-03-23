// Header Component for acquired.beauty based on Sephora design
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  ShoppingBag, 
  Search, 
  User,
  ShoppingCart,
  Menu,
  MapPin,
  Store
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Main navigation categories based on the screenshot
  const mainCategories = [
    'New', 
    'Brands', 
    'Makeup', 
    'Skincare', 
    'Hair', 
    'Fragrance', 
    'Tools & Brushes',
    'Bath & Body',
    'Mini Size',
    'Beauty Under $20',
    'Gifts & Gift Cards',
    'Sale & Offers'
  ];

  return (
    <>
      {/* Top header with logo, search, and account/cart */}
      <header className="w-full bg-white border-b">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-rose-500" />
              <span className="text-xl font-bold text-gray-900">acquired.beauty</span>
            </div>
          </Link>

          {/* Search bar - center aligned and expanded */}
          <div className="hidden md:block flex-grow mx-8 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-300 focus:border-rose-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Right side icons and store locator */}
          <div className="flex items-center gap-5">
            {/* Store & Services */}
            <div className="hidden md:flex items-center gap-1 text-sm">
              <Store size={18} />
              <div className="flex flex-col">
                <span className="font-medium">Stores & Services</span>
                <span className="text-xs text-gray-500">Your Local Store</span>
              </div>
            </div>

            {/* Community */}
            <Link href="/community" className="hidden md:flex items-center gap-1 text-sm">
              <div className="font-medium">Community</div>
            </Link>

            {/* Sign In */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm">
                <User size={18} />
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-medium">Sign In</span>
                  <span className="text-xs text-gray-500">for FREE Shipping 📦</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Orders</DropdownMenuItem>
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Loves/Wishlist */}
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart size={20} />
            </Button>

            {/* Shopping Bag with counter */}
            <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Bag">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-full px-4 py-2 rounded-md border border-gray-300"
                      />
                    </div>
                    <div className="space-y-3">
                      {mainCategories.map((category) => (
                        <Link 
                          key={category} 
                          href={`/${category.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block py-2 text-gray-800 hover:text-rose-500"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom navigation bar */}
      <nav className="hidden md:block w-full bg-black text-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between">
            {mainCategories.map((category) => (
              <li key={category}>
                <Link 
                  href={`/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block py-3 px-2 text-sm hover:text-rose-200 whitespace-nowrap"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}