const { PrismaClient } = require('../packages/db/index.js');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.$queryRawUnsafe(`
    SELECT DISTINCT ON (u.email)
      u.id, 
      u.email, 
      u.name, 
      r.role, 
      m.code as member_code, 
      m.department, 
      m.executive_role,
      m.name as member_name
    FROM public.vione_users u
    LEFT JOIN public.user_roles r ON u.id = r.user_id
    LEFT JOIN public.members m ON u.id = m.user_id
    ORDER BY u.email;
  `);
  console.log(JSON.stringify(users, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
