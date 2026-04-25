import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex items-start justify-between px-8 pt-8 pb-6">
    <div>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
