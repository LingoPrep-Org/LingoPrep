'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { Role } from '@/lib/auth/types';
import { ROLE_HOMES } from '@/lib/auth/types';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
  allowed: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace(ROLE_HOMES[user.role]);
    }
  }, [user, isLoading, allowed, router]);

  if (isLoading || !user || !allowed.includes(user.role)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
