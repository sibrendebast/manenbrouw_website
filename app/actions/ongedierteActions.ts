'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OngedierteInput {
    datum: string                    // ISO date string
    verantwoordelijke: string
    brouwcontainer: boolean
    kelder: boolean
    omgeving: boolean
    afvalcontainer: boolean
    opmerkingen?: string | null
    actie?: string | null
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getOngedierteInspecties(): Promise<{
    success: boolean; data?: unknown[]; error?: string
}> {
    try {
        const entries = await prisma.ongedierteInspectie.findMany({
            orderBy: { datum: 'desc' },
        })
        return { success: true, data: entries }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createOngedierteInspectie(input: OngedierteInput): Promise<{
    success: boolean; id?: string; error?: string
}> {
    try {
        const entry = await prisma.ongedierteInspectie.create({
            data: {
                datum: new Date(input.datum),
                verantwoordelijke: input.verantwoordelijke,
                brouwcontainer: input.brouwcontainer,
                kelder: input.kelder,
                omgeving: input.omgeving,
                afvalcontainer: input.afvalcontainer,
                opmerkingen: input.opmerkingen || null,
                actie: input.actie || null,
            },
        })
        revalidatePath('/admin/brouwadministratie/logboek')
        return { success: true, id: entry.id }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOngedierteInspectie(id: string): Promise<{
    success: boolean; error?: string
}> {
    try {
        await prisma.ongedierteInspectie.delete({ where: { id } })
        revalidatePath('/admin/brouwadministratie/logboek')
        return { success: true }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}
