'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { WerkregisterHandeling } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WerkregisterInput {
    datum: string                    // ISO date string
    handeling: WerkregisterHandeling
    brouwaanvraagDatum?: string | null
    brouwaanvraagNummer?: string | null
    brouwnummer?: string | null
    volume?: number | null
    fermentatievat?: string | null
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getWerkregisterEntries(): Promise<{
    success: boolean; data?: unknown[]; error?: string
}> {
    try {
        const entries = await prisma.werkregisterEntry.findMany({
            orderBy: { datum: 'desc' },
        })
        return { success: true, data: entries }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createWerkregisterEntry(input: WerkregisterInput): Promise<{
    success: boolean; id?: string; error?: string
}> {
    try {
        const entry = await prisma.werkregisterEntry.create({
            data: {
                datum: new Date(input.datum),
                handeling: input.handeling,
                brouwaanvraagDatum: input.brouwaanvraagDatum ? new Date(input.brouwaanvraagDatum) : null,
                brouwaanvraagNummer: input.brouwaanvraagNummer || null,
                brouwnummer: input.brouwnummer || null,
                volume: input.volume ?? null,
                fermentatievat: input.fermentatievat || null,
            },
        })
        revalidatePath('/admin/brouwadministratie/logboek')
        return { success: true, id: entry.id }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteWerkregisterEntry(id: string): Promise<{
    success: boolean; error?: string
}> {
    try {
        await prisma.werkregisterEntry.delete({ where: { id } })
        revalidatePath('/admin/brouwadministratie/logboek')
        return { success: true }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}
