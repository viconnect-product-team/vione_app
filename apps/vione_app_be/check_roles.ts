import { PrismaClient } from '@vibe/db';

const prisma = new PrismaClient();

async function main() {
  console.log('--- USER ROLES IN DB ---');
  try {
    const roles = await prisma.user_roles.findMany();
    console.log(JSON.stringify(roles, null, 2));
  } catch (err: any) {
    console.error('Error fetching user_roles:', err.message);
  }

  console.log('\n--- VIONE USERS IN DB ---');
  try {
    const users = await prisma.vione_users.findMany({
      select: { id: true, username: true, email: true, name: true, created_at: true },
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (err: any) {
    console.error('Error fetching vione_users:', err.message);
  }

  console.log('\n--- ADMIN MEMBERSHIPS IN DB ---');
  try {
    const memberships = await prisma.$queryRaw`
      SELECT id, user_id, organization_id, role FROM public.memberships WHERE role IN ('admin', 'association_admin', 'owner')
    `;
    console.log(JSON.stringify(memberships, null, 2));
  } catch (err: any) {
    console.error('Error fetching memberships:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
