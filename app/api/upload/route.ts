import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { requireCoach } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

// POST /api/upload — Upload file and return URL
// In production (Cloudflare): uploads to R2 bucket
// In dev (Node.js): returns base64 data URL as fallback
export async function POST(request: NextRequest) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        const isVideo = fileType.startsWith('video/');

        if (!isImage && !isVideo) {
            return NextResponse.json({ error: 'Only images and videos are allowed' }, { status: 400 });
        }

        const ext = fileType.split('/')[1] || 'bin';
        const timestamp = Date.now();
        const key = `uploads/${timestamp}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Try to use Cloudflare R2 via getCloudflareContext
        try {
            const { getCloudflareContext } = await import('@opennextjs/cloudflare');
            const cfContext = getCloudflareContext();
            const bucket = (cfContext.env as any).UPLOADS;

            if (bucket && typeof bucket.put === 'function') {
                const buffer = Buffer.from(await file.arrayBuffer());
                await bucket.put(key, buffer, {
                    httpMetadata: { contentType: fileType },
                });

                const publicUrl = `https://uploads.aquaflow.dev/${key}`;
                return NextResponse.json({ url: publicUrl, key });
            }
        } catch {
            // Not in Cloudflare environment
        }

        // Fallback for dev: return base64 data URL
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${fileType};base64,${base64}`;
        return NextResponse.json({ url: dataUrl, key, dev: true });
    });
}
