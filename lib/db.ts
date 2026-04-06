import { prisma } from './prisma';

// Helper to ensure findMany always receives an object
const wrapFindMany = (model: any) => (args?: any) => model.findMany(args || {});

export const db = {
    swimmers: {
        findMany: wrapFindMany(prisma.swimmer),
        findUnique: (args: any) => prisma.swimmer.findUnique(args),
        create: (data: any) => prisma.swimmer.create({ data }),
        update: (id: string, data: any) => prisma.swimmer.update({ where: { id }, data }),
        delete: (id: string) => prisma.swimmer.delete({ where: { id } })
    },
    plans: {
        findMany: wrapFindMany(prisma.trainingPlan),
        create: (data: any) => prisma.trainingPlan.create({ data }),
        update: (id: string, data: any) => prisma.trainingPlan.update({ where: { id }, data }),
        delete: (id: string) => prisma.trainingPlan.delete({ where: { id } })
    },
    feedbacks: {
        findMany: wrapFindMany(prisma.feedback),
        create: (data: any) => prisma.feedback.create({ data })
    },
    attendance: {
        findMany: wrapFindMany(prisma.attendanceRecord),
        create: (data: any) => prisma.attendanceRecord.create({ data }),
        delete: (id: string) => prisma.attendanceRecord.delete({ where: { id } })
    },
    performances: {
        findMany: wrapFindMany(prisma.performanceRecord),
        create: (data: any) => prisma.performanceRecord.create({ data }),
        update: (id: string, data: any) => prisma.performanceRecord.update({ where: { id }, data }),
        delete: (id: string) => prisma.performanceRecord.delete({ where: { id } })
    },
    weeklyPlans: {
        findMany: wrapFindMany(prisma.weeklyPlan),
        findUnique: (args: any) => prisma.weeklyPlan.findUnique(args),
        create: (data: any) => prisma.weeklyPlan.create({ data }),
        update: (id: string, data: any) => prisma.weeklyPlan.update({ where: { id }, data }),
        delete: (id: string) => prisma.weeklyPlan.delete({ where: { id } })
    },
    dailySessions: {
        findMany: wrapFindMany(prisma.dailySession),
        create: (data: any) => prisma.dailySession.create({ data }),
        update: (id: string, data: any) => prisma.dailySession.update({ where: { id }, data }),
        delete: (id: string) => prisma.dailySession.delete({ where: { id } })
    },
    weeklyFeedbacks: {
        findMany: wrapFindMany(prisma.weeklyFeedback),
        findUnique: (args: any) => prisma.weeklyFeedback.findUnique(args),
        upsert: (args: any) => prisma.weeklyFeedback.upsert(args),
        create: (data: any) => prisma.weeklyFeedback.create({ data }),
        update: (id: string, data: any) => prisma.weeklyFeedback.update({ where: { id }, data })
    },
    dailyFeedbacks: {
        upsert: (args: any) => prisma.dailyFeedback.upsert(args)
    },
    feedbackReminders: {
        findMany: wrapFindMany(prisma.feedbackReminder),
        create: (data: any) => prisma.feedbackReminder.create({ data })
    },
    targetedFeedbacks: {
        create: (data: any) => prisma.targetedFeedback.create({ data })
    }
};
