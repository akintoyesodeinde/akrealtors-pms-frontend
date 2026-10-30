import { createContext, useContext } from 'react';
import type { AgencyMembershipResponse } from '../../api/contracts';

export interface RealtorScopeContextValue {
  selectedAgencyId: string | undefined;
  setSelectedAgencyId: (agencyId: string | undefined) => void;
  activeMemberships: AgencyMembershipResponse[];
  selectedMembership: AgencyMembershipResponse | undefined;
}

export const RealtorScopeContext = createContext<RealtorScopeContextValue>({
  selectedAgencyId: undefined,
  setSelectedAgencyId: () => undefined,
  activeMemberships: [],
  selectedMembership: undefined,
});

export function useRealtorScope() {
  return useContext(RealtorScopeContext);
}
