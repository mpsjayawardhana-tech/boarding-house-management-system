import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GPA from '@/models/GPA';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    await dbConnect();
    const gpaData = await GPA.findOne({ userId });
    
    if (!gpaData) {
      return NextResponse.json({ gpaData: null });
    }
    
    return NextResponse.json({ gpaData });
  } catch (error) {
    console.error("Failed to fetch GPA data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, activeSubjects, predictive } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    await dbConnect();
    
    let gpaData = await GPA.findOne({ userId });
    
    if (gpaData) {
      gpaData.activeSubjects = activeSubjects;
      gpaData.predictive = predictive;
      await gpaData.save();
    } else {
      gpaData = await GPA.create({ userId, activeSubjects, predictive });
    }

    return NextResponse.json({ success: true, gpaData });
  } catch (error) {
    console.error("Failed to save GPA data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
