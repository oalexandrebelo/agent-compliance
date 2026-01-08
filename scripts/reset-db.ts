import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function resetAndSeed() {
    console.log('🗑️  Clearing existing data...');

    // Clear in order of dependencies
    await prisma.alertReview.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.riskScore.deleteMany();
    await prisma.screeningResult.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.dailyMetrics.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.complianceReport.deleteMany();
    await prisma.complianceSettings.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    console.log('✅ Data cleared!');
    console.log('🌱 Running seed...');
}

resetAndSeed()
    .then(async () => {
        await prisma.$disconnect();
        console.log('✅ Reset complete! Now run: npx prisma db seed');
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
