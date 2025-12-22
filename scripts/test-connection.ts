
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    console.log('--- DB CONNECTION DIAGNOSTIC ---')

    const url = process.env.DATABASE_URL
    if (!url) {
        console.error('❌ DATABASE_URL is undefined')
        return
    }

    // Mask password for safety but show structure
    const masked = url.replace(/:([^:@]+)@/, ':****@')
    console.log(`URL Structure: ${masked}`)

    // Check for specific character
    if (url.includes('120489s2@S')) {
        console.error('❌ CRITICAL ERROR: Found un-encoded "@" in password.')
        console.error('   Expected: ...:120489s2%40S@...')
        console.error('   Actual:   ...:120489s2@S@...')
        console.error('   Fix: Open .env and change "@" to "%40"')
        process.exit(1)
    }

    if (url.includes('%40')) {
        console.log('✅ Password appears correctly encoded (%40 detected)')
    } else {
        console.warn('⚠️ Warning: "%40" not found. If your password has "@", this is wrong.')
    }

    try {
        console.log('Attempting to connect...')
        await prisma.$connect()
        console.log('✅ SUCCESS: Connected to database!')

        const count = await prisma.agent.count()
        console.log(`📊 Current Agent Count: ${count}`)

    } catch (e: any) {
        console.error('❌ Connection Failed:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
