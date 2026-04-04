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
    injuryNote?: string; // Current injury report text
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
    alternateStroke?: "Free" | "Back" | "Breast" | "Fly" | "IM" | "Choice"; // For stroke alternation (e.g. butterfly out, backstroke back)
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

export interface BlockTemplate extends TrainingBlock {
    templateId: string;
    name: string;
    category: "Warmup" | "Pre-Set" | "Main Set" | "Drill Set" | "Cool Down";
}

export interface TrainingPlan {
    id: string;
    date: string;
    startTime?: string; // HH:mm
    endTime?: string;   // HH:mm
    group: GroupLevel;
    blocks: TrainingBlock[];
    totalDistance: number;
    focus: string;
    status: "Draft" | "Published" | "Finalized";
    coachNotes?: string;
    targetedNotes?: Record<string, string>;
    imageUrl?: string; // URL of uploaded plan photo
    isStarred?: boolean; // Archived if false & > 14 days
    analysis?: PlanAnalysis;
}

export interface PlanAnalysis {
    id?: string;
    planId?: string;
    imageUrl: string;
    rawText?: string;
    structuredData?: any;
    coachInsights?: any; // JSON
    aiSuggestions?: any; // JSON
    createdAt?: string;
}

export interface Feedback {
    id: string;
    swimmerId: string;
    planId: string;
    date: string; // YYYY-MM-DD
    rpe: number; // 1-10 疲劳度
    soreness: number; // 1-10 酸痛度
    comments: string;
    timestamp: string;
    goodPoints?: string;        // 今日表现好的方面
    improvementAreas?: string;  // 需要改进的地方
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

export type SwimEvent =
    | "50Free" | "100Free" | "200Free" | "400Free" | "800Free" | "1500Free"
    | "50Back" | "100Back" | "200Back"
    | "50Breast" | "100Breast" | "200Breast"
    | "50Fly" | "100Fly" | "200Fly"
    | "200IM" | "400IM";

export interface PerformanceRecord {
    id: string;
    swimmerId: string;
    event: SwimEvent;
    time: string;      // "28.50" (seconds format)
    date: string;      // "2026-01-31"
    isPB: boolean;     // Is Personal Best
    improvement?: number; // Improvement in seconds (negative = faster)
    meetName?: string; // Optional meet/competition name
    notes?: string;    // Additional notes
}

// ==========================================
// Weekly Training & Feedback System
// ==========================================

export type StrokeType = "Free" | "Back" | "Breast" | "Fly" | "IM" | "Choice";

export interface WeeklyPlan {
    id: string;
    weekStart: string;    // Monday YYYY-MM-DD
    weekEnd: string;      // Sunday YYYY-MM-DD
    group: string;
    title?: string;
    coachNotes?: string;
    isPublished: boolean;
    sessions?: DailySession[];
    createdAt?: string;
    updatedAt?: string;
}

export interface DailySession {
    id: string;
    weeklyPlanId: string;
    label: string;        // "周三", "周六上午"
    date: string;         // YYYY-MM-DD
    imageData?: string;   // Base64 image
    imageType?: string;   // MIME type
    notes?: string;
    sortOrder: number;
    createdAt?: string;
}

export interface WeeklyFeedbackType {
    id: string;
    swimmerId: string;
    weeklyPlanId?: string;
    weekStart: string;    // Monday YYYY-MM-DD
    summary?: string;
    isSubmitted: boolean;
    submittedAt?: string;
    dailyFeedbacks?: DailyFeedbackEntry[];
    swimmer?: { id: string; name: string };
    createdAt?: string;
    updatedAt?: string;
}

export interface DailyFeedbackEntry {
    id: string;
    weeklyFeedbackId: string;
    date: string;
    rpe?: number;
    soreness?: number;
    reflection?: string;
    createdAt?: string;
}

export interface FeedbackReminder {
    id: string;
    message: string;
    targetSwimmerIds?: string[]; // null = entire team
    targetGroup?: string;
    periodStart: string;
    periodEnd: string;
    responses?: TargetedFeedbackType[];
    createdAt?: string;
}

export interface TargetedFeedbackType {
    id: string;
    reminderId: string;
    swimmerId: string;
    content: string;
    rpe?: number;
    soreness?: number;
    swimmer?: { id: string; name: string };
    createdAt?: string;
}
