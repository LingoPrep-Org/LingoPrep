'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { RoleGuard } from '@/components/layout/role-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={['ADMIN']}>
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  );
}
