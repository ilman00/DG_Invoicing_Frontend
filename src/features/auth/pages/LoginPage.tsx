import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { authApi } from '../../../api/auth.api';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      navigate('/dashboard', { replace: true });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? 'Invalid email or password';
      setError('root', { message });
    },
  });

  const onSubmit = (data: LoginForm) => mutate(data);

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
            <h1 className="text-base font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}

            <Button type="submit" className="w-full" loading={isPending}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
