import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('--- VERIFICATION REPORT ---');
  
  // Verify Users
  const users = await prisma.user.findMany({
    where: { schoolCode: 'TRIAL-SCH' },
    select: { email: true, name: true, schoolCode: true, role: true }
  });
  
  console.log(`\n[USERS] Found ${users.length} users in TRIAL-SCH:`);
  users.forEach(u => console.log(`- ${u.name} (${u.email}) | Role: ${u.role}`));

  // Verify Vouchers
  const vouchers = await prisma.voucher.findMany({
    where: { code: { startsWith: 'TRIAL-SCH' } },
    take: 5 
  });
  
  console.log(`\n[VOUCHERS] Found ${vouchers.length} sample vouchers (showing top 5):`);
  vouchers.forEach(v => console.log(`- ${v.code} | Value: ${v.discountValue}%`));

  await prisma.$disconnect();
}

main();
