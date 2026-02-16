'use client';

import AuthGuard from '@/components/auth/AuthGuard';

import BottomNav from '@/components/layout/BottomNav';
import Navbar from '@/components/layout/Navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        {/* Unified Navigation (Handling both Mobile/Desktop) */}
        <Navbar />

        <main className="pt-0 pb-28 md:pt-0">
          {children}
        </main>

        {/* Bottom Navigation (Always Visible) */}
        <div>
          <BottomNav />
        </div>
      </div>
    </AuthGuard>
  );
}
