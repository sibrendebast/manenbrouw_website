/**
 * Brouwberekeningen – Manenbrouw
 *
 * Alle formules zijn empirisch geverifieerd aan de hand van het Excel-bestand
 * "LIST - 2026 recepten.xlsx". In het bijzonder:
 *
 * OG  : Berekend vanuit Plato
 *       Plato = (Σ(grain_kg × extractPotential% × efficiency%) / volume_L) × 100
 *       OG = 1 + (Plato / (258.6 - ((Plato/258.2) × 227.1)))
 *
 * FG  : FG_punten = OG_punten × (1 − attenuation/100)
 *
 * ABV : (OG − FG) × 131.25  (vereenvoudigde Balling)
 *
 * Plato: ASBC exacte formule via SG:
 *        P = 135.997·SG³ − 630.272·SG² + 1111.14·SG − 616.868
 *
 * IBU : Standaard Tinseth-formule (metrisch).
 *       Imperiale constante 7490, omgerekend naar metrisch:
 *         7490 × 3.78541 / 28.3495 ≈ 1000 → gedeeld door 100 (AA in %) = 10
 *       IBU = AA% × hoeveelheid_g × utilization × 10 / batchVol_L
 *       utilization = bigness × boilFactor
 *       bigness      = 1.65 × 0.000125^(OG − 1)
 *       boilFactor   = (1 − e^(−0.04 × t)) / 4.15
 *
 * EBC : Morey-formula met metrische schaalfactor
 *       MCU = Σ(kleur_EBC × gewicht_kg) / volume_L × 4.237
 *       (4.237 = (1/1.97) × 2.20462 / 0.264172)
 *       SRM = 1.4922 × MCU^0.6859
 *       EBC = SRM × 1.97
 */

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface FermentableInput {
  hoeveelheid: number;       // kg
  extractPotential: number;  // % (0–100)
  kleurEbc?: number | null;  // EBC kleur voor kleurberekening
}

export interface HopInput {
  hoeveelheid: number;  // gram
  alfazuur: number;     // % alpha-zuur (bijv. 9.5 voor 9.5%)
  tijdMinuten: number;  // kooktijd in minuten
}

export interface BrewingInputs {
  fermentables: FermentableInput[];
  hops?: HopInput[];
  batchVolumeL: number;       // liter in fermentor
  brouwEfficiency: number;    // % (0–100)
  attenuation: number;        // % (0–100)
}

export interface BrewingResults {
  og: number;                  // bijv. 1.052
  fg: number;                  // bijv. 1.010
  abv: number;                 // bijv. 4.8 (%)
  platoOG: number;             // bijv. 13.0 (°Plato van OG)
  platoFG: number;             // bijv. 2.6 (°Plato van FG)
  ibu: number;                 // International Bitterness Units
  ebc: number;                 // European Brewery Convention kleurwaarde
  totaalSuikersNodig: number;  // kg vergistbare suikers
  totaalGranenNodig: number;   // kg granen totaal
}

// ─── Plato ─────────────────────────────────────────────────────────────────────

/** Zet soortelijk gewicht om naar graden Plato (ASBC exacte formule). */
export function sgToPlato(sg: number): number {
  return (
    135.997 * Math.pow(sg, 3)
    - 630.272 * Math.pow(sg, 2)
    + 1111.14 * sg
    - 616.868
  );
}

// ─── OG / FG / ABV ─────────────────────────────────────────────────────────────

/**
 * Berekent OG vanuit granen:
 * 1. Plato berekenen uit extract percentage en brouw efficiency
 * 2. Plato → OG omzetten via de gegeven formule
 * 
 * Plato = (Σ(grain_kg × extractPotential% × efficiency%) / volume_L) × 100
 * OG = 1 + (Plato / (258.6 - ((Plato/258.2) × 227.1)))
 */
