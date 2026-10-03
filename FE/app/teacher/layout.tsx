'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { RoleGuard } from '@/components/layout/role-guard';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={['TEACHER']}>
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  );
}
