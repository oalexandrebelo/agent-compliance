import { ethers } from 'ethers';
import AuditLogArtifact from './abi/AuditLog.json';

// PRODUCTION CONFIGURATION (Arc Testnet)
const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
// Deployer wallet (User provided)
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
// Contract Address (Deployed on Arc Testnet)
const CONTRACT_ADDRESS = process.env.AUDIT_LOG_CONTRACT_ADDRESS || '0x4640e9eb48d1ecDC33E6796aDF700E3AFE92ea32';

export class AuditLogger {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        try {
            if (PRIVATE_KEY) {
                this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
                this.contract = new ethers.Contract(CONTRACT_ADDRESS, AuditLogArtifact.abi, this.wallet);
                console.log('✅ AuditLogger connected to Local Hardhat Node');
            }
        } catch (error) {
            console.error('❌ Failed to initialize AuditLogger wallet:', error);
        }
    }

    async logAction(entityId: string, actionType: string, dataPayload: unknown) {
        if (!this.contract || !this.wallet) {
            console.warn('AuditLogger: No wallet/contract configured. Skipping blockchain log.');
            return null;
        }

        try {
            // Contract expects bytes32 for entityId, so we hash the string ID
            const entityHash = ethers.id(entityId); // Keccak256 of the UTF8 string
            const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(dataPayload)));

            const tx = await this.contract.logAction(
                entityHash,
                actionType,
                dataHash
            );

            // console.log(`AuditLog submitted: ${tx.hash}`);
            return tx.hash;
        } catch (error) {
            console.error('AuditLogger Error:', error);
            // Production: Send to Sentry/DataDog
            return null; // Don't block main flow if chain fails
        }
    }
}

export const auditLogger = new AuditLogger();
