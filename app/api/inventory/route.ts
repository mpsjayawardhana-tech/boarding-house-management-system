import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppState from '@/models/AppState';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const appStateDoc = await AppState.findOne();
    const actualState = appStateDoc.state?.state || appStateDoc.state;
    if (!appStateDoc || !actualState) {
      return NextResponse.json({ inventoryItems: [], inventoryCycles: {} });
    }

    const inventoryItems = actualState.inventoryItems || [];
    const inventoryCycles = actualState.inventoryCycles || {};

    return NextResponse.json({ inventoryItems, inventoryCycles });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
