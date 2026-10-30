import { Route, Routes } from 'react-router-dom';
import { AdminAbuseReportsPage } from './AdminAbuseReportsPage';
import { AdminAuditAndSettingsPage } from './AdminAuditAndSettingsPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminLayout } from './AdminLayout';
import { AdminOfferModerationPage } from './AdminOfferModerationPage';
import { AdminUsersAndAgenciesPage } from './AdminUsersAndAgenciesPage';
import { AdminVerificationQueuePage } from './AdminVerificationQueuePage';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="offers" element={<AdminOfferModerationPage />} />
        <Route path="verification" element={<AdminVerificationQueuePage />} />
        <Route path="abuse-reports" element={<AdminAbuseReportsPage />} />
        <Route path="users" element={<AdminUsersAndAgenciesPage />} />
        <Route path="governance" element={<AdminAuditAndSettingsPage />} />
      </Route>
    </Routes>
  );
}
