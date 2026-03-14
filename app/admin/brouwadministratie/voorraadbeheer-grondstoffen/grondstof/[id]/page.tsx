'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, use } from 'react';
import { getRawMaterialById, getRawMaterialAuditTrail, deleteRawMaterial } from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Package, Trash2 } from 'lucide-react';

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

export default function GrondstofDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [material, setMaterial] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push('/admin/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const [matRes, auditRes] = await Promise.all([
        getRawMaterialById(id),
        getRawMaterialAuditTrail(id),
      ]);

      if (matRes.success) setMaterial(matRes.data);
      if (auditRes.success) setAuditLogs((auditRes.data as any[]) || []);
      setLoading(false);
    };

    fetch();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const res = await deleteRawMaterial(id);
    if (res.success) {
      router.push('/admin/brouwadministratie/voorraadbeheer-grondstoffen');
    } else {
      setDeleteError(res.error || 'Verwijderen mislukt');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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

  if (!material) {
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
            <p className="text-gray-500">Grondstof niet gevonden</p>
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

  const availableQty = material.lots.reduce(
    (sum: number, lot: any) => sum + Number(lot.quantityTotal || 0) - Number(lot.quantityAllocated || 0),
    0
  );

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
          <span className="text-brewery-dark font-medium">{material.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">{material.name}</h1>
            <p className="text-gray-500 mt-1">{material.category} · {material.unit}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/brouwadministratie/voorraadbeheer-grondstoffen"
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium"
            >
              ← Terug
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Verwijderen
            </button>
          </div>
        </div>

        {/* Delete error banner */}
        {deleteError && (
          <div className="bg-red-50 border-2 border-red-600 text-red-800 px-4 py-3 mb-6">
            <p className="font-medium">Kan niet verwijderen</p>
            <p className="text-sm mt-1">{deleteError}</p>
            <button
              onClick={() => setDeleteError(null)}
              className="text-sm underline mt-2 hover:no-underline"
            >
              Sluiten
            </button>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-brewery-dark mb-2">Grondstof verwijderen?</h3>
              <p className="text-gray-600 mb-1">
                Weet je zeker dat je <strong>{material.name}</strong> wilt verwijderen?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Alle bijhorende lots, ontvangstlijnen en voorraadbewegingen worden ook verwijderd. Deze actie kan niet ongedaan worden.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Verwijderen…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Ja, verwijderen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 border-2 border-black">
            <p className="text-sm text-gray-600">Categorie</p>
            <p className="font-bold text-lg text-brewery-dark">{material.category}</p>
          </div>
          <div className="bg-white p-4 border-2 border-black">
            <p className="text-sm text-gray-600">Eenheid</p>
            <p className="font-bold text-lg text-brewery-dark">{material.unit}</p>
          </div>
          <div className="bg-white p-4 border-2 border-black">
            <p className="text-sm text-gray-600">In voorraad</p>
            <p className="font-bold text-lg text-brewery-green">
              {availableQty.toFixed(3)} {material.unit}
            </p>
          </div>
        </div>

        {/* Inventory lots table */}
        <div className="bg-white border-2 border-black overflow-x-auto mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-brewery-dark text-lg">Loten ({material.lots.length})</h2>
          </div>
          {material.lots.length === 0 ? (
            <div className="px-4 py-16 text-center text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              Geen loten beschikbaar
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-brewery-dark text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Lotnummer</th>
                  <th className="px-4 py-3 text-left font-bold">Vervaldatum</th>
                  <th className="px-4 py-3 text-right font-bold">Totaal</th>
                  <th className="px-4 py-3 text-right font-bold">Gealloceerd</th>
                  <th className="px-4 py-3 text-right font-bold">Beschikbaar</th>
                  <th className="px-4 py-3 text-right font-bold">Kostprijs/eenheid</th>
                  <th className="px-4 py-3 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {material.lots.map((lot: any, i: number) => {
                  const available =
                    Number(lot.quantityTotal || 0) -
                    Number(lot.quantityAllocated || 0);
                  const expiryDate = safeParseDate(lot.expiryDate);
                  const daysUntilExpiry = Math.floor(
                    (expiryDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={lot.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="px-4 py-3 font-mono text-xs font-bold">
                        <Link
                          href={`/admin/brouwadministratie/voorraadbeheer-grondstoffen/lot/${lot.id}`}
                          className="text-brewery-dark hover:underline"
                        >
                          {lot.lotNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(lot.expiryDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {Number(lot.quantityTotal || 0).toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {Number(lot.quantityAllocated || 0).toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-brewery-green">
                        {available.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        €{Number(lot.unitCost || 0).toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {daysUntilExpiry < 0 ? (
                          <span className="bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            Vervallen
                          </span>
                        ) : daysUntilExpiry < 14 ? (
                          <span className="bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                            ⚠️ {daysUntilExpiry}d
                          </span>
                        ) : (
                          <span className="bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit Trail */}
        {auditLogs && auditLogs.length > 0 && (
          <div className="bg-white border-2 border-black overflow-x-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-brewery-dark text-lg">Gebeurtenissen ({auditLogs.length})</h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {auditLogs.map((log: any) => {
                const borderColor =
                  log.type === 'inslag'
                    ? 'border-green-600'
                    : log.type === 'uitslag'
                    ? 'border-red-600'
                    : 'border-brewery-dark';

                return (
                  <div key={log.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                    <p className="text-gray-600 text-xs font-mono">
                      {formatDate(log.timestamp || log.changedAt)} · <span className="font-bold">{log.action}</span>
                    </p>
                    {log.context && (
                      <p className="font-medium text-gray-900 mt-1">{log.context}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
