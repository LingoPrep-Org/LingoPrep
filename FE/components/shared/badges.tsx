import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole, UserStatus } from '@/lib/types/user';
import { ROLE_LABELS, STATUS_LABELS } from '@/lib/types/user';

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: 'border-primary/20 bg-primary/10 text-primary',
  TEACHER: 'border-success/20 bg-success/10 text-success',
  LEARNER: 'border-warning/20 bg-warning/10 text-warning',
};

const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: 'border-success/20 bg-success/10 text-success',
  PENDING: 'border-warning/30 bg-warning/10 text-warning',
  LOCKED: 'border-destructive/20 bg-destructive/10 text-destructive',
  REJECTED: 'border-muted-foreground/20 bg-muted text-muted-foreground',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge
      variant="outline"
      className={cn('px-2 py-0.5 text-xs font-medium', ROLE_STYLES[role])}
    >
      {ROLE_LABELS[role]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn('px-2 py-0.5 text-xs font-medium', STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
