# Database Setup Guide (Prisma Accelerate)

## Your Database Configuration

You're using **Prisma Accelerate** which provides:
- ✅ Connection pooling (handles many concurrent connections)
- ✅ Query caching (faster repeated queries)
- ✅ Perfect for serverless (Vercel)
- ✅ Global edge network

## Environment Variables

### For Local Development (.env or .env.local)

```env
# Prisma Accelerate URL (with connection pooling and caching)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19KLTNtTG11cEpTUENpLUNEa0wyaUkiLCJhcGlfa2V5IjoiMDFLQkc3TU1DWEFIVFA4NlhZUFBFUjE0QVQiLCJ0ZW5hbnRfaWQiOiJjOWE1MWZiOWM3ZTA1ZjUzOTU2MGViNjQ0MjI4YTVjNjUyOTZlNzM5NjUzOTdkNzk5ZTA2YTgzOTQ1ZTA0NWUzIiwiaW50ZXJuYWxfc2VjcmV0IjoiODcwZDU5ZjctYzRjMS00OTc3LWJkZGEtNDUzNTBkMzA4YmJlIn0.Grq2hmgkmI2SOrAoPH1KUHB9Dnt8Q66Ga1bykpS6NF0"

# Direct PostgreSQL URL (for migrations)
DIRECT_DATABASE_URL="postgres://c9a51fb9c7e05f539560eb644228a5c65296e73965397d799e06a83945e045e3:sk_J-3mLmupJSPCi-CDkL2iI@db.prisma.io:5432/postgres?sslmode=require"
```

### For Vercel Deployment

Add these to **Vercel → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19KLTNtTG11cEpTUENpLUNEa0wyaUkiLCJhcGlfa2V5IjoiMDFLQkc3TU1DWEFIVFA4NlhZUFBFUjE0QVQiLCJ0ZW5hbnRfaWQiOiJjOWE1MWZiOWM3ZTA1ZjUzOTU2MGViNjQ0MjI4YTVjNjUyOTZlNzM5NjUzOTdkNzk5ZTA2YTgzOTQ1ZTA0NWUzIiwiaW50ZXJuYWxfc2VjcmV0IjoiODcwZDU5ZjctYzRjMS00OTc3LWJkZGEtNDUzNTBkMzA4YmJlIn0.Grq2hmgkmI2SOrAoPH1KUHB9Dnt8Q66Ga1bykpS6NF0` |
| `DIRECT_DATABASE_URL` | `postgres://c9a51fb9c7e05f539560eb644228a5c65296e73965397d799e06a83945e045e3:sk_J-3mLmupJSPCi-CDkL2iI@db.prisma.io:5432/postgres?sslmode=require` |

**Important:** Select "All Environments" for both variables

## Setup Steps

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in your database
- Set up the schema
- Generate the Prisma client

### 3. (Optional) Seed Initial Data

If you want to add some test products/events:

```bash
npx prisma db seed
```

### 4. Verify Connection

```bash
npx prisma studio
```

This opens a GUI where you can:
- View your database tables
- Add/edit data
- Verify everything is working

## Understanding the URLs

### DATABASE_URL (Accelerate)
- **Used for:** All application queries
- **Benefits:** Connection pooling, caching, edge network
- **Format:** `prisma+postgres://...`

### DIRECT_DATABASE_URL (Direct)
- **Used for:** Migrations only
- **Benefits:** Direct access for schema changes
- **Format:** `postgres://...`

## Prisma Accelerate Benefits

1. **Connection Pooling**
   - Handles thousands of connections
   - Perfect for serverless (Vercel)
   - No "too many connections" errors

2. **Query Caching**
   - Repeated queries are cached
   - Faster response times
   - Reduced database load

3. **Global Edge Network**
   - Queries routed to nearest edge location
   - Lower latency worldwide
   - Better user experience

## Monitoring

View your database usage:
1. Go to [Prisma Data Platform](https://cloud.prisma.io)
2. Select your project
3. View metrics:
   - Query performance
   - Cache hit rate
   - Connection usage

## Troubleshooting

### "Can't reach database server"

**Cause:** Network issue or wrong URL

**Solution:**
1. Check your internet connection
2. Verify DATABASE_URL is correct
3. Check Prisma Data Platform status

### "Too many connections"

**Cause:** Not using Accelerate URL

**Solution:**
- Make sure you're using the `prisma+postgres://` URL (not the direct `postgres://` URL)

### Migrations Fail

**Cause:** Using Accelerate URL for migrations

**Solution:**
- Migrations need the DIRECT_DATABASE_URL
- Make sure `directUrl` is set in schema.prisma
- Run: `npx prisma migrate dev`

## Cost

Prisma Accelerate pricing:
- **Free tier:** 1M queries/month
- **Paid:** $29/month for 10M queries

For a small webshop, free tier is plenty!

## Next Steps

1. ✅ Update your `.env` file with both URLs
2. ✅ Run `npx prisma generate`
3. ✅ Run `npx prisma migrate dev --name init`
4. ✅ Test with `npx prisma studio`
5. ✅ Add both URLs to Vercel environment variables
6. ✅ Deploy!

---

**Your database is ready! 🎉**
