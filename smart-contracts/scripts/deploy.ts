import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying Smart Contracts to Arc Testnet...");

    // 1. Deploy AuditLog
    console.log("📄 Deploying AuditLog...");
    const AuditLog = await ethers.getContractFactory("AuditLog");
    const auditLog = await AuditLog.deploy();
    await auditLog.waitForDeployment();
    const auditLogAddress = await auditLog.getAddress();
    console.log(`✅ AuditLog deployed to: ${auditLogAddress}`);

    // 2. Deploy ComplianceGuardian
    console.log("🛡️ Deploying ComplianceGuardian...");
    const ComplianceGuardian = await ethers.getContractFactory("ComplianceGuardian");
    // Pass AuditLog address to ComplianceGuardian
    const complianceGuardian = await ComplianceGuardian.deploy(auditLogAddress);
    await complianceGuardian.waitForDeployment();
    const complianceGuardianAddress = await complianceGuardian.getAddress();
    console.log(`✅ ComplianceGuardian deployed to: ${complianceGuardianAddress}`);

    // Output for .env
    console.log("\n⚠️  ADD THESE TO YOUR .ENV FILE:");
    console.log(`NEXT_PUBLIC_AUDIT_LOG_CONTRACT_ADDRESS=${auditLogAddress}`);
    console.log(`NEXT_PUBLIC_COMPLIANCE_GUARDIAN_CONTRACT_ADDRESS=${complianceGuardianAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
