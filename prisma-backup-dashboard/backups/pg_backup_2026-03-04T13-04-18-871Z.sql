--
-- PostgreSQL database dump
--

\restrict EhU0SaE2CMR36cMdvKZwfm8hEUgB8OqluNn8LdMIbJuI3e7fS7HCqEdqJGbYUFo

-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: prisma_migration
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO prisma_migration;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: prisma_migration
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: AuditActionType; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."AuditActionType" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RECEIVE',
    'ALLOCATE',
    'ADJUST'
);


ALTER TYPE public."AuditActionType" OWNER TO prisma_migration;

--
-- Name: BrewingStap; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."BrewingStap" AS ENUM (
    'MAISCHEN',
    'KOKEN',
    'FERMENTATIE',
    'DRY_HOP',
    'CONDITIONING',
    'OVERIG'
);


ALTER TYPE public."BrewingStap" OWNER TO prisma_migration;

--
-- Name: CcpType; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."CcpType" AS ENUM (
    'GLASBREUK',
    'SCHIMMELVORMING'
);


ALTER TYPE public."CcpType" OWNER TO prisma_migration;

--
-- Name: IngredientType; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."IngredientType" AS ENUM (
    'MOUT',
    'HOP',
    'GIST',
    'ANDERE'
);


ALTER TYPE public."IngredientType" OWNER TO prisma_migration;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."ProductType" AS ENUM (
    'BEER',
    'GIFTBOX',
    'GLASS',
    'MERCH'
);


ALTER TYPE public."ProductType" OWNER TO prisma_migration;

--
-- Name: RawMaterialCategory; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."RawMaterialCategory" AS ENUM (
    'GRANEN',
    'HOP',
    'GIST',
    'TOEVOEGINGEN',
    'VERPAKKING'
);


ALTER TYPE public."RawMaterialCategory" OWNER TO prisma_migration;

--
-- Name: StockDeviationAction; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."StockDeviationAction" AS ENUM (
    'GEEN_AFWIJKING',
    'ACCEPTEREN',
    'RETOUR',
    'VERNIETIGEN'
);


ALTER TYPE public."StockDeviationAction" OWNER TO prisma_migration;

--
-- Name: WerkregisterHandeling; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."WerkregisterHandeling" AS ENUM (
    'BROUWEN',
    'OVERHEVELEN',
    'BOTTELEN_KEGGEN',
    'VERNIETIGING'
);


ALTER TYPE public."WerkregisterHandeling" OWNER TO prisma_migration;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminUser; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."AdminUser" (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AdminUser" OWNER TO prisma_migration;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "documentType" text NOT NULL,
    "documentId" text NOT NULL,
    action public."AuditActionType" NOT NULL,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "oldValue" jsonb,
    "newValue" jsonb,
    context text,
    "stockReceiptId" text
);


ALTER TABLE public."AuditLog" OWNER TO prisma_migration;

