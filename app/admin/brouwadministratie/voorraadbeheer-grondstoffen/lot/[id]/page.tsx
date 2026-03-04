'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, use } from 'react';
import { getInventoryLotById, getAuditLogs } from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Package } from 'lucide-react';

// Safe date parsing helper
function safeParseDate(date: any): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  try {
    return new Date(date);
  } catch {
    return new Date();
  }
}

function formatDate(date: any): string {
  try {
    return safeParseDate(date).toLocaleDateString('nl-NL');
  } catch {
    return 'Onbekend';
  }
}

function formatDateTime(date: any): string {
  try {
    return safeParseDate(date).toLocaleString('nl-NL');
  } catch {
    return 'Onbekend';
  }
}

export default function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [lot, setLot] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.push('/admin/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const [lotRes, auditRes] = await Promise.all([
        getInventoryLotById(id),
        getAuditLogs('InventoryLot', id),
      ]);

      if (lotRes.success) setLot(lotRes.data);
      if (auditRes.success) setAuditLogs((auditRes.data as any[]) || []);
      setLoading(false);
    };

    fetch();
  }, [id]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-gray-400 py-16 justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            Laden…
          </div>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
            <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
            <span>/</span>
            <Link href="/admin/brouwadministratie/voorraadbeheer-grondstoffen" className="hover:text-brewery-dark">Voorraadbeheer grondstoffen</Link>
          </div>
          <div className="bg-white border-2 border-black p-16 text-center">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-gray-500">Lot niet gevonden</p>
            <Link
              href="/admin/brouwadministratie/voorraadbeheer-grondstoffen"
              className="inline-block mt-4 px-4 py-2 border-2 border-black text-black font-bold hover:bg-gray-100 transition-colors"
            >
              ← Terug naar overzicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expiryDate = safeParseDate(lot.expiryDate);
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysUntilExpiry < 0;
  const isNearExpiry = daysUntilExpiry < 14 && daysUntilExpiry >= 0;
  const available = Number(lot.quantityTotal || 0) - Number(lot.quantityAllocated || 0);

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
          <span className="text-brewery-dark font-medium">Lot {lot.lotNumber}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">{lot.lotNumber}</h1>
            <p className="text-gray-500 mt-1">{lot.material?.name || 'Onbekend'} · {formatDate(lot.expiryDate)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/brouwadministratie/voorraadbeheer-grondstoffen"
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium"
            >
              ← Terug
            </Link>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`bg-white p-4 border-2 ${
            isExpired ? 'border-red-400' : isNearExpiry ? 'border-yellow-400' : 'border-black'
          }`}>
            <p className="text-sm text-gray-600">Grondstof</p>
            <p className="font-bold">
              <Link
                href={`/admin/brouwadministratie/voorraadbeheer-grondstoffen/grondstof/${lot.materialId}`}
                className="text-brewery-dark hover:underline"
              >
                {lot.material?.name || 'Onbekend'}
              </Link>
            </p>
          </div>
          <div className={`bg-white p-4 border-2 ${
            isExpired ? 'border-red-400' : isNearExpiry ? 'border-yellow-400' : 'border-black'
          }`}>
            <p className="text-sm text-gray-600">Vervaldatum</p>
            <p className={`font-bold ${
              isExpired ? 'text-red-700' : isNearExpiry ? 'text-yellow-700' : 'text-green-700'
            }`}>{formatDate(lot.expiryDate)}</p>
          </div>
          <div className={`bg-white p-4 border-2 ${
            isExpired ? 'border-red-400' : isNearExpiry ? 'border-yellow-400' : 'border-black'
          }`}>
            <p className="text-sm text-gray-600">Totaal hoeveelheid</p>
            <p className="font-bold text-brewery-green">
              {Number(lot.quantityTotal || 0).toFixed(3)} {lot.material?.unit || 'eenheid'}
            </p>
          </div>
          <div className={`bg-white p-4 border-2 ${
            isExpired ? 'border-red-400' : isNearExpiry ? 'border-yellow-400' : 'border-black'
          }`}>
            <p className="text-sm text-gray-600">Gealloceerd</p>
            <p className="font-bold">
              {Number(lot.quantityAllocated || 0).toFixed(3)}
            </p>
          </div>
          <div className={`bg-white p-4 border-2 ${
            isExpired ? 'border-red-400' : isNearExpiry ? 'border-yellow-400' : 'border-black'
          }`}>
            <p className="text-sm text-gray-600">Beschikbaar</p>
            <p className="font-bold text-brewery-green">
              {available.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Lot details card */}
        <div className="bg-white p-6 border-2 border-black mb-6">
          <h2 className="font-bold text-brewery-dark text-lg mb-4">Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Leverancier</p>
              <p className="font-bold">{lot.supplier?.name || 'Onbekend'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kostprijs per eenheid</p>
              <p className="font-bold">€{Number(lot.unitCost || 0).toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Totale waarde</p>
              <p className="font-bold">
                €{(Number(lot.quantityTotal || 0) * Number(lot.unitCost || 0)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-bold capitalize">{lot.status || 'active'}</p>
            </div>
            {lot.manufacturer && (
              <div>
                <p className="text-sm text-gray-600">Fabrikant</p>
                <p className="font-bold">{lot.manufacturer}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Aangemaakt</p>
              <p className="font-mono text-xs">{formatDateTime(lot.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Allocations */}
        {lot.allocations && lot.allocations.length > 0 && (
          <div className="bg-white border-2 border-black overflow-x-auto mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-brewery-dark text-lg">
                Toewijzingen ({lot.allocations.length})
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-brewery-dark text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Brouwsel</th>
                  <th className="px-4 py-3 text-right font-bold">Hoeveelheid</th>
                </tr>
              </thead>
              <tbody>
                {lot.allocations.map((alloc: any, i: number) => (
                  <tr key={alloc.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3 font-bold text-brewery-dark">
                      {alloc.allocation?.brewNumber}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {Number(alloc.quantityAllocated || 0).toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Trail */}
        {auditLogs && auditLogs.length > 0 && (
          <div className="bg-white border-2 border-black overflow-x-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-brewery-dark text-lg">Audit Trail ({auditLogs.length})</h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="border-l-4 border-brewery-dark pl-4 py-2">
                  <p className="text-gray-600 text-xs font-mono">
                    {formatDateTime(log.changedAt)} · {log.action}
                  </p>
                  {log.context && (
                    <p className="font-medium text-gray-900 mt-1">{log.context}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
