import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { authApi } from '../../../api/auth.api';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterForm) => {
      // strip confirmPassword before sending to API
      const { confirmPassword, ...payload } = data;
      return authApi.register(payload);
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      navigate('/dashboard', { replace: true });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? 'Registration failed. Please try again.';
      setError('root', { message });
    },
  });

  const onSubmit = (data: RegisterForm) => mutate(data);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Invoicing</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-base font-semibold text-foreground">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your organization and get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Organization name — first, since it's the top-level entity */}
            <Input
              id="organizationName"
              type="text"
              label="Organization name"
              placeholder="Acme Co."
              autoComplete="organization"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              id="name"
              type="text"
              label="Your name"
              placeholder="Ahmed Al-Rashid"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirm password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}

            <Button type="submit" className="w-full" loading={isPending}>
              Create account
            </Button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};