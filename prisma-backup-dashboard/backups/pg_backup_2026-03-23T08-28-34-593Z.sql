--
-- PostgreSQL database dump
--

\restrict DHQE4wgdzM8b8kH2Kizu3ebzRyBCjbzYvWxGAbaeRX2yDMpipepgDPIor7JiCoc

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "aanvraagDatum" timestamp(3) without time zone
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
-- Name: RecipeSequence; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."RecipeSequence" (
    jaar integer NOT NULL,
    teller integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."RecipeSequence" OWNER TO prisma_migration;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    email text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    contact text,
    "favvNumber" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "kboNumber" text
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
-- Data for Name: BrouwSequence; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."BrouwSequence" (jaar, teller) FROM stdin;
\.


--
-- Data for Name: Brouwsel; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Brouwsel" (id, brouwnummer, "recipeId", datum, volume, "ogGemeten", "fgGemeten", "abvGemeten", "platoGemeten", "brouwefficientieGemeten", "createdAt", "updatedAt", "aanvraagDatum") FROM stdin;
bcc7a156-51fd-415a-b254-69828bf54ee5	2026/002	bb455271-d73a-48df-a50c-2e69b9c471af	2026-02-25 00:00:00	320	1.048	\N	\N	\N	\N	2026-03-04 13:18:06.846	2026-03-04 14:43:45.02	2026-02-18 00:00:00
\.


--
-- Data for Name: CcpEntry; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."CcpEntry" (id, type, datum, lotnummer, uitgevoerd, uitvoerder, "createdAt", "updatedAt") FROM stdin;
bb6ac447-faa9-4569-8ca8-929e4d7f604c	GLASBREUK	2026-02-18 00:00:00	2026/011	t	Sibren	2026-03-04 13:25:19.318	2026-03-04 13:25:19.318
2298801c-b352-46ca-ad49-5369cef78579	SCHIMMELVORMING	2026-02-25 00:00:00	2026/002	t	Sibren	2026-03-04 13:25:32.187	2026-03-04 13:25:32.187
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Event" (id, title, description, date, location, "isPaid", "ticketPrice", capacity, "ticketsSold", image, "createdAt", "updatedAt", "ticketSalesStartDate", "earlyBirdPrice", "earlyBirdEndDate", "isHidden") FROM stdin;
c0737556-ae43-47f9-8f5f-340943fd71e7	Man & Brouw X Kruimelplezier: Brood & Bier	Graan is de basis van zowel bier als brood, maar de variaties zijn eindeloos. Tijdens dit exclusieve event nodigen we je uit voor een gastronomische verkenningstocht waarbij Man & Brouw bieren de perfecte danspartners vormen voor verfijnde broodgerechten van Caroline van Kruimelplezier. \nWe kijken verder dan de bakkersmand. Tijdens deze avond serverenwe 5 zorgvuldig samengestelde pairings waarbij we de culinaire grenzen oversteken. \nHet menu: We serveren 5 proefglazen Man & Brouw, elk gecombineerd met een 'bread-based' gerecht uit de wereldkeuken. De line-up bevat variaties zoals: Tacos, Bao buns, ambachtelijk zuurdesem, ...\nElke combinatie is ontworpen om de smaakprofielen van het bier te versterken of juist op spannende wijze te contrasteren. Een must voor elke foodie en bierliefhebber. De exacte menu wordt vlak voor het event gecommuniceerd.	2026-04-04 16:30:00	Stelplaats, Leuven	t	95	25	8	https://res.cloudinary.com/de4xdsv7p/image/upload/v1772624150/manenbrouw/t8hodpn3fr8gswq9yj2i.jpg	2026-03-04 11:42:30.784	2026-03-22 19:19:55.616	\N	85	2026-03-15 22:59:00	t
3c595304-c355-4055-9841-519cafcec6b8	Leuven Craft Beer Fest	Dit jaar staan we op de eerste editie van Leuven Craft Beer Fest. Kom zeker langs om onze bieren te proeven!\nTickets zijn te koop via Hops 'n More	2026-06-19 13:00:00	Hal 5, Kessel-Lo	f	\N	\N	0	https://res.cloudinary.com/de4xdsv7p/image/upload/v1774209144/manenbrouw/uxea1nb976f0hkwfexlf.jpg	2026-03-22 19:53:10.706	2026-03-22 19:53:36.21	\N	\N	\N	t
42bfc23d-0b5a-46a1-820c-a07d50046149	Hapje Tapje 2026	Ook dit jaar slaan we weer de handen in elkaar met Alaboneur om onze epische bier- en foodpairing naar Hapje Tapje te brengen! Zin om om onze spannende pairing te ontdekken? Of gewoon een paar onweerstaanbare bieren proeven? We zien jullie op Hapje Tapje!	2026-08-03 09:30:00	Hogeschoolplein, Leuven	f	\N	\N	0	\N	2026-03-22 19:56:42.172	2026-03-22 19:56:42.172	\N	\N	\N	f
\.


--
-- Data for Name: EventTicket; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."EventTicket" (id, "eventId", "orderId", "buyerName", "buyerEmail", quantity, "totalPrice", "purchasedAt") FROM stdin;
4e94bf58-f054-4e71-9682-88332a19a443	c0737556-ae43-47f9-8f5f-340943fd71e7	0eef5d9b-d2e4-4a40-90d1-c28ab3905c6f	Jan Marien	j_marien@hotmail.com	2	170	2026-03-04 15:00:16.493
042edf96-1b71-43cf-94bb-4b111138bd79	c0737556-ae43-47f9-8f5f-340943fd71e7	04f06f4e-de93-44a7-9d72-c0fdda4f58fc	Tibo Bries	tibo.bries@telenet.be	1	85	2026-03-07 18:20:14.336
343993d9-2508-499e-bd87-109bb4df5316	c0737556-ae43-47f9-8f5f-340943fd71e7	d08eeddf-ca7c-4c29-87dd-eb0407089a54	Halfke	jeroenvanespen@hotmail.com	2	170	2026-03-08 10:55:34.316
74bf1ab8-fb0e-4727-acdb-df5f58da2993	c0737556-ae43-47f9-8f5f-340943fd71e7	723fa738-6d88-4d14-b8e7-18e825e1e85b	Vrolix Marjolijn	marjolijn.vrolix@skynet.be	2	170	2026-03-10 19:33:34.868
a4b28904-b783-4056-a3cf-e8caf1062755	c0737556-ae43-47f9-8f5f-340943fd71e7	313fc368-7537-4cb3-acc6-dba49c35418d	Seppe Segers	seppesegers94@gmail.com	1	85	2026-03-14 18:19:40.908
\.


--
-- Data for Name: FermentatieStap; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."FermentatieStap" (id, "recipeId", "stapNaam", "tempC", "duurDagen", volgorde) FROM stdin;
04a3d8d3-e45a-4619-9afc-3f452cd73992	a3af55e0-21a8-48f8-83f5-939783010d6f	hoofd	14	14	0
016f8b76-0c08-4889-80e9-e751e3a02b15	a3af55e0-21a8-48f8-83f5-939783010d6f	lager	0.5	14	1
d996da46-c8f9-4b21-ae74-3e9909c0ba14	bb455271-d73a-48df-a50c-2e69b9c471af	acidification	30	1	0
ea62f9a0-936b-422a-837c-b1f9dff66747	bb455271-d73a-48df-a50c-2e69b9c471af	hoofd	20	14	1
156cd592-a552-4982-9b03-f48f408f863b	bb455271-d73a-48df-a50c-2e69b9c471af	eind	23	2	2
83e0fa21-170c-4f8b-8a01-e61729fab7a6	bb455271-d73a-48df-a50c-2e69b9c471af	cold crash	2	10	3
\.


--
-- Data for Name: MaischStap; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."MaischStap" (id, "recipeId", "stapNaam", "tempC", "duurMin", volgorde) FROM stdin;
899ffdb8-2d86-44ff-a2de-a8842a5763fc	a3af55e0-21a8-48f8-83f5-939783010d6f	Protein Rest (52°C)	\N	\N	0
919e0e56-1eb7-483e-82bf-357008c187ee	a3af55e0-21a8-48f8-83f5-939783010d6f	Beta-Amylase Rest (63°C)	\N	45	1
f6c06d6f-4379-4284-a8e0-1e89acdbc280	a3af55e0-21a8-48f8-83f5-939783010d6f	Alpha-Amylase Rest (72°C)	\N	\N	2
ba2832db-dcb3-488a-b666-f3c9f5728d74	a3af55e0-21a8-48f8-83f5-939783010d6f	Mash Out (78°C)	\N	5	3
94a323e7-4985-4186-8caa-dc70d821bd44	bb455271-d73a-48df-a50c-2e69b9c471af	Protein Rest (52°C)	\N	\N	0
e57842d8-3e06-4b4e-96a8-2124847a7922	bb455271-d73a-48df-a50c-2e69b9c471af	Beta-Amylase Rest (63°C)	\N	30	1
7663af6a-3369-4cdd-ac45-ad6636942576	bb455271-d73a-48df-a50c-2e69b9c471af	Alpha-Amylase Rest (72°C)	\N	\N	2
8ab7e68a-7eb2-4a36-9b8b-0c394b6924bb	bb455271-d73a-48df-a50c-2e69b9c471af	Mash Out (78°C)	\N	5	3
\.


--
-- Data for Name: NewsletterSubscriber; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."NewsletterSubscriber" (id, email, "createdAt", "firstName", "lastName") FROM stdin;
2d1ed6d6-b1d0-414c-b1f3-9fea126764d6	j_marien@hotmail.com	2026-03-04 15:00:14.555	Jan	Marien
d0db8f9b-b673-4160-ab1d-608c014bece2	jeroenvanespen@hotmail.com	2026-03-08 10:55:34.469	Halfke	\N
e82abca0-b718-4398-a8f4-e3c0d320c57d	rubengeleyns@hotmail.fr	2026-03-10 07:09:14.203	Ruben	Geleyns
37cf58f8-1893-4ea0-98ac-36b98ae2f5cf	kate.schouppe@gmail.com	2026-03-14 10:55:00.125	Kate	Schouppe
0e2d7313-df9d-4df7-a50f-5a7eb3019fee	simon.vaneyndhoven@gmail.com	2026-03-14 22:08:18.753	Simon	VE
870ed35f-6c0b-4128-84a9-3974184685e2	daan.smetsx@gmail.com	2026-03-15 13:15:17.218	Daan	Smets
3da08aaf-3b71-4de8-9891-59a624e0581a	vanuytselwout@gmail.com	2026-03-16 09:08:51.581	Wout	Van Uytsel
fcafe628-b1ee-4807-8846-172cf5d53c22	belmansander@gmail.com	2026-03-17 20:07:18.633	Sander	Belmans
e1582b0b-0c10-492a-bc96-63d7775f986b	sophie.m.marien@gmail.com	2026-03-17 20:19:16.554	Sophie	Marien
\.


--
-- Data for Name: OngedierteInspectie; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."OngedierteInspectie" (id, datum, verantwoordelijke, brouwcontainer, kelder, omgeving, afvalcontainer, opmerkingen, actie, "createdAt", "updatedAt") FROM stdin;
f18c95ec-7f12-40fc-9d79-af4ff91b2bb6	2026-03-04 00:00:00	Sibren	t	t	t	t	Geen activiteit	\N	2026-03-04 13:25:00.529	2026-03-04 13:25:00.529
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Order" (id, "customerName", "customerEmail", "customerPhone", "shippingAddress", "shippingMethod", "totalAmount", status, "stripeSessionId", "paymentMethod", "createdAt", "updatedAt", "invoiceUrl", "orderNumber", locale, comment) FROM stdin;
0eef5d9b-d2e4-4a40-90d1-c28ab3905c6f	Jan Marien	j_marien@hotmail.com	+32495592513		pickup	170	paid	cs_live_a1XakdMhFANan7aJi6iklCvXHiPYi6By5DTXu7CgQSZei0lBf98eTT2NTu	bancontact	2026-03-04 15:00:16.493	2026-03-04 15:01:25.437	https://res.cloudinary.com/de4xdsv7p/image/upload/v1772636484/invoices/invoice-2026-0002.pdf	2026/0002	nl	
04f06f4e-de93-44a7-9d72-c0fdda4f58fc	Tibo Bries	tibo.bries@telenet.be	+32488279053		pickup	85	paid	cs_live_a1vUp1D46YEv9dqnRqNC6hE9PXDAa1V3Ln1sx6DormZsER6VU7CrvUoEyl	bancontact	2026-03-07 18:20:14.336	2026-03-07 18:20:52.639	https://res.cloudinary.com/de4xdsv7p/image/upload/v1772907651/invoices/invoice-2026-0004.pdf	2026/0004	nl	
d08eeddf-ca7c-4c29-87dd-eb0407089a54	Halfke	jeroenvanespen@hotmail.com	0492703931		pickup	170	paid	cs_live_a1QCpnaP8Dbt7vDghsLTodzPRVsIg9ufVY4axTpZEh9331NoriPglA8REI	card	2026-03-08 10:55:34.316	2026-03-08 10:56:18.153	https://res.cloudinary.com/de4xdsv7p/image/upload/v1772967377/invoices/invoice-2026-0005.pdf	2026/0005	nl	
96971617-f762-4755-85e5-66151e1dc410	Jolien Dupon	joliendupon@hotmail.com	0496481793		pickup	17.25	completed	cs_live_b1Qbl2A2YUWrfoVgPACGUeY4O1H0A4T7pxP8OQ0VxhoxhJ6OCBpMfRP4nU	payconiq	2026-03-06 10:33:42.651	2026-03-14 16:43:18.236	https://res.cloudinary.com/de4xdsv7p/image/upload/v1772793268/invoices/invoice-2026-0003.pdf	2026/0003	nl	
723fa738-6d88-4d14-b8e7-18e825e1e85b	Vrolix Marjolijn	marjolijn.vrolix@skynet.be	+32495834817		pickup	170	paid	cs_live_a1Xe02UkicRYs4yQJl4dPd8Zo3OPeK51I6zz0DxAZfmbgfJ9Sv4vt4mPCW	payconiq	2026-03-10 19:33:34.868	2026-03-10 19:34:20.369	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773171259/invoices/invoice-2026-0010.pdf	2026/0010	nl	
313fc368-7537-4cb3-acc6-dba49c35418d	Seppe Segers	seppesegers94@gmail.com	0471469826		pickup	106	paid	cs_live_b17urdkZKVaXrB8bz1Io0lqS2TOhS8pDUReZFfrTsW5HICDkIeX1eBTm2y	bancontact	2026-03-14 18:19:40.908	2026-03-14 18:20:18.185	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773512417/invoices/invoice-2026-0020.pdf	2026/0020	nl	
27f1da18-ecc2-4aed-950c-a2b886091b54	Claeyssens Lore	lore.claeyssens@gmail.com	0484853060		pickup	25	completed	cs_live_a1OFliJsj2enP1J7P0HvZi4HdOgAFbx0NRw7xFE99Vnv8zzJNKuNODEJgO	payconiq	2026-03-14 14:38:02.89	2026-03-14 16:42:34.417	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773499124/invoices/invoice-2026-0018.pdf	2026/0018	nl	Graag:\r\n\r\nLoeiende Lore \r\nSuper Suki\r\nLustige Leia\r\nPittige Patricia \r\nDuistere Dolly\r\nCoole Camille\r\n\r\nIndien hiervan een bier niet mogelijk is mag deze vervangen worden door passionele Pommelien en verder door Frisse Frieda
cf45d7fd-4db0-4682-87a9-bfb10ac74e93	Katrien Deroey	katrienderoey@gmail.com	0475326182		pickup	17.5	completed	cs_live_a1J5OKZDvQGWX7rCVzA3rL6lWIyqspKU1CNeHwowDNOlGsdWUq4HSYmEiL	payconiq	2026-03-14 10:16:18.89	2026-03-14 16:42:38.316	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773483405/invoices/invoice-2026-0017.pdf	2026/0017	nl	
671c137c-3524-4b79-aaab-a11b75bb0963	Stijn Goris	goris_stijn@hotmail.com	0499217847		pickup	3.5	completed	cs_live_a1aZ58ZttaRMYZ9MkbB3M4xpzfqejztvti1kdhmjIiSngbBQ4YaKCdQMC6	payconiq	2026-03-13 13:34:39.75	2026-03-14 16:42:59.755	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773408911/invoices/invoice-2026-0012.pdf	2026/0012	nl	
a6313a67-0593-41b9-afe8-4df0be6aee69	Nina Geuëns	geuens.ni@gmail.com	0472313524		pickup	25	completed	cs_live_a15t4Z63a75Y8NZLoj20q1HbH4Exz0DbOGaGmxgilfA3XHqKnBNyze9zd1	bancontact	2026-03-12 08:54:12.753	2026-03-14 16:43:05.845	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773305690/invoices/invoice-2026-0011.pdf	2026/0011	nl	
89441170-735d-4840-b530-42c549c991dd	Ruben Geleyns	rubengeleyns@hotmail.fr	0479504119		pickup	31.5	completed	cs_live_b1TZdYlmAI3iuwQc9GvvWrKsxaOofCBABrM9SYU6PrjPBaWavsoj45VejX	bancontact	2026-03-10 07:09:13.975	2026-03-14 16:43:10.477	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773126593/invoices/invoice-2026-0006.pdf	2026/0006	nl	
7959d5b0-dcdb-49ee-b480-38a2d383a141	Simon VE	simon.vaneyndhoven@gmail.com	0494100949		pickup	14	completed	cs_live_b1H2BC4qkuvo8BJ8P3WENp9VZHJbaiZO7rkCT6aX6GBP4U7QfNwRuTk2Xr	bancontact	2026-03-14 22:08:18.61	2026-03-15 13:05:23.076	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773526146/invoices/invoice-2026-0021.pdf	2026/0021	nl	
9c9ea8f7-5b15-4044-989a-e2534cd64ee7	Geert Lemmens	geert.lemmens@mail.be	0493240416		pickup	25	completed	cs_live_a12cKOxkvTHJjsLhjEuHJek75V6CGdiFwIVB2Ck86HSjIcYsRTRw7tuFUo	payconiq	2026-03-17 20:59:26.456	2026-03-18 18:19:49.214	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773781206/invoices/invoice-2026-0031.pdf	2026/0031	nl	
849a1eb4-d956-4049-b632-dee4afd9808b	Wout Van Uytsel	vanuytselwout@gmail.com	0496391392	{"street":"'t binnenhof 8","city":"Meerhout","zip":"2450","country":"Belgium"}	shipment	44.5	completed	cs_live_b1IVtXKzCGXYnCu6GuBKuq7R2aOsj8Hr3Hs4x9O1JQoiFOrnHvsxNEvXcx	bancontact	2026-03-16 09:08:51.429	2026-03-22 11:59:38.864	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773652166/invoices/invoice-2026-0023.pdf	2026/0023	nl	
0362b9c6-b208-478d-8a79-424afeccf1fc	Sander Belmans	belmansander@gmail.com	0493577394		pickup	25	completed	cs_live_a1NZydMZqJLqAlIwJxD5qJdWczgJiil0FQQBwX2wsLioTnYz1jISD4kI8n	card	2026-03-17 20:07:18.487	2026-03-18 18:19:56.349	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773778074/invoices/invoice-2026-0024.pdf	2026/0024	nl	Ik kom ook ineens graag mijn glas van de cantus ophalen!
cc3eb9ee-66a1-4afa-96ee-034e8f124f22	Daan Smets	daan.smetsx@gmail.com	0491309153		pickup	13.75	completed	cs_live_b1kGkWL9mSsf2wR0wp9C9CKieq93ykJfAd362OIKuV2YxMrLjVDTssToga	bancontact	2026-03-15 13:15:17.065	2026-03-17 21:09:19.769	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773580549/invoices/invoice-2026-0022.pdf	2026/0022	nl	Liefst ophalen na 18u elke werkdag, elk uur tijdens weekend
fdd11297-23cc-4d83-9cb5-12259480da1b	Maarten Verbelen	maartenverbelen@outlook.com	0474344891		pickup	25	completed	cs_live_a1b4xLHEBMyF9xp1JuN3DIRbVN2DPEGBOMbooHcJzgpXC71I75EjJau6zf	card	2026-03-19 07:50:12.616	2026-03-22 11:59:30.941	https://res.cloudinary.com/de4xdsv7p/image/upload/v1773906629/invoices/invoice-2026-0032.pdf	2026/0032	nl	
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, "btwCategory") FROM stdin;
0244f60b-8050-427c-ac0e-7b2f10119683	96971617-f762-4755-85e5-66151e1dc410	0db2b579-516a-4954-8280-4e27dcdc29e3	1	3.5	21
877a7c34-ac94-4148-abc2-89eb1422036a	96971617-f762-4755-85e5-66151e1dc410	28aadb96-3eed-4c90-bde0-99abd2d23b75	1	3.5	21
fdf2ceec-9e62-46d8-9a03-5001a6ec5fec	96971617-f762-4755-85e5-66151e1dc410	1e6045ec-aa3f-4e88-b7b2-e6974a3d937b	1	3.25	21
ec7be901-7239-4bab-b0ad-e396f6fb819b	96971617-f762-4755-85e5-66151e1dc410	d41055f2-6284-455e-a150-7602ce90d7c4	1	3.5	21
45c9a6c2-3663-427e-bb7a-f9836baa3bea	96971617-f762-4755-85e5-66151e1dc410	1a1f072b-6278-4fe9-8ee0-4cbe47533b97	1	3.5	21
727825dc-56d6-4b88-bb5b-f51e01297f1c	89441170-735d-4840-b530-42c549c991dd	6cfff6b0-7553-4691-84f9-bb3303b58220	1	25	21
2bf7e77d-3104-4cd6-a324-970ea582ab5a	89441170-735d-4840-b530-42c549c991dd	e738d9f2-c5bc-4761-b2b6-8fe9c773dc94	1	6.5	21
193b45dc-13c6-416c-8b8c-00e528ea51f5	a6313a67-0593-41b9-afe8-4df0be6aee69	6cfff6b0-7553-4691-84f9-bb3303b58220	1	25	21
5d260e7a-d39f-49ad-a02e-c7cbb51496bd	671c137c-3524-4b79-aaab-a11b75bb0963	502fb598-b20d-4734-9fc3-64b0d873971f	1	3.5	21
dc740323-d9f3-4608-a5a7-9ab138bb2795	cf45d7fd-4db0-4682-87a9-bfb10ac74e93	ad5a6606-fd6b-4bec-baab-7d81e84aa853	1	17.5	21
19f0e4d9-632a-4e7d-96cc-0d51cb97d3d1	27f1da18-ecc2-4aed-950c-a2b886091b54	6cfff6b0-7553-4691-84f9-bb3303b58220	1	25	21
a7985de2-9b45-43ed-98eb-e1afe3832ec4	313fc368-7537-4cb3-acc6-dba49c35418d	502fb598-b20d-4734-9fc3-64b0d873971f	6	3.5	21
06cd6257-62a4-474a-b8b6-591af74be049	7959d5b0-dcdb-49ee-b480-38a2d383a141	502fb598-b20d-4734-9fc3-64b0d873971f	1	3.5	21
ca878ca5-2de1-474a-9a3f-e1c5ce5a419c	7959d5b0-dcdb-49ee-b480-38a2d383a141	0db2b579-516a-4954-8280-4e27dcdc29e3	1	3.5	21
3968fb20-d2bd-4038-99da-2882733b9b56	7959d5b0-dcdb-49ee-b480-38a2d383a141	d41055f2-6284-455e-a150-7602ce90d7c4	1	3.5	21
80287a4e-c588-467f-a7bc-0bcf72673670	7959d5b0-dcdb-49ee-b480-38a2d383a141	1a1f072b-6278-4fe9-8ee0-4cbe47533b97	1	3.5	21
6be3dc55-f4c1-4e82-ab70-f50d93179774	cc3eb9ee-66a1-4afa-96ee-034e8f124f22	1a1f072b-6278-4fe9-8ee0-4cbe47533b97	1	3.5	21
ffde7dac-b98c-49d7-9635-a37a58575b08	cc3eb9ee-66a1-4afa-96ee-034e8f124f22	d41055f2-6284-455e-a150-7602ce90d7c4	1	3.5	21
ae11193e-8f13-4c1b-b3eb-76307d0ba1f3	cc3eb9ee-66a1-4afa-96ee-034e8f124f22	1e6045ec-aa3f-4e88-b7b2-e6974a3d937b	1	3.25	21
498f85ab-91a2-4245-9e64-f51ed36f30ee	cc3eb9ee-66a1-4afa-96ee-034e8f124f22	28aadb96-3eed-4c90-bde0-99abd2d23b75	1	3.5	21
4659ed8c-c63b-4404-bfeb-f498bbe991ce	849a1eb4-d956-4049-b632-dee4afd9808b	502fb598-b20d-4734-9fc3-64b0d873971f	2	3.5	21
1f7ed915-8fb1-4aa4-8fc8-107019888a8e	849a1eb4-d956-4049-b632-dee4afd9808b	28aadb96-3eed-4c90-bde0-99abd2d23b75	2	3.5	21
1b4fc679-2120-4fc2-a4b6-777f15c48dd4	849a1eb4-d956-4049-b632-dee4afd9808b	1e6045ec-aa3f-4e88-b7b2-e6974a3d937b	2	3.25	21
d5d76a2d-1ee3-4c98-a45a-b590f3babfdf	849a1eb4-d956-4049-b632-dee4afd9808b	d41055f2-6284-455e-a150-7602ce90d7c4	2	3.5	21
968351ce-3700-47c1-bfe8-8e54551e38ea	849a1eb4-d956-4049-b632-dee4afd9808b	1a1f072b-6278-4fe9-8ee0-4cbe47533b97	2	3.5	21
be750d0b-a6dc-437f-8e94-c0bf27862c96	0362b9c6-b208-478d-8a79-424afeccf1fc	6cfff6b0-7553-4691-84f9-bb3303b58220	1	25	21
b039020d-a2ba-4024-b50d-a4864952e2bb	9c9ea8f7-5b15-4044-989a-e2534cd64ee7	6cfff6b0-7553-4691-84f9-bb3303b58220	1	25	21
fd498fc3-b173-49ed-bdfc-59377a7f9658	fdd11297-23cc-4d83-9cb5-12259480da1b	6cfff6b0-7553-4691-84f9-bb3303b58220	1	25	21
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Product" (id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "createdAt", "updatedAt", "btwCategory", category, "isHidden") FROM stdin;
6cfff6b0-7553-4691-84f9-bb3303b58220	de-zotte-zesling	De Zotte Zesling			33cl	25	Het Ideale Biercadeau Klaar om te Schenken!\nOp zoek naar het perfecte geschenk voor de bierliefhebber?\nDe dozen worden gevuld met een heerlijke selectie uit ons huidige biergamma. Wil je specifieke bieren in de box? Laat je voorkeuren achter bij de opmerkingen tijdens het bestellen, en wij maken een gepersonaliseerde box voor je klaar!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772628082/manenbrouw/hmo8k602370ticexpmmc.jpg"]	t	19	2026-03-04 12:41:39.66	2026-03-19 07:50:30.063	21	GIFTBOX	f
1a1f072b-6278-4fe9-8ee0-4cbe47533b97	passionele-pommelien	Passionele Pommelien	Cider X Saison	6.0%	33cl	3.5	Man & Brouw en Most Cider sloegen de handen in elkaar om een unieke blend van Cider en Saison bier te maken. De door Most "op-smaak-geselecteerde" appels komen uit lokale boomgaarden in het Hageland. Deze werden gecombineerd met een Saison gebrouwen met lokaal geteelde en gemoute granen.\n\n60% saison / 40% cider	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627439/manenbrouw/so6z0ikbpxemiylrawle.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627465/manenbrouw/juzrqkuugpqrhuyo1ckv.png"]	t	15	2026-03-04 12:31:23.879	2026-03-16 09:09:27.091	21	BEER	f
e738d9f2-c5bc-4761-b2b6-8fe9c773dc94	man-&-brouw-glass	Man & Brouw glass			33cl	6.5	Het officiële Man & Brouw glas! We hebben dit glas speciaal geselecteerd en ontworpen om de ervaring van genieten van een Man & Brouw bier naar een volgend niveau te tillen!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627973/manenbrouw/tmxrgqgqbabajsjvwfxk.jpg"]	t	23	2026-03-04 12:39:57.125	2026-03-10 07:09:54.369	21	GLASS	f
0db2b579-516a-4954-8280-4e27dcdc29e3	duistere-dolly	Duistere Dolly	Black Session IPA	3.8%	33cl	3.5	Zwart als de nacht, fris als een lentedag. Duistere Dolly is een eigenzinnige Black Session IPA waarin geroosterde mout en fruitige hoppen elkaar ontmoeten. Met de aromatische kracht van Callista, Ariana en Tango geniet je van tonen van perzik, zwarte bes en passievrucht, verpakt in een lichte body met een droge finish.	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627919/manenbrouw/acny0b2ivolxejhx1o7e.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627932/manenbrouw/sbwv2mbadnlxnrdxskx5.png"]	t	70	2026-03-04 12:39:04.122	2026-03-14 22:09:07.729	21	BEER	f
502fb598-b20d-4734-9fc3-64b0d873971f	pittige-patricia	Pittige Patricia	Sour met Zwarte Peper	5.3%	33cl	3.5	Een verfrissend zure basis ontmoet de diepte van de jungle. De neus verraadt direct de aromatische zwarte peper, terwijl de Tasmaanse bergpeper zorgt voor een unieke kruidigheid. Fruitig in de aanzet, pittig in de finish!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1773345835/manenbrouw/b3oiabbstsz76fpcdaym.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1773345841/manenbrouw/vabru11nwjjj4ozy5zqx.jpg"]	t	62	2026-03-12 20:04:50.655	2026-03-16 09:09:26.613	21	BEER	f
ad5a6606-fd6b-4bec-baab-7d81e84aa853	de-vrolijke-vierling	De Vrolijke Vierling			33cl	17.5	Het Ideale Biercadeau Klaar om te Schenken!\nOp zoek naar het perfecte geschenk voor de bierliefhebber?\nDe dozen worden gevuld met een heerlijke selectie uit ons huidige biergamma. Wil je specifieke bieren in de box? Laat je voorkeuren achter bij de opmerkingen tijdens het bestellen, en wij maken een gepersonaliseerde box voor je klaar!	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772628024/manenbrouw/nemfrcqsvkos6w9gceiu.jpg"]	t	9	2026-03-04 12:41:02.3	2026-03-14 10:16:45.969	21	GIFTBOX	f
28aadb96-3eed-4c90-bde0-99abd2d23b75	frisse-frieda	Frisse Frieda	Fresh Hop Sour	4.7%	33cl	3.5	Met oogst van onze eigen hop hebben we dit jaar een fresh-hop sour gemaakt. De vers geoogste hop werd zonder te drogen toegevoegd aan het bier door middel van dryhopping.	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627830/manenbrouw/p8xxxq1rsedcycpvjrad.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627844/manenbrouw/a2ssuowefc2qmf0ineyv.png"]	t	20	2026-03-04 12:37:27.205	2026-03-16 09:09:26.733	21	BEER	f
d41055f2-6284-455e-a150-7602ce90d7c4	lustige-leia	Lustige Leia	Lemonade Sour	6.1%	33cl	3.5	Lustige Leia streelt je lippen met frisse citroen, fluistert pompelmoesmunt in je oor, en laat je achter met dorst naar meer. Zacht zurig en verleidelijk fris: Leia laat niemand onberoerd.\nDurf jij haar aan je lippen te brengen?	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627616/manenbrouw/xvpf2740lx8ko2ylpqtw.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627545/manenbrouw/py6mxrgkppm8dweaoawt.png"]	f	0	2026-03-04 12:33:39.56	2026-03-16 09:09:26.977	21	BEER	f
1e6045ec-aa3f-4e88-b7b2-e6974a3d937b	coole-camille	Coole Camille	Grisette met Kamille	3.7	33cl	3.25	Yo, yo, yo! Wat is de vibe?\nCoole Camille is in da house! Check m'n swagger. Ik ben geen basic pilsje, nee, ik ben een Grisette - vintage maar toch helemaal 2025. En ik kom niet alleen! Ik rock een killer dosis Kamillebloemen, for real. Die geven me die chill zachte flavour waar je u tegen zegt.\nMaar don't get it twisted, ik ben geen softie. Ik heb ook een dikke portie hop meegekregen. Die kickt hard en geeft me een frisse bite die je on fleek houdt. Ik ben de perfecte mix van laid-back en lit. #JeWeetZelluf #GrisetteGang\n\nKortom: fresh, floral en funky. Haal me in huis en proef de next level chill. #jeweetzelf #CooleCamille #GrisetteGang	["https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627737/manenbrouw/ekcwth52fhaxwtfzt7vc.jpg","https://res.cloudinary.com/de4xdsv7p/image/upload/v1772627752/manenbrouw/zijcolb8zakay0gopsvm.png"]	t	15	2026-03-04 12:36:07.678	2026-03-16 09:09:26.848	21	BEER	f
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."PushSubscription" (id, endpoint, keys, "adminId") FROM stdin;
\.


