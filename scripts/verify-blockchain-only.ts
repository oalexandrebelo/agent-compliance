import { ethers } from 'ethers';
import AuditLogArtifact from '../smart-contracts/artifacts/contracts/AuditLog.sol/AuditLog.json';
import { auditLogger } from '../src/lib/web3/audit-logger';

// Configuration from audit-logger.ts (Hardcoded for demo)
const RPC_URL = 'http://127.0.0.1:8545';
const AUDIT_LOG_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

async function main() {
    console.log("🔗 Starting Blockchain-Only Verification...");

    // 1. Simulate an Audit Log Action directly
    console.log("1. Submitting Audit Log to Local Node...");

    // Simulate data that would come from the alert approval
    const testEntityId = "tx-" + Date.now();
    const testPayload = {
        alertId: "alert-123",
        decision: "APPROVED",
        reason: "Blockchain Verification Test",
        timestamp: new Date().toISOString()
    };

    const txHash = await auditLogger.logAction(
        testEntityId,
        'SYSTEM_TEST',
        testPayload
    );

    console.log(`   Transaction Hash: ${txHash}`);
    if (!txHash) throw new Error("Logger returned null hash");

    // 2. Verify on Local Blockchain
    console.log("2. Verifying Transaction on Chain...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Check Receipt
    console.log("   Fetching Receipt...");
    const receipt = await provider.getTransactionReceipt(txHash);

    if (receipt && receipt.status === 1) {
        console.log(`   ✅ BLock Number: ${receipt.blockNumber}`);
        console.log(`   ✅ Gas Used: ${receipt.gasUsed.toString()}`);
        console.log("✅ SUCCESS: The Audit Logger successfully wrote to the Local Blockchain.");
    } else {
        console.error("❌ FAILED: Transaction failed or not found.");
        process.exit(1);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
