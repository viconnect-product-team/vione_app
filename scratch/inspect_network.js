const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invs = await prisma.$queryRaw`
    SELECT id, inviter_user_id, invitee_user_id, status, created_at 
    FROM public.connection_invitations 
    ORDER BY created_at DESC LIMIT 10
  `.catch(e => { console.error('inv error:', e.message); return []; });
  console.log('connection_invitations:', invs);

  const notifs = await prisma.$queryRaw`
    SELECT id, user_id, title, message, type, is_read, created_at 
    FROM public.notifications 
    ORDER BY created_at DESC LIMIT 10
  `.catch(e => { console.error('notif error:', e.message); return []; });
  console.log('notifications:', notifs);

  const users = await prisma.$queryRaw`
    SELECT id, name, email, role FROM public.vione_users LIMIT 5
  `.catch(e => { console.error('users error:', e.message); return []; });
  console.log('users:', users);
}

main().finally(() => prisma.$disconnect());
