import { Navigate, Route, Routes } from 'react-router-dom';
import { CustomerPortalLayout } from './CustomerPortalLayout';
import { PortalEnquiriesPage, PortalViewingsPage } from './PortalEnquiriesAndViewings';
import { PortalNotificationsPage, PortalSettingsPage } from './PortalNotificationsAndSettings';
import { PortalFavouritesPage, PortalOverviewPage } from './PortalOverviewAndFavourites';

export function CustomerPortalRoutes() {
  return (
    <Routes>
      <Route element={<CustomerPortalLayout />}>
        <Route index element={<PortalOverviewPage />} />
        <Route path="favourites" element={<PortalFavouritesPage />} />
        <Route path="enquiries" element={<PortalEnquiriesPage />} />
        <Route path="viewings" element={<PortalViewingsPage />} />
        <Route path="notifications" element={<PortalNotificationsPage />} />
        <Route path="settings" element={<PortalSettingsPage />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Route>
    </Routes>
  );
}

export default CustomerPortalRoutes;
