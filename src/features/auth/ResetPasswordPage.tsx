import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '../../api/authApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';

const resetSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(10, 'New password must contain at least 10 characters')
      .max(128)
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
        message: 'New password must include both letters and digits',
      }),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: searchParams.get('token') ?? '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetFormValues) => {
    setServerError(null);
    try {
      const res = await authApi.resetPassword(values.token, values.newPassword);
      setCompletedMessage(res.message);
    } catch (err) {
      setServerError(
        err instanceof ApiClientError
          ? err.message
          : 'Reset token is invalid or has already been used.',
      );
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <SeoHead title="Reset Password" canonicalPath="/reset-password" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <LockKeyhole className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Set New Password</h1>
            <p className="text-xs text-slate-600">
              Resetting your password automatically revokes previous active sessions.
            </p>
          </div>
        </div>

        {completedMessage ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{completedMessage}</span>
            </div>
            <Link to="/login" className="inline-block font-semibold text-emerald-800 underline">
              Sign in with your new password →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {serverError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm"
              >
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="reset-token" className="block text-sm font-medium text-slate-700 mb-1">
                Recovery Token
              </label>
              <input
                id="reset-token"
                type="text"
                {...register('token')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              {errors.token && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {errors.token.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Password
              </label>
              <input
                id="reset-new-password"
                type="password"
                autoComplete="new-password"
                {...register('newPassword')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              {errors.newPassword && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Updating password…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
