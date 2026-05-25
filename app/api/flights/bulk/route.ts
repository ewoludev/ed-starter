import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';
import { withMiddleware } from '@/lib/withMiddleware';
import { validateBulkPatch, validateBulkDelete } from '@/lib/validate';
import type { Flight, FlightStatus } from '@/types';

// PATCH /api/flights/bulk — update status for multiple flights at once
// Body: { ids: string[], status: FlightStatus, delayMinutes?: number }
export const PATCH = withMiddleware(async (req: Request) => {
  const body: unknown = await req.json();
  const validation = validateBulkPatch(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { ids, status, delayMinutes } = body as {
    ids: string[];
    status: FlightStatus;
    delayMinutes?: number;
  };

  const flights = readFlights();
  let updatedCount = 0;

  const updated = flights.map((f) => {
    if (!ids.includes(f.id)) return f;
    updatedCount++;
    const patch: Partial<Flight> = { status };
    if (status === 'Delayed' && delayMinutes !== undefined) {
      patch.delayMinutes = delayMinutes;
    } else if (status !== 'Delayed') {
      patch.delayMinutes = undefined;
    }
    return { ...f, ...patch };
  });

  writeFlights(updated);
  return NextResponse.json({ updatedCount });
});

// DELETE /api/flights/bulk — remove multiple flights at once
// Body: { ids: string[] }
export const DELETE = withMiddleware(async (req: Request) => {
  const body: unknown = await req.json();
  const validation = validateBulkDelete(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { ids } = body as { ids: string[] };
  const flights = readFlights();
  const filtered = flights.filter((f) => !ids.includes(f.id));
  writeFlights(filtered);
  return NextResponse.json({ deletedCount: flights.length - filtered.length });
});
