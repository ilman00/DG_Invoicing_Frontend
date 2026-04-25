import  type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-lg border border-border bg-card text-card-foreground', className)} {...props} />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-5 border-b border-border', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-sm font-semibold text-foreground', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs text-muted-foreground mt-0.5', className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-5', className)} {...props} />
);
