'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
}

export function Placeholder({
  title,
  description,
  icon: Icon,
  className,
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-3">
        <span className="text-sm text-muted-foreground">
          [ Nội dung sẽ được triển khai ở bước tiếp theo ]
        </span>
      </div>
    </div>
  );
}
