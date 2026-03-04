"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getRecipe, updateRecipe } from "@/app/actions/recipeActions";
import { berekenAlles, berekenGevraagd, EXTRACT_DEFAULTS, EBC_DEFAULTS, MAISCH_STAP_NAMEN } from "@/lib/brewing-calcs";
import {
    Save, Plus, Trash2, ChevronDown, ChevronUp,
    FlaskConical, RefreshCw, AlertCircle, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────
type BrewingStap = "MAISCHEN" | "KOKEN" | "FERMENTATIE" | "OVERIG";
type IngredientType = "MOUT" | "HOP" | "GIST" | "ANDERE";

interface Ingredient {
    _key: string;
    id?: string;
    stap: BrewingStap;
    type: IngredientType;
    naam: string;
    hoeveelheid: number;
    eenheid: string;
    extractPotential: number | null;
    kleurEbc: number | null;
    alfazuur: number | null;
    tijdMinuten: number | null;
    pelletOfBloem: string | null;
    tijdstip: string | null;
    doseringGPerL: number | null;
    lot: string | null;
    volgorde: number;
}

interface MaischStap {
    stapNaam: string;
    tempC: number | null;
    duurMin: number | null;
}

interface FermentatieStap {
    _key: string;
    stapNaam: string;
    tempC: number | null;
    duurDagen: number | null;
}

interface Basics {
    brouwnummer: string;           // bewerkbaar
    naam: string;
    stijl: string;
    notities: string;
    abvGevraagd: string;           // target ABV — basis voor gevraagde berekening
    batchVolume: string;           // liter per batch, na koken in fermentor
    aantalBatches: string;         // aantal batches; totaal = batchVolume × aantalBatches
    brouwEfficiency: string;
    attenuation: string;
    ogGemeten: string;
    fgGemeten: string;
    abvGemeten: string;
    platoGemeten: string;
    brouwefficientieGemeten: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STAP_LABELS: Record<BrewingStap, string> = {
    MAISCHEN: "Granen (Maischen)",
    KOKEN: "Hop & overige toevoegingen (aangeven wanneer)",
    FERMENTATIE: "Gist (Fermentatie)",
    OVERIG: "Overige Toevoegingen",
};

const STAP_DEFAULTS: Record<BrewingStap, { type: IngredientType; eenheid: string }> = {
    MAISCHEN: { type: "MOUT", eenheid: "kg" },
    KOKEN: { type: "HOP", eenheid: "g" },
    FERMENTATIE: { type: "GIST", eenheid: "g" },
    OVERIG: { type: "ANDERE", eenheid: "g" },
};

const EENHEDEN = ["kg", "g", "mg", "L", "ml", "stuks"];
const TYPE_LABELS: Record<IngredientType, string> = { MOUT: "Mout", HOP: "Hop", GIST: "Gist", ANDERE: "Andere" };
const PELLET_OPTIES = ["Pellet", "Bloem"];
const TIJDSTIP_OPTIES = [
    "60 min (hele kook)", "30 min", "15 min", "5 min", "Whirlpool", "Dry Hop",
];
const FERMENTATIE_STAP_NAMEN = ["hoofd", "rest", "cold crash", "conditioning", "secondary"];
const STAPPEN = Object.keys(STAP_LABELS) as BrewingStap[];

let _keyCounter = 0;
function nieuweKey() { return `k_${Date.now()}_${++_keyCounter}`; }

// ─── Shared stat box ──────────────────────────────────────────────────────────
function Stat({ label, val, highlight }: { label: string; val: string | null; highlight?: boolean }) {
    return (
        <div className={`border p-3 text-center ${highlight ? "bg-brewery-dark/5 border-brewery-dark/30" : "bg-gray-50 border-gray-200"}`}>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
            {val != null
                ? <div className={`text-lg font-bold tabular-nums ${highlight ? "text-brewery-dark" : "text-gray-700"}`}>{val}</div>
                : <div className="text-lg font-bold text-gray-300">&mdash;</div>}
        </div>
    );
}

// ─── GevraagdPanel (berekend uit target ABV + attenuation) ───────────────────
function GevraagdPanel({ basics }: { basics: Basics }) {
    const vals = useMemo(() => {
        const abv  = parseFloat(basics.abvGevraagd);
        const att  = parseFloat(basics.attenuation);
        if (!abv || !att || isNaN(abv) || isNaN(att)) return null;
        const bv  = parseFloat(basics.batchVolume);
        const nb  = parseFloat(basics.aantalBatches);
        const totalVol = bv > 0 && nb > 0 && !isNaN(bv) && !isNaN(nb) ? bv * nb : undefined; // totaal = batch × aantal
        const eff = parseFloat(basics.brouwEfficiency);
        return berekenGevraagd(
            abv, att,
            totalVol,
            eff > 0 && !isNaN(eff) ? eff : undefined,
        );
    }, [basics.abvGevraagd, basics.attenuation, basics.batchVolume, basics.aantalBatches, basics.brouwEfficiency]);

    return (
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gevraagde waarden</h3>
            <p className="text-xs text-gray-400 mb-3">Automatisch berekend op basis van de basiskarakteristieken (target ABV + attenuatie).</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Stat label="OG gevraagd"      val={vals ? vals.ogGevraagd.toFixed(3)                        : null} highlight />
                <Stat label="FG gevraagd"      val={vals ? vals.fgGevraagd.toFixed(3)                        : null} highlight />
                <Stat label="ABV gevraagd"     val={vals ? vals.abvGevraagd.toFixed(2) + " %"                : null} highlight />
                <Stat label="Plato gevraagd"   val={vals ? vals.platoGevraagd.toFixed(2) + " °P"             : null} highlight />
                <Stat label="Suikers nodig"    val={vals?.suikersNodig != null ? vals.suikersNodig.toFixed(2) + " kg" : null} highlight />
                <Stat label="Granen nodig"     val={vals?.granenNodig  != null ? vals.granenNodig.toFixed(2)  + " kg" : null} highlight />
            </div>
            {vals && (vals.suikersNodig == null || vals.granenNodig == null) && (
                <p className="text-xs text-gray-400 mt-2">
                    Vul ook het totale volume en brouwefficiëntie in voor suikers/granen nodig.
                </p>
            )}
            {!vals && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Vul een target ABV (%) en attenuatie (%) in de basiskarakteristieken.
                </p>
            )}
        </div>
    );
}

// VerwachtPanel: use total quantities with total volume
function VerwachtPanel({ basics, ingredients }: { basics: Basics; ingredients: Ingredient[] }) {
    const vals = useMemo(() => {
        const bv  = parseFloat(basics.batchVolume);
        const nb  = parseFloat(basics.aantalBatches);
        const eff = parseFloat(basics.brouwEfficiency);
        const att = parseFloat(basics.attenuation);
        if (!bv || !nb || !eff || !att || isNaN(bv) || isNaN(nb) || isNaN(eff) || isNaN(att)) return null;
        const totalVol = bv * nb;
        const fermentables = ingredients
            .filter(i => i.type === "MOUT" && i.stap === "MAISCHEN")
            .map(i => ({
                hoeveelheid: i.hoeveelheid || 0,
                extractPotential: i.extractPotential ?? 80,
                kleurEbc: i.kleurEbc,
            }));
        const hops = ingredients
            .filter(i => i.type === "HOP" && (i.tijdMinuten ?? 0) > 0)
            .map(i => ({
                hoeveelheid: i.hoeveelheid || 0,
                alfazuur: i.alfazuur ?? 0,
                tijdMinuten: i.tijdMinuten ?? 0,
            }));
        const result = berekenAlles({ fermentables, hops, batchVolumeL: totalVol, brouwEfficiency: eff, attenuation: att });
        return result;
    }, [basics.batchVolume, basics.aantalBatches, basics.brouwEfficiency, basics.attenuation, ingredients]);

    const volumeL = parseFloat(basics.batchVolume) * parseFloat(basics.aantalBatches) || 0;

    return (
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Verwachte waarden</h3>
            <p className="text-xs text-gray-400 mb-3">Berekend op basis van de ingrediëntenlijst (mout, hop, efficiëntie).</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <Stat label="OG verwacht"    val={vals ? vals.og.toFixed(3)                     : null} />
                <Stat label="FG verwacht"    val={vals ? vals.fg.toFixed(3)                     : null} />
                <Stat label="ABV verwacht"   val={vals ? vals.abv.toFixed(2) + " %"             : null} />
                <Stat label="Plato verwacht" val={vals ? vals.platoOG.toFixed(2) + " °P"        : null} />
                <Stat label="IBU"            val={vals ? vals.ibu.toFixed(1)                    : null} />
                <Stat label="EBC"            val={vals ? vals.ebc.toFixed(1)                    : null} />
                <Stat label="Suikers nodig"  val={vals ? vals.totaalSuikersNodig.toFixed(2) + " kg" : null} />
                <Stat label="Granen nodig"   val={vals ? vals.totaalGranenNodig.toFixed(2) + " kg"  : null} />
            </div>
            {vals && volumeL > 0 && (
                <p className="text-xs text-gray-400">
                    Granen per hL: {(vals.totaalGranenNodig / (volumeL / 100)).toFixed(2)} kg/hL
                </p>
            )}
            {!vals && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Vul batchvolume, efficiëntie en attenuatie in om te berekenen.
                </p>
            )}
        </div>
    );
}

