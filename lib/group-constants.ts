/** Shared group level constants for the entire app */
import { GroupLevel } from "@/types";

export const GROUP_LEVELS: GroupLevel[] = ["Junior", "Intermediate", "Advanced", "External"];

export const GROUP_LEVEL_ORDER = ["All", ...GROUP_LEVELS] as const;

export const GROUP_LABELS: Record<string, string> = {
    All: "全部",
    Junior: "初级组",
    Intermediate: "中级组",
    Advanced: "高级组",
    External: "校外组",
};
