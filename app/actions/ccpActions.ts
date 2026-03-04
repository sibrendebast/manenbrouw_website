'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { CcpType } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CcpInput {
    type: CcpType
    datum: string                    // ISO date string
    lotnummer?: string | null
    uitgevoerd: boolean
    uitvoerder?: string | null
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCcpEntries(type: CcpType): Promise<{
    success: boolean; data?: unknown[]; error?: string
}> {
    try {
        const entries = await prisma.ccpEntry.findMany({
            where: { type },
            orderBy: { datum: 'desc' },
        })
        return { success: true, data: entries }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCcpEntry(input: CcpInput): Promise<{
    success: boolean; id?: string; error?: string
}> {
    try {
        const entry = await prisma.ccpEntry.create({
            data: {
                type: input.type,
                datum: new Date(input.datum),
                lotnummer: input.lotnummer || null,
                uitgevoerd: input.uitgevoerd,
                uitvoerder: input.uitvoerder || null,
            },
        })
        revalidatePath('/admin/brouwadministratie/logboek')
        return { success: true, id: entry.id }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCcpEntry(id: string): Promise<{
    success: boolean; error?: string
}> {
    try {
        await prisma.ccpEntry.delete({ where: { id } })
        revalidatePath('/admin/brouwadministratie/logboek')
        return { success: true }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}
