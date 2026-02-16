'use client';

import React, { useEffect, useState } from 'react';
import { Post } from '@/types';
import { postService } from '@/services/post.service';
import PostCard from '@/components/feed/PostCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MyLikesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikedPosts = async () => {
    try {
      setIsLoading(true);
      const data = await postService.getMyLikedPosts();
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load liked posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((current) =>
      current.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  return (
    <div className='min-h-screen bg-black'>
      <div className='max-w-125 mx-auto px-4 py-6'>
        <h1 className='text-2xl font-bold text-white mb-6'>My Likes</h1>

        {isLoading ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='w-8 h-8 animate-spin text-white' />
          </div>
        ) : posts.length > 0 ? (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
            ))}
          </div>
        ) : (
          <div className='text-center py-10'>
            <p className='text-neutral-400'>No liked posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
