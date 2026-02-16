'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { postService } from '@/services/post.service';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import Link from 'next/link';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export default function LikesModal({
  isOpen,
  onClose,
  postId,
}: LikesModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState<
    Record<string, boolean>
  >({});

  const fetchLikes = useCallback(async () => {
    try {
      setLoading(true);
      const likesData = await postService.getPostLikes(postId);
      setUsers(likesData);

      // Initialize following states
      const states: Record<string, boolean> = {};
      likesData.forEach((user) => {
        states[user.username] = user.isFollowing || false;
      });
      setFollowingStates(states);
    } catch (error) {
      console.error('Failed to fetch likes:', error);
      toast.error('Failed to load likes');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (isOpen && postId) {
      fetchLikes();
    }
  }, [isOpen, postId, fetchLikes]);

  const handleFollow = async (username: string) => {
    const isCurrentlyFollowing = followingStates[username];

    try {
      // Optimistic update
      setFollowingStates((prev) => ({
        ...prev,
        [username]: !isCurrentlyFollowing,
      }));

      if (isCurrentlyFollowing) {
        await userService.unfollowUser(username);
      } else {
        await userService.followUser(username);
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      toast.error('Failed to update follow status');

      // Revert on error
      setFollowingStates((prev) => ({
        ...prev,
        [username]: isCurrentlyFollowing,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center md:items-center md:justify-center'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile, card on desktop */}
      <div className='relative bg-[#0A0A0A] border-0 md:border md:border-[#181D27] md:rounded-2xl w-full h-full md:h-auto md:max-w-105 md:max-h-125 overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-[#181D27]'>
          <h2 className='text-xl font-bold text-white'>Likes</h2>
          <button
            onClick={onClose}
            className='text-neutral-400 hover:text-white transition-colors p-1'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* User List */}
        <div className='overflow-y-auto h-[calc(100%-60px)] md:max-h-110'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
            </div>
          ) : users.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-neutral-400'>No likes yet</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className='flex items-center justify-between px-6 py-4 hover:bg-neutral-900/50 transition-colors'
              >
                <Link
                  href={`/users/${user.username}`}
                  className='flex items-center gap-3 flex-1 min-w-0'
                  onClick={onClose}
                >
                  <Avatar className='h-12 w-12 border border-neutral-700'>
                    <AvatarImage
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      alt={user.username}
                    />
                    <AvatarFallback className='bg-purple-600 text-white font-semibold'>
                      {user.name?.charAt(0).toUpperCase() ||
                        user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-sm font-bold text-white truncate'>
                      {user.name}
                    </span>
                    <span className='text-xs text-neutral-400 truncate'>
                      @{user.username}
                    </span>
                  </div>
                </Link>

                {followingStates[user.username] ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleFollow(user.username);
                    }}
                    className='bg-transparent border border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600 rounded-full px-4 py-2 h-auto flex items-center gap-2 transition-all min-w-27.5 justify-center'
                  >
                    <Check className='w-4 h-4' />
                    <span className='font-semibold text-sm'>Following</span>
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleFollow(user.username);
                    }}
                    className='bg-[#6936F2] hover:bg-[#6941C6] text-white rounded-full px-6 py-2 h-auto font-semibold text-sm transition-all min-w-27.5'
                  >
                    Follow
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
