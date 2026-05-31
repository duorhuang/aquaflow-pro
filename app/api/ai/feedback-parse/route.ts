import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text transcript required' }, { status: 400, headers: V12_FINGERPRINT });
        }

        // --- Robust Semantic Parser ---
        let rpe = 5;
        let soreness = 3;
        const normalized = text.toLowerCase();

        // 1. RPE Extraction (Chinese RPE terms: 疲劳, 累, 强度)
        const rpeRegexes = [
            /疲劳(?:度|感)?(?:是|为)?\s*(\d+)/,
            /累\s*(?:是|为|度)?\s*(\d+)/,
            /强度\s*(?:是|为)?\s*(\d+)/,
            /rpe\s*(?:是|为)?\s*(\d+)/
        ];

        for (const regex of rpeRegexes) {
            const match = normalized.match(regex);
            if (match && match[1]) {
                const val = parseInt(match[1]);
                if (val >= 1 && val <= 10) {
                    rpe = val;
                    break;
                }
            }
        }

        // Keyword-based fallback for RPE
        if (normalized.includes("非常累") || normalized.includes("极度疲劳") || normalized.includes("累趴了")) {
            rpe = 9;
        } else if (normalized.includes("挺累") || normalized.includes("比较疲劳")) {
            rpe = 7;
        } else if (normalized.includes("适中") || normalized.includes("普通强度")) {
            rpe = 5;
        } else if (normalized.includes("轻松") || normalized.includes("不怎么累")) {
            rpe = 2;
        }

        // 2. Soreness Extraction (Chinese Soreness terms: 酸痛, 疼, 痛)
        const sorenessRegexes = [
            /酸痛(?:度)?(?:是|为)?\s*(\d+)/,
            /痛(?:感)?(?:是|为|度)?\s*(\d+)/,
            /疼(?:度)?(?:是|为)?\s*(\d+)/
        ];

        for (const regex of sorenessRegexes) {
            const match = normalized.match(regex);
            if (match && match[1]) {
                const val = parseInt(match[1]);
                if (val >= 1 && val <= 10) {
                    soreness = val;
                    break;
                }
            }
        }

        // Keyword-based fallback for Soreness
        if (normalized.includes("极其酸痛") || normalized.includes("非常痛") || normalized.includes("痛得厉害")) {
            soreness = 8;
        } else if (normalized.includes("有点酸") || normalized.includes("轻微酸痛")) {
            soreness = 4;
        } else if (normalized.includes("无酸痛") || normalized.includes("一点不痛")) {
            soreness = 1;
        }

        return NextResponse.json({
            rpe,
            soreness,
            comments: text,
            success: true
        }, { headers: V12_FINGERPRINT });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Parsing failed' }, { status: 500, headers: V12_FINGERPRINT });
    }
}
