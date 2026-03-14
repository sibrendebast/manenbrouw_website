'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import {
  getInventoryDashboard,
  getRawMaterials,
  createRawMaterial,
  createSupplier,
  getSuppliers,
} from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import { RawMaterialCategory } from '@prisma/client';
import Link from 'next/link';
import {
  Plus,
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Package,
} from 'lucide-react';

type Material = any;
type Dashboard = any;

type SortKey = 'name' | 'category' | 'totalQuantity' | 'availableQuantity';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-brewery-green inline ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 text-brewery-green inline ml-1" />;
}

export default function VoorraadbeheerPage() {
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard>(null);
  const [selectedCategory, setSelectedCategory] = useState<RawMaterialCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingMaterial, setCreatingMaterial] = useState(false);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [zoekterm, setZoekterm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [error, setError] = useState<string | null>(null);
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialCategory, setNewMaterialCategory] = useState<RawMaterialCategory>('GRANEN');
  const [newMaterialUnit, setNewMaterialUnit] = useState('kg');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierKbo, setNewSupplierKbo] = useState('');
  const [newSupplierFavv, setNewSupplierFavv] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/admin/login');
  }, [isAuthenticated, router]);

  const laadMaterialen = async () => {
    setLoading(true);
    const [matRes, dashRes] = await Promise.all([
      getRawMaterials(selectedCategory || undefined),
      getInventoryDashboard(),
    ]);

    if (matRes.success) setMaterials((matRes.data as any[]) || []);
    if (dashRes.success) setDashboard(dashRes.data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    laadMaterialen();
  }, [selectedCategory, isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleNieuwMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;

    setCreatingMaterial(true);
    const result = await createRawMaterial({
      name: newMaterialName,
      category: newMaterialCategory,
      unit: newMaterialUnit,
    });

    if (result.success) {
      setNewMaterialName('');
      setShowNewMaterialModal(false);
      await laadMaterialen();
    } else {
      setError(result.error || 'Kon grondstof niet aanmaken');
    }
    setCreatingMaterial(false);
  };

  const handleNieuwSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setCreatingSupplier(true);
    const result = await createSupplier({
      name: newSupplierName,
      email: newSupplierEmail || undefined,
      address: newSupplierAddress || undefined,
      contact: newSupplierContact || undefined,
      phone: newSupplierPhone || undefined,
      kboNumber: newSupplierKbo || undefined,
      favvNumber: newSupplierFavv || undefined,
    });

    if (result.success) {
      setNewSupplierName('');
      setNewSupplierEmail('');
      setNewSupplierAddress('');
      setNewSupplierContact('');
      setNewSupplierPhone('');
      setNewSupplierKbo('');
      setNewSupplierFavv('');
      setShowNewSupplierModal(false);
      // Supplier creation doesn't change materials list, just close modal
    } else {
      setError(result.error || 'Kon leverancier niet aanmaken');
    }
    setCreatingSupplier(false);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const categories: RawMaterialCategory[] = [
    'GRANEN',
    'HOP',
    'GIST',
    'TOEVOEGINGEN',
    'VERPAKKING',
  ];

  const categoryLabels: Record<RawMaterialCategory, string> = {
    GRANEN: 'Granen',
    HOP: 'Hop',
    GIST: 'Gist',
    TOEVOEGINGEN: 'Toevoegingen',
    VERPAKKING: 'Verpakking',
  };

  const hasWarnings =
    (dashboard?.expiredLots?.length ?? 0) > 0 ||
    (dashboard?.nearExpiryLots?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
          <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
          <span>/</span>
          <span className="text-brewery-dark font-medium">Voorraadbeheer Grondstoffen</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">Voorraadbeheer Grondstoffen</h1>
            <p className="text-gray-500 mt-1">{materials.length} grondstof{materials.length !== 1 ? 'fen' : ''} beheerd</p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={laadMaterialen}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </button>
            <button
              onClick={() => setShowNewMaterialModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brewery-dark text-white hover:opacity-90 transition-colors font-bold"
            >
              <Plus className="h-5 w-5" />
              Nieuw materiaal
            </button>
            <button
              onClick={() => setShowNewSupplierModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors font-bold"
            >
              <Plus className="h-5 w-5" />
              Leverancier
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Expiry Warning Panel - only show if there are warnings */}
        {hasWarnings && dashboard && (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 mb-6">
            <h3 className="font-bold text-red-900 mb-2">⚠️ Vervaldatum-waarschuwing</h3>
            <div className="space-y-1 text-sm text-red-800">
              {dashboard.expiredLots.length > 0 && (
                <p>
                  <strong>Afgelopen ({dashboard.expiredLots.length}):</strong>{' '}
                  {dashboard.expiredLots.map((l: any) => l.material.name).join(', ')}
                </p>
              )}
              {dashboard.nearExpiryLots.length > 0 && (
                <p>
                  <strong>Vervalt &lt; 14 d ({dashboard.nearExpiryLots.length}):</strong>{' '}
                  {dashboard.nearExpiryLots
                    .map((l: any) => `${l.material.name} (${l.daysUntilExpiry}d)`)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek grondstof…"
            value={zoekterm}
            onChange={e => setZoekterm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-sm"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              selectedCategory === null
                ? 'bg-brewery-dark text-white'
                : 'border border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-brewery-dark text-white'
                  : 'border border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Materials Table */}
        <div className="bg-white border-2 border-black overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brewery-dark text-white">
              <tr>
                <th
                  className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                  onClick={() => handleSort('name')}
                >
                  Grondstof
                  <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th
                  className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                  onClick={() => handleSort('category')}
                >
                  Categorie
                  <SortIcon col="category" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className="px-4 py-3 text-left font-bold">Eenheid</th>
                <th
                  className="px-4 py-3 text-right font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                  onClick={() => handleSort('availableQuantity')}
                >
                  In voorraad
                  <SortIcon col="availableQuantity" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className="px-4 py-3 text-center font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Acties</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Materialen laden…
                  </td>
                </tr>
              )}
              {!loading && materials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    {zoekterm ? 'Geen materialen gevonden.' : 'Nog geen materialen. Klik op "Nieuw materiaal" om te beginnen.'}
                  </td>
                </tr>
              )}
              {!loading && materials.length > 0 && materials
                .filter((m: any) =>
                  m.name.toLowerCase().includes(zoekterm.toLowerCase())
                )
                .sort((a: any, b: any) => {
                  let av: any = a[sortKey] ?? '';
                  let bv: any = b[sortKey] ?? '';
                  if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                  }
                  if (av < bv) return sortDir === 'asc' ? -1 : 1;
                  if (av > bv) return sortDir === 'asc' ? 1 : -1;
                  return 0;
                })
                .map((mat: Material, i: number) => {
                  const hasExpired = mat.lots.some(
                    (lot: any) => new Date(lot.expiryDate) < new Date()
                  );
                  const nearExpiry = mat.lots.some(
                    (lot: any) =>
                      new Date(lot.expiryDate) > new Date() &&
                      (new Date(lot.expiryDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24) <
                        14
                  );

                  return (
                    <tr
                      key={mat.id}
                      className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                    >
                      <td className="px-4 py-3 font-medium text-brewery-dark">{mat.name}</td>
                      <td className="px-4 py-3 text-gray-600">{categoryLabels[mat.category as RawMaterialCategory]}</td>
                      <td className="px-4 py-3 text-gray-600">{mat.unit}</td>
                      <td className="px-4 py-3 text-right font-mono">{mat.availableQuantity.toFixed(3)}</td>
                      <td className="px-4 py-3 text-center">
                        {hasExpired && (
                          <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            Vervallen
                          </span>
                        )}
                        {!hasExpired && nearExpiry && (
                          <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                            Bijna vervallen
                          </span>
                        )}
                        {!hasExpired && !nearExpiry && (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/brouwadministratie/voorraadbeheer-grondstoffen/grondstof/${mat.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-brewery-dark text-white text-xs font-bold hover:opacity-80 transition-colors"
                          >
                            Bekijken
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Link
            href="/admin/brouwadministratie/voorraadbeheer-grondstoffen/inslag"
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Inslag
          </Link>
          <Link
            href="/admin/brouwadministratie/voorraadbeheer-grondstoffen/uitslag"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Uitslag
          </Link>
          <Link
            href="/admin/brouwadministratie/voorraadbeheer-grondstoffen/audit"
            className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors"
          >
            Audit Log
          </Link>
        </div>

        {/* New Material Modal */}
        {showNewMaterialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border-2 border-black w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-brewery-dark">Nieuw materiaal</h2>
              <form onSubmit={handleNieuwMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Categorie *
                  </label>
                  <select
                    value={newMaterialCategory}
                    onChange={(e) => setNewMaterialCategory(e.target.value as RawMaterialCategory)}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Eenheid *
                  </label>
                  <input
                    type="text"
                    value={newMaterialUnit}
                    onChange={(e) => setNewMaterialUnit(e.target.value)}
                    placeholder="bijv. kg"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={creatingMaterial}
                    className="flex-1 bg-brewery-dark text-white font-bold py-2 hover:opacity-90 disabled:opacity-50"
                  >
                    {creatingMaterial ? 'Aanmaken…' : 'Aanmaken'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewMaterialModal(false)}
                    className="flex-1 bg-gray-300 text-black font-bold py-2 hover:bg-gray-400"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Supplier Modal */}
        {showNewSupplierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 border-2 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-brewery-dark">Nieuwe leverancier</h2>
              <form onSubmit={handleNieuwSupplier} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Naam *
                    </label>
                    <input
                      type="text"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Adres
                    </label>
                    <input
                      type="text"
                      value={newSupplierAddress}
                      onChange={(e) => setNewSupplierAddress(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      placeholder="Straat nr, postcode gemeente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Contactpersoon
                    </label>
                    <input
                      type="text"
                      value={newSupplierContact}
                      onChange={(e) => setNewSupplierContact(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      placeholder="Naam contactpersoon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Telefoon
                    </label>
                    <input
                      type="tel"
                      value={newSupplierPhone}
                      onChange={(e) => setNewSupplierPhone(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      placeholder="+32 ... ... .."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newSupplierEmail}
                      onChange={(e) => setNewSupplierEmail(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      placeholder="email@voorbeeld.be"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      KBO nummer
                    </label>
                    <input
                      type="text"
                      value={newSupplierKbo}
                      onChange={(e) => setNewSupplierKbo(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      placeholder="0123.456.789"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      FAVV registratienummer
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (✓ = gecontroleerd)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newSupplierFavv}
                      onChange={(e) => setNewSupplierFavv(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brewery-dark focus:outline-none"
                      placeholder="Bijv: BE12345"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={creatingSupplier}
                    className="flex-1 bg-brewery-dark text-white font-bold py-2 hover:opacity-90 disabled:opacity-50"
                  >
                    {creatingSupplier ? 'Aanmaken…' : 'Aanmaken'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewSupplierModal(false)}
                    className="flex-1 bg-gray-300 text-black font-bold py-2 hover:bg-gray-400"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
