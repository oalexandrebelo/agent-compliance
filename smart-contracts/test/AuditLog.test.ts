import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AuditLog", function () {
    async function deployAuditLogFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const AuditLog = await ethers.getContractFactory("AuditLog");
        const auditLog = await AuditLog.deploy();
        return { auditLog, owner, otherAccount };
    }

    describe("Logging", function () {
        it("Should emit event on successful log", async function () {
            const { auditLog, owner } = await loadFixture(deployAuditLogFixture);

            const entityId = ethers.keccak256(ethers.toUtf8Bytes("tx_123"));
            const actionType = "TRANSACTION_APPROVED";
            const dataHash = ethers.keccak256(ethers.toUtf8Bytes('{"risk": 0.1}'));

            await expect(auditLog.logAction(entityId, actionType, dataHash))
                .to.emit(auditLog, "ComplianceActionLogged");
        });

        it("Should reject unauthorized writes", async function () {
            const { auditLog, otherAccount } = await loadFixture(deployAuditLogFixture);

            const entityId = ethers.keccak256(ethers.toUtf8Bytes("tx_123"));
            const actionType = "TRANSACTION_APPROVED";
            const dataHash = ethers.keccak256(ethers.toUtf8Bytes("{}"));

            await expect(
                auditLog.connect(otherAccount).logAction(entityId, actionType, dataHash)
            ).to.be.revertedWith("AuditLog: Caller is not authorized");
        });
    });
});
