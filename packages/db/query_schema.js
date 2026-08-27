const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app"
  });
  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'guest_contacts'
  `);
  console.log("guest_contacts columns:");
  cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  await client.end();
}

main().catch(console.error);
