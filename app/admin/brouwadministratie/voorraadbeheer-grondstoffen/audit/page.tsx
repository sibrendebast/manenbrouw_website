'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from 'react';
import { getAuditLogs } from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Search } from 'lucide-react';

function safeParseDate(date: any): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  try {
    return new Date(date);
  } catch {
    return new Date();
  }
}

function formatDateTime(date: any): string {
  try {
    return safeParseDate(date).toLocaleString('nl-NL');
  } catch {
    return 'Onbekend';
  }
}

export default function AuditLogPage() {
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    documentType: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    const res = await getAuditLogs(
      filters.documentType || undefined,
      undefined,
      200
    );
    if (res.success) {
      let logs: any[] = (res.data as any[]) || [];

      // Filter by action
      if (filters.action) {
        logs = logs.filter((log: any) => log.action === filters.action);
      }

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        logs = logs.filter((log: any) => {
          const logDate = new Date(log.changedAt);
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            if (logDate < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (logDate > end) return false;
          }
          return true;
        });
      }

      setAuditLogs(logs);
    }
    setLoading(false);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchAuditLogs();
  };

  const handleReset = () => {
    setFilters({
      documentType: '',
      action: '',
      startDate: '',
      endDate: '',
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize audit logs on mount
      fetchAuditLogs();
    }
  }, [isAuthenticated, fetchAuditLogs]);

  if (!isAuthenticated) return null;

  const actionTypes = [...new Set(auditLogs.map((log) => log.action))];
  const documentTypes = [...new Set(auditLogs.map((log) => log.documentType))];

  return (
    <div className="min-h-screen bg-gray-50 py-12 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
          <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
          <span>/</span>
          <Link href="/admin/brouwadministratie/voorraadbeheer-grondstoffen" className="hover:text-brewery-dark">Voorraadbeheer grondstoffen</Link>
          <span>/</span>
          <span className="text-brewery-dark font-medium">Audit Trail</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">Audit Trail</h1>
            <p className="text-gray-500 mt-1">
              {auditLogs.length} ingang{auditLogs.length === 1 ? '' : 'en'} · Onveranderbare registratie van alle wijzigingen
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 border-2 border-black mb-6">
          <h3 className="font-bold text-brewery-dark text-lg mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Document type
              </label>
              <select
                value={filters.documentType}
                onChange={(e) =>
                  handleFilterChange('documentType', e.target.value)
                }
                className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
              >
                <option value="">Alle</option>
                {documentTypes.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Actie
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
              >
                <option value="">Alle</option>
                {actionTypes.map((at) => (
                  <option key={at} value={at}>
                    {at}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Van
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
                className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tot
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-brewery-dark text-white hover:opacity-90 transition-colors font-bold text-sm"
              >
                <Search className="h-4 w-4 inline mr-1" />
                Filteren
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-black overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brewery-dark text-white">
              <tr>
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-3 text-left font-bold">Document type</th>
                <th className="px-4 py-3 text-left font-bold">Actie</th>
                <th className="px-4 py-3 text-left font-bold">Context</th>
                <th className="px-4 py-3 text-left font-bold">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Audit logs laden…
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                    Geen audit logs gevonden
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, i) => (
                  <tr key={log.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                      {formatDateTime(log.changedAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs">
                      {log.documentType}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`px-2 py-1 text-xs font-semibold ${
                          log.action === 'CREATE'
                            ? 'bg-green-100 text-green-700'
                            : log.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-700'
                              : log.action === 'DELETE'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">
                      {log.context || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {(log.oldValue || log.newValue) && (
                        <details className="cursor-pointer">
                          <summary className="font-mono text-brewery-dark font-bold">
                            Meer →
                          </summary>
                          <div className="mt-2 space-y-1 text-xs">
                            {log.oldValue && (
                              <p>
                                <span className="text-gray-600">Oud:</span>{' '}
                                <code className="bg-red-50 block whitespace-pre-wrap break-words p-1 mt-1">{JSON.stringify(log.oldValue, null, 2)}</code>
                              </p>
                            )}
                            {log.newValue && (
                              <p>
                                <span className="text-gray-600">Nieuw:</span>{' '}
                                <code className="bg-green-50 block whitespace-pre-wrap break-words p-1 mt-1">{JSON.stringify(log.newValue, null, 2)}</code>
                              </p>
                            )}
                          </div>
                        </details>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
