import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  iconClassName?: string;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendType = 'neutral',
  iconClassName,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              iconClassName ?? 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <p
            className={cn(
              'mt-2 text-xs font-medium',
              trendType === 'positive' && 'text-success',
              trendType === 'negative' && 'text-destructive',
              trendType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
