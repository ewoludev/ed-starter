'use client';

import { useEffect, useState } from 'react';
import { useFlightsStore } from '@/store/flightsStore';
import { StatusControl } from '@/components/admin/StatusControl';
import { FlightEditor } from '@/components/admin/FlightEditor';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import type { Flight, FlightStatus } from '@/types';

export default function AdminPage() {
  const { flights, setFlights, removeFlight, removeFlights, updateFlights, resetFlights } =
    useFlightsStore();
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetch('/api/flights')
      .then((r) => r.json())
      .then((data: Flight[]) => {
        setFlights(data);
        setLoading(false);
      });
  }, [setFlights]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds(
      selectedIds.size === flights.length ? new Set() : new Set(flights.map((f) => f.id)),
    );
  }

  async function handleBulkStatusChange(status: FlightStatus) {
    const ids = Array.from(selectedIds);
    setBulkLoading(true);
    await fetch('/api/flights/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    updateFlights(ids, { status });
    setSelectedIds(new Set());
    setBulkLoading(false);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (!confirm(`Delete ${ids.length} flight(s)?`)) return;
    setBulkLoading(true);
    await fetch('/api/flights/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    removeFlights(ids);
    setSelectedIds(new Set());
    setBulkLoading(false);
  }

  async function handleRemove(id: string) {
    await fetch(`/api/flights/${id}`, { method: 'DELETE' });
    removeFlight(id);
  }

  async function handleReset() {
    if (!confirm('Reset all flights to seed data?')) return;
    const res = await fetch('/api/flights/reset', { method: 'POST' });
    const data: Flight[] = await res.json();
    resetFlights(data);
    setSelectedIds(new Set());
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-board-bg flex items-center justify-center text-board-muted font-mono text-sm">
        Loading…
      </div>
    );
  }

  const allSelected = selectedIds.size === flights.length && flights.length > 0;
  const someSelected = selectedIds.size > 0;

  return (
    <div className={`min-h-screen bg-board-bg font-mono ${someSelected ? 'pb-16' : ''}`}>
      {/* Header */}
      <header className="bg-board-header border-b border-board-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-amber-400 uppercase">
            Admin Panel
          </h1>
          <p className="text-xs text-board-muted mt-0.5">
            <a href="/" className="hover:text-amber-400 transition-colors">
              ← Back to FIDS
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs border border-amber-700 text-amber-400 hover:bg-amber-900/30 px-4 py-2 rounded transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Flight'}
          </button>
          <button
            onClick={handleReset}
            className="text-xs border border-zinc-700 text-zinc-400 hover:bg-zinc-800 px-4 py-2 rounded transition-colors"
          >
            Reset to Seed
          </button>
        </div>
      </header>

      {/* Add flight form */}
      {showAddForm && (
        <div className="border-b border-board-border px-6 py-5 bg-zinc-900">
          <h2 className="text-xs text-amber-400 uppercase tracking-widest mb-4">New Flight</h2>
          <FlightEditor onAdded={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Flight list */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-board-muted uppercase tracking-widest">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="accent-amber-500 cursor-pointer"
            />
            {flights.length} flights total
          </label>
          {someSelected && (
            <span className="text-xs text-amber-400">{selectedIds.size} selected</span>
          )}
        </div>

        <div className="space-y-2">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className={`bg-board-row border border-board-border rounded px-4 py-3 transition-colors ${
                selectedIds.has(flight.id) ? 'border-amber-700/60 bg-amber-950/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(flight.id)}
                    onChange={() => toggleSelect(flight.id)}
                    className="accent-amber-500 cursor-pointer shrink-0"
                  />
                  <span className="font-bold text-amber-300 text-sm shrink-0">
                    {flight.flightNumber}
                  </span>
                  <span className="text-zinc-500 text-xs shrink-0">{flight.airline}</span>
                  <span className="text-board-text text-sm truncate">{flight.destination}</span>
                  <span className="text-amber-100 text-sm tabular-nums shrink-0">
                    {flight.departureTime}
                  </span>
                  <span className="text-zinc-500 text-xs shrink-0">
                    {flight.terminal} / {flight.gate}
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(flight.id)}
                  className="text-xs text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                  title="Remove flight"
                >
                  ✕
                </button>
              </div>

              <div className="mt-2">
                <StatusControl flight={flight} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {someSelected && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          loading={bulkLoading}
          onStatusChange={handleBulkStatusChange}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
        />
      )}
    </div>
  );
}
