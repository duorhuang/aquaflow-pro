import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach, hashPassword } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const swimmers = await prisma.swimmer.findMany({
            orderBy: { name: 'asc' }
        });
        // Strip password for non-coach
        const safe = (swimmers || []).map((s: any) => {
            const { password, ...rest } = s;
            return rest;
        });
        return NextResponse.json(safe, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const hashedPassword = data.password ? await hashPassword(String(data.password)) : undefined;

        const swimmer = await prisma.swimmer.create({
            data: {
                name: String(data.name),
                group: String(data.group),
                username: String(data.username),
                password: hashedPassword || '',
                status: data.status || 'Active',
                readiness: Number(data.readiness) || 100,
                xp: Number(data.xp) || 0,
                level: Number(data.level) || 1
            }
        });
        return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const updateData: any = {
            name: data.name,
            group: data.group,
            username: data.username,
            status: data.status,
            readiness: data.readiness !== undefined ? Number(data.readiness) : undefined,
            xp: data.xp !== undefined ? Number(data.xp) : undefined,
            level: data.level !== undefined ? Number(data.level) : undefined
        };
        // Only hash if this looks like a new/plaintext password (no colon separators from our hash format)
        if (data.password && !String(data.password).includes(':')) {
            updateData.password = await hashPassword(String(data.password));
        }

        const swimmer = await prisma.swimmer.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.swimmer.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
