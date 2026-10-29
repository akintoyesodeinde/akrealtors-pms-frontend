import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '../../api/authApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';

const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setServerError(null);
    setConfirmation(null);
    try {
      const res = await authApi.forgotPassword(values.email);
      setConfirmation(res.message);
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Unable to submit recovery request.',
      );
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <SeoHead title="Password Recovery" canonicalPath="/forgot-password" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <KeyRound className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Forgot Password</h1>
            <p className="text-xs text-slate-600">
              Request a single-use password reset link for your account.
            </p>
          </div>
        </div>

        {confirmation && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm"
          >
            {confirmation}
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1">
              Account Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Sending instructions…' : 'Send Recovery Link'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
