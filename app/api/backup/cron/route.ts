import { NextRequest, NextResponse } from 'next/server'
import { createBackup, getBackupConfig } from '@/app/actions/backupActions'

/**
 * GET /api/backup/cron
 *
 * Endpoint for automated backup triggering (Vercel Cron or external scheduler).
 * Secured with a shared secret via the BACKUP_CRON_SECRET env variable.
 *
 * Example Vercel cron configuration (vercel.json):
 * {
 *   "crons": [{ "path": "/api/backup/cron", "schedule": "0 2 * * *" }]
 * }
 */
export async function GET(request: NextRequest) {
    const cronSecret = process.env.BACKUP_CRON_SECRET
    const authHeader = request.headers.get('authorization')

    // Reject unauthenticated requests when a secret is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const config = await getBackupConfig()

        // Respect schedule setting – only run if automated schedule is configured
        if (config?.schedule === 'manual') {
            return NextResponse.json({ skipped: true, reason: 'Schedule is set to manual' })
        }

        const result = await createBackup('cron')

        if (result.success) {
            return NextResponse.json({ success: true, id: result.id })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        console.error('Backup cron error:', error)
        return NextResponse.json({ success: false, error: String(error?.message ?? error) }, { status: 500 })
    }
}
