export type GroupLevel = "Junior" | "Intermediate" | "Advanced";

export interface Swimmer {
    id: string;
    name: string;
    group: GroupLevel;
    status: "Active" | "Injured" | "Resting";
    readiness: number; // 0-100, calculated from RPE
}

export type Equipment = "Paddles" | "Fins" | "Snorkel" | "Kickboard" | "Pullbuoy";

export interface PlanItem {
    id: string;
    order: number;
    description: string; // e.g. "10 x 100 Free @ 1:30"
    distance: number; // in meters
    intensity: "Low" | "Moderate" | "High" | "Race Pace";
    equipment: Equipment[];
    stroke: "Free" | "Back" | "Breast" | "Fly" | "IM" | "Choice";
}

export interface TrainingPlan {
    id: string;
    date: string; // ISO YYYY-MM-DD
    group: GroupLevel;
    items: PlanItem[];
    totalDistance: number;
    focus: string; // e.g. "Aerobic Capacity"
    status: "Draft" | "Published" | "Finalized";
    coachNotes?: string;
}

export interface Feedback {
    id: string;
    swimmerId: string;
    planId: string;
    rpe: number; // 1-10
    soreness: number; // 1-10
    comments: string;
    timestamp: string;
}

// "Timeline" logic helper types
export type TimelinePhase = "T-24 (Preview)" | "T-12 (Feedback)" | "T-2 (Processing)" | "T-0 (Execution)";
