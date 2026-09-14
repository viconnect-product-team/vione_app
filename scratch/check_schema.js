const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cols = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('user_profiles', 'vione_users', 'members', 'business_identities')
    ORDER BY table_name, column_name
  `;
  console.log(JSON.stringify(cols, null, 2));
}
main().finally(() => prisma.$disconnect());