const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  const companies = await p.members.findMany({
    where: { type: 'company' },
    select: { id: true, code: true, name: true, tax_code: true, website: true, employees: true }
  });
  console.log(`Found ${companies.length} company members in DB:`);
  companies.slice(0, 3).forEach(c => console.log(` - [${c.code}] ${c.name} (Tax: ${c.tax_code}, Emps: ${c.employees})`));

  const benefits = await p.$queryRawUnsafe('SELECT id, title_vi, title_en, desc_vi, sort_order FROM public.association_benefits ORDER BY sort_order ASC');
  console.log(`\nFound ${benefits.length} association benefits:`);
  benefits.forEach(b => console.log(` - [Order ${b.sort_order}] ${b.title_vi} (${b.desc_vi})`));
}

test().catch(console.error).finally(() => p.$disconnect());
