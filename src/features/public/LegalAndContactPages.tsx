import { Flag, Mail, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const { isAuthenticated } = useAuth();
  const offerId = searchParams.get('offerId') ?? '';

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Flag className="w-4 h-4 text-rose-600" aria-hidden="true" />
              Report a Listing or Advertiser
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {offerId
                ? `Reporting Offer Reference: ${offerId}. Sign in to submit a tracked abuse report with moderator resolution updates.`
                : 'Sign in to submit a tracked abuse report against a specific property offer, realtor, or agency.'}
            </p>
            <Link
              to={
                isAuthenticated
                  ? `/portal?action=report${offerId ? `&offerId=${offerId}` : ''}`
                  : `/login?redirect=${encodeURIComponent(
                      `/contact${offerId ? `?offerId=${offerId}` : ''}`,
                    )}`
              }
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              {isAuthenticated ? 'Open Tracked Abuse Report Form' : 'Sign In to Submit Report'}
            </Link>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Mail className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              Trust &amp; Verification Desk
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For NDPA 2023 privacy enquiries, agency onboarding assistance, or urgent trust
              escalations, contact our compliance desk:
            </p>
            <p className="text-sm font-semibold text-emerald-800">trust@akrealtors.ng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
