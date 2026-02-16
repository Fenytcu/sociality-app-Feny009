'use client';

import { useEffect, useState, useCallback } from 'react';
import { Post, Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Heart, Bookmark, ArrowLeft } from 'lucide-react';
import CommentList from '../comment/CommentList';
import CommentInput from '../comment/CommentInput';
import Image from 'next/image';
import Link from 'next/link';
import { postService } from '@/services/post.service';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface PostDetailProps {
  post: Post;
  onClose?: () => void;
  className?: string;
}

export default function PostDetail({
  post: initialPost,
  onClose,
  className,
}: PostDetailProps) {
  // Safe Redux access
  const auth = useAppSelector((state) => state.auth);
  const user = auth?.user || null;
  const lastUpdated = auth?.lastUpdated;

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(
    initialPost?.isLiked || false
  );
  const [isSaved, setIsSaved] = useState<boolean>(
    initialPost?.isSaved || false
  );
  const [likesCount, setLikesCount] = useState<number>(
    initialPost?.likesCount || 0
  );

  // Sync state if initialPost changes
  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      setIsLiked(!!initialPost.isLiked);
      setIsSaved(!!initialPost.isSaved);
      setLikesCount(initialPost.likesCount || 0);
    }
  }, [initialPost]);

  const fetchComments = useCallback(async () => {
    if (!post?.id) return;
    try {
      setLoadingComments(true);
      const commentsData = await postService.getComments(post.id);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post?.id]);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id, fetchComments]);

  const handleLike = async () => {
    if (!post?.id) return;
    const prevState = isLiked;
    const prevCount = likesCount;

    try {
      const newLiked = !isLiked;
      setIsLiked(newLiked);
      setLikesCount(newLiked ? prevCount + 1 : Math.max(0, prevCount - 1));

      if (newLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }
    } catch {
      setIsLiked(prevState);
      setLikesCount(prevCount);
      toast.error('Failed to update like');
    }
  };

  const handleSave = async () => {
    if (!post?.id) return;
    const prevState = isSaved;

    try {
      const newSaved = !isSaved;
      setIsSaved(newSaved);

      if (newSaved) {
        await postService.savePost(post.id);
      } else {
        await postService.unsavePost(post.id);
      }
      toast.success(newSaved ? 'Post saved' : 'Post removed from saved');
    } catch {
      setIsSaved(prevState);
      toast.error('Failed to update save');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post?.id) return;

    try {
      const comment = await postService.addComment(post.id, newComment);
      if (comment) {
        setComments((prev) => [comment, ...prev]);
        setNewComment('');

        toast.success('Comment posted!');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // Safe Accessors
  const authorName = post?.author?.name || 'Unknown User';
  const authorUsername = post?.author?.username || 'unknown';
  const authorAvatar = post?.author?.avatar;
  // Use stable avatar for current user in comments
  const myAvatar = user?.avatar ? `${user.avatar}?t=${lastUpdated}` : undefined;

  // Safe Date handling
  let postDate = dayjs();
  try {
    if (post?.createdAt) {
      const parsed = dayjs(post.createdAt);
      if (parsed.isValid()) postDate = parsed;
    }
  } catch {
    postDate = dayjs();
  }

  return (
    <div
      className={`flex flex-col md:flex-row bg-black overflow-hidden ${className || 'w-full h-full'}`}
    >
      {/* --- DESKTOP VIEW (SPLIT) --- */}
      <div className='hidden md:flex w-full h-full max-w-300 mx-auto bg-black rounded-xl overflow-hidden border border-neutral-900 shadow-2xl'>
        {/* Left: Image */}
        <div className='flex-1 bg-black items-center justify-center relative flex border-r border-neutral-800'>
          {post.imageUrl ? (
            <div className='relative w-full h-full'>
              <Image
                src={post.imageUrl}
                alt='Post'
                fill
                className='object-contain'
                priority
              />
            </div>
          ) : (
            <div className='text-neutral-500'>No Image</div>
          )}
        </div>

        {/* Right: Details */}
        <div className='w-100 lg:w-112.5 bg-black flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-neutral-800'>
            <div className='flex items-center gap-3'>
              <Link href={`/users/${authorUsername}`}>
                <Avatar className='h-8 w-8 ring-1 ring-neutral-800'>
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback className='bg-purple-600 text-white font-bold text-xs'>
                    {authorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex flex-col'>
                <Link
                  href={`/users/${authorUsername}`}
                  className='font-bold text-white text-sm hover:underline leading-none mb-1'
                >
                  {authorUsername}
                </Link>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {onClose && (
                <button
                  onClick={onClose}
                  className='text-white hover:text-neutral-300 p-2 hover:bg-neutral-900 rounded-full transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto custom-scrollbar p-0'>
            {/* Caption as first item */}
            {post.content && (
              <div className='p-4 border-b border-neutral-900/50'>
                <div className='flex gap-3'>
                  <Avatar className='h-8 w-8 mt-1 shrink-0'>
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback className='bg-purple-600 text-white text-xs'>
                      {authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='text-sm'>
                    <span className='font-bold text-white mr-2'>
                      {authorUsername}
                    </span>
                    <span className='text-neutral-200 leading-relaxed'>
                      {post.content}
                    </span>
                    <p className='text-xs text-neutral-500 mt-2'>
                      {postDate.fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className='p-4'>
              <CommentList comments={comments} loading={loadingComments} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className='border-t border-neutral-800 bg-black p-4 z-10'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={handleLike}
                  className='group transition-transform active:scale-125'
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-neutral-400'}`}
                  />
                </button>
              </div>
              <button
                onClick={handleSave}
                className='group transition-transform active:scale-125'
              >
                <Bookmark
                  className={`w-6 h-6 transition-colors ${isSaved ? 'fill-white text-white' : 'text-white group-hover:text-neutral-400'}`}
                />
              </button>
            </div>
            <p className='font-bold text-white text-sm mb-1'>
              {(likesCount || 0).toLocaleString()} likes
            </p>
            <p className='text-[10px] text-neutral-500 uppercase tracking-wide mb-4'>
              {postDate.format('MMMM D, YYYY')}
            </p>

            {/* Input Area */}
            <div className='border-t border-neutral-800 pt-3'>
              <CommentInput
                value={newComment}
                onChange={setNewComment}
                onSubmit={handleCommentSubmit}
                authorUsername={authorUsername}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW (STACKED / SHEET STYLE) --- */}
      <div className='md:hidden flex flex-col w-full h-full bg-neutral-950 relative animate-in slide-in-from-bottom duration-300'>
        {/* Drag Handle (Visual only) */}
        <div className='w-full flex justify-center pt-3 pb-1 bg-neutral-950 rounded-t-xl'>
          <div className='w-12 h-1.5 bg-neutral-800 rounded-full' />
        </div>

        {/* Top Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-neutral-900/50 bg-neutral-950 z-20'>
          <h1 className='text-base font-bold text-white'>Comments</h1>
          <button
            onClick={onClose}
            className='text-neutral-400 hover:text-white p-1 rounded-full transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Scroll Content */}
        <div className='flex-1 overflow-y-auto custom-scrollbar pb-20 bg-neutral-950'>
          {/* Post Context Bar (Compact) */}
          <div className='flex gap-3 px-4 py-3 border-b border-neutral-900/50 bg-neutral-950'>
            <div className='w-8 h-8 shrink-0 relative rounded-full overflow-hidden bg-neutral-900 border border-neutral-800'>
               <Image
                 src={authorAvatar || '/assets/avatar-placeholder.png'}
                 alt={authorUsername}
                 fill
                 className='object-cover'
               />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-bold text-sm text-white truncate'>
                  {authorUsername}
                </span>
                <span className='text-xs text-neutral-500'>
                  {postDate.fromNow(true)}
                </span>
              </div>
               {post.content && (
                <p className='text-sm text-neutral-300 line-clamp-2 mt-0.5 leading-snug'>
                  {post.content}
                </p>
               )}
            </div>
          </div>

          {/* Comments List or Empty State */}
          <div className='p-4 min-h-[300px]'>
            {loadingComments ? (
               <CommentList comments={[]} loading={true} />
            ) : comments.length > 0 ? (
               <CommentList comments={comments} loading={false} />
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <p className='text-neutral-200 font-bold mb-1'>No Comments yet</p>
                <p className='text-neutral-500 text-sm'>Start the conversation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className='absolute bottom-0 left-0 w-full bg-neutral-950 border-t border-neutral-900 px-4 py-3 z-30 pb-safe'>
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleCommentSubmit}
            authorUsername={authorUsername}
          />
        </div>
      </div>
    </div>
  );
}
