import { NextRequest, NextResponse } from 'next/server';

// This route is no longer needed, but we'll keep it as a placeholder
export async function GET(req: NextRequest) {
  return new NextResponse(null, {
    status: 204
  });
}