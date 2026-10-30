import { httpClient } from './client';
import type {
  CreateEnquiryRequest,
  CreateViewingRequestDto,
  CustomerEnquiryResponse,
  CustomerUpdateViewingRequestDto,
  FavouriteOfferResponse,
  NotificationResponse,
  ViewingRequestResponse,
} from './contracts';
import type { PageResponse } from './types';

export const customerApi = {
  async saveFavourite(offerId: string): Promise<FavouriteOfferResponse> {
    const { data } = await httpClient.put<FavouriteOfferResponse>(`/me/favourites/${offerId}`);
    return data;
  },

  async removeFavourite(offerId: string): Promise<void> {
    await httpClient.delete(`/me/favourites/${offerId}`);
  },

  async listFavourites(page = 0, size = 20): Promise<PageResponse<FavouriteOfferResponse>> {
    const { data } = await httpClient.get<PageResponse<FavouriteOfferResponse>>('/me/favourites', {
      params: { page, size },
    });
    return data;
  },

  async listFavouriteIds(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/me/favourites/ids');
    return data;
  },

  async createEnquiry(payload: CreateEnquiryRequest): Promise<CustomerEnquiryResponse> {
    const { data } = await httpClient.post<CustomerEnquiryResponse>('/enquiries', payload);
    return data;
  },

  async listMyEnquiries(page = 0, size = 20): Promise<PageResponse<CustomerEnquiryResponse>> {
    const { data } = await httpClient.get<PageResponse<CustomerEnquiryResponse>>('/me/enquiries', {
      params: { page, size },
    });
    return data;
  },

  async getMyEnquiry(enquiryId: string): Promise<CustomerEnquiryResponse> {
    const { data } = await httpClient.get<CustomerEnquiryResponse>(`/me/enquiries/${enquiryId}`);
    return data;
  },

  async createViewingRequest(payload: CreateViewingRequestDto): Promise<ViewingRequestResponse> {
    const { data } = await httpClient.post<ViewingRequestResponse>('/viewing-requests', payload);
    return data;
  },

  async listMyViewingRequests(
    page = 0,
    size = 20,
  ): Promise<PageResponse<ViewingRequestResponse>> {
    const { data } = await httpClient.get<PageResponse<ViewingRequestResponse>>(
      '/me/viewing-requests',
      { params: { page, size } },
    );
    return data;
  },

  async updateMyViewingRequest(
    viewingRequestId: string,
    payload: CustomerUpdateViewingRequestDto,
  ): Promise<ViewingRequestResponse> {
    const { data } = await httpClient.patch<ViewingRequestResponse>(
      `/viewing-requests/${viewingRequestId}`,
      payload,
    );
    return data;
  },

  async listNotifications(
    unreadOnly = false,
    page = 0,
    size = 20,
  ): Promise<PageResponse<NotificationResponse>> {
    const { data } = await httpClient.get<PageResponse<NotificationResponse>>(
      '/me/notifications',
      { params: { unreadOnly, page, size } },
    );
    return data;
  },

  async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    const { data } = await httpClient.get<{ unreadCount: number }>(
      '/me/notifications/unread-count',
    );
    return data;
  },

  async markNotificationRead(notificationId: string): Promise<NotificationResponse> {
    const { data } = await httpClient.patch<NotificationResponse>(
      `/me/notifications/${notificationId}/read`,
      {},
    );
    return data;
  },

  async markAllNotificationsRead(): Promise<{ updatedCount: number }> {
    const { data } = await httpClient.post<{ updatedCount: number }>(
      '/me/notifications/read-all',
      {},
    );
    return data;
  },
};