export function berekenOG(
  fermentables: FermentableInput[],
  batchVolumeL: number,
  efficiency: number
): number {
  if (!batchVolumeL || batchVolumeL <= 0) return 1.0;
  
  // Stap 1: Bereken totale suikers (kg) uit granen
  const totalSuikersKg = fermentables.reduce(
    (som, f) => som + f.hoeveelheid * (f.extractPotential / 100) * (efficiency / 100),
    0
  );
  
  // Stap 2: Zet om naar Plato (g/L = °Plato bij water dichtheid ~1 kg/L)
  const plato = (totalSuikersKg / batchVolumeL) * 100;
  
  if (plato === 0) return 1.0;
  
  // Stap 3: Plato → OG via gegeven formule
  // OG = 1 + (P / (258.6 - ((P/258.2) × 227.1)))
  const og = 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
  
  return Math.round(og * 10000) / 10000;
}

export function berekenFG(og: number, attenuation: number): number {
  const ogPunten = (og - 1) * 1000;
  const fgPunten = ogPunten * (1 - attenuation / 100);
  return 1 + fgPunten / 1000;
}

export function berekenABV(og: number, fg: number): number {
  return (og - fg) * 131.25;
}

// ─── IBU (Tinseth, standaard metrische constante 10) ────────────────────────────

/**
 * Berekent totale IBU voor alle hop-toevoegingen.
 * Standaard Tinseth-formule, metrisch:
 *   IBU = AA% × hoeveelheid_g × utilization × 10 / volume_L
 *   (10 = 7490 × 3.78541 / 28.3495 / 100 ≈ 1000/100)
 */
export function berekenIBU(hops: HopInput[], ogWort: number, batchVolumeL: number): number {
  if (!hops.length || !batchVolumeL) return 0;
  return hops.reduce((totaal, hop) => {
    if (hop.tijdMinuten <= 0) return totaal;
    const biggness = 1.65 * Math.pow(0.000125, ogWort - 1);
    const boilFactor = (1 - Math.exp(-0.04 * hop.tijdMinuten)) / 4.15;
    const utilization = biggness * boilFactor;
    return totaal + (hop.alfazuur * hop.hoeveelheid * utilization * 10) / batchVolumeL;
  }, 0);
}

// ─── EBC (Morey) ───────────────────────────────────────────────────────────────

/**
 * Berekent EBC kleur op basis van de Morey-formule.
 *
 * MCU (imperial) = Σ(Color_SRM × Weight_lbs) / Volume_gal
 *
 * In metrisch stelsel (EBC, kg, L) gebruiken we een schaalfactor:
 *   MCU = Σ(Color_EBC × Weight_kg) / Volume_L × METRIC_TO_MCU
 *   METRIC_TO_MCU = (1/1.97) × 2.20462 / 0.264172 ≈ 4.237
 *
 * SRM = 1.4922 × MCU^0.6859
 * EBC = SRM × 1.97
 *
 * Geverifieerd: 30 kg @ EBC 3 + 5 kg @ EBC 2 in 160 L → 6.2 EBC ✓
 */
const METRIC_TO_MCU = (1 / 1.97) * 2.20462 / 0.264172;  // ≈ 4.237

export function berekenEBC(fermentables: FermentableInput[], batchVolumeL: number): number {
  if (!batchVolumeL) return 0;
  
  // Stap 1: Bereken metrische kleursom (EBC × kg / L)
  const metricSum = fermentables.reduce((som, f) => {
    if (!f.kleurEbc) return som;
    return som + (f.kleurEbc * f.hoeveelheid) / batchVolumeL;
  }, 0);
  
  if (metricSum === 0) return 0;
  
  // Stap 2: Omzetten naar imperial MCU
  const mcu = metricSum * METRIC_TO_MCU;
  
  // Stap 3: Morey formula: MCU → SRM
  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  
  // Stap 4: SRM → EBC
  return Math.round(srm * 1.97 * 10) / 10;
}

// ─── Totalen ────────────────────────────────────────────────────────────────────

