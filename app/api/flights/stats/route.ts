import { NextResponse } from 'next/server';
import { readFlights } from '@/lib/flights';
import { withMiddleware } from '@/lib/withMiddleware';
import type { FlightStatus } from '@/types';

export const GET = withMiddleware(async () => {
  const flights = readFlights();

  const stats = flights.reduce<Record<FlightStatus, number>>(
    (acc, flight) => {
      acc[flight.status] = (acc[flight.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<FlightStatus, number>,
  );

  return NextResponse.json(stats);
});
