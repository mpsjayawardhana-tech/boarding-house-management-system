import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UndoStack from '@/models/UndoStack';

export async function GET() {
  try {
    await dbConnect();
    const stack = await UndoStack.findOne();
    return NextResponse.json({ snapshots: stack?.snapshots || [] });
  } catch (error) {
    console.error("Failed to fetch undo stack:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { snapshots } = await request.json();
    await dbConnect();
    
    // We only keep a single document for the undo stack
    let stack = await UndoStack.findOne();
    
    if (stack) {
      stack.snapshots = snapshots;
      await stack.save();
    } else {
      await UndoStack.create({ snapshots });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update undo stack:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
