'use client';

import { RoleGuard } from '@/components/layout/role-guard';
import { LearnerHeader } from '@/components/layout/learner-header';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={['LEARNER']}>
      <div className="flex min-h-screen flex-col bg-background">
        <LearnerHeader />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
