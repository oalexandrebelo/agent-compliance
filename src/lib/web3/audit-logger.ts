import { ethers } from 'ethers';
import AuditLogArtifact from './abi/AuditLog.json';

const RPC_URL = process.env.ARC_RPC_URL || 'https://testnet.arc.network';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
// Address would be set after deployment. For dev/test, use placeholder or env.
const CONTRACT_ADDRESS = process.env.AUDIT_LOG_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export class AuditLogger {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        if (PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, AuditLogArtifact.abi, this.wallet);
        }
    }

    async logAction(entityId: string, actionType: string, dataPayload: any) {
        if (!this.contract || !this.wallet) {
            console.warn('AuditLogger: No wallet/contract configured. Skipping blockchain log.');
            return null;
        }

        try {
            const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(dataPayload)));

            const tx = await this.contract.logAction(
                entityId,
                actionType,
                dataHash
            );

            // console.log(`AuditLog submitted: ${tx.hash}`);
            return tx.hash;
        } catch (error) {
            console.error('AuditLogger Error:', error);
            return null; // Don't block main flow if chain fails
        }
    }
}

export const auditLogger = new AuditLogger();
