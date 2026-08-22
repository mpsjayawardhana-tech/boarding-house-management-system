import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppState from '@/models/AppState';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const appStateDoc = await AppState.findOne();
    if (!appStateDoc || !appStateDoc.state) {
      return NextResponse.json({ inventoryItems: [], inventoryCycles: {} });
    }

    const inventoryItems = appStateDoc.state.inventoryItems || [];
    const inventoryCycles = appStateDoc.state.inventoryCycles || {};

    return NextResponse.json({ inventoryItems, inventoryCycles });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
