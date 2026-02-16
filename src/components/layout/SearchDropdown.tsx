'use client';

import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface SearchDropdownProps {
  results: User[];
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
}

export default function SearchDropdown({
  results,
  isLoading,
  isVisible,
  onClose,
}: SearchDropdownProps) {
  if (!isVisible) return null;

  return (
    <div className='absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[491px] bg-[#0A0A0A] border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 min-h-[100px] flex flex-col'>
      {isLoading ? (
        <div className='flex-1 flex flex-col items-center justify-center p-8'>
          <Loader2 className='w-6 h-6 animate-spin text-purple-500 mb-2' />
          <p className='text-sm text-neutral-500'>Loading results...</p>
        </div>
      ) : results.length > 0 ? (
        <div className='max-h-[400px] overflow-y-auto custom-scrollbar'>
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.username}`}
              onClick={onClose}
              className='flex items-center gap-3 px-4 py-3 hover:bg-neutral-900 transition-colors group'
            >
              <Avatar className='h-10 w-10 ring-1 ring-neutral-800 group-hover:ring-neutral-700 transition-all'>
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  className='object-cover'
                />
                <AvatarFallback className='bg-purple-600 text-white font-bold text-sm'>
                  {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-sm font-bold text-white group-hover:text-purple-400 transition-colors'>
                  {user.name || user.username}
                </span>
                <span className='text-xs text-neutral-500 leading-none mt-1'>
                  @{user.username}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='flex-1 flex flex-col items-center justify-center p-10 text-center'>
          <h3 className='text-white font-bold text-base mb-1'>
            No results found
          </h3>
          <p className='text-xs text-neutral-500'>Change your keyword</p>
        </div>
      )}
    </div>
  );
}
