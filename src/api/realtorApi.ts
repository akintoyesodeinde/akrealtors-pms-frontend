import { httpClient } from './client';
import type {
  AgencyMembershipResponse,
  AgencyResponse,
  CreateAgencyRequest,
  CreateOfferRequest,
  CreatePropertyRequest,
  CreateVerificationCaseRequest,
  EnquiryStatus,
  EvidenceMetadataItem,
  EvidenceUploadIntentResponse,
  InviteAgencyMemberRequest,
  MediaKind,
  MediaUploadIntentRequest,
  MediaUploadIntentResponse,
  OfferPublicationState,
  OfferResponse,
  PrivateEvidenceAccessUrlResponse,
  PropertyMediaResponse,
  PropertyResponse,
  RealtorDashboardResponse,
  RealtorEnquiryResponse,
  RealtorProfileResponse,
  RealtorUpdateViewingRequestDto,
  UpdateAgencyMembershipRequest,
  UpdateAgencyRequest,
  UpdateOfferRequest,
  UpdateRealtorEnquiryRequest,
  UpsertRealtorProfileRequest,
  VerificationCaseResponse,
  ViewingRequestResponse,
  ViewingRequestStatus,
} from './contracts';
import { ApiClientError, type PageResponse } from './types';

export async function computeFileSha256Hex(file: Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function putPresignedObject(
  uploadUrl: string,
  httpMethod: string,
  requiredHeaders: Record<string, string>,
  file: Blob,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: httpMethod || 'PUT',
    headers: requiredHeaders,
    body: file,
  });

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      errorCode: 'OBJECT_STORAGE_UPLOAD_FAILED',
      detail: `Direct object storage upload failed with status ${response.status}`,
    });
  }
}