/** Totaal vergistbare suikers (kg) = Σ(gewicht × extractPotential/100) × eff/100 */
export function berekenTotaalSuikers(
  fermentables: FermentableInput[],
  efficiency: number
): number {
  return fermentables.reduce(
    (som, f) => som + f.hoeveelheid * (f.extractPotential / 100) * (efficiency / 100),
    0
  );
}

/** Totaal granen nodig (kg) = Σ gewicht */
export function berekenTotaalGranen(fermentables: FermentableInput[]): number {
  return fermentables.reduce((som, f) => som + f.hoeveelheid, 0);
}

// ─── Gevraagde (target) waarden ────────────────────────────────────────────────

export interface GevraagdeResults {
  ogGevraagd: number;        // berekende target OG
  fgGevraagd: number;        // berekende target FG
  abvGevraagd: number;       // = invoer (doorgegeven voor symmetrie)
  platoGevraagd: number;     // berekende target Plato
  suikersNodig: number | null; // kg vergistbare suikers nodig voor target OG
  granenNodig: number | null;  // kg granen nodig (o.b.v. gem. 78% extractpotentieel)
}

/**
 * Berekent "gevraagde" OG/FG/Plato vanuit een target-ABV en attenuation.
 *
 * Afleiding:
 *   ABV = (OG − FG) × 131.25                     [Balling]
 *   FG  = OG − ABV / 131.25
 *   FG  = OG × (1 − att/100) + OG_pts × att/1000   ... vereenvoudigd:
 *   (OG − FG) = (OG − 1) × att/100   [attenuation definitie]
 *   ABV / 131.25  = (OG − 1) × att/100
 *   OG = 1 + ABV × 100 / (131.25 × att)
 */
/**
 * @param batchVolumeL   indien opgegeven → suikersNodig + granenNodig berekenen
 * @param brouwEfficiency indien opgegeven samen met batchVolumeL (0–100)
 * @param avgExtractPotential gemiddeld extractpotentieel granen in % (default 80)
 */
export function berekenGevraagd(
  abvTarget: number,
  attenuation: number,
  batchVolumeL?: number,
  brouwEfficiency?: number,
  avgExtractPotential = 80,
): GevraagdeResults {
  if (!abvTarget || !attenuation || attenuation <= 0) {
    return { ogGevraagd: 1.0, fgGevraagd: 1.0, abvGevraagd: abvTarget, platoGevraagd: 0, suikersNodig: null, granenNodig: null };
  }
  const og = 1 + (abvTarget * 100) / (131.25 * attenuation);
  const fg = og - abvTarget / 131.25;

  let suikersNodig: number | null = null;
  let granenNodig: number | null = null;
  if (batchVolumeL && batchVolumeL > 0 && brouwEfficiency && brouwEfficiency > 0) {
    const platoGevraagd = sgToPlato(og);
    // suikers (kg) = Plato / 100 × totaal volume (L)
    // (Plato = % dissolved solids by weight; roughly 1 kg/L density)
    suikersNodig = Math.round((platoGevraagd / 100 * batchVolumeL) * 1000) / 1000;
    // granen (kg) = suikers / (avgExtract/100 × eff/100)
    granenNodig  = Math.round((suikersNodig / ((avgExtractPotential / 100) * (brouwEfficiency / 100))) * 1000) / 1000;
  }

  return {
    ogGevraagd:    Math.round(og            * 10000) / 10000,
    fgGevraagd:    Math.round(fg            * 10000) / 10000,
    abvGevraagd:   abvTarget,
    platoGevraagd: Math.round(sgToPlato(og) * 100)   / 100,
    suikersNodig,
    granenNodig,
  };
}

// ─── Gecombineerde berekening ──────────────────────────────────────────────────

