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
    const tx3 = await prisma.transaction.create({
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

    // Create Alert for High Risk Transaction (from TESTE_1 above - we need to fetch it or capture it)
    // Refetching or we can assume we know the data. Let's create an alert for a NEW transaction to be sure.

    // 5. CRITICAL Risk Transaction (Simulated Alert)
    const txCritical = await prisma.transaction.create({
        data: {
            agentId: agent2.id, // TESTE_1
            organizationId: org.id,
            fromAddress: agent2.walletAddress,
            toAddress: '0xDarkWebMarketplace',
            amount: 50000,
            currency: 'USDC',
            status: 'QUARANTINE', // Blocked/Held
            decision: 'PENDING',
            riskScore: 0.95,
            submittedAt: new Date(Date.now() - 120000), // 2 mins ago
        }
    })

    await prisma.alert.create({
        data: {
            transactionId: txCritical.id,
            agentId: agent2.id,
            organizationId: org.id,
            severity: 'CRITICAL',
            status: 'PENDING',
            reasons: ['Velocity Limit Exceeded', 'Known Malicious Address'],
            aiExplanation: 'Structuring / Layering Attempt: Transaction attempts to move large funds to a flagged darknet mixer address.',
            createdAt: new Date(Date.now() - 120000),
        }
    })

    // 6. HIGH Risk Transaction (Simulated Alert)
    const txHigh = await prisma.transaction.create({
        data: {
            agentId: agent3.id, // TESTE_2
            organizationId: org.id,
            fromAddress: agent3.walletAddress,
            toAddress: '0xSuspiciousExchange',
            amount: 9500,
            currency: 'USDC',
            status: 'QUARANTINE', // Was QUARANTINE in previous step, keep consistent
            decision: 'PENDING',
            riskScore: 0.75,
            submittedAt: new Date(Date.now() - 3600000), // 1 hour ago
        }
    })

    await prisma.alert.create({
        data: {
            transactionId: txHigh.id,
            agentId: agent3.id,
            organizationId: org.id,
            severity: 'HIGH',
            status: 'REVIEWING',
            reasons: ['Sudden Volume Spike', 'Unusual Time of Day'],
            aiExplanation: 'High Velocity Trading: Agent exceeded daily average volume by 500% in a single hour.',
            createdAt: new Date(Date.now() - 3600000),
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

    // 7. Large approved transaction for volume
    await prisma.transaction.create({
        data: {
            agentId: agent1.id,
            organizationId: org.id,
            fromAddress: agent1.walletAddress,
            toAddress: '0xLiquidityPoolAddress',
            amount: 75000,
            currency: 'USDC',
            status: 'COMPLETED',
            decision: 'MANUAL_APPROVE',
            riskScore: 0.35,
            submittedAt: new Date(Date.now() - 86400000), // 1 day ago
            executedAt: new Date(Date.now() - 86300000),
        }
    })

    // 8. Medium transaction
    await prisma.transaction.create({
        data: {
            agentId: agent3.id,
            organizationId: org.id,
            fromAddress: agent3.walletAddress,
            toAddress: '0xDeFiProtocolAddress',
            amount: 12500,
            currency: 'USDC',
            status: 'COMPLETED',
            decision: 'AUTO_APPROVE',
            riskScore: 0.18,
            submittedAt: new Date(Date.now() - 43200000), // 12 hours ago
            executedAt: new Date(Date.now() - 43100000),
        }
    })

    // Create AuditLog entries for the Audit Trail page
    console.log('Creating audit log entries...')

    // Get the CFO user for audit logs
    const cfoUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

    // Audit Log 1: Transaction Approved
    await prisma.auditLog.create({
        data: {
            organizationId: org.id,
            userId: cfoUser?.id,
            action: 'TRANSACTION_APPROVED',
            entityType: 'transaction',
            entityId: txHigh.id,
            after: { decision: 'MANUAL_APPROVE', approvedBy: 'Maria Silva' },
            metadata: {
                txHash: '0xabc123def456789...',
                riskScore: 0.75,
                note: 'Reviewed and approved after verification'
            },
            createdAt: new Date(Date.now() - 1800000), // 30 mins ago
        }
    })

    // Audit Log 2: Agent Suspended
    await prisma.auditLog.create({
        data: {
            organizationId: org.id,
            userId: cfoUser?.id,
            action: 'AGENT_SUSPENDED',
            entityType: 'agent',
            entityId: agent2.id,
            before: { status: 'ACTIVE' },
            after: { status: 'QUARANTINE' },
            metadata: {
                reason: 'Suspicious activity detected',
                txHash: '0x7890abc123def...'
            },
            createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        }
    })

    // Audit Log 3: Alert Created
    await prisma.auditLog.create({
        data: {
            organizationId: org.id,
            action: 'ALERT_CREATED',
            entityType: 'alert',
            entityId: txCritical.id,
            after: { severity: 'CRITICAL', status: 'PENDING' },
            metadata: {
                aiConfidence: 0.95,
                patterns: ['velocity', 'blacklist']
            },
            createdAt: new Date(Date.now() - 120000), // 2 mins ago
        }
    })

    // Audit Log 4: Settings Updated
    await prisma.auditLog.create({
        data: {
            organizationId: org.id,
            userId: cfoUser?.id,
            action: 'SETTINGS_UPDATED',
            entityType: 'compliance_settings',
            entityId: org.id,
            before: { autoBlockThreshold: 0.8 },
            after: { autoBlockThreshold: 0.7 },
            metadata: {
                reason: 'Increased security posture'
            },
            createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        }
    })

    // Audit Log 5: Transaction Blocked
    await prisma.auditLog.create({
        data: {
            organizationId: org.id,
            action: 'TRANSACTION_BLOCKED',
            entityType: 'transaction',
            entityId: txCritical.id,
            after: { status: 'BLOCKED', decision: 'AUTO_BLOCK' },
            metadata: {
                txHash: '0xdef789abc123456...',
                riskScore: 0.95,
                blockchainProof: 'Arc Testnet Block #12938445'
            },
            createdAt: new Date(Date.now() - 60000), // 1 min ago
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
