import { NextResponse } from 'next/server';
import { resetToSeed } from '@/lib/flights';
import { withMiddleware } from '@/lib/withMiddleware';

export const POST = withMiddleware(async () => {
  const flights = resetToSeed();
  return NextResponse.json(flights);
});
