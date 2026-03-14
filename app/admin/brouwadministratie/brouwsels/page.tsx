"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getBrouwsels, createBrouwsel, deleteBrouwsel, updateBrouwsel, getVolgendBrouwnummer } from "@/app/actions/brouwselActions";
import { getRecipes } from "@/app/actions/recipeActions";
import {
    Plus, ArrowLeft, Search, ChevronUp, ChevronDown, ChevronsUpDown,
    Pencil, Trash2, RefreshCw, X, Calendar, Save, FileDown
} from "lucide-react";
import Link from "next/link";

type SortKey = "brouwnummer" | "receptNaam" | "datum" | "aanvraagDatum" | "volume" | "ogGemeten" | "fgGemeten" | "abvGemeten";
type SortDir = "asc" | "desc";

type Brouwsel = {
    id: string;
    brouwnummer: string;
    recipeId: string;
    recipe: { naam: string; stijl: string | null };
    datum: Date;
    aanvraagDatum: Date | null;
    volume: number | null;
    ogGemeten: number | null;
    fgGemeten: number | null;
    abvGemeten: number | null;
    platoGemeten: number | null;
    brouwefficientieGemeten: number | null;
    createdAt: Date;
    updatedAt: Date;
};

type RecipeItem = {
    id: string;
    naam: string;
};

const PER_PAGE = 20;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (col !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 inline ml-1" />;
    return sortDir === "asc"
        ? <ChevronUp className="h-3.5 w-3.5 text-brewery-green inline ml-1" />
        : <ChevronDown className="h-3.5 w-3.5 text-brewery-green inline ml-1" />;
}

