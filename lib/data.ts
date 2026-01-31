import { Swimmer, TrainingPlan, TrainingBlock, BlockTemplate } from "@/types";

// Helper for local date string
const getLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

export const MOCK_SWIMMERS: Swimmer[] = [
    { id: "s1", name: "Doody", group: "Advanced", status: "Active", readiness: 95, username: "doody", password: "123" },
    { id: "s2", name: "James", group: "Advanced", status: "Resting", readiness: 90, username: "james", password: "123" },
    { id: "s3", name: "Cherry", group: "Advanced", status: "Active", readiness: 88, username: "cherry", password: "123" },
    { id: "s4", name: "Amber", group: "Intermediate", status: "Resting", readiness: 60, username: "amber", password: "123" },
];

const BASE_BLOCKS: TrainingBlock[] = [
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
];

export const MOCK_PLANS: TrainingPlan[] = [
    {
        id: "p_today",
        date: getLocalISOString(today),
        group: "Advanced",
        status: "Published",
        focus: "Threshold",
        totalDistance: 4500,
        coachNotes: "Today's focus is on maintaining stroke rate during the main set.",
        blocks: [...BASE_BLOCKS],
    },
    {
        id: "p_yesterday",
        date: getLocalISOString(yesterday),
        group: "Advanced",
        status: "Published",
        focus: "Aerobic Capacity",
        totalDistance: 5000,
        coachNotes: "Good job on the endurance set.",
        blocks: [
            {
                id: "b1_y", type: "Warmup", rounds: 1, items: [
                    { id: "1y", repeats: 1, distance: 300, stroke: "Free", description: "Easy swim", intensity: "Low", equipment: [] }
                ]
            },
            {
                id: "b2_y", type: "Main Set", rounds: 1, items: [
                    { id: "2y", repeats: 5, distance: 400, stroke: "Free", description: "Aerobic maintenance", intensity: "Moderate", equipment: [], interval: "5:30" }
                ]
            }
        ]
    },
    {
        id: "p_2days_ago",
        date: getLocalISOString(twoDaysAgo),
        group: "Advanced",
        status: "Published",
        focus: "Sprint",
        totalDistance: 3000,
        coachNotes: "Keep the intensity high!",
        blocks: [
            {
                id: "b1_2", type: "Warmup", rounds: 1, items: [
                    { id: "1_2", repeats: 1, distance: 400, stroke: "Choice", description: "Warmup", intensity: "Low", equipment: [] }
                ]
            },
            {
                id: "b2_2", type: "Main Set", rounds: 1, items: [
                    { id: "2_2", repeats: 16, distance: 25, stroke: "Fly", description: "Max Sprint", intensity: "RacePace", equipment: ["Fins"], interval: "0:45" }
                ]
            }
        ]
    },
    {
        id: "p_tutorial",
        date: "2026-01-01",
        group: "Advanced",
        status: "Published",
        focus: "示例训练 (新手引导)",
        totalDistance: 2500,
        coachNotes: "👋 欢迎使用 AquaFlow Pro! 这是一个示例计划，帮助您了解系统如何工作。\n\n您可以在这里写下当天的训练重点、注意事项或对队员的鼓励。\n\n点击右上角的「编辑」按钮可以修改此计划，或者点击「新建计划」开始您的第一次创作！",
        blocks: [
            {
                id: "b_tut_1", type: "Warmup", rounds: 1, note: "热身环节", items: [
                    { id: "i_tut_1", repeats: 1, distance: 400, stroke: "Choice", description: "混合泳热身: 游/腿/划/游", intensity: "Low", equipment: [] },
                    { id: "i_tut_2", repeats: 4, distance: 50, stroke: "IM", description: "分解练习: 25分解 + 25配合", intensity: "Moderate", equipment: ["Fins"] }
                ]
            },
            {
                id: "b_tut_2", type: "Main Set", rounds: 1, note: "主项：耐力", items: [
                    { id: "i_tut_3", repeats: 10, distance: 100, stroke: "Free", description: "有氧耐力游，保持划次", intensity: "Moderate", equipment: ["Paddles", "Pullbuoy"], interval: "1:45" },
                    { id: "i_tut_4", repeats: 8, distance: 50, stroke: "Back", description: "仰泳冲刺", intensity: "High", equipment: ["Fins"], interval: "1:00" }
                ]
            },
            {
                id: "b_tut_3", type: "Cool Down", rounds: 1, items: [
                    { id: "i_tut_5", repeats: 1, distance: 200, stroke: "Choice", description: "放松游，感受水感", intensity: "Low", equipment: [] }
                ]
            }
        ]
    }
];

// ... MOCK_PLANS

export const DEFAULT_TEMPLATES: BlockTemplate[] = [
    {
        templateId: "t1",
        id: "temp_b1",
        name: "Standard Warmup",
        category: "Warmup",
        type: "Warmup",
        rounds: 1,
        items: [
            { id: "1", repeats: 1, distance: 400, stroke: "Choice", description: "Swim/Kick/Pull/Swim", intensity: "Low", equipment: [] },
            { id: "2", repeats: 4, distance: 50, stroke: "IM", description: "Drill/Swim by 25", intensity: "Moderate", equipment: ["Fins"] }
        ]
    },
    {
        templateId: "t2",
        id: "temp_b2",
        name: "Aerobic Maintenance",
        category: "Main Set",
        type: "Main Set",
        rounds: 3,
        items: [
            { id: "3", repeats: 4, distance: 100, stroke: "Free", description: "Pace holding", intensity: "Moderate", interval: "1:30", equipment: [] },
            { id: "4", repeats: 1, distance: 50, stroke: "Back", description: "Active recovery", intensity: "Low", equipment: [] }
        ]
    },
    {
        templateId: "t3",
        id: "temp_b3",
        name: "Sprint 25s",
        category: "Main Set",
        type: "Main Set",
        rounds: 1,
        items: [
            { id: "5", repeats: 16, distance: 25, stroke: "Choice", description: "Max Effort!", intensity: "RacePace", interval: "0:45", equipment: ["Fins"] }
        ]
    }
];
