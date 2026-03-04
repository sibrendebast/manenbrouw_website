"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import {
    getWerkregisterEntries,
    createWerkregisterEntry,
    updateWerkregisterEntry,
    deleteWerkregisterEntry,
} from "@/app/actions/werkregisterActions";
import { getBrouwsels } from "@/app/actions/brouwselActions";
import {
    getOngedierteInspecties,
    createOngedierteInspectie,
    updateOngedierteInspectie,
    deleteOngedierteInspectie,
} from "@/app/actions/ongedierteActions";
import {
    getCcpEntries,
    createCcpEntry,
    updateCcpEntry,
    deleteCcpEntry,
} from "@/app/actions/ccpActions";
import {
    Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown,
    Trash2, RefreshCw, BookOpen, X, Check, Minus, Pencil,
} from "lucide-react";
import Link from "next/link";

// ─── Werkregister types ──────────────────────────────────────────────────────

type Handeling = "BROUWEN" | "OVERHEVELEN" | "BOTTELEN_KEGGEN" | "VERNIETIGING";

const HANDELING_LABELS: Record<Handeling, string> = {
    BROUWEN: "Brouwen",
    OVERHEVELEN: "Overhevelen",
    BOTTELEN_KEGGEN: "Bottelen / Keggen",
    VERNIETIGING: "Vernietiging",
};

const TANK_OPTIONS = ['Jay - 300l', 'Devon - 300l', 'Randy - 600l'];

type WerkEntry = {
    id: string;
    datum: string;
    handeling: Handeling;
    brouwaanvraagDatum: string | null;
    brouwaanvraagNummer: string | null;
    brouwnummer: string | null;
    volume: number | null;
    fermentatievat: string | null;
};

type WerkSortKey = "datum" | "handeling" | "brouwaanvraagDatum" | "brouwaanvraagNummer" | "brouwnummer" | "volume" | "fermentatievat";

// ─── Ongedierte types ────────────────────────────────────────────────────────

type OngedierteEntry = {
    id: string;
    datum: string;
    verantwoordelijke: string;
    brouwcontainer: boolean;
    kelder: boolean;
    omgeving: boolean;
    afvalcontainer: boolean;
    opmerkingen: string | null;
    actie: string | null;
};

type OngedierteSortKey = "datum" | "verantwoordelijke";

// ─── CCP types ───────────────────────────────────────────────────────────────

type CcpTypeKey = "GLASBREUK" | "SCHIMMELVORMING";

type CcpEntry = {
    id: string;
    type: CcpTypeKey;
    datum: string;
    lotnummer: string | null;
    uitgevoerd: boolean;
    uitvoerder: string | null;
};

type CcpSortKey = "datum" | "lotnummer" | "uitvoerder";

// ─── Shared ──────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";
type TabKey = "werkregister" | "ongedierte" | "ccp_glasbreuk" | "ccp_schimmel";

const PER_PAGE = 20;

const TABS: { key: TabKey; label: string }[] = [
    { key: "werkregister", label: "Werkregister" },
    { key: "ongedierte", label: "Ongediertebestrijding" },
    { key: "ccp_glasbreuk", label: "CCP Glasbreuk" },
    { key: "ccp_schimmel", label: "CCP Schimmelvorming" },
];

