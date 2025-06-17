import { NextResponse } from 'next/server';
 
export async function POST(req: Request) {
  const body = await req.json();
  // For now, just return the received data and a dummy message
  return NextResponse.json({ message: 'Test run received', received: body });
} 