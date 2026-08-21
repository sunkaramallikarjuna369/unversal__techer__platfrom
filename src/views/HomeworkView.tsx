import { BookOpenCheck, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, Badge, Bar, Avatar } from '@/components/ui';
import { useStudents } from '@/lib/hooks';

const WEEK = [
  { day: 'Mon', assigned: 28, completed: 24 },
  { day: 'Tue', assigned: 30, completed: 27 },
  { day: 'Wed', assigned: 26, completed: 19 },
  { day: 'Thu', assigned: 32, completed: 30 },
  { day: 'Fri', assigned: 24, completed: 22 },
];

export function HomeworkView() {
  const { students, loading } = useStudents();

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading…</div>;

  const sorted = [...students].sort((a, b) => a.homework - b.homework);
  const avg = students.length ? Math.round(students.reduce((a, s) => a + s.homework, 0) / students.length) : 0;
  const totalAssigned = WEEK.reduce((a, d) => a + d.assigned, 0);
  const totalCompleted = WEEK.reduce((a, d) => a + d.completed, 0);
  const rate = Math.round((totalCompleted / totalAssigned) * 100);
  const lagging = sorted.filter((s) => s.homework < 65).slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
          <BookOpenCheck className="h-6 w-6 text-ink-500" /> Homework Analytics
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">Completion rates, trends, and students falling behind</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 stagger">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success-500/10 text-success-500"><CheckCircle2 className="h-5 w-5" /></div>
            <Badge tone="green"><TrendingUp className="h-3 w-3" /> +3%</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{rate}%</div>
          <div className="text-[12px] text-neutral-500">Completion rate this week</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-50 text-ink-600"><BookOpenCheck className="h-5 w-5" /></div>
            <Badge tone="blue">{totalAssigned}</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{totalCompleted}/{totalAssigned}</div>
          <div className="text-[12px] text-neutral-500">Assignments completed</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-warning-500/15 text-warning-500"><Clock className="h-5 w-5" /></div>
            <Badge tone="red"><TrendingDown className="h-3 w-3" /> -2%</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{lagging.length}</div>
          <div className="text-[12px] text-neutral-500">Students below 65%</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 stagger">
        <Card>
          <CardHeader title="Weekly completion" subtitle="Assigned vs completed" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="px-6 pb-6">
            <div className="flex h-52 items-end justify-around gap-4">
              {WEEK.map((d, i) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end gap-1">
                    <div className="flex-1 rounded-t-lg bg-ink-200 transition-smooth" style={{ height: `${(d.assigned / 35) * 100}%`, animation: `fade-up 0.6s ${i * 0.08}s both` }} />
                    <div className="flex-1 rounded-t-lg bg-ink-500 transition-smooth" style={{ height: `${(d.completed / 35) * 100}%`, animation: `fade-up 0.6s ${i * 0.08 + 0.1}s both` }} />
                  </div>
                  <div className="text-[11px] font-medium text-neutral-600">{d.day}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-5">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-ink-200" /><span className="text-[11px] text-neutral-500">Assigned</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-ink-500" /><span className="text-[11px] text-neutral-500">Completed</span></div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Falling behind" subtitle="Below 65% completion" icon={<Clock className="h-5 w-5" />} action={<Badge tone="red">{lagging.length}</Badge>} />
          <div className="space-y-2 px-4 pb-4">
            {lagging.length === 0 && <div className="px-3 py-6 text-center text-[13px] text-neutral-400">Everyone is keeping up!</div>}
            {lagging.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-smooth hover:bg-neutral-50">
                <Avatar initials={s.initials} tone="red" />
                <div className="flex-1"><div className="text-[13px] font-medium text-neutral-800">{s.name}</div><div className="text-[11px] text-neutral-500">{s.homework}% complete</div></div>
                <div className="w-20"><Bar value={s.homework} color="var(--color-error-500)" /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
