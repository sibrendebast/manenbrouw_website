'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { berekenAlles, berekenGevraagd } from '@/lib/brewing-calcs'
import type { BrewingStap, IngredientType, Prisma } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IngredientInput {
  id?: string
  stap: BrewingStap
  type: IngredientType
  naam: string
  hoeveelheid: number
  eenheid: string
  extractPotential?: number | null
  kleurEbc?: number | null
  alfazuur?: number | null
  tijdMinuten?: number | null
  pelletOfBloem?: string | null
  tijdstip?: string | null
  doseringGPerL?: number | null
  lot?: string | null
  volgorde?: number
}

export interface MaischStapInput {
  stapNaam: string
  tempC?: number | null
  duurMin?: number | null
}

export interface FermentatieStapInput {
  stapNaam: string
  tempC?: number | null
  duurDagen?: number | null
}

export interface RecipeInput {
  naam: string
  stijl?: string
  notities?: string
  // Basiskarakteristieken
  abvGevraagd?: number | null    // target ABV — basis voor gevraagde berekening
  batchVolume?: number | null    // liter per batch, na koken in fermentor
  aantalBatches?: number | null  // aantal batches; totaal = batchVolume × aantalBatches
  brouwEfficiency?: number | null
  attenuation?: number | null
  ingredients: IngredientInput[]
  maischStappen?: MaischStapInput[]
  fermentatieStappen?: FermentatieStapInput[]
}

// ─── Helper: bereken gecachede waarden ───────────────────────────────────────

function berekenCache(input: RecipeInput) {
  // Calculate total volume from batch volume and number of batches
  const totalVolume = (input.batchVolume && input.aantalBatches)
    ? input.batchVolume * input.aantalBatches
    : undefined;

  // Gevraagde waarden (vanuit target ABV + attenuation)
  const gevraagd = (input.abvGevraagd && input.attenuation)
    ? berekenGevraagd(
      input.abvGevraagd,
      input.attenuation,
      totalVolume,
      input.brouwEfficiency ?? undefined,
    )
    : { ogGevraagd: null, fgGevraagd: null, platoGevraagd: null, suikersNodig: null, granenNodig: null }

  if (!input.batchVolume || !input.brouwEfficiency || !input.attenuation) {
    return {
      abvGevraagd: input.abvGevraagd ?? null,
      ogGevraagd: gevraagd.ogGevraagd,
      fgGevraagd: gevraagd.fgGevraagd,
      platoGevraagd: gevraagd.platoGevraagd,
      ogCalc: null, fgCalc: null, abvCalc: null, platoCalc: null, ibuCalc: null, ebcCalc: null,
    }
  }

  const fermentables = input.ingredients
    .filter(i => i.type === 'MOUT')
    .map(i => ({
      hoeveelheid: i.hoeveelheid,
      extractPotential: i.extractPotential ?? 80,
      kleurEbc: i.kleurEbc ?? null,
    }))

  const hops = input.ingredients
    .filter(i => i.type === 'HOP' && (i.tijdMinuten ?? 0) > 0)
    .map(i => ({
      hoeveelheid: i.hoeveelheid,
      alfazuur: i.alfazuur ?? 0,
      tijdMinuten: i.tijdMinuten ?? 0,
    }))

  const totalVolume2 = input.batchVolume * (input.aantalBatches ?? 1);

  const res = berekenAlles({
    fermentables,
    hops,
    batchVolumeL: totalVolume2,
    brouwEfficiency: input.brouwEfficiency,
    attenuation: input.attenuation,
  })

  return {
    abvGevraagd: input.abvGevraagd ?? null,
    ogGevraagd: gevraagd.ogGevraagd,
    fgGevraagd: gevraagd.fgGevraagd,
    platoGevraagd: gevraagd.platoGevraagd,
    ogCalc: res.og,
    fgCalc: res.fg,
    abvCalc: res.abv,
    platoCalc: res.platoOG,
    ibuCalc: res.ibu,
    ebcCalc: res.ebc,
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        naam: true,
        stijl: true,
        abvGevraagd: true,
        ogGevraagd: true,
        fgGevraagd: true,
        platoGevraagd: true,
        ogCalc: true,
        fgCalc: true,
        abvCalc: true,
        platoCalc: true,
        ibuCalc: true,
        ebcCalc: true,
        brouwEfficiency: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return { success: true as const, data: recipes }
  } catch (error) {
    console.error('getRecipes error:', error)
    return { success: false as const, error: 'Kon recepten niet ophalen' }
  }
}

