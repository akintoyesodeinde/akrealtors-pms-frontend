import { CheckCircle2, MailCheck, Send } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import { useAuth } from './useAuth';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, refreshProfile } = useAuth();
  const initialToken = searchParams.get('token') ?? '';
  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const autoTriggered = useRef(false);

  const runVerify = async (rawToken: string) => {
    if (!rawToken.trim()) return;
    setStatus('loading');
    setMessage(null);
    try {
      const res = await authApi.verifyEmail(rawToken.trim());
      setStatus('verified');
      setMessage(res.message);
      if (isAuthenticated) {
        await refreshProfile().catch(() => undefined);
      }
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof ApiClientError
          ? err.message
          : 'Verification token is invalid or has expired.',
      );
    }
  };

  useEffect(() => {
    if (initialToken && !autoTriggered.current) {
      autoTriggered.current = true;
      void runVerify(initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runVerify(token);
  };

  const handleResend = async () => {
    try {
      const res = await authApi.resendVerification();
      setMessage(res.message);
    } catch (err) {
      setMessage(
        err instanceof ApiClientError ? err.message : 'Unable to resend verification email.',
      );
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <SeoHead title="Verify Email Address" canonicalPath="/verify-email" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MailCheck className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Email Verification</h1>
            <p className="text-xs text-slate-600">
              Confirm your contact email address on AkRealtors PMS.
            </p>
          </div>
        </div>

        {status === 'verified' ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{message ?? 'Email verified successfully.'}</span>
            </div>
            <Link
              to={isAuthenticated ? '/portal' : '/login'}
              className="inline-block font-semibold text-emerald-800 underline"
            >
              {isAuthenticated ? 'Continue to Portal →' : 'Sign in to your account →'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                role="alert"
                className={`p-3 rounded-xl text-sm ${
                  status === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-900'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <label htmlFor="verify-token" className="block text-sm font-medium text-slate-700 mb-1">
                Verification Token
              </label>
              <input
                id="verify-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from verification email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60"
            >
              {status === 'loading' ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>
        )}

        {isAuthenticated && status !== 'verified' && (
          <button
            type="button"
            onClick={() => void handleResend()}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            Resend Verification Email
          </button>
        )}
      </div>
    </div>
  );
}