--
-- Data for Name: Recipe; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Recipe" (id, naam, stijl, notities, "batchVolume", "brouwEfficiency", attenuation, "ogCalc", "fgCalc", "abvCalc", "platoCalc", "ibuCalc", "ebcCalc", "createdAt", "updatedAt", "abvGevraagd", "fgGevraagd", "ogGevraagd", "platoGevraagd", "aantalBatches") FROM stdin;
a3af55e0-21a8-48f8-83f5-939783010d6f	Heisse Hetti	Hot Lager	\N	160	70	80	1.0481	1.0096	5.05	11.94	8.91	7.2	2026-03-04 13:19:14.825	2026-03-04 13:24:07.836	5	1.0095	1.0476	11.82	2
bb455271-d73a-48df-a50c-2e69b9c471af	Exquise Elise	Timut Sour	\N	160	70	95	1.0499	1.0025	6.22	12.36	0	7.2	2026-03-04 13:13:24.216	2026-03-04 14:10:54.123	6	1.0024	1.0481	11.94	2
\.


--
-- Data for Name: RecipeIngredient; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."RecipeIngredient" (id, "recipeId", stap, type, naam, hoeveelheid, eenheid, "extractPotential", "kleurEbc", alfazuur, "tijdMinuten", volgorde, "doseringGPerL", lot, "pelletOfBloem", tijdstip) FROM stdin;
95ed3336-acbf-4d1e-8e72-959b454e3f12	a3af55e0-21a8-48f8-83f5-939783010d6f	MAISCHEN	MOUT	Pilsnermout	60	kg	78	4	\N	\N	0	\N	\N	\N	\N
87d83c79-515e-4d09-bcb0-6391424c1a6a	a3af55e0-21a8-48f8-83f5-939783010d6f	MAISCHEN	MOUT	Tarwemout	10	kg	78	4	\N	\N	1	\N	\N	\N	\N
08a00c5f-bb87-4a10-9022-dddd1f59756e	a3af55e0-21a8-48f8-83f5-939783010d6f	KOKEN	HOP	Hallertau Blanc	200	g	\N	\N	7	30	2	\N	\N	Pellet	\N
62b09d48-ef7d-48cc-b281-b68551d94143	a3af55e0-21a8-48f8-83f5-939783010d6f	KOKEN	HOP	Calista	200	g	\N	\N	3.5	5	3	\N	\N	Pellet	\N
5927319c-6d2f-47af-9cc5-c2acdedc027c	a3af55e0-21a8-48f8-83f5-939783010d6f	FERMENTATIE	GIST	Einstein	500	g	\N	\N	\N	\N	4	\N	\N	\N	\N
46d921a7-148d-4e6e-898a-003b7591d06e	a3af55e0-21a8-48f8-83f5-939783010d6f	OVERIG	ANDERE	Hotsauce	500	g	\N	\N	\N	\N	5	\N	\N	\N	Whirlpool
65880d9f-471d-4b03-9eea-c9fd28b764bc	a3af55e0-21a8-48f8-83f5-939783010d6f	OVERIG	ANDERE	Calista	800	g	\N	\N	\N	\N	6	\N	\N	\N	Dry Hop
83aea5bd-34a1-43c6-9496-14326864ad5c	bb455271-d73a-48df-a50c-2e69b9c471af	MAISCHEN	MOUT	Pilsnermout	50	kg	78	4	\N	\N	0	\N	\N	Pellet	\N
21d8a506-4ea2-45b3-9f1d-b70bcff2d231	bb455271-d73a-48df-a50c-2e69b9c471af	MAISCHEN	MOUT	Tarwemout	15	kg	78	4	\N	\N	1	\N	\N	Pellet	\N
775b361a-831e-4eaa-a7b5-c2e2c84ef22d	bb455271-d73a-48df-a50c-2e69b9c471af	MAISCHEN	MOUT	Tarwe	5	kg	78	2	\N	\N	2	\N	\N	Pellet	\N
8f16fcfd-d28a-438b-86ba-0e8bf12d4497	bb455271-d73a-48df-a50c-2e69b9c471af	MAISCHEN	MOUT	Havervlokken	2.5	kg	78	4	\N	\N	3	\N	\N	Pellet	\N
7d93125e-18ec-406a-901c-919bd7eb482c	bb455271-d73a-48df-a50c-2e69b9c471af	FERMENTATIE	GIST	BE-134	125	g	\N	\N	\N	\N	4	\N	\N	Pellet	\N
58a01fff-34c8-48d1-bc11-1c2c83923e8d	bb455271-d73a-48df-a50c-2e69b9c471af	FERMENTATIE	GIST	LP-652	10	g	\N	\N	\N	\N	5	\N	\N	Pellet	\N
bb7b6a40-b276-41bb-9152-dce3ecc60e30	bb455271-d73a-48df-a50c-2e69b9c471af	OVERIG	ANDERE	Motueka	1000	g	\N	\N	\N	\N	6	\N	\N	Pellet	Dry Hop
eb5f9128-8c6f-4995-a8e2-3586bffb2731	bb455271-d73a-48df-a50c-2e69b9c471af	OVERIG	ANDERE	Timut	240	g	\N	\N	\N	\N	7	\N	\N	Pellet	Dry Hop
\.


