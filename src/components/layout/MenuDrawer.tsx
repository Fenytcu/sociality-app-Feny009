'use client';

import { useEffect } from 'react';
import { X, User, Settings, Bookmark, HelpCircle, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      toast.success('Logged out successfully');
      router.push('/login');
      onClose();
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: user ? `/users/${user.username}` : '/profile',
    },
    {
      icon: Bookmark,
      label: 'Saved Posts',
      href: '/me/saved',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/me/settings',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/help',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0A0A0A] border-l border-neutral-900 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-900">
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-6 border-b border-neutral-900">
            <Link
              href={`/users/${user.username}`}
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-16 w-16 border-2 border-purple-500">
                <AvatarImage
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                />
                <AvatarFallback className="bg-neutral-800 text-white text-lg">
                  {user.name?.charAt(0) || user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-white font-bold group-hover:text-purple-400 transition-colors">
                  {user.name}
                </span>
                <span className="text-neutral-400 text-sm">@{user.username}</span>
              </div>
            </Link>
          </div>
        )}

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-4 px-6 py-4 text-white hover:bg-neutral-900 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors" />
              <span className="font-medium group-hover:text-purple-400 transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 w-full text-red-500 hover:bg-red-500/10 transition-colors rounded-lg group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
