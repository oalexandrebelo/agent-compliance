import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

async function main() {
    console.log('Start seeding ...')

    // Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'hedge-fund-alpha' },
        update: {},
        create: {
            name: 'Hedge Fund Alpha',
            slug: 'hedge-fund-alpha',
            email: 'contact@hedgefundalpha.com',
            complianceSettings: {
                create: {
                    autoApproveThreshold: 0.3,
                    autoBlockThreshold: 0.7,
                    defaultDailyLimit: 50000,
                    defaultTransactionLimit: 10000,
                }
            }
        },
    })

    // Create User (CFO)
    await prisma.user.upsert({
        where: { email: 'maria.silva@hedgefundalpha.com' },
        update: {},
        create: {
            email: 'maria.silva@hedgefundalpha.com',
            name: 'Maria Silva',
            passwordHash: 'hashed_password_123', // In production use bcrypt
            role: 'ADMIN',
            organizationId: org.id,
            notificationPreferences: { email: true, push: true, slack: false },
        },
    })

    // Create Agent
    const agent = await prisma.agent.upsert({
        where: { walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
        update: {},
        create: {
            name: 'Agent_Bot5',
            description: 'Arbitrage Trading Bot',
            status: 'ACTIVE',
            organizationId: org.id,
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            walletId: 'wallet_123456789',
            trustScore: 0.92,
            totalSpent: 45000,
            transactionCount: 120,
        },
    })

    // Create some sample transactions
    // 1. High Risk Transaction (Pending)
    await prisma.transaction.create({
        data: {
            agentId: agent.id,
            organizationId: org.id,
            fromAddress: agent.walletAddress,
            toAddress: '0xBadActorAddress123456789',
            amount: 2000,
            currency: 'USDC',
            status: 'PENDING',
            decision: 'PENDING',
            riskScore: 0.85,
            submittedAt: new Date(),
        }
    })

    // 2. Low Risk Transaction (Approved)
    await prisma.transaction.create({
        data: {
            agentId: agent.id,
            organizationId: org.id,
            fromAddress: agent.walletAddress,
            toAddress: '0xGoodVendorAddress123',
            amount: 15,
            currency: 'USDC',
            status: 'APPROVED',
            decision: 'AUTO_APPROVE',
            riskScore: 0.1,
            submittedAt: new Date(Date.now() - 3600000), // 1 hour ago
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
