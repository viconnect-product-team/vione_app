const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'business_notifications'
  `.catch(e => { console.error('notifCols err:', e.message); return []; });
  console.log('business_notifications columns:', notifCols.map(c => c.column_name));

  const connCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_connections'
  `.catch(e => { console.error('connCols err:', e.message); return []; });
  console.log('user_connections columns:', connCols.map(c => c.column_name));

  const recentConns = await prisma.$queryRaw`
    SELECT id, requester_user_id, recipient_user_id, status, created_at 
    FROM public.user_connections 
    ORDER BY created_at DESC LIMIT 5
  `.catch(e => { console.error('recentConns err:', e.message); return []; });
  console.log('recent user_connections:', recentConns);

  const recentNotifs = await prisma.$queryRaw`
    SELECT id, recipient_user_id, notification_kind, created_at 
    FROM public.business_notifications 
    ORDER BY created_at DESC LIMIT 5
  `.catch(e => { console.error('recentNotifs err:', e.message); return []; });
  console.log('recent business_notifications:', recentNotifs);
}

main().finally(() => prisma.$disconnect());
