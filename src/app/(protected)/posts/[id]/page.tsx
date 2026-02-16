'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { postService } from '@/services/post.service';
import PostDetail from '@/components/post/PostDetail';
import { Loader2 } from 'lucide-react';
import { Post } from '@/types';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      postService
        .getPostById(id)
        .then((data) => setPost(data))
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
      </div>
    );
  }

  if (!post) {
    return (
      <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4'>
        <p>Post not found</p>
        <button
          onClick={() => router.back()}
          className='text-purple-500 hover:underline'
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <PostDetail
        post={post}
        onClose={() => router.back()}
        className='w-full h-screen md:h-90vh md:max-w-300 md:border md:border-neutral-800 md:rounded-xl'
      />
    </div>
  );
}
