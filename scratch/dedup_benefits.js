const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const idsToDelete = [
    '5ec12cee-d81f-4cf4-8554-676b0b1fddf8',
    '25c626d9-80ed-4d0e-924f-ad0c625ecd97',
    '33bc072e-bdf1-46c4-b3b4-062d229654fd'
  ];
  
  const res = await prisma.$queryRawUnsafe(`
    DELETE FROM public.association_benefits 
    WHERE id = ANY($1::uuid[])
    RETURNING id, title_vi
  `, idsToDelete);

  console.log('Deleted duplicate benefits:', res);

  const remaining = await prisma.$queryRawUnsafe(`
    SELECT id, title_vi, sort_order FROM public.association_benefits ORDER BY sort_order ASC
  `);
  console.log('Remaining clean benefits:');
  console.table(remaining);
}

main().catch(console.error).finally(() => prisma.$disconnect());
