const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' });
async function check() {
  await c.connect();
  const res = await c.query(`
    SELECT trigger_name, event_manipulation, event_object_table, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'business_meeting_follow_ups';
  `);
  console.log(res.rows);
  await c.end();
}
check();
