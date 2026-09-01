import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(): Promise<NextResponse<{ ok: boolean; database: number }>> {
  await connectToDatabase();
  return NextResponse.json({ ok: true, database: mongoose.connection.readyState });
}
