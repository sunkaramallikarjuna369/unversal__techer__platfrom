import { useState, useEffect } from 'react';
import { Users, Shuffle, Move, Save } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useStudents, EMOTION_COLORS } from '@/lib/hooks';
import { supabase, type Student } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const ROWS = 4;
const COLS = 6;

export function SeatingView() {
  const { user, profile } = useAuth();
  const { students, loading, updateStudent } = useStudents();
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const grid: (Student | null)[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => students.find((s) => s.seat_row === r && s.seat_col === c) ?? null)
  );

  const swap = (r: number, c: number) => {
    if (!selected) { setSelected({ r, c }); return; }
    if (selected.r === r && selected.c === c) { setSelected(null); return; }
    const a = grid[selected.r][selected.c];
    const b = grid[r][c];
    if (a) updateStudent(a.id, { seat_row: r, seat_col: c });
    if (b) updateStudent(b.id, { seat_row: selected.r, seat_col: selected.c });
    setSelected(null);
  };

  const shuffle = () => {
    const positions = Array.from({ length: ROWS * COLS }, (_, i) => ({ r: Math.floor(i / COLS), c: i % COLS }));
    const shuffled = [...positions].sort(() => Math.random() - 0.5);
    students.forEach((s, i) => {
      const pos = shuffled[i];
      updateStudent(s.id, { seat_row: pos.r, seat_col: pos.c });
    });
  };

  const saveArrangement = async () => {
    if (!user) return;
    setSaving(true);
    const gridData = grid.map((row) => row.map((s) => s?.id ?? null));
    await supabase.from('seating_arrangements').insert({ user_id: user.id, org_id: profile?.org_id, teacher_id: profile?.teacher_id, name: 'Room 12', grid: gridData });
    setSaving(false);
  };

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
            <Users className="h-6 w-6 text-ink-500" /> Digital Seating Map
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">Tap two seats to swap · changes save to your roster automatically</p>
        </div>
        <div className="flex gap-2">
          <button onClick={shuffle} className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-[13px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50">
            <Shuffle className="h-4 w-4" /> Shuffle
          </button>
          <button onClick={saveArrangement} disabled={saving} className="flex items-center gap-2 rounded-xl bg-ink-500 px-4 py-2.5 text-[13px] font-medium text-white transition-smooth hover:bg-ink-600 disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save layout'}
          </button>
        </div>
      </div>

      <Card>
        <CardHeader title="Room 12 · Floor plan" subtitle="Tap a seat, then tap another to swap" icon={<Move className="h-5 w-5" />} action={<Badge tone="blue">{students.length} seated</Badge>} />
        <div className="px-6 pb-6">
          <div className="rounded-3xl bg-gradient-to-b from-neutral-50 to-white p-5">
            <div className="mb-4 flex justify-center">
              <div className="rounded-xl bg-neutral-800 px-10 py-2 text-[12px] font-medium text-white">WHITEBOARD</div>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {grid.map((row, r) =>
                row.map((s, c) => {
                  const isSel = selected?.r === r && selected?.c === c;
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => swap(r, c)}
                      className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 transition-smooth hover:scale-105 ${
                        isSel ? 'border-ink-500 bg-ink-50 ring-4 ring-ink-500/15' : s ? 'border-neutral-200/60 bg-white' : 'border-dashed border-neutral-200 bg-neutral-50/50'
                      }`}
                    >
                      {s ? (
                        <>
                          <div className="grid h-10 w-10 place-items-center rounded-full text-[12px] font-semibold text-white" style={{ background: EMOTION_COLORS[s.emotion] }}>{s.initials}</div>
                          <div className="mt-1 max-w-full truncate px-1 text-[10px] font-medium text-neutral-600">{s.name.split(' ')[0]}</div>
                        </>
                      ) : (
                        <div className="text-[20px] font-light text-neutral-300">+</div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="rounded-xl bg-neutral-200 px-10 py-2 text-[12px] font-medium text-neutral-500">DOOR</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
