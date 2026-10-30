import { Navigate, Route, Routes } from 'react-router-dom';
import { RealtorAgenciesPage } from './RealtorAgenciesPage';
import { RealtorDashboardPage } from './RealtorDashboardPage';
import { RealtorEnquiriesInboxPage, RealtorViewingInboxPage } from './RealtorInboxPages';
import {
  RealtorCreateOfferWizardPage,
  RealtorOfferManagePage,
  RealtorOffersListPage,
} from './RealtorOffersPages';
import { RealtorProfileAndVerificationPage } from './RealtorProfileAndVerificationPage';
import { RealtorWorkspaceLayout } from './RealtorWorkspaceLayout';

export function RealtorWorkspaceRoutes() {
  return (
    <Routes>
      <Route element={<RealtorWorkspaceLayout />}>
        <Route index element={<RealtorDashboardPage />} />
        <Route path="offers" element={<RealtorOffersListPage />} />
        <Route path="offers/new" element={<RealtorCreateOfferWizardPage />} />
        <Route path="offers/:offerId" element={<RealtorOfferManagePage />} />
        <Route path="enquiries" element={<RealtorEnquiriesInboxPage />} />
        <Route path="viewings" element={<RealtorViewingInboxPage />} />
        <Route path="profile" element={<RealtorProfileAndVerificationPage />} />
        <Route path="agencies" element={<RealtorAgenciesPage />} />
        <Route path="*" element={<Navigate to="/realtor" replace />} />
      </Route>
    </Routes>
  );
}

export default RealtorWorkspaceRoutes;
