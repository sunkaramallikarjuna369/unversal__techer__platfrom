import { BarChart3, TrendingUp, MessageCircle, Clock } from 'lucide-react';
import { Card, CardHeader, Badge, Bar, Avatar } from '@/components/ui';
import { useStudents } from '@/lib/hooks';

const WEEK = [
  { day: 'Mon', value: 68 },
  { day: 'Tue', value: 74 },
  { day: 'Wed', value: 61 },
  { day: 'Thu', value: 82 },
  { day: 'Fri', value: 77 },
];

export function ParticipationView() {
  const { students, loading } = useStudents();

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading…</div>;

  const sorted = [...students].sort((a, b) => b.participation - a.participation);
  const avg = students.length ? Math.round(students.reduce((a, s) => a + s.participation, 0) / students.length) : 0;
  const top = sorted.slice(0, 5);
  const low = sorted.filter((s) => s.participation < 45).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Participation Analytics</h1>
        <p className="mt-1 text-[13px] text-neutral-500">Who is contributing, who is quiet, and how it trends over time</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 stagger">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-50 text-ink-600"><BarChart3 className="h-5 w-5" /></div>
            <Badge tone="green"><TrendingUp className="h-3 w-3" /> +8%</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{avg}%</div>
          <div className="text-[12px] text-neutral-500">Class average this week</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success-500/10 text-success-500"><MessageCircle className="h-5 w-5" /></div>
            <Badge tone="blue">142</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">142</div>
          <div className="text-[12px] text-neutral-500">Contributions today</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-warning-500/15 text-warning-500"><Clock className="h-5 w-5" /></div>
            <Badge tone="amber">{low.length} quiet</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{low.length}</div>
          <div className="text-[12px] text-neutral-500">Students under 45% participation</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 stagger">
        <Card>
          <CardHeader title="Weekly trend" subtitle="Average daily participation rate" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="px-6 pb-6">
            <div className="flex h-52 items-end justify-around gap-3">
              {WEEK.map((d, i) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-ink-400 to-ink-500 transition-smooth" style={{ height: `${d.value}%`, animation: `fade-up 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both` }} />
                  </div>
                  <div className="text-[11px] font-medium text-neutral-600">{d.day}</div>
                  <div className="text-[11px] font-semibold text-neutral-800">{d.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top contributors" subtitle="Most active this week" icon={<MessageCircle className="h-5 w-5" />} />
          <div className="space-y-2 px-4 pb-4">
            {top.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-smooth hover:bg-neutral-50">
                <span className="w-5 text-center text-[13px] font-semibold text-neutral-400">{i + 1}</span>
                <Avatar initials={s.initials} />
                <div className="flex-1"><div className="text-[13px] font-medium text-neutral-800">{s.name}</div><div className="text-[11px] text-neutral-500">{s.participation} contributions</div></div>
                <div className="w-20"><Bar value={s.participation} color="var(--color-success-500)" /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Needs encouragement" subtitle="Lowest participation this week" icon={<Clock className="h-5 w-5" />} action={<Badge tone="red">{low.length} students</Badge>} />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
          {low.length === 0 && <div className="px-3 py-6 text-center text-[13px] text-neutral-400">Everyone is participating well!</div>}
          {low.map((s) => (
            <div key={s.id} className="rounded-2xl border border-neutral-200/60 bg-white/50 p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={s.initials} tone="red" />
                <div className="min-w-0"><div className="truncate text-[13px] font-medium text-neutral-800">{s.name}</div><div className="text-[11px] text-neutral-500">{s.participation}% participation</div></div>
              </div>
              <div className="mt-3"><Bar value={s.participation} color="var(--color-error-500)" /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
