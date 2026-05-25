import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';
import { withMiddleware } from '@/lib/withMiddleware';
import type { Flight } from '@/types';

export const GET = withMiddleware(async (_req, ctx) => {
  const { id } = await ctx!.params;
  const flights = readFlights();
  const flight = flights.find((f) => f.id === id);
  if (!flight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  return NextResponse.json(flight);
});

export const PATCH = withMiddleware(async (req, ctx) => {
  const { id } = await ctx!.params;
  const updates = (await req.json()) as Partial<Flight>;

  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });

  flights[index] = { ...flights[index], ...updates };
  writeFlights(flights);

  return NextResponse.json(flights[index]);
});

export const DELETE = withMiddleware(async (_req, ctx) => {
  const { id } = await ctx!.params;
  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });

  const updated = flights.filter((f) => f.id !== id);
  writeFlights(updated);

  return NextResponse.json({ success: true });
});