export async function getRecipe(id: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          orderBy: [{ stap: 'asc' }, { volgorde: 'asc' }],
        },
        maischStappen: {
          orderBy: { volgorde: 'asc' },
        },
        fermentatieStappen: {
          orderBy: { volgorde: 'asc' },
        },
      },
    })
    if (!recipe) return { success: false as const, error: 'Recept niet gevonden' }
    return { success: true as const, data: recipe }
  } catch (error) {
    console.error('getRecipe error:', error)
    return { success: false as const, error: 'Kon recept niet ophalen' }
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createRecipe(): Promise<{
  success: boolean; id?: string; error?: string
}> {
  try {
    const recipe = await prisma.recipe.create({
      data: {
        naam: `Nieuw recept`,
        brouwEfficiency: 70,
        attenuation: 80,
      },
    })
    revalidatePath('/admin/brouwadministratie/receptuur')
    return { success: true, id: recipe.id }
  } catch (error) {
    console.error('createRecipe error:', error)
    return { success: false, error: 'Kon recept niet aanmaken' }
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateRecipe(
  id: string,
  input: RecipeInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const cache = berekenCache(input)

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Verwijder alle afhankelijke rijen
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } })
      await tx.maischStap.deleteMany({ where: { recipeId: id } })
      await tx.fermentatieStap.deleteMany({ where: { recipeId: id } })

      // 2. Update recept + maak alle gerelateerde rijen opnieuw aan
      await tx.recipe.update({
        where: { id },
        data: {
          naam: input.naam,
          stijl: input.stijl ?? null,
          notities: input.notities ?? null,
          batchVolume: input.batchVolume ?? null,
          aantalBatches: input.aantalBatches ?? null,
          brouwEfficiency: input.brouwEfficiency ?? null,
          attenuation: input.attenuation ?? null,
          ...cache,
          ingredients: {
            create: input.ingredients.map((ing, idx) => ({
              stap: ing.stap,
              type: ing.type,
              naam: ing.naam,
              hoeveelheid: ing.hoeveelheid,
              eenheid: ing.eenheid,
              extractPotential: ing.extractPotential ?? null,
              kleurEbc: ing.kleurEbc ?? null,
              alfazuur: ing.alfazuur ?? null,
              tijdMinuten: ing.tijdMinuten ?? null,
              pelletOfBloem: ing.pelletOfBloem ?? null,
              tijdstip: ing.tijdstip ?? null,
              doseringGPerL: ing.doseringGPerL ?? null,
              lot: ing.lot ?? null,
              volgorde: ing.volgorde ?? idx,
            })),
          },
          maischStappen: {
            create: (input.maischStappen ?? []).map((s, idx) => ({
              stapNaam: s.stapNaam,
              tempC: s.tempC ?? null,
              duurMin: s.duurMin ?? null,
              volgorde: idx,
            })),
          },
          fermentatieStappen: {
            create: (input.fermentatieStappen ?? []).map((s, idx) => ({
              stapNaam: s.stapNaam,
              tempC: s.tempC ?? null,
              duurDagen: s.duurDagen ?? null,
              volgorde: idx,
            })),
          },
        },
      })
    })

    revalidatePath('/admin/brouwadministratie/receptuur')
    revalidatePath(`/admin/brouwadministratie/receptuur/${id}`)
    return { success: true }
  } catch (error) {
    console.error('updateRecipe error:', error)
    return { success: false, error: 'Kon recept niet opslaan' }
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteRecipe(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.recipe.delete({ where: { id } })
    revalidatePath('/admin/brouwadministratie/receptuur')
    return { success: true }
  } catch (error) {
    console.error('deleteRecipe error:', error)
    return { success: false, error: 'Kon recept niet verwijderen' }
  }
}
