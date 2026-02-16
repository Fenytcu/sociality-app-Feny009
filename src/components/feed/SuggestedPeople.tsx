'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SuggestedPeopleProps {
  onFollow?: () => void;
}

export default function SuggestedPeople({ onFollow }: SuggestedPeopleProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        // Search with empty query to get default suggestions from backend
        const results = await userService.searchUsers('');
        // Filter out users already being followed if needed, but searchUsers usually handles this
        // Limit to top 5 for the sidebar/header
        setUsers(results.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollow = async (username: string, userId: string) => {
    try {
      await userService.followUser(username);
      setFollowingIds(prev => new Set(prev).add(userId));
      toast.success(`Following @${username}`);
      if (onFollow) onFollow();
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-[#1C1C1E]/50 border border-neutral-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-bold text-base">Suggested People</h3>
        <Link href="/search" className="text-purple-500 text-xs font-bold hover:underline">
          See All
        </Link>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between group">
            <Link href={`/users/${user.username}`} className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10 ring-1 ring-neutral-800 transition-all group-hover:ring-purple-500/50">
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
                  {user?.name?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate max-w-[120px]">
                  {user?.name || user?.username}
                </span>
                <span className="text-[11px] text-neutral-500">@{user?.username}</span>
              </div>
            </Link>

            <Button
              size="sm"
              onClick={() => handleFollow(user.username, user.id)}
              disabled={followingIds.has(user.id)}
              className={`
                h-8 px-4 rounded-full text-xs font-bold transition-all
                ${followingIds.has(user.id)
                  ? 'bg-neutral-800 text-white cursor-default'
                  : 'bg-[#6936F2] hover:bg-[#5b2ed1] text-white shadow-lg shadow-purple-500/10'
                }
              `}
            >
              {followingIds.has(user.id) ? (
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" />
                  <span>Following</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.2">
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  <span>Follow</span>
                </div>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
