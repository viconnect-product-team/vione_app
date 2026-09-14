const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const rows = await prisma.$queryRaw`
    SELECT o.id, o.title, o.description, o.type, o.poster_id, o.association_id,
           a.name as association_name,
           m.code as poster_code,
           COALESCE(up.display_name, vu.name, m.contact, m.name, o.claimed_by_name, 'Hội viên CLB CEO 1983') as poster_name,
           COALESCE(m.name, bi.company_name, o.claimed_company, a.name, 'CLB Doanh Nhân CEO 1983') as poster_company
    FROM public.opportunities o
    LEFT JOIN public.associations a ON o.association_id = a.id
    LEFT JOIN public.members m ON m.user_id::text = o.poster_id OR m.id = o.poster_id OR m.code = o.poster_id
    LEFT JOIN public.user_profiles up ON up.user_id::text = o.poster_id
    LEFT JOIN public.vione_users vu ON vu.id::text = o.poster_id
    LEFT JOIN public.business_identities bi ON bi.owner_user_id::text = o.poster_id
    WHERE o.status IN ('open', 'published', 'active')
    ORDER BY o.created_at DESC
    LIMIT 5
  `;
  console.log('Opportunities count:', rows.length);
  console.log('Sample:', JSON.stringify(rows[0], null, 2));
}
main().finally(() => prisma.$disconnect());