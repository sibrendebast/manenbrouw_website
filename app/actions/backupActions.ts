'use server'

import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'

// ── helpers ──────────────────────────────────────────────────────────────────

function sha256(text: string): string {
    return createHash('sha256').update(text).digest('hex')
}

// ── read operations ───────────────────────────────────────────────────────────

/** Returns all backup records (without the heavy `data` field). */
export async function getBackups() {
    try {
        const backups = await prisma.$queryRaw<
            {
                id: string
                status: string
                size: number | null
                duration: number | null
                checksum: string | null
                triggeredBy: string | null
                notes: string | null
                createdAt: Date
            }[]
        >`
            SELECT id, status, size, duration, checksum, "triggeredBy", notes, "createdAt"
            FROM "Backup"
            ORDER BY "createdAt" DESC
        `
        return backups
    } catch (error) {
        console.error('getBackups error:', error)
        return []
    }
}

/** Returns the current (or freshly-seeded) backup configuration. */
export async function getBackupConfig() {
    try {
        const configs = await (prisma as any).backupConfig.findMany({ take: 1 })
        if (configs.length > 0) return configs[0]

        // Seed a default config row on first access
        return await (prisma as any).backupConfig.create({
            data: { schedule: 'manual', retentionDays: 30, maxBackups: 10 },
        })
    } catch (error) {
        console.error('getBackupConfig error:', error)
        return { id: '', schedule: 'manual', retentionDays: 30, maxBackups: 10 }
    }
}

// ── write operations ──────────────────────────────────────────────────────────

/** Exports every user-data table and stores the snapshot in the Backup table. */
export async function createBackup(triggeredBy?: string): Promise<{ success: boolean; error?: string; id?: string }> {
    const startMs = Date.now()
    try {
        const [products, orders, orderItems, newsletterSubscribers, events, eventTickets] = await Promise.all([
            (prisma as any).product.findMany(),
            (prisma as any).order.findMany(),
            (prisma as any).orderItem.findMany(),
            (prisma as any).newsletterSubscriber.findMany(),
            (prisma as any).event.findMany(),
            (prisma as any).eventTicket.findMany(),
        ])

        const payload = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            tables: { products, orders, orderItems, newsletterSubscribers, events, eventTickets },
        }

        const data = JSON.stringify(payload)
        const checksum = sha256(data)
        const size = Buffer.byteLength(data, 'utf8')
        const duration = Date.now() - startMs

        const backup = await (prisma as any).backup.create({
            data: { status: 'completed', size, duration, checksum, data, triggeredBy: triggeredBy ?? null },
        })

        // Enforce retention: delete oldest backups beyond maxBackups
        await enforceRetention()

        revalidatePath('/admin/backup')
        return { success: true, id: backup.id }
    } catch (error: any) {
        console.error('createBackup error:', error)
        // Record a failed entry so the admin can see it
        try {
            await (prisma as any).backup.create({
                data: {
                    status: 'failed',
                    data: '{}',
                    duration: Date.now() - startMs,
                    triggeredBy: triggeredBy ?? null,
                    notes: String(error?.message ?? error),
                },
            })
        } catch { /* swallow inner failure */ }
        revalidatePath('/admin/backup')
        return { success: false, error: String(error?.message ?? error) }
    }
}

/** Restores user-data tables from a specific backup snapshot.
 *  Does NOT restore AdminUser, PushSubscription, Backup, or BackupConfig rows.
 */
export async function restoreBackup(
    id: string,
    confirmation: string,
    restoredBy?: string,
): Promise<{ success: boolean; error?: string }> {
    if (confirmation !== 'RESTORE') {
        return { success: false, error: 'Confirmation text must be exactly "RESTORE".' }
    }

    try {
        const backup = await (prisma as any).backup.findUnique({ where: { id } })
        if (!backup) return { success: false, error: 'Backup not found.' }
        if (backup.status !== 'completed') return { success: false, error: 'Only completed backups can be restored.' }

        // Verify checksum
        const computedHash = sha256(backup.data)
        if (computedHash !== backup.checksum) {
            return { success: false, error: 'Checksum mismatch – backup data may be corrupted.' }
        }

        const payload = JSON.parse(backup.data)
        const t = payload.tables

        // Create a pre-restore safety snapshot first
        await createBackup(`pre-restore (initiated by ${restoredBy ?? 'unknown'})`)

        // Delete and re-insert inside a single transaction for atomicity.
        // Dependency order: delete children before parents, insert parents before children.
        await prisma.$transaction(async (tx: any) => {
            await tx.eventTicket.deleteMany()
            await tx.orderItem.deleteMany()
            await tx.order.deleteMany()
            await tx.product.deleteMany()
            await tx.event.deleteMany()
            await tx.newsletterSubscriber.deleteMany()

            if (t.products?.length) await tx.product.createMany({ data: t.products })
            if (t.orders?.length) await tx.order.createMany({ data: t.orders })
            if (t.orderItems?.length) await tx.orderItem.createMany({ data: t.orderItems })
            if (t.events?.length) await tx.event.createMany({ data: t.events })
            if (t.eventTickets?.length) await tx.eventTicket.createMany({ data: t.eventTickets })
            if (t.newsletterSubscribers?.length) await tx.newsletterSubscriber.createMany({ data: t.newsletterSubscribers })
        })

        // Audit note on the original backup record
        await (prisma as any).backup.update({
            where: { id },
            data: { notes: `Restored by ${restoredBy ?? 'unknown'} at ${new Date().toISOString()}` },
        })

        revalidatePath('/admin/backup')
        return { success: true }
    } catch (error: any) {
        console.error('restoreBackup error:', error)
        return { success: false, error: String(error?.message ?? error) }
    }
}

/** Deletes a single backup record. */
export async function deleteBackup(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await (prisma as any).backup.delete({ where: { id } })
        revalidatePath('/admin/backup')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: String(error?.message ?? error) }
    }
}

/** Persists backup configuration changes. */
export async function updateBackupConfig(
    id: string,
    data: { schedule?: string; retentionDays?: number; maxBackups?: number },
    updatedBy?: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await (prisma as any).backupConfig.update({
            where: { id },
            data: { ...data, updatedBy: updatedBy ?? null },
        })
        revalidatePath('/admin/backup')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: String(error?.message ?? error) }
    }
}

// ── internal helpers ──────────────────────────────────────────────────────────

async function enforceRetention() {
    try {
        const config = await getBackupConfig()
        const maxBackups: number = config?.maxBackups ?? 10

        const allIds = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Backup" ORDER BY "createdAt" DESC
        `
        if (allIds.length > maxBackups) {
            const toDelete = allIds.slice(maxBackups).map((r: { id: string }) => r.id)
            await (prisma as any).backup.deleteMany({ where: { id: { in: toDelete } } })
        }
    } catch (error) {
        console.error('enforceRetention error:', error)
    }
}
