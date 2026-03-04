# Voorraadbeheer Grondstoffen: Design Specification

**Versie:** 1.0  
**Datum:** 4 maart 2026  
**Status:** Design → Implementation Ready  
**Taal:** Nederlands  

---

## 📋 Samenvatting

Dit document definieert een volledige voorraadbeheer- en lot-traceerbaarheidssysteem voor gist, hop, granen, toevoegingen en verpakking. **Strikt gebaseerd op de bijgevoegde spreadsheet**.

---

## 1. SPREADSHEET MAPPING

### 1.1 Kolommen → Datamodel

#### **IN-zijde (Aankoop / Inslag)**

| Kolom | Spreadsheet | Type | Tabel | Veld | Opmerkingen |
|-------|-----------|------|-------|------|-------------|
| (Rij) | Nr inslagbon | String | `StockReceipt` | `receiptNumber` | Unieke ID per aankoop; optioneel |
| 2 | Factuur nummer | String | `StockReceipt` | `invoiceNumber` | Externe referentie leverancier |
| 3 | Datum | ISO Date | `StockReceipt` | `receivedDate` | Ontvangstdatum |
| 4 | Leverancier | String | `Supplier` | `name` + `StockReceipt.supplierId` | Masterdata |
| 6 | Fabricant | String | `StockReceipt` | `manufacturer` | Bv. "Fermentis", "Lallemand" |
| 7 | Soort | String | `RawMaterial` | `name` + `name` | Bv. "LP652", "Verdant IPA" |
| 8 | Lot | String | `InventoryLot` | `lotNumber` | UNIEK per (leverancier + soort) |
| 9 | Houdbaar tot | ISO Date | `InventoryLot` | `expiryDate` | Best-before date; **KRITISCH** |
| 10 | Hoeveelheid [kg] | Decimal | `StockReceipt` | `quantityReceived` | Eenheid volgt uit RawMaterial |
| 11 | Kostprijs [€] | Decimal | `InventoryLot` | `unitCost` | EUR; per eenheid |
| 12 | Afwijking? | String | `StockReceipt` | `deviationFlag` | "ja" /"nee" / null |
| 13 | Actie? | String | `StockReceipt` | `deviationAction` | "geweigerd", "retour", "afgeprijsd", "vernietigd", "gedeeltelijk", "quarantaine", etc. |
| 14 | Opmerkingen | String | `StockReceipt` | `notes` | Vrij veld |

#### **OUT-zijde (Verbruik / Uitslag naar brouwsel)**

| Kolom | Spreadsheet | Type | Tabel | Veld | Opmerkingen |
|-------|-----------|------|-------|------|-------------|
| 1 | Nr Brouwsel | String | `StockAllocation` | `brewNumber` | Ref. naar Recipe.brouwnummer |
| 2 | Datum | ISO Date | `StockAllocation` | `allocationDate` | Datum van verbruik |
| 3 | Soort | String | `RawMaterial` | `name` | Welke grondstof |
| 4 | Hoeveelheid [kg] | Decimal | `StockAllocationLine` | `quantityAllocated` | Verbruikte hoeveelheid |
| 5 | Kostprijs [€] | Decimal | `StockAllocationLine` | `unitCostAtAllocation` | **Snapshot** van kostprijs lot op dat moment |
| 6 | Lot | String | `StockAllocationLine` | `lotId` | Welk lot werd gebruikt |

### 1.2 Categorieën (gegeven)

```
GRANEN ("granen"): mout, basis, röst, speciaal
HOP ("hop"): hop in allerlei vormen
GIST ("gist"): ale, lager, wild, kweek
TOEVOEGINGEN ("toevoegingen"): kruid, fruit, chemisch, etc.
VERPAKKING ("verpakking"): capsules, enz.
```

---

## 2. DATAMODEL (PRISMA)

### 2.1 Nieuwe tabellen

