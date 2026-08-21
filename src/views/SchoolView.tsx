import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, GraduationCap, Activity } from 'lucide-react';
import { Card, CardHeader, Badge, Bar, Ring } from '@/components/ui';
import { supabase, type SchoolDepartment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const WEEK = [
  { day: 'Mon', value: 68 },
  { day: 'Tue', value: 74 },
  { day: 'Wed', value: 61 },
  { day: 'Thu', value: 82 },
  { day: 'Fri', value: 77 },
];

export function SchoolView() {
  const { user } = useAuth();
  const [depts, setDepts] = useState<SchoolDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('school_departments').select('*').eq('user_id', user.id).order('name').then(({ data }) => {
      setDepts((data ?? []) as SchoolDepartment[]);
      setLoading(false);
    });
  }, [user]);

  const totalStudents = depts.reduce((a, d) => a + d.student_count, 0);

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
          <Building2 className="h-6 w-6 text-ink-500" /> School-wide Insights
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">District-wide engagement, attendance, and performance trends</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 stagger">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-50 text-ink-600"><Users className="h-5 w-5" /></div>
            <Badge tone="blue">12 schools</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">{totalStudents.toLocaleString()}</div>
          <div className="text-[12px] text-neutral-500">Students enrolled</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success-500/10 text-success-500"><TrendingUp className="h-5 w-5" /></div>
            <Badge tone="green">+4.2%</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">94.2%</div>
          <div className="text-[12px] text-neutral-500">Avg attendance</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-500/10 text-accent-500"><Activity className="h-5 w-5" /></div>
            <Badge tone="green">+6%</Badge>
          </div>
          <div className="mt-4 text-3xl font-semibold text-neutral-800">78%</div>
          <div className="text-[12px] text-neutral-500">Avg engagement</div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <Ring value={88} size={72} stroke={7} color="var(--color-accent-500)" sublabel="graduation" />
          <div>
            <div className="text-2xl font-semibold text-neutral-800">88%</div>
            <div className="text-[12px] text-neutral-500">On-track rate</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 stagger">
        <Card>
          <CardHeader title="Department performance" subtitle="Average score by subject" icon={<GraduationCap className="h-5 w-5" />} />
          <div className="space-y-3 px-6 pb-6">
            {depts.map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-24 truncate text-[12px] font-medium text-neutral-600">{d.name}</span>
                <div className="flex-1"><Bar value={d.avg_score} color="var(--color-ink-500)" /></div>
                <span className="w-8 text-right text-[12px] font-semibold text-neutral-700">{d.avg_score}</span>
                <Badge tone={d.trend.startsWith('+') ? 'green' : d.trend.startsWith('-') ? 'red' : 'neutral'}>{d.trend}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Engagement trend" subtitle="School-wide weekly average" icon={<Activity className="h-5 w-5" />} />
          <div className="px-6 pb-6">
            <div className="relative h-52">
              <svg viewBox="0 0 300 180" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-ink-500)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-ink-500)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = WEEK.map((d, i) => `${(i / (WEEK.length - 1)) * 300},${180 - (d.value / 100) * 160}`);
                  const line = pts.join(' ');
                  const area = `0,180 ${line} 300,180`;
                  return (
                    <>
                      <polygon points={area} fill="url(#area)" />
                      <polyline points={line} fill="none" stroke="var(--color-ink-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {WEEK.map((d, i) => (
                        <circle key={i} cx={(i / (WEEK.length - 1)) * 300} cy={180 - (d.value / 100) * 160} r="4" fill="white" stroke="var(--color-ink-500)" strokeWidth="2.5" />
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div className="mt-2 flex justify-around">
                {WEEK.map((d) => (
                  <div key={d.day} className="text-center">
                    <div className="text-[11px] font-medium text-neutral-600">{d.day}</div>
                    <div className="text-[11px] font-semibold text-neutral-800">{d.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="School leaderboard" subtitle="Top performing schools this term" icon={<Building2 className="h-5 w-5" />} />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Oakridge Elementary', score: 91, change: '+5' },
            { name: 'Maple Grove Middle', score: 87, change: '+3' },
            { name: 'Sunset Valley Academy', score: 84, change: '+2' },
            { name: 'Brookfield Prep', score: 82, change: '+1' },
            { name: 'Cedar Park School', score: 79, change: '0' },
            { name: 'Riverside Day School', score: 76, change: '-1' },
          ].map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white/50 p-4 transition-smooth hover:border-ink-200 hover:bg-ink-50/40">
              <span className={`grid h-8 w-8 place-items-center rounded-xl text-[12px] font-semibold ${i < 3 ? 'bg-ink-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-neutral-800">{s.name}</div>
                <div className="text-[11px] text-neutral-500">Engagement {s.score}%</div>
              </div>
              <Badge tone={s.change.startsWith('+') ? 'green' : s.change.startsWith('-') ? 'red' : 'neutral'}>{s.change}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
