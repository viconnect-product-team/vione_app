const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectColumns() {
  const tables = ['associations', 'members', 'products', 'invoices', 'renewal_audit_log', 'business_relationship_moments', 'business_meetings', 'business_notifications'];
  for (const table of tables) {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, table);
    console.log(`\nTable: ${table} (${cols.length} columns)`);
    console.log(cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }
  await prisma.$disconnect();
}

inspectColumns();
