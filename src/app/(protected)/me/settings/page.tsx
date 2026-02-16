'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, Bell, HelpCircle, Info, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          href: '/me/edit',
          description: 'Update your profile information',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          href: '#',
          description: 'Manage notification settings',
        },
        {
          icon: Lock,
          label: 'Privacy',
          href: '#',
          description: 'Control your privacy settings',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          href: '#',
          description: 'Get help with your account',
        },
        {
          icon: Info,
          label: 'About',
          href: '#',
          description: 'App version and information',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[500px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-neutral-900">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-6 border-b border-neutral-900">
            <Link href={`/users/${user.username}`} className="flex items-center gap-3 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0) || user.username?.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  {user.name}
                </h2>
                <p className="text-sm text-neutral-400">@{user.username}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Settings Sections */}
        <div className="py-2">
          {settingsSections.map((section, index) => (
            <div key={section.title}>
              <div className="px-4 py-3">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {section.title}
                </h3>
              </div>
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-neutral-900 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-neutral-500">{item.description}</p>
                  </div>
                </Link>
              ))}
              {index < settingsSections.length - 1 && (
                <div className="h-px bg-neutral-900 mx-4 my-2" />
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-4 py-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-500/10 hover:bg-red-500/20 transition-colors rounded-xl group"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-500">Logout</span>
          </button>
        </div>

        {/* App Info */}
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-neutral-600">Sociality v1.0.0</p>
          <p className="text-xs text-neutral-700 mt-1">© 2026 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
