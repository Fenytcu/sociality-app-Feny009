'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Heart, Check, MessageSquare } from 'lucide-react';
import { userService } from '@/services/user.service';
import { useAppSelector } from '@/store/hooks';
import { User, Post } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser, lastUpdated } = useAppSelector(
    (state) => state.auth
  );

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>(
    'posts'
  );
  const [isLikedLoading, setIsLikedLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userData, userPosts] = await Promise.all([
          userService.getUserByUsername(username),
          userService.getUserPosts(username),
        ]);
        setUser(userData);
        setPosts(userPosts);
        setIsFollowing(userData.isFollowing || false);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      setIsFollowLoading(true);
      if (isFollowing) {
        await userService.unfollowUser(user.username);
        setUser({ ...user, followersCount: (user.followersCount || 1) - 1 });
      } else {
        await userService.followUser(user.username);
        setUser({ ...user, followersCount: (user.followersCount || 0) + 1 });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Follow toggle failed:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const fetchSavedPosts = useCallback(async () => {
    if (!isOwnProfile) return;

    try {
      const saved = await userService.getSavedPosts();
      setSavedPosts(saved);
    } catch (error) {
      console.error('Failed to load saved posts:', error);
      toast.error('Failed to load saved posts');
    }
  }, [isOwnProfile]);

  const fetchLikedPosts = useCallback(async () => {
    try {
      setIsLikedLoading(true);
      const liked = await userService.getUserLikes(username);
      setLikedPosts(liked);
    } catch (error) {
      console.error('Failed to load liked posts:', error);
      toast.error('Failed to load liked posts');
    } finally {
      setIsLikedLoading(false);
    }
  }, [username]);

  // Fetch saved posts when switching to saved tab
  useEffect(() => {
    if (activeTab === 'saved' && isOwnProfile && savedPosts.length === 0) {
      fetchSavedPosts();
    }
  }, [activeTab, isOwnProfile, fetchSavedPosts, savedPosts.length]);

  // Fetch liked posts when switching to liked tab
  useEffect(() => {
    if (activeTab === 'liked' && likedPosts.length === 0) {
      fetchLikedPosts();
    }
  }, [activeTab, fetchLikedPosts, likedPosts.length]);

  const handleShare = () => {
    toast.info('Share feature coming soon!');
  };

  const handlePostClick = (post: Post) => {
    router.push(`/posts/${post.id}`);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center py-20 bg-black min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='text-center py-20 bg-black min-h-screen text-neutral-400'>
        User not found
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Mobile Top Header */}
      <div className='md:hidden flex items-center justify-between p-4 border-b border-neutral-900 sticky top-0 bg-black z-50'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.back()}
            className='text-white hover:opacity-70 transition-opacity'
          >
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className='text-lg font-bold truncate max-w-50'>{user.name}</h1>
        </div>
        <Avatar className='h-9 w-9 border border-neutral-800'>
          <AvatarImage
            src={
              isOwnProfile
                ? user.avatar
                  ? `${user.avatar}?t=${lastUpdated}`
                  : undefined
                : user.avatar
            }
            alt={user.name}
            className='object-cover'
          />
          <AvatarFallback className='bg-purple-600 text-white font-bold text-xs'>
            {user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className='max-w-203 mx-auto pt-6 md:pt-12 px-4 md:px-0'>
        {/* Profile Info Section */}
        <div className='flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8'>
          <div className='flex items-center md:items-start gap-4 md:gap-8'>
            {/* Avatar */}
            <Avatar className='h-20 w-20 md:h-24 md:w-24 ring-2 ring-neutral-900 ring-offset-2 ring-offset-black'>
              <AvatarImage
                src={
                  isOwnProfile
                    ? user.avatar
                      ? `${user.avatar}?t=${lastUpdated}`
                      : undefined
                    : user.avatar
                }
                alt={user.username}
                className='object-cover'
              />
              <AvatarFallback className='bg-neutral-800 text-white text-2xl font-bold'>
                {user.name?.charAt(0) || user.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col'>
              <div className='flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-4'>
                <h1 className='text-xl md:text-2xl font-bold text-white leading-tight'>
                  {user.name}
                </h1>
                <p className='text-neutral-500 text-sm md:text-base leading-tight'>
                  @{user.username}
                </p>
              </div>

              {/* Bio - Desktop view */}
              <p className='hidden md:block text-sm text-neutral-300 leading-relaxed max-w-lg'>
                {user.bio || 'No bio yet.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3'>
            {isOwnProfile ? (
              <Link href='/me/edit'>
                <Button className='bg-transparent border border-neutral-800 hover:bg-neutral-900 text-white rounded-full px-8 h-10 font-bold transition-all'>
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <div className='flex items-center gap-2'>
                <Button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`
                    h-10 px-8 rounded-full text-sm font-bold transition-all min-w-31
                    ${
                      isFollowing
                        ? 'bg-transparent border border-neutral-800 text-white hover:bg-neutral-900'
                        : 'bg-[#6936F2] hover:bg-[#5b2ed1] text-white shadow-lg shadow-purple-500/20'
                    }
                  `}
                >
                  {isFollowLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : isFollowing ? (
                    <div className='flex items-center gap-2'>
                      <Check className='w-4 h-4' />
                      <span>Following</span>
                    </div>
                  ) : (
                    'Follow'
                  )}
                </Button>

                <button className='w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center hover:bg-neutral-900 transition-all group'>
                  <MessageSquare className='w-5 h-5 text-neutral-500 group-hover:text-white transition-colors' />
                </button>
              </div>
            )}

            <button
              onClick={handleShare}
              className='w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center hover:bg-neutral-900 transition-all group'
            >
              <Image
                src='/assets/Share Icon.png'
                alt='Share'
                width={20}
                height={20}
                className='w-5 h-5 invert opacity-70 group-hover:opacity-100 transition-opacity'
              />
            </button>
          </div>
        </div>

        {/* Bio - Mobile view */}
        <p className='md:hidden text-sm text-neutral-300 leading-relaxed mb-8'>
          {user.bio || 'No bio yet.'}
        </p>

        {/* Stats Grid - Vertical Stacks */}
        <div className='grid grid-cols-4 gap-4 mb-8 border-t border-b border-neutral-900/50 py-6 md:border-none md:py-0'>
          <div className='flex flex-col items-center md:items-start'>
            <span className='text-xl font-bold text-white'>{posts.length}</span>
            <span className='text-xs text-neutral-500 font-medium'>Post</span>
          </div>
          <div className="flex flex-col items-center md:items-start relative before:content-[''] before:absolute before:-left-3.75 before:top-1 before:bottom-1 before:w-px before:bg-neutral-900 md:before:hidden">
            <span className='text-xl font-bold text-white'>
              {user.followersCount || 0}
            </span>
            <span className='text-xs text-neutral-500 font-medium'>
              Followers
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start relative before:content-[''] before:absolute before:-left-3.75 before:top-1 before:bottom-1 before:w-px before:bg-neutral-900 md:before:hidden">
            <span className='text-xl font-bold text-white'>
              {user.followingCount || 0}
            </span>
            <span className='text-xs text-neutral-500 font-medium'>
              Following
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start relative before:content-[''] before:absolute before:-left-3.75 before:top-1 before:bottom-1 before:w-px before:bg-neutral-900 md:before:hidden">
            <span className='text-xl font-bold text-white'>
              {user.likesCount || 0}
            </span>
            <span className='text-xs text-neutral-500 font-medium'>Likes</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className='flex items-center justify-center border-t border-neutral-900'>
          <button
            onClick={() => setActiveTab('posts')}
            className={`
              flex flex-1 items-center justify-center gap-2 py-4 border-t-2 transition-all
              ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-neutral-500'}
            `}
          >
            <Image
              src='/assets/Gallery.png'
              alt='Gallery'
              width={20}
              height={20}
              className={`w-5 h-5 ${activeTab === 'posts' ? 'opacity-100' : 'opacity-40'} brightness-0 invert`}
            />
            <span className='text-sm font-bold uppercase tracking-wider'>
              Gallery
            </span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`
              flex flex-1 items-center justify-center gap-2 py-4 border-t-2 transition-all
              ${activeTab === 'liked' ? 'border-white text-white' : 'border-transparent text-neutral-500'}
            `}
          >
            <Heart
              className={`w-5 h-5 ${activeTab === 'liked' ? 'fill-white text-white' : 'text-neutral-500'}`}
            />
            <span className='text-sm font-bold uppercase tracking-wider'>
              Liked
            </span>
          </button>
        </div>

        {/* Post Grid */}
        <div className='pt-4 pb-24'>
          {activeTab === 'posts' && (
            <div className='grid grid-cols-3 gap-1 md:gap-4'>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className='aspect-square relative group overflow-hidden bg-neutral-900 rounded-lg cursor-pointer'
                  >
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt='Post'
                        fill
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full text-neutral-500 text-xs'>
                        No Image
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='col-span-3 py-20 text-center'>
                  <p className='text-neutral-500 italic'>No posts yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'liked' && (
            <div className='grid grid-cols-3 gap-1 md:gap-4'>
              {isLikedLoading ? (
                <div className='col-span-3 flex justify-center py-10'>
                  <Loader2 className='w-6 h-6 animate-spin text-purple-500' />
                </div>
              ) : likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className='aspect-square relative group overflow-hidden bg-neutral-900 rounded-lg cursor-pointer'
                  >
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt='Post'
                        fill
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full text-neutral-500 text-xs'>
                        No Image
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='col-span-3 py-20 text-center'>
                  <p className='text-neutral-500 italic'>No liked posts yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
