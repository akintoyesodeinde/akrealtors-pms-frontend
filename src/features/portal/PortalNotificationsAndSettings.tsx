import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Lock, User } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { customerApi } from '../../api/customerApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatDate } from '../../lib/formatters';
import { useAuth } from '../auth/useAuth';

export function PortalNotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'list', unreadOnly, page],
    queryFn: () => customerApi.listNotifications(unreadOnly, page, 20),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => customerApi.markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => customerApi.markAllNotificationsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="space-y-6">
      <SeoHead title="Notifications" canonicalPath="/portal/notifications" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            Notifications Inbox
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Alerts for enquiry replies, viewing updates, verification reviews, and listing
            decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setUnreadOnly((v) => !v);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              unreadOnly
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {unreadOnly ? 'Showing Unread Only' : 'Filter: Unread Only'}
          </button>

          <button
            type="button"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
            Mark All Read
          </button>
        </div>
      </div>

      {notificationsQuery.isLoading ? (
        <LoadingSkeletonGrid count={3} />
      ) : notificationsQuery.isError ? (
        <ErrorStateBox
          title="Unable to load notifications"
          error={notificationsQuery.error}
          onRetry={() => void notificationsQuery.refetch()}
        />
      ) : (notificationsQuery.data?.content ?? []).length === 0 ? (
        <EmptyStateBox
          title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          description="Important updates regarding enquiries, viewings, and account actions appear here."
        />
      ) : (
        <div className="space-y-3">
          {(notificationsQuery.data?.content ?? []).map((n) => (
            <article
              key={n.id}
              className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                n.read ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {n.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(n.createdAt)}</span>
                  {!n.read && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed">{n.body}</p>
                {n.actionPath && n.actionPath.startsWith('/') && (
                  <Link
                    to={n.actionPath}
                    className="inline-block text-xs font-semibold text-emerald-700 hover:underline pt-1"
                  >
                    Open related item →
                  </Link>
                )}
              </div>

              {!n.read && (
                <button
                  type="button"
                  disabled={markReadMutation.isPending}
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold shrink-0 self-start"
                >
                  Mark Read
                </button>
              )}
            </article>
          ))}

          {notificationsQuery.data && (
            <PaginationBar
              page={notificationsQuery.data.page}
              totalPages={notificationsQuery.data.totalPages}
              totalElements={notificationsQuery.data.totalElements}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function PortalSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  const profileMutation = useMutation({
    mutationFn: () =>
      authApi.updateCurrentUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      }),
    onSuccess: async () => {
      await refreshProfile();
      setProfileMessage('Profile details updated.');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
    onSuccess: (res) => {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage(res.message);
    },
  });

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    profileMutation.mutate();
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordValidationError(null);
    if (
      newPassword.length < 10 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setPasswordValidationError(
        'New password must be at least 10 characters and include both letters and digits.',
      );
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Account Profile & Security" canonicalPath="/portal/settings" />

      {/* Personal Profile */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          Personal Profile Details
        </h2>

        {profileMessage && (
          <p className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
            {profileMessage}
          </p>
        )}
        {profileMutation.isError && (
          <p role="alert" className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700">
            {profileMutation.error instanceof ApiClientError
              ? profileMutation.error.message
              : 'Failed to update profile.'}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-first-name" className="block text-xs font-semibold text-slate-700 mb-1">
              First Name
            </label>
            <input
              id="settings-first-name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="settings-last-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Last Name
            </label>
            <input
              id="settings-last-name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="settings-phone" className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            id="settings-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+2348012345678"
            className="w-full max-w-sm px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={profileMutation.isPending}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold"
        >
          {profileMutation.isPending ? 'Saving…' : 'Save Profile Changes'}
        </button>
      </form>

      {/* Password & Security */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          Change Password
        </h2>

        {passwordMessage && (
          <p className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
            {passwordMessage}
          </p>
        )}
        {(passwordValidationError || passwordMutation.isError) && (
          <p role="alert" className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700">
            {passwordValidationError ??
              (passwordMutation.error instanceof ApiClientError
                ? passwordMutation.error.message
                : 'Failed to change password.')}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (min 10 chars, letters + digits)
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={passwordMutation.isPending}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold"
        >
          {passwordMutation.isPending ? 'Updating Password…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
