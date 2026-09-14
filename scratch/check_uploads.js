const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable'
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_uploads');");
  console.log('user_uploads exists:', res.rows[0].exists);
  
  if (res.rows[0].exists) {
    const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_uploads';");
    console.log('user_uploads cols:', cols.rows);
  }
  await client.end();
}

main().catch(console.error);
