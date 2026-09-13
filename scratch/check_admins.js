const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function m() {
  const vu = await p.$queryRaw`SELECT id, name, email FROM public.vione_users`;
  console.log('vione_users:', JSON.stringify(vu, null, 2));
  const bi = await p.$queryRaw`SELECT id, owner_user_id, display_name, headline, job_title FROM public.business_identities`;
  console.log('business_identities:', JSON.stringify(bi, null, 2));
  await p.$disconnect();
}
m();
