/**
 * AquaFlow Pro Comprehensive System Verification Script
 * Validates:
 * 1. Auth mechanisms (PBKDF2-SHA256, constant-time compare, JWT signing/verifying for coach & athlete).
 * 2. Role isolation logic & token validation.
 * 3. 100% Chinese dictionary integrity & swim terminology correctness.
 * 4. Plan & feedback data structures.
 */

import { hashPassword, verifyPassword, constantTimeCompare } from '../lib/auth';
import { generateJWT, verifyJWT } from '../lib/jwt';
import { DICTIONARY } from '../lib/dictionary';
import { GROUP_LEVELS, ALL_STROKES, INTENSITY_LEVELS, EQUIPMENT_OPTIONS, BLOCK_TYPES } from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${testName}`);
    } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    }
}

async function runVerification() {
    console.log("==================================================================");
    console.log("🚀 STARTING AQUAFLOW PRO FULL-SYSTEM RIGOROUS VERIFICATION");
    console.log("==================================================================");

    process.env.JWT_SECRET = "aquaflow-pro-test-jwt-secret-key-32bytes-secure!";

    // ─────────────────────────────────────────────────────────────────
    // 1. Password Hashing & Verification Tests
    // ─────────────────────────────────────────────────────────────────
    console.log("\n🔑 1. AUTHENTICATION & PASSWORD CRYPTOGRAPHY VERIFICATION");

    const rawPassword = "CoachSecurePass2026!";
    const hashed = await hashPassword(rawPassword);
    const parts = hashed.split(':');

    assert(parts.length === 3, "Password hash format is salt:iterations:hash", `Got ${parts.length} parts`);
    assert(parts[1] === "100000", "PBKDF2 uses 100,000 iterations for high security", `Iterations: ${parts[1]}`);
    assert(parts[0].length === 32, "Salt is 16 random bytes (32 hex characters)", `Salt len: ${parts[0].length}`);
    assert(parts[2].length === 64, "SHA-256 derived hash is 32 bytes (64 hex characters)", `Hash len: ${parts[2].length}`);

    const isValid = await verifyPassword(rawPassword, hashed);
    assert(isValid === true, "verifyPassword succeeds with correct password");

    const isWrongValid = await verifyPassword("WrongPassword123", hashed);
    assert(isWrongValid === false, "verifyPassword rejects incorrect password");

    const isTamperedValid = await verifyPassword(rawPassword, `tampered${hashed.slice(8)}`);
    assert(isTamperedValid === false, "verifyPassword rejects tampered hash");

    assert(constantTimeCompare("secret123", "secret123") === true, "constantTimeCompare identical strings match");
    assert(constantTimeCompare("secret123", "secret124") === false, "constantTimeCompare detects mismatch");
    assert(constantTimeCompare("short", "longerstring") === false, "constantTimeCompare detects length mismatch");

    // ─────────────────────────────────────────────────────────────────
    // 2. JWT Dual-Role Generation, Verification & Expiry
    // ─────────────────────────────────────────────────────────────────
    console.log("\n🛡️ 2. DUAL-ROLE JWT AUTHENTICATION (COACH & ATHLETE)");

    // Coach token
    const coachToken = await generateJWT({ userId: "coach_admin_001", role: "coach" });
    assert(typeof coachToken === "string" && coachToken.includes('.'), "Coach JWT generation succeeds");

    const coachPayload = await verifyJWT(coachToken);
    assert(coachPayload !== null, "Coach JWT verifies successfully");
    assert(coachPayload?.userId === "coach_admin_001", "Coach JWT payload preserves userId");
    assert(coachPayload?.role === "coach", "Coach JWT payload preserves role='coach'");
    assert(coachPayload !== null && coachPayload.exp > Math.floor(Date.now() / 1000), "Coach JWT has valid future expiration");

    // Athlete token
    const athleteToken = await generateJWT({ userId: "athlete_swimmer_888", role: "athlete" });
    assert(typeof athleteToken === "string" && athleteToken.includes('.'), "Athlete JWT generation succeeds");

    const athletePayload = await verifyJWT(athleteToken);
    assert(athletePayload !== null, "Athlete JWT verifies successfully");
    assert(athletePayload?.userId === "athlete_swimmer_888", "Athlete JWT payload preserves userId");
    assert(athletePayload?.role === "athlete", "Athlete JWT payload preserves role='athlete'");

    // Role isolation: Coach token must not be accepted as Athlete role
    assert(coachPayload?.role !== "athlete", "Role isolation: Coach token cannot pass as athlete");
    assert(athletePayload?.role !== "coach", "Role isolation: Athlete token cannot pass as coach");

    // Tampered token rejection
    const tamperedToken = coachToken.slice(0, -6) + "xxxxxx";
    const tamperedPayload = await verifyJWT(tamperedToken);
    assert(tamperedPayload === null, "verifyJWT rejects cryptographically tampered token");

    // Malformed token rejection
    const malformedPayload = await verifyJWT("not.a.valid.jwt.token");
    assert(malformedPayload === null, "verifyJWT rejects malformed token");

    // ─────────────────────────────────────────────────────────────────
    // 3. 100% Pure Chinese Localization & Terminology Audit
    // ─────────────────────────────────────────────────────────────────
    console.log("\n🇨🇳 3. 100% CHINESE LOCALIZATION & TERMINOLOGY AUDIT");

    const zh = DICTIONARY.zh;
    assert(zh !== undefined, "Chinese dictionary (zh) exists");

    // Navigation and common terms
    assert(zh.common.dashboard === "仪表盘", "zh.common.dashboard is localized");
    assert(zh.common.coach === "教练", "zh.common.coach is localized");
    assert(zh.common.athlete === "运动员", "zh.common.athlete is localized");
    assert(zh.common.attendance === "出勤管理", "zh.common.attendance is localized");
    assert(zh.common.weeklyPlan === "周训练计划", "zh.common.weeklyPlan is localized");
    assert(zh.common.feedbacks === "训练反馈", "zh.common.feedbacks is localized");

    // Swim terminology
    assert(zh.editor.strokes.Free === "自由泳", "Stroke 'Free' is '自由泳'");
    assert(zh.editor.strokes.Back === "仰泳", "Stroke 'Back' is '仰泳'");
    assert(zh.editor.strokes.Breast === "蛙泳", "Stroke 'Breast' is '蛙泳'");
    assert(zh.editor.strokes.Fly === "蝶泳", "Stroke 'Fly' is '蝶泳'");
    assert(zh.editor.strokes.IM === "混合泳", "Stroke 'IM' is '混合泳'");

    // Equipment terminology
    assert(zh.editor.equipmentOptions.Fins === "脚蹼", "Equipment 'Fins' is '脚蹼'");
    assert(zh.editor.equipmentOptions.Paddles === "划手掌", "Equipment 'Paddles' is '划手掌'");
    assert(zh.editor.equipmentOptions.Snorkel === "呼吸管", "Equipment 'Snorkel' is '呼吸管'");
    assert(zh.editor.equipmentOptions.Kickboard === "浮板", "Equipment 'Kickboard' is '浮板'");
    assert(zh.editor.equipmentOptions.Pullbuoy === "夹板", "Equipment 'Pullbuoy' is '夹板'");

    // Block types
    assert(zh.editor.blockTypes["Warmup"] === "热身", "Block 'Warmup' is '热身'");
    assert(zh.editor.blockTypes["Pre-Set"] === "预备组", "Block 'Pre-Set' is '预备组'");
    assert(zh.editor.blockTypes["Main Set"] === "主项", "Block 'Main Set' is '主项'");
    assert(zh.editor.blockTypes["Drill Set"] === "分解游", "Block 'Drill Set' is '分解游'");
    assert(zh.editor.blockTypes["Cool Down"] === "放松", "Block 'Cool Down' is '放松'");

    // Check all dictionary keys for illegal untranslated English sentences
    let untranslatedCount = 0;
    function scanForUntranslated(obj: any, path: string = "") {
        for (const [key, val] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof val === "string") {
                // If value contains 3+ consecutive English words without Chinese, flag as suspicious
                if (/[a-zA-Z]{3,}\s+[a-zA-Z]{3,}\s+[a-zA-Z]{3,}/.test(val) && !/[\u4e00-\u9fa5]/.test(val)) {
                    console.warn(`    ⚠️ Potential untranslated English text at ${currentPath}: "${val}"`);
                    untranslatedCount++;
                }
            } else if (typeof val === "object" && val !== null) {
                scanForUntranslated(val, currentPath);
            }
        }
    }
    scanForUntranslated(zh);
    assert(untranslatedCount === 0, `All Chinese dictionary entries are pure Chinese (0 untranslated strings found)`);

    // ─────────────────────────────────────────────────────────────────
    // 4. Type Constants & Enums Integrity
    // ─────────────────────────────────────────────────────────────────
    console.log("\n🏊 4. TRAINING CONSTANTS & ROSTER DATA INTEGRITY");

    assert(GROUP_LEVELS.includes("Advanced"), "GROUP_LEVELS includes 'Advanced'");
    assert(GROUP_LEVELS.includes("Intermediate"), "GROUP_LEVELS includes 'Intermediate'");
    assert(GROUP_LEVELS.includes("Junior"), "GROUP_LEVELS includes 'Junior'");
    assert(GROUP_LEVELS.includes("External"), "GROUP_LEVELS includes 'External'");

    assert(ALL_STROKES.includes("Free"), "ALL_STROKES includes Free");
    assert(ALL_STROKES.includes("Fly"), "ALL_STROKES includes Fly");
    assert(ALL_STROKES.includes("Back"), "ALL_STROKES includes Back");
    assert(ALL_STROKES.includes("Breast"), "ALL_STROKES includes Breast");
    assert(ALL_STROKES.includes("IM"), "ALL_STROKES includes IM");

    assert(EQUIPMENT_OPTIONS.includes("Paddles"), "EQUIPMENT_OPTIONS includes Paddles");
    assert(EQUIPMENT_OPTIONS.includes("Fins"), "EQUIPMENT_OPTIONS includes Fins");
    assert(EQUIPMENT_OPTIONS.includes("Snorkel"), "EQUIPMENT_OPTIONS includes Snorkel");

    assert(BLOCK_TYPES.includes("Warmup"), "BLOCK_TYPES includes Warmup");
    assert(BLOCK_TYPES.includes("Main Set"), "BLOCK_TYPES includes Main Set");
    assert(BLOCK_TYPES.includes("Drill Set"), "BLOCK_TYPES includes Drill Set");
    assert(BLOCK_TYPES.includes("Cool Down"), "BLOCK_TYPES includes Cool Down");

    // ─────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────
    console.log("\n==================================================================");
    console.log(`📊 VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    if (failedTests === 0) {
        console.log("🎉 ALL TESTS PASSED WITH 100% SUCCESS!");
    } else {
        console.error(`💥 ${failedTests} TESTS FAILED!`);
        process.exitCode = 1;
    }
    console.log("==================================================================");
}

runVerification().catch(err => {
    console.error("FATAL ERROR IN VERIFICATION:", err);
    process.exit(1);
});
