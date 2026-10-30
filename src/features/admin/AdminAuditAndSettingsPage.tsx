import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { adminApi } from '../../api/adminApi';
import type { PlatformSettingResponse } from '../../api/contracts';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { useAuth } from '../auth/useAuth';
import { formatDateTime, humanizeEnum } from './adminFormatting';
import { InlineMutationError, PlatformAdminOnlyNotice } from './AdminUi';

function AuditLogPanel() {
  const [actionTypeInput, setActionTypeInput] = useState('');
  const [targetTypeInput, setTargetTypeInput] = useState('');
  const [filters, setFilters] = useState({ actionType: '', targetType: '' });
  const [page, setPage] = useState(0);

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-logs', filters, page],
    queryFn: () => adminApi.listAuditLogs({ ...filters, page, size: 20 }),
  });
  const pageData = auditQuery.data;

  return (
    <section aria-label="Immutable audit log" className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Immutable Audit Trail</h2>
      <p className="text-xs text-slate-600">
        Audit records are append-only and protected by a database trigger that rejects updates and
        deletes.
      </p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({
            actionType: actionTypeInput.trim().toUpperCase(),
            targetType: targetTypeInput.trim().toUpperCase(),
          });
          setPage(0);
        }}
      >
        <label className="text-xs font-semibold text-slate-700">
          Action type
          <input
            value={actionTypeInput}
            onChange={(e) => setActionTypeInput(e.target.value)}
            placeholder="e.g. OFFER_MODERATION_SUSPENDED"
            className="ml-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs w-60"
          />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Target type
          <input
            value={targetTypeInput}
            onChange={(e) => setTargetTypeInput(e.target.value)}
            placeholder="e.g. PROPERTY_OFFER"
            className="ml-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs w-44"
          />
        </label>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          Apply Filters
        </button>
      </form>

      {auditQuery.isLoading ? (
        <LoadingSkeletonGrid count={1} />
      ) : auditQuery.isError ? (
        <ErrorStateBox
          title="Unable to load audit trail"
          error={auditQuery.error}
          onRetry={() => void auditQuery.refetch()}
        />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyStateBox title="No audit records" description="No audit entries match these filters." />
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">When</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Actor</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Action</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Target</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.content.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-slate-800">{log.actorEmail ?? 'System / anonymous'}</td>
                    <td className="px-3 py-2 font-mono text-slate-800">{log.actionType}</td>
                    <td className="px-3 py-2 text-slate-600">{humanizeEnum(log.targetType)}</td>
                    <td className="px-3 py-2 text-slate-700">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            page={pageData.page}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}

function SettingRow({ setting }: { setting: PlatformSettingResponse }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(setting.settingValue);
  const mutation = useMutation({
    mutationFn: (next: string) => adminApi.updateSetting(setting.settingKey, next),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });

  return (
    <li className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-900 font-mono">{setting.settingKey}</p>
        <p className="text-xs text-slate-600">{setting.description}</p>
        <p className="text-[11px] text-slate-400">Last updated {formatDateTime(setting.updatedAt)}</p>
      </div>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(value);
        }}
      >
        <label className="sr-only" htmlFor={`setting-${setting.settingKey}`}>
          {setting.settingKey}
        </label>
        {setting.valueType === 'BOOLEAN' ? (
          <select
            id={`setting-${setting.settingKey}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            id={`setting-${setting.settingKey}`}
            type={setting.valueType === 'INTEGER' ? 'number' : 'text'}
            min={setting.valueType === 'INTEGER' ? 0 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs w-40"
          />
        )}
        <button
          type="submit"
          disabled={mutation.isPending || value === setting.settingValue}
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
        >
          Save
        </button>
        {mutation.isSuccess && (
          <span role="status" className="text-xs font-semibold text-emerald-700">
            Saved
          </span>
        )}
      </form>
      <InlineMutationError error={mutation.error} />
    </li>
  );
}

const amenitySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Code is required')
    .max(60)
    .regex(/^[A-Z0-9_]+$/, 'Use uppercase letters, digits, or underscores'),
  name: z.string().trim().min(2, 'Name is required').max(120),
  category: z.string().trim().min(2, 'Category is required').max(60),
});
type AmenityForm = z.infer<typeof amenitySchema>;

function AmenityManagementPanel() {
  const queryClient = useQueryClient();
  const amenitiesQuery = useQuery({
    queryKey: ['admin', 'amenities'],
    queryFn: () => adminApi.listAmenities(),
  });
  const form = useForm<AmenityForm>({
    resolver: zodResolver(amenitySchema),
    defaultValues: { code: '', name: '', category: '' },
  });

  const createMutation = useMutation({
    mutationFn: (payload: AmenityForm) => adminApi.createAmenity(payload),
    onSuccess: () => {
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ['admin', 'amenities'] });
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updateAmenity(id, { active }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'amenities'] }),
  });

  return (
    <section aria-label="Amenity master list" className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Amenity Master List</h2>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start bg-white rounded-2xl border border-slate-200 p-4"
      >
        <label className="text-xs font-semibold text-slate-700">
          Code
          <input {...form.register('code')} className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs" />
          {form.formState.errors.code && (
            <span role="alert" className="block text-rose-700 font-normal">
              {form.formState.errors.code.message}
            </span>
          )}
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Name
          <input {...form.register('name')} className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs" />
          {form.formState.errors.name && (
            <span role="alert" className="block text-rose-700 font-normal">
              {form.formState.errors.name.message}
            </span>
          )}
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Category
          <input {...form.register('category')} className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs" />
          {form.formState.errors.category && (
            <span role="alert" className="block text-rose-700 font-normal">
              {form.formState.errors.category.message}
            </span>
          )}
        </label>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="mt-5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50"
        >
          Add Amenity
        </button>
        <div className="md:col-span-4">
          <InlineMutationError error={createMutation.error} />
        </div>
      </form>

      {amenitiesQuery.isError ? (
        <ErrorStateBox
          title="Unable to load amenities"
          error={amenitiesQuery.error}
          onRetry={() => void amenitiesQuery.refetch()}
        />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(amenitiesQuery.data ?? []).map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2"
            >
              <div className="text-xs">
                <p className={`font-semibold ${a.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                  {a.name}
                </p>
                <p className="text-slate-500 font-mono">
                  {a.code} · {a.category}
                </p>
              </div>
              <button
                type="button"
                disabled={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate({ id: a.id, active: !a.active })}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                {a.active ? 'Deactivate' : 'Activate'}
              </button>
            </li>
          ))}
        </ul>
      )}
      <InlineMutationError error={toggleMutation.error} />
    </section>
  );
}

function PlatformSettingsPanel() {
  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.listSettings(),
  });

  return (
    <section aria-label="Platform settings" className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Platform Settings</h2>
      {settingsQuery.isLoading ? (
        <LoadingSkeletonGrid count={1} />
      ) : settingsQuery.isError ? (
        <ErrorStateBox
          title="Unable to load platform settings"
          error={settingsQuery.error}
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : (
        <ul className="space-y-2">
          {(settingsQuery.data ?? []).map((s) => (
            <SettingRow key={s.settingKey} setting={s} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminAuditAndSettingsPage() {
  const { hasRole } = useAuth();
  const isPlatformAdmin = hasRole('PLATFORM_ADMIN');

  return (
    <div className="space-y-8">
      {isPlatformAdmin ? (
        <>
          <PlatformSettingsPanel />
          <AmenityManagementPanel />
        </>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Platform Settings &amp; Amenities</h2>
          <PlatformAdminOnlyNotice />
        </section>
      )}
      <AuditLogPanel />
    </div>
  );
}