export default function BrouwselsOverzicht() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [brouwsels, setBrouwsels] = useState<Brouwsel[]>([]);
    const [recipes, setRecipes] = useState<RecipeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [zoekterm, setZoekterm] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("brouwnummer");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [pagina, setPagina] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [nextNum, setNextNum] = useState<string>("");

    const [formData, setFormData] = useState({
        brouwnummer: "",
        recipeId: "",
        datum: "",
        aanvraagDatum: "",
        volume: "",
        ogGemeten: "",
        fgGemeten: "",
        abvGemeten: "",
        platoGemeten: "",
        brouwefficientieGemeten: "",
    });

    const laadData = async () => {
        setLoading(true);
        const [bRes, rRes] = await Promise.all([getBrouwsels(), getRecipes()]);

        if (bRes.success) {
            setBrouwsels(bRes.data as Brouwsel[]);
        } else {
            setError(bRes.error);
        }

        if (rRes.success) {
            setRecipes(rRes.data as RecipeItem[]);
        }

        setLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            laadData();
        }
    }, [isAuthenticated, router]);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setPagina(1);
    };

    const gefilterd = useMemo(() => {
        const q = zoekterm.toLowerCase();
        return brouwsels.filter(b =>
            b.brouwnummer.toLowerCase().includes(q) ||
            b.recipe.naam.toLowerCase().includes(q)
        );
    }, [brouwsels, zoekterm]);

    const gesorteerd = useMemo(() => {
        return [...gefilterd].sort((a, b) => {
            let av: any = a[sortKey as keyof Brouwsel];
            let bv: any = b[sortKey as keyof Brouwsel];

            if (sortKey === "receptNaam") {
                av = a.recipe.naam;
                bv = b.recipe.naam;
            }
            if (sortKey === "datum" || sortKey === "aanvraagDatum") {
                av = a[sortKey] ? new Date(a[sortKey] as Date).getTime() : 0;
                bv = b[sortKey] ? new Date(b[sortKey] as Date).getTime() : 0;
            }

            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [gefilterd, sortKey, sortDir]);

    const totaalPaginas = Math.max(1, Math.ceil(gesorteerd.length / PER_PAGE));
    const paginaData = gesorteerd.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

    const handleOpenAanmaken = async () => {
        const nr = await getVolgendBrouwnummer();
        setNextNum(nr);
        setEditingId(null);
        setFormData({
            brouwnummer: nr, // Prefill with the next number
            recipeId: "",
            datum: new Date().toISOString().split("T")[0],
            aanvraagDatum: new Date().toISOString().split("T")[0],
            volume: "",
            ogGemeten: "", fgGemeten: "", abvGemeten: "", platoGemeten: "", brouwefficientieGemeten: "",
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (b: Brouwsel) => {
        setEditingId(b.id);
        setFormData({
            brouwnummer: b.brouwnummer,
            recipeId: b.recipeId,
            datum: new Date(b.datum).toISOString().split("T")[0],
            aanvraagDatum: b.aanvraagDatum ? new Date(b.aanvraagDatum).toISOString().split("T")[0] : "",
            volume: b.volume ? String(b.volume) : "",
            ogGemeten: b.ogGemeten ? String(b.ogGemeten) : "",
            fgGemeten: b.fgGemeten ? String(b.fgGemeten) : "",
            abvGemeten: b.abvGemeten ? String(b.abvGemeten) : "",
            platoGemeten: b.platoGemeten ? String(b.platoGemeten) : "",
            brouwefficientieGemeten: b.brouwefficientieGemeten ? String(b.brouwefficientieGemeten) : "",
        });
        setIsModalOpen(true);
    };

    const handleOpslaan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.recipeId) {
            alert("Selecteer een recept.");
            return;
        }

        setCreating(true);
        const payload = {
            brouwnummer: formData.brouwnummer || undefined,
            recipeId: formData.recipeId,
            datum: formData.datum,
            aanvraagDatum: formData.aanvraagDatum || null,
            volume: formData.volume ? parseFloat(formData.volume) : null,
            ogGemeten: formData.ogGemeten ? parseFloat(formData.ogGemeten) : null,
            fgGemeten: formData.fgGemeten ? parseFloat(formData.fgGemeten) : null,
            abvGemeten: formData.abvGemeten ? parseFloat(formData.abvGemeten) : null,
            platoGemeten: formData.platoGemeten ? parseFloat(formData.platoGemeten) : null,
            brouwefficientieGemeten: formData.brouwefficientieGemeten ? parseFloat(formData.brouwefficientieGemeten) : null,
        };

        let result;
        if (editingId) {
            result = await updateBrouwsel(editingId, payload);
        } else {
            result = await createBrouwsel(payload);
        }

        if (result.success) {
            setIsModalOpen(false);
            await laadData();
        } else {
            alert(result.error ?? "Kon brouwsel niet verwerken");
        }
        setCreating(false);
    };

    const handleVerwijder = async (id: string, bn: string) => {
        if (!confirm(`Brouwsel "${bn}" definitief verwijderen?`)) return;
        setDeletingId(id);
        const result = await deleteBrouwsel(id);
        if (result.success) {
            await laadData();
        } else {
            alert(result.error);
        }
        setDeletingId(null);
    };

    const handleDownloadAanvraag = async (b: Brouwsel) => {
        try {
            const res = await fetch(`/api/brouwsels/${b.id}/brouwaanvraag`);
            if (!res.ok) throw new Error("Document generation failed.");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Brouwaanvraag_${b.brouwnummer.replace('/', '-')}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            alert(e.message || "Kon brouwaanvraag niet downloaden.");
        }
    };

    if (!mounted || !isAuthenticated) return null;

    const COLS: { key: SortKey; label: string; title?: string }[] = [
        { key: "aanvraagDatum", label: "Aanvraag" },
        { key: "datum", label: "Brouwdatum" },
        { key: "brouwnummer", label: "Brouwnummer" },
        { key: "receptNaam", label: "Recept" },
        { key: "volume", label: "Volume (L)" },
        { key: "ogGemeten", label: "OG Gemeten" },
        { key: "fgGemeten", label: "FG Gemeten" },
        { key: "abvGemeten", label: "ABV Gemeten" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Broodkruimel */}
                <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
                    <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
                    <span>/</span>
                    <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
                    <span>/</span>
                    <span className="text-brewery-dark font-medium">Brouwsels</span>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-brewery-dark">Brouwsels</h1>
                        <p className="text-gray-500 mt-1">{brouwsels.length} brouwsel{brouwsels.length !== 1 ? "s" : ""} opgeslagen</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={laadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Vernieuwen
                        </button>
                        <button
                            onClick={handleOpenAanmaken}
                            className="flex items-center gap-2 px-4 py-2 bg-brewery-dark text-white hover:opacity-90 transition-colors font-bold"
                        >
                            <Plus className="h-5 w-5" />
                            Nieuw brouwsel
                        </button>
                    </div>
                </div>

                {/* Zoekbalk */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Zoek op brouwnummer of recept…"
                        value={zoekterm}
                        onChange={e => { setZoekterm(e.target.value); setPagina(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex gap-3 items-start">
                        <Trash2 className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-bold">Fout bij laden van data</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabel */}
                {!loading && brouwsels.length === 0 && !error ? (
                    <div className="text-center py-16 bg-white border-2 border-black">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-brewery-dark mb-2">Nog geen brouwsels</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Je hebt nog geen brouwsels toegevoegd. Voeg je eerste brouwsel toe om te starten met tracken.</p>
                        <button
                            onClick={handleOpenAanmaken}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brewery-dark text-white font-bold hover:shadow-lg transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Nieuw brouwsel
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border-2 border-black overflow-x-auto min-h-[400px]">
                            <table className="w-full text-sm">
                                <thead className="bg-brewery-dark text-white">
                                    <tr>
                                        {COLS.map(col => (
                                            <th key={col.key} title={col.title}
                                                className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:bg-black/20 whitespace-nowrap"
                                                onClick={() => handleSort(col.key)}>
                                                {col.label} <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-right font-bold w-24">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginaData.map((b, idx) => (
                                        <tr key={b.id} className={`border-t border-gray-200 hover:bg-green-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {b.aanvraagDatum ? new Intl.DateTimeFormat('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(b.aanvraagDatum)) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {new Intl.DateTimeFormat('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(b.datum))}
                                            </td>
                                            <td className="px-4 py-4 font-mono font-bold text-brewery-dark whitespace-nowrap">
                                                {b.brouwnummer}
                                            </td>
                                            <td className="px-4 py-4 font-bold">
                                                {b.recipe?.naam || <span className="text-red-500">Recept verwijderd</span>}
                                                {b.recipe?.stijl && <span className="block text-xs text-gray-400 font-normal mt-0.5">{b.recipe.stijl}</span>}
                                            </td>
                                            <td className="px-4 py-4 tabular-nums">
                                                {b.volume ? `${b.volume} L` : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-4 tabular-nums">
                                                {b.ogGemeten ? b.ogGemeten.toFixed(3) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-4 tabular-nums">
                                                {b.fgGemeten ? b.fgGemeten.toFixed(3) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-4 tabular-nums">
                                                {b.abvGemeten ? `${b.abvGemeten}%` : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDownloadAanvraag(b)}
                                                    className="p-2 text-gray-400 hover:text-brewery-green hover:bg-green-50 rounded transition-colors mr-1"
                                                    title="Brouwaanvraag downloaden"
                                                >
                                                    <FileDown className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(b)}
                                                    className="p-2 text-gray-400 hover:text-brewery-dark hover:bg-gray-100 rounded transition-colors mr-1"
                                                    title="Bewerk"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleVerwijder(b.id, b.brouwnummer)}
                                                    disabled={deletingId === b.id}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
                                                    title="Verwijder"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totaalPaginas > 1 && (
                            <div className="flex items-center justify-between mt-6 text-sm">
                                <span className="text-gray-500">
                                    {(pagina - 1) * PER_PAGE + 1}–{Math.min(pagina * PER_PAGE, gesorteerd.length)} van de {gesorteerd.length}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                                        disabled={pagina === 1}
                                        className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors bg-white font-medium"
                                    >
                                        Vorige
                                    </button>
                                    {Array.from({ length: totaalPaginas }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPagina(p)}
                                            className={`px-3 py-1.5 border transition-colors font-medium \${p === pagina ? "bg-brewery-dark text-white border-brewery-dark" : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPagina(p => Math.min(totaalPaginas, p + 1))}
                                        disabled={pagina === totaalPaginas}
                                        className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors bg-white font-medium"
                                    >
                                        Volgende
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Brouwsel Modal (Aanmaken / Bewerken) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white border-2 border-black max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b-2 border-black p-4 bg-brewery-dark text-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold font-heading">{editingId ? "Brouwsel bewerken" : "Nieuw Brouwsel"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="hover:text-gray-300 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleOpslaan} className="p-6">
                            <div className="space-y-6">
                                {/* Basisinformatie */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-brewery-dark uppercase tracking-widest border-b pb-1">Basisinformatie</h3>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Recept <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.recipeId}
                                            onChange={e => setFormData({ ...formData, recipeId: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-black"
                                        >
                                            <option value="">-- Selecteer Recept --</option>
                                            {recipes.map(r => (
                                                <option key={r.id} value={r.id}>{r.naam}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                Brouwnummer
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={editingId ? "" : `(Standaard: ${nextNum || "Automatisch"})`}
                                                value={formData.brouwnummer}
                                                onChange={e => setFormData({ ...formData, brouwnummer: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none placeholder:text-gray-400 text-black font-mono"
                                            />
                                            {!editingId && <p className="text-xs text-gray-500 mt-1">Standaard overgeslagen voor auto-nummering.</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                Brouwdatum <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.datum}
                                                    onChange={e => setFormData({ ...formData, datum: e.target.value })}
                                                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                Aanvraagdatum
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={formData.aanvraagDatum}
                                                    onChange={e => setFormData({ ...formData, aanvraagDatum: e.target.value })}
                                                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metingen */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-bold text-brewery-dark uppercase tracking-widest border-b pb-1">Metingen</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                Opgeleverd Volume (L)
                                            </label>
                                            <input
                                                type="number" step="0.1" placeholder="bv. 1000"
                                                value={formData.volume}
                                                onChange={e => setFormData({ ...formData, volume: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">OG Gemeten</label>
                                            <input
                                                type="number" step="0.001" placeholder="bv. 1.050"
                                                value={formData.ogGemeten}
                                                onChange={e => setFormData({ ...formData, ogGemeten: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">FG Gemeten</label>
                                            <input
                                                type="number" step="0.001" placeholder="bv. 1.010"
                                                value={formData.fgGemeten}
                                                onChange={e => setFormData({ ...formData, fgGemeten: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">ABV Gemeten (%)</label>
                                            <input
                                                type="number" step="0.1" placeholder="bv. 5.2"
                                                value={formData.abvGemeten}
                                                onChange={e => setFormData({ ...formData, abvGemeten: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Plato (°P)</label>
                                            <input
                                                type="number" step="0.1" placeholder="bv. 12"
                                                value={formData.platoGemeten}
                                                onChange={e => setFormData({ ...formData, platoGemeten: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Efficiëntie (%)</label>
                                            <input
                                                type="number" step="0.1" placeholder="bv. 75"
                                                value={formData.brouwefficientieGemeten}
                                                onChange={e => setFormData({ ...formData, brouwefficientieGemeten: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none text-black tabular-nums"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors text-black"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2.5 bg-brewery-dark text-white font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editingId ? "Bewerken" : "Toevoegen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
