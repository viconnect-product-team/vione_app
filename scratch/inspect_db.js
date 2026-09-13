const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const assoc = await p.$queryRawUnsafe('SELECT id, name, slug FROM public.associations');
  console.log('Associations:');
  console.log(assoc);

  const benefits = await p.$queryRawUnsafe('SELECT * FROM public.association_benefits');
  console.log('\nAssociation Benefits:');
  console.log(benefits);

  const perks = await p.$queryRawUnsafe('SELECT * FROM public.perks');
  console.log('\nPerks:');
  console.log(perks);
}

main().catch(console.error).finally(() => p.$disconnect());
