const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' });

async function check() {
  await client.connect();
  const tables = ['perks', 'products', 'news', 'email_campaigns', 'members', 'user_roles', 'memberships'];
  for (const t of tables) {
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`);
    console.log(`=== TABLE: ${t} ===`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }
  await client.end();
}

check().catch(console.error);
