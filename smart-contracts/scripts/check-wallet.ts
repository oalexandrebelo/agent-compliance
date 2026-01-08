import { ethers } from "hardhat";

async function main() {
    const key = process.env.DEPLOYER_PRIVATE_KEY;
    if (!key || key === "0000000000000000000000000000000000000000000000000000000000000000") {
        console.log("❌ KEY_MISSING");
    } else {
        try {
            const wallet = new ethers.Wallet(key);
            console.log(`✅ KEY_VALID for address: ${wallet.address}`);
        } catch (e) {
            console.log("❌ KEY_INVALID_FORMAT");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
