'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  // Custom underscore debounce if hook not present, but better to create hook.
  // For now I'll implement simple effect debounce
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setUsers([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await userService.searchUsers(debouncedQuery);
        setUsers(results);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  return (
    <div className='max-w-xl mx-auto py-6'>
      <h1 className='text-2xl font-bold mb-6'>Find People</h1>

      <div className='relative mb-8'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4' />
        <Input
          placeholder='Search by name or username...'
          className='pl-9'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className='flex justify-center'>
          <Loader2 className='w-6 h-6 animate-spin text-primary' />
        </div>
      ) : (
        <div className='space-y-4'>
          {users.length > 0
            ? users.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors'
                >
                  <Link
                    href={`/users/${user.username}`}
                    className='flex items-center gap-3'
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-semibold text-sm'>{user.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                  {/* Follow button placeholder - to be implemented */}
                  <Button variant='outline' size='sm'>
                    View
                  </Button>
                </div>
              ))
            : debouncedQuery && (
                <p className='text-center text-muted-foreground'>
                  No users found.
                </p>
              )}
        </div>
      )}
    </div>
  );
}
