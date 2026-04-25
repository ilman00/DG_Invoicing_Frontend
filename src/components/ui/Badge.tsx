import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:     'bg-secondary text-secondary-foreground',
        draft:       'bg-muted text-muted-foreground',
        sent:        'bg-blue-50 text-blue-700',
        paid:        'bg-green-50 text-green-700',
        overdue:     'bg-red-50 text-red-700',
        active:      'bg-green-50 text-green-700',
        inactive:    'bg-muted text-muted-foreground',
        blocked:     'bg-red-50 text-red-700',
        individual:  'bg-purple-50 text-purple-700',
        business:    'bg-orange-50 text-orange-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
