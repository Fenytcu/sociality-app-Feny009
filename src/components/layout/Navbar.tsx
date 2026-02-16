'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Menu, LogOut, User as UserIcon, X } from 'lucide-react';
import SearchDropdown from './SearchDropdown';
import MenuDrawer from './MenuDrawer';

export default function Navbar() {
  const { isAuthenticated, user, lastUpdated } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    setIsDropdownVisible(true);
    const debounceTimer = setTimeout(async () => {
      try {
        setIsSearchLoading(true);
        const users = await userService.searchUsers(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    router.push('/login');
  };

  return (
    <>
      <nav className='sticky top-0 z-50 w-full border-b border-[#181D27] bg-black'>
        <div className='flex h-15 md:h-20 items-center justify-between px-4 md:px-8 lg:px-12 w-full max-w-360 mx-auto'>
          {/* --- MOBILE: Left Logo --- */}
          <div className='md:hidden flex items-center'>
            <Link href='/feed' className='flex items-center gap-2.75'>
              <div className='relative w-8 h-8'>
                <Image
                  src='/assets/Logo.png'
                  alt='Sociality Logo'
                  fill
                  className='object-contain'
                  priority
                />
              </div>
              <span className='text-white text-lg font-bold tracking-tight'>
                Sociality
              </span>
            </Link>
          </div>

          {/* --- DESKTOP: Left Logo --- */}
          <Link href='/' className='hidden md:flex items-center gap-2 shrink-0'>
            <Image
              src='/assets/Logo.png'
              alt='Sociality Logo'
              width={32}
              height={32}
              className='w-8 h-8'
              priority
            />
            <span className='font-bold text-[24px] text-white whitespace-nowrap'>
              Sociality
            </span>
          </Link>

          {/* --- DESKTOP: Center Search --- */}
          <div className='hidden md:flex flex-1 max-w-150 mx-4 justify-center'>
            <div className='relative group'>
              <div className='absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none'>
                <Image
                  src='/assets/search.png'
                  alt='Search'
                  width={18}
                  height={18}
                  className={`w-4.5 h-4.5 transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-50'}`}
                />
              </div>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchQuery.trim().length >= 2 && setIsDropdownVisible(true)
                }
                placeholder='Search'
                className='pl-11 pr-10 w-122.75 h-12 bg-[#0A0A0A] border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500 focus-visible:ring-offset-0 focus-visible:border-neutral-700 rounded-full text-sm transition-all'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-4 top-1/2 -translate-y-1/2 z-10 text-neutral-500 hover:text-white transition-colors'
                >
                  <X className='w-4 h-4' />
                </button>
              )}

              <SearchDropdown
                results={searchResults}
                isLoading={isSearchLoading}
                isVisible={isDropdownVisible}
                onClose={() => {
                  setIsDropdownVisible(false);
                  setSearchQuery('');
                }}
              />
            </div>
          </div>

          {/* --- RIGHT ACTIONS --- */}
          <div className='flex items-center gap-3 md:gap-4 shrink-0'>
            {isAuthenticated ? (
              <>
                {/* Mobile: Search + Avatar + Menu */}
                <div className='flex md:hidden items-center gap-1.5'>
                  <Link
                    href='/search'
                    className='p-1.5 text-white hover:text-neutral-300 transition-colors rounded-full hover:bg-neutral-800'
                  >
                    <Search className='w-5 h-5' />
                  </Link>

                  <Link href={`/users/${user?.username}`} className='p-1'>
                    <Avatar
                      key={`${user?.avatar}-${user?.name}`}
                      className='h-8 w-8 border border-neutral-800'
                    >
                      <AvatarImage
                        src={
                          user?.avatar
                            ? `${user.avatar}?t=${lastUpdated}`
                            : undefined
                        }
                        alt={user?.name}
                        className='object-cover'
                      />
                      <AvatarFallback className='bg-purple-600 text-white font-bold text-xs uppercase'>
                        {user?.name?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className='p-1.5 text-white hover:text-neutral-300 transition-colors rounded-full hover:bg-neutral-800'
                  >
                    <Menu className='w-6 h-6' />
                  </button>
                </div>

                {/* Desktop: Profile Dropdown */}
                <div className='hidden md:block'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        className='relative h-auto w-auto gap-2 p-1 hover:bg-neutral-900 rounded-full pr-3'
                      >
                        <Avatar
                          key={`${user?.avatar}-${user?.name}`}
                          className='h-6 w-6 border border-neutral-700 cursor-pointer'
                        >
                          <AvatarImage
                            src={
                              user?.avatar
                                ? `${user.avatar}?t=${lastUpdated}`
                                : undefined
                            }
                            alt={user?.name}
                          />
                          <AvatarFallback className='bg-purple-600 text-white font-semibold text-xs'>
                            {user?.name?.charAt(0).toUpperCase() ||
                              user?.username?.charAt(0).toUpperCase() ||
                              'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-semibold text-sm text-white hidden md:block'>
                          {user?.name || user?.username}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className='w-56'
                      align='end'
                      forceMount
                    >
                      <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col space-y-1'>
                          <p className='text-sm font-medium leading-none'>
                            {user?.name}
                          </p>
                          <p className='text-xs leading-none text-muted-foreground'>
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/users/${user?.username}`)}
                      >
                        <UserIcon className='mr-2 h-4 w-4' />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className='text-red-600 focus:text-red-600'
                      >
                        <LogOut className='mr-2 h-4 w-4' />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              // Unauthenticated View
              <>
                <div className='flex md:hidden items-center gap-4'>
                  <Search className='w-5 h-5 text-neutral-400 cursor-not-allowed' />
                  <Menu className='w-6 h-6 text-white' />
                </div>

                <div className='hidden md:flex items-center gap-3'>
                  <Link href='/login'>
                    <Button
                      variant='ghost'
                      className='text-white hover:text-purple-400'
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href='/register'>
                    <Button className='bg-[#6936F2] hover:bg-[#6941C6] text-white rounded-full'>
                      Register
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
