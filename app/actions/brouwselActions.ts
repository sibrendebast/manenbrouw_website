'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrouwselInput {
    brouwnummer?: string
    recipeId: string
    datum: string // Brew date
    aanvraagDatum?: string | null // Application date
    volume?: number | null
    ogGemeten?: number | null
    fgGemeten?: number | null
    abvGemeten?: number | null
    platoGemeten?: number | null
    brouwefficientieGemeten?: number | null
}

// ─── Brouwnummer generatie ────────────────────────────────────────────────────

async function genereerBrouwnummer(): Promise<string> {
    const jaar = new Date().getFullYear()

    const seq = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.$executeRaw`
      INSERT INTO "BrouwSequence" (jaar, teller)
      VALUES (${jaar}, 0)
      ON CONFLICT (jaar) DO NOTHING
    `
        const result = await tx.$queryRaw<{ teller: number }[]>`
      UPDATE "BrouwSequence"
      SET teller = teller + 1
      WHERE jaar = ${jaar}
      RETURNING teller
    `
        return result[0].teller
    })

    const numStr = String(seq).padStart(3, '0')
    return `${jaar}/${numStr}`
}

export async function getVolgendBrouwnummer(): Promise<string> {
    const jaar = new Date().getFullYear()
    const seq = await prisma.brouwSequence.findUnique({
        where: { jaar }
    })
    const nextNum = (seq?.teller || 0) + 1
    const numStr = String(nextNum).padStart(3, '0')
    return `${jaar}/${numStr}`
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getBrouwsels() {
    try {
        const brouwsels = await prisma.brouwsel.findMany({
            orderBy: { datum: 'desc' },
            include: {
                recipe: {
                    select: {
                        naam: true,
                        stijl: true,
                    }
                }
            }
        })
        return { success: true as const, data: brouwsels }
    } catch (error) {
        console.error('getBrouwsels error:', error)
        return { success: false as const, error: 'Kon brouwsels niet ophalen' }
    }
}

export async function getBrouwsel(id: string) {
    try {
        const brouwsel = await prisma.brouwsel.findUnique({
            where: { id },
            include: {
                recipe: true,
            }
        })
        if (!brouwsel) return { success: false as const, error: 'Brouwsel niet gevonden' }
        return { success: true as const, data: brouwsel }
    } catch (error) {
        console.error('getBrouwsel error:', error)
        return { success: false as const, error: 'Kon brouwsel niet ophalen' }
    }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createBrouwsel(input: BrouwselInput): Promise<{
    success: boolean; id?: string; error?: string
}> {
    try {
        const brouwnummer = input.brouwnummer || await genereerBrouwnummer()
        const brouwsel = await prisma.brouwsel.create({
            data: {
                brouwnummer,
                recipe: { connect: { id: input.recipeId } },
                datum: new Date(input.datum),
                aanvraagDatum: input.aanvraagDatum ? new Date(input.aanvraagDatum) : null,
                volume: input.volume ?? null,
                ogGemeten: input.ogGemeten ?? null,
                fgGemeten: input.fgGemeten ?? null,
                abvGemeten: input.abvGemeten ?? null,
                platoGemeten: input.platoGemeten ?? null,
                brouwefficientieGemeten: input.brouwefficientieGemeten ?? null,
            },
        })
        revalidatePath('/admin/brouwadministratie/brouwsels')
        revalidatePath('/admin/brouwadministratie/logboek') // In case it affects logboek
        return { success: true, id: brouwsel.id }
    } catch (error) {
        console.error('createBrouwsel error:', error)
        return { success: false, error: 'Kon brouwsel niet aanmaken' }
    }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBrouwsel(
    id: string,
    input: BrouwselInput
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.brouwsel.update({
            where: { id },
            data: {
                ...(input.brouwnummer ? { brouwnummer: input.brouwnummer } : {}),
                recipe: { connect: { id: input.recipeId } },
                datum: new Date(input.datum),
                aanvraagDatum: input.aanvraagDatum ? new Date(input.aanvraagDatum) : null,
                volume: input.volume ?? null,
                ogGemeten: input.ogGemeten ?? null,
                fgGemeten: input.fgGemeten ?? null,
                abvGemeten: input.abvGemeten ?? null,
                platoGemeten: input.platoGemeten ?? null,
                brouwefficientieGemeten: input.brouwefficientieGemeten ?? null,
            },
        })

        revalidatePath('/admin/brouwadministratie/brouwsels')
        return { success: true }
    } catch (error) {
        console.error('updateBrouwsel error:', error)
        return { success: false, error: 'Kon brouwsel niet opslaan' }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBrouwsel(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.brouwsel.delete({ where: { id } })
        revalidatePath('/admin/brouwadministratie/brouwsels')
        return { success: true }
    } catch (error) {
        console.error('deleteBrouwsel error:', error)
        return { success: false, error: 'Kon brouwsel niet verwijderen' }
    }
}
