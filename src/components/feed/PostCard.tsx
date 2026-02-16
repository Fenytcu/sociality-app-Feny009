'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Post } from '@/types';
import { postService } from '@/services/post.service';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LikesModal from './LikesModal';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const router = useRouter();
  
  // Defensive early return if post is missing
  if (!post) return null;

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const handleShowLikes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likesCount > 0) {
      setShowLikesModal(true);
    }
  };


  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    
    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      if (newIsLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }

      // Update parent component if callback provided
      if (onUpdate) {
        onUpdate({
          ...post,
          isLiked: newIsLiked,
          likesCount: newLikesCount,
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like');
      
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(post.likesCount);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newIsSaved = !isSaved;
    
    // Optimistic update
    setIsSaved(newIsSaved);

    try {
      if (newIsSaved) {
        await postService.savePost(post.id);
        toast.success('Post saved');
      } else {
        await postService.unsavePost(post.id);
        toast.success('Post removed from saved');
      }

      if (onUpdate) {
        onUpdate({
          ...post,
          isSaved: newIsSaved,
        });
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
      toast.error('Failed to save post');
      
      // Revert on error
      setIsSaved(!newIsSaved);
    }
  };

  const handleShare = () => {
    toast.info('Share feature coming soon!');
  };

  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author?.username) {
      router.push(`/users/${post.author.username}`);
    }
  };

  return (
    <div className="bg-black border-b border-neutral-900 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar 
          className="h-11 w-11 cursor-pointer" 
          onClick={navigateToProfile}
        >
          <AvatarImage src={post.author?.avatar} alt={post.author?.name} />
          <AvatarFallback className="bg-purple-600 text-white font-semibold text-base">
            {post.author?.name?.charAt(0).toUpperCase() || post.author?.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p 
            className="text-[16px] font-bold text-white cursor-pointer hover:underline leading-tight"
            onClick={navigateToProfile}
          >
            {post.author?.username}
          </p>
          <p className="text-xs text-neutral-400 leading-tight">
            {dayjs(post.createdAt).fromNow()}
          </p>
        </div>
      </div>

      {/* Image */}
        <div className="w-full px-4 mb-4">
          <div className="relative aspect-square md:aspect-auto w-full overflow-hidden rounded-xl border border-neutral-900">
            <Link href={`/posts/${post.id}`} className="block w-full h-full">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                style={{ maxHeight: '500px' }}
              />
            </Link>
          </div>
        </div>

      {/* Actions */}
      <div className="px-4">
        <div className="border-t border-dashed border-neutral-800/50 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 group">
              <button 
                onClick={handleLike}
                className="transition-transform active:scale-125 duration-200"
              >
                <Image 
                  src="/assets/Like Icon.png" 
                  alt="Like" 
                  width={20} 
                  height={20} 
                  className={`w-5 h-5 transition-all ${isLiked ? 'brightness-125' : 'invert brightness-0 invert opacity-60 group-hover:opacity-100'}`} 
                />
              </button>
              <button 
                onClick={handleShowLikes}
                className="text-white text-sm font-bold hover:underline"
              >
                {likesCount || 0}
              </button>
            </div>
            
            <Link 
              href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 group"
            >
              <Image 
                src="/assets/Comment Icon.png" 
                alt="Comment" 
                width={20} 
                height={20} 
                className="w-5 h-5 invert brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity" 
              />
              <span className="text-white text-sm font-bold">{post.commentsCount}</span>
            </Link>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 group"
            >
              <Image 
                src="/assets/Share Icon.png" 
                alt="Share" 
                width={20} 
                height={20} 
                className="w-5 h-5 invert brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity" 
              />
              <span className="text-white text-sm font-bold">{post.sharesCount || 0}</span>
            </button>
          </div>

          <button 
            onClick={handleSave}
            className="group"
          >
            <Image 
              src="/assets/Save.png" 
              alt="Save" 
              width={20} 
              height={20} 
              className={`w-5 h-5 transition-all ${isSaved ? 'brightness-125' : 'invert brightness-0 invert opacity-60 group-hover:opacity-100'}`} 
            />
          </button>
        </div>
      </div>

      {/* Caption Section */}
      <div className="px-4 pt-3 pb-4">
        <div className="text-[14px] leading-relaxed">
          <span 
            className="font-bold text-white mr-2 cursor-pointer hover:underline"
            onClick={navigateToProfile}
          >
            {post.author?.username}
          </span>
          <span className="text-neutral-300">
            {post.content ? (
              post.content.length > 100 ? (
                <>
                  {post.content.slice(0, 100)}...
                  <Link 
                    href={`/posts/${post.id}`}
                    className="ml-1 text-[#7F51F9] font-bold hover:underline"
                  >
                    Show More
                  </Link>
                </>
              ) : (
                post.content
              )
            ) : (
              <span className="italic opacity-50">No caption</span>
            )}
          </span>
        </div>
      </div>
      {/* Likes Modal */}
      <LikesModal 
        postId={post.id}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
      />
    </div>
  );
}
