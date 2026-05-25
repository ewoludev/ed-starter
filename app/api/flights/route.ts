import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';
import { withMiddleware } from '@/lib/withMiddleware';
import type { Flight } from '@/types';

export const GET = withMiddleware(async () => {
  const flights = readFlights();
  return NextResponse.json(flights);
});

export const POST = withMiddleware(async (req) => {
  const flight = (await req.json()) as Flight;
  const flights = readFlights();
  flights.push(flight);
  writeFlights(flights);
  return NextResponse.json(flight, { status: 201 });
});
