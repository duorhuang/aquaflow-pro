import { hashPassword } from '@/lib/auth';
import { getPrisma } from '@/lib/utils';

/**
 * One-time script to hash existing plaintext passwords in the Swimmer table.
 * Run with: npx tsx scripts/hash-existing-passwords.ts
 */
async function main() {
  const prisma = getPrisma();

  console.log('Starting password hashing migration...');

  const swimmers = await prisma.swimmer.findMany();
  console.log(`Found ${swimmers.length} swimmers to process`);

  let updated = 0;
  for (const swimmer of swimmers) {
    // Skip if password already looks hashed (contains colons from our format)
    if (swimmer.password.includes(':')) {
      console.log(`Skipping ${swimmer.username} - already hashed`);
      continue;
    }

    const hashed = await hashPassword(swimmer.password);
    await prisma.swimmer.update({
      where: { id: swimmer.id },
      data: { password: hashed }
    });
    updated++;
    console.log(`Hashed password for ${swimmer.username}`);
  }

  console.log(`Migration complete. Updated ${updated} passwords.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
