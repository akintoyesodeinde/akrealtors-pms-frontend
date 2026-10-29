import { httpClient } from './client';
import type {
  AmenityResponse,
  CityResponse,
  PropertyDetailResponse,
  PropertySearchParams,
  PublicAgencyResponse,
  PublicPropertySearchItem,
  PublicRealtorProfileResponse,
  StateResponse,
} from './contracts';
import type { PageResponse } from './types';

export const marketplaceApi = {
  async searchProperties(
    params: PropertySearchParams,
  ): Promise<PageResponse<PublicPropertySearchItem>> {
    const cleanParams: Record<string, string | number> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === null || val === '') continue;
      if (Array.isArray(val)) {
        if (val.length > 0) {
          cleanParams[key] = val.join(',');
        }
      } else {
        cleanParams[key] = val as string | number;
      }
    }
    const { data } = await httpClient.get<PageResponse<PublicPropertySearchItem>>('/properties', {
      params: cleanParams,
    });
    return data;
  },

  async getFeaturedProperties(limit = 6): Promise<PublicPropertySearchItem[]> {
    const { data } = await httpClient.get<PublicPropertySearchItem[]>('/properties/featured', {
      params: { limit },
    });
    return data;
  },

  async getPropertyDetail(offerId: string): Promise<PropertyDetailResponse> {
    const { data } = await httpClient.get<PropertyDetailResponse>(`/properties/${offerId}`);
    return data;
  },

  async getSimilarProperties(offerId: string, limit = 4): Promise<PublicPropertySearchItem[]> {
    const { data } = await httpClient.get<PublicPropertySearchItem[]>(
      `/properties/${offerId}/similar`,
      { params: { limit } },
    );
    return data;
  },

  async getStates(): Promise<StateResponse[]> {
    const { data } = await httpClient.get<StateResponse[]>('/locations/states');
    return data;
  },

  async getCities(state?: string): Promise<CityResponse[]> {
    const { data } = await httpClient.get<CityResponse[]>('/locations/cities', {
      params: state ? { state } : undefined,
    });
    return data;
  },

  async getAmenities(): Promise<AmenityResponse[]> {
    const { data } = await httpClient.get<AmenityResponse[]>('/amenities');
    return data;
  },

  async getPublicRealtor(realtorId: string): Promise<PublicRealtorProfileResponse> {
    const { data } = await httpClient.get<PublicRealtorProfileResponse>(`/realtors/${realtorId}`);
    return data;
  },

  async getPublicAgency(agencyId: string): Promise<PublicAgencyResponse> {
    const { data } = await httpClient.get<PublicAgencyResponse>(`/agencies/${agencyId}`);
    return data;
  },
};
