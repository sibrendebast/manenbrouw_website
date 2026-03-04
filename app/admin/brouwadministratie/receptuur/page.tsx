"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getRecipes, createRecipe, deleteRecipe } from "@/app/actions/recipeActions";
import {
    Plus, ArrowLeft, Search, ChevronUp, ChevronDown, ChevronsUpDown,
    Pencil, Trash2, RefreshCw, FlaskConical
} from "lucide-react";
import Link from "next/link";

type SortKey = "naam" | "ogCalc" | "fgCalc" | "abvCalc" | "platoCalc" | "ibuCalc" | "ebcCalc" | "brouwEfficiency";
type SortDir = "asc" | "desc";

type Recipe = {
    id: string;
    naam: string;
    stijl: string | null;
    ogCalc: number | null;
    fgCalc: number | null;
    abvCalc: number | null;
    platoCalc: number | null;
    ibuCalc: number | null;
    ebcCalc: number | null;
    brouwEfficiency: number | null;
    createdAt: Date;
    updatedAt: Date;
};

const PER_PAGE = 20;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (col !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 inline ml-1" />;
    return sortDir === "asc"
        ? <ChevronUp className="h-3.5 w-3.5 text-brewery-green inline ml-1" />
        : <ChevronDown className="h-3.5 w-3.5 text-brewery-green inline ml-1" />;
}

export default function ReceptuurOverzicht() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [zoekterm, setZoekterm] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("naam");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [pagina, setPagina] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const laadRecepten = async () => {
        setLoading(true);
        const result = await getRecipes();
        if (result.success) {
            setRecipes(result.data as Recipe[]);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            laadRecepten();
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
        return recipes.filter(r =>
            r.naam.toLowerCase().includes(q) ||
            (r.stijl ?? "").toLowerCase().includes(q)
        );
    }, [recipes, zoekterm]);

    const gesorteerd = useMemo(() => {
        return [...gefilterd].sort((a, b) => {
            const av = a[sortKey] ?? "";
            const bv = b[sortKey] ?? "";
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [gefilterd, sortKey, sortDir]);

    const totaalPaginas = Math.max(1, Math.ceil(gesorteerd.length / PER_PAGE));
    const paginaData = gesorteerd.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

    const handleNieuwRecept = async () => {
        setCreating(true);
        const result = await createRecipe();
        if (result.success && result.id) {
            router.push(`/admin/brouwadministratie/receptuur/${result.id}`);
        } else {
            alert(result.error ?? "Kon recept niet aanmaken");
            setCreating(false);
        }
    };

    const handleVerwijder = async (id: string, naam: string) => {
        if (!confirm(`Recept "${naam}" definitief verwijderen?`)) return;
        setDeletingId(id);
        const result = await deleteRecipe(id);
        if (result.success) {
            await laadRecepten();
        } else {
            alert(result.error);
        }
        setDeletingId(null);
    };

    if (!mounted || !isAuthenticated) return null;

    const COLS: { key: SortKey; label: string; title?: string }[] = [
        { key: "naam", label: "Naam" },
        { key: "ogCalc", label: "OG", title: "Original Gravity (verwacht)" },
        { key: "fgCalc", label: "FG", title: "Final Gravity (verwacht)" },
        { key: "abvCalc", label: "ABV", title: "Alcohol By Volume % (verwacht)" },
        { key: "platoCalc", label: "Plato", title: "Graden Plato OG (verwacht)" },
        { key: "ibuCalc", label: "IBU", title: "International Bitterness Units (verwacht)" },
        { key: "ebcCalc", label: "EBC", title: "Kleurwaarde EBC (verwacht)" },
        { key: "brouwEfficiency", label: "Effic. %", title: "Brouwefficiëntie (%)" },
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
                    <span className="text-brewery-dark font-medium">Receptuur</span>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-brewery-dark">Receptuur</h1>
                        <p className="text-gray-500 mt-1">{recipes.length} recept{recipes.length !== 1 ? "en" : ""} opgeslagen</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={laadRecepten}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Vernieuwen
                        </button>
                        <button
                            onClick={handleNieuwRecept}
                            disabled={creating}
                            className="flex items-center gap-2 px-4 py-2 bg-brewery-dark text-white hover:opacity-90 transition-colors font-bold disabled:opacity-50"
                        >
                            <Plus className="h-5 w-5" />
                            {creating ? "Aanmaken…" : "Nieuw recept"}
                        </button>
                    </div>
                </div>

                {/* Zoekbalk */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Zoek op naam of stijl…"
                        value={zoekterm}
                        onChange={e => { setZoekterm(e.target.value); setPagina(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-sm"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Tabel */}
                <div className="bg-white border-2 border-black overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-brewery-dark text-white">
                            <tr>
                                {COLS.map(col => (
                                    <th
                                        key={col.key}
                                        title={col.title}
                                        className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                                        onClick={() => handleSort(col.key)}
                                    >
                                        {col.label}
                                        <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-left font-bold">Stijl</th>
                                <th className="px-4 py-3 text-right font-bold">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-16 text-center text-gray-400">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Recepten laden…
                                    </td>
                                </tr>
                            ) : paginaData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-16 text-center text-gray-400">
                                        <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        {zoekterm ? "Geen recepten gevonden voor deze zoekopdracht." : "Nog geen recepten. Klik op 'Nieuw recept' om te beginnen."}
                                    </td>
                                </tr>
                            ) : (
                                paginaData.map((r, i) => (
                                    <tr
                                        key={r.id}
                                        className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}
                                    >
                                        <td className="px-4 py-3 font-medium max-w-xs truncate">
                                            <Link href={`/admin/brouwadministratie/receptuur/${r.id}`} className="hover:underline">
                                                {r.naam}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.ogCalc ? r.ogCalc.toFixed(3) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.fgCalc ? r.fgCalc.toFixed(3) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.abvCalc != null ? `${r.abvCalc.toFixed(1)} %` : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.platoCalc != null ? `${r.platoCalc.toFixed(1)} °P` : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.ibuCalc != null ? r.ibuCalc.toFixed(1) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.ebcCalc != null ? r.ebcCalc.toFixed(1) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {r.brouwEfficiency != null ? `${r.brouwEfficiency} %` : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.stijl ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/brouwadministratie/receptuur/${r.id}`}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-brewery-dark text-white text-xs font-bold hover:opacity-80 transition-colors"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Bewerken
                                                </Link>
                                                <button
                                                    onClick={() => handleVerwijder(r.id, r.naam)}
                                                    disabled={deletingId === r.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    {deletingId === r.id ? "…" : ""}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginering */}
                {totaalPaginas > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-gray-500">
                            {(pagina - 1) * PER_PAGE + 1}–{Math.min(pagina * PER_PAGE, gesorteerd.length)} van {gesorteerd.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPagina(p => Math.max(1, p - 1))}
                                disabled={pagina === 1}
                                className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
                            >
                                ‹
                            </button>
                            {Array.from({ length: totaalPaginas }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPagina(p)}
                                    className={`px-3 py-1.5 border ${p === pagina ? "bg-brewery-dark text-white border-brewery-dark" : "border-gray-300 hover:bg-gray-100"}`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setPagina(p => Math.min(totaalPaginas, p + 1))}
                                disabled={pagina === totaalPaginas}
                                className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
