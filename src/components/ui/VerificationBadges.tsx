import { BadgeCheck, Building2, FileCheck2, Scale, ShieldAlert } from 'lucide-react';

interface VerificationPanelProps {
  contactEmailVerified?: boolean;
  realtorIdentityVerified?: boolean;
  agencyCorporateVerified?: boolean;
  marketingAuthorizationVerified: boolean;
  legalTitleVerified: boolean;
  advertiserType: 'REALTOR' | 'AGENCY';
}

/**
 * Explicitly distinguishes the 5 non-interchangeable verification tiers required by Part 14.
 * Never claims legal title ownership verification when only identity or mandate is verified.
 */
export function VerificationPanel({
  contactEmailVerified,
  realtorIdentityVerified,
  agencyCorporateVerified,
  marketingAuthorizationVerified,
  legalTitleVerified,
  advertiserType,
}: VerificationPanelProps) {
  const advertiserVerified =
    advertiserType === 'AGENCY' ? Boolean(agencyCorporateVerified) : Boolean(realtorIdentityVerified);

  return (
    <section
      aria-label="Verification transparency"
      className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Verification & Trust Breakdown</h3>
        <span className="text-xs text-slate-500">Non-interchangeable checks</span>
      </div>

      <ul className="space-y-2.5 text-sm">
        <li className="flex items-start gap-2.5">
          {advertiserType === 'AGENCY' ? (
            <Building2
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                advertiserVerified ? 'text-emerald-600' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
          ) : (
            <BadgeCheck
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                advertiserVerified ? 'text-emerald-600' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
          )}
          <div>
            <span className="font-medium text-slate-800">
              {advertiserType === 'AGENCY' ? 'Agency Corporate Registration: ' : 'Realtor Identity: '}
            </span>
            <span className={advertiserVerified ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {advertiserVerified ? 'Verified' : 'Unverified'}
            </span>
            {contactEmailVerified !== undefined && (
              <span className="text-xs text-slate-500 ml-2">
                (Contact email {contactEmailVerified ? 'verified' : 'unverified'})
              </span>
            )}
          </div>
        </li>

        <li className="flex items-start gap-2.5">
          <FileCheck2
            className={`w-4 h-4 mt-0.5 shrink-0 ${
              marketingAuthorizationVerified ? 'text-emerald-600' : 'text-slate-400'
            }`}
            aria-hidden="true"
          />
          <div>
            <span className="font-medium text-slate-800">Marketing Mandate / Authority to Advertise: </span>
            <span
              className={
                marketingAuthorizationVerified ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }
            >
              {marketingAuthorizationVerified ? 'Evidence Reviewed' : 'Not Submitted'}
            </span>
          </div>
        </li>

        <li className="flex items-start gap-2.5">
          <Scale
            className={`w-4 h-4 mt-0.5 shrink-0 ${
              legalTitleVerified ? 'text-emerald-600' : 'text-amber-500'
            }`}
            aria-hidden="true"
          />
          <div>
            <span className="font-medium text-slate-800">Independent Legal Title Verification: </span>
            <span className={legalTitleVerified ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
              {legalTitleVerified ? 'Title Verified' : 'Not Independently Verified'}
            </span>
          </div>
        </li>
      </ul>

      {!legalTitleVerified && (
        <p className="text-xs text-slate-600 flex items-start gap-1.5 pt-2 border-t border-slate-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Always conduct independent legal due diligence and physical inspection before paying rent,
            deposit, or purchase funds.
          </span>
        </p>
      )}
    </section>
  );
}
