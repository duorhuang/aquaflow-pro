import { getPrisma } from './lib/prisma';

const prisma = getPrisma();

async function cleanup() {
  console.log("=== Cleaning up test data ===\n");

  // 1. Delete weekly plan "2026-05-04 周训练" 
  console.log("1. Finding weekly plan to delete...");
  const weeklyPlans = await prisma.weeklyPlan.findMany({
    where: { weekStart: "2026-05-04" },
  });
  console.log(`   Found ${weeklyPlans.length} weekly plans starting 2026-05-04`);
  for (const wp of weeklyPlans) {
    console.log(`   - ID: ${wp.id}, Title: ${wp.title}, Group: ${wp.group}, Published: ${wp.isPublished}`);
    if (wp.title?.includes("2026-05-04")) {
      console.log(`   → Deleting: ${wp.title}`);
      await prisma.dailySession.deleteMany({ where: { weeklyPlanId: wp.id } });
      await prisma.weeklyFeedback.deleteMany({ where: { weeklyPlanId: wp.id } });
      await prisma.weeklyPlan.delete({ where: { id: wp.id } });
      console.log(`   ✓ Deleted`);
    }
  }

  // 2. Delete weekly feedback for swimmer "ggdayup"
  console.log("\n2. Finding Doody's feedback to delete...");
  const doody = await prisma.swimmer.findFirst({ where: { username: "ggdayup" } });
  if (doody) {
    console.log(`   Found swimmer: ${doody.name} (username: ${doody.username})`);
    const doodyFeedbacks = await prisma.weeklyFeedback.findMany({
      where: { swimmerId: doody.id },
    });
    console.log(`   Found ${doodyFeedbacks.length} weekly feedback records`);
    for (const fb of doodyFeedbacks) {
      console.log(`   - Summary: "${fb.summary?.substring(0, 50)}..."`);
      if (fb.summary === "kefjjefjfewij") {
        console.log(`   → Deleting weekly feedback + daily feedbacks`);
        await prisma.dailyFeedback.deleteMany({ where: { weeklyFeedbackId: fb.id } });
        await prisma.weeklyFeedback.delete({ where: { id: fb.id } });
        console.log(`   ✓ Deleted`);
      }
    }
  } else {
    console.log("   Swimmer ggdayup not found");
  }

  // 3. Delete coach announcements with "hello" and "hi"
  console.log("\n3. Finding coach announcements to delete...");
  const allAnnouncements = await prisma.coachAnnouncement.findMany({
    include: { blocks: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`   Found ${allAnnouncements.length} announcements total`);
  for (const ann of allAnnouncements) {
    const textBlocks = ann.blocks.filter((b: any) => b.type === "text");
    for (const block of textBlocks) {
      if (block.content === "hello" || block.content === "hi") {
        console.log(`   → Deleting announcement ${ann.id} (contains "${block.content}")`);
        await prisma.announcementBlock.deleteMany({ where: { announcementId: ann.id } });
        await prisma.coachAnnouncement.delete({ where: { id: ann.id } });
        console.log(`   ✓ Deleted announcement with "${block.content}"`);
      }
    }
  }

  console.log("\n=== Cleanup complete ===");
}

cleanup().catch(e => { console.error(e); process.exit(1); });
