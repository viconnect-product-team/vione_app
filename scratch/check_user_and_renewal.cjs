const { PrismaClient } = require('../packages/db');
const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECK USER admin@connect.vn ===");
  const users = await prisma.$queryRawUnsafe(`
    SELECT id, email, username, name FROM public.vione_users WHERE email = 'admin@connect.vn';
  `);
  console.log("User:", users);

  if (users.length > 0) {
    const userId = users[0].id;
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.memberships WHERE user_id = '${userId}'::uuid;
    `);
    console.log("Memberships:", memberships);

    const members = await prisma.$queryRawUnsafe(`
      SELECT id, code, name, email, user_id, association_id, status, term_end, fee_paid FROM public.members WHERE user_id = '${userId}'::uuid OR email = 'admin@connect.vn';
    `);
    console.log("Member records for admin:", members);
  }

  console.log("\n=== ALL MEMBERS SUMMARY ===");
  const memberCounts = await prisma.$queryRawUnsafe(`
    SELECT status, fee_paid, count(*) as count 
    FROM public.members 
    GROUP BY status, fee_paid;
  `);
  console.log("Member counts by status & fee_paid:", memberCounts);

  const membersWithTerm = await prisma.$queryRawUnsafe(`
    SELECT id, code, name, status, term_end, fee_paid, renewed_at
    FROM public.members
    ORDER BY term_end ASC NULLS LAST;
  `);
  console.log("Total members:", membersWithTerm.length);
  console.log("Sample members with term_end:", membersWithTerm.slice(0, 15));
}

main().catch(console.error).finally(() => prisma.$disconnect());