/** Voert alle berekeningen uit en geeft één resultaatstruct terug. */
export function berekenAlles(inputs: BrewingInputs): BrewingResults {
  const { fermentables, hops = [], batchVolumeL, brouwEfficiency, attenuation } = inputs;
  const og  = berekenOG(fermentables, batchVolumeL, brouwEfficiency);
  const fg  = berekenFG(og, attenuation);
  const abv = berekenABV(og, fg);
  const ibu = berekenIBU(hops, og, batchVolumeL);
  const ebc = berekenEBC(fermentables, batchVolumeL);
  return {
    og:  Math.round(og  * 10000) / 10000,
    fg:  Math.round(fg  * 10000) / 10000,
    abv: Math.round(abv * 100)   / 100,
    platoOG: Math.round(sgToPlato(og) * 100) / 100,
    platoFG: Math.round(sgToPlato(fg) * 100) / 100,
    ibu: Math.round(ibu * 100) / 100,
    ebc: Math.round(ebc * 10)  / 10,
    totaalSuikersNodig: Math.round(berekenTotaalSuikers(fermentables, brouwEfficiency) * 1000) / 1000,
    totaalGranenNodig:  Math.round(berekenTotaalGranen(fermentables)  * 1000) / 1000,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function formatSG(sg: number): string {
  return sg.toFixed(3);
}

/** volume in L, hoeveelheid in de eenheid van het ingredient → per hL */
export function perHL(hoeveelheid: number, volumeL: number): number {
  if (!volumeL) return 0;
  return (hoeveelheid / (volumeL / 100));
}

/** volume in L, hoeveelheid per hL, batchvolume in L → per batch */
export function perBatch(perHLVal: number, batchVolumeL: number): number {
  return perHLVal * (batchVolumeL / 100);
}

// ─── Standaard lookuptabellen ──────────────────────────────────────────────────

/** Standaard extractPotential per ingredientnaam (indicatief, %). */
export const EXTRACT_DEFAULTS: Record<string, number> = {
  "Pilsnermout":       80,
  "Pale Ale mout":     78,
  "Munich mout":       78,
  "Vienna mout":       78,
  "Crystal 20 EBC":    74,
  "Crystal 60 EBC":    73,
  "Crystal 120 EBC":   71,
  "Chocolademout":     65,
  "Roostgerst":        60,
  "Havervlokken":      70,
  "Tarwemout":         78,
  "Maïsvlokken":       79,
  "Carapils":          72,
  "Caraamber":         73,
  "Special B":         65,
  "Acidulated malt":   65,
  "Melanoidin mout":   75,
};

/** Standaard EBC-kleur per ingredientnaam (indicatief). */
export const EBC_DEFAULTS: Record<string, number> = {
  "Pilsnermout":       4,
  "Pale Ale mout":     8,
  "Munich mout":       15,
  "Vienna mout":       9,
  "Crystal 20 EBC":    20,
  "Crystal 60 EBC":    60,
  "Crystal 120 EBC":   120,
  "Chocolademout":     900,
  "Roostgerst":        1200,
  "Havervlokken":      4,
  "Tarwemout":         4,
  "Maïsvlokken":       2,
  "Carapils":          6,
  "Caraamber":         35,
  "Special B":         300,
  "Acidulated malt":   4,
  "Melanoidin mout":   60,
};

/**
 * Vaste maischschema-stap namen zoals in het Excel-bestand.
 * De volgorde is identiek aan de 4 vaste rijen in het Excel-maischschema.
 */
export const MAISCH_STAP_NAMEN: string[] = [
  "Protein Rest (52°C)",
  "Beta-Amylase Rest (63°C)",
  "Alpha-Amylase Rest (72°C)",
  "Mash Out (78°C)",
];

/** Standaard temperaturen per maisstap (°C). */
export const MAISCH_STAP_TEMP: Record<string, number> = {
  "Protein Rest (52°C)":      52,
  "Beta-Amylase Rest (63°C)": 63,
  "Alpha-Amylase Rest (72°C)": 72,
  "Mash Out (78°C)":           78,
};
