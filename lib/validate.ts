import type { Flight, FlightStatus, Airline, Terminal } from '@/types';
import { ALL_STATUSES, ALL_AIRLINES, ALL_TERMINALS } from '@/types';

type ValidationResult = { ok: true } | { ok: false; error: string };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_IDS_PER_BULK = 100;

function checkString(value: unknown, field: string, maxLen: number): ValidationResult {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLen) {
    return { ok: false, error: `${field} must be a non-empty string (max ${maxLen} chars)` };
  }
  return { ok: true };
}

function checkEnum<T extends string>(value: unknown, field: string, allowed: T[]): ValidationResult {
  if (!allowed.includes(value as T)) {
    return { ok: false, error: `${field} must be one of: ${allowed.join(', ')}` };
  }
  return { ok: true };
}

function checkDelayMinutes(value: unknown): ValidationResult {
  if (value === undefined) return { ok: true };
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 999) {
    return { ok: false, error: 'delayMinutes must be an integer between 0 and 999' };
  }
  return { ok: true };
}

export function validateFlight(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const d = data as Record<string, unknown>;
  const checks: ValidationResult[] = [
    checkString(d.flightNumber, 'flightNumber', 20),
    checkEnum<Airline>(d.airline, 'airline', ALL_AIRLINES),
    checkString(d.destination, 'destination', 100),
    typeof d.departureTime !== 'string' || !TIME_RE.test(d.departureTime)
      ? { ok: false, error: 'departureTime must match HH:MM format' }
      : { ok: true },
    checkEnum<Terminal>(d.terminal, 'terminal', ALL_TERMINALS),
    checkString(d.gate, 'gate', 10),
    checkEnum<FlightStatus>(d.status, 'status', ALL_STATUSES),
    checkDelayMinutes(d.delayMinutes),
  ];

  const failed = checks.find((r) => !r.ok);
  return failed ?? { ok: true };
}

export function validateFlightPatch(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const d = data as Record<string, unknown>;

  if ('id' in d) return { ok: false, error: 'id cannot be changed via PATCH' };

  const checks: ValidationResult[] = [
    'flightNumber' in d ? checkString(d.flightNumber, 'flightNumber', 20) : { ok: true },
    'airline' in d ? checkEnum<Airline>(d.airline, 'airline', ALL_AIRLINES) : { ok: true },
    'destination' in d ? checkString(d.destination, 'destination', 100) : { ok: true },
    'departureTime' in d
      ? typeof d.departureTime !== 'string' || !TIME_RE.test(d.departureTime)
        ? { ok: false, error: 'departureTime must match HH:MM format' }
        : { ok: true }
      : { ok: true },
    'terminal' in d ? checkEnum<Terminal>(d.terminal, 'terminal', ALL_TERMINALS) : { ok: true },
    'gate' in d ? checkString(d.gate, 'gate', 10) : { ok: true },
    'status' in d ? checkEnum<FlightStatus>(d.status, 'status', ALL_STATUSES) : { ok: true },
    checkDelayMinutes(d.delayMinutes),
  ];

  const failed = checks.find((r) => !r.ok);
  return failed ?? { ok: true };
}

export function validateBulkPatch(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const d = data as Record<string, unknown>;

  if (
    !Array.isArray(d.ids) ||
    d.ids.length === 0 ||
    d.ids.length > MAX_IDS_PER_BULK ||
    !d.ids.every((id: unknown) => typeof id === 'string')
  ) {
    return { ok: false, error: `ids must be a non-empty string array (max ${MAX_IDS_PER_BULK})` };
  }

  const statusCheck = checkEnum<FlightStatus>(d.status, 'status', ALL_STATUSES);
  if (!statusCheck.ok) return statusCheck;

  return checkDelayMinutes(d.delayMinutes);
}

export function validateBulkDelete(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const d = data as Record<string, unknown>;

  if (
    !Array.isArray(d.ids) ||
    d.ids.length === 0 ||
    d.ids.length > MAX_IDS_PER_BULK ||
    !d.ids.every((id: unknown) => typeof id === 'string')
  ) {
    return { ok: false, error: `ids must be a non-empty string array (max ${MAX_IDS_PER_BULK})` };
  }

  return { ok: true };
}
