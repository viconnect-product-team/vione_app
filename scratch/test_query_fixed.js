const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const assocId = 'c1983000-0000-4000-8000-000000001983';
  try {
    const rows = await prisma.$queryRaw`
      SELECT m.code, m.name, m.contact, m.phone, m.email, m.about, m.address, m.website,
             m.industry, m.region, m.type, m.status, m.user_id, m.executive_role,
             COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url) as avatar,
             COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as person_name,
             COALESCE(m.executive_role, up.professional_title, bi.job_title, bi.headline, m.industry) as person_title
      FROM public.members m
      LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
      LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
      LEFT JOIN public.vione_users vu ON vu.id = m.user_id
      WHERE m.association_id = ${assocId}::uuid AND m.status = 'active'
      ORDER BY m.name ASC
    `;
    console.log('SUCCESS! Returned rows count:', rows.length);
    console.log('Sample row:', JSON.stringify(rows[0], null, 2));
  } catch (err) {
    console.error('Query failed:', err);
  }
}
main().finally(() => prisma.$disconnect());