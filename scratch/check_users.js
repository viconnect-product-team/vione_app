const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`
    SELECT id, email, role, created_at 
    FROM auth.users 
    ORDER BY created_at DESC LIMIT 10
  `.catch(async () => {
    return await prisma.$queryRaw`
      SELECT id, email, created_at 
      FROM public.users 
      ORDER BY created_at DESC LIMIT 10
    `;
  });
  console.log('Users in DB:', users);

  // Check how members are linked to users
  const linkedMembers = await prisma.$queryRaw`
    SELECT id, code, name, user_id, email 
    FROM public.members 
    WHERE user_id IS NOT NULL 
    LIMIT 10
  `;
  console.log('Linked members:', linkedMembers);

  // Check invoices table columns
  const invoiceCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'invoices'
  `;
  console.log('Invoice columns:', invoiceCols.map(c => c.column_name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
