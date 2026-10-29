import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import { useAuth } from './useAuth';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email address is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function sanitizeInternalRedirect(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return raw;
  }
  return null;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const profile = await login(values);
      const explicitRedirect = sanitizeInternalRedirect(searchParams.get('redirect'));
      if (explicitRedirect) {
        navigate(explicitRedirect, { replace: true });
        return;
      }
      if (profile.roles.includes('PLATFORM_ADMIN') || profile.roles.includes('MODERATOR')) {
        navigate('/admin', { replace: true });
      } else if (profile.roles.includes('REALTOR') || profile.roles.includes('AGENCY_ADMIN')) {
        navigate('/realtor', { replace: true });
      } else {
        navigate('/portal', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError('Unable to sign in right now. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <SeoHead title="Sign In" canonicalPath="/login" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sign In to AkRealtors</h1>
          <p className="text-sm text-slate-600 mt-1">
            Access your saved properties, enquiries, realtor workspace, or moderation queue.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              aria-invalid={Boolean(errors.email)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={Boolean(errors.password)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60 transition"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
