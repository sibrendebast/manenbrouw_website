'use client';

import { useEffect, useState } from 'react';
import { createStockReceipt, getSuppliers, getRawMaterials } from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

type Supplier = any;
type Material = any;

interface FormLine {
  materialId: string;
  quantityReceived: number;
  totalCost: number;
  lotNumber: string;
  expiryDate: string;
}

export default function InslagPage() {
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    supplierId: '',
    invoiceNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    manufacturer: '',
    deviationFlag: false,
    deviationAction: 'GEEN_AFWIJKING' as const,
    deviationNotes: '',
    notes: '',
  });

  const [lines, setLines] = useState<FormLine[]>([
    {
      materialId: '',
      quantityReceived: 0,
      totalCost: 0,
      lotNumber: '',
      expiryDate: '',
    },
  ]);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) router.push('/admin/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!mounted) return;
    
    const fetch = async () => {
      const [supRes, matRes] = await Promise.all([
        getSuppliers(),
        getRawMaterials(),
      ]);
      if (supRes.success) setSuppliers((supRes.data as any[]) || []);
      if (matRes.success) setMaterials((matRes.data as any[]) || []);
      setLoading(false);
    };

    fetch();
  }, [mounted]);

  if (!mounted || !isAuthenticated) return null;

  const handleFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        materialId: '',
        quantityReceived: 0,
        totalCost: 0,
        lotNumber: '',
        expiryDate: '',
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (!form.supplierId) {
        setMessage('Selecteer een leverancier');
        setSubmitting(false);
        return;
      }

      if (lines.length === 0) {
        setMessage('Voeg minstens één regel toe');
        setSubmitting(false);
        return;
      }

      const validLines = lines.filter(
        (l) =>
          l.materialId &&
          l.quantityReceived > 0 &&
          l.totalCost >= 0 &&
          l.lotNumber &&
          l.expiryDate
      );

      if (validLines.length === 0) {
        setMessage('Vul alle velden in voor minstens één regel');
        setSubmitting(false);
        return;
      }

      const result = await createStockReceipt({
        supplierId: form.supplierId,
        invoiceNumber: form.invoiceNumber || undefined,
        receivedDate: new Date(form.receivedDate),
        manufacturer: form.manufacturer || undefined,
        deviationFlag: form.deviationFlag,
        deviationAction: form.deviationAction,
        deviationNotes: form.deviationNotes || undefined,
        notes: form.notes || undefined,
        lines: validLines.map((l) => ({
          materialId: l.materialId,
          quantityReceived: l.quantityReceived,
          unitCost: l.quantityReceived > 0 ? l.totalCost / l.quantityReceived : 0,
          lotNumber: l.lotNumber,
          expiryDate: new Date(l.expiryDate),
        })),
      });

      if (result.success) {
        setMessage('✓ Inslag succesvol opgeslagen!');
        setTimeout(() => {
          router.push('/admin/brouwadministratie/voorraadbeheer-grondstoffen');
        }, 1500);
      } else {
        setMessage(`Fout: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekend'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
          <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
          <span>/</span>
          <Link href="/admin/brouwadministratie/voorraadbeheer-grondstoffen" className="hover:text-brewery-dark">Voorraadbeheer grondstoffen</Link>
          <span>/</span>
          <span className="text-brewery-dark font-medium">Inslag</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">Inslag</h1>
            <p className="text-gray-500 mt-1">Ontvangst van grondstoffen registreren</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leveringsgegevens */}
          <div className="bg-white p-6 border-2 border-black space-y-4">
            <h3 className="font-bold text-brewery-dark text-lg">Leveringsgegevens</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Leverancier *
                </label>
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-400 py-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Laden…
                  </div>
                ) : (
                  <select
                    name="supplierId"
                    value={form.supplierId}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                  >
                    <option value="">-- Selecteer --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Factuurnummer
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={form.invoiceNumber}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ontvangstdatum
                </label>
                <input
                  type="date"
                  name="receivedDate"
                  value={form.receivedDate}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Fabricant
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="deviationFlag"
                id="deviation"
                checked={form.deviationFlag}
                onChange={handleFormChange}
                className="h-4 w-4"
              />
              <label htmlFor="deviation" className="text-sm font-semibold">
                Afwijking bij levering
              </label>
            </div>

            {form.deviationFlag && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Actie
                  </label>
                  <select
                    name="deviationAction"
                    value={form.deviationAction}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                  >
                    <option value="GEWEIGERD">Geweigerd</option>
                    <option value="RETOUR">Retour</option>
                    <option value="AFGEPRIJSD">Afgeprijsd</option>
                    <option value="VERNIETIGD">Vernietigd</option>
                    <option value="GEDEELTELIJK">Gedeeltelijk ontvangen</option>
                    <option value="QUARANTAINE">Quarantaine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Notitie
                  </label>
                  <input
                    type="text"
                    name="deviationNotes"
                    value={form.deviationNotes}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Opmerkingen
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                rows={2}
              />
            </div>
          </div>

          {/* Goederen */}
          <div className="bg-white border-2 border-black overflow-x-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-brewery-dark text-lg">Goederen</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-brewery-dark text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Grondstof *</th>
                  <th className="px-4 py-3 text-right font-bold">Hoeveelheid *</th>
                  <th className="px-4 py-3 text-right font-bold">Totaalprijs *</th>
                  <th className="px-4 py-3 text-right font-bold">Prijs/eenheid</th>
                  <th className="px-4 py-3 text-left font-bold">Lotnummer *</th>
                  <th className="px-4 py-3 text-left font-bold">Houdbaar tot *</th>
                  <th className="px-4 py-3 text-center font-bold">Acties</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3">
                      <select
                        value={line.materialId}
                        onChange={(e) =>
                          handleLineChange(idx, 'materialId', e.target.value)
                        }
                        className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm focus:border-brewery-dark focus:outline-none bg-white"
                      >
                        <option value="">-- Selecteer --</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.001"
                        value={line.quantityReceived}
                        onChange={(e) =>
                          handleLineChange(
                            idx,
                            'quantityReceived',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm text-right focus:border-brewery-dark focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="mr-1 text-gray-500">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={line.totalCost}
                          onChange={(e) =>
                            handleLineChange(
                              idx,
                              'totalCost',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm text-right focus:border-brewery-dark focus:outline-none bg-white"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                      {line.quantityReceived > 0
                        ? `€${(line.totalCost / line.quantityReceived).toFixed(4)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={line.lotNumber}
                        onChange={(e) =>
                          handleLineChange(idx, 'lotNumber', e.target.value)
                        }
                        className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm focus:border-brewery-dark focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={line.expiryDate}
                        onChange={(e) =>
                          handleLineChange(idx, 'expiryDate', e.target.value)
                        }
                        className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm focus:border-brewery-dark focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-2 px-4 py-2 bg-brewery-dark text-white hover:opacity-90 transition-colors font-bold text-sm"
              >
                <Plus className="h-4 w-4" />
                Nieuwe regel
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 text-sm ${
                message.startsWith('✓')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Link
              href="/admin/brouwadministratie/voorraadbeheer-grondstoffen"
              className="px-6 py-2 border-2 border-black text-black font-bold hover:bg-gray-100 transition-colors"
            >
              ← Terug
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brewery-dark text-white font-bold hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
