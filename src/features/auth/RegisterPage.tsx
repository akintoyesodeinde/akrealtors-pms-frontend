import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import { useAuth } from './useAuth';

const passwordField = z
  .string()
  .min(10, 'Password must contain at least 10 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
    message: 'Password must include both letters and digits',
  });

const customerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phoneNumber: z.string().trim().max(32).optional(),
  password: passwordField,
});

const realtorSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phoneNumber: z.string().trim().min(7, 'Phone number is required for realtor onboarding').max(32),
  displayName: z.string().trim().min(2, 'Professional display name is required').max(150),
  licenseNumber: z.string().trim().max(80).optional(),
  yearsOfExperience: z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) <= 70), {
      message: 'Years of experience must be between 0 and 70',
    }),
  bio: z.string().trim().max(2000).optional(),
  password: passwordField,
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type RealtorFormValues = z.infer<typeof realtorSchema>;

export function RegisterPage() {
  const { registerCustomer, registerRealtor } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'realtor' ? 'realtor' : 'customer';
  const [serverError, setServerError] = useState<string | null>(null);

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phoneNumber: '', password: '' },
  });

  const realtorForm = useForm<RealtorFormValues>({
    resolver: zodResolver(realtorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      displayName: '',
      licenseNumber: '',
      yearsOfExperience: '',
      bio: '',
      password: '',
    },
  });

  const switchTab = (tab: 'customer' | 'realtor') => {
    setServerError(null);
    const next = new URLSearchParams(searchParams);
    if (tab === 'realtor') {
      next.set('tab', 'realtor');
    } else {
      next.delete('tab');
    }
    setSearchParams(next);
  };

  const handleCustomerSubmit = async (values: CustomerFormValues) => {
    setServerError(null);
    try {
      await registerCustomer({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber || undefined,
      });
      navigate('/portal', { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Unable to complete registration.',
      );
    }
  };

  const handleRealtorSubmit = async (values: RealtorFormValues) => {
    setServerError(null);
    try {
      await registerRealtor({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        displayName: values.displayName,
        licenseNumber: values.licenseNumber || undefined,
        yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : undefined,
        bio: values.bio || undefined,
      });
      navigate('/realtor', { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Unable to complete realtor registration.',
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <SeoHead title="Create Account" canonicalPath="/register" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Your AkRealtors Account</h1>
          <p className="text-sm text-slate-600 mt-1">
            Choose whether you are searching for property or onboarding as a professional realtor.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Account registration type"
          className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100"
        >
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'customer'}
            onClick={() => switchTab('customer')}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'customer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer / Seeker
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'realtor'}
            onClick={() => switchTab('realtor')}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'realtor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Realtor / Advertiser
          </button>
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

        {activeTab === 'customer' ? (
          <form
            onSubmit={customerForm.handleSubmit(handleCustomerSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="cust-first-name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="cust-first-name"
                  type="text"
                  {...customerForm.register('firstName')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {customerForm.formState.errors.firstName && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {customerForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="cust-last-name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="cust-last-name"
                  type="text"
                  {...customerForm.register('lastName')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {customerForm.formState.errors.lastName && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {customerForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="cust-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="cust-email"
                type="email"
                autoComplete="email"
                {...customerForm.register('email')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              {customerForm.formState.errors.email && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {customerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cust-phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="cust-phone"
                type="tel"
                placeholder="+2348012345678"
                {...customerForm.register('phoneNumber')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="cust-password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="cust-password"
                type="password"
                autoComplete="new-password"
                {...customerForm.register('password')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 10 characters with both letters and numbers.
              </p>
              {customerForm.formState.errors.password && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {customerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={customerForm.formState.isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60 transition"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              {customerForm.formState.isSubmitting
                ? 'Creating customer account…'
                : 'Register as Customer'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={realtorForm.handleSubmit(handleRealtorSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="realtor-first-name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="realtor-first-name"
                  type="text"
                  {...realtorForm.register('firstName')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {realtorForm.formState.errors.firstName && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {realtorForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="realtor-last-name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="realtor-last-name"
                  type="text"
                  {...realtorForm.register('lastName')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {realtorForm.formState.errors.lastName && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {realtorForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="realtor-display-name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Professional Display Name
              </label>
              <input
                id="realtor-display-name"
                type="text"
                placeholder="e.g. Adewale Ogunleye Realty"
                {...realtorForm.register('displayName')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              {realtorForm.formState.errors.displayName && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {realtorForm.formState.errors.displayName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="realtor-email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Business Email
                </label>
                <input
                  id="realtor-email"
                  type="email"
                  {...realtorForm.register('email')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {realtorForm.formState.errors.email && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {realtorForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="realtor-phone"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Business Phone Number
                </label>
                <input
                  id="realtor-phone"
                  type="tel"
                  placeholder="+2348012345678"
                  {...realtorForm.register('phoneNumber')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {realtorForm.formState.errors.phoneNumber && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {realtorForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="realtor-license"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Professional Registration / ESVARBON (Optional)
                </label>
                <input
                  id="realtor-license"
                  type="text"
                  {...realtorForm.register('licenseNumber')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="realtor-experience"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Years of Experience
                </label>
                <input
                  id="realtor-experience"
                  type="number"
                  min={0}
                  max={70}
                  {...realtorForm.register('yearsOfExperience')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {realtorForm.formState.errors.yearsOfExperience && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {realtorForm.formState.errors.yearsOfExperience.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="realtor-bio" className="block text-sm font-medium text-slate-700 mb-1">
                Professional Summary / Bio
              </label>
              <textarea
                id="realtor-bio"
                rows={3}
                placeholder="Describe your market specialization and operating areas…"
                {...realtorForm.register('bio')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="realtor-password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="realtor-password"
                type="password"
                autoComplete="new-password"
                {...realtorForm.register('password')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 10 characters with both letters and numbers.
              </p>
              {realtorForm.formState.errors.password && (
                <p className="text-xs text-rose-600 mt-1" role="alert">
                  {realtorForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={realtorForm.formState.isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60 transition"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              {realtorForm.formState.isSubmitting
                ? 'Onboarding realtor account…'
                : 'Register & Onboard as Realtor'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
