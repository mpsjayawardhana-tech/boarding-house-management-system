import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppState from '@/models/AppState';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    await dbConnect();
    const appStateDoc = await AppState.findOne();
    if (!appStateDoc || !appStateDoc.state || !appStateDoc.state.users) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const users = appStateDoc.state.users;
    const user = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (user.status === 'pending_approval') {
      return NextResponse.json({ error: 'Your account is pending admin approval' }, { status: 403 });
    }

    // Generate tokens
    const accessToken = await signToken({ userId: user.id, role: user.role }, '15m');
    const refreshToken = await signToken({ userId: user.id }, '7d');

    // Set refresh token in httpOnly cookie
    cookies().set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, accessToken, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