--
-- Data for Name: RecipeSequence; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."RecipeSequence" (jaar, teller) FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Supplier" (id, name, address, phone, email, "createdAt", "updatedAt", contact, "favvNumber", "isActive", "kboNumber") FROM stdin;
215c5a53-1d91-4ef6-a05d-3d823cd0a645	LV Janssens - Dormaalhof	Caubergstraat 2 3150 Haacht	0497359423	dries@hoftendormaal.com	2026-03-04 14:59:15.644	2026-03-04 15:02:39.695	Dries Janssens	2.234.204.958	t	BE0560669797
a581bb5a-22f3-4aa0-99f9-57d01c4ecec0	Brouwland BV	Korpelsesteenweg 86 3581 Beverlo	011401408	profsales@brouwland.com	2026-03-04 14:59:15.715	2026-03-04 15:02:39.761		2.038.594.164	t	BE0412461618
f25928e7-1510-4721-b123-c35e345d0301	HVB-IMTC BV	Kasteelstraat 21 9870 Olsene	092302770	info@hvb-imtc.be	2026-03-04 14:59:15.773	2026-03-04 15:02:39.833		2.274.409.775	t	BE0693813779
4b443547-1d14-44c7-906a-c09f79f46bd6	Brouwerij De Coureur	Borstelstraat 20 bus 001 3010 Kessel-Lo	0485178695	brouwerijdecoureur@gmail.com	2026-03-04 14:59:15.836	2026-03-04 15:02:39.918	Bart Delvaux	2.281.451.282	t	BE0713410551
05b592ea-8b43-411f-9fc6-cb52567c967f	Solucious SA NV	Edingensesteenweg 196 1500 Halle	023338888	info@solucious.be	2026-03-04 14:59:15.9	2026-03-04 15:02:39.987		2.359.957.342	t	BE0448692207
768de884-9d85-4c92-b133-d9600d01ea6a	Pit & Pit	Putten 27 2320 Hoogstraten			2026-03-04 14:59:15.967	2026-03-04 15:02:40.059			t	BE0505805213
3f0617af-3b37-49ba-96ef-7195e8a2998b	Man & Brouw	Aarschotsesteenweg 179 3012 Wilsele			2026-03-04 14:59:16.026	2026-03-04 15:02:40.132	Sibren De Bast		t	
\.


