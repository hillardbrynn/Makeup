
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  User,
  Heart,
  Sparkles,
  Settings,
  ShoppingBag,
  LogOut,
  History,
  HelpCircle,
  Gift
} from 'lucide-react';

export function SidebarNav({ className, ...props }) {
  return (
    <nav
      className={cn(
        "flex flex-col space-y-1",
        className
      )}
      {...props}
    >
      <Link
        href="/account"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <User className="h-4 w-4" />
        <span>My Account</span>
      </Link>
      <Link
        href="/quiz"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <Sparkles className="h-4 w-4" />
        <span>Beauty Quiz</span>
      </Link>
      <Link
        href="/wishlist"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <Heart className="h-4 w-4" />
        <span>Wishlist</span>
      </Link>
      <Link
        href="/orders"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>Orders</span>
      </Link>
      <Link
        href="/history"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <History className="h-4 w-4" />
        <span>Browsing History</span>
      </Link>
      <Link
        href="/rewards"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <Gift className="h-4 w-4" />
        <span>Rewards</span>
      </Link>
      <Link
        href="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <Settings className="h-4 w-4" />
        <span>Settings</span>
      </Link>
      <Link
        href="/help"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help & Support</span>
      </Link>
      <div className="pt-4">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-rose-100 hover:text-rose-900"
          onClick={() => {/* Add logout functionality */}}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}