```prisma
// ═════════════════════════════════════════════════════════════════════════
// VOORRAADBEHEER GRONDSTOFFEN
// ═════════════════════════════════════════════════════════════════════════

enum RawMaterialCategory {
  GRANEN      // Mout, basis, röst
  HOP         // Hop in allerlei vormen
  GIST        // Ale, lager, wild, kweek
  TOEVOEGINGEN // Kruid, fruit, chemisch, etc.
  VERPAKKING  // Capsules, etc.
}

enum StockDeviationAction {
  GEWEIGERD        // Leverantie compleet geweigerd
  RETOUR           // (Gedeeltelijke) terugzending
  AFGEPRIJSD       // Gereduceerde prijs aanvaard
  VERNIETIGD       // Vernietigd (FAVV compliance, reden vastleggen)
  GEDEELTELIJK     // Slechts deel ontvangen
  QUARANTAINE      // In quarantaine (analyse naar kwaliteit)
  GEEN_AFWIJKING   // Geen afwijking (default)
}

enum AuditActionType {
  CREATE
  UPDATE
  DELETE
  ALLOCATE       // Toewijzing naar brouwsel
  RECEIVE        // Inslag ontvangst
  DEVIATION      // Afwijking vastgesteld
  RECOUNT        // Hertelling/fysieke controle
}

// ─────────────────────────────────────────────────────────────────────────
// Masterdata: grondstoffen
// ─────────────────────────────────────────────────────────────────────────

/// Masterdata grondstof: basisgegevens (alleen naam, eenheid, categorie).
/// Geen voorraadrijen hier; voorraad volgt uit InventoryLot + StockMovement.
model RawMaterial {
  id                String                   @id @default(uuid())
  name              String                   @unique // "LP652", "Verdant IPA", etc.
  category          RawMaterialCategory
  unit              String                   @default("kg") // "kg", "g", "L", "ml", "stuks", etc.
  description       String?
  isActive          Boolean                  @default(true)

  // Koppeling
  lots              InventoryLot[]           // Alle loten van deze grondstof
  recipeIngredients RecipeIngredient[]       // Gebruik in receptuur (0..*)
  allocations       StockAllocationLine[]    // Gebruik in realisaties (0..*)
  movements         StockMovement[]

  createdAt         DateTime                 @default(now())
  updatedAt         DateTime                 @updatedAt

  @@index([category])
  @@index([isActive])
}

// ─────────────────────────────────────────────────────────────────────────
// Masterdata: leveranciers
// ─────────────────────────────────────────────────────────────────────────

model Supplier {
  id                String           @id @default(uuid())
  name              String           @unique // "Brouwland", "De Coureur", "HVB", etc.
  address           String?
  contact           String?
  phone             String?
  email             String?
  isActive          Boolean          @default(true)

  stockReceipts     StockReceipt[]

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
}

// ─────────────────────────────────────────────────────────────────────────
// Inslag (aankopen): ontvangstbon
// ─────────────────────────────────────────────────────────────────────────

/// Ontvangst van één batch/lot; kan meerdere items (regels) bevatten
/// óf slechts één item (per grondstof).
model StockReceipt {
  id                String                  @id @default(uuid())
  receiptNumber     String?                 // "INS-2025-001", optioneel
  invoiceNumber     String?                 // Leverancier-factuurnummer
  supplierId        String
  supplier          Supplier                @relation(fields: [supplierId], references: [id])

  receivedDate      DateTime                // Moment van ontvangst

  manufacturer      String?                 // Alleen voor producent-info (bv. "Fermentis")

  deviationFlag     Boolean                 @default(false) // Markering: ontvangst afwijking
  deviationAction   StockDeviationAction    @default(GEEN_AFWIJKING)
  deviationNotes    String?                 // Reden afwijking
  notes             String?                 // Algemene opmerkingen ontvangst

  // Alle regels in deze ontvangst
  lines             StockReceiptLine[]

  // Audit
  auditLogs         AuditLog[]              // Koppeling audit

  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  @@index([supplierId])
  @@index([receivedDate])
}

/// Regel in een ontvangst: één grondstof + één lot
model StockReceiptLine {
  id                String              @id @default(uuid())
  receiptId         String
  receipt           StockReceipt        @relation(fields: [receiptId], references: [id], onDelete: Cascade)

  materialId        String
  material          RawMaterial         @relation(fields: [materialId], references: [id])

  quantityReceived  Decimal             @db.Numeric(10, 3) // bijv. 0.055 kg
  unitCost          Decimal             @db.Numeric(10, 4) // €/kg; bijv. €18.95
  
  // Lot info; mag nieuw worden aangemaakt óf link naar bestaand
  lotId             String?
  lot               InventoryLot?       @relation(fields: [lotId], references: [id])

  createdAt         DateTime            @default(now())

  @@unique([receiptId, materialId]) // Niet twee keer dezelfde grondstof per ontvangst
  @@index([materialId])
}

// ─────────────────────────────────────────────────────────────────────────
// Voorraadbeheer: Lot-informatie
// ─────────────────────────────────────────────────────────────────────────

/// Lot: batch van één grondstof, uniek per (materialId, lotNumber, supplierId)
model InventoryLot {
  id                String              @id @default(uuid())
  materialId        String
  material          RawMaterial         @relation(fields: [materialId], references: [id])

  lotNumber         String              // "45806741027711X", "2203741590926", etc.
  manufacturer      String?             // Producent (bv. "Lallemand")
  supplierId        String?             // Optioneel: welke leverancier
  supplier          Supplier?           @relation(fields: [supplierId], references: [id])

  expiryDate        DateTime            // Houdbaarheidsdatum
  
  // Voorraadinformatie snapshot
  quantityTotal     Decimal             @db.Numeric(10, 3) // Totale ontvangen hoeveelheid allertijden
  quantityAllocated Decimal             @db.Numeric(10, 3) @default(0) // Totaal gealloceerd (verbruikt)
  // quantityAvailable = quantityTotal - quantityAllocated (berekend)

  unitCost          Decimal             @db.Numeric(10, 4) // €/kg; kostprijs op moment van aankoop

  isQuarantined     Boolean             @default(false) // In quarantaine (bv. voor analyse)
  status            String              @default("active") // "active", "expired", "depleted", "held"

  // Relaties
  receiptLines      StockReceiptLine[]
  allocations       StockAllocationLine[]
  movements         StockMovement[]

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@unique([materialId, lotNumber, supplierId])
  @@index([materialId])
  @@index([expiryDate])
  @@index([status])
}

// ─────────────────────────────────────────────────────────────────────────
// Uitslag / Allocatie naar brouwsel
// ─────────────────────────────────────────────────────────────────────────

/// StockAllocation: groepering van alle ingrediënten voor één brouwdatum
model StockAllocation {
  id                String                  @id @default(uuid())
  brewNumber        String                  // Ref. naar Recipe.brouwnummer (bv. "2023/001")
  brew              Recipe                  @relation(fields: [brewNumber], references: [brouwnummer])

  allocationDate    DateTime                // Datum uitslag

  totalCost         Decimal                 @db.Numeric(10, 2) // EUR; sum van lines
  notes             String?

  lines             StockAllocationLine[]

  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  @@unique([brewNumber])
  @@index([allocationDate])
}

/// Regel in een uitslag: één grondstof + hoeveelheid + lot
model StockAllocationLine {
  id                String              @id @default(uuid())
  allocationId      String
  allocation        StockAllocation     @relation(fields: [allocationId], references: [id], onDelete: Cascade)

  materialId        String
  material          RawMaterial         @relation(fields: [materialId], references: [id])

  lotId             String
  lot               InventoryLot        @relation(fields: [lotId], references: [id])

  quantityAllocated Decimal             @db.Numeric(10, 3)
  unitCostAtAllocation Decimal          @db.Numeric(10, 4) // Snapshot van lot kostprijs op moment allocatie
  lineCost          Decimal             @db.Numeric(10, 2) // quantityAllocated × unitCostAtAllocation

  notes             String?

  @@unique([allocationId, materialId, lotId])
  @@index([materialId])
  @@index([lotId])
}

// ─────────────────────────────────────────────────────────────────────────
// Voorraadbewegingen (detailed tracking)
// ─────────────────────────────────────────────────────────────────────────

/// StockMovement: elke inslag/allocatie/correctie triggert een movement
/// voors traceerbaarheid en audit trail.
model StockMovement {
  id                String              @id @default(uuid())
  materialId        String
  material          RawMaterial         @relation(fields: [materialId], references: [id])

  lotId             String
  lot               InventoryLot        @relation(fields: [lotId], references: [id])

  movementType      String              // "receipt", "allocation", "correction", "recount"
  quantity          Decimal             @db.Numeric(10, 3) // Toegevoegd (positief) of afgetrokken (negatief)
  
  referenceType     String?             // "StockReceipt", "StockAllocation", "Correction", "Recount"
  referenceId       String?             // ID van bron (receipt/allocation/etc.)

  movedBy           String              // Admin user ID
  movedAt           DateTime            @default(now())

  notes             String?

  @@index([materialId])
  @@index([lotId])
  @@index([movementType])
  @@index([movedAt])
}

// ─────────────────────────────────────────────────────────────────────────
// Audit Log (immutable trail)
// ─────────────────────────────────────────────────────────────────────────

/// Immutable log voor compliance (FAVV): wie, wat, wanneer, details
model AuditLog {
  id                String              @id @default(uuid())

  documentType      String              // "RawMaterial", "InventoryLot", "StockReceipt", "StockAllocation", etc.
  documentId        String              // UUID van het gewijzigde document
  action            AuditActionType
  
  changedBy         String              // Admin user ID of email
  changedAt         DateTime            @default(now())

  oldValue          Json?               // Oude waarde (bijv. voor UPDATE)
  newValue          Json?               // Nieuwe waarde
  context           String?             // Bv. "Deviation noted: Quality mismatch" of "Quantity verified via recount"

  // Relatie naar StockReceipt voor contextuel tracking
  stockReceiptId    String?
  stockReceipt      StockReceipt?       @relation(fields: [stockReceiptId], references: [id], onDelete: SetNull)

  @@index([documentType, documentId])
  @@index([changedBy])
  @@index([changedAt])
}

// ═════════════════════════════════════════════════════════════════════════
// MUTATIES OP BESTAANDE TABELLEN
// ═════════════════════════════════════════════════════════════════════════

// ──── Recipe (MUTATIE: link naar voorraad) ────────────────────────────────

// Toevoegen aan Recipe:
  // stockAllocations StockAllocation[] // "1-werking relatie: één brouwsel → één allocatie"

// Na mutatie:
model Recipe {
  // [... bestaande velden ...]
  
  stockAllocations  StockAllocation[]  // Voorraadoboekingen voor dit brouwsel
}

// ──── RecipeIngredient (MUTATIE: optionele link naar RawMaterial) ─────────

// Toevoegen aan RecipeIngredient:
  // materialId: String? (optie om bestaande grondstof te linken)
  // material: RawMaterial? (optie navigation)

// Na mutatie:
model RecipeIngredient {
  // [... bestaande velden ...]
  
  materialId        String?
  material          RawMaterial?        @relation(fields: [materialId], references: [id])
  // Als je een bestaande grondstof linkt, kun je voorraadinformatie tonen
}
```

### 2.2 Unieke constraints & indexen

```
RawMaterial
  - UNIQUE(name)
  - INDEX(category, isActive)

InventoryLot
  - UNIQUE(materialId, lotNumber, supplierId)
  - INDEX(materialId, status)
  - INDEX(expiryDate)  ← KRITISCH voor vervaldatum-waarschuwingen

StockReceiptLine
  - UNIQUE(receiptId, materialId)  ← Niet twee keer dezelfde grondstof per ontvangst

StockAllocationLine
  - UNIQUE(allocationId, materialId, lotId)

StockAllocation
  - UNIQUE(brewNumber)  ← Slechts één allocatie per brouwsel

AuditLog
  - INDEX(documentType, documentId, changedAt)  ← Voor compliance traces
  - INDEX(changedBy, changedAt)  ← Voor "wie deed wat"
```

### 2.3 Constraints & validatie (database-level)

```
InventoryLot.quantityAllocated ≥ 0
InventoryLot.quantityTotal ≥ InventoryLot.quantityAllocated
  ← Trigger op StockAllocationLine insert: check beschikbare hoeveelheid

StockMovement.quantity < QuantityAvailable (voor allocatie)
  ← Blokkering negatieve voorraad

expiryDate ≥ TODAY voor niet-vervallen loten
```

---

## 3. ROUTES & PAGES

### 3.1 Menu-structuur

