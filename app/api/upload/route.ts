import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

/** Maximum upload size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME type prefixes and their required magic byte signatures */
const ALLOWED_TYPES: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png':  [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/gif':  [0x47, 0x49, 0x46, 0x38],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'video/mp4':  [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    'video/webm': [0x1A, 0x45, 0xDF, 0xA3],
};

/**
 * Sanitize a filename to prevent path traversal and injection attacks.
 * Returns a UUID-based name with the safe extension.
 */
function safeFilename(original: string, ext: string): string {
    // Only allow alphanumeric, dots, dashes, underscores in extension
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (!cleanExt) return 'unknown';
    // Use timestamp + random string to avoid collisions
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}.${cleanExt}`;
}

/**
 * Validate magic bytes at the start of the file buffer.
 * Returns the matched MIME type or null if no match.
 */
function validateMagicBytes(bytes: Uint8Array): string | null {
    for (const [mimeType, signature] of Object.entries(ALLOWED_TYPES)) {
        if (bytes.length < signature.length) continue;
        let match = true;
        for (let i = 0; i < signature.length; i++) {
            if (bytes[i] !== signature[i]) { match = false; break; }
        }
        if (match) return mimeType;
    }
    return null;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// POST /api/upload — Upload file and return URL
// In production (Cloudflare): uploads to R2 bucket
// In dev (Node.js): returns base64 data URL as fallback
export async function POST(request: NextRequest) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Size validation
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
        }

        // MIME type validation
        const declaredType = file.type;
        const allowedPrefixes = Object.keys(ALLOWED_TYPES).map(t => t.split('/')[0]);
        const isAllowedPrefix = allowedPrefixes.some(prefix => declaredType.startsWith(prefix));
        if (!isAllowedPrefix) {
            return NextResponse.json({ error: 'Only images and videos are allowed' }, { status: 400 });
        }

        // Magic byte validation
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const matchedType = validateMagicBytes(bytes);
        if (!matchedType) {
            return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 });
        }

        // Reconstruct ArrayBuffer with matched content-type
        const fileWithVerifiedType = new File([arrayBuffer], file.name, { type: matchedType });
        const ext = matchedType.split('/')[1] || 'bin';
        const key = `uploads/${safeFilename(file.name, ext)}`;

        // Try to use Cloudflare R2 via getCloudflareContext
        try {
            const { getCloudflareContext } = await import('@opennextjs/cloudflare');
            const cfContext = getCloudflareContext();
            const bucket = (cfContext.env as any).UPLOADS;

            if (bucket && typeof bucket.put === 'function') {
                await bucket.put(key, arrayBuffer, {
                    httpMetadata: { contentType: matchedType },
                });

                const publicUrl = `https://uploads.aquaflow.dev/${key}`;
                return NextResponse.json({ url: publicUrl, key });
            }
        } catch {
            // Not in Cloudflare environment
        }

        // Fallback for dev: return base64 data URL (edge-compatible, no Buffer)
        const base64 = arrayBufferToBase64(arrayBuffer);
        const dataUrl = `data:${matchedType};base64,${base64}`;
        return NextResponse.json({ url: dataUrl, key, dev: true });
    });
}
