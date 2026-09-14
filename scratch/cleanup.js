const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$executeRaw`DELETE FROM public.messages WHERE from_id = 'test_from'`.then(r => console.log('Cleaned', r)).finally(() => prisma.$disconnect());
