const { ethers } = require('ethers');

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('\n🔑 Nova Wallet Gerada:\n');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('\n📝 Adicione ao .env:\n');
console.log(`DEPLOYER_PRIVATE_KEY=${wallet.privateKey}`);
console.log('\n⚠️  IMPORTANTE:');
console.log('1. Copie a Private Key acima');
console.log('2. Adicione ao arquivo .env');
console.log('3. Transfira 10 USDC para o endereço:', wallet.address);
console.log('4. Use https://faucet.circle.com para financiar\n');
