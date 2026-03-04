'use client';

import { useEffect, useState } from 'react';
import { createStockAllocation, getRawMaterials } from '@/app/actions/inventoryActions';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';

type Material = any;

interface AllocationLine {
  materialId: string;
  lotId: string;
  quantityAllocated: number;
}

export default function UitslagPage() {
  const { isAuthenticated } = useAdminStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    brewNumber: '',
    allocationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [lines, setLines] = useState<AllocationLine[]>([
    { materialId: '', lotId: '', quantityAllocated: 0 },
  ]);

  const [lotOptions, setLotOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) router.push('/admin/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!mounted) return;
    
    const fetch = async () => {
      // Get materials
      const matRes = await getRawMaterials();
      if (matRes.success) {
        const materials = (matRes.data as any[]) || [];
        setMaterials(materials);
        
        // Build lot options per material
        const lotOpts: Record<string, any[]> = {};
        materials.forEach((mat: any) => {
          lotOpts[mat.id] = (mat.lots || []).sort(
            (a: any, b: any) =>
              new Date(a.expiryDate).getTime() -
              new Date(b.expiryDate).getTime()
          );
        });
        setLotOptions(lotOpts);
      }
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted || !isAuthenticated) return null;

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (index: number, updates: Record<string, any>) => {
    setLines((prev) => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], ...updates };
      return newLines;
    });
  };

  const addLine = () => {
    setLines([
      ...lines,
      { materialId: '', lotId: '', quantityAllocated: 0 },
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
      if (!form.brewNumber) {
        setMessage('Selecteer een brouwsel');
        setSubmitting(false);
        return;
      }

      const validLines = lines.filter(
        (l) => l.materialId && l.lotId && l.quantityAllocated > 0
      );

      if (validLines.length === 0) {
        setMessage('Voeg minstens één regel toe met alle gegevens');
        setSubmitting(false);
        return;
      }

      const result = await createStockAllocation({
        brewNumber: form.brewNumber,
        allocationDate: new Date(form.allocationDate),
        notes: form.notes || undefined,
        lines: validLines,
      });

      if (result.success) {
        setMessage('✓ Allocatie succesvol opgeslagen!');
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

  const getLotLabel = (lot: any) => {
    const available =
      Number(lot.quantityTotal) - Number(lot.quantityAllocated);
    const daysUntilExpiry = Math.floor(
      (new Date(lot.expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return `${lot.lotNumber} (Beschikb: ${available.toFixed(3)}, Vervalt: ${daysUntilExpiry}d)`;
  };

  const getTotalCost = () => {
    let total = 0;
    lines.forEach((line) => {
      if (line.lotId) {
        const lots = lotOptions[line.materialId] || [];
        const lot = lots.find((l: any) => l.id === line.lotId);
        if (lot) {
          total += line.quantityAllocated * Number(lot.unitCost);
        }
      }
    });
    return total.toFixed(2);
  };

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
          <span className="text-brewery-dark font-medium">Uitslag</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brewery-dark">Uitslag naar Brouwsel</h1>
            <p className="text-gray-500 mt-1">Toewijzing van grondstoffen aan brouwsels registreren</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brouwselgegevens */}
          <div className="bg-white p-6 border-2 border-black space-y-4">
            <h3 className="font-bold text-brewery-dark text-lg">Brouwselgegevens</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Brouwselnummer *
                </label>
                <input
                  type="text"
                  name="brewNumber"
                  value={form.brewNumber}
                  onChange={handleFormChange}
                  placeholder="bv. 2025/001"
                  className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Allocatiedatum
                </label>
                <input
                  type="date"
                  name="allocationDate"
                  value={form.allocationDate}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 px-3 py-2 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                />
              </div>
            </div>

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

          {/* Ingrediënten */}
          <div className="bg-white border-2 border-black overflow-x-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-brewery-dark text-lg">Ingrediënten</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-brewery-dark text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Grondstof *</th>
                  <th className="px-4 py-3 text-right font-bold">Hoeveelheid *</th>
                  <th className="px-4 py-3 text-left font-bold">Lot (FEFO) *</th>
                  <th className="px-4 py-3 text-right font-bold">Kostprijs</th>
                  <th className="px-4 py-3 text-center font-bold">Acties</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const availableLots = lotOptions[line.materialId] || [];
                  const selectedLot = availableLots.find(
                    (l: any) => l.id === line.lotId
                  );
                  const lineCost =
                    line.quantityAllocated *
                    (selectedLot
                      ? Number(selectedLot.unitCost)
                      : 0);

                  return (
                    <tr key={idx} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="px-4 py-3">
                        <select
                          value={line.materialId}
                          onChange={(e) => {
                            handleLineChange(idx, { materialId: e.target.value, lotId: '' });
                          }}
                          className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm focus:border-brewery-dark focus:outline-none bg-white"
                        >
                          <option value="">-- Selecteer --</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.001"
                          value={line.quantityAllocated}
                          onChange={(e) =>
                            handleLineChange(idx, { quantityAllocated: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm text-right focus:border-brewery-dark focus:outline-none bg-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {availableLots.length === 0 ? (
                          <span className="text-gray-400 text-xs">
                            Geen loten beschikbaar
                          </span>
                        ) : (
                          <select
                            value={line.lotId}
                            onChange={(e) =>
                              handleLineChange(idx, { lotId: e.target.value })
                            }
                            className="w-full border-2 border-gray-200 px-2 py-1.5 text-sm focus:border-brewery-dark focus:outline-none bg-white"
                          >
                            <option value="">-- Selecteer --</option>
                            {availableLots.map((lot: any) => (
                              <option key={lot.id} value={lot.id}>
                                {getLotLabel(lot)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono">
                        €{lineCost.toFixed(2)}
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
                  );
                })}
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

          {/* Total Cost */}
          <div className="bg-white border-2 border-black p-4 text-right">
            <div className="font-bold text-lg text-brewery-dark">
              Totale kostprijs: € {getTotalCost()}
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
