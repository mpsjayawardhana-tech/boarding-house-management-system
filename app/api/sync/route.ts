import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppState from '@/models/AppState';

export async function GET() {
  try {
    await dbConnect();
    let appState = await AppState.findOne();
    
    if (!appState) {
      return NextResponse.json({ state: null });
    }
    
    return NextResponse.json({ state: appState.state });
  } catch (error) {
    console.error("Failed to fetch state:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { state } = await request.json();
    await dbConnect();

    // We use a single document for the whole app for this rapid prototype
    let appState = await AppState.findOne();
    
    if (appState) {
      appState.state = state;
      await appState.save();
    } else {
      appState = await AppState.create({ state });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save state:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
