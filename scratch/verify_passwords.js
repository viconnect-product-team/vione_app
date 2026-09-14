const { PrismaClient } = require('../packages/db/index.js');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.$queryRawUnsafe(`
    SELECT email, password FROM public.vione_users WHERE email IN ('admin@connect.vn', 'admin1@connect.vn', 'ceo.tongthuky@ceo1983.com');
  `);
  for (const u of users) {
    const is123456 = await bcrypt.compare('123456', u.password);
    const isAdmin123 = await bcrypt.compare('admin123', u.password);
    console.log(`${u.email} -> '123456': ${is123456} | 'admin123': ${isAdmin123}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
