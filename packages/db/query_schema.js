const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app"
  });
  await client.connect();

  const cols = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.documents'::regclass
  `);
  console.log("documents constraints:", cols.rows);

  await client.end();
}

main().catch(console.error);
