/**
 * DB SHIM: Exported for backward compatibility.
 * 
 * To prevent Cloudflare Worker 1101 crashes, we use a getter to ensure
 * Prisma is only initialized when actually accessed, NOT at module load time.
 */
export const db = {
    get swimmer() { return getPrisma().swimmer; },
    get trainingPlan() { return getPrisma().trainingPlan; },
    get feedback() { return getPrisma().feedback; },
    get attendanceRecord() { return getPrisma().attendanceRecord; },
    get performanceRecord() { return getPrisma().performanceRecord; },
    get blockTemplate() { return getPrisma().blockTemplate; },
    get planAnalysis() { return getPrisma().planAnalysis; },
    get blockFeedback() { return getPrisma().blockFeedback; },
    get weeklyPlan() { return getPrisma().weeklyPlan; },
    get dailySession() { return getPrisma().dailySession; },
    get weeklyFeedback() { return getPrisma().weeklyFeedback; },
    get dailyFeedback() { return getPrisma().dailyFeedback; },
    get feedbackReminder() { return getPrisma().feedbackReminder; },
    get targetedFeedback() { return getPrisma().targetedFeedback; },
};
