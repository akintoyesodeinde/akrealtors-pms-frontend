import { httpClient } from './client';
import type {
  AbuseReportResponse,
  AbuseReportStatus,
  AccountStatus,
  AdminDashboardResponse,
  AdminUserResponse,
  AgencyResponse,
  AgencyStatus,
  AmenityResponse,
  AuditLogResponse,
  CreateAmenityRequest,
  DuplicateOfferGroupResponse,
  ModerationDecisionRequest,
  OfferPublicationState,
  OfferResponse,
  PlatformSettingResponse,
  PrivateEvidenceAccessUrlResponse,
  ResolveAbuseReportRequest,
  UpdateAgencyStatusRequest,
  UpdateAmenityRequest,
  UpdateUserStatusRequest,
  VerificationCaseResponse,
  VerificationCaseStatus,
  VerificationCaseType,
  VerificationDecisionRequest,
} from './contracts';
import type { PageResponse } from './types';

export type OfferModerationAction = 'approve' | 'reject' | 'suspend' | 'reinstate';

export const adminApi = {
  async getDashboard(): Promise<AdminDashboardResponse> {
    const { data } = await httpClient.get<AdminDashboardResponse>('/admin/dashboard');
    return data;
  },

  // --- Offer moderation -----------------------------------------------------
  async listModerationOffers(params: {
    state?: OfferPublicationState;
    page?: number;
    size?: number;
  }): Promise<PageResponse<OfferResponse>> {
    const { data } = await httpClient.get<PageResponse<OfferResponse>>('/admin/moderation/offers', {
      params: { state: params.state, page: params.page ?? 0, size: params.size ?? 20 },
    });
    return data;
  },

  async getModerationOffer(offerId: string): Promise<OfferResponse> {
    const { data } = await httpClient.get<OfferResponse>(`/admin/moderation/offers/${offerId}`);
    return data;
  },

  async moderateOffer(
    offerId: string,
    action: OfferModerationAction,
    payload: ModerationDecisionRequest,
  ): Promise<OfferResponse> {
    const { data } = await httpClient.post<OfferResponse>(
      `/admin/moderation/offers/${offerId}/${action}`,
      payload,
    );
    return data;
  },

  async listDuplicateOffers(): Promise<DuplicateOfferGroupResponse[]> {
    const { data } = await httpClient.get<DuplicateOfferGroupResponse[]>(
      '/admin/moderation/duplicates',
    );
    return data;
  },

  // --- Verification queue ---------------------------------------------------
  async listVerificationCases(params: {
    caseType?: VerificationCaseType;
    status?: VerificationCaseStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<VerificationCaseResponse>> {
    const { data } = await httpClient.get<PageResponse<VerificationCaseResponse>>(
      '/admin/verification/cases',
      {
        params: {
          caseType: params.caseType,
          status: params.status,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      },
    );
    return data;
  },

  async assignVerificationCase(caseId: string): Promise<VerificationCaseResponse> {
    const { data } = await httpClient.post<VerificationCaseResponse>(
      `/admin/verification/cases/${caseId}/assign`,
      {},
    );
    return data;
  },

  async decideVerificationCase(
    caseId: string,
    payload: VerificationDecisionRequest,
  ): Promise<VerificationCaseResponse> {
    const { data } = await httpClient.post<VerificationCaseResponse>(
      `/admin/verification/cases/${caseId}/decision`,
      payload,
    );
    return data;
  },

  async getEvidenceAccessUrl(
    caseId: string,
    evidenceId: string,
  ): Promise<PrivateEvidenceAccessUrlResponse> {
    const { data } = await httpClient.get<PrivateEvidenceAccessUrlResponse>(
      `/verification/cases/${caseId}/evidence/${evidenceId}/access-url`,
    );
    return data;
  },

  // --- Abuse reports --------------------------------------------------------
  async listAbuseReports(params: {
    status?: AbuseReportStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AbuseReportResponse>> {
    const { data } = await httpClient.get<PageResponse<AbuseReportResponse>>(
      '/admin/abuse-reports',
      { params: { status: params.status, page: params.page ?? 0, size: params.size ?? 20 } },
    );
    return data;
  },

  async resolveAbuseReport(
    reportId: string,
    payload: ResolveAbuseReportRequest,
  ): Promise<AbuseReportResponse> {
    const { data } = await httpClient.patch<AbuseReportResponse>(
      `/admin/abuse-reports/${reportId}`,
      payload,
    );
    return data;
  },

  // --- Users & agencies -----------------------------------------------------
  async listUsers(params: {
    status?: AccountStatus;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminUserResponse>> {
    const { data } = await httpClient.get<PageResponse<AdminUserResponse>>('/admin/users', {
      params: {
        status: params.status,
        query: params.query || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return data;
  },

  async updateUserStatus(
    userId: string,
    payload: UpdateUserStatusRequest,
  ): Promise<AdminUserResponse> {
    const { data } = await httpClient.patch<AdminUserResponse>(
      `/admin/users/${userId}/status`,
      payload,
    );
    return data;
  },

  async listAgencies(params: {
    status?: AgencyStatus;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AgencyResponse>> {
    const { data } = await httpClient.get<PageResponse<AgencyResponse>>('/admin/agencies', {
      params: {
        status: params.status,
        query: params.query || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return data;
  },

  async updateAgencyStatus(
    agencyId: string,
    payload: UpdateAgencyStatusRequest,
  ): Promise<AgencyResponse> {
    const { data } = await httpClient.patch<AgencyResponse>(
      `/admin/agencies/${agencyId}/status`,
      payload,
    );
    return data;
  },

  // --- Amenities, settings, audit, outbox -----------------------------------
  async listAmenities(): Promise<AmenityResponse[]> {
    const { data } = await httpClient.get<AmenityResponse[]>('/admin/amenities');
    return data;
  },

  async createAmenity(payload: CreateAmenityRequest): Promise<AmenityResponse> {
    const { data } = await httpClient.post<AmenityResponse>('/admin/amenities', payload);
    return data;
  },

  async updateAmenity(amenityId: string, payload: UpdateAmenityRequest): Promise<AmenityResponse> {
    const { data } = await httpClient.patch<AmenityResponse>(
      `/admin/amenities/${amenityId}`,
      payload,
    );
    return data;
  },

  async listSettings(): Promise<PlatformSettingResponse[]> {
    const { data } = await httpClient.get<PlatformSettingResponse[]>('/admin/settings');
    return data;
  },

  async updateSetting(settingKey: string, settingValue: string): Promise<PlatformSettingResponse> {
    const { data } = await httpClient.put<PlatformSettingResponse>(
      `/admin/settings/${encodeURIComponent(settingKey)}`,
      { settingValue },
    );
    return data;
  },

  async listAuditLogs(params: {
    actionType?: string;
    targetType?: string;
    actorUserId?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AuditLogResponse>> {
    const { data } = await httpClient.get<PageResponse<AuditLogResponse>>('/admin/audit-logs', {
      params: {
        actionType: params.actionType || undefined,
        targetType: params.targetType || undefined,
        actorUserId: params.actorUserId || undefined,
        page: params.page ?? 0,
        size: params.size ?? 25,
      },
    });
    return data;
  },

  async triggerOutboxBatch(): Promise<{ processedCount: number }> {
    const { data } = await httpClient.post<{ processedCount: number }>('/admin/outbox/process', {});
    return data;
  },
};
