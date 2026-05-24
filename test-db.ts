import { getNeon } from './lib/db-pool';
async function test() {
  const sql = getNeon();
  const coaches = await sql`SELECT id, username, password FROM "CoachUser" LIMIT 5`;
  console.log("Coaches:", coaches);
}
test();
