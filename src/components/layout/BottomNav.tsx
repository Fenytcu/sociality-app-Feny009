'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const isHomeActive = pathname === '/feed' || pathname.startsWith('/feed');
  const isProfileActive =
    pathname.startsWith(`/users/${user?.username}`) || pathname === '/profile';

  return (
    <nav className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-70'>
      <div className='bg-[#1C1C1E] backdrop-blur-md rounded-full h-15 px-6 flex items-center justify-between border border-white/10 shadow-2xl relative'>
        {/* Home */}
        <Link
          href='/feed'
          className={`flex flex-col items-center gap-0.5 transition-all hover:opacity-80 active:scale-95 ${
            isHomeActive ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className='relative w-6 h-6'>
            <Image
              src='/assets/Home.png'
              alt='Home'
              fill
              className='object-contain'
            />
          </div>
          <span className='text-[#7F51F9] text-[16px] font-bold'>Home</span>
        </Link>

        {/* Create Post - Center Purple Button */}
        <Link
          href='/posts/create'
          className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6936F2] hover:bg-[#5b2ed1] active:scale-90 transition-all rounded-full w-14 h-14 shadow-lg shadow-[#6936F2]/40 flex items-center justify-center p-0 border-4 border-black'
        >
          <div className='relative w-6 h-6'>
            <Image
              src='/assets/Add.png'
              alt='Add Post'
              fill
              className='object-contain brightness-0 invert'
            />
          </div>
        </Link>

        {/* Profile */}
        <Link
          href={user ? `/users/${user.username}` : '/profile'}
          className={`flex flex-col items-center gap-0.5 transition-all hover:opacity-80 active:scale-95 ${
            isProfileActive ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className='relative w-6 h-6'>
            <Image
              src='/assets/profile.png'
              alt='Profile'
              fill
              className='w-6 h-6 object-contain brightness-0 invert'
            />
          </div>
          <span className='text-white text-[16px] font-bold'>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
