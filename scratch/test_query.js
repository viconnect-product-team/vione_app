const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const assocId = 'c1983000-0000-4000-8000-000000001983';
  try {
    const rows = await prisma.$queryRaw`
      SELECT m.code, m.name, m.contact, m.phone, m.email, m.about, m.address, m.website,
             m.industry, m.region, m.type, m.status, m.user_id,
             COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url) as avatar,
             COALESCE(up.full_name, vu.full_name, m.contact) as person_name,
             COALESCE(up.headline, bi.tagline, m.industry) as person_title
      FROM public.members m
      LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
      LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
      LEFT JOIN public.vione_users vu ON vu.id = m.user_id
      WHERE m.association_id = ${assocId}::uuid AND m.status = 'active'
      ORDER BY m.name ASC
    `;
    console.log('Success! Returned rows count:', rows.length);
  } catch (err) {
    console.error('Query failed:', err);
  }
}
main().finally(() => prisma.$disconnect());