import { circleAPI } from '../src/lib/circle/api-client';

async function testCircleIntegration() {
    console.log('🧪 Testing Circle API Integration...\n');

    try {
        // Test 1: Create a wallet
        console.log('1️⃣ Creating test wallet...');
        const wallet = await circleAPI.createWallet({
            name: 'Test Agent',
            refId: `test-${Date.now()}`,
        });
        console.log(`✅ Wallet created successfully!`);
        console.log(`   ID: ${wallet.id}`);
        console.log(`   Address: ${wallet.address}`);
        console.log(`   Blockchain: ${wallet.blockchain}\n`);

        // Test 2: Get wallet balance
        console.log('2️⃣ Fetching wallet balance...');
        const balances = await circleAPI.getBalance(wallet.id);
        console.log(`✅ Balance retrieved successfully!`);
        if (balances.length === 0) {
            console.log(`   Balance: 0 USDC (wallet is empty)\n`);
        } else {
            balances.forEach((balance) => {
                console.log(`   ${balance.token.symbol}: ${balance.amount}`);
            });
        }

        // Test 3: List all wallets
        console.log('3️⃣ Listing all wallets...');
        const allWallets = await circleAPI.listWallets();
        console.log(`✅ Found ${allWallets.length} wallet(s) in wallet set\n`);

        console.log('✅ All tests passed! Circle API is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Fund the wallet at https://faucet.circle.com');
        console.log(`   2. Use address: ${wallet.address}`);
        console.log('   3. Test transfers once funded');

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);

        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data);
        }

        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Verify CIRCLE_API_KEY is set in .env');
        console.log('   2. Verify CIRCLE_WALLET_SET_ID is set in .env');
        console.log('   3. Check that API key has Wallets permissions');
        console.log('   4. Ensure Entity Secret is registered in Circle Console');

        process.exit(1);
    }
}

testCircleIntegration();
