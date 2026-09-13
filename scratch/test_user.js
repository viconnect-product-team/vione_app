const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.$queryRawUnsafe(`
    SELECT * FROM public.members ORDER BY code ASC
  `);
  
  function daysBetween(from, toIso) {
    const to = new Date(toIso);
    to.setHours(0, 0, 0, 0);
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = members.map(m => {
    const rawTermEnd = m.term_end ? new Date(m.term_end).toISOString().slice(0, 10) : null;
    const termEnd = rawTermEnd || today.toISOString().slice(0, 10);
    const daysLeft = daysBetween(today, termEnd);
    let status;
    if (m.renewed_at) status = "renewed";
    else if (daysLeft < 0) status = "overdue";
    else if (daysLeft <= 30) status = "due";
    else status = "upcoming";

    return {
      code: m.code,
      name: m.name,
      termEnd,
      daysLeft,
      status,
      renewedAt: m.renewed_at ? new Date(m.renewed_at).toISOString().slice(0, 10) : null,
      paymentStatus: m.payment_status
    };
  });

  console.table(results);
  const statusCounts = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  console.log('Status Counts:', statusCounts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
