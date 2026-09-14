const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.$queryRaw`
    SELECT id, email, raw_user_meta_data, user_metadata 
    FROM auth.users 
    WHERE email = 'thuylt313@gmail.com'
  `.catch(async () => {
    return await prisma.$queryRaw`SELECT id, email FROM auth.users WHERE email = 'thuylt313@gmail.com'`;
  });
  console.log('Thuy user:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
