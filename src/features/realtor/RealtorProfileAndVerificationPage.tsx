import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileUp, ShieldCheck, UserCheck } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import type { VerificationCaseType } from '../../api/contracts';
import { marketplaceApi } from '../../api/marketplaceApi';
import { realtorApi } from '../../api/realtorApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import { formatDate } from '../../lib/formatters';
import { useRealtorScope } from './useRealtorScope';

const ALLOWED_EVIDENCE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function RealtorProfileAndVerificationPage() {
  const { selectedAgencyId, activeMemberships } = useRealtorScope();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [officeState, setOfficeState] = useState('Lagos');
  const [officeCity, setOfficeCity] = useState('');
  const [publicPhone, setPublicPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [operatingStates, setOperatingStates] = useState<string[]>(['Lagos']);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  const [caseType, setCaseType] = useState<VerificationCaseType>('REALTOR_IDENTITY');
  const [caseNotes, setCaseNotes] = useState('');
  const [documentTypeMap, setDocumentTypeMap] = useState<Record<string, string>>({});
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['realtor', 'profile'],
    queryFn: () => realtorApi.getOwnProfile(),
    retry: false,
  });

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setDisplayName(p.displayName);
    setLicenseNumber(p.licenseNumber ?? '');
    setBio(p.bio ?? '');
    setYearsOfExperience(p.yearsOfExperience !== null ? String(p.yearsOfExperience) : '');
    setSpecializations(p.specializations ?? '');
    setOfficeState(p.officeState ?? 'Lagos');
    setOfficeCity(p.officeCity ?? '');
    setPublicPhone(p.publicPhone ?? '');
    setWhatsappNumber(p.whatsappNumber ?? '');
    if (p.operatingStates.length > 0) {
      setOperatingStates(p.operatingStates);
    }
  }, [profileQuery.data]);

  const statesQuery = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: () => marketplaceApi.getStates(),
    staleTime: 300_000,
  });

  const myCasesQuery = useQuery({
    queryKey: ['verification', 'mine'],
    queryFn: () => realtorApi.listMyVerificationCases(),
  });

  const agencyCasesQuery = useQuery({
    queryKey: ['verification', 'agency', selectedAgencyId],
    queryFn: () => realtorApi.listAgencyVerificationCases(selectedAgencyId ?? ''),
    enabled: Boolean(selectedAgencyId),
  });

  const upsertProfileMutation = useMutation({
    mutationFn: () =>
      realtorApi.upsertOwnProfile({
        displayName: displayName.trim(),
        licenseNumber: licenseNumber.trim() || undefined,
        bio: bio.trim() || undefined,
        yearsOfExperience: yearsOfExperience !== '' ? Number(yearsOfExperience) : undefined,
        specializations: specializations.trim() || undefined,
        operatingStates,
        officeState: officeState || undefined,
        officeCity: officeCity.trim() || undefined,
        publicPhone: publicPhone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
      }),
    onSuccess: () => {
      setProfileSavedMsg('Professional realtor profile saved and onboarding status updated.');
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: () =>
      realtorApi.createVerificationCase({
        caseType,
        agencyId: caseType === 'AGENCY_CORPORATE' ? selectedAgencyId : undefined,
        notes: caseNotes.trim() || undefined,
      }),
    onSuccess: () => {
      setCaseNotes('');
      void queryClient.invalidateQueries({ queryKey: ['verification'] });
    },
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: ({
      caseId,
      docType,
      file,
    }: {
      caseId: string;
      docType: string;
      file: File;
    }) => realtorApi.uploadVerificationEvidenceFile(caseId, docType, file),
    onSuccess: () => {
      setEvidenceError(null);
      void queryClient.invalidateQueries({ queryKey: ['verification'] });
    },
    onError: (err) => {
      setEvidenceError(
        err instanceof ApiClientError
          ? err.message
          : 'Private verification document upload failed.',
      );
    },
  });

  const handleOpenEvidence = async (caseId: string, evidenceId: string) => {
    try {
      const res = await realtorApi.getPrivateEvidenceAccessUrl(caseId, evidenceId);
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setEvidenceError(
        err instanceof ApiClientError ? err.message : 'Unable to generate private access link.',
      );
    }
  };

  const handleEvidenceFile = (e: ChangeEvent<HTMLInputElement>, caseId: string) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEvidenceError(null);

    if (!ALLOWED_EVIDENCE_TYPES.has(file.type)) {
      setEvidenceError('Verification documents must be PDF, JPEG, PNG, or WEBP.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setEvidenceError('Document exceeds 20 MB maximum size.');
      return;
    }
    const docType = documentTypeMap[caseId]?.trim() || 'GOVERNMENT_ID_OR_CAC';
    uploadEvidenceMutation.mutate({ caseId, docType, file });
  };

  const toggleOperatingState = (stName: string) => {
    setOperatingStates((prev) =>
      prev.includes(stName) ? prev.filter((s) => s !== stName) : [...prev, stName],
    );
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(null);
    upsertProfileMutation.mutate();
  };

  const combinedCases = [
    ...(myCasesQuery.data ?? []),
    ...(agencyCasesQuery.data ?? []).filter(
      (ac) => !(myCasesQuery.data ?? []).some((mc) => mc.id === ac.id),
    ),
  ];

  return (
    <div className="space-y-8">
      <SeoHead title="Realtor Profile & Verification" canonicalPath="/realtor/profile" />

      {/* Professional Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              Professional Realtor Onboarding Profile
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Displayed on your public realtor profile and linked to your marketplace offers.
            </p>
          </div>
          {profileQuery.data && (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
              Identity: {profileQuery.data.identityVerificationStatus}
            </span>
          )}
        </div>

        {profileSavedMsg && (
          <p className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
            {profileSavedMsg}
          </p>
        )}
        {upsertProfileMutation.isError && (
          <p role="alert" className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700">
            {upsertProfileMutation.error instanceof ApiClientError
              ? upsertProfileMutation.error.message
              : 'Failed to save profile.'}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="realtor-display-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Public Display Name *
            </label>
            <input
              id="realtor-display-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Adekunle Properties Advisory"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="realtor-license" className="block text-xs font-semibold text-slate-700 mb-1">
              ESVARBON / LASRERA / REDAN Registration No.
            </label>
            <input
              id="realtor-license"
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Optional professional license number"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="realtor-bio" className="block text-xs font-semibold text-slate-700 mb-1">
            Professional Bio
          </label>
          <textarea
            id="realtor-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your real estate track record, market focus, and advisory services…"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="realtor-exp" className="block text-xs font-semibold text-slate-700 mb-1">
              Years of Experience
            </label>
            <input
              id="realtor-exp"
              type="number"
              min={0}
              max={70}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="realtor-public-phone" className="block text-xs font-semibold text-slate-700 mb-1">
              Public Enquiry Phone
            </label>
            <input
              id="realtor-public-phone"
              type="tel"
              value={publicPhone}
              onChange={(e) => setPublicPhone(e.target.value)}
              placeholder="+2348012345678"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="realtor-whatsapp" className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Business Number
            </label>
            <input
              id="realtor-whatsapp"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+2348012345678"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="realtor-office-state" className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Office State
            </label>
            <select
              id="realtor-office-state"
              value={officeState}
              onChange={(e) => setOfficeState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              {(statesQuery.data ?? [{ code: 'LA', name: 'Lagos' }]).map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="realtor-office-city" className="block text-xs font-semibold text-slate-700 mb-1">
              Office City
            </label>
            <input
              id="realtor-office-city"
              type="text"
              value={officeCity}
              onChange={(e) => setOfficeCity(e.target.value)}
              placeholder="e.g. Victoria Island"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="realtor-spec" className="block text-xs font-semibold text-slate-700 mb-1">
              Specializations
            </label>
            <input
              id="realtor-spec"
              type="text"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              placeholder="Luxury Residential, Commercial…"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        {(statesQuery.data ?? []).length > 0 && (
          <fieldset>
            <legend className="text-xs font-semibold text-slate-700 mb-1.5">
              Operating States Coverage
            </legend>
            <div className="flex flex-wrap gap-2">
              {(statesQuery.data ?? []).map((st) => {
                const active = operatingStates.includes(st.name);
                return (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => toggleOperatingState(st.name)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      active
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {st.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <button
          type="submit"
          disabled={upsertProfileMutation.isPending}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold"
        >
          {upsertProfileMutation.isPending ? 'Saving Profile…' : 'Save Realtor Profile'}
        </button>
      </form>

      {/* Verification Cases & Private S3 Evidence Uploader */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            Verification Cases &amp; Confidential Evidence
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Verification documents are uploaded to private S3 storage (never public CDN) and
            accessed only via audited short-lived presigned links.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCaseMutation.mutate();
          }}
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Open New Verification Case
          </h3>

          {createCaseMutation.isError && (
            <p role="alert" className="text-xs text-rose-700">
              {createCaseMutation.error instanceof ApiClientError
                ? createCaseMutation.error.message
                : 'Could not open verification case.'}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="vc-type" className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Tier
              </label>
              <select
                id="vc-type"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value as VerificationCaseType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="REALTOR_IDENTITY">Realtor Identity Verification</option>
                {selectedAgencyId && activeMemberships.length > 0 && (
                  <option value="AGENCY_CORPORATE">Agency Corporate CAC Verification</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="vc-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                Submission Notes
              </label>
              <input
                id="vc-notes"
                type="text"
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                placeholder="e.g. NIN slip / International Passport / CAC Certificate…"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createCaseMutation.isPending}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            {createCaseMutation.isPending ? 'Creating Case…' : 'Create Verification Case'}
          </button>
        </form>

        {evidenceError && (
          <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {evidenceError}
          </p>
        )}

        <div className="space-y-4">
          {combinedCases.length === 0 ? (
            <p className="text-xs text-slate-500">
              No verification cases submitted yet. Create a case above to upload identity or CAC
              documents.
            </p>
          ) : (
            combinedCases.map((vc) => (
              <div
                key={vc.id}
                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      {vc.caseType.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-slate-500">
                      Submitted {formatDate(vc.submittedAt)}
                      {vc.agencyName ? ` · Agency: ${vc.agencyName}` : ''}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      vc.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : vc.status === 'REJECTED' || vc.status === 'REVOKED'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {vc.status}
                  </span>
                </div>

                {vc.decisionReason && (
                  <p className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700">
                    <strong>Reviewer Note:</strong> {vc.decisionReason}
                  </p>
                )}

                {vc.evidence.length > 0 && (
                  <ul className="divide-y divide-slate-100 text-xs">
                    {vc.evidence.map((ev) => (
                      <li
                        key={ev.id}
                        className="py-2 flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>
                          <strong>{ev.documentType}</strong> — {ev.originalFilename} (
                          {ev.validationStatus})
                        </span>
                        {ev.validationStatus === 'READY' && (
                          <button
                            type="button"
                            onClick={() => void handleOpenEvidence(vc.id, ev.id)}
                            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Private Document
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {['SUBMITTED', 'UNDER_REVIEW'].includes(vc.status) && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      aria-label="Evidence document type"
                      value={documentTypeMap[vc.id] ?? ''}
                      onChange={(e) =>
                        setDocumentTypeMap((prev) => ({ ...prev, [vc.id]: e.target.value }))
                      }
                      placeholder="Doc type (e.g. NIN_SLIP, CAC_CERT, DEED)"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-64"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer">
                      <FileUp className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {uploadEvidenceMutation.isPending
                          ? 'Uploading…'
                          : 'Upload Private Evidence'}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        disabled={uploadEvidenceMutation.isPending}
                        onChange={(e) => handleEvidenceFile(e, vc.id)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