--
-- Data for Name: WerkregisterEntry; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."WerkregisterEntry" (id, datum, handeling, "brouwaanvraagDatum", "brouwaanvraagNummer", brouwnummer, volume, fermentatievat, "createdAt", "updatedAt") FROM stdin;
b40f7dee-7af6-4d82-8e55-3bddef826d37	2026-02-25 00:00:00	BROUWEN	2026-02-18 00:00:00	2026/002	2026/002	320	Jay - 300l	2026-03-04 14:07:25.924	2026-03-04 14:07:25.924
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
-- Name: RecipeIngredient RecipeIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY (id);


--
-- Name: RecipeSequence RecipeSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."RecipeSequence"
    ADD CONSTRAINT "RecipeSequence_pkey" PRIMARY KEY (jaar);


--
-- Name: Recipe Recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Recipe"
    ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY (id);


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
-- Name: RecipeIngredient_recipeId_idx; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX "RecipeIngredient_recipeId_idx" ON public."RecipeIngredient" USING btree ("recipeId");


--
-- Name: Supplier_name_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Supplier_name_key" ON public."Supplier" USING btree (name);


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: prisma_migration
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict DHQE4wgdzM8b8kH2Kizu3ebzRyBCjbzYvWxGAbaeRX2yDMpipepgDPIor7JiCoc