export const realtorApi = {
  // --- Realtor Profile & Dashboard ---
  async getOwnProfile(): Promise<RealtorProfileResponse> {
    const { data } = await httpClient.get<RealtorProfileResponse>('/realtor/profile');
    return data;
  },

  async upsertOwnProfile(payload: UpsertRealtorProfileRequest): Promise<RealtorProfileResponse> {
    const { data } = await httpClient.put<RealtorProfileResponse>('/realtor/profile', payload);
    return data;
  },

  async getDashboard(agencyId?: string): Promise<RealtorDashboardResponse> {
    const { data } = await httpClient.get<RealtorDashboardResponse>('/realtor/dashboard', {
      params: agencyId ? { agencyId } : undefined,
    });
    return data;
  },

  // --- Physical Property Catalogue ---
  async createProperty(payload: CreatePropertyRequest): Promise<PropertyResponse> {
    const { data } = await httpClient.post<PropertyResponse>('/realtor/properties', payload);
    return data;
  },

  async listManagedProperties(agencyId?: string): Promise<PropertyResponse[]> {
    const { data } = await httpClient.get<PropertyResponse[]>('/realtor/properties', {
      params: agencyId ? { agencyId } : undefined,
    });
    return data;
  },

  async getManagedProperty(propertyId: string): Promise<PropertyResponse> {
    const { data } = await httpClient.get<PropertyResponse>(`/realtor/properties/${propertyId}`);
    return data;
  },

  async updateProperty(
    propertyId: string,
    payload: Partial<CreatePropertyRequest>,
  ): Promise<PropertyResponse> {
    const { data } = await httpClient.patch<PropertyResponse>(
      `/realtor/properties/${propertyId}`,
      payload,
    );
    return data;
  },

  // --- Commercial Property Offers ---
  async createOffer(payload: CreateOfferRequest): Promise<OfferResponse> {
    const { data } = await httpClient.post<OfferResponse>('/realtor/offers', payload);
    return data;
  },

  async listManagedOffers(params?: {
    agencyId?: string;
    state?: OfferPublicationState;
    page?: number;
    size?: number;
  }): Promise<PageResponse<OfferResponse>> {
    const { data } = await httpClient.get<PageResponse<OfferResponse>>('/realtor/offers', {
      params,
    });
    return data;
  },

  async getManagedOffer(offerId: string): Promise<OfferResponse> {
    const { data } = await httpClient.get<OfferResponse>(`/realtor/offers/${offerId}`);
    return data;
  },

  async updateOffer(offerId: string, payload: UpdateOfferRequest): Promise<OfferResponse> {
    const { data } = await httpClient.patch<OfferResponse>(`/realtor/offers/${offerId}`, payload);
    return data;
  },

  async submitOffer(offerId: string): Promise<OfferResponse> {
    const { data } = await httpClient.post<OfferResponse>(`/realtor/offers/${offerId}/submit`, {});
    return data;
  },

  async archiveOffer(offerId: string): Promise<OfferResponse> {
    const { data } = await httpClient.post<OfferResponse>(`/realtor/offers/${offerId}/archive`, {});
    return data;
  },

  // --- Direct Presigned S3 Offer Media ---
  async listOfferMedia(offerId: string): Promise<PropertyMediaResponse[]> {
    const { data } = await httpClient.get<PropertyMediaResponse[]>(
      `/realtor/offers/${offerId}/media`,
    );
    return data;
  },

  async createOfferMediaUploadIntent(
    offerId: string,
    payload: MediaUploadIntentRequest,
  ): Promise<MediaUploadIntentResponse> {
    const { data } = await httpClient.post<MediaUploadIntentResponse>(
      `/realtor/offers/${offerId}/media/upload-intents`,
      payload,
    );
    return data;
  },

  async completeOfferMediaUpload(
    offerId: string,
    mediaId: string,
    sha256Checksum: string,
  ): Promise<PropertyMediaResponse> {
    const { data } = await httpClient.post<PropertyMediaResponse>(
      `/realtor/offers/${offerId}/media/complete`,
      { mediaId, sha256Checksum },
    );
    return data;
  },

  async uploadOfferMediaFile(
    offerId: string,
    file: File,
    sortOrder?: number,
    onStageChange?: (stage: 'INTENT' | 'UPLOADING' | 'VERIFYING') => void,
  ): Promise<PropertyMediaResponse> {
    const mediaKind: MediaKind = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    onStageChange?.('INTENT');
    const intent = await this.createOfferMediaUploadIntent(offerId, {
      mediaKind,
      originalFilename: file.name,
      contentType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size,
      sortOrder,
    });

    onStageChange?.('UPLOADING');
    const [sha256Checksum] = await Promise.all([
      computeFileSha256Hex(file),
      putPresignedObject(intent.uploadUrl, intent.httpMethod, intent.requiredHeaders, file),
    ]);

    onStageChange?.('VERIFYING');
    return this.completeOfferMediaUpload(offerId, intent.mediaId, sha256Checksum);
  },

  async selectCoverMedia(offerId: string, mediaId: string): Promise<PropertyMediaResponse> {
    const { data } = await httpClient.patch<PropertyMediaResponse>(
      `/realtor/offers/${offerId}/media/${mediaId}/cover`,
      {},
    );
    return data;
  },

  async deleteOfferMedia(offerId: string, mediaId: string): Promise<void> {
    await httpClient.delete(`/realtor/offers/${offerId}/media/${mediaId}`);
  },

  // --- Agencies & Staff Memberships ---
  async createAgency(payload: CreateAgencyRequest): Promise<AgencyResponse> {
    const { data } = await httpClient.post<AgencyResponse>('/agencies', payload);
    return data;
  },

  async listMyMemberships(): Promise<AgencyMembershipResponse[]> {
    const { data } = await httpClient.get<AgencyMembershipResponse[]>('/realtor/agencies');
    return data;
  },

  async getManagedAgency(agencyId: string): Promise<AgencyResponse> {
    const { data } = await httpClient.get<AgencyResponse>(`/agencies/${agencyId}/manage`);
    return data;
  },

  async updateAgency(agencyId: string, payload: UpdateAgencyRequest): Promise<AgencyResponse> {
    const { data } = await httpClient.patch<AgencyResponse>(`/agencies/${agencyId}`, payload);
    return data;
  },

  async listAgencyMembers(agencyId: string): Promise<AgencyMembershipResponse[]> {
    const { data } = await httpClient.get<AgencyMembershipResponse[]>(
      `/agencies/${agencyId}/members`,
    );
    return data;
  },

  async inviteAgencyMember(
    agencyId: string,
    payload: InviteAgencyMemberRequest,
  ): Promise<AgencyMembershipResponse> {
    const { data } = await httpClient.post<AgencyMembershipResponse>(
      `/agencies/${agencyId}/members`,
      payload,
    );
    return data;
  },

  async acceptAgencyInvitation(agencyId: string): Promise<AgencyMembershipResponse> {
    const { data } = await httpClient.post<AgencyMembershipResponse>(
      `/agencies/${agencyId}/members/accept`,
      {},
    );
    return data;
  },

  async updateAgencyMembership(
    agencyId: string,
    membershipId: string,
    payload: UpdateAgencyMembershipRequest,
  ): Promise<AgencyMembershipResponse> {
    const { data } = await httpClient.patch<AgencyMembershipResponse>(
      `/agencies/${agencyId}/members/${membershipId}`,
      payload,
    );
    return data;
  },

  // --- Verification Cases & Private Evidence ---
  async createVerificationCase(
    payload: CreateVerificationCaseRequest,
  ): Promise<VerificationCaseResponse> {
    const { data } = await httpClient.post<VerificationCaseResponse>(
      '/verification/cases',
      payload,
    );
    return data;
  },

  async listMyVerificationCases(): Promise<VerificationCaseResponse[]> {
    const { data } = await httpClient.get<VerificationCaseResponse[]>('/verification/cases/mine');
    return data;
  },

  async listAgencyVerificationCases(agencyId: string): Promise<VerificationCaseResponse[]> {
    const { data } = await httpClient.get<VerificationCaseResponse[]>(
      `/agencies/${agencyId}/verification-cases`,
    );
    return data;
  },

  async uploadVerificationEvidenceFile(
    caseId: string,
    documentType: string,
    file: File,
  ): Promise<EvidenceMetadataItem> {
    const { data: intent } = await httpClient.post<EvidenceUploadIntentResponse>(
      `/verification/cases/${caseId}/evidence/upload-intents`,
      {
        documentType,
        originalFilename: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
      },
    );

    const [sha256Checksum] = await Promise.all([
      computeFileSha256Hex(file),
      putPresignedObject(intent.uploadUrl, intent.httpMethod, intent.requiredHeaders, file),
    ]);

    const { data: completed } = await httpClient.post<EvidenceMetadataItem>(
      `/verification/cases/${caseId}/evidence/complete`,
      { evidenceId: intent.evidenceId, sha256Checksum },
    );
    return completed;
  },

  async getPrivateEvidenceAccessUrl(
    caseId: string,
    evidenceId: string,
  ): Promise<PrivateEvidenceAccessUrlResponse> {
    const { data } = await httpClient.get<PrivateEvidenceAccessUrlResponse>(
      `/verification/cases/${caseId}/evidence/${evidenceId}/access-url`,
    );
    return data;
  },

  // --- Realtor Enquiry & Viewing Inbox ---
  async listEnquiries(params?: {
    agencyId?: string;
    status?: EnquiryStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<RealtorEnquiryResponse>> {
    const { data } = await httpClient.get<PageResponse<RealtorEnquiryResponse>>(
      '/realtor/enquiries',
      { params },
    );
    return data;
  },

  async updateEnquiry(
    enquiryId: string,
    payload: UpdateRealtorEnquiryRequest,
  ): Promise<RealtorEnquiryResponse> {
    const { data } = await httpClient.patch<RealtorEnquiryResponse>(
      `/realtor/enquiries/${enquiryId}`,
      payload,
    );
    return data;
  },

  async listViewingRequests(params?: {
    agencyId?: string;
    status?: ViewingRequestStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<ViewingRequestResponse>> {
    const { data } = await httpClient.get<PageResponse<ViewingRequestResponse>>(
      '/realtor/viewing-requests',
      { params },
    );
    return data;
  },

  async respondToViewingRequest(
    viewingRequestId: string,
    payload: RealtorUpdateViewingRequestDto,
  ): Promise<ViewingRequestResponse> {
    const { data } = await httpClient.patch<ViewingRequestResponse>(
      `/realtor/viewing-requests/${viewingRequestId}`,
      payload,
    );
    return data;
  },
};
