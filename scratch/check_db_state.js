const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    console.log('--- Inspecting Database State ---');
    const userCount = await prisma.users.count();
    const memberCount = await prisma.members.count();
    const eventCount = await prisma.events.count();
    const invoiceCount = await prisma.invoices.count();
    const notificationCount = await prisma.business_notifications.count();
    const meetingCount = await prisma.business_meetings.count();
    const momentCount = await prisma.business_relationship_moments.count();
    const productCount = await prisma.products.count();

    console.log({
      users: userCount,
      members: memberCount,
      events: eventCount,
      invoices: invoiceCount,
      business_notifications: notificationCount,
      business_meetings: meetingCount,
      business_relationship_moments: momentCount,
      products: productCount,
    });

    const sampleUsers = await prisma.users.findMany({
      take: 5,
      select: { id: true, email: true, role: true },
    });
    console.log('Sample users:', sampleUsers);

    const sampleMembers = await prisma.members.findMany({
      take: 5,
      select: { id: true, name: true, user_id: true, status: true, level: true },
    });
    console.log('Sample members:', sampleMembers);
  } catch (err) {
    console.error('Error querying DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
