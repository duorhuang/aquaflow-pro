import { Swimmer, TrainingPlan } from "@/types";

export const MOCK_SWIMMERS: Swimmer[] = [
    { id: "s1", name: "Doody", group: "Advanced", status: "Active", readiness: 95, username: "doody", password: "123" },
    { id: "s2", name: "James", group: "Advanced", status: "Resting", readiness: 90, username: "james", password: "123" },
    { id: "s3", name: "Cherry", group: "Advanced", status: "Active", readiness: 88, username: "cherry", password: "123" },
    { id: "s4", name: "Amber", group: "Intermediate", status: "Resting", readiness: 60, username: "amber", password: "123" },
];

export const MOCK_PLAN: TrainingPlan = {
    id: "p1",
    date: new Date().toISOString().split('T')[0],
    group: "Advanced",
    status: "Draft",
    focus: "Threshold",
    totalDistance: 4500,
    coachNotes: "Focus on maintaining stroke rate during the main set.",
    blocks: [
        {
            id: "b1", type: "Warmup", rounds: 1, items: [
                { id: "1", repeats: 1, distance: 400, stroke: "Choice", description: "Warmup: Swim/Kick/Pull/Swim", intensity: "Low", equipment: [] },
                { id: "2", repeats: 4, distance: 50, stroke: "IM", description: "Drill/Swim by 25", intensity: "Moderate", equipment: ["Fins"] }
            ]
        },
        {
            id: "b2", type: "Main Set", rounds: 1, items: [
                { id: "3", repeats: 10, distance: 100, stroke: "Free", description: "Threshold Pace @ 1:20", intensity: "High", equipment: ["Paddles", "Pullbuoy"], interval: "1:20" }
            ]
        },
        {
            id: "b3", type: "Cool Down", rounds: 1, items: [
                { id: "4", repeats: 1, distance: 200, stroke: "Choice", description: "Warm down", intensity: "Low", equipment: [] }
            ]
        }
    ],
};
