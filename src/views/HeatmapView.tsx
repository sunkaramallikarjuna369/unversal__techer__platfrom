import { useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useStudents, EMOTION_COLORS } from '@/lib/hooks';

const ROWS = 4;
const COLS = 6;

export function HeatmapView() {
  const { students, loading } = useStudents();
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const grid: (typeof students[number] | null)[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => students.find((s) => s.seat_row === r && s.seat_col === c) ?? null)
  );

  const colorFor = (v: number) => {
    if (v === 0) return 'rgba(148,163,184,0.08)';
    if (v >= 80) return 'rgba(16,185,129,0.85)';
    if (v >= 65) return 'rgba(6,182,212,0.7)';
    if (v >= 50) return 'rgba(245,158,11,0.65)';
    return 'rgba(239,68,68,0.7)';
  };

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading heatmap…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Engagement Heatmap</h1>
        <p className="mt-1 text-[13px] text-neutral-500">Real-time attention distribution across the classroom</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <Card className="lg:col-span-2">
          <CardHeader title="Classroom floor" subtitle="Each tile = one seat · color reflects live engagement" icon={<Activity className="h-5 w-5" />} action={<Badge tone="blue">{students.length} seats</Badge>} />
          <div className="px-6 pb-6">
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-neutral-50 px-4 py-2.5 text-[12px] text-neutral-500">
              <Info className="h-4 w-4 text-ink-400" />
              Hover a seat to see the student's live metrics.
            </div>
            <div className="rounded-3xl bg-gradient-to-b from-neutral-50 to-white p-4">
              <div className="mb-3 flex justify-center">
                <div className="rounded-xl bg-neutral-800 px-8 py-1.5 text-[11px] font-medium text-white">WHITEBOARD</div>
              </div>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                {grid.flatMap((row, r) =>
                  row.map((s, c) => (
                    <button
                      key={`${r}-${c}`}
                      onMouseEnter={() => setHover({ r, c })}
                      onMouseLeave={() => setHover(null)}
                      className="group relative aspect-square rounded-2xl border border-white/40 transition-smooth hover:scale-105"
                      style={{ background: colorFor(s ? s.engagement : 0) }}
                    >
                      {s && (
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="text-center">
                            <div className="text-[11px] font-semibold text-white drop-shadow">{s.initials}</div>
                            <div className="text-[9px] text-white/80">{s.engagement}%</div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="mt-3 flex justify-center">
                <div className="rounded-xl bg-neutral-200 px-8 py-1.5 text-[11px] font-medium text-neutral-500">DOOR</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-4">
              {[
                { l: 'Low', c: 'rgba(239,68,68,0.7)' },
                { l: 'Mid', c: 'rgba(245,158,11,0.65)' },
                { l: 'Good', c: 'rgba(6,182,212,0.7)' },
                { l: 'High', c: 'rgba(16,185,129,0.85)' },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md" style={{ background: x.c }} />
                  <span className="text-[11px] text-neutral-500">{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Seat detail" subtitle={hover ? 'Live snapshot' : 'Hover a seat'} icon={<Activity className="h-5 w-5" />} />
          <div className="px-6 pb-6">
            {(() => {
              if (!hover) return <div className="grid h-48 place-items-center text-[13px] text-neutral-400">Hover any seat on the floor</div>;
              const s = grid[hover.r][hover.c];
              if (!s) return <div className="grid h-48 place-items-center text-[13px] text-neutral-400">Empty seat</div>;
              return (
                <div className="animate-fade-up">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl text-[14px] font-semibold text-white" style={{ background: EMOTION_COLORS[s.emotion] }}>{s.initials}</div>
                    <div>
                      <div className="text-[14px] font-semibold text-neutral-800">{s.name}</div>
                      <div className="text-[12px] capitalize text-neutral-500">{s.emotion} · Row {hover.r + 1}, Seat {hover.c + 1}</div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[{ l: 'Engagement', v: s.engagement }, { l: 'Participation', v: s.participation }, { l: 'Homework', v: s.homework }].map((m) => (
                      <div key={m.l}>
                        <div className="flex justify-between text-[12px]"><span className="text-neutral-500">{m.l}</span><span className="font-semibold text-neutral-700">{m.v}%</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div className="h-full rounded-full bg-ink-500 transition-smooth" style={{ width: `${m.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
}
