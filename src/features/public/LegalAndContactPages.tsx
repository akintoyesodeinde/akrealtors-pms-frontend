import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Flag, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import type {
  AbuseReasonCategory,
  AbuseTargetType,
  CreateAbuseReportRequest,
} from '../../api/contracts';
import { customerApi } from '../../api/customerApi';
import { SeoHead } from '../../components/ui/SeoHead';
import { useAuth } from '../auth/useAuth';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SeoHead
        title="Privacy Policy (NDPA 2023)"
        canonicalPath="/privacy"
        description="AkRealtors PMS privacy notice aligned with the Nigeria Data Protection Act (NDPA) 2023."
      />
      <article className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <header className="border-b border-slate-200 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Nigeria Data Protection Act (NDPA) 2023 Notice
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026</p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Data Controller &amp; Lawful Basis</h2>
          <p>
            AkRealtors PMS processes personal information strictly necessary to operate a verified
            multi-realtor property marketplace in accordance with the Nigeria Data Protection Act
            (NDPA) 2023—including contract performance (customer enquiries, viewing requests,
            realtor onboarding), legal compliance, and fraud prevention.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            2. Strict Isolation of Verification Documents &amp; Private Addresses
          </h2>
          <p>
            Identity cards, CAC incorporation documents, marketing mandates, and title evidence
            uploaded for verification are stored in a private object storage bucket without public
            URLs. Access is restricted via short-lived, audited presigned URLs strictly to the
            uploading owner and the assigned verification reviewer. Exact internal property street
            numbers (<code>private_address</code>) are never exposed in public discovery responses.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Session &amp; Credential Security</h2>
          <p>
            Passwords are stored exclusively using salted adaptive BCrypt hashing. Short-lived
            access tokens are held in browser memory only (never persisted to{' '}
            <code>localStorage</code>), paired with rotated <code>HttpOnly</code> refresh cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Your Rights Under NDPA 2023</h2>
          <p>
            Data subjects may request access to, rectification of, or restriction/deactivation of
            their account data, subject to mandatory immutable audit retention for anti-fraud and
            moderation accountability.
          </p>
        </section>
      </article>
    </div>
  );
}

export function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SeoHead
        title="Terms of Use"
        canonicalPath="/terms"
        description="Marketplace governance, advertiser mandate obligations, and buyer due-diligence rules on AkRealtors PMS."
      />
      <article className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Marketplace Terms of Use
          </h1>
          <p className="text-xs text-slate-500 mt-1">Version 1.0 · October 2026</p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            1. Multi-Realtor Commercial Offer Model
          </h2>
          <p>
            AkRealtors PMS separates physical property catalogue records from commercial offers.
            Multiple authorized realtors or agencies may market distinct offers where permitted by
            the property owner’s mandate. Every rental or lease offer must explicitly declare its
            billing period (<code>MONTHLY</code>, <code>QUARTERLY</code>, or <code>YEARLY</code>).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            2. Non-Interchangeable Verification Tiers
          </h2>
          <p>
            Verification badges for Contact Email, Realtor Identity, Agency Corporate Registration,
            Marketing Authorization, and Independent Legal Title are distinct and non-interchangeable.
            Buyers and tenants must conduct independent physical inspection and legal title due
            diligence prior to transferring any funds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            3. Advertiser Conduct &amp; Moderation
          </h2>
          <p>
            Advertisers warrant that they hold valid authority to market listed properties and that
            uploaded media accurately represents the physical property. Material edits to a
            published offer automatically trigger re-moderation review. Fraudulent or unauthorized
            listings result in immediate suspension and permanent audit logging.
          </p>
        </section>
      </article>
    </div>
  );
}

export function ContactAndReportPage() {
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get('offerId') ?? '';
  const realtorId = searchParams.get('realtorId') ?? '';
  const agencyId = searchParams.get('agencyId') ?? '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <SeoHead
        title="Contact Support & Report Listing Concerns"
        canonicalPath="/contact"
        description="Contact AkRealtors PMS trust & safety or report suspicious listings, duplicate offers, or unauthorized advertisers."
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Trust, Support &amp; Abuse Reporting
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Report suspected listing misrepresentation, unauthorized mandates, duplicate spam, or
              impersonation directly to our moderation team.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-2">
          <div className="md:col-span-3 rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Flag className="w-4 h-4 text-rose-600" aria-hidden="true" />
              Report a Listing or Advertiser
            </div>
            <AbuseReportForm
              initialOfferId={offerId}
              initialRealtorId={realtorId}
              initialAgencyId={agencyId}
            />
          </div>

          <div className="md:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Mail className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              Trust &amp; Verification Desk
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For NDPA 2023 privacy enquiries, agency onboarding assistance, or urgent trust
              escalations, contact our compliance desk:
            </p>
            <p className="text-sm font-semibold text-emerald-800">trust@akrealtors.ng</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Never pay inspection, &ldquo;commitment&rdquo;, or agency fees into personal accounts
              before physically verifying a property and the advertiser&rsquo;s mandate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const REASON_OPTIONS: { value: AbuseReasonCategory; label: string }[] = [
  { value: 'FRAUD_OR_SCAM', label: 'Fraud or scam (e.g. advance fee requests)' },
  { value: 'MISLEADING_PRICE_OR_FEES', label: 'Misleading price or hidden fees' },
  { value: 'UNAUTHORIZED_MARKETING', label: 'Advertiser has no mandate to market this property' },
  { value: 'DUPLICATE_OR_SPAM', label: 'Duplicate listing or spam' },
  { value: 'INAPPROPRIATE_MEDIA', label: 'Inappropriate or copied photos/videos' },
  { value: 'IMPERSONATION', label: 'Impersonation of a realtor or agency' },
  { value: 'OTHER', label: 'Other concern' },
];

const abuseReportSchema = z
  .object({
    targetType: z.enum(['OFFER', 'REALTOR', 'AGENCY']),
    targetId: z.string().trim().uuid('Enter the reference ID shown on the listing or profile'),
    reasonCategory: z.enum([
      'FRAUD_OR_SCAM',
      'DUPLICATE_OR_SPAM',
      'MISLEADING_PRICE_OR_FEES',
      'UNAUTHORIZED_MARKETING',
      'INAPPROPRIATE_MEDIA',
      'IMPERSONATION',
      'OTHER',
    ]),
    details: z
      .string()
      .trim()
      .min(15, 'Please describe the concern in at least 15 characters')
      .max(3000),
    reporterName: z.string().trim().max(150).optional(),
    reporterEmail: z.string().trim().max(254).optional(),
    requireEmail: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.requireEmail) {
      const email = val.reporterEmail ?? '';
      if (!z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reporterEmail'],
          message: 'A valid email is required so moderators can follow up',
        });
      }
    }
  });