```
/admin
  ├─ /brouwadministratie
  │  ├─ /receptuur (BESTAAND, te mutatie: link naar voorraad)
  │  ├─ /voorraadbeheer-grondstoffen (NU)
  │  │  ├─ /overzicht (inventory dashboard)
  │  │  ├─ /inslag (aankup & lot entry)
  │  │  ├─ /uitslag (brouwsel allocation)
  │  │  ├─ /grondstof/[id] (detail, historia, verval)
  │  │  ├─ /lot/[id] (detail, lot traceerbaarheid)
  │  │  └─ /audit (compliance log viewer)
  │  ├─ /voorraadbeheer-afgewerkte (placeholder)
  │  └─ /logboek (placeholder)
  └─ /...
```

### 3.2 Pages per route

#### 3.2.1 `/admin/brouwadministratie/voorraadbeheer-grondstoffen` (root/overzicht)

**Functionaliteit:**
- Inventory dashboard: alle grondstoffen met hoeveelheden
- Filters per categorie (granen/hop/gist/toevoegingen/verpakking)
- **Waarschuwings-panel boven:** "Te verwijderen / vervallen"
  - Rood: Afgelopen houdbaarheidsdatum (expiryDate < TODAY)
  - Oranje: Vervalt binnen X dagen (X = config, bijv. 14)
- Tabel met kolommen:
  - Grondstof naam (link naar detail)
  - Categorie badge
  - Eenheid
  - Totaal beschikbaar (quantityTotal - quantityAllocated per lot, sum per grondstof)
  - Gereserveerd (if enabled; optioneel)
  - Beschikbaar
  - Vervaldatum (groepering/sortering)
  - Acties (bekijk details, inslag, uitslag)

**UI-componenten:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  VERVALDATUM-WAARSHUWING                                  │
│                                                              │
│ Afgelopen (3):  LP652, BE-134, S-04 [Zie lijst]             │
│ Vervalt < 14 d (1):  Voss Kveik (24.03.2026)                │
└─────────────────────────────────────────────────────────────┘

┌─ Filter per categorie ────────────────────────────────┐
│  ☑ GRANEN   ☐ HOP   ☐ GIST   ☐ TOEVOEG.   ☐ VERPAK.  │
└───────────────────────────────────────────────────────┘

┌─ Voorraadjij ─────────────────────────────────────────────────┐
│ Grondstof       │ Cat.   │ Eenheid │ Totaal │ Beschikb.│ Acties│
├─────────────────┼────────┼─────────┼────────┼──────────┼───────┤
│ LP652 (Gist)    │ Gist   │ kg      │ 0.200 │ 0.087    │ [ⓘ] [+] [→]
│   L: 2203...    │        │         │       │          │
│   ✓ 01-06-2025  │        │         │       │          │
├─────────────────┼────────┼─────────┼────────┼──────────┼───────┤
│ Verdant IPA     │ Hop    │ g       │ 0.055 │ 0.055    │ [ⓘ] [+] [→]
│ (Lallemand)     │        │         │       │          │
│   L: 45806741   │        │         │       │          │
│   ✓ 01-02-2025  │        │         │       │          │
└─────────────────┴────────┴─────────┴────────┴──────────┴───────┘

[+ Nieuwe grondstof]  [+ Inslag]
```

#### 3.2.2 `/admin/brouwadministratie/voorraadbeheer-grondstoffen/inslag`

**Functionaliteit:**
- Twee paden:
  1. **Pad A:** Nieuwe grondstof aanmaken (naam, categorie, eenheid)
  2. **Pad B:** Aankoop voor bestaande grondstof
  
- Form (Pad B):
  - Grondstof kiezen (dropdown met autocomplete)
  - Leverancier (dropdown uit Supplier tabel)
  - Fabricant (vrij veld, optioneel)
  - Datum ontvangst
  - Lotnummer (text input; check uniekheid per material+supplier)
  - Houdbaarheidsdatum (date picker; validatie ≥ today)
  - Hoeveelheid (decimal input)
  - Eenheid (read-only uit RawMaterial)
  - Kostprijs €/eenheid
  - Factuurnum. (optioneel)
  - Afwijkingen? (checkbox)
    - Indien yes → Actie dropdown (geweigerd, retour, afgeprijsd, etc.) + notitie
  - Opmerkingen (textarea)

- Validatie:
  - Lotnummer: UNIQUE(materialId, lotNumber, supplierId)
  - Houdbaarheidsdatum ≥ today
  - Hoeveelheid > 0
  - Kostprijs ≥ 0

- Audit: CREATE AuditLog bij opslaan

**UI:**
```
┌─────────────────────────────────────────────────┐
│ INSLAG GRONDSTOF                                │
├─────────────────────────────────────────────────┤
│                                                  │
│ Grondstof: [LP652 ▼]  (optie: + Nieuw)         │
│ Leverancier: [De Coureur ▼]                    │
│ Fabricant: [Fermentis]                         │
│                                                  │
│ Ontvangstdatum: [08-05-2024]                   │
│ Lotnummer: [AJH52300276]                       │
│ Houdbaar tot: [28-02-2026]  (⚠ waarsch.)       │
│                                                  │
│ Hoeveelheid: [0.5] kg                          │
│ Kostprijs: [€46.64] /kg                        │
│ Factuurnr.: [A2024-5521]                       │
│                                                  │
│ [☐] Afwijking bij levering                      │
│     Indien ja: [Selecteer actie ▼] [Notitie]  │
│                                                  │
│ Opmerkingen: [________________________]          │
│                                                  │
│              [← Terug] [Opslaan ✓]             │
└─────────────────────────────────────────────────┘
```

#### 3.2.3 `/admin/brouwadministratie/voorraadbeheer-grondstoffen/uitslag`

**Functionaliteit:**
- **Datumkiezer:** Selecteer uitslag-datum
- **Brouwselnummer:** Dropdown/autocomplete (Recipe.brouwnummer) + optie "Nieuw brouwsel" (link naar receptor-creator)
- **Multiline entry:** Tabel met rijen voor elk ingredient
  - Grondstof (dropdown uit RawMaterial; sortering: alfabetisch)
  - Hoeveelheid (decimal)
  - Lot (dropdown met beschikbare loten, FEFO-sortering: expiryDate ASC)
    - Toon per lot: [LotNumber] (Beschikb: X kg, Vervalt: datum)
  - Automatische berekening: unitCost × hoeveelheid = lineCost
  - Notitie (optioneel)
  - [🗑] Delete row

- Onderaan: **Totale kostprijs = SUM(lineCosts)**

- Validatie:
  - Brouwselnummer: UNIQUE per StockAllocation
  - Hoeveelheid > 0
  - Lot beschikbare hoeveelheid ≥ gevraagde hoeveelheid (else: error)
  - Korting voorkomt double-allocation: check geen andere rij reeds dit lot gebruikt (per brouwsel)

- Buttons:
  - [+ Nieuwe regel]
  - [← Terug]
  - [Opslaan ✓] → Maak StockAllocation + AllocationLines + StockMovements + AuditLog

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│ UITSLAG NAAR BROUWSEL                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Baildatum: [26-02-2025]  Brouwsel: [2025/001 ▼]                │
│                                                                  │
│ ┌─ INGREDIËNTEN ───────────────────────────────────────────┐   │
│ │ Grondstof      │Hoeveelheid│ Lot          │ Kostprijs │ 🗑 │   │
│ ├────────────────┼───────────┼──────────────┼───────────┼──┤   │
│ │ [LP652▼]       │ [0.013] kg│ [2203...▼]   │ €10.84    │   │   │
│ │                │           │ Beschikb: 0.120 kg       │   │   │
│ │                │           │ Vervalt: 11/2025         │   │   │
│ ├────────────────┼───────────┼──────────────┼───────────┼──┤   │
│ │ [Voss Kveik▼]  │ [0.125]   │ [45708...▼]  │ €23.06    │   │   │
│ │                │           │ Beschikb: 0.375 kg       │   │   │
│ │                │           │ Vervalt: 31/08/2025      │   │   │
│ └────────────────┴───────────┴──────────────┴───────────┴──┘   │
│                                                                  │
│                               Totaal: €33.90                     │
│                                                                  │
│                    [+ Nieuwe regel]                             │
│               [← Terug]  [Opslaan ✓]                           │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.4 `/admin/brouwadministratie/voorraadbeheer-grondstoffen/grondstof/[id]`

**Functionaliteit:**
- Detail-pagina voor één grondstof
- **Top-sectie:**
  - Naam, categorie, eenheid
  - Totale hoeveelheid (sum over alle loten)
  - Beschikbare hoeveelheid (beschikb. - gealloceerd)
  - Gereserveerd (optioneel)
  
- **Tabel: Alle loten van deze grondstof**
  - Lotnummer
  - Leverancier
  - Houdbaarheidsdatum (met kleur: groen OK, oranje < 14d, rood vervallen)
  - Hoeveelheid totaal
  - Gealloceerd
  - Beschikbaar
  - Kostprijs
  - Status (active, expired, depleted, quarantined)
  - [ⓘ Details] (link naar lot/[id])

- **Tabel: Gebruikshistorisch (verbruik per brouwsel)**
  - Brouwsel
  - Datum
  - Hoeveelheid
  - Lot bron
  - Kostprijs
  - Acties

- **Audit trail:** Link naar /audit met filter op deze grondstof

**UI:**
```
┌─────────────────────────────────────────────────────┐
│ GRONDSTOF: LP652 (Gist)                             │
├─────────────────────────────────────────────────────┤
│ Categorie: Gist      │ Eenheid: kg                  │
│ Totaal beschikbaar: 0.200 kg  Gealloceerd: 0.113 kg│
│ Beschikbaar: 0.087 kg                               │
│                                                      │
├─ LOTEN ────────────────────────────────────────────┤
│ Lot         │ Leverancier  │ Vervalt    │ Totl │...│
├─────────────┼──────────────┼────────────┼──────┼───┤
│ 2203...     │ De Coureur   │ 01-06-2025 │ 0.050│ ⓘ│
│ Status: active                                     │
├─────────────┼──────────────┼────────────┼──────┼───┤
│ 220633311   │ Brouwland    │ 11-2025    │ 0.150│ ⓘ│
│ Status: active                                     │
└─────────────┴──────────────┴────────────┴──────┴───┘

