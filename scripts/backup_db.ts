import { PrismaClient, Prisma } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting full database backup...')
    const backup: Record<string, any[]> = {}

    // Get all model names from Prisma DMMF
    const models = Prisma.dmmf.datamodel.models.map(m => m.name)

    for (const modelName of models) {
        // lowercase first letter for prisma client access
        const delegateName = modelName.charAt(0).toLowerCase() + modelName.slice(1)
        try {
            // @ts-ignore
            const data = await prisma[delegateName].findMany()
            backup[modelName] = data
            console.log(`Backed up ${data.length} records from ${modelName}`)
        } catch (e: any) {
            console.warn(`Could not back up ${modelName}: ${e.message}`)
        }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `manenbrouw_db_backup_${timestamp}.json`
    const filepath = path.join(process.cwd(), filename)

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))
    console.log(`\n✅ Backup successfully saved to ${filepath}`)
}

main()
    .catch(e => {
        console.error('Backup failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
