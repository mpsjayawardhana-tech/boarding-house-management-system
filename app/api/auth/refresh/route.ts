import { NextResponse } from 'next/server';
import { signToken, verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import AppState from '@/models/AppState';

export async function POST(request: Request) {
  try {
    const refreshToken = cookies().get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
    }

    const payload = await verifyToken(refreshToken);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Optional: Validate if user still exists in AppState
    await dbConnect();
    const appStateDoc = await AppState.findOne();
    const actualState = appStateDoc?.state?.state || appStateDoc?.state;
    const users = actualState?.users || [];
    const user = users.find((u: any) => u.id === payload.userId);

    if (!user || user.status !== 'active' && user.status !== 'pending_approval') {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 403 });
    }

    // Issue a new access token
    const newAccessToken = await signToken({ userId: user.id, role: user.role }, '15m');

    return NextResponse.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
