'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/register')
    ) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    // You might want to render a loading spinner here
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  // If not authenticated and on a protected route, don't render anything while redirecting
  if (
    !isAuthenticated &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/register')
  ) {
    return null;
  }

  return <>{children}</>;
}
