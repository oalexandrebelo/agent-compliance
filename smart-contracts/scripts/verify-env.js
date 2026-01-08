require('dotenv').config();

const key = process.env.DEPLOYER_PRIVATE_KEY;

console.log('\n🔍 Verificando DEPLOYER_PRIVATE_KEY...\n');

if (!key) {
    console.log('❌ DEPLOYER_PRIVATE_KEY não encontrada no .env');
    process.exit(1);
}

console.log(`Comprimento total: ${key.length} caracteres`);
console.log(`Começa com 0x: ${key.startsWith('0x') ? '✅' : '❌'}`);
console.log(`Primeiros 6 chars: ${key.substring(0, 6)}...`);
console.log(`Últimos 4 chars: ...${key.substring(key.length - 4)}`);

if (key.length === 66 && key.startsWith('0x')) {
    console.log('\n✅ Chave privada está no formato correto!');
    console.log('Pode fazer o deploy agora.\n');
} else {
    console.log('\n❌ Chave privada está INCORRETA!');
    console.log('\nDeveria ser:');
    console.log('- 66 caracteres total (0x + 64 hex)');
    console.log('- Começar com 0x');
    console.log('\nChave correta para usar:');
    console.log('DEPLOYER_PRIVATE_KEY=0x163f7aff70d9eb6e0addbd8e21213ad71ded21fea9ff10ea09b34a21eceae107\n');
}
