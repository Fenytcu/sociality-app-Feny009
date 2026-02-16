import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Comment } from '@/types';
import { Loader2 } from 'lucide-react';

dayjs.extend(relativeTime);

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
}

export default function CommentList({ comments, loading }: CommentListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-neutral-500 text-sm">No comments yet.</p>
        <p className="text-neutral-600 text-xs mt-1">Start the conversation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment, index) => (
        <div key={comment.id || `comment-${index}`} className="flex gap-3 group items-start">
          <Link href={`/users/${comment.author?.username || 'unknown'}`} className="shrink-0 pt-1">
            <Avatar className="h-8 w-8 ring-1 ring-neutral-800">
              <AvatarImage src={comment.author?.avatar} />
              <AvatarFallback className="bg-neutral-800 text-white text-xs">
                {comment.author?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 text-sm">
             <div className="flex items-center gap-2 mb-0.5">
               <Link href={`/users/${comment.author?.username || 'unknown'}`} className="font-bold text-white hover:underline text-sm">
                {comment.author?.username || 'Unknown'}
               </Link>
               <span className="text-[10px] text-neutral-500">{comment.createdAt ? dayjs(comment.createdAt).fromNow(true) : ''}</span>
             </div>
             <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
             
             {/* Reply/Like dummy actions to match design if needed, but keeping it clean for now as per previous cleanup */}
          </div>
        </div>
      ))}
    </div>
  );
}