├─ VERBRUIK ──────────────────────────────────────────┤
│ Brouwsel    │ Datum      │ Hoeveelheid │ Lot    │...│
├─────────────┼────────────┼─────────────┼────────┼───┤
│ 2025-001    │ 19-02-2025 │ 0.025 kg    │ 2203..│ ⓘ│
│ 2024-009    │ 13-11-2024 │ 0.013 kg    │ 220633│ ⓘ│
└─────────────┴────────────┴─────────────┴────────┴───┘

[← Terug]  [Audit trail]
```

#### 3.2.5 `/admin/brouwadministratie/voorraadbeheer-grondstoffen/lot/[id]`

**Functionaliteit:**
- Detail-pagina voor één lot
- **Header:**
  - Lot-info: nummer, grondstof, leverancier, fabricant
  - Houdbaarheidsdatum veel prominenter (met waarschuwing als binnenkort vervallen/vervallen)
  - Aankoopdatum
  - Totale hoeveelheid
  - Gealloceerd
  - Beschikbaar
  - Kostprijs (€/eenheid)
  
- **"Aankoop-info sectie":**
  - Factuurnummer
  - Ontvangstdatum
  - Afwijking (was afwijking = yes → toon actie + notitie)
  - Opmerkingen

- **"Gebruiks-historia":**
  - Alle brouwsels waarin dit lot is verbruikt
  - Brouwsel, datum, hoeveelheid, totale kost voor dit lot

- **Traceerbaarheid:**
  - Audit log: alle wijzigingen aan dit lot (created, updated, status changes)
  - Compliance: wie ontving dit lot, wanneer allocated het, etc.

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ LOT: 2203741590926 (LP652 - Gist)                           │
│ ⚠️  Vervalt: 01-06-2025 (in 88 dagen)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Grondstof: LP652        Leverancier: De Coureur            │
│ Fabricant: Fermentis    Aankoopdatum: 08-05-2024           │
│ Hoeveelheid: 0.1 kg     Kostprijs: €83.37/kg               │
│ Status: active                                              │
│                                                              │
├─ AANKOOP ─────────────────────────────────────────────────┤
│ Factuurnummer: A2023005                                     │
│ Ontvangensam: 28-03-2023                                    │
│ Afwijking: ☐ Nee  [Geen aanvullende actie]                │
│ Opmerkingen: [Notitie]                                      │
│                                                              │
├─ VERBRUIK ─────────────────────────────────────────────────┤
│ Brouwsel    │ Datum      │ Hoeveelheid │ Totale kost│       │
├─────────────┼────────────┼─────────────┼─────────────┤       │
│ 2023/001    │ 30-03-2023 │ 0.025 kg    │ €2.08      │       │
│ 2023/004    │ 08-06-2023 │ 0.025 kg    │ €2.08      │       │
│ 2024/001    │ 24-01-2024 │ 0.025 kg    │ €2.08      │       │
│ (en meer...)                                                 │
│                                                              │
├─ AUDIT TRAIL ──────────────────────────────────────────────┤
│ [Toon volledig audit log]                                   │
│                                                              │
│ 14-03-2026 16:20 | Sibring | ALLOCATE | 2025/002           │
│ 08-05-2024 09:45 | Sibring | CREATE   | Aankoop            │
│                                                              │
│ [← Terug]                                                   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.6 `/admin/brouwadministratie/voorraadbeheer-grondstoffen/audit`

**Functionaliteit:**
- Audit log viewer (compliance / FAVV)
- Filter:
  - Document type (RawMaterial, InventoryLot, StockReceipt, StockAllocation, etc.)
  - Action (CREATE, UPDATE, DELETE, ALLOCATE, RECEIVE, DEVIATION, RECOUNT)
  - Datum range
  - User (wie deed het)
  - Grondstof (optioneel)

- Tabel:
  - Timestamp
  - Action
  - Document
  - User
  - Old value (if UPDATE)
  - New value (if UPDATE)
  - Context/notes
  - [👁 Details]

---

## 4. API & ENDPOINTS

### 4.1 Overzicht

```
POST   /api/admin/inventory/materials
GET    /api/admin/inventory/materials
GET    /api/admin/inventory/materials/:id
PUT    /api/admin/inventory/materials/:id

POST   /api/admin/inventory/suppliers
GET    /api/admin/inventory/suppliers
GET    /api/admin/inventory/suppliers/:id

POST   /api/admin/inventory/receipts
GET    /api/admin/inventory/receipts
GET    /api/admin/inventory/receipts/:id
PUT    /api/admin/inventory/receipts/:id

GET    /api/admin/inventory/lots
GET    /api/admin/inventory/lots/:id
PUT    /api/admin/inventory/lots/:id (status, quarantine, etc.)

POST   /api/admin/inventory/allocations
GET    /api/admin/inventory/allocations
GET    /api/admin/inventory/allocations/:id

GET    /api/admin/inventory/audit
POST   /api/admin/inventory/audit (manual entry?)

GET    /api/admin/inventory/dashboard
  → Retourneert: expired lots, near-expiry lots, stock levels
