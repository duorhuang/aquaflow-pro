export const getLocalDateISOString = (date = new Date()) => {
    // Manually format to YYYY-MM-DD using local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Parse a UTC timestamp string from the server into a Date object.
 * PostgreSQL returns ISO strings WITHOUT the 'Z' suffix when queried via raw SQL,
 * so new Date(str) treats them as local time — causing timezone offsets.
 * This function appends 'Z' to ensure the timestamp is always interpreted as UTC.
 */
export const parseUTCDate = (isoString: string): Date => {
    const normalized = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
    return new Date(normalized);
};

/**
 * Format a UTC timestamp as a relative time string in Chinese.
 * Uses parseUTCDate internally to ensure correct timezone handling.
 */
export const formatTimeAgo = (isoString: string): string => {
    const date = parseUTCDate(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin} 分钟前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小时前`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} 天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
};

/**
 * Format a UTC timestamp as a localized date string.
 * Uses parseUTCDate internally to ensure correct timezone handling.
 */
export const formatDateLocal = (isoString: string): string => {
    return parseUTCDate(isoString).toLocaleDateString('zh-CN');
};

/**
 * Format a UTC timestamp as a localized date with more detail.
 * Uses parseUTCDate internally to ensure correct timezone handling.
 */
export const formatDateDetailed = (isoString: string, options?: Intl.DateTimeFormatOptions): string => {
    return parseUTCDate(isoString).toLocaleDateString('zh-CN', options);
};
