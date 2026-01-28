import { Swimmer, TrainingPlan } from "@/types";

export const MOCK_SWIMMERS: Swimmer[] = [
    { id: "s1", name: "Alex Phelps", group: "Advanced", status: "Active", readiness: 95 },
    { id: "s2", name: "Sarah Sjostrom", group: "Advanced", status: "Active", readiness: 88 },
    { id: "s3", name: "Katie Ledecky", group: "Intermediate", status: "Resting", readiness: 60 },
    { id: "s4", name: "Caeleb Dressel", group: "Junior", status: "Active", readiness: 90 },
];

export const MOCK_PLAN: TrainingPlan = {
    id: "p1",
    date: new Date().toISOString().split('T')[0],
    group: "Advanced",
    status: "Draft",
    focus: "Threshold",
    totalDistance: 4500,
    coachNotes: "Focus on maintaining stroke rate during the main set.",
    items: [
        {
            id: "i1", order: 1, distance: 800, stroke: "Choice",
            description: "Warm up mixed", intensity: "Low", equipment: []
        },
        {
            id: "i2", order: 2, distance: 400, stroke: "IM",
            description: "4x100 IM Drill/Swim by 25", intensity: "Moderate", equipment: ["Fins"]
        },
        {
            id: "i3", order: 3, distance: 3000, stroke: "Free",
            description: "30x100 Free @ 1:20 Hold Best Average", intensity: "High", equipment: ["Paddles", "Pullbuoy"]
        },
        {
            id: "i4", order: 4, distance: 300, stroke: "Choice",
            description: "Warm down", intensity: "Low", equipment: []
        },
    ],
};
