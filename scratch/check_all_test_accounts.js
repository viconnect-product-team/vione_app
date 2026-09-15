const { PrismaClient } = require('../packages/db/index.js');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  console.log('=== 1. VIONE USERS & PASSWORDS ===');
  const users = await prisma.$queryRawUnsafe(`
    SELECT u.id, u.email, u.name, u.username, u.password,
           m.code as member_code, m.type as member_type, m.level as member_level, m.status as member_status, m.department as member_dept
    FROM public.vione_users u
    LEFT JOIN public.members m ON m.user_id = u.id OR m.email = u.email
    ORDER BY u.created_at ASC
  `);

  for (const u of users) {
    let matchedPass = 'unknown';
    if (u.password) {
      if (await bcrypt.compare('123456', u.password)) matchedPass = '123456';
      else if (await bcrypt.compare('admin123', u.password)) matchedPass = 'admin123';
      else if (await bcrypt.compare('password', u.password)) matchedPass = 'password';
      else if (await bcrypt.compare('12345678', u.password)) matchedPass = '12345678';
    }
    console.log({
      id: u.id,
      email: u.email,
      name: u.name,
      username: u.username,
      password: matchedPass,
      member_code: u.member_code,
      member_type: u.member_type,
      member_dept: u.member_dept
    });
  }

  console.log('\n=== 2. MEMBERS WITHOUT LINKED VIONE_USERS ===');
  const otherMembers = await prisma.$queryRawUnsafe(`
    SELECT id, code, name, email, type, level, status, department, is_board
    FROM public.members
    WHERE email NOT IN (SELECT email FROM public.vione_users WHERE email IS NOT NULL)
    LIMIT 10
  `);
  console.log(otherMembers);

  console.log('\n=== 3. USER ROLES / MEMBERSHIPS ===');
  try {
    const roles = await prisma.$queryRawUnsafe(`
      SELECT user_id, role, organization_id FROM public.user_roles
    `);
    console.log('user_roles:', roles);
  } catch (e) {
    console.log('user_roles error:', e.message);
  }

  try {
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.memberships LIMIT 10
    `);
    console.log('memberships:', memberships);
  } catch (e) {
    console.log('memberships error:', e.message);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