// ─── MaischStap panel ──────────────────────────────────────────────────────────
function MaischStapPanel({
    stappen,
    onChange,
}: {
    stappen: MaischStap[];
    onChange: (idx: number, field: "duurMin", val: string) => void;
}) {
    const totaalMin = stappen.reduce((s, r) => s + (r.duurMin ?? 0), 0);
    return (
        <div>
            <h2 className="text-lg font-bold text-brewery-dark mb-4">Maischschema</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-200 text-xs text-gray-400 uppercase tracking-wide">
                            <th className="px-3 pb-2 text-left font-medium">Stap</th>
                            <th className="px-3 pb-2 text-left font-medium">Duur (min.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stappen.map((s, idx) => (
                            <tr key={s.stapNaam} className="border-t border-gray-100 hover:bg-amber-50/20">
                                <td className="px-3 py-2 font-medium">{s.stapNaam}</td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number" min="0" step="1"
                                        value={s.duurMin ?? ""} placeholder="0"
                                        onChange={e => onChange(idx, "duurMin", e.target.value)}
                                        className="w-20 border border-gray-200 px-2 py-1 text-sm tabular-nums focus:outline-none focus:border-brewery-dark bg-white"
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold text-sm">
                            <td className="px-3 py-2">TOTAAL</td>
                            <td className="px-3 py-2">{totaalMin} min.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── FermentatieStap panel ─────────────────────────────────────────────────────
function FermentatieStapPanel({
    stappen, onChange, onVerwijder, onVoegToe,
}: {
    stappen: FermentatieStap[];
    onChange: (key: string, field: "stapNaam" | "tempC" | "duurDagen", val: string) => void;
    onVerwijder: (key: string) => void;
    onVoegToe: () => void;
}) {
    const totaalDagen = stappen.reduce((s, r) => s + (r.duurDagen ?? 0), 0);
    return (
        <div>
            <h2 className="text-lg font-bold text-brewery-dark mb-4">Fermentatieschema</h2>
            <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-200 text-xs text-gray-400 uppercase tracking-wide">
                            <th className="px-3 pb-2 text-left font-medium">Stap</th>
                            <th className="px-3 pb-2 text-left font-medium">Temperatuur (°C)</th>
                            <th className="px-3 pb-2 text-left font-medium">Duur (dagen)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stappen.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-4 text-gray-400 text-sm italic text-center">
                                    Geen fermentatiestappen toegevoegd.
                                </td>
                            </tr>
                        ) : stappen.map(s => (
                            <tr key={s._key} className="border-t border-gray-100 hover:bg-amber-50/20">
                                <td className="px-3 py-2">
                                    <input
                                        type="text" value={s.stapNaam}
                                        list="fermstap-namen"
                                        onChange={e => onChange(s._key, "stapNaam", e.target.value)}
                                        className="w-40 border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-brewery-dark bg-white"
                                    />
                                    <datalist id="fermstap-namen">
                                        {FERMENTATIE_STAP_NAMEN.map(n => <option key={n} value={n} />)}
                                    </datalist>
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number" min="0" max="40" step="0.5"
                                        value={s.tempC ?? ""} placeholder="—"
                                        onChange={e => onChange(s._key, "tempC", e.target.value)}
                                        className="w-20 border border-gray-200 px-2 py-1 text-sm tabular-nums focus:outline-none focus:border-brewery-dark bg-white"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number" min="0" step="1"
                                        value={s.duurDagen ?? ""} placeholder="0"
                                        onChange={e => onChange(s._key, "duurDagen", e.target.value)}
                                        className="w-20 border border-gray-200 px-2 py-1 text-sm tabular-nums focus:outline-none focus:border-brewery-dark bg-white"
                                    />
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <button type="button" onClick={() => onVerwijder(s._key)}
                                        className="text-red-400 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {stappen.length > 0 && (
                            <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold text-sm">
                                <td className="px-3 py-2">TOTAAL</td>
                                <td className="px-3 py-2">—</td>
                                <td className="px-3 py-2">{totaalDagen} dagen</td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button
                type="button" onClick={onVoegToe}
                className="flex items-center gap-2 text-sm text-brewery-dark border border-brewery-dark px-3 py-1.5 hover:bg-brewery-dark hover:text-white transition-colors font-medium"
            >
                <Plus className="h-4 w-4" /> Stap toevoegen
            </button>
        </div>
    );
}

// ─── Ingredient row ────────────────────────────────────────────────────────────
function IngredientRij({
    ing, stap, basics, onChange, onVerwijder,
}: {
    ing: Ingredient; stap: BrewingStap; basics: Basics;
    onChange: (key: string, u: Partial<Ingredient>) => void;
    onVerwijder: (key: string) => void;
}) {
    const isMout = ing.type === "MOUT";
    const isHop  = ing.type === "HOP";
    const isToev = (stap === "OVERIG") && !isHop;
    const isKoken = stap === "KOKEN";

    // Calculate per-batch quantity
    const aantalBatches = parseFloat(basics.aantalBatches) || 1;
    const perBatch = aantalBatches > 0 ? ing.hoeveelheid / aantalBatches : 0;

    const handleNaamChange = (naam: string) => {
        const updates: Partial<Ingredient> = { naam };
        if (!ing.extractPotential && EXTRACT_DEFAULTS[naam]) updates.extractPotential = EXTRACT_DEFAULTS[naam];
        if (!ing.kleurEbc && EBC_DEFAULTS[naam]) updates.kleurEbc = EBC_DEFAULTS[naam];
        onChange(ing._key, updates);
    };

    const numInput = (
        val: number | null,
        placeholder: string,
        title: string,
        onCh: (v: string) => void,
        opts?: { min?: string; max?: string; step?: string }
    ) => (
        <input
            type="number"
            min={opts?.min ?? "0"}
            max={opts?.max}
            step={opts?.step ?? "any"}
            value={val ?? ""}
            placeholder={placeholder}
            title={title}
            onChange={e => onCh(e.target.value)}
            className="w-16 border border-gray-200 px-2 py-1 text-sm tabular-nums focus:outline-none focus:border-brewery-dark bg-white"
        />
    );

    // Column 4: Rendement/AA%/Dosering g/L
    const col4 = isMout
        ? numInput(ing.extractPotential, "78", "Graanrendement (%)", v => onChange(ing._key, { extractPotential: parseFloat(v) || null }), { max: "100", step: "0.1" })
        : isHop
        ? numInput(ing.alfazuur, "AA%", "Alpha-zuur (%)", v => onChange(ing._key, { alfazuur: parseFloat(v) || null }), { max: "30", step: "0.1" })
        : isToev
        ? numInput(ing.doseringGPerL, "g/L", "Dosering (g/L)", v => onChange(ing._key, { doseringGPerL: parseFloat(v) || null }), { step: "0.01" })
        : <span className="text-gray-300 px-2">—</span>;

    // Column 5: EBC / Kooktijd(min)
    const col5 = isMout
        ? numInput(ing.kleurEbc, "EBC", "Kleur EBC", v => onChange(ing._key, { kleurEbc: parseFloat(v) || null }), { step: "1" })
        : (isHop && isKoken)
        ? numInput(ing.tijdMinuten, "min", "Kooktijd (min)", v => onChange(ing._key, { tijdMinuten: parseInt(v) || null }), { step: "1" })
        : <span className="text-gray-300 px-2">—</span>;

    // Column 6: Pellet/Bloem / Tijdstip
    const col6 = isHop
        ? (
            <select
                value={ing.pelletOfBloem ?? "Pellet"}
                onChange={e => onChange(ing._key, { pelletOfBloem: e.target.value })}
                className="border border-gray-200 px-1 py-1 text-sm focus:outline-none focus:border-brewery-dark bg-white"
            >
                {PELLET_OPTIES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        )
        : isToev
        ? (
            <select
                value={ing.tijdstip ?? ""}
                onChange={e => onChange(ing._key, { tijdstip: e.target.value || null })}
                className="border border-gray-200 px-1 py-1 text-sm focus:outline-none focus:border-brewery-dark bg-white"
            >
                <option value="">—</option>
                {TIJDSTIP_OPTIES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        )
        : <span className="text-gray-300 px-2">—</span>;

    return (
        <tr className="border-t border-gray-100 group hover:bg-amber-50/30">
            <td className="px-2 py-2">
                <input
                    type="text" value={ing.naam}
                    list={`dl-${stap}`}
                    onChange={e => handleNaamChange(e.target.value)}
                    placeholder="Naam ingrediënt"
                    className="w-full border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-brewery-dark bg-white min-w-36"
                />
                {stap === "MAISCHEN" && (
                    <datalist id={`dl-${stap}`}>
                        {Object.keys(EXTRACT_DEFAULTS).map(n => <option key={n} value={n} />)}
                    </datalist>
                )}
            </td>
            <td className="px-2 py-2">
                <div className="flex gap-1">
                    <input
                        type="number" min="0" step="any"
                        value={ing.hoeveelheid || ""}
                        onChange={e => onChange(ing._key, { hoeveelheid: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-20 border border-gray-200 px-2 py-1 text-sm tabular-nums focus:outline-none focus:border-brewery-dark bg-white"
                    />
                    <select
                        value={ing.eenheid}
                        onChange={e => onChange(ing._key, { eenheid: e.target.value })}
                        className="border border-gray-200 px-1 py-1 text-sm focus:outline-none focus:border-brewery-dark bg-white"
                    >
                        {EENHEDEN.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 text-sm text-gray-700 font-mono">
                {perBatch.toFixed(2)} {ing.eenheid}
            </td>
            <td className="px-2 py-2">{col4}</td>
            <td className="px-2 py-2">{col5}</td>
            <td className="px-2 py-2">{col6}</td>
            <td className="px-2 py-2">
                <input
                    type="text" value={ing.lot ?? ""} placeholder="Lot"
                    onChange={e => onChange(ing._key, { lot: e.target.value || null })}
                    className="w-20 border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-brewery-dark bg-white"
                />
            </td>
            <td className="px-2 py-2 text-right">
                <button type="button" onClick={() => onVerwijder(ing._key)}
                    className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="h-4 w-4" />
                </button>
            </td>
        </tr>
    );
}

// ─── Stap section (accordion) ──────────────────────────────────────────────────
function StapSectie({
    stap, ingredients, basics, onChange, onVerwijder, onVoegToe,
}: {
    stap: BrewingStap; ingredients: Ingredient[]; basics: Basics;
    onChange: (key: string, u: Partial<Ingredient>) => void;
    onVerwijder: (key: string) => void;
    onVoegToe: (stap: BrewingStap) => void;
}) {
    const [open, setOpen] = useState(
        stap === "MAISCHEN" || stap === "KOKEN" || stap === "FERMENTATIE"
    );
    const isMaischen  = stap === "MAISCHEN";
    const isHopStap   = stap === "KOKEN";
    const isToevoeging = stap === "OVERIG";
    const totaalKg = isMaischen
        ? ingredients.filter(i => i.type === "MOUT").reduce((s, i) => s + (i.hoeveelheid || 0), 0)
        : null;

    const col4Label = isMaischen ? "Rendement %" : isHopStap ? "AA%" : isToevoeging ? "Dosering g/L" : "—";
    const col5Label = isMaischen ? "EBC" : isHopStap ? "Tijd (min.)" : "—";
    const col6Label = isHopStap ? "Pellet/Bloem" : isToevoeging ? "Tijdstip" : "—";

    return (
        <div className="border-2 border-gray-200 mb-4">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="font-bold text-brewery-dark">{STAP_LABELS[stap]}</span>
                    <span className="text-xs text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded-full">
                        {ingredients.length} {ingredients.length === 1 ? "ingrediënt" : "ingrediënten"}
                    </span>
                    {totaalKg != null && totaalKg > 0 && (
                        <span className="text-xs font-bold text-brewery-dark">{totaalKg.toFixed(3)} kg totaal</span>
                    )}
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>
            {open && (
                <div className="p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200 text-xs text-gray-400 uppercase tracking-wide">
                                    <th className="px-2 pb-2 text-left font-medium min-w-44">Naam</th>
                                    <th className="px-2 pb-2 text-left font-medium">Totaal</th>
                                    <th className="px-2 pb-2 text-left font-medium">Per batch</th>
                                    <th className="px-2 pb-2 text-left font-medium">{col4Label}</th>
                                    <th className="px-2 pb-2 text-left font-medium">{col5Label}</th>
                                    <th className="px-2 pb-2 text-left font-medium">{col6Label}</th>
                                    <th className="px-2 pb-2 text-left font-medium">Lot</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingredients.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-2 py-5 text-center text-gray-400 italic text-sm">
                                            Geen ingrediënten toegevoegd.
                                        </td>
                                    </tr>
                                ) : ingredients.map(ing => (
                                    <IngredientRij
                                        key={ing._key} ing={ing} stap={stap} basics={basics}
                                        onChange={onChange} onVerwijder={onVerwijder}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="button" onClick={() => onVoegToe(stap)}
                        className="mt-3 flex items-center gap-2 text-sm text-brewery-dark border border-brewery-dark px-3 py-1.5 hover:bg-brewery-dark hover:text-white transition-colors font-medium"
                    >
                        <Plus className="h-4 w-4" /> Ingrediënt toevoegen
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ReceptDetail() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const [basics, setBasics] = useState<Basics>({
        brouwnummer: "",
        naam: "", stijl: "", notities: "",
        abvGevraagd: "",
        batchVolume: "", aantalBatches: "",
        brouwEfficiency: "70", attenuation: "80",
        ogGemeten: "", fgGemeten: "", abvGemeten: "", platoGemeten: "", brouwefficientieGemeten: "",
    });

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    const [maischStappen, setMaischStappen] = useState<MaischStap[]>(
        MAISCH_STAP_NAMEN.map(naam => ({ stapNaam: naam, tempC: null, duurMin: null }))
    );

    const [fermentatieStappen, setFermentatieStappen] = useState<FermentatieStap[]>([]);

    const laadRecept = useCallback(async () => {
        setLoading(true);
        const result = await getRecipe(id);
        if (result.success && result.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r = result.data as any;
            setBasics({
                brouwnummer: r.brouwnummer ?? "",
                naam: r.naam ?? "",
                stijl: r.stijl ?? "",
                notities: r.notities ?? "",
                abvGevraagd: r.abvGevraagd != null ? String(r.abvGevraagd) : "",
                batchVolume: r.batchVolume != null ? String(r.batchVolume) : "",
                aantalBatches: r.aantalBatches != null ? String(r.aantalBatches) : "",
                brouwEfficiency: r.brouwEfficiency != null ? String(r.brouwEfficiency) : "70",
                attenuation: r.attenuation != null ? String(r.attenuation) : "80",
                ogGemeten: r.ogGemeten != null ? String(r.ogGemeten) : "",
                fgGemeten: r.fgGemeten != null ? String(r.fgGemeten) : "",
                abvGemeten: r.abvGemeten != null ? String(r.abvGemeten) : "",
                platoGemeten: r.platoGemeten != null ? String(r.platoGemeten) : "",
                brouwefficientieGemeten: r.brouwefficientieGemeten != null ? String(r.brouwefficientieGemeten) : "",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setIngredients(r.ingredients.map((i: any) => ({
                _key: nieuweKey(), id: i.id,
                stap: i.stap, type: i.type, naam: i.naam,
                hoeveelheid: i.hoeveelheid, eenheid: i.eenheid,
                extractPotential: i.extractPotential,
                kleurEbc: i.kleurEbc,
                alfazuur: i.alfazuur,
                tijdMinuten: i.tijdMinuten,
                pelletOfBloem: i.pelletOfBloem ?? "Pellet",
                tijdstip: i.tijdstip ?? null,
                doseringGPerL: i.doseringGPerL ?? null,
                lot: i.lot ?? null,
                volgorde: i.volgorde,
            })));
            // Merge saved maisch stappen with fixed defaults
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbMaisch: any[] = r.maischStappen ?? [];
            setMaischStappen(
                MAISCH_STAP_NAMEN.map(naam => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const saved = dbMaisch.find((s: any) => s.stapNaam === naam);
                    return {
                        stapNaam: naam,
                        tempC: saved?.tempC ?? null,
                        duurMin: saved?.duurMin ?? null,
                    };
                })
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setFermentatieStappen((r.fermentatieStappen ?? []).map((s: any) => ({
                _key: nieuweKey(),
                stapNaam: s.stapNaam,
                tempC: s.tempC ?? null,
                duurDagen: s.duurDagen ?? null,
            })));
        } else {
            alert("Recept niet gevonden");
            router.push("/admin/brouwadministratie/receptuur");
        }
        setLoading(false);
    }, [id, router]);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) { router.push("/admin/login"); return; }
        laadRecept();
    }, [isAuthenticated, router, laadRecept]);

    const handleOpslaan = async () => {
        if (!basics.naam.trim()) { alert("Naam is verplicht."); return; }
        if (!basics.brouwnummer.trim()) { alert("Brouwnummer is verplicht."); return; }
        setSaving(true);
        setSaveStatus("idle");
        const result = await updateRecipe(id, {
            brouwnummer: basics.brouwnummer.trim(),
            naam: basics.naam,
            stijl: basics.stijl || undefined,
            notities: basics.notities || undefined,
            abvGevraagd: parseFloat(basics.abvGevraagd) || null,
            batchVolume: parseFloat(basics.batchVolume) || null,
            aantalBatches: parseFloat(basics.aantalBatches) || null,
            brouwEfficiency: parseFloat(basics.brouwEfficiency) || null,
            attenuation: parseFloat(basics.attenuation) || null,
            ogGemeten: parseFloat(basics.ogGemeten) || null,
            fgGemeten: parseFloat(basics.fgGemeten) || null,
            abvGemeten: parseFloat(basics.abvGemeten) || null,
            platoGemeten: parseFloat(basics.platoGemeten) || null,
            brouwefficientieGemeten: parseFloat(basics.brouwefficientieGemeten) || null,
            ingredients: ingredients.map((ing, i) => ({
                id: ing.id,
                stap: ing.stap,
                type: ing.type,
                naam: ing.naam,
                hoeveelheid: ing.hoeveelheid,
                eenheid: ing.eenheid,
                extractPotential: ing.extractPotential,
                kleurEbc: ing.kleurEbc,
                alfazuur: ing.alfazuur,
                tijdMinuten: ing.tijdMinuten,
                pelletOfBloem: ing.pelletOfBloem,
                tijdstip: ing.tijdstip,
                doseringGPerL: ing.doseringGPerL,
                lot: ing.lot,
                volgorde: i,
            })),
            maischStappen: maischStappen,
            fermentatieStappen: fermentatieStappen.map(s => ({
                stapNaam: s.stapNaam,
                tempC: s.tempC,
                duurDagen: s.duurDagen,
            })),
        });
        setSaveStatus(result.success ? "success" : "error");
        if (!result.success) alert(`Fout bij opslaan: ${result.error}`);
        setSaving(false);
        setTimeout(() => setSaveStatus("idle"), 3500);
    };

    const handleIngredientChange = useCallback((key: string, updates: Partial<Ingredient>) => {
        setIngredients(prev => prev.map(i => i._key !== key ? i : { ...i, ...updates }));
    }, []);

    const handleIngredientVerwijder = useCallback((key: string) => {
        setIngredients(prev => prev.filter(i => i._key !== key));
    }, []);

    const handleVoegIngrToe = useCallback((stap: BrewingStap) => {
        const def = STAP_DEFAULTS[stap];
        setIngredients(prev => [...prev, {
            _key: nieuweKey(),
            stap, type: def.type, naam: "",
            hoeveelheid: 0, eenheid: def.eenheid,
            extractPotential: def.type === "MOUT" ? 78 : null,
            kleurEbc: null,
            alfazuur: null,
            tijdMinuten: (def.type === "HOP" && stap === "KOKEN") ? 60 : null,
            pelletOfBloem: def.type === "HOP" ? "Pellet" : null,
            tijdstip: null, doseringGPerL: null, lot: null,
            volgorde: prev.filter(i => i.stap === stap).length,
        }]);
    }, []);

    const handleMaischStapChange = useCallback((idx: number, field: "duurMin", val: string) => {
        setMaischStappen(prev => prev.map((s, i) => i !== idx ? s : {
            ...s,
            [field]: parseInt(val) || null,
        }));
    }, []);

    const handleFermentatieChange = useCallback(
        (key: string, field: "stapNaam" | "tempC" | "duurDagen", val: string) => {
            setFermentatieStappen(prev => prev.map(s => s._key !== key ? s : {
                ...s,
                [field]: field === "stapNaam"
                    ? val
                    : field === "duurDagen"
                    ? (parseInt(val) || null)
                    : (parseFloat(val) || null),
            }));
        },
        []
    );

    const handleVoegFermStapToe = useCallback(() => {
        setFermentatieStappen(prev => [
            ...prev,
            { _key: nieuweKey(), stapNaam: "hoofd", tempC: null, duurDagen: null },
        ]);
    }, []);

    const handleVerwijderFermStap = useCallback((key: string) => {
        setFermentatieStappen(prev => prev.filter(s => s._key !== key));
    }, []);

    const ingPerStap = useCallback(
        (stap: BrewingStap) => ingredients.filter(i => i.stap === stap),
        [ingredients]
    );

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const setBasicsField = (field: keyof Basics) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setBasics(b => ({ ...b, [field]: e.target.value }));

    const NumField = ({
        label, field, placeholder, step = "any", min = "0", max,
    }: { label: string; field: keyof Basics; placeholder?: string; step?: string; min?: string; max?: string }) => {
        const [localValue, setLocalValue] = useState<string>(basics[field]);

        useEffect(() => {
            setLocalValue(basics[field]);
        }, [basics[field]]);

        return (
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                <input
                    type="number" min={min} max={max} step={step}
                    value={localValue}
                    onChange={e => setLocalValue(e.target.value)}
                    onBlur={() => setBasics(b => ({ ...b, [field]: localValue }))}
                    placeholder={placeholder ?? ""}
                    className="w-full border-2 border-gray-200 focus:border-brewery-dark focus:outline-none px-3 py-2 tabular-nums"
                />
            </div>
        );
    };

    if (!mounted || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
                    <Link href="/admin/dashboard" className="hover:text-brewery-dark">Dashboard</Link>
                    <span>/</span>
                    <Link href="/admin/brouwadministratie" className="hover:text-brewery-dark">Brouwadministratie</Link>
                    <span>/</span>
                    <Link href="/admin/brouwadministratie/receptuur" className="hover:text-brewery-dark">Receptuur</Link>
                    <span>/</span>
                    <span className="text-brewery-dark font-mono font-medium">{basics.brouwnummer || "…"}</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <RefreshCw className="h-8 w-8 animate-spin text-brewery-dark" />
                    </div>
                ) : (
                    <div>
                        {/* ── Header ── */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <FlaskConical className="h-5 w-5 text-brewery-dark" />
                                    <input
                                        type="text"
                                        value={basics.brouwnummer}
                                        onChange={setBasicsField("brouwnummer")}
                                        aria-label="Brouwnummer"
                                        title="Brouwnummer (bewerkbaar)"
                                        className="font-mono text-lg font-bold text-brewery-dark bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-brewery-dark focus:outline-none w-32 pb-0.5"
                                    />
                                </div>
                                <h1 className="text-3xl font-bold text-brewery-dark">
                                    {basics.naam || "Naamloos recept"}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {saveStatus === "success" && (
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <CheckCircle2 className="h-4 w-4" /> Opgeslagen
                                    </span>
                                )}
                                {saveStatus === "error" && (
                                    <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                        <AlertCircle className="h-4 w-4" /> Fout bij opslaan
                                    </span>
                                )}
                                <button
                                    type="button" onClick={handleOpslaan} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-brewery-dark text-white font-bold hover:opacity-90 transition-colors disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? "Opslaan…" : "Opslaan"}
                                </button>
                            </div>
                        </div>

                        {/* ── 1. Basiskarakteristieken ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <h2 className="text-lg font-bold text-brewery-dark mb-5">
                                Basiskarakteristieken{" "}
                                <span className="text-xs font-normal text-gray-400">(cfr. Excel &ldquo;Gevraagd&rdquo;-sectie)</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                            Naam brouwsel *
                                        </label>
                                        <input
                                            type="text" value={basics.naam}
                                            onChange={setBasicsField("naam")}
                                            placeholder="Bijv. Manenbrouw Tripel 2026"
                                            className="w-full border-2 border-gray-200 focus:border-brewery-dark focus:outline-none px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bierstijl</label>
                                        <input
                                            type="text" value={basics.stijl}
                                            onChange={setBasicsField("stijl")}
                                            placeholder="Bijv. Belgian Tripel…"
                                            className="w-full border-2 border-gray-200 focus:border-brewery-dark focus:outline-none px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-bold text-brewery-dark uppercase tracking-wide mb-3">Doelstellingen (target)</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <NumField
                                            label="Target ABV (%)"
                                            field="abvGevraagd"
                                            placeholder="Bijv. 6.5"
                                            step="0.1" min="0" max="30"
                                        />
                                        <NumField label="Attenuatie / Vergistingsgraad (%)" field="attenuation" placeholder="80" step="1" min="0" max="100" />
                                        <NumField label="Brouwefficiëntie (%)" field="brouwEfficiency" placeholder="70" step="1" min="0" max="100" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-bold text-brewery-dark uppercase tracking-wide mb-3">Volumes</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <NumField label="Batchvolume (L) — na koken in fermentor" field="batchVolume" placeholder="Bijv. 160" />
                                        <NumField label="Aantal batches" field="aantalBatches" placeholder="Bijv. 2" step="1" min="1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 2. Gevraagde waarden ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <GevraagdPanel basics={basics} />
                        </div>

                        {/* ── 3. Verwachte waarden ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <VerwachtPanel basics={basics} ingredients={ingredients} />
                        </div>

                        {/* ── 3. Gemeten waarden ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <h2 className="text-lg font-bold text-brewery-dark mb-4">
                                Gemeten waarden{" "}
                                <span className="text-xs font-normal text-gray-400">(in te vullen na het brouwen)</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <NumField label="OG Gemeten"             field="ogGemeten"                  placeholder="1.052" step="0.001" />
                                <NumField label="FG Gemeten"             field="fgGemeten"                  placeholder="1.010" step="0.001" />
                                <NumField label="ABV Gemeten (%)"        field="abvGemeten"                 placeholder="5.5"   step="0.1"  />
                                <NumField label="Plato Gemeten (°P)"     field="platoGemeten"               placeholder="13.0"  step="0.1"  />
                                <NumField label="Efficiëntie Gemeten (%)" field="brouwefficientieGemeten"   placeholder="72"    step="1" max="100" />
                            </div>
                        </div>

                        {/* ── 4. Ingrediënten per stap ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <h2 className="text-lg font-bold text-brewery-dark mb-5">Ingrediënten per brouwstap</h2>
                            {STAPPEN.map(stap => (
                                <StapSectie
                                    key={stap} stap={stap} ingredients={ingPerStap(stap)} basics={basics}
                                    onChange={handleIngredientChange}
                                    onVerwijder={handleIngredientVerwijder}
                                    onVoegToe={handleVoegIngrToe}
                                />
                            ))}
                        </div>

                        {/* ── 5. Maischschema ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <MaischStapPanel stappen={maischStappen} onChange={handleMaischStapChange} />
                        </div>

                        {/* ── 6. Fermentatieschema ── */}
                        <div className="bg-white border-2 border-black p-6 mb-6">
                            <FermentatieStapPanel
                                stappen={fermentatieStappen}
                                onChange={handleFermentatieChange}
                                onVerwijder={handleVerwijderFermStap}
                                onVoegToe={handleVoegFermStapToe}
                            />
                        </div>

                        {/* ── 7. Notities ── */}
                        <div className="bg-white border-2 border-black p-6 mb-8">
                            <h2 className="text-lg font-bold text-brewery-dark mb-3">Notities</h2>
                            <textarea
                                value={basics.notities}
                                onChange={setBasicsField("notities")}
                                rows={5}
                                placeholder="Procesnotities, speciale instructies, observaties…"
                                className="w-full border-2 border-gray-200 focus:border-brewery-dark focus:outline-none px-3 py-2 text-sm resize-y"
                            />
                        </div>

                        {/* ── Footer save ── */}
                        <div className="flex justify-end">
                            <button
                                type="button" onClick={handleOpslaan} disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-brewery-dark text-white font-bold text-lg hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" />
                                {saving ? "Opslaan…" : "Opslaan"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
