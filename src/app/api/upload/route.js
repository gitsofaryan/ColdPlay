import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Server-side uploads are disabled. Use in-memory parsing.' }, { status: 405 });
}