```

### 4.2 Gedetailleerde endpoints

#### POST /api/admin/inventory/materials

**Request:**
```json
{
  "name": "LP652",
  "category": "GIST",
  "unit": "kg",
  "description": "Fermentis lager yeast",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "LP652",
  "category": "GIST",
  "unit": "kg",
  "description": "Fermentis lager yeast",
  "isActive": true,
  "createdAt": "2026-03-04T...",
  "updatedAt": "2026-03-04T..."
}
```

**Validatie:**
- `name` UNIQUE
- `category` ∈ [GRANEN, HOP, GIST, TOEVOEGINGEN, VERPAKKING]
- `unit` non-empty

**Audit:** CREATE AuditLog

---

#### POST /api/admin/inventory/receipts

**Request:**
```json
{
  "supplierId": "uuid",
  "invoiceNumber": "A2024-5521",
  "receivedDate": "2024-05-08T00:00:00Z",
  "manufacturer": "Fermentis",
  "deviationFlag": false,
  "deviationAction": "GEEN_AFWIJKING",
  "deviationNotes": null,
  "notes": null,
  "lines": [
    {
      "materialId": "uuid",
      "quantityReceived": 0.5,
      "unitCost": 46.64,
      "lotNumber": "AJH52300276",
      "expiryDate": "2026-02-28T00:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "receiptNumber": "RCP-2025-0001",
  "invoiceNumber": "A2024-5521",
  "supplierId": "uuid",
  "receivedDate": "2024-05-08T...",
  "deviationFlag": false,
  "deviationAction": "GEEN_AFWIJKING",
  "lines": [
    {
      "id": "uuid",
      "materialId": "uuid",
      "lotId": "uuid",
      "quantityReceived": 0.5,
      "unitCost": 46.64
    }
  ],
  "createdAt": "2026-03-04T..."
}
```

**Validatie:**
- `supplierId` exists
- Per line:
  - `materialId` exists
  - `quantityReceived` > 0
  - `unitCost` ≥ 0
  - `expiryDate` ≥ today
  - `lotNumber`: UNIQUE(materialId, lotNumber, supplierId)

**Side effects:**
- CREATE InventoryLot (op basis van lotNumber)
- CREATE StockMovement (type: "receipt", quantity = quantityReceived)
- CREATE AuditLog (RECEIVE action)

---

#### POST /api/admin/inventory/allocations

**Request:**
```json
{
  "brewNumber": "2025/001",
  "allocationDate": "2025-02-19T00:00:00Z",
  "notes": "Normale gebruikaarvoor batch 2025/001",
  "lines": [
    {
      "materialId": "uuid",
      "lotId": "uuid",
      "quantityAllocated": 0.025,
      "unitCostAtAllocation": 83.37
    },
    {
      "materialId": "uuid1",
      "lotId": "uuid2",
      "quantityAllocated": 0.125,
      "unitCostAtAllocation": 92.22
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "brewNumber": "2025/001",
  "allocationDate": "2025-02-19T...",
  "totalCost": 13.85,
  "lines": [
    {
      "id": "uuid",
      "materialId": "uuid",
      "lotId": "uuid",
      "quantityAllocated": 0.025,
      "unitCostAtAllocation": 83.37,
      "lineCost": 2.08
    },
    ...
  ],
  "createdAt": "2026-03-04T..."
}
```

**Validatie:**
- `brewNumber`: UNIQUE, moet Recipe bestaan
- Per line:
  - `materialId`, `lotId` exist
  - `quantityAllocated` > 0
  - `quantityAllocated` ≤ lot.quantityAvailable (quantityTotal - quantityAllocated)
  - Geen dubbele (materialId, lotId) in dezelfde allocation
  - Lot status ≠ "expired", "quarantined"

**Side effects:**
- CREATE StockAllocationLine
- UPDATE InventoryLot.quantityAllocated (+=quantityAllocated)
- CREATE StockMovement (type: "allocation", quantity = -quantityAllocated)
- UPDATE Recipe.updatedAt
- CREATE AuditLog (ALLOCATE action)

---

#### GET /api/admin/inventory/dashboard

**Response:**
```json
{
  "expiredLots": [
    {
      "id": "uuid",
      "materialName": "LP652",
      "lotNumber": "2203741590926",
      "expiryDate": "2025-06-01T...",
      "quantityAvailable": 0.087,
      "daysOverdue": 10,
      "supplier": "De Coureur"
    }
  ],
  "nearExpiryLots": [
    {
      "id": "uuid",
      "materialName": "Voss Kveik",
      "lotNumber": "45708840430611V",
      "expiryDate": "2025-03-24T...",
      "quantityAvailable": 0.25,
      "daysUntilExpiry": 20,
      "supplier": "De Coureur"
    }
  ],
  "categoryTotals": {
    "GRANEN": {
      "totalQuantity": 2.5,
      "lotsCount": 3,
      "expiredLotsCount": 0,
      "nearExpiryCount": 1
    },
    ...
  },
  "recentMovements": [
    {
      "id": "uuid",
      "materialName": "LP652",
      "movementType": "allocation",
      "quantity": -0.025,
      "brewNumber": "2025/001",
      "movedAt": "2025-02-19T..."
    }
  ]
}
```

---

## 5. KOSTPRIJSBEREKENING

### 5.1 Principes

1. **Lot-gebaseerde kostprijs:**
   - Per lot wordt bij aankoop vastgelegd: `unitCost` (€ per eenheid)
   - Deze kostprijs **verandert niet meer** (snapshot)

2. **Allocatie-snapshot:**
   - Bij allocatie naar brouwsel wordt `unitCostAtAllocation` opgeslagen (gelijk aan lot.unitCost op dat moment)
   - Hiermee is kostprijs perfectuitsluitend traceerbaar per brouwsel

3. **Berekening per allocatie-regel:**
   ```
   lineCost = quantityAllocated × unitCostAtAllocation
   Voorbeeld: 0.025 kg × €83.37/kg = €2.08 (afronding op 2 decimalen)
   ```

4. **Totaal per allocatie (brouwsel):**
   ```
   allocationTotalCost = SUM(lineCost voor alle regels)
   ```

### 5.2 Afronding

- **unitCost:** 4 decimalen (Decimal(10, 4)) in database
- **lineCost:** 2 decimalen (Decimal(10, 2)) in database
- Berekening in API: `Math.round(quantityAllocated × unitCost × 100) / 100` (banker's rounding of half-even)

### 5.3 Voorbeeld uit spreadsheet

```
Inslag 08-05-2024, Lot AJH52300276 (S-04):
  - Hoeveelheid: 0.5 kg
  - Kostprijs: €46.64/kg
  - Totaal ontvangst: 0.5 × €46.64 = €23.32

Allocatie naar 2024/008 (19-09-2024):
  - Hoeveelheid gebruikt: 0.125 kg
  - Kostprijs snapshot: €46.64/kg
  - Lijnkosten: 0.125 × €46.64 = €5.83
```

---

## 6. RECEPTUUR (MUTATIES)

### 6.1 Huidige toestand (Recipe/RecipeIngredient)

Zie `/prisma/schema.prisma` — er bestaan al Recipe en RecipeIngredient tabellen. RecipeIngredient heeft:
- `naam` (String) ← ingredient name (bv. "LP652")
- `hoeveelheid`, `eenheid`
- Maar: **geen** `materialId` (geen link naar RawMaterial)

### 6.2 Mutaties

#### Toevoeging 1: RawMaterial-link aan RecipeIngredient

```prisma
model RecipeIngredient {
  // ... bestaande velden ...
  
  // NEW: optionele link naar RawMaterial
  materialId        String?
  material          RawMaterial?  @relation(fields: [materialId], references: [id])
}
```

**Logica:**
- Bij **create/update RecipeIngredient:**
  - User kiest "Bestaande grondstof" → autocomplete dropdown → `materialId` ingevuld
  - User kiest "Nieuw/handmatig" → `materialId` = null, `naam` = vrij veld (user-specified)
  - Bij "handmatig" + kiezen op recept later: evt. trigger om RawMaterial aan te maken?

#### Toevoeging 2: StockAllocation-link aan Recipe

```prisma
model Recipe {
  // ... bestaande velden ...
  
  // NEW: link naar voorraad-allocatie
  stockAllocations  StockAllocation[]
}
```

**Logica:**
- Per brouwsel kan er maximaal 1 StockAllocation bestaan (één keer "verwerkt" naar voorraad)
- UI: Bij receptuur-detail toont link "Voorraadtoewijzing: [Link naar allocatie]"

### 6.3 UI-aanpassingen Receptuur

#### Ingredient-toevoegen form

**Huidig (te behouden):**
```
┌─ Ingrediënt toevoegen ──────────┐
│ Naam: [LP652______]  ← Vrij veld│
│ Type: [Gist ▼]                 │
│ Hoeveelheid: [0.025]            │
│ Eenheid: [kg ▼]                 │
│ Alfa-zuur: [5.2] (hop)          │
│ ...                             │
│ [Toevoegen ✓]  [Annuleren]         │
└─────────────────────────────────┘
```

**Mutatie 1: Dropdown "Bestaande grondstof"**
```
┌─ Ingrediënt toevoegen ──────────────────────┐
│ [⊙] Nieuw/Handmatig [○] Bestaande grondstof│
│                                              │
│ Naam: [LP652______]                        │
│   óf [Zoek grondstof... ▼]                 │
│   (Toon: "LP652 (Gist)" [voorraadinf.])   │
│                                              │
│ Hoeveelheid: [0.025]                        │
│ Eenheid: [kg ▼] (read-only uit RawMaterial)│
│                                              │
│ [ℹ Voorraadinf.] (als RawMaterial gekozen) │
│   Beschikbaar: 0.087 kg                     │
│   Status: ✓ Voldoende                      │
│                                              │
│ [Toevoegen ✓]  [Annuleren]                  │
└──────────────────────────────────────────────┘
```

#### Recipe-detect pagina

**Toevoeging: Voorraadinformatie-panel**

```
┌─ Receptuur: 2025/001 ───────────────────────┐
│ Batch: 20 L  Efficiency: 75%  ABV: 4.8%     │
│ ...                                          │
│ ┌─ INGREDIËNTEN ─────────────────────────┐  │
│ │ Ingrediënt    │Hoeveelhd│Voorraad │ ...│  │
│ ├───────────────┼─────────┼─────────┼─...┤  │
│ │ LP652 (Gist)  │ 0.025   │ 0.087 ✓ │ ... │ │
│ │               │ (kg)    │ (kg)    │     │ │
│ │ Voss Kveik    │ 0.125   │ 0.25  ✓ │ ... │ │
│ │ ...           │ ...     │ ...     │     │ │
│ └───────────────┴─────────┴─────────┴─...┘  │
│                                              │
│ 🟢 ALLES BESCHIKBAAR — Klaar om toe te wijzen│
│    [Naar Voorraadbeheer ➜] (allocatie)     │
│                                              │
│ [← Terug]                                   │
└──────────────────────────────────────────────┘
```

---

## 7. EDGE CASES & VALIDATIE

### 7.1 Negatieve voorraad BLOKKEREN

```
Validatie: Wanneer allocatie wordt opgeslagen,
check: InventoryLot.quantityTotal ≥ SUM(quantityAllocated over alle allocaties)

Fout: "Onvoldoende voorraad: LP652 lot 2203741590926
       Beschikbaar: 0.087 kg, Gevraagd: 0.100 kg"
```

### 7.2 Gedeeltelijke leveringen

**Scenario:** Besteld 0.5 kg, ontvangen 0.3 kg.  
**Oplossing:**
- User kiest `deviationAction = "GEDEELTELIJK"`
- Voert `quantityReceived = 0.3` in
- `deviationNotes = "Remainder expected 2026-03-15"`

**Database:**
- 1 InventoryLot per ontvangen batch
- Tweede lot: verwacht, maar nog niet

### 7.3 Korrecties (overzet / toeslag / verlies)

**UI (toekomstige feature):**
```
[Admin] → Voorraadbeheer → [Correctie]
  Grondstof: [LP652 ▼]
  Lot: [AJH524... ▼]
  Correctie-type: [Hervulling / Overlijving / Verlies ▼]
  Hoeveelheid: [+0.025] kg (positief = toevoeging, negatief = verlies)
  Reden: [________________________________]
  Audit: CREATE StockMovement (type="correction") + AuditLog
```

### 7.4 Quarantaine / Hold Stock

```
UI: Lot detail → Status dropdown [Active ▼]
    Opties: Active, Quarantined, Expired, Depleted
    
    Bij "Quarantined":
      - InventoryLot.isQuarantined = true
      - InventoryLot.status = "quarantined"
      - Allocaties naar dit lot: BLOKKEREN
      - AuditLog: "Lot placed in quarantine - Quality check in progress"
```

### 7.5 Verlopen loten

```
Automatische detectie:
  - Cron job (dagelijks): scan InventoryLot where expiryDate < NOW
  - Set status = "expired"
  - Toon UI-waarschuwing

Allocatie naar verlopen lot: BLOKKEREN
  Error: "Lot AJH... is vervallen (31-01-2025)"
```

### 7.6 Race conditions / Concurrency

**Probleem:** Twee admins alloceren tegelijktijd van hetzelfde lot?  
**Oplossing:**
- Database constraint: InventoryLot.quantityAllocated ≥ 0
- Applicatie: Transactie bij allocatie-insert:
  ```
  BEGIN TRANSACTION
    1. Lock InventoryLot FOR UPDATE
    2. Calculate available = quantityTotal - quantityAllocated
    3. If quantityAllocated > available: ROLLBACK + error
    4. INSERT StockAllocationLine
    5. UPDATE InventoryLot.quantityAllocated
    6. INSERT StockMovement
    7. INSERT AuditLog
  COMMIT
  ```

### 7.7 Dubbele allocatie voorkomen

```
Constraint: UNIQUE(allocationId, materialId, lotId)
  ← Per brouwsel, hetzelfde lot maximaal 1 keer gebruiken

UI: If user probeert dezelfde (material, lot) toe te voegen:
    Error: "Dit lot is al in deze brouwseling opgenomen"
```

### 7.8 FEFO (First Expiry First Out) suggestie

```
Bij allocatie-form, lot dropdown voor gegeven material:
  ORDER BY expiryDate ASC (vroegste vervaldatum eerst)
  
  SELECT * FROM InventoryLot 
  WHERE materialId = ? AND quantityAvailable > 0
  ORDER BY expiryDate ASC, createdAt ASC
  
  Default selection: eerste rij (vroegste vervaldatum)
  User kan handmatig wijzigen (dropdown)
```

---

## 8. TRACEERBAARHEID & COMPLIANCE (FAVV)

### 8.1 Dataflow: Ingrediënt → Brouwsel → (Toekomstig: Eindproduct)

```
RawMaterial (masterdata)
  ↓
InventoryLot (batch per leverancier+lotnummer)
  ├─ StockReceipt (ontvangsbon)
  └─ StockMovement (behoefte voorraad)
  
StockAllocationLine (gebruik per brouwsel)
  ├─ StockAllocation (groepering per brouwsel — link naar Recipe.brouwnummer)
  ├─ StockMovement (voorraadreductie)
  └─ Recipe (brouwdocument)

Query: "Welke loten gebruikt in brouwsel 2025/001?"
  SELECT sal.*, sl.material, sl.expiryDate 
  FROM StockAllocationLine sal
  JOIN StockAllocation sa ON sal.allocationId = sa.id
  JOIN InventoryLot il ON sal.lotId = il.id
  JOIN RawMaterial rm ON il.materialId = rm.id
  WHERE sa.brewNumber = '2025/001'

Query: "In welke brouwsels is lot AJH524... gebruikt?"
  SELECT sa.brewNumber, sal.quantityAllocated, sa.allocationDate
  FROM StockAllocationLine sal
  JOIN StockAllocation sa ON sal.allocationId = sa.id
  WHERE sal.lotId = 'uuid-of-lot'
```

### 8.2 Immutable Audit Log

**Schema: AuditLog (zie 2.1)**

```
documentType      : Welk datatype (RawMaterial, InventoryLot, etc.)
documentId        : UUID van het document
action            : CREATE, UPDATE, DELETE, ALLOCATE, RECEIVE, DEVIATION, RECOUNT
changedBy         : User ID / email
changedAt         : Timestamp
oldValue          : JSON snapshot (voor UPDATE/DELETE)
newValue          : JSON snapshot (voor CREATE/UPDATE)
context           : Beschrijving (bv. reden afwijking, kwaliteit-check)
```

**Voorbeeld traces:**

```
1. Aankoop LP652:
   AuditLog {
     documentType: "RawMaterial",
     documentId: "uuid-of-lp652",
     action: "CREATE",
     changedBy: "sibren@manenbrouw.nl",
     changedAt: 2023-03-28,
     newValue: { name: "LP652", category: "GIST", unit: "kg" }
   }

2. Ontvangst batch:
   AuditLog {
     documentType: "InventoryLot",
     documentId: "uuid-of-lot",
     action: "CREATE",
     newValue: { lotNumber: "2203741590926", quantityTotal: 0.1, expiryDate: "2025-06-01", ... }
   }
   AuditLog {
     documentType: "StockReceipt",
     documentId: "uuid-of-receipt",
     action: "RECEIVE",
     changedBy: "sibren",
     context: "Received from Brouwland, qty 0.1 kg, cost €83.37/kg"
   }

3. Allocatie naar brouwsel 2025/001:
   AuditLog {
     documentType: "StockAllocation",
     documentId: "uuid-of-allocation",
     action: "ALLOCATE",
     changedBy: "sibren",
     context: "Allocated to brew 2025/001: 0.025 kg LP652 (lot 2203...)"
   }

4. Afwijking en quarantaine:
   AuditLog {
     documentType: "InventoryLot",
     documentId: "uuid-of-lot2",
     action: "DEVIATION",
     changedBy: "sibren",
     oldValue: { status: "active", ... },
     newValue: { status: "quarantined", isQuarantined: true },
     context: "Quality issue detected: discoloration. Lot placed on hold for analysis."
   }
```

### 8.3 Permissies / Rollen

```
ADMIN_USER role (bestaand):
  - Volledige toegang voorraadbeheer
  
(Toekomstig) INVENTORY_MANAGER:
  - Inslag: CREATE, READ, UPDATE
  - Uitslag: CREATE, READ
  - Audit: READ-only
  
(Toekomstig) BREWER:
  - Receptuur: CREATE, READ, UPDATE, DELETE
  - Allocation: READ-only
  - Audit: READ-only
```

---

## 9. TESTPLAN

### 9.1 Unit tests (Node/Jest)

#### 9.1.1 RawMaterial CRUD

```gherkin
Feature: RawMaterial Management

  Scenario: Create new raw material
    Given no RawMaterial named "LP652"
    When I POST /api/admin/inventory/materials with { name: "LP652", category: "GIST", unit: "kg" }
    Then response status is 201
    And RawMaterial.name = "LP652"
    And AuditLog action = "CREATE"

  Scenario: Prevent duplicate material name
    Given RawMaterial "LP652" exists
    When I POST /api/admin/inventory/materials with { name: "LP652", ... }
    Then response status is 409
    And error message contains "UNIQUE constraint failed"

  Scenario: Get material with inventory summary
    Given RawMaterial "LP652" with 3 lots (totaal 0.200 kg, gealloceerd 0.113 kg)
    When I GET /api/admin/inventory/materials/uuid
    Then response includes {
      "name": "LP652",
      "totalQuantity": 0.200,
      "allocatedQuantity": 0.113,
      "availableQuantity": 0.087,
      "lotsCount": 3
    }
```

#### 9.1.2 StockReceipt (Inslag)

```gherkin
Feature: Stock Receipt (Inslag)

  Scenario: Create receipt with single lot
    Given Supplier "Brouwland", Material "LP652"
    When I POST /api/admin/inventory/receipts with {
      supplierId: "...",
      invoiceNumber: "A2023005",
      receivedDate: "2023-03-28",
      lines: [{
        materialId: "...",
        quantityReceived: 0.1,
        unitCost: 83.37,
        lotNumber: "2203741590926",
        expiryDate: "2025-06-01"
      }]
    }
    Then response status is 201
    And InventoryLot.quantityTotal = 0.1
    And InventoryLot.unitCost = 83.37
    And StockMovement.quantity = 0.1 (type: "receipt")
    And AuditLog.action = "RECEIVE"

  Scenario: Reject receipt with past expiry date
    When I POST /api/admin/inventory/receipts with expiryDate: "2023-01-01"
    Then response status is 422
    And error message contains "expiryDate must be >= today"

  Scenario: Reject receipt with negative quantity
    When I POST /api/admin/inventory/receipts with quantityReceived: -0.5
    Then response status is 422
    And error message contains "quantityReceived must be > 0"

  Scenario: Unique constraint on (materialId, lotNumber, supplierId)
    Given InventoryLot "LP652" + lot "2203741590926" + supplier "Brouwland"
    When I POST /api/admin/inventory/receipts with same (materialId, lotNumber, supplierId)
    Then response status is 409
    And error contains "UNIQUE constraint"
```

#### 9.1.3 StockAllocation (Uitslag)

```gherkin
Feature: Stock Allocation (Uitslag)

  Scenario: Create allocation for brew
    Given Recipe "2025/001" exists
    And InventoryLot "LP652" (lot 2203...) with quantityAvailable 0.200 kg
    When I POST /api/admin/inventory/allocations with {
      brewNumber: "2025/001",
      allocationDate: "2025-02-19",
      lines: [{
        materialId: "...",
        lotId: "...",
        quantityAllocated: 0.025,
        unitCostAtAllocation: 83.37
      }]
    }
    Then response status is 201
    And StockAllocationLine.lineCost = 2.08 (afgerond 0.025 × 83.37)
    And InventoryLot.quantityAllocated increases by 0.025
    And StockMovement.quantity = -0.025 (type: "allocation")
    And AuditLog.action = "ALLOCATE"

  Scenario: Prevent allocation beyond available quantity
    Given InventoryLot "LP652" with quantityAvailable 0.050 kg
    When I POST /api/admin/inventory/allocations with quantityAllocated 0.100
    Then response status is 422
    And error contains "Insufficient stock: available 0.050, requested 0.100"

  Scenario: Prevent allocation to expired lot
    Given InventoryLot with expiryDate < TODAY and status = "expired"
    When I POST /api/admin/inventory/allocations with this lot
    Then response status is 422
    And error contains "Lot has expired"

  Scenario: Enforce UNIQUE(allocationId, materialId, lotId)
    Given StockAllocation for brew 2025/001 with LP652 lot 2203...
    When I add same (materialId, lotId) to allocation
    Then response status is 409
    And error contains "Lot already allocated in this brew"

  Scenario: Calculate total cost correctly
    Given allocation with 3 lines:
      - 0.025 kg × €83.37 = €2.08
      - 0.125 kg × €92.22 = €11.53
      - 0.013 kg × €10.84 = €0.14
    Then allocationTotalCost = €13.75
```

#### 9.1.4 Inventory lot availability

```gherkin
Feature: Lot availability calculation

  Scenario: Calculate available quantity
    Given InventoryLot with:
      - quantityTotal: 0.200
      - quantityAllocated: 0.113
    Then quantityAvailable = 0.087

  Scenario: Track lot status
    When expiryDate < TODAY
    Then status = "expired"
    When quantityAvailable = 0
    Then status = "depleted"
    When isQuarantined = true
    Then status = "quarantined"
```

#### 9.1.5 Cost price snapshot

```gherkin
Feature: Unit cost tracking

  Scenario: Snapshot cost at allocation
    Given InventoryLot with unitCost 83.37 (historical)
    When lot cost changes to 85.00 (new receipt)
    And I allocate from original lot
    Then unitCostAtAllocation = 83.37 (original snapshot)
    And newer allocations use 85.00

  Scenario: Correct cost per allocation line
    Given allocation with quantityAllocated 0.025, unitCostAtAllocation 83.37
    Then lineCost = 2.08 (via calculation 0.025 × 83.37, rounded 2 decimals)
```

### 9.2 Integration tests

#### 9.2.1 Full workflow: Aankoop → Allocatie → Tracering

```gherkin
Feature: End-to-end inventory workflow

  Scenario: Complete inventory cycle
    step 1: Create RawMaterial "LP652"
    step 2: POST StockReceipt
      - Supplier "De Coureur"
      - LotNumber "2203741590926"
      - QuantityReceived 0.1 kg
      - UnitCost €83.37/kg
      → InventoryLot created, quantityTotal = 0.1
    
    step 3: Verify StockMovement (receipt)
      - qty +0.1, type "receipt", reference StockReceipt
    
    step 4: POST StockAllocation for brew "2025/001"
      → Allocate 0.025 kg from lot 2203741590926
      → InventoryLot.quantityAllocated = 0.025
    
    step 5: Verify StockMovement (allocation)
      - qty -0.025, type "allocation", reference StockAllocation
    
    step 6: Query lot traceerbaarheid
      GET /api/admin/inventory/lots/uuid
      → Check allocation history: "Used in brew 2025/001, 0.025 kg, €2.08"
    
    step 7: Query brew traceerbaarheid
      GET /api/admin/inventory/allocations?brewNumber=2025/001
      → Check lines: material + lot + cost
    
    step 8: Verify AuditLog trail
      - CREATE RawMaterial
      - CREATE InventoryLot (RECEIVE)
      - CREATE StockAllocationLine (ALLOCATE)
      - All entries linked, immutable
```

#### 9.2.2 Compliance scenario: Afwijking vastleggen

```gherkin
Feature: Deviation handling

  Scenario: Record delivery deviation and quarantine
    Given StockReceipt with deviationFlag = true
    step 1: POST StockReceipt {
      deviationFlag: true,
      deviationAction: "QUARANTAINE",
      deviationNotes: "Color mismatch, suspected oxidation"
    }
    
    step 2: InventoryLot created with status = "active" (initially)
    
    step 3: Manual action: PUT /api/admin/inventory/lots/:id {
      status: "quarantined",
      isQuarantined: true
    }
    
    step 4: Verify AuditLog
      - action: "DEVIATION"
      - context: "..."
    
    step 5: Try to allocate from quarantined lot
      → Error: "Lot is quarantined, allocation blocked"
    
    step 6: Later, POST StockReceipt again with corrected batch
      → New InventoryLot created, status "active"
```

#### 9.2.3 Concurrent allocations (race condition)

```gherkin
Feature: Concurrent stock allocation

  Scenario: Two allocations, insufficient stock
    Given InventoryLot with quantityAvailable = 0.050 kg
    When admin1 allocates 0.040 kg (request 1)
      AND admin2 allocates 0.040 kg concurrently (request 2)
    Then one succeeds, one fails with "Insufficient stock"
    And final quantityAllocated = 0.040 (not 0.080)
    And both AuditLogs recorded with timestamps
```

### 9.3 Acceptance criteria (UI/UX)

#### 9.3.1 Inventory overzicht

```gherkin
Feature: Inventory dashboard

  Scenario: View all materials with stock levels
    Given 12 materials across 5 categories
    And 3 lots expired, 2 lots near-expiry
    
    When I visit /admin/brouwadministratie/voorraadbeheer-grondstoffen
    
    Then I see:
      - ⚠️ Red panel: "3 lots expired"
      - 🟡 Orange panel: "2 lots expire within 14 days"
      - Category filter buttons (GRANEN, HOP, GIST, etc.)
      - Table with: Name, Category, Unit, Total, Available, Actions
      - Material rows sorted by expiry date (nearest first)
      
    When I click category "GIST"
    Then table shows only 4 gist materials
    And expiry warning counts updated accordingly
```

#### 9.3.2 Inslag form

```gherkin
Feature: Stock receipt UI

  Scenario: Add new receipt with lot
    When I fill form:
      Supplier: [Brouwland ▼]
      Material: [LP652 ▼] (autocomplete)
      Quantity: [0.5]
      Unit: [kg] (read-only from material)
      Cost: [€46.64]
      Lot: [AJH52300276]
      Expiry: [28-02-2026]
      
    And click [Opslaan ✓]
    
    Then:
      - Form clears (success feedback)
      - New row appears in recent receipts list
      - Inventory totals updated in background
      - Audit log entry created

  Scenario: Deviation workflow
    When I check [Afwijking bij levering]
    Then fields appear:
      - Actie: [dropdown: geweigerd, retour, afgeprijsd, vernietigd, etc.]
      - Notitie: [textarea]
    
    And selecting "QUARANTAINE" shows additional prompt:
      "Dit lot wordt niet beschikbaar voor allocatie tot het vrijgegeven is."
```

#### 9.3.3 Uitslag formulier (multiline)

```gherkin
Feature: Stock allocation form

  Scenario: Multi-line allocation entry
    When I select brew "2025/001" and date "26-02-2025"
    
    Then table shows empty template row:
      │ [Material ▼] │ [Qty] │ [Lot ▼] │ [Cost] │ 🗑
    
    When I click cell [Material ▼]
    Then autocomplete dropdown with all available materials (alphabetical)
    
    When I select "LP652"
    Then:
      - Unit filled read-only: "kg"
      - [Lot ▼] shows loten van LP652 in FEFO order (expiry ASC)
      - Default lot = earliest expiry (but editable)
    
    When I enter quantityAllocated "0.013"
    Then:
      - Lot [Lot ▼] shows: "[2203741590926] (Available: 0.120 kg, Expires: 11/2025)"
      - Cost auto-calculated: 0.013 × 83.37 = €1.08
    
    When I click [+ Nieuwe regel]
    Then new empty row appended
    
    When I click [Opslaan ✓]
    Then:
      - All lines linked to brew
      - Total cost displayed: €13.75
      - Allocation saved, page navigates to confirmation
      - Audit logged
```

#### 9.3.4 Lot detail & traceerbaarheid

```gherkin
Feature: Lot detail page

  Scenario: View lot history and usage
    When I visit lot detail for "2203741590926"
    
    Then I see:
      - Lot number, material, supplier, fabricant
      - ⚠️ Expiry warning (if < 14 days or expired)
      - Receipt info (date, invoice, supplier, cost)
      - Allocation history:
        │ Brew 2025/001 │ 19-02-2025 │ 0.025 kg │ €2.08
        │ Brew 2024-009 │ 13-11-2024 │ 0.013 kg │ €1.08
        │ (and more...)
      - [Audit trail] link (shows all doc changes)
    
    When I click [Audit trail]
    Then page shows immutable log:
      - 08-05-2024 09:45 | Sibren | CREATE InventoryLot
      - 19-02-2025 10:20 | Sibren | ALLOCATE (0.025 kg to 2025/001)
      - (etc.)
```

### 9.4 Aannames / Open vragen

1. **Voorraadevering-formaten:** Zijn alle eenheden standaard kg, of ook g, L, stuks? → Configureerbaar per RawMaterial.unit
2. **Bereikbaarheid van receptuur:** Moet receptuur ook invoer van kostprijs toestaan, of enkel voorraadbeheer? → Enkel voorraadbeheer; receptuur gebruikt snapshot uit allocatie
3. **Batch-correcties:** Hoe worden fysieke aftellingsfouten opgemerkt? → Nieuwe feature "Recount" (toekomstig)
4. **Kwalitatieve opmerking:** Moet elke abwijking "Analyse" => aparte tabel vormen? → `deviationNotes` + optional link naar quality-check (toekomstig)
5. **Valuta-conversie:** Werken we altijd in EUR? → Ja, EUR-only
6. **Reserveringen:** Moet je kunnen reserveren vóór daadwerkelijke allocatie? → Optioneel; MVP zonder reserveringen

---

## 10. IMPLEMENTATIE-VOLGORDE

### Fase 1: Foundation (Week 1)
1. Prisma migrations (nieuw schema + RawMaterial/InventoryLot/Supplier/etc.)
2. API endpoints (CRUD voor RawMaterial, Supplier)
3. UI: `/voorraadbeheer-grondstoffen` root page (overzicht + filters)
4. Basis tests

### Fase 2: Inslag (Week 2-3)
5. StockReceipt CRUD API
6. UI: `/inslag` form + validation
7. AuditLog infrastructure
8. Integration tests (receipt workflow)

### Fase 3: Uitslag (Week 3-4)
9. StockAllocation API (multiline)
10. UI: `/uitslag` form + lot-dropdown dengan FEFO
11. Cost calculation + snapshot
12. Recipe link (view allocation from brew)

### Fase 4: Traceerbaarheid & Views (Week 4-5)
13. Lot detail page + audit trail
14. Grondstof detail page + history
15. Dashboard warnings (expired/near-expiry)
16. RecipeIngredient link naar RawMaterial (UI Receptuur aanpassing)

### Fase 5: Compliance & Edge Cases (Week 5-6)
17. Quarantine workflow
18. Deviation handling UI
19. Concurrent allocation tests
20. Permissies / rollen

### Fase 6: Polish (Week 6+)
21. Performance optimization (indexen, query optimization)
22. Export reports (overzicht per periode, per grondstof, per brouwsel)
23. Mobile-responsiveness

---

## 11. AANNAMES

1. **Enige valuta:** EUR; geen conversies nodig.
2. **Tijdzone:** Server werkt in UTC; UI-datums locale naar browser.
3. **Gebruikersauth:** Bestaand AdminUser system; identity via JWT/session.
4. **Voorraadpdf-export:** Toekomstige feature (niet MVP).
5. **Receptuur-link:** RecipeIngredient materialId optioneel; handmatige input blijft ondersteund.
6. **FEFO-suggestie:** Standaard eerste rij, user kan wijzigen; niet geforceerd.
7. **Verlopen-lot blokkering:** Via status constraint; gedeeltelijke release via status-update (quarantine → active).
8. **Audit immutability:** Via INSERT-only, geen DELETE oude logs.

---

## 12. REFERENTIES

- **Spreadsheet:** CSV met IN-kolommen (aankoop) en OUT-kolommen (verbruik)
- **Categorieën:** GRANEN, HOP, GIST, TOEVOEGINGEN, VERPAKKING
- **FAVV compliance:** Traceerbaarheid leverancier → ingredient → brouwsel
- **Recipe bestaand:** Ref. Recipe.brouwnummer (YYYY/NNN format)

---

**Einde Design Specification**
