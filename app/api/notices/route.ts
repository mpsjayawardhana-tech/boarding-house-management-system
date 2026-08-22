import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notice from '@/models/Notice';

export async function GET() {
  try {
    await dbConnect();
    const notices = await Notice.find().sort({ createdAt: -1 });
    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const notice = await request.json();
    await dbConnect();
    const createdNotice = await Notice.create(notice);
    return NextResponse.json({ success: true, notice: createdNotice });
  } catch (error) {
    console.error("Failed to create notice:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isDone } = await request.json();
    await dbConnect();
    const updatedNotice = await Notice.findOneAndUpdate({ id }, { isDone }, { new: true });
    return NextResponse.json({ success: true, notice: updatedNotice });
  } catch (error) {
    console.error("Failed to update notice:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    
    await dbConnect();
    await Notice.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notice:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
