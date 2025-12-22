import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

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

    // Create Agents using PROVIDED Arc testnet wallets
    const agent1 = await prisma.agent.upsert({
        where: { walletAddress: '0x94a1d978a5b3f387bc58a8956a15a003a800eac9' },
        update: {},
        create: {
            name: 'Agent_AB_MAIN',
            description: 'Primary Trading Bot (AB MAIN)',
            status: 'ACTIVE',
            organizationId: org.id,
            walletAddress: '0x94a1d978a5b3f387bc58a8956a15a003a800eac9',
            walletId: 'wallet_ab_main',
            trustScore: 0.95,
            totalSpent: 125000,
            transactionCount: 340,
        },
    })

    const agent2 = await prisma.agent.upsert({
        where: { walletAddress: '0x02b2919d0b4b4a0b204147e4ec540ce3b793c3d6' },
        update: {},
        create: {
            name: 'Agent_TESTE_1',
            description: 'Test Network Bot 1',
            status: 'ACTIVE',
            organizationId: org.id,
            walletAddress: '0x02b2919d0b4b4a0b204147e4ec540ce3b793c3d6',
            walletId: 'wallet_teste_1',
            trustScore: 0.78,
            totalSpent: 42000,
            transactionCount: 89,
        },
    })

    const agent3 = await prisma.agent.upsert({
        where: { walletAddress: '0x91ed488a6c9b006529d004a8dc8cfe0415e95f20' },
        update: {},
        create: {
            name: 'Agent_TESTE_2',
            description: 'Test Network Bot 2',
            status: 'ACTIVE',
            organizationId: org.id,
            walletAddress: '0x91ed488a6c9b006529d004a8dc8cfe0415e95f20',
            walletId: 'wallet_teste_2',
            trustScore: 0.88,
            totalSpent: 67500,
            transactionCount: 156,
        },
    })

    // Create sample transactions for each agent
    // 1. High Risk Transaction from TESTE_1 (Pending)
    await prisma.transaction.create({
        data: {
            agentId: agent2.id,
            organizationId: org.id,
            fromAddress: agent2.walletAddress,
            toAddress: '0xBadActorAddress123456789',
            amount: 2000,
            currency: 'USDC',
            status: 'QUARANTINE',
            decision: 'PENDING',
            riskScore: 0.85,
            submittedAt: new Date(),
        }
    })

    // 2. Low Risk Transaction from AB_MAIN (Approved)
    await prisma.transaction.create({
        data: {
            agentId: agent1.id,
            organizationId: org.id,
            fromAddress: agent1.walletAddress,
            toAddress: '0xGoodVendorAddress123',
            amount: 15,
            currency: 'USDC',
            status: 'COMPLETED',
            decision: 'AUTO_APPROVE',
            riskScore: 0.08,
            submittedAt: new Date(Date.now() - 3600000), // 1 hour ago
            executedAt: new Date(Date.now() - 3550000),
        }
    })

    // 3. Medium Risk from TESTE_2 (Reviewing)
    await prisma.transaction.create({
        data: {
            agentId: agent3.id,
            organizationId: org.id,
            fromAddress: agent3.walletAddress,
            toAddress: '0x3810dEEb9177ad4B00Ad3b888970cE14a48922e1',
            amount: 500,
            currency: 'USDC',
            status: 'EVALUATING',
            decision: 'PENDING',
            riskScore: 0.45,
            submittedAt: new Date(Date.now() - 600000), // 10 mins ago
        }
    })

    // 4. Another successful transaction from AB_MAIN
    await prisma.transaction.create({
        data: {
            agentId: agent1.id,
            organizationId: org.id,
            fromAddress: agent1.walletAddress,
            toAddress: '0xAPI_VendorAddress456',
            amount: 8.50,
            currency: 'USDC',
            status: 'COMPLETED',
            decision: 'AUTO_APPROVE',
            riskScore: 0.05,
            submittedAt: new Date(Date.now() - 7200000), // 2 hours ago
            executedAt: new Date(Date.now() - 7190000),
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
