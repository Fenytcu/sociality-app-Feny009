'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { postService } from '@/services/post.service';
import { userService } from '@/services/user.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface LikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LikesModal({
  postId,
  isOpen,
  onClose,
}: LikesModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>(
    {}
  );

  const fetchLikes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await postService.getPostLikes(postId);
      setUsers(data);
    } catch (e) {
      console.error('Failed to load likes:', e);
      toast.error('Failed to load likes list');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (isOpen && postId) {
      fetchLikes();
    }
  }, [isOpen, postId, fetchLikes]);

  const handleFollowToggle = async (user: User) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [user.id]: true }));

      if (user.isFollowing) {
        await userService.unfollowUser(user.username);
        setUsers((current) =>
          current.map((u) =>
            u.id === user.id ? { ...u, isFollowing: false } : u
          )
        );
      } else {
        await userService.followUser(user.username);
        setUsers((current) =>
          current.map((u) =>
            u.id === user.id ? { ...u, isFollowing: true } : u
          )
        );
      }
    } catch {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4'>
      <div
        className='w-full max-w-100 bg-[#121212] rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl animate-in fade-in zoom-in duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-neutral-800/50'>
          <h2 className='text-xl font-bold text-white'>Likes</h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-neutral-800 rounded-full transition-colors'
          >
            <X className='w-6 h-6 text-neutral-400' />
          </button>
        </div>

        {/* Content */}
        <div className='max-h-[70vh] overflow-y-auto custom-scrollbar'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-20 gap-4'>
              <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
              <p className='text-neutral-500 text-sm'>Loading people...</p>
            </div>
          ) : users.length > 0 ? (
            <div className='divide-y divide-neutral-900/50'>
              {users.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors group'
                >
                  <Link
                    href={`/users/${user.username}`}
                    onClick={onClose}
                    className='flex items-center gap-4 flex-1 min-w-0'
                  >
                    <Avatar className='h-12 w-12 border border-neutral-800 ring-2 ring-transparent group-hover:ring-purple-500/30 transition-all'>
                      <AvatarImage src={user.avatar} className='object-cover' />
                      <AvatarFallback className='bg-purple-600 text-white font-bold'>
                        {user.name?.charAt(0) || user.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col min-w-0'>
                      <span className='text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors'>
                        {user.name || user.username}
                      </span>
                      <span className='text-[12px] text-neutral-500 truncate'>
                        @{user.username}
                      </span>
                    </div>
                  </Link>

                  <Button
                    onClick={() => handleFollowToggle(user)}
                    disabled={followLoading[user.id]}
                    className={`
                      h-9 px-6 rounded-full text-xs font-bold transition-all
                      ${
                        user.isFollowing
                          ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                          : 'bg-[#6936F2] hover:bg-[#5b2ed1] text-white shadow-lg shadow-purple-500/10'
                      }
                    `}
                  >
                    {followLoading[user.id] ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    ) : user.isFollowing ? (
                      <div className='flex items-center gap-1.5'>
                        <Check className='w-3.5 h-3.5' />
                        <span>Following</span>
                      </div>
                    ) : (
                      'Follow'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-20 px-8 text-center gap-3'>
              <div className='w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center'>
                <Check className='w-8 h-8 text-neutral-600' />
              </div>
              <p className='text-neutral-400 text-sm'>No likes yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
