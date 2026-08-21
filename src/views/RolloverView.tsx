import { useState } from 'react';
import { CalendarClock, AlertTriangle, Check, RefreshCw, Archive } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function RolloverView() {
  const { org, refreshProfile } = useAuth();
  const [newYear, setNewYear] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextYear = (() => {
    if (!org?.current_year) return '';
    const start = parseInt(org.current_year.split('-')[0]);
    return `${start + 1}-${start + 2}`;
  })();

  const doRollover = async () => {
    setRolling(true);
    setError(null);
    const year = newYear || nextYear;
    const { error } = await supabase.rpc('rollover_year', { new_year: year });
    setRolling(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setConfirming(false);
      refreshProfile();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
          <CalendarClock className="h-6 w-6 text-ink-500" /> Yearly Rollover
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">Archive the current year and reset everything for the new school year</p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-r from-warning-500/10 to-transparent px-6 py-4">
          <AlertTriangle className="h-5 w-5 text-warning-500" />
          <div className="flex-1 text-[13px] text-neutral-600">
            <span className="font-semibold text-neutral-800">This is a major operation.</span> Rollover permanently deletes all classroom data (students, readings, quizzes, messages, whiteboards, seating) and deactivates all teachers. This cannot be undone.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 stagger">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-50 text-ink-600"><CalendarClock className="h-5 w-5" /></div>
            <Badge tone="blue">Current</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{org?.current_year ?? '—'}</div>
          <div className="text-[12px] text-neutral-500">Current school year</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success-500/10 text-success-500"><Archive className="h-5 w-5" /></div>
            <Badge tone="green">New</Badge>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">New school year</label>
            <input value={newYear || nextYear} onChange={(e) => setNewYear(e.target.value)} placeholder="2026-2027" className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[14px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="What gets reset" subtitle="Everything below will be permanently cleared" icon={<AlertTriangle className="h-5 w-5" />} />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
          {[
            { label: 'Student rosters', desc: 'All students and their metrics' },
            { label: 'Noise & emotion readings', desc: 'All recorded sensor data' },
            { label: 'Quizzes & questions', desc: 'All generated quiz content' },
            { label: 'Parent messages', desc: 'All communication history' },
            { label: 'Whiteboard canvases', desc: 'All saved drawings' },
            { label: 'Seating arrangements', desc: 'All saved layouts' },
            { label: 'Teacher activation', desc: 'All teachers deactivated for reassignment' },
            { label: 'School year label', desc: 'Updated to the new year' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-neutral-200/60 bg-white/50 p-3">
              <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-error-500/10 text-error-500"><AlertTriangle className="h-3.5 w-3.5" /></div>
              <div>
                <div className="text-[13px] font-medium text-neutral-800">{item.label}</div>
                <div className="text-[11px] text-neutral-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {done && (
        <Card className="animate-fade-up p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success-500/10 text-success-500"><Check className="h-6 w-6" /></div>
            <div>
              <div className="text-[15px] font-semibold text-neutral-800">Rollover complete!</div>
              <div className="text-[13px] text-neutral-500">Your school is now set to {newYear || nextYear}. Reactivate teachers and add new students to begin the new year.</div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-error-500/10 px-5 py-4 text-[13px] text-error-500">
          <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex justify-center">
        {confirming ? (
          <div className="flex gap-3">
            <button onClick={doRollover} disabled={rolling} className="flex items-center gap-2 rounded-xl bg-error-500 px-6 py-3 text-[14px] font-semibold text-white transition-smooth hover:bg-error-500/90 disabled:opacity-60">
              {rolling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {rolling ? 'Rolling over…' : 'Yes, proceed with rollover'}
            </button>
            <button onClick={() => setConfirming(false)} className="rounded-xl border border-neutral-200 px-6 py-3 text-[14px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-warning-500 to-error-500 px-8 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-warning-500/25 transition-smooth hover:shadow-xl">
            <CalendarClock className="h-5 w-5" /> Start yearly rollover
          </button>
        )}
      </div>
    </div>
  );
}
