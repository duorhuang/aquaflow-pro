export type GroupLevel = "Junior" | "Intermediate" | "Advanced";

export interface Swimmer {
    id: string;
    name: string;
    group: GroupLevel;
    status: "Active" | "Injured" | "Resting";
    readiness: number; // 0-100, calculated from RPE
    username?: string;
    password?: string;
    // Gamification
    xp?: number;
    level?: number;
    currentStreak?: number;
    lastCheckIn?: string; // YYYY-MM-DD
    // Data Profile (WeChat Sync)
    mainStroke?: "Free" | "Back" | "Breast" | "Fly" | "IM";
    bestTimes?: Record<string, string>; // e.g. "50Free": "25.5"
    injuries?: string[]; // ["Shoulder", "Knee"]
    lastProfileUpdate?: string; // ISO Date of last data confirmation
}

// Sub-types for TrainingPlan
export type Equipment = "Fins" | "Paddles" | "Snorkel" | "Kickboard" | "Pullbuoy";

export interface PlanSegment {
    distance: number;
    type: "Swim" | "Kick" | "Drill";
    description?: string;
}

export interface PlanItem {
    id: string;
    repeats: number;
    distance: number;
    stroke: "Free" | "Back" | "Breast" | "Fly" | "IM" | "Choice";
    intensity: "Low" | "Moderate" | "High" | "RacePace";
    description: string;
    equipment: Equipment[];
    segments?: PlanSegment[];
    intervalMode?: "Interval" | "Rest";
    interval?: string;
}

export interface TrainingBlock {
    id: string;
    type: "Warmup" | "Pre-Set" | "Main Set" | "Drill Set" | "Cool Down";
    rounds: number;
    items: PlanItem[];
    note?: string;
}

export interface TrainingPlan {
    id: string;
    date: string;
    group: GroupLevel;
    blocks: TrainingBlock[];
    totalDistance: number;
    focus: string;
    status: "Draft" | "Published" | "Finalized";
    coachNotes?: string;
    targetedNotes?: Record<string, string>;
    isStarred?: boolean; // Archived if false & > 14 days
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

export interface AttendanceRecord {
    id: string;
    date: string; // YYYY-MM-DD
    swimmerId: string;
    status: "Present";
    timestamp: string; // ISO
}
