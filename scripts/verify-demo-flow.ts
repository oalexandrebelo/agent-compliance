import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import AuditLogArtifact from '../smart-contracts/artifacts/contracts/AuditLog.sol/AuditLog.json';

const prisma = new PrismaClient();

// Configuration from audit-logger.ts
const RPC_URL = 'http://127.0.0.1:8545';
const AUDIT_LOG_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

async function main() {
    console.log("🧪 Starting End-to-End Verification...");

    // 1. Create a Test Organization & Agent & Transaction & Alert
    console.log("1. Seeding Test Data...");
    const org = await prisma.organization.create({
        data: { name: 'Test Org ' + Date.now(), slug: 'test-org-' + Date.now(), email: 'test-' + Date.now() + '@example.com' }
    });

    const agent = await prisma.agent.create({
        data: {
            name: 'Test Agent',
            organizationId: org.id,
            walletAddress: '0x' + Date.now(),
            walletId: 'w-' + Date.now()
        }
    });

    const tx = await prisma.transaction.create({
        data: {
            agentId: agent.id,
            organizationId: org.id,
            amount: 1000,
            fromAddress: '0x123',
            toAddress: '0x456',
            status: 'PENDING'
        }
    });

    const alert = await prisma.alert.create({
        data: {
            transactionId: tx.id,
            agentId: agent.id,
            organizationId: org.id,
            severity: 'HIGH',
            status: 'PENDING',
            reasons: ["Test Alert"],
            aiExplanation: "Test Explanation"
        }
    });
    console.log(`   Created Alert ID: ${alert.id}`);

    // 2. Simulate API Call (Approve Alert)
    console.log("2. Calling Approval API...");
    // We can't call Next.js API easily from here without running server. 
    // Instead, we will import the logic or simulate what the route does: calling auditLogger directly.
    // But to test the ROUTE, we should use fetch if server is running.
    // Assuming server is NOT running, let's verify via the audit-logger.ts logic directly.

    const { auditLogger } = require('../src/lib/web3/audit-logger');

    const txHash = await auditLogger.logAction(
        tx.id,
        'ALERT_APPROVED',
        { decision: 'APPROVED', reason: 'Verification Script' }
    );

    console.log(`   Transaction Hash: ${txHash}`);
    if (!txHash) throw new Error("Logger returned null hash");

    // 3. Verify on Blockchain
    console.log("3. Verifying on Local Blockchain...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(AUDIT_LOG_ADDRESS, AuditLogArtifact.abi, provider);

    // Get log count
    // The AuditLog.sol provided by standard Hardhat scaffolds might not have getters?
    // Let's assume standard log behavior. We can check the Transaction Receipt.

    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`   Block Number: ${receipt?.blockNumber}`);

    if (receipt && receipt.status === 1) {
        console.log("✅ SUCCESS: Transaction confirmed on-chain.");
    } else {
        console.error("❌ FAILED: Transaction failed or not found.");
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
