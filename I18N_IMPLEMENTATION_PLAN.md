# Multi-Language Support Implementation Plan

## Current Status
✅ Installed `next-intl`
✅ Created translation files (`messages/en.json`, `messages/nl.json`)
✅ Created i18n configuration (`i18n.ts`)
✅ Updated `next.config.ts`
✅ Created `middleware.ts`

## Next Steps Required

### 1. Restructure App Directory
The app directory needs to be restructured to support locales:

**Current structure:**
```
app/
├── page.tsx
├── shop/page.tsx
├── cart/page.tsx
etc...
```

**New structure needed:**
```
app/
├── [locale]/
│   ├── page.tsx
│   ├── shop/page.tsx
│   ├── cart/page.tsx
│   etc...
```

### 2. Update Layout
Move `app/layout.tsx` to `app/[locale]/layout.tsx` and wrap with NextIntlClientProvider

### 3. Create Language Switcher Component
Add a component in the navbar to switch between NL/EN

### 4. Update All Pages
Each page needs to:
- Use `useTranslations()` hook for client components
- Use `getTranslations()` for server components
- Replace hardcoded strings with translation keys

## Implementation Options

### Option A: Full Migration (Recommended but time-consuming)
- Restructure entire app directory
- Update all pages and components
- Full i18n support

### Option B: Gradual Migration
- Keep current structure
- Add language switcher that stores preference in localStorage/cookie
- Gradually update pages one by one

### Option C: Simple Toggle
- Don't use routing-based locales
- Use a global state for language preference
- Simpler but less SEO-friendly

## Recommendation
Given the complexity, I recommend **Option B** for now:
1. Add a language switcher component
2. Store language preference
3. Update key pages (home, shop, cart) first
4. Gradually migrate other pages

This allows the site to remain functional while adding multi-language support incrementally.

Would you like me to proceed with Option B?
