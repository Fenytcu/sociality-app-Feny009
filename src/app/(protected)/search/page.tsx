'use client';

import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import { toast } from 'sonner';

import { useDebounce } from '@/hooks/use-debounce';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        setIsLoading(true);
        const users = await userService.searchUsers(debouncedQuery);
        setResults(users);
      } catch (error) {
        console.error('Search failed:', error);
        toast.error('Failed to search users');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleFollowToggle = async (username: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(username);
      } else {
        await userService.followUser(username);
      }

      // Update local state
      setResults((current) =>
        current.map((user) =>
          user.username === username
            ? { ...user, isFollowing: !isFollowing }
            : user
        )
      );
    } catch (error) {
      console.error('Follow toggle failed:', error);
      toast.error('Failed to update follow status');
    }
  };

  return (
    <div className='min-h-screen bg-black'>
      <div className='max-w-125 mx-auto px-4 py-4'>
        {/* Search Input with Close Button */}
        <div className='relative mb-6 flex items-center gap-3'>
          <div className='relative flex-1'>
            <Image
              src='/assets/search.png'
              alt='Search'
              width={20}
              height={20}
              className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50'
            />
            <Input
              placeholder='Search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className='pl-12 h-12 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500 focus-visible:ring-offset-0 focus-visible:border-purple-500 rounded-full'
            />
          </div>

          {/* Close Button - Mobile */}
          <button
            onClick={() => router.back()}
            className='md:hidden shrink-0 w-10 h-10 flex items-center justify-center text-white hover:text-neutral-400 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='flex justify-center py-10'>
            <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
          </div>
        )}

        {/* Results */}
        {!isLoading && isSearching && results.length > 0 && (
          <div className='space-y-4 pt-2'>
            {results.map((user) => (
              <div key={user.id} className='flex items-center justify-between'>
                <Link
                  href={`/users/${user.username}`}
                  className='flex items-center gap-4 flex-1'
                >
                  <Avatar className='h-14 w-14 ring-1 ring-neutral-800'>
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      className='object-cover'
                    />
                    <AvatarFallback className='bg-purple-600 text-white font-bold text-lg'>
                      {user.name?.charAt(0).toUpperCase() ||
                        user.username?.charAt(0).toUpperCase() ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-[16px] font-bold text-white leading-tight'>
                      {user.name || user.username}
                    </span>
                    <span className='text-sm text-neutral-500 mt-0.5'>
                      @{user.username}
                    </span>
                  </div>
                </Link>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollowToggle(
                      user.username,
                      user.isFollowing || false
                    );
                  }}
                  className={`
                    px-6 py-2 h-auto rounded-full text-sm font-bold transition-all
                    ${
                      user.isFollowing
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                        : 'bg-[#6936F2] text-white hover:bg-[#6941C6]'
                    }
                  `}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && isSearching && results.length === 0 && (
          <div className='flex flex-col items-center justify-center py-32 text-center'>
            <h3 className='text-xl font-bold text-white mb-2'>
              No results found
            </h3>
            <p className='text-sm text-neutral-500'>Change your keyword</p>
          </div>
        )}

        {/* Initial Search Icon */}
        {!isSearching && (
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <div className='p-8 bg-neutral-900/30 rounded-full mb-6'>
              <Image
                src='/assets/search.png'
                alt='Search'
                width={80}
                height={80}
                className='w-20 h-20 opacity-10'
              />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>Pencarian</h3>
            <p className='text-sm text-neutral-500 max-w-60 mx-auto'>
              Cari teman kamu dengan menggunakan nama atau username mereka.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
