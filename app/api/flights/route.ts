import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';
import { withMiddleware } from '@/lib/withMiddleware';
import { validateFlight } from '@/lib/validate';
import type { Flight } from '@/types';

export const GET = withMiddleware(async () => {
  const flights = readFlights();
  return NextResponse.json(flights);
});

export const POST = withMiddleware(async (req) => {
  const body: unknown = await req.json();
  const validation = validateFlight(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const flight: Flight = {
    ...(body as Omit<Flight, 'id'>),
    id: crypto.randomUUID(),
  };

  const flights = readFlights();
  flights.push(flight);
  writeFlights(flights);
  return NextResponse.json(flight, { status: 201 });
});
