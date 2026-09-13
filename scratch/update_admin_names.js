const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating admin account names and job titles...');

  // 1. Update 00000000-0000-4000-8000-000000000002 (admin@connect.vn)
  const id2 = '00000000-0000-4000-8000-000000000002';
  await prisma.$executeRaw`
    UPDATE public.vione_users
    SET name = 'Phạm Văn Vũ', updated_at = now()
    WHERE id = ${id2}::uuid OR email = 'admin@connect.vn'
  `;
  await prisma.$executeRaw`
    UPDATE public.user_profiles
    SET display_name = 'Phạm Văn Vũ', professional_title = 'Quản trị viên Hệ thống', company_name = 'ViOne Platform', updated_at = now()
    WHERE user_id = ${id2}::uuid
  `;
  await prisma.$executeRaw`
    UPDATE public.business_identities
    SET display_name = 'Phạm Văn Vũ', job_title = 'Quản trị viên Hệ thống', company_name = 'ViOne Platform', updated_at = now()
    WHERE owner_user_id = ${id2}::uuid
  `;

  // 2. Update 00000000-0000-4000-8000-000000000001 (admin1@connect.vn)
  const id1 = '00000000-0000-4000-8000-000000000001';
  await prisma.$executeRaw`
    UPDATE public.vione_users
    SET name = 'Trần Tuấn Anh', updated_at = now()
    WHERE id = ${id1}::uuid OR email = 'admin1@connect.vn'
  `;
  await prisma.$executeRaw`
    UPDATE public.user_profiles
    SET display_name = 'Trần Tuấn Anh', professional_title = 'Platform Administrator', company_name = 'ViConnect Holdings', updated_at = now()
    WHERE user_id = ${id1}::uuid
  `;
  await prisma.$executeRaw`
    UPDATE public.business_identities
    SET display_name = 'Trần Tuấn Anh', job_title = 'Platform Administrator', company_name = 'ViConnect Holdings', updated_at = now()
    WHERE owner_user_id = ${id1}::uuid
  `;

  // 3. Check and update members table if needed
  await prisma.$executeRaw`
    UPDATE public.members
    SET name = 'Phạm Văn Vũ - ViOne Platform', updated_at = now()
    WHERE user_id = ${id2}::uuid
  `.catch(() => {});
  await prisma.$executeRaw`
    UPDATE public.members
    SET name = 'Trần Tuấn Anh - ViConnect Holdings', updated_at = now()
    WHERE user_id = ${id1}::uuid
  `.catch(() => {});

  // 4. Verify updated records
  const bi = await prisma.$queryRaw`
    SELECT id, owner_user_id, display_name, job_title, company_name FROM public.business_identities
    WHERE owner_user_id IN (${id1}::uuid, ${id2}::uuid)
  `;
  console.log('Updated business_identities:', bi);

  const vu = await prisma.$queryRaw`
    SELECT id, email, name FROM public.vione_users
    WHERE id IN (${id1}::uuid, ${id2}::uuid)
  `;
  console.log('Updated vione_users:', vu);

  console.log('Successfully updated admin account names!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
