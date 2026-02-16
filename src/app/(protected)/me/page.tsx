'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Post, User } from '@/types';
import { userService } from '@/services/user.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { postService } from '@/services/post.service';

export default function MePage() {
  const router = useRouter();
  const { user: authUser, lastUpdated } = useAppSelector((state) => state.auth);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'likes'>(
    'posts'
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getMe();
        setUser(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile');
        // Fallback to auth user if API fails
        if (authUser) {
          setUser(authUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsContentLoading(true);
        if (activeTab === 'posts') {
          const data = await userService.getUserPosts(authUser?.username || '');
          setPosts(data);
        } else if (activeTab === 'saved') {
          const data = await userService.getSavedPosts();
          setSavedPosts(data);
        } else if (activeTab === 'likes') {
          const data = await postService.getMyLikedPosts();
          setLikedPosts(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    if (user) fetchContent();
  }, [activeTab, user, authUser]);

  const handlePostClick = (post: Post) => {
    router.push(`/posts/${post.id}`);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    toast.success('Profile updated successfully!');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-white' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <p className='text-neutral-400'>Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black'>
      <div className='max-w-125 mx-auto px-4 py-6'>
        {/* Profile Header */}
        <div className='flex flex-col items-center text-center mb-8'>
          <Avatar className='h-24 w-24 mb-4 border-2 border-neutral-700'>
            <AvatarImage
              src={
                user.avatar
                  ? `${user.avatar}?t=${lastUpdated}`
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
              }
              alt={user.username}
            />
            <AvatarFallback className='bg-neutral-800 text-2xl'>
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h1 className='text-2xl font-bold text-white mb-1'>{user.name}</h1>
          <p className='text-neutral-400 text-sm mb-4'>@{user.username}</p>

          {user.bio && (
            <p className='text-white text-sm mb-4 max-w-md'>{user.bio}</p>
          )}

          {/* Stats */}
          <div className='flex gap-8 mb-6'>
            <div className='text-center'>
              <p className='text-xl font-bold text-white'>
                {user.followersCount || 0}
              </p>
              <p className='text-xs text-neutral-400'>Followers</p>
            </div>
            <div className='text-center'>
              <p className='text-xl font-bold text-white'>
                {user.followingCount || 0}
              </p>
              <p className='text-xs text-neutral-400'>Following</p>
            </div>
            <div className='text-center'>
              <p className='text-xl font-bold text-white'>0</p>
              <p className='text-xs text-neutral-400'>Posts</p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3 w-full max-w-sm'>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className='flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold'
            >
              Edit Profile
            </Button>
            <Button
              variant='outline'
              className='border-neutral-700 text-white hover:bg-neutral-900'
            >
              <Settings className='w-5 h-5' />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-neutral-800 mb-6'>
          <div className='flex justify-around'>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'posts'
                  ? 'text-purple-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Posts
              {activeTab === 'posts' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500' />
              )}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'saved'
                  ? 'text-purple-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Saved
              {activeTab === 'saved' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500' />
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'likes'
                  ? 'text-purple-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Likes
              {activeTab === 'likes' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500' />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className='py-4'>
          {isContentLoading ? (
            <div className='flex justify-center py-10'>
              <Loader2 className='w-6 h-6 animate-spin text-purple-500' />
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-1'>
              {(activeTab === 'posts'
                ? posts
                : activeTab === 'saved'
                  ? savedPosts
                  : likedPosts
              ).map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className='aspect-square relative group overflow-hidden bg-neutral-900 cursor-pointer'
                >
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt='Post'
                      fill
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='flex items-center justify-center h-full text-neutral-500 text-xs text-center p-2'>
                      {post.content?.substring(0, 20)}...
                    </div>
                  )}
                </div>
              ))}

              {((activeTab === 'posts' && posts.length === 0) ||
                (activeTab === 'saved' && savedPosts.length === 0) ||
                (activeTab === 'likes' && likedPosts.length === 0)) &&
                !isContentLoading && (
                  <div className='col-span-3 py-20 text-center'>
                    <p className='text-neutral-500'>No {activeTab} yet</p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
