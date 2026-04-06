import { prisma } from './prisma';

export const db = Object.assign(prisma, {
    swimmers: {
        findMany: (args?: any) => prisma.swimmer.findMany(args),
        findUnique: (args: any) => prisma.swimmer.findUnique(args),
        create: (data: any) => prisma.swimmer.create({ data }),
        update: (id: string, data: any) => prisma.swimmer.update({ where: { id }, data }),
        delete: (id: string) => prisma.swimmer.delete({ where: { id } })
    },
    plans: {
        findMany: (args?: any) => prisma.trainingPlan.findMany(args),
        create: (data: any) => prisma.trainingPlan.create({ data }),
        update: (id: string, data: any) => prisma.trainingPlan.update({ where: { id }, data }),
        delete: (id: string) => prisma.trainingPlan.delete({ where: { id } })
    },
    feedbacks: {
        findMany: (args?: any) => prisma.feedback.findMany(args),
        create: (data: any) => prisma.feedback.create({ data })
    },
    attendance: {
        findMany: (args?: any) => prisma.attendanceRecord.findMany(args),
        create: (data: any) => prisma.attendanceRecord.create({ data }),
        delete: (id: string) => prisma.attendanceRecord.delete({ where: { id } })
    },
    performances: {
        findMany: (args?: any) => prisma.performanceRecord.findMany(args),
        create: (data: any) => prisma.performanceRecord.create({ data }),
        update: (id: string, data: any) => prisma.performanceRecord.update({ where: { id }, data }),
        delete: (id: string) => prisma.performanceRecord.delete({ where: { id } })
    },
    weeklyPlans: {
        findMany: (args?: any) => prisma.weeklyPlan.findMany(args),
        findUnique: (args: any) => prisma.weeklyPlan.findUnique(args),
        create: (data: any) => prisma.weeklyPlan.create({ data }),
        update: (id: string, data: any) => prisma.weeklyPlan.update({ where: { id }, data }),
        delete: (id: string) => prisma.weeklyPlan.delete({ where: { id } })
    },
    dailySessions: {
        findMany: (args?: any) => prisma.dailySession.findMany(args),
        create: (args: any) => prisma.dailySession.create(args),
        update: (id: string, data: any) => prisma.dailySession.update({ where: { id }, data }),
        delete: (id: string) => prisma.dailySession.delete({ where: { id } })
    },
    weeklyFeedbacks: {
        findMany: (args?: any) => prisma.weeklyFeedback.findMany(args),
        findUnique: (args: any) => prisma.weeklyFeedback.findUnique(args),
        upsert: (args: any) => prisma.weeklyFeedback.upsert(args),
        create: (data: any) => prisma.weeklyFeedback.create({ data }),
        update: (id: string, data: any) => prisma.weeklyFeedback.update({ where: { id }, data })
    },
    dailyFeedbacks: {
        upsert: (args: any) => prisma.dailyFeedback.upsert(args)
    },
    feedbackReminders: {
        findMany: (args?: any) => prisma.feedbackReminder.findMany(args),
        create: (data: any) => prisma.feedbackReminder.create({ data })
    },
    targetedFeedbacks: {
        create: (data: any) => prisma.targetedFeedback.create({ data })
    }
});
