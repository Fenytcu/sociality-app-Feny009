'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Post } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { postService } from '@/services/post.service';
import SuggestedPeople from '@/components/feed/SuggestedPeople';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  useAppSelector((state) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initial load
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Pagination load
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5; // Smaller chunks for smoother loading
  const fetchFeed = async (pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      const data = await postService.getFeed(pageNum, limit);

      if (data.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setPosts((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load feed:', error);
      toast.error('Failed to load feed.');
      if (pageNum === 1) setPosts([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const fetchNextPage = useCallback(() => {
    fetchFeed(page + 1);
  }, [page]);

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((current) =>
      current.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasMore || isLoading || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 } // Load when 10% of trigger is visible
    );

    const trigger = document.getElementById('scroll-trigger');
    if (trigger) observer.observe(trigger);

    return () => {
      if (trigger) observer.unobserve(trigger);
    };
  }, [hasMore, isLoading, isFetchingMore, posts, fetchNextPage]);

  return (
    <div className='min-h-screen bg-black pb-24'>
      {' '}
      {/* Added padding bottom for mobile nav space */}
      <div className='max-w-125 mx-auto px-4 md:px-0'>
        <div className='pt-4 md:pt-8'>
          {/* Header/Title */}
          <h1 className='text-2xl font-bold text-white mb-6 px-1'>Feed</h1>

          {isLoading ? (
            <div className='flex justify-center py-10'>
              <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
            </div>
          ) : posts.length > 0 ? (
            <div className='space-y-1'>
              {/* Also show suggestions even if there are posts, maybe between posts or at top */}
              <SuggestedPeople onFollow={() => fetchFeed(1)} />

              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={handlePostUpdate}
                />
              ))}

              {/* Infinite Scroll Trigger & Loader */}
              <div
                id='scroll-trigger'
                className='h-20 flex justify-center items-center'
              >
                {isFetchingMore && (
                  <Loader2 className='w-6 h-6 animate-spin text-purple-500' />
                )}
                {!hasMore && (
                  <p className='text-neutral-500 text-sm'>
                    You&apos;ve reached the end!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-20 px-4 text-center'>
              <SuggestedPeople onFollow={() => fetchFeed(1)} />

              <div className='mt-8 scale-110'>
                <div className='w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 mx-auto'>
                  <Search className='w-8 h-8 text-neutral-600' />
                </div>
                <h2 className='text-xl font-bold text-white mb-2'>
                  Build your timeline
                </h2>
                <p className='text-neutral-500 text-sm mb-8 max-w-70'>
                  Follow people to see their latest posts and updates here.
                </p>
                <Link href='/search'>
                  <Button className='bg-[#6936F2] hover:bg-[#5b2ed1] text-white px-8 h-12 rounded-full font-bold shadow-xl shadow-purple-500/20'>
                    Find Friends
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
