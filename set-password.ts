import { hashPassword } from './lib/auth';
import { getNeon } from './lib/db-pool';

async function main() {
  const sql = getNeon();
  const pwd = await hashPassword('password');
  await sql`UPDATE "CoachUser" SET password = ${pwd} WHERE username = 'coach'`;
  console.log('Updated coach password to "password"');
}
main();
