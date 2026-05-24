import { neon } from '@neondatabase/serverless';
const url = process.env.DATABASE_URL;
if (url) {
  const sql = neon(url);
  (async () => {
    try {
       const res = await sql('SELECT 1 as num', []);
       console.log(res);
    } catch(e) { console.error(e); }
  })();
}