type AbuseReportFormValues = z.infer<typeof abuseReportSchema>;

function AbuseReportForm({
  initialOfferId,
  initialRealtorId,
  initialAgencyId,
}: {
  initialOfferId: string;
  initialRealtorId: string;
  initialAgencyId: string;
}) {
  const { isAuthenticated } = useAuth();
  const initialTargetType: AbuseTargetType = initialOfferId
    ? 'OFFER'
    : initialRealtorId
      ? 'REALTOR'
      : initialAgencyId
        ? 'AGENCY'
        : 'OFFER';

  const form = useForm<AbuseReportFormValues>({
    resolver: zodResolver(abuseReportSchema),
    defaultValues: {
      targetType: initialTargetType,
      targetId: initialOfferId || initialRealtorId || initialAgencyId,
      reasonCategory: 'FRAUD_OR_SCAM',
      details: '',
      reporterName: '',
      reporterEmail: '',
      requireEmail: !isAuthenticated,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: AbuseReportFormValues) => {
      const payload: CreateAbuseReportRequest = {
        targetType: values.targetType,
        reasonCategory: values.reasonCategory,
        details: values.details,
        targetOfferId: values.targetType === 'OFFER' ? values.targetId : undefined,
        targetRealtorId: values.targetType === 'REALTOR' ? values.targetId : undefined,
        targetAgencyId: values.targetType === 'AGENCY' ? values.targetId : undefined,
        reporterEmail: !isAuthenticated ? values.reporterEmail : undefined,
        reporterName: !isAuthenticated && values.reporterName ? values.reporterName : undefined,
      };
      return customerApi.submitAbuseReport(payload);
    },
  });

  if (mutation.isSuccess) {
    return (
      <div role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-1">
        <p className="text-sm font-semibold text-emerald-900">Report received — thank you.</p>
        <p className="text-xs text-emerald-800">
          Reference: <span className="font-mono">{mutation.data.id}</span>. Our trust &amp; safety
          moderators will investigate.
          {isAuthenticated
            ? ' You will receive an in-app notification when the report is resolved.'
            : ' We will follow up by email if more information is needed.'}
        </p>
      </div>
    );
  }

  const errors = form.formState.errors;
  const fieldClass =
    'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <form
      noValidate
      aria-label="Abuse report form"
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-xs font-semibold text-slate-700">
          What are you reporting?
          <select {...form.register('targetType')} className={fieldClass}>
            <option value="OFFER">Property listing</option>
            <option value="REALTOR">Realtor profile</option>
            <option value="AGENCY">Agency</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Reference ID
          <input {...form.register('targetId')} className={`${fieldClass} font-mono text-xs`} />
          {errors.targetId && (
            <span role="alert" className="block mt-1 text-rose-700 font-normal">
              {errors.targetId.message}
            </span>
          )}
        </label>
      </div>

      <label className="block text-xs font-semibold text-slate-700">
        Reason
        <select {...form.register('reasonCategory')} className={fieldClass}>
          {REASON_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold text-slate-700">
        Details
        <textarea {...form.register('details')} rows={4} maxLength={3000} className={fieldClass} />
        {errors.details && (
          <span role="alert" className="block mt-1 text-rose-700 font-normal">
            {errors.details.message}
          </span>
        )}
      </label>

      {!isAuthenticated && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-slate-700">
            Your name (optional)
            <input {...form.register('reporterName')} className={fieldClass} />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Your email
            <input {...form.register('reporterEmail')} type="email" className={fieldClass} />
            {errors.reporterEmail && (
              <span role="alert" className="block mt-1 text-rose-700 font-normal">
                {errors.reporterEmail.message}
              </span>
            )}
          </label>
        </div>
      )}

      {mutation.isError && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Unable to submit report. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
      >
        {mutation.isPending ? 'Submitting…' : 'Submit Report'}
      </button>
      {!isAuthenticated && (
        <p className="text-[11px] text-slate-500">
          <Link to="/login?redirect=%2Fcontact" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>{' '}
          to track your report and receive resolution updates.
        </p>
      )}
    </form>
  );
}
