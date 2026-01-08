import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function testConnection() {
    console.log('🔍 Testando conexão com Supabase...\n');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    const startTime = Date.now();

    try {
        // Test 1: Simple query
        await prisma.$queryRaw`SELECT 1 as test`;
        const queryTime = Date.now() - startTime;
        console.log(`\n✅ Conexão OK! Tempo de resposta: ${queryTime}ms`);

        // Test 2: Check tables
        const tables = await prisma.$queryRaw<{ tablename: string }[]>`
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        `;
        console.log(`\n📋 Tabelas encontradas: ${tables.length}`);
        tables.forEach(t => console.log(`   - ${t.tablename}`));

        // Test 3: Count records
        if (tables.some(t => t.tablename === 'agents')) {
            const agentCount = await prisma.agent.count();
            console.log(`\n👤 Agentes no banco: ${agentCount}`);
        }

        if (tables.some(t => t.tablename === 'alerts')) {
            const alertCount = await prisma.alert.count();
            console.log(`🚨 Alertas no banco: ${alertCount}`);
        }

        if (tables.some(t => t.tablename === 'transactions')) {
            const txCount = await prisma.transaction.count();
            console.log(`💸 Transações no banco: ${txCount}`);
        }

        console.log('\n🎉 Banco de dados está funcionando corretamente!');

    } catch (error) {
        console.error('\n❌ Erro de conexão:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