function formatDate(isoStr: string | null): string {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleDateString("nl-BE", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
}

function SortIcon<T extends string>({ col, sortKey, sortDir }: { col: T; sortKey: T; sortDir: SortDir }) {
    if (col !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 inline ml-1" />;
    return sortDir === "asc"
        ? <ChevronUp className="h-3.5 w-3.5 text-brewery-green inline ml-1" />
        : <ChevronDown className="h-3.5 w-3.5 text-brewery-green inline ml-1" />;
}

function BoolIcon({ value }: { value: boolean }) {
    return value
        ? <Check className="h-4 w-4 text-green-600 mx-auto" />
        : <Minus className="h-4 w-4 text-gray-300 mx-auto" />;
}

// ─── Add Werkregister Modal ──────────────────────────────────────────────────

// ─── Werkregister Modal ──────────────────────────────────────────────────────

function WerkregisterModal({ editEntry, onClose, onSaved }: { editEntry?: WerkEntry | null; onClose: () => void; onSaved: () => void }) {
    const [saving, setSaving] = useState(false);
    const [loadingBrouwsels, setLoadingBrouwsels] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [brouwselLijst, setBrouwselLijst] = useState<{ brouwnummer: string; recipeName: string }[]>([]);

    const today = new Date().toISOString().split("T")[0];
    const [datum, setDatum] = useState(editEntry ? editEntry.datum.split("T")[0] : today);
    const [handeling, setHandeling] = useState<Handeling>(editEntry?.handeling ?? "BROUWEN");
    const [brouwaanvraagDatum, setBrouwaanvraagDatum] = useState(editEntry?.brouwaanvraagDatum ? editEntry.brouwaanvraagDatum.split("T")[0] : "");
    const [brouwaanvraagNummer, setBrouwaanvraagNummer] = useState(editEntry?.brouwaanvraagNummer ?? "");
    const [brouwnummer, setBrouwnummer] = useState(editEntry?.brouwnummer ?? "");
    const [volume, setVolume] = useState(editEntry?.volume?.toString() ?? "");
    const [fermentatievat, setFermentatievat] = useState(editEntry?.fermentatievat ?? "");

    useEffect(() => {
        async function vinkBrouwsels() {
            setLoadingBrouwsels(true);
            const r = await getBrouwsels();
            if (r.success) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setBrouwselLijst(r.data.map((b: any) => ({
                    brouwnummer: b.brouwnummer,
                    recipeName: b.recipe?.naam ?? "Onbekend recept"
                })));
            }
            setLoadingBrouwsels(false);
        }
        vinkBrouwsels();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!datum) { setError("Datum is verplicht."); return; }
        setSaving(true);
        setError(null);

        const payload = {
            datum, handeling,
            brouwaanvraagDatum: brouwaanvraagDatum || null,
            brouwaanvraagNummer: brouwaanvraagNummer || null,
            brouwnummer: brouwnummer || null,
            volume: volume ? parseFloat(volume) : null,
            fermentatievat: fermentatievat || null,
        };

        const result = editEntry
            ? await updateWerkregisterEntry(editEntry.id, payload)
            : await createWerkregisterEntry(payload);

        if (result.success) { onSaved(); onClose(); }
        else { setError(result.error ?? "Opslaan mislukt."); setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white border-2 border-black w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-brewery-dark text-white">
                    <h2 className="text-lg font-bold">{editEntry ? "Registratie bewerken" : "Nieuwe registratie"}</h2>
                    <button onClick={onClose} className="hover:opacity-70"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-bold mb-1">Handeling *</label>
                        <select value={handeling} onChange={e => setHandeling(e.target.value as Handeling)}
                            className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none">
                            {Object.entries(HANDELING_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Datum *</label>
                        <input type="date" value={datum} onChange={e => setDatum(e.target.value)} required
                            className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Brouwaanvraag datum</label>
                            <input type="date" value={brouwaanvraagDatum} onChange={e => setBrouwaanvraagDatum(e.target.value)}
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Brouwaanvraag nr</label>
                            <input type="text" value={brouwaanvraagNummer} onChange={e => setBrouwaanvraagNummer(e.target.value)}
                                placeholder="bv. 2025/009"
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Brouwnummer</label>
                        <select
                            value={brouwnummer}
                            onChange={e => setBrouwnummer(e.target.value)}
                            className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none bg-white">
                            <option value="">— Selecteer brouwsel —</option>
                            {brouwselLijst.map(b => (
                                <option key={b.brouwnummer} value={b.brouwnummer}>
                                    {b.brouwnummer} - {b.recipeName}
                                </option>
                            ))}
                        </select>
                        {loadingBrouwsels && <p className="text-xs text-gray-400 mt-1">Brouwsels laden…</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Volume (liter)</label>
                            <input type="number" step="any" value={volume} onChange={e => setVolume(e.target.value)}
                                placeholder="bv. 250"
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Fermentatievat</label>
                            <select value={fermentatievat} onChange={e => setFermentatievat(e.target.value)}
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none bg-white">
                                <option value="">— Geen tank —</option>
                                {TANK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border-2 border-black text-sm font-bold hover:bg-gray-100 transition-colors">Annuleren</button>
                        <button type="submit" disabled={saving}
                            className="px-4 py-2 bg-brewery-dark text-white text-sm font-bold hover:opacity-90 transition-colors disabled:opacity-50">
                            {saving ? "Opslaan…" : "Opslaan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Ongedierte Modal ────────────────────────────────────────────────────────

function OngedierteModal({ editEntry, onClose, onSaved }: { editEntry?: OngedierteEntry | null; onClose: () => void; onSaved: () => void }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const today = new Date().toISOString().split("T")[0];
    const [datum, setDatum] = useState(editEntry ? editEntry.datum.split("T")[0] : today);
    const [verantwoordelijke, setVerantwoordelijke] = useState(editEntry?.verantwoordelijke ?? "Sibren");
    const [customVerantwoordelijke, setCustomVerantwoordelijke] = useState("");
    const isCustom = (verantwoordelijke !== "Sibren" && verantwoordelijke !== "Tom" && !editEntry) || (editEntry && verantwoordelijke !== "Sibren" && verantwoordelijke !== "Tom");

    const [brouwcontainer, setBrouwcontainer] = useState(editEntry?.brouwcontainer ?? true);
    const [kelder, setKelder] = useState(editEntry?.kelder ?? true);
    const [omgeving, setOmgeving] = useState(editEntry?.omgeving ?? true);
    const [afvalcontainer, setAfvalcontainer] = useState(editEntry?.afvalcontainer ?? true);
    const [opmerkingen, setOpmerkingen] = useState(editEntry?.opmerkingen ?? "Geen activiteit");
    const [actie, setActie] = useState(editEntry?.actie ?? "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalVerantwoordelijke = verantwoordelijke === "__custom__" ? customVerantwoordelijke.trim() : verantwoordelijke;
        if (!datum || !finalVerantwoordelijke) {
            setError("Datum en verantwoordelijke zijn verplicht.");
            return;
        }
        setSaving(true);
        setError(null);

        const payload = {
            datum, verantwoordelijke: finalVerantwoordelijke,
            brouwcontainer, kelder, omgeving, afvalcontainer,
            opmerkingen: opmerkingen || null,
            actie: actie || null,
        };

        const result = editEntry
            ? await updateOngedierteInspectie(editEntry.id, payload)
            : await createOngedierteInspectie(payload);

        if (result.success) { onSaved(); onClose(); }
        else { setError(result.error ?? "Opslaan mislukt."); setSaving(false); }
    };

    const checkboxStyle = "h-5 w-5 accent-brewery-dark cursor-pointer";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white border-2 border-black w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-brewery-dark text-white">
                    <h2 className="text-lg font-bold">{editEntry ? "Inspectie bewerken" : "Nieuwe inspectie"}</h2>
                    <button onClick={onClose} className="hover:opacity-70"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Datum *</label>
                            <input type="date" value={datum} onChange={e => setDatum(e.target.value)} required
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Verantwoordelijke *</label>
                            <select value={verantwoordelijke === "Sibren" || verantwoordelijke === "Tom" ? verantwoordelijke : "__custom__"} onChange={e => setVerantwoordelijke(e.target.value)}
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none">
                                <option value="Sibren">Sibren</option>
                                <option value="Tom">Tom</option>
                                <option value="__custom__">Anders…</option>
                            </select>
                            {(verantwoordelijke === "__custom__" || (editEntry && verantwoordelijke !== "Sibren" && verantwoordelijke !== "Tom")) && (
                                <input type="text" value={verantwoordelijke === "__custom__" ? customVerantwoordelijke : verantwoordelijke} onChange={e => {
                                    if (verantwoordelijke === "__custom__") setCustomVerantwoordelijke(e.target.value);
                                    else setVerantwoordelijke(e.target.value);
                                }}
                                    placeholder="Naam invullen" required
                                    className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none mt-2" />
                            )}
                        </div>
                    </div>

                    <fieldset className="border-2 border-gray-200 p-4">
                        <legend className="text-sm font-bold px-2">Controle zones</legend>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            {([
                                ["brouwcontainer", "Brouwcontainer", brouwcontainer, setBrouwcontainer],
                                ["kelder", "Kelder", kelder, setKelder],
                                ["omgeving", "Omgeving", omgeving, setOmgeving],
                                ["afvalcontainer", "Afvalcontainer", afvalcontainer, setAfvalcontainer],
                            ] as [string, string, boolean, (v: boolean) => void][]).map(([key, label, val, setter]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} className={checkboxStyle} />
                                    <span className="text-sm">{label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <label className="block text-sm font-bold mb-1">Status</label>
                        <select value={opmerkingen} onChange={e => setOpmerkingen(e.target.value)}
                            className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none">
                            <option value="Geen activiteit">Geen activiteit</option>
                            <option value="Sporen van ongedierte gevonden">Sporen van ongedierte gevonden</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Actie</label>
                        <textarea value={actie} onChange={e => setActie(e.target.value)}
                            rows={2} placeholder="Eventuele genomen acties"
                            className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none resize-y" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border-2 border-black text-sm font-bold hover:bg-gray-100 transition-colors">Annuleren</button>
                        <button type="submit" disabled={saving}
                            className="px-4 py-2 bg-brewery-dark text-white text-sm font-bold hover:opacity-90 transition-colors disabled:opacity-50">
                            {saving ? "Opslaan…" : "Opslaan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── CCP Modal ───────────────────────────────────────────────────────────

function CcpModal({ editEntry, ccpType, label, onClose, onSaved }: { editEntry?: CcpEntry | null; ccpType: CcpTypeKey; label: string; onClose: () => void; onSaved: () => void }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const today = new Date().toISOString().split("T")[0];
    const [datum, setDatum] = useState(editEntry ? editEntry.datum.split("T")[0] : today);
    const [lotnummer, setLotnummer] = useState(editEntry?.lotnummer ?? "");
    const [uitgevoerd, setUitgevoerd] = useState(editEntry?.uitgevoerd ?? true);
    const [uitvoerder, setUitvoerder] = useState(editEntry?.uitvoerder ?? "Sibren");
    const [customUitvoerder, setCustomUitvoerder] = useState("");
    const isCustom = (uitvoerder !== "Sibren" && uitvoerder !== "Tom" && !editEntry) || (editEntry && uitvoerder !== "Sibren" && uitvoerder !== "Tom");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalUitvoerder = uitvoerder === "__custom__" ? customUitvoerder.trim() : uitvoerder;
        if (!datum) { setError("Datum is verplicht."); return; }
        setSaving(true);
        setError(null);

        const payload = {
            type: ccpType,
            datum,
            lotnummer: lotnummer || null,
            uitgevoerd,
            uitvoerder: finalUitvoerder || null,
        };

        const result = editEntry
            ? await updateCcpEntry(editEntry.id, payload)
            : await createCcpEntry(payload);

        if (result.success) { onSaved(); onClose(); }
        else { setError(result.error ?? "Opslaan mislukt."); setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white border-2 border-black w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-brewery-dark text-white">
                    <h2 className="text-lg font-bold">{editEntry ? `${label} controle bewerken` : `Nieuwe ${label} controle`}</h2>
                    <button onClick={onClose} className="hover:opacity-70"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Datum *</label>
                            <input type="date" value={datum} onChange={e => setDatum(e.target.value)} required
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Lotnummer</label>
                            <input type="text" value={lotnummer} onChange={e => setLotnummer(e.target.value)}
                                placeholder="bv. 2025/007"
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Uitvoerder</label>
                            <select value={uitvoerder === "Sibren" || uitvoerder === "Tom" ? uitvoerder : "__custom__"} onChange={e => setUitvoerder(e.target.value)}
                                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none">
                                <option value="Sibren">Sibren</option>
                                <option value="Tom">Tom</option>
                                <option value="__custom__">Anders…</option>
                            </select>
                            {(uitvoerder === "__custom__" || (editEntry && uitvoerder !== "Sibren" && uitvoerder !== "Tom")) && (
                                <input type="text" value={uitvoerder === "__custom__" ? customUitvoerder : uitvoerder} onChange={e => {
                                    if (uitvoerder === "__custom__") setCustomUitvoerder(e.target.value);
                                    else setUitvoerder(e.target.value);
                                }}
                                    placeholder="Naam invullen" required
                                    className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:border-brewery-dark focus:outline-none mt-2" />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">CCP uitgevoerd</label>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input type="checkbox" checked={uitgevoerd} onChange={e => setUitgevoerd(e.target.checked)}
                                    className="h-5 w-5 accent-brewery-dark cursor-pointer" />
                                <span className="text-sm">{uitgevoerd ? "Ja" : "Nee"}</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border-2 border-black text-sm font-bold hover:bg-gray-100 transition-colors">Annuleren</button>
                        <button type="submit" disabled={saving}
                            className="px-4 py-2 bg-brewery-dark text-white text-sm font-bold hover:opacity-90 transition-colors disabled:opacity-50">
                            {saving ? "Opslaan…" : "Opslaan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Logboek() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("werkregister");

    // ── Werkregister state ──
    const [werkEntries, setWerkEntries] = useState<WerkEntry[]>([]);
    const [werkLoading, setWerkLoading] = useState(true);
    const [werkError, setWerkError] = useState<string | null>(null);
    const [werkZoekterm, setWerkZoekterm] = useState("");
    const [werkSortKey, setWerkSortKey] = useState<WerkSortKey>("datum");
    const [werkSortDir, setWerkSortDir] = useState<SortDir>("desc");
    const [werkPagina, setWerkPagina] = useState(1);
    const [werkDeletingId, setWerkDeletingId] = useState<string | null>(null);
    const [showAddWerk, setShowAddWerk] = useState(false);

    // ── Ongedierte state ──
    const [ongEntries, setOngEntries] = useState<OngedierteEntry[]>([]);
    const [ongLoading, setOngLoading] = useState(true);
    const [ongError, setOngError] = useState<string | null>(null);
    const [ongZoekterm, setOngZoekterm] = useState("");
    const [ongSortKey, setOngSortKey] = useState<OngedierteSortKey>("datum");
    const [ongSortDir, setOngSortDir] = useState<SortDir>("desc");
    const [ongPagina, setOngPagina] = useState(1);
    const [ongDeletingId, setOngDeletingId] = useState<string | null>(null);
    const [showAddOng, setShowAddOng] = useState(false);

    // ── CCP Glasbreuk state ──
    const [glasEntries, setGlasEntries] = useState<CcpEntry[]>([]);
    const [glasLoading, setGlasLoading] = useState(true);
    const [glasError, setGlasError] = useState<string | null>(null);
    const [glasZoekterm, setGlasZoekterm] = useState("");
    const [glasSortKey, setGlasSortKey] = useState<CcpSortKey>("datum");
    const [glasSortDir, setGlasSortDir] = useState<SortDir>("desc");
    const [glasPagina, setGlasPagina] = useState(1);
    const [glasDeletingId, setGlasDeletingId] = useState<string | null>(null);
    const [showAddGlas, setShowAddGlas] = useState(false);

    // ── CCP Schimmelvorming state ──
    const [schimEntries, setSchimEntries] = useState<CcpEntry[]>([]);
    const [schimLoading, setSchimLoading] = useState(true);
    const [schimError, setSchimError] = useState<string | null>(null);
    const [schimZoekterm, setSchimZoekterm] = useState("");
    const [schimSortKey, setSchimSortKey] = useState<CcpSortKey>("datum");
    const [schimSortDir, setSchimSortDir] = useState<SortDir>("desc");
    const [schimPagina, setSchimPagina] = useState(1);
    const [schimDeletingId, setSchimDeletingId] = useState<string | null>(null);
    const [showAddSchim, setShowAddSchim] = useState(false);

    // ── Edit states ──
    const [editWerk, setEditWerk] = useState<WerkEntry | null>(null);
    const [editOng, setEditOng] = useState<OngedierteEntry | null>(null);
    const [editGlas, setEditGlas] = useState<CcpEntry | null>(null);
    const [editSchim, setEditSchim] = useState<CcpEntry | null>(null);

    // ── Loaders ──

    const laadWerk = async () => {
        setWerkLoading(true);
        const r = await getWerkregisterEntries();
        if (r.success) setWerkEntries(r.data as WerkEntry[]);
        else setWerkError(r.error ?? "Laden mislukt.");
        setWerkLoading(false);
    };

    const laadOng = async () => {
        setOngLoading(true);
        const r = await getOngedierteInspecties();
        if (r.success) setOngEntries(r.data as OngedierteEntry[]);
        else setOngError(r.error ?? "Laden mislukt.");
        setOngLoading(false);
    };

    const laadGlas = async () => {
        setGlasLoading(true);
        const r = await getCcpEntries("GLASBREUK");
        if (r.success) setGlasEntries(r.data as CcpEntry[]);
        else setGlasError(r.error ?? "Laden mislukt.");
        setGlasLoading(false);
    };

    const laadSchim = async () => {
        setSchimLoading(true);
        const r = await getCcpEntries("SCHIMMELVORMING");
        if (r.success) setSchimEntries(r.data as CcpEntry[]);
        else setSchimError(r.error ?? "Laden mislukt.");
        setSchimLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            laadWerk();
            laadOng();
            laadGlas();
            laadSchim();
        }
    }, [isAuthenticated, router]);

    // ── Handlers ──

    const handleWerkSort = (key: WerkSortKey) => {
        if (key === werkSortKey) setWerkSortDir(d => d === "asc" ? "desc" : "asc");
        else { setWerkSortKey(key); setWerkSortDir("asc"); }
        setWerkPagina(1);
    };

    const handleOngSort = (key: OngedierteSortKey) => {
        if (key === ongSortKey) setOngSortDir(d => d === "asc" ? "desc" : "asc");
        else { setOngSortKey(key); setOngSortDir("asc"); }
        setOngPagina(1);
    };

    const handleWerkDelete = async (id: string) => {
        if (!confirm("Deze registratie definitief verwijderen?")) return;
        setWerkDeletingId(id);
        const r = await deleteWerkregisterEntry(id);
        if (r.success) await laadWerk(); else alert(r.error);
        setWerkDeletingId(null);
    };

    const handleOngDelete = async (id: string) => {
        if (!confirm("Deze inspectie definitief verwijderen?")) return;
        setOngDeletingId(id);
        const r = await deleteOngedierteInspectie(id);
        if (r.success) await laadOng(); else alert(r.error);
        setOngDeletingId(null);
    };

    const handleGlasSortFn = (key: CcpSortKey) => {
        if (key === glasSortKey) setGlasSortDir(d => d === "asc" ? "desc" : "asc");
        else { setGlasSortKey(key); setGlasSortDir("asc"); }
        setGlasPagina(1);
    };

    const handleSchimSortFn = (key: CcpSortKey) => {
        if (key === schimSortKey) setSchimSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSchimSortKey(key); setSchimSortDir("asc"); }
        setSchimPagina(1);
    };

    const handleGlasDelete = async (id: string) => {
        if (!confirm("Deze CCP-registratie definitief verwijderen?")) return;
        setGlasDeletingId(id);
        const r = await deleteCcpEntry(id);
        if (r.success) await laadGlas(); else alert(r.error);
        setGlasDeletingId(null);
    };

    const handleSchimDelete = async (id: string) => {
        if (!confirm("Deze CCP-registratie definitief verwijderen?")) return;
        setSchimDeletingId(id);
        const r = await deleteCcpEntry(id);
        if (r.success) await laadSchim(); else alert(r.error);
        setSchimDeletingId(null);
    };

    // ── Werkregister filter/sort/page ──

    const werkGefilterd = useMemo(() => {
        const q = werkZoekterm.toLowerCase();
        if (!q) return werkEntries;
        return werkEntries.filter(e =>
            (HANDELING_LABELS[e.handeling] ?? "").toLowerCase().includes(q) ||
            (e.brouwaanvraagNummer ?? "").toLowerCase().includes(q) ||
            (e.brouwnummer ?? "").toLowerCase().includes(q) ||
            (e.fermentatievat ?? "").toLowerCase().includes(q)
        );
    }, [werkEntries, werkZoekterm]);

    const werkGesorteerd = useMemo(() => {
        return [...werkGefilterd].sort((a, b) => {
            const av = a[werkSortKey] ?? "";
            const bv = b[werkSortKey] ?? "";
            if (av < bv) return werkSortDir === "asc" ? -1 : 1;
            if (av > bv) return werkSortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [werkGefilterd, werkSortKey, werkSortDir]);

    const werkTotaalPaginas = Math.max(1, Math.ceil(werkGesorteerd.length / PER_PAGE));
    const werkPaginaData = werkGesorteerd.slice((werkPagina - 1) * PER_PAGE, werkPagina * PER_PAGE);

    // ── Ongedierte filter/sort/page ──

    const ongGefilterd = useMemo(() => {
        const q = ongZoekterm.toLowerCase();
        if (!q) return ongEntries;
        return ongEntries.filter(e =>
            e.verantwoordelijke.toLowerCase().includes(q) ||
            (e.opmerkingen ?? "").toLowerCase().includes(q) ||
            (e.actie ?? "").toLowerCase().includes(q)
        );
    }, [ongEntries, ongZoekterm]);

    const ongGesorteerd = useMemo(() => {
        return [...ongGefilterd].sort((a, b) => {
            const av = a[ongSortKey] ?? "";
            const bv = b[ongSortKey] ?? "";
            if (av < bv) return ongSortDir === "asc" ? -1 : 1;
            if (av > bv) return ongSortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [ongGefilterd, ongSortKey, ongSortDir]);

    const ongTotaalPaginas = Math.max(1, Math.ceil(ongGesorteerd.length / PER_PAGE));
    const ongPaginaData = ongGesorteerd.slice((ongPagina - 1) * PER_PAGE, ongPagina * PER_PAGE);

    // ── CCP Glasbreuk filter/sort/page ──

    const glasGefilterd = useMemo(() => {
        const q = glasZoekterm.toLowerCase();
        if (!q) return glasEntries;
        return glasEntries.filter(e =>
            (e.lotnummer ?? "").toLowerCase().includes(q) ||
            (e.uitvoerder ?? "").toLowerCase().includes(q)
        );
    }, [glasEntries, glasZoekterm]);

    const glasGesorteerd = useMemo(() => {
        return [...glasGefilterd].sort((a, b) => {
            const av = a[glasSortKey] ?? "";
            const bv = b[glasSortKey] ?? "";
            if (av < bv) return glasSortDir === "asc" ? -1 : 1;
            if (av > bv) return glasSortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [glasGefilterd, glasSortKey, glasSortDir]);

    const glasTotaalPaginas = Math.max(1, Math.ceil(glasGesorteerd.length / PER_PAGE));
    const glasPaginaData = glasGesorteerd.slice((glasPagina - 1) * PER_PAGE, glasPagina * PER_PAGE);

    // ── CCP Schimmel filter/sort/page ──

    const schimGefilterd = useMemo(() => {
        const q = schimZoekterm.toLowerCase();
        if (!q) return schimEntries;
        return schimEntries.filter(e =>
            (e.lotnummer ?? "").toLowerCase().includes(q) ||
            (e.uitvoerder ?? "").toLowerCase().includes(q)
        );
    }, [schimEntries, schimZoekterm]);

    const schimGesorteerd = useMemo(() => {
        return [...schimGefilterd].sort((a, b) => {
            const av = a[schimSortKey] ?? "";
            const bv = b[schimSortKey] ?? "";
            if (av < bv) return schimSortDir === "asc" ? -1 : 1;
            if (av > bv) return schimSortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [schimGefilterd, schimSortKey, schimSortDir]);

    const schimTotaalPaginas = Math.max(1, Math.ceil(schimGesorteerd.length / PER_PAGE));
    const schimPaginaData = schimGesorteerd.slice((schimPagina - 1) * PER_PAGE, schimPagina * PER_PAGE);

    if (!mounted || !isAuthenticated) return null;

    // ── Column definitions ──

    const WERK_COLS: { key: WerkSortKey; label: string }[] = [
        { key: "datum", label: "Datum" },
        { key: "handeling", label: "Handeling" },
        { key: "brouwaanvraagDatum", label: "Brouwaanvraag datum" },
        { key: "brouwaanvraagNummer", label: "Brouwaanvraag nr" },
        { key: "brouwnummer", label: "Brouwnummer" },
        { key: "volume", label: "Volume (L)" },
        { key: "fermentatievat", label: "Fermentatievat" },
    ];

    const ONG_COLS: { key: OngedierteSortKey; label: string }[] = [
        { key: "datum", label: "Datum" },
        { key: "verantwoordelijke", label: "Verantwoordelijke" },
    ];

    const CCP_COLS: { key: CcpSortKey; label: string }[] = [
        { key: "datum", label: "Datum" },
        { key: "lotnummer", label: "Lotnummer" },
        { key: "uitvoerder", label: "Uitvoerder" },
    ];

    const activeCount = activeTab === "werkregister" ? werkEntries.length
        : activeTab === "ongedierte" ? ongEntries.length
            : activeTab === "ccp_glasbreuk" ? glasEntries.length
                : schimEntries.length;
    const activeLoading = activeTab === "werkregister" ? werkLoading
        : activeTab === "ongedierte" ? ongLoading
            : activeTab === "ccp_glasbreuk" ? glasLoading
                : schimLoading;
    const activeReload = activeTab === "werkregister" ? laadWerk
        : activeTab === "ongedierte" ? laadOng
            : activeTab === "ccp_glasbreuk" ? laadGlas
                : laadSchim;
    const activeLabel = activeTab === "werkregister" ? "registratie"
        : activeTab === "ongedierte" ? "inspectie" : "controle";
    const handleShowAdd = () => {
        if (activeTab === "werkregister") setShowAddWerk(true);
        else if (activeTab === "ongedierte") setShowAddOng(true);
        else if (activeTab === "ccp_glasbreuk") setShowAddGlas(true);
        else setShowAddSchim(true);
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
                    <span className="text-brewery-dark font-medium">Logboek</span>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-brewery-dark">Logboek</h1>
                        <p className="text-gray-500 mt-1">
                            {activeCount} {activeLabel}{activeCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={activeReload} disabled={activeLoading}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${activeLoading ? "animate-spin" : ""}`} />
                            Vernieuwen
                        </button>
                        <button onClick={handleShowAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-brewery-dark text-white hover:opacity-90 transition-colors font-bold">
                            <Plus className="h-5 w-5" />
                            Toevoegen
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b-2 border-gray-200 mb-6">
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 text-sm font-bold transition-colors -mb-[2px] ${activeTab === tab.key
                                ? "border-b-2 border-brewery-dark text-brewery-dark"
                                : "text-gray-400 hover:text-gray-600"
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════ WERKREGISTER TAB ═══════════ */}
                {activeTab === "werkregister" && (
                    <>
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Zoek op handeling, brouwnummer, brouwaanvraag nr of fermentatievat…"
                                value={werkZoekterm} onChange={e => { setWerkZoekterm(e.target.value); setWerkPagina(1); }}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-sm" />
                        </div>
                        {werkError && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{werkError}</div>}
                        <div className="bg-white border-2 border-black overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-brewery-dark text-white">
                                    <tr>
                                        {WERK_COLS.map(col => (
                                            <th key={col.key} className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                                                onClick={() => handleWerkSort(col.key)}>
                                                {col.label}
                                                <SortIcon col={col.key} sortKey={werkSortKey} sortDir={werkSortDir} />
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-right font-bold">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {werkLoading ? (
                                        <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Registraties laden…</td></tr>
                                    ) : werkPaginaData.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            {werkZoekterm ? "Geen registraties gevonden." : "Nog geen registraties. Klik op 'Toevoegen'."}
                                        </td></tr>
                                    ) : werkPaginaData.map((entry, i) => (
                                        <tr key={entry.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 ? "bg-gray-50/40" : ""}`}>
                                            <td className="px-4 py-3 font-mono whitespace-nowrap">{formatDate(entry.datum)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-0.5 text-xs font-bold ${entry.handeling === "BROUWEN" ? "bg-blue-100 text-blue-800" :
                                                    entry.handeling === "OVERHEVELEN" ? "bg-purple-100 text-purple-800" :
                                                        entry.handeling === "BOTTELEN_KEGGEN" ? "bg-green-100 text-green-800" :
                                                            "bg-red-100 text-red-800"
                                                    }`}>{HANDELING_LABELS[entry.handeling]}</span>
                                            </td>
                                            <td className="px-4 py-3 font-mono whitespace-nowrap">{formatDate(entry.brouwaanvraagDatum)}</td>
                                            <td className="px-4 py-3 font-mono">{entry.brouwaanvraagNummer ?? <span className="text-gray-300">—</span>}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-brewery-dark">{entry.brouwnummer ?? <span className="text-gray-300">—</span>}</td>
                                            <td className="px-4 py-3 tabular-nums">{entry.volume != null ? `${entry.volume} L` : <span className="text-gray-300">—</span>}</td>
                                            <td className="px-4 py-3">{entry.fermentatievat ?? <span className="text-gray-300">—</span>}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditWerk(entry)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-brewery-dark text-white text-xs font-bold hover:opacity-80 transition-colors">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => handleWerkDelete(entry.id)} disabled={werkDeletingId === entry.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                                                        <Trash2 className="h-3.5 w-3.5" />{werkDeletingId === entry.id ? "…" : ""}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {werkTotaalPaginas > 1 && (
                            <div className="flex items-center justify-between mt-4 text-sm">
                                <span className="text-gray-500">{(werkPagina - 1) * PER_PAGE + 1}–{Math.min(werkPagina * PER_PAGE, werkGesorteerd.length)} van {werkGesorteerd.length}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setWerkPagina(p => Math.max(1, p - 1))} disabled={werkPagina === 1}
                                        className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100">‹</button>
                                    {Array.from({ length: werkTotaalPaginas }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setWerkPagina(p)}
                                            className={`px-3 py-1.5 border ${p === werkPagina ? "bg-brewery-dark text-white border-brewery-dark" : "border-gray-300 hover:bg-gray-100"}`}>{p}</button>
                                    ))}
                                    <button onClick={() => setWerkPagina(p => Math.min(werkTotaalPaginas, p + 1))} disabled={werkPagina === werkTotaalPaginas}
                                        className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100">›</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ═══════════ ONGEDIERTE TAB ═══════════ */}
                {activeTab === "ongedierte" && (
                    <>
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Zoek op verantwoordelijke, status of actie…"
                                value={ongZoekterm} onChange={e => { setOngZoekterm(e.target.value); setOngPagina(1); }}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-sm" />
                        </div>
                        {ongError && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{ongError}</div>}
                        <div className="bg-white border-2 border-black overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-brewery-dark text-white">
                                    <tr>
                                        {ONG_COLS.map(col => (
                                            <th key={col.key} className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                                                onClick={() => handleOngSort(col.key)}>
                                                {col.label}
                                                <SortIcon col={col.key} sortKey={ongSortKey} sortDir={ongSortDir} />
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center font-bold whitespace-nowrap">Brouw&shy;container</th>
                                        <th className="px-4 py-3 text-center font-bold">Kelder</th>
                                        <th className="px-4 py-3 text-center font-bold">Omgeving</th>
                                        <th className="px-4 py-3 text-center font-bold whitespace-nowrap">Afval&shy;container</th>
                                        <th className="px-4 py-3 text-left font-bold">Status</th>
                                        <th className="px-4 py-3 text-left font-bold">Actie</th>
                                        <th className="px-4 py-3 text-right font-bold">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ongLoading ? (
                                        <tr><td colSpan={9} className="px-4 py-16 text-center text-gray-400">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Inspecties laden…</td></tr>
                                    ) : ongPaginaData.length === 0 ? (
                                        <tr><td colSpan={9} className="px-4 py-16 text-center text-gray-400">
                                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            {ongZoekterm ? "Geen inspecties gevonden." : "Nog geen inspecties. Klik op 'Toevoegen'."}
                                        </td></tr>
                                    ) : ongPaginaData.map((entry, i) => (
                                        <tr key={entry.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 ? "bg-gray-50/40" : ""}`}>
                                            <td className="px-4 py-3 font-mono whitespace-nowrap">{formatDate(entry.datum)}</td>
                                            <td className="px-4 py-3 font-medium">{entry.verantwoordelijke}</td>
                                            <td className="px-4 py-3 text-center"><BoolIcon value={entry.brouwcontainer} /></td>
                                            <td className="px-4 py-3 text-center"><BoolIcon value={entry.kelder} /></td>
                                            <td className="px-4 py-3 text-center"><BoolIcon value={entry.omgeving} /></td>
                                            <td className="px-4 py-3 text-center"><BoolIcon value={entry.afvalcontainer} /></td>
                                            <td className="px-4 py-3 max-w-xs truncate">
                                                {entry.opmerkingen ? (
                                                    <span className={`inline-block px-2 py-0.5 text-xs font-bold ${entry.opmerkingen === "Geen activiteit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}>{entry.opmerkingen}</span>
                                                ) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{entry.actie ?? <span className="text-gray-300">—</span>}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditOng(entry)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-brewery-dark text-white text-xs font-bold hover:opacity-80 transition-colors">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => handleOngDelete(entry.id)} disabled={ongDeletingId === entry.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                                                        <Trash2 className="h-3.5 w-3.5" />{ongDeletingId === entry.id ? "…" : ""}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {ongTotaalPaginas > 1 && (
                            <div className="flex items-center justify-between mt-4 text-sm">
                                <span className="text-gray-500">{(ongPagina - 1) * PER_PAGE + 1}–{Math.min(ongPagina * PER_PAGE, ongGesorteerd.length)} van {ongGesorteerd.length}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setOngPagina(p => Math.max(1, p - 1))} disabled={ongPagina === 1}
                                        className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100">‹</button>
                                    {Array.from({ length: ongTotaalPaginas }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setOngPagina(p)}
                                            className={`px-3 py-1.5 border ${p === ongPagina ? "bg-brewery-dark text-white border-brewery-dark" : "border-gray-300 hover:bg-gray-100"}`}>{p}</button>
                                    ))}
                                    <button onClick={() => setOngPagina(p => Math.min(ongTotaalPaginas, p + 1))} disabled={ongPagina === ongTotaalPaginas}
                                        className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100">›</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ═══════════ CCP TAB (reused for both) ═══════════ */}
                {(activeTab === "ccp_glasbreuk" || activeTab === "ccp_schimmel") && (() => {
                    const isGlas = activeTab === "ccp_glasbreuk";
                    const entries = isGlas ? glasPaginaData : schimPaginaData;
                    const loading = isGlas ? glasLoading : schimLoading;
                    const error = isGlas ? glasError : schimError;
                    const zoekterm = isGlas ? glasZoekterm : schimZoekterm;
                    const setZoekterm = isGlas ? setGlasZoekterm : setSchimZoekterm;
                    const setPagina = isGlas ? setGlasPagina : setSchimPagina;
                    const sortKey = isGlas ? glasSortKey : schimSortKey;
                    const sortDir = isGlas ? glasSortDir : schimSortDir;
                    const handleSort = isGlas ? handleGlasSortFn : handleSchimSortFn;
                    const deletingId = isGlas ? glasDeletingId : schimDeletingId;
                    const handleDel = isGlas ? handleGlasDelete : handleSchimDelete;
                    const gesorteerd = isGlas ? glasGesorteerd : schimGesorteerd;
                    const totaalPaginas = isGlas ? glasTotaalPaginas : schimTotaalPaginas;
                    const pagina = isGlas ? glasPagina : schimPagina;

                    return (
                        <>
                            <div className="mb-6 p-5 bg-white border-2 border-black">
                                <h2 className="text-lg font-bold text-brewery-dark mb-2">Beschrijving & Actie</h2>
                                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                                    {isGlas
                                        ? "Deze CCP behandelt het gevaar voor glasbreuk tijdens het bottelen van het bier. Deze wordt bewaakt door middel van visuele controle tijdens het bottelen zelf."
                                        : "Deze CCP behandelt het gevaar voor schimmelvorming op de mout tijdens opslag. Voor gebruik in het bier wordt al de mout handmatig afgewogen voor het schroten. Tijdens deze stap in het brouwproces wordt de mout gecontroleerd op schimmelvorming."}
                                </p>
                                <div className="bg-red-50 border border-red-200 p-3 rounded-sm">
                                    <h3 className="text-red-800 font-bold text-sm mb-1">Te nemen actie bij vaststelling:</h3>
                                    <p className="text-red-700 text-sm font-medium">
                                        {isGlas
                                            ? "Wanneer er zich een glasbreuk voordoet, moeten de desbetreffende flesjes onmiddellijk uit het productieproces genomen worden."
                                            : "Indien er schimmel aanwezig is, wordt deze mout niet gebruikt en wordt deze direct verwijderd uit de brouwerij."}
                                    </p>
                                </div>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Zoek op lotnummer of uitvoerder…"
                                    value={zoekterm} onChange={e => { setZoekterm(e.target.value); setPagina(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-brewery-dark focus:outline-none bg-white text-sm" />
                            </div>
                            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
                            <div className="bg-white border-2 border-black overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-brewery-dark text-white">
                                        <tr>
                                            {CCP_COLS.map(col => (
                                                <th key={col.key} className="px-4 py-3 text-left font-bold cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                                                    onClick={() => handleSort(col.key)}>
                                                    {col.label}
                                                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-center font-bold">CCP uitgevoerd</th>
                                            <th className="px-4 py-3 text-right font-bold">Acties</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                                                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Controles laden…</td></tr>
                                        ) : entries.length === 0 ? (
                                            <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                                                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                                {zoekterm ? "Geen controles gevonden." : "Nog geen controles. Klik op 'Toevoegen'."}
                                            </td></tr>
                                        ) : entries.map((entry, i) => (
                                            <tr key={entry.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 ? "bg-gray-50/40" : ""}`}>
                                                <td className="px-4 py-3 font-mono whitespace-nowrap">{formatDate(entry.datum)}</td>
                                                <td className="px-4 py-3 font-mono">{entry.lotnummer ?? <span className="text-gray-300">—</span>}</td>
                                                <td className="px-4 py-3 font-medium">{entry.uitvoerder ?? <span className="text-gray-300">—</span>}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 text-xs font-bold ${entry.uitgevoerd ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                        {entry.uitgevoerd ? "Ja" : "Nee"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => isGlas ? setEditGlas(entry) : setEditSchim(entry)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-brewery-dark text-white text-xs font-bold hover:opacity-80 transition-colors">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDel(entry.id)} disabled={deletingId === entry.id}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                                                            <Trash2 className="h-3.5 w-3.5" />{deletingId === entry.id ? "…" : ""}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totaalPaginas > 1 && (
                                <div className="flex items-center justify-between mt-4 text-sm">
                                    <span className="text-gray-500">{(pagina - 1) * PER_PAGE + 1}–{Math.min(pagina * PER_PAGE, gesorteerd.length)} van {gesorteerd.length}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => setPagina(Math.max(1, pagina - 1))} disabled={pagina === 1}
                                            className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100">‹</button>
                                        {Array.from({ length: totaalPaginas }, (_, i) => i + 1).map(p => (
                                            <button key={p} onClick={() => setPagina(p)}
                                                className={`px-3 py-1.5 border ${p === pagina ? "bg-brewery-dark text-white border-brewery-dark" : "border-gray-300 hover:bg-gray-100"}`}>{p}</button>
                                        ))}
                                        <button onClick={() => setPagina(Math.min(totaalPaginas, pagina + 1))} disabled={pagina === totaalPaginas}
                                            className="px-3 py-1.5 border border-gray-300 disabled:opacity-40 hover:bg-gray-100">›</button>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            {/* Modals */}
            {(showAddWerk || editWerk) && <WerkregisterModal editEntry={editWerk} onClose={() => { setShowAddWerk(false); setEditWerk(null); }} onSaved={laadWerk} />}
            {(showAddOng || editOng) && <OngedierteModal editEntry={editOng} onClose={() => { setShowAddOng(false); setEditOng(null); }} onSaved={laadOng} />}
            {(showAddGlas || editGlas) && <CcpModal editEntry={editGlas} ccpType="GLASBREUK" label="glasbreuk" onClose={() => { setShowAddGlas(false); setEditGlas(null); }} onSaved={laadGlas} />}
            {(showAddSchim || editSchim) && <CcpModal editEntry={editSchim} ccpType="SCHIMMELVORMING" label="schimmelvorming" onClose={() => { setShowAddSchim(false); setEditSchim(null); }} onSaved={laadSchim} />}
        </div >
    );
}
