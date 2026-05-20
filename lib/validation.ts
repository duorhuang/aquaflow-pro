export interface ValidationErrors {
    [field: string]: string;
}

function required(value: string | undefined | null, field: string): string | null {
    if (!value || !String(value).trim()) return `${field} is required`;
    return null;
}

function minLength(value: string, len: number, field: string): string | null {
    if (value.length < len) return `${field} must be at least ${len} characters`;
    return null;
}

export function validateLogin(data: { username?: string; password?: string }): ValidationErrors {
    const errors: ValidationErrors = {};
    const u = required(data.username, "Username");
    if (u) errors.username = u;
    const p = required(data.password, "Password");
    if (p) errors.password = p;
    return errors;
}

export function validateSwimmer(data: { name?: string; username?: string; password?: string; group?: string }): ValidationErrors {
    const errors: ValidationErrors = {};
    const n = required(data.name, "Name");
    if (n) errors.name = n;
    const u = required(data.username, "Username");
    if (u) errors.username = u;
    const g = required(data.group, "Group");
    if (g) errors.group = g;
    // Password only required for new swimmers
    if (!data.password) {
        const p = required(data.password, "Password");
        if (p) errors.password = p;
    } else {
        const p = minLength(data.password, 6, "Password");
        if (p) errors.password = p;
    }
    return errors;
}

export function validateTrainingPlan(data: { date?: string; group?: string; blocks?: unknown[] }): ValidationErrors {
    const errors: ValidationErrors = {};
    const d = required(data.date, "Date");
    if (d) errors.date = d;
    const g = required(data.group, "Group");
    if (g) errors.group = g;
    if (!data.blocks || data.blocks.length === 0) errors.blocks = "At least one training block is required";
    return errors;
}

export function validatePerformance(data: { event?: string; time?: string; date?: string }): ValidationErrors {
    const errors: ValidationErrors = {};
    const e = required(data.event, "Event");
    if (e) errors.event = e;
    const t = required(data.time, "Time");
    if (t) errors.time = t;
    else if (data.time && !/^\d{1,2}:\d{2}\.\d{2}$|^\d{2}\.\d{2}$/.test(data.time)) {
        errors.time = "Time must be in format MM:SS.ss or SS.ss";
    }
    const d = required(data.date, "Date");
    if (d) errors.date = d;
    return errors;
}
