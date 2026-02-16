'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Bookmark } from 'lucide-react';
import { postService } from '@/services/post.service';
import { Post } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      setIsLoading(true);
      try {
        const savedPosts = await postService.getMySavedPosts();
        setPosts(savedPosts);
      } catch (error) {
        console.error('Failed to load saved posts:', error);
        toast.error('Failed to load saved posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center py-20 bg-black min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black'>
      <div className='max-w-125 mx-auto'>
        {/* Header */}
        <div className='px-4 py-4 border-b border-neutral-900'>
          <h1 className='text-xl font-bold text-white'>Saved Posts</h1>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className='grid grid-cols-3 gap-px bg-neutral-900'>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className='aspect-square relative bg-black group cursor-pointer overflow-hidden'
              >
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.content}
                    fill
                    className='w-full h-full object-cover group-hover:opacity-80 transition-opacity'
                  />
                ) : (
                  <div className='w-full h-full bg-neutral-900 flex items-center justify-center'>
                    <span className='text-neutral-600 text-xs'>No Image</span>
                  </div>
                )}
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all' />
              </Link>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 px-4'>
            <Bookmark className='w-16 h-16 text-neutral-700 mb-4' />
            <h2 className='text-xl font-bold text-white mb-2'>
              No Saved Posts
            </h2>
            <p className='text-neutral-400 text-center text-sm'>
              Posts you save will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