--
-- Name: BrouwSequence; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."BrouwSequence" (
    jaar integer NOT NULL,
    teller integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."BrouwSequence" OWNER TO prisma_migration;

--
-- Name: Brouwsel; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Brouwsel" (
    id text NOT NULL,
    brouwnummer text NOT NULL,
    "recipeId" text NOT NULL,
    datum timestamp(3) without time zone NOT NULL,
    volume double precision,
    "ogGemeten" double precision,
    "fgGemeten" double precision,
    "abvGemeten" double precision,
    "platoGemeten" double precision,
    "brouwefficientieGemeten" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Brouwsel" OWNER TO prisma_migration;

--
-- Name: CcpEntry; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."CcpEntry" (
    id text NOT NULL,
    type public."CcpType" NOT NULL,
    datum timestamp(3) without time zone NOT NULL,
    lotnummer text,
    uitgevoerd boolean DEFAULT false NOT NULL,
    uitvoerder text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CcpEntry" OWNER TO prisma_migration;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    location text NOT NULL,
    "isPaid" boolean DEFAULT false NOT NULL,
    "ticketPrice" double precision,
    capacity integer,
    "ticketsSold" integer DEFAULT 0 NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ticketSalesStartDate" timestamp(3) without time zone,
    "earlyBirdPrice" double precision,
    "earlyBirdEndDate" timestamp(3) without time zone,
    "isHidden" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Event" OWNER TO prisma_migration;

--
-- Name: EventTicket; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."EventTicket" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "orderId" text,
    "buyerName" text NOT NULL,
    "buyerEmail" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "totalPrice" double precision NOT NULL,
    "purchasedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EventTicket" OWNER TO prisma_migration;

--
-- Name: FermentatieStap; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."FermentatieStap" (
    id text NOT NULL,
    "recipeId" text NOT NULL,
    "stapNaam" text NOT NULL,
    "tempC" double precision,
    "duurDagen" integer,
    volgorde integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."FermentatieStap" OWNER TO prisma_migration;

--
-- Name: InventoryLot; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."InventoryLot" (
    id text NOT NULL,
    "materialId" text NOT NULL,
    "lotNumber" text NOT NULL,
    manufacturer text,
    "supplierId" text,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "quantityTotal" numeric(10,3) NOT NULL,
    "quantityAllocated" numeric(10,3) DEFAULT 0 NOT NULL,
    "unitCost" numeric(10,4) NOT NULL,
    "isQuarantined" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InventoryLot" OWNER TO prisma_migration;

--
-- Name: MaischStap; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."MaischStap" (
    id text NOT NULL,
    "recipeId" text NOT NULL,
    "stapNaam" text NOT NULL,
    "tempC" double precision,
    "duurMin" integer,
    volgorde integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."MaischStap" OWNER TO prisma_migration;

--
-- Name: NewsletterSubscriber; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."NewsletterSubscriber" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "firstName" text,
    "lastName" text
);


ALTER TABLE public."NewsletterSubscriber" OWNER TO prisma_migration;

--
-- Name: OngedierteInspectie; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."OngedierteInspectie" (
    id text NOT NULL,
    datum timestamp(3) without time zone NOT NULL,
    verantwoordelijke text NOT NULL,
    brouwcontainer boolean DEFAULT false NOT NULL,
    kelder boolean DEFAULT false NOT NULL,
    omgeving boolean DEFAULT false NOT NULL,
    afvalcontainer boolean DEFAULT false NOT NULL,
    opmerkingen text,
    actie text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OngedierteInspectie" OWNER TO prisma_migration;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text NOT NULL,
    "shippingAddress" text NOT NULL,
    "shippingMethod" text NOT NULL,
    "totalAmount" double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "stripeSessionId" text,
    "paymentMethod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invoiceUrl" text,
    "orderNumber" text,
    locale text DEFAULT 'nl'::text NOT NULL,
    comment text
);


ALTER TABLE public."Order" OWNER TO prisma_migration;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "btwCategory" integer DEFAULT 21
);


ALTER TABLE public."OrderItem" OWNER TO prisma_migration;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    style text,
    abv text,
    volume text,
    price double precision NOT NULL,
    description text NOT NULL,
    images text NOT NULL,
    "inStock" boolean DEFAULT true NOT NULL,
    "stockCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "btwCategory" integer DEFAULT 21,
    category public."ProductType" DEFAULT 'BEER'::public."ProductType" NOT NULL,
    "isHidden" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO prisma_migration;

--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    endpoint text NOT NULL,
    keys jsonb NOT NULL,
    "adminId" text NOT NULL
);


ALTER TABLE public."PushSubscription" OWNER TO prisma_migration;

--
-- Name: RawMaterial; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."RawMaterial" (
    id text NOT NULL,
    name text NOT NULL,
    category public."RawMaterialCategory" NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RawMaterial" OWNER TO prisma_migration;

--
-- Name: Recipe; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Recipe" (
    id text NOT NULL,
    naam text NOT NULL,
    stijl text,
    notities text,
    "batchVolume" double precision,
    "brouwEfficiency" double precision,
    attenuation double precision,
    "ogCalc" double precision,
    "fgCalc" double precision,
    "abvCalc" double precision,
    "platoCalc" double precision,
    "ibuCalc" double precision,
    "ebcCalc" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "abvGevraagd" double precision,
    "fgGevraagd" double precision,
    "ogGevraagd" double precision,
    "platoGevraagd" double precision,
    "aantalBatches" double precision
);


ALTER TABLE public."Recipe" OWNER TO prisma_migration;

--
-- Name: RecipeIngredient; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."RecipeIngredient" (
    id text NOT NULL,
    "recipeId" text NOT NULL,
    stap public."BrewingStap" DEFAULT 'MAISCHEN'::public."BrewingStap" NOT NULL,
    type public."IngredientType" DEFAULT 'MOUT'::public."IngredientType" NOT NULL,
    naam text NOT NULL,
    hoeveelheid double precision NOT NULL,
    eenheid text NOT NULL,
    "extractPotential" double precision,
    "kleurEbc" double precision,
    alfazuur double precision,
    "tijdMinuten" integer,
    volgorde integer DEFAULT 0 NOT NULL,
    "doseringGPerL" double precision,
    lot text,
    "pelletOfBloem" text,
    tijdstip text
);


ALTER TABLE public."RecipeIngredient" OWNER TO prisma_migration;

--
-- Name: StockAllocation; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."StockAllocation" (
    id text NOT NULL,
    "brewNumber" text NOT NULL,
    "allocationDate" timestamp(3) without time zone NOT NULL,
    "totalCost" numeric(10,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StockAllocation" OWNER TO prisma_migration;

--
-- Name: StockAllocationLine; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."StockAllocationLine" (
    id text NOT NULL,
    "allocationId" text NOT NULL,
    "materialId" text NOT NULL,
    "lotId" text NOT NULL,
    "quantityAllocated" numeric(10,3) NOT NULL,
    "unitCostAtAllocation" numeric(10,4) NOT NULL,
    "lineCost" numeric(10,2) NOT NULL,
    notes text
);


ALTER TABLE public."StockAllocationLine" OWNER TO prisma_migration;

--
-- Name: StockMovement; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."StockMovement" (
    id text NOT NULL,
    "materialId" text NOT NULL,
    "lotId" text NOT NULL,
    "movementType" text NOT NULL,
    quantity numeric(10,3) NOT NULL,
    "referenceType" text,
    "referenceId" text,
    "movedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


ALTER TABLE public."StockMovement" OWNER TO prisma_migration;

--
-- Name: StockReceipt; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."StockReceipt" (
    id text NOT NULL,
    "receiptNumber" text,
    "invoiceNumber" text,
    "supplierId" text NOT NULL,
    "receivedDate" timestamp(3) without time zone NOT NULL,
    manufacturer text,
    "deviationFlag" boolean DEFAULT false NOT NULL,
    "deviationAction" public."StockDeviationAction" DEFAULT 'GEEN_AFWIJKING'::public."StockDeviationAction" NOT NULL,
    "deviationNotes" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StockReceipt" OWNER TO prisma_migration;

--
-- Name: StockReceiptLine; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."StockReceiptLine" (
    id text NOT NULL,
    "receiptId" text NOT NULL,
    "materialId" text NOT NULL,
    "quantityReceived" numeric(10,3) NOT NULL,
    "unitCost" numeric(10,4) NOT NULL,
    "lotId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StockReceiptLine" OWNER TO prisma_migration;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    address text,
    contact text,
    phone text,
    email text,
    "kboNumber" text,
    "favvNumber" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO prisma_migration;

--
-- Name: WerkregisterEntry; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."WerkregisterEntry" (
    id text NOT NULL,
    datum timestamp(3) without time zone NOT NULL,
    handeling public."WerkregisterHandeling" NOT NULL,
    "brouwaanvraagDatum" timestamp(3) without time zone,
    "brouwaanvraagNummer" text,
    brouwnummer text,
    volume double precision,
    fermentatievat text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WerkregisterEntry" OWNER TO prisma_migration;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO prisma_migration;

--
-- Data for Name: AdminUser; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."AdminUser" (id, username, password, "createdAt", "updatedAt") FROM stdin;
b70280d2-e195-4db0-984d-ea4f16ae9d9a	sdebast	$2b$10$noAEZqB32fbdPUXf0J7JZu9Nn9aslBSECRCRpfDcXWyCqQqOxBjb6	2026-03-04 11:31:43.202	2026-03-04 11:31:43.202
14db11df-f1c5-4cb1-a15e-3e07f9162e23	teelbode	$2b$10$zRvkWuPzSFqEk1DbUNF4NuosLOLSWY3mJHxJCu8jBOWpyOKgUtKGK	2026-03-04 11:32:42.27	2026-03-04 11:32:42.27
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."AuditLog" (id, "documentType", "documentId", action, "changedAt", "oldValue", "newValue", context, "stockReceiptId") FROM stdin;
\.


--
-- Data for Name: BrouwSequence; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."BrouwSequence" (jaar, teller) FROM stdin;
\.


--
-- Data for Name: Brouwsel; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Brouwsel" (id, brouwnummer, "recipeId", datum, volume, "ogGemeten", "fgGemeten", "abvGemeten", "platoGemeten", "brouwefficientieGemeten", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CcpEntry; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."CcpEntry" (id, type, datum, lotnummer, uitgevoerd, uitvoerder, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Event" (id, title, description, date, location, "isPaid", "ticketPrice", capacity, "ticketsSold", image, "createdAt", "updatedAt", "ticketSalesStartDate", "earlyBirdPrice", "earlyBirdEndDate", "isHidden") FROM stdin;
c0737556-ae43-47f9-8f5f-340943fd71e7	Man & Brouw X Kruimelplezier: Brood & Bier	Graan is de basis van zowel bier als brood, maar de variaties zijn eindeloos. Tijdens dit exclusieve event nodigen we je uit voor een gastronomische verkenningstocht waarbij Man & Brouw bieren de perfecte danspartners vormen voor verfijnde broodgerechten van Caroline van Kruimelplezier. \nWe kijken verder dan de bakkersmand. Tijdens deze avond serverenwe 5 zorgvuldig samengestelde pairings waarbij we de culinaire grenzen oversteken. \nHet menu: We serveren 5 proefglazen Man & Brouw, elk gecombineerd met een 'bread-based' gerecht uit de wereldkeuken. De line-up bevat variaties zoals: Tacos, Bao buns, ambachtelijk zuurdesem, ...\nElke combinatie is ontworpen om de smaakprofielen van het bier te versterken of juist op spannende wijze te contrasteren. Een must voor elke foodie en bierliefhebber. De exacte menu wordt vlak voor het event gecommuniceerd.	2026-04-04 16:30:00	Stelplaats, Leuven	t	95	25	0	https://res.cloudinary.com/de4xdsv7p/image/upload/v1772624150/manenbrouw/t8hodpn3fr8gswq9yj2i.jpg	2026-03-04 11:42:30.784	2026-03-04 11:42:30.784	\N	85	2026-03-08 22:59:00	f
\.


--
-- Data for Name: EventTicket; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."EventTicket" (id, "eventId", "orderId", "buyerName", "buyerEmail", quantity, "totalPrice", "purchasedAt") FROM stdin;
\.


--
-- Data for Name: FermentatieStap; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."FermentatieStap" (id, "recipeId", "stapNaam", "tempC", "duurDagen", volgorde) FROM stdin;
\.


--
-- Data for Name: InventoryLot; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."InventoryLot" (id, "materialId", "lotNumber", manufacturer, "supplierId", "expiryDate", "quantityTotal", "quantityAllocated", "unitCost", "isQuarantined", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MaischStap; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."MaischStap" (id, "recipeId", "stapNaam", "tempC", "duurMin", volgorde) FROM stdin;
\.


--
-- Data for Name: NewsletterSubscriber; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."NewsletterSubscriber" (id, email, "createdAt", "firstName", "lastName") FROM stdin;
\.


--
-- Data for Name: OngedierteInspectie; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."OngedierteInspectie" (id, datum, verantwoordelijke, brouwcontainer, kelder, omgeving, afvalcontainer, opmerkingen, actie, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Order" (id, "customerName", "customerEmail", "customerPhone", "shippingAddress", "shippingMethod", "totalAmount", status, "stripeSessionId", "paymentMethod", "createdAt", "updatedAt", "invoiceUrl", "orderNumber", locale, comment) FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, "btwCategory") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Product" (id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "createdAt", "updatedAt", "btwCategory", category, "isHidden") FROM stdin;
1a1f072b-6278-4fe9-8ee0-4cbe47533b97	passionele-pommelien	Passionele Pommelien	Cider X Saison	6.0%	33cl	3.5	Man & Brouw en Most Cider sloegen de handen in elkaar om een unieke blend van Cider en Saison bier te maken. De door Most "op-smaak-geselecteerde" appels komen uit lokale boomgaarden in het Hageland. Deze werden gecombineerd met een Saison gebrouwen met lokaal geteelde en gemoute granen.\n\n60% saison / 40% cider	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627439/manenbrouw/so6z0ikbpxemiylrawle.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627465/manenbrouw/juzrqkuugpqrhuyo1ckv.png"]	t	20	2026-03-04 12:31:23.879	2026-03-04 12:31:23.879	21	BEER	f
d41055f2-6284-455e-a150-7602ce90d7c4	lustige-leia	Lustige Leia	Lemonade Sour	6.1%	33cl	3.5	Lustige Leia streelt je lippen met frisse citroen, fluistert pompelmoesmunt in je oor, en laat je achter met dorst naar meer. Zacht zurig en verleidelijk fris: Leia laat niemand onberoerd.\nDurf jij haar aan je lippen te brengen?	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627616/manenbrouw/xvpf2740lx8ko2ylpqtw.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627545/manenbrouw/py6mxrgkppm8dweaoawt.png"]	t	6	2026-03-04 12:33:39.56	2026-03-04 12:33:47.672	21	BEER	f
1e6045ec-aa3f-4e88-b7b2-e6974a3d937b	coole-camille	Coole Camille	Grisette met Kamille	3.7	33cl	3.25	Yo, yo, yo! Wat is de vibe?\nCoole Camille is in da house! Check m'n swagger. Ik ben geen basic pilsje, nee, ik ben een Grisette - vintage maar toch helemaal 2025. En ik kom niet alleen! Ik rock een killer dosis Kamillebloemen, for real. Die geven me die chill zachte flavour waar je u tegen zegt.\nMaar don't get it twisted, ik ben geen softie. Ik heb ook een dikke portie hop meegekregen. Die kickt hard en geeft me een frisse bite die je on fleek houdt. Ik ben de perfecte mix van laid-back en lit. #JeWeetZelluf #GrisetteGang\n\nKortom: fresh, floral en funky. Haal me in huis en proef de next level chill. #jeweetzelf #CooleCamille #GrisetteGang	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627737/manenbrouw/ekcwth52fhaxwtfzt7vc.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627752/manenbrouw/zijcolb8zakay0gopsvm.png"]	t	24	2026-03-04 12:36:07.678	2026-03-04 12:36:07.678	21	BEER	f
28aadb96-3eed-4c90-bde0-99abd2d23b75	frisse-frieda	Frisse Frieda	Fresh Hop Sour	4.7%	33cl	3.5	Met oogst van onze eigen hop hebben we dit jaar een fresh-hop sour gemaakt. De vers geoogste hop werd zonder te drogen toegevoegd aan het bier door middel van dryhopping.	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627830/manenbrouw/p8xxxq1rsedcycpvjrad.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627844/manenbrouw/a2ssuowefc2qmf0ineyv.png"]	t	24	2026-03-04 12:37:27.205	2026-03-04 12:37:27.205	21	BEER	f
0db2b579-516a-4954-8280-4e27dcdc29e3	duistere-dolly	Duistere Dolly	Black Session IPA	3.8%	33cl	3.5	Zwart als de nacht, fris als een lentedag. Duistere Dolly is een eigenzinnige Black Session IPA waarin geroosterde mout en fruitige hoppen elkaar ontmoeten. Met de aromatische kracht van Callista, Ariana en Tango geniet je van tonen van perzik, zwarte bes en passievrucht, verpakt in een lichte body met een droge finish.	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627919/manenbrouw/acny0b2ivolxejhx1o7e.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627932/manenbrouw/sbwv2mbadnlxnrdxskx5.png"]	t	72	2026-03-04 12:39:04.122	2026-03-04 12:39:04.122	21	BEER	f
e738d9f2-c5bc-4761-b2b6-8fe9c773dc94	man-&-brouw-glass	Man & Brouw glass			33cl	6.5	Het officiële Man & Brouw glas! We hebben dit glas speciaal geselecteerd en ontworpen om de ervaring van genieten van een Man & Brouw bier naar een volgend niveau te tillen!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627973/manenbrouw/tmxrgqgqbabajsjvwfxk.jpg"]	t	24	2026-03-04 12:39:57.125	2026-03-04 12:39:57.125	21	GLASS	f
ad5a6606-fd6b-4bec-baab-7d81e84aa853	de-vrolijke-vierling	De Vrolijke Vierling			33cl	17.5	Het Ideale Biercadeau Klaar om te Schenken!\nOp zoek naar het perfecte geschenk voor de bierliefhebber?\nDe dozen worden gevuld met een heerlijke selectie uit ons huidige biergamma. Wil je specifieke bieren in de box? Laat je voorkeuren achter bij de opmerkingen tijdens het bestellen, en wij maken een gepersonaliseerde box voor je klaar!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772628024/manenbrouw/nemfrcqsvkos6w9gceiu.jpg"]	t	10	2026-03-04 12:41:02.3	2026-03-04 12:41:02.3	21	GIFTBOX	f
6cfff6b0-7553-4691-84f9-bb3303b58220	de-zotte-zesling	De Zotte Zesling			33cl	25	Het Ideale Biercadeau Klaar om te Schenken!\nOp zoek naar het perfecte geschenk voor de bierliefhebber?\nDe dozen worden gevuld met een heerlijke selectie uit ons huidige biergamma. Wil je specifieke bieren in de box? Laat je voorkeuren achter bij de opmerkingen tijdens het bestellen, en wij maken een gepersonaliseerde box voor je klaar!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772628082/manenbrouw/hmo8k602370ticexpmmc.jpg"]	t	10	2026-03-04 12:41:39.66	2026-03-04 12:41:39.66	21	GIFTBOX	f
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."PushSubscription" (id, endpoint, keys, "adminId") FROM stdin;
\.


--
-- Data for Name: RawMaterial; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."RawMaterial" (id, name, category, unit, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Recipe; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Recipe" (id, naam, stijl, notities, "batchVolume", "brouwEfficiency", attenuation, "ogCalc", "fgCalc", "abvCalc", "platoCalc", "ibuCalc", "ebcCalc", "createdAt", "updatedAt", "abvGevraagd", "fgGevraagd", "ogGevraagd", "platoGevraagd", "aantalBatches") FROM stdin;
\.


--
-- Data for Name: RecipeIngredient; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."RecipeIngredient" (id, "recipeId", stap, type, naam, hoeveelheid, eenheid, "extractPotential", "kleurEbc", alfazuur, "tijdMinuten", volgorde, "doseringGPerL", lot, "pelletOfBloem", tijdstip) FROM stdin;
\.


--
-- Data for Name: StockAllocation; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."StockAllocation" (id, "brewNumber", "allocationDate", "totalCost", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockAllocationLine; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."StockAllocationLine" (id, "allocationId", "materialId", "lotId", "quantityAllocated", "unitCostAtAllocation", "lineCost", notes) FROM stdin;
\.


--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."StockMovement" (id, "materialId", "lotId", "movementType", quantity, "referenceType", "referenceId", "movedAt", notes) FROM stdin;
\.


--
-- Data for Name: StockReceipt; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."StockReceipt" (id, "receiptNumber", "invoiceNumber", "supplierId", "receivedDate", manufacturer, "deviationFlag", "deviationAction", "deviationNotes", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockReceiptLine; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."StockReceiptLine" (id, "receiptId", "materialId", "quantityReceived", "unitCost", "lotId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Supplier" (id, name, address, contact, phone, email, "kboNumber", "favvNumber", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WerkregisterEntry; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."WerkregisterEntry" (id, datum, handeling, "brouwaanvraagDatum", "brouwaanvraagNummer", brouwnummer, volume, fermentatievat, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
71d6bba6-3efa-4a5e-b064-c7103b59004d	c446f4aa7983be4f67c1e45a40de3f7faadfc6a15398302d6be0d6fa7ec4a79a	2026-03-04 11:23:47.096135+00	20251202192651_init	\N	\N	2026-03-04 11:23:46.954221+00	1
958552c1-2091-4ecf-a391-ada994da59c0	0f182e4afc64a49718da99d7bc086fd97235de4d44430cd2741b7e603704c420	2026-03-04 11:23:47.254196+00	20251203195957_add_btw_category	\N	\N	2026-03-04 11:23:47.141887+00	1
bf26aa7f-3d94-436d-91cd-202d25246045	9355d9f6849ba3f48e98adfa519b8c40d6c1812196e8820c4ff393836dfe4122	2026-03-04 11:23:47.409205+00	20251203200322_add_btw_to_order_item	\N	\N	2026-03-04 11:23:47.299834+00	1
3f758bc6-f848-48e1-bcc4-cf4d0c638a4f	26b630ffb2a3caff25e31ee962c00f2e47502946d9750396d364a94a96217899	2026-03-04 11:23:47.56358+00	20251212081943_add_invoice_url	\N	\N	2026-03-04 11:23:47.453839+00	1
89aa4f2c-493c-406e-a4ed-889c02aa5757	2a23efa93a66664cd5f894561c7b643e1552be93d16d9f862d4c3d370d009eab	2026-03-04 11:23:47.71905+00	20251212085759_add_order_number	\N	\N	2026-03-04 11:23:47.607252+00	1
d79af2c8-48e4-43fd-b0dd-bdb7890edb63	3a45ad98c551f979f14cdef934ab0053c0996662efe0216e38ca37c545647cdb	2026-03-04 11:23:47.873004+00	20251214132447_add_subscriber_names	\N	\N	2026-03-04 11:23:47.763245+00	1
1c883aad-5dc3-437b-85cb-62bc40ef4f91	6cce3eb0b581288e64cccf46039af77f7e09b8714903be722f64bb1b81678d8b	2026-03-04 11:23:48.025149+00	20251223101803_add_locale_to_order	\N	\N	2026-03-04 11:23:47.917058+00	1
b33409e8-0648-4552-afec-0466eeb847d8	ae379c87856a910d72837583858c5b454066487e08a0cb3e511a141fc4f883d6	2026-03-04 11:23:48.179564+00	20260213120235_add_ticket_availability_fields	\N	\N	2026-03-04 11:23:48.069537+00	1
6b338ecb-d2aa-45ef-9d80-422ae79ab5cc	097b2400ea94965791dbe87988e48790292eed8a1aba0ef5ece3581e2a02beb7	2026-03-04 11:23:51.561098+00	20260304112351_add_complete_inventory_system	\N	\N	2026-03-04 11:23:51.290813+00	1
\.


--
-- Name: AdminUser AdminUser_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."AdminUser"
    ADD CONSTRAINT "AdminUser_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BrouwSequence BrouwSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."BrouwSequence"
    ADD CONSTRAINT "BrouwSequence_pkey" PRIMARY KEY (jaar);


--
-- Name: Brouwsel Brouwsel_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Brouwsel"
    ADD CONSTRAINT "Brouwsel_pkey" PRIMARY KEY (id);


--
-- Name: CcpEntry CcpEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."CcpEntry"
    ADD CONSTRAINT "CcpEntry_pkey" PRIMARY KEY (id);


--
-- Name: EventTicket EventTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."EventTicket"
    ADD CONSTRAINT "EventTicket_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: FermentatieStap FermentatieStap_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."FermentatieStap"
    ADD CONSTRAINT "FermentatieStap_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLot InventoryLot_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."InventoryLot"
    ADD CONSTRAINT "InventoryLot_pkey" PRIMARY KEY (id);


--
-- Name: MaischStap MaischStap_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."MaischStap"
    ADD CONSTRAINT "MaischStap_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscriber NewsletterSubscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."NewsletterSubscriber"
    ADD CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY (id);


--
-- Name: OngedierteInspectie OngedierteInspectie_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."OngedierteInspectie"
    ADD CONSTRAINT "OngedierteInspectie_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: RawMaterial RawMaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."RawMaterial"
    ADD CONSTRAINT "RawMaterial_pkey" PRIMARY KEY (id);


--
-- Name: RecipeIngredient RecipeIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY (id);


--
-- Name: Recipe Recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Recipe"
    ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY (id);


--
-- Name: StockAllocationLine StockAllocationLine_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockAllocationLine"
    ADD CONSTRAINT "StockAllocationLine_pkey" PRIMARY KEY (id);


--
-- Name: StockAllocation StockAllocation_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockAllocation"
    ADD CONSTRAINT "StockAllocation_pkey" PRIMARY KEY (id);


--
-- Name: StockMovement StockMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_pkey" PRIMARY KEY (id);


--
-- Name: StockReceiptLine StockReceiptLine_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockReceiptLine"
    ADD CONSTRAINT "StockReceiptLine_pkey" PRIMARY KEY (id);


--
-- Name: StockReceipt StockReceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: WerkregisterEntry WerkregisterEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."WerkregisterEntry"
    ADD CONSTRAINT "WerkregisterEntry_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AdminUser_username_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "AdminUser_username_key" ON public."AdminUser" USING btree (username);


--
-- Name: AuditLog_changedAt_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "AuditLog_changedAt_idx" ON public."AuditLog" USING btree ("changedAt");


--
-- Name: AuditLog_documentType_documentId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "AuditLog_documentType_documentId_idx" ON public."AuditLog" USING btree ("documentType", "documentId");


--
-- Name: Brouwsel_brouwnummer_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "Brouwsel_brouwnummer_idx" ON public."Brouwsel" USING btree (brouwnummer);


--
-- Name: Brouwsel_brouwnummer_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Brouwsel_brouwnummer_key" ON public."Brouwsel" USING btree (brouwnummer);


--
-- Name: FermentatieStap_recipeId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "FermentatieStap_recipeId_idx" ON public."FermentatieStap" USING btree ("recipeId");


--
-- Name: InventoryLot_expiryDate_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "InventoryLot_expiryDate_idx" ON public."InventoryLot" USING btree ("expiryDate");


--
-- Name: InventoryLot_materialId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "InventoryLot_materialId_idx" ON public."InventoryLot" USING btree ("materialId");


--
-- Name: InventoryLot_materialId_lotNumber_supplierId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "InventoryLot_materialId_lotNumber_supplierId_key" ON public."InventoryLot" USING btree ("materialId", "lotNumber", "supplierId");


--
-- Name: InventoryLot_status_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "InventoryLot_status_idx" ON public."InventoryLot" USING btree (status);


--
-- Name: MaischStap_recipeId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "MaischStap_recipeId_idx" ON public."MaischStap" USING btree ("recipeId");


--
-- Name: NewsletterSubscriber_email_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON public."NewsletterSubscriber" USING btree (email);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: RawMaterial_category_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "RawMaterial_category_idx" ON public."RawMaterial" USING btree (category);


--
-- Name: RawMaterial_isActive_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "RawMaterial_isActive_idx" ON public."RawMaterial" USING btree ("isActive");


--
-- Name: RawMaterial_name_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "RawMaterial_name_key" ON public."RawMaterial" USING btree (name);


--
-- Name: RecipeIngredient_recipeId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "RecipeIngredient_recipeId_idx" ON public."RecipeIngredient" USING btree ("recipeId");


--
-- Name: StockAllocationLine_allocationId_materialId_lotId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "StockAllocationLine_allocationId_materialId_lotId_key" ON public."StockAllocationLine" USING btree ("allocationId", "materialId", "lotId");


--
-- Name: StockAllocationLine_lotId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockAllocationLine_lotId_idx" ON public."StockAllocationLine" USING btree ("lotId");


--
-- Name: StockAllocationLine_materialId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockAllocationLine_materialId_idx" ON public."StockAllocationLine" USING btree ("materialId");


--
-- Name: StockAllocation_allocationDate_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockAllocation_allocationDate_idx" ON public."StockAllocation" USING btree ("allocationDate");


--
-- Name: StockAllocation_brewNumber_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "StockAllocation_brewNumber_key" ON public."StockAllocation" USING btree ("brewNumber");


--
-- Name: StockMovement_lotId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockMovement_lotId_idx" ON public."StockMovement" USING btree ("lotId");


--
-- Name: StockMovement_materialId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockMovement_materialId_idx" ON public."StockMovement" USING btree ("materialId");


--
-- Name: StockMovement_movedAt_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockMovement_movedAt_idx" ON public."StockMovement" USING btree ("movedAt");


--
-- Name: StockMovement_movementType_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockMovement_movementType_idx" ON public."StockMovement" USING btree ("movementType");


--
-- Name: StockReceiptLine_materialId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockReceiptLine_materialId_idx" ON public."StockReceiptLine" USING btree ("materialId");


--
-- Name: StockReceiptLine_receiptId_materialId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "StockReceiptLine_receiptId_materialId_key" ON public."StockReceiptLine" USING btree ("receiptId", "materialId");


--
-- Name: StockReceipt_receivedDate_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockReceipt_receivedDate_idx" ON public."StockReceipt" USING btree ("receivedDate");


--
-- Name: StockReceipt_supplierId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "StockReceipt_supplierId_idx" ON public."StockReceipt" USING btree ("supplierId");


--
-- Name: Supplier_name_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Supplier_name_key" ON public."Supplier" USING btree (name);


--
-- Name: AuditLog AuditLog_stockReceiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_stockReceiptId_fkey" FOREIGN KEY ("stockReceiptId") REFERENCES public."StockReceipt"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Brouwsel Brouwsel_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Brouwsel"
    ADD CONSTRAINT "Brouwsel_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EventTicket EventTicket_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."EventTicket"
    ADD CONSTRAINT "EventTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventTicket EventTicket_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."EventTicket"
    ADD CONSTRAINT "EventTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FermentatieStap FermentatieStap_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."FermentatieStap"
    ADD CONSTRAINT "FermentatieStap_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryLot InventoryLot_materialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."InventoryLot"
    ADD CONSTRAINT "InventoryLot_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."RawMaterial"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryLot InventoryLot_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."InventoryLot"
    ADD CONSTRAINT "InventoryLot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaischStap MaischStap_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."MaischStap"
    ADD CONSTRAINT "MaischStap_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PushSubscription PushSubscription_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."AdminUser"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RecipeIngredient RecipeIngredient_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockAllocationLine StockAllocationLine_allocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockAllocationLine"
    ADD CONSTRAINT "StockAllocationLine_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES public."StockAllocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockAllocationLine StockAllocationLine_lotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockAllocationLine"
    ADD CONSTRAINT "StockAllocationLine_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES public."InventoryLot"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockAllocationLine StockAllocationLine_materialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockAllocationLine"
    ADD CONSTRAINT "StockAllocationLine_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."RawMaterial"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockMovement StockMovement_lotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES public."InventoryLot"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockMovement StockMovement_materialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."RawMaterial"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceiptLine StockReceiptLine_lotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockReceiptLine"
    ADD CONSTRAINT "StockReceiptLine_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES public."InventoryLot"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockReceiptLine StockReceiptLine_materialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockReceiptLine"
    ADD CONSTRAINT "StockReceiptLine_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."RawMaterial"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceiptLine StockReceiptLine_receiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockReceiptLine"
    ADD CONSTRAINT "StockReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES public."StockReceipt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockReceipt StockReceipt_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: prisma_migration
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict EhU0SaE2CMR36cMdvKZwfm8hEUgB8OqluNn8LdMIbJuI3e7fS7HCqEdqJGbYUFo

