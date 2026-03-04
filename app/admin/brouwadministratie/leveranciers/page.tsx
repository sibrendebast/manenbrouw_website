'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { getSuppliers, createSupplier } from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, RefreshCw, Check, Building2, Mail, Phone, User, MapPin } from 'lucide-react';

type Supplier = any;

export default function LeveranciersPage() {
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const laadLeveranciers = async () => {
    setLoading(true);
    const res = await getSuppliers();
    if (res.success) setSuppliers((res.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) laadLeveranciers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleNieuwSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setCreatingSupplier(true);
    setError(null);
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
      laadLeveranciers();
    } else {
      setError(result.error || 'Kon leverancier niet aanmaken');
    }
    setCreatingSupplier(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
          <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
          <span>/</span>
          <span className="text-brewery-dark font-medium">Leveranciers</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">Leveranciers</h1>
            <p className="text-gray-500 mt-1">Beheer je leveranciers en hun gegevens</p>
          </div>
          <button
            onClick={() => setShowNewSupplierModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brewery-dark text-white font-bold hover:opacity-90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nieuwe leverancier
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-600 text-red-800 px-4 py-3 mb-6">
            <p className="font-medium">Fout</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm underline mt-2 hover:no-underline"
            >
              Sluiten
            </button>
          </div>
        )}

        {/* Leveranciers tabel */}
        <div className="bg-white border-2 border-black overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brewery-dark text-white">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Naam</th>
                <th className="px-4 py-3 text-left font-bold">Contactpersoon</th>
                <th className="px-4 py-3 text-left font-bold">Contact</th>
                <th className="px-4 py-3 text-left font-bold">Adres</th>
                <th className="px-4 py-3 text-left font-bold">KBO</th>
                <th className="px-4 py-3 text-center font-bold">FAVV</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Leveranciers laden…
                  </td>
                </tr>
              )}
              {!loading && suppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Nog geen leveranciers. Klik op &quot;Nieuwe leverancier&quot; om te beginnen.
                  </td>
                </tr>
              )}
              {!loading && suppliers.length > 0 && suppliers.map((supplier: Supplier, i: number) => (
                <tr
                  key={supplier.id}
                  className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                >
                  <td className="px-4 py-3 font-medium text-brewery-dark">
                    {supplier.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {supplier.contact ? (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {supplier.contact}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="space-y-1">
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {supplier.email}
                        </div>
                      )}
                      {!supplier.phone && !supplier.email && (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {supplier.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-sm">
                    {supplier.kboNumber || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {supplier.favvNumber ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-xs font-mono text-gray-600">{supplier.favvNumber}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
