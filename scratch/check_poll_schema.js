const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pollVotesCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'poll_votes'
    ORDER BY ordinal_position
  `);
  console.log('poll_votes columns:', pollVotesCols);

  const pollsCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'polls'
    ORDER BY ordinal_position
  `);
  console.log('polls columns:', pollsCols);

  const pollOptionsCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'poll_options'
    ORDER BY ordinal_position
  `);
  console.log('poll_options columns:', pollOptionsCols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
