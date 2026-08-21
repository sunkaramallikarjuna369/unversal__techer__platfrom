import { useEffect, useState } from 'react';
import { Activity, Brain, Volume2, Users, TrendingUp, Radio, CheckCircle2, AlertTriangle, Mic } from 'lucide-react';
import { Card, CardHeader, Ring, Bar, Badge, Avatar } from '@/components/ui';
import { useStudents, EMOTION_COLORS, ATTENTION_LABEL } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-success-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
      </span>
      LIVE
    </span>
  );
}

export function DashboardView() {
  const { user } = useAuth();
  const { students, loading } = useStudents();
  const [noise, setNoise] = useState(0);
  const [noiseActive, setNoiseActive] = useState(false);

  useEffect(() => {
    supabase.from('noise_readings').select('db_level,created_at').eq('user_id', user?.id ?? '').order('created_at', { ascending: false }).limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        setNoise(data[0].db_level);
        setNoiseActive(true);
      }
    });
  }, [user]);

  const engagement = students.length ? Math.round(students.reduce((a, s) => a + s.engagement, 0) / students.length) : 0;
  const attentionStudents = students.filter((s) => s.attention !== 'green').slice(0, 5);
  const emotionDist = students.reduce<Record<string, number>>((acc, s) => {
    acc[s.emotion] = (acc[s.emotion] ?? 0) + 1;
    return acc;
  }, {});
  const attendance = students.length ? Math.round((students.filter((s) => s.emotion !== 'absent').length / students.length) * 100) : 0;

  if (loading) {
    return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading your classroom…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Live Classroom</h1>
          <p className="mt-1 text-[13px] text-neutral-500">Grade 5 · Room 12 · {students.length} students in roster</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveDot />
          <Badge tone="blue">Period 3 · 11:20 AM</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 stagger">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-50 text-ink-600"><Activity className="h-5 w-5" /></div>
            <Badge tone="green"><TrendingUp className="h-3 w-3" /> Live</Badge>
          </div>
          <div className="mt-4 flex items-end gap-4">
            <Ring value={engagement} size={92} stroke={8} sublabel="engagement" />
            <div className="pb-2">
              <div className="text-[12px] text-neutral-500">Class avg</div>
              <div className="text-lg font-semibold text-neutral-800">{engagement}%</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success-500/10 text-success-500"><Brain className="h-5 w-5" /></div>
            <Badge tone="green">Opt-in</Badge>
          </div>
          <div className="mt-4 space-y-2.5">
            {Object.entries(emotionDist).slice(0, 4).map(([emo, count]) => (
              <div key={emo} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: EMOTION_COLORS[emo] }} />
                <span className="flex-1 text-[12px] capitalize text-neutral-600">{emo}</span>
                <span className="text-[12px] font-semibold text-neutral-700">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-warning-500/15 text-warning-500"><Volume2 className="h-5 w-5" /></div>
            <Badge tone={noise > 70 ? 'red' : noise > 55 ? 'amber' : 'green'}>{noiseActive ? (noise > 70 ? 'Loud' : noise > 55 ? 'Moderate' : 'Calm') : 'Off'}</Badge>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold tracking-tight text-neutral-800">{noiseActive ? noise : '--'}<span className="text-base text-neutral-400"> dB</span></div>
            <div className="mt-1 text-[12px] text-neutral-500">{noiseActive ? 'Last reading from mic' : 'Open Noise Monitor to record'}</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-500/10 text-accent-500"><Users className="h-5 w-5" /></div>
            <Badge tone="blue">{students.filter((s) => s.emotion !== 'absent').length}/{students.length}</Badge>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold tracking-tight text-neutral-800">{attendance}<span className="text-base text-neutral-400">%</span></div>
            <div className="mt-1 text-[12px] text-neutral-500">Attendance today</div>
            <div className="mt-3"><Bar value={attendance} color="var(--color-accent-500)" /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <Card className="lg:col-span-2">
          <CardHeader title="Students needing attention" subtitle="AI-flagged from engagement, emotion & participation signals" icon={<AlertTriangle className="h-5 w-5" />} action={<Badge tone="red">{attentionStudents.length} flagged</Badge>} />
          <div className="space-y-1 px-4 pb-4">
            {attentionStudents.length === 0 && <div className="px-3 py-8 text-center text-[13px] text-neutral-400">All students are on track!</div>}
            {attentionStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-smooth hover:bg-neutral-50">
                <Avatar initials={s.initials} tone={s.attention === 'red' ? 'red' : 'amber'} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-neutral-800">{s.name}</div>
                  <div className="text-[11px] text-neutral-500 capitalize">{s.emotion} · {ATTENTION_LABEL[s.attention]}</div>
                </div>
                <div className="hidden w-28 sm:block"><Bar value={s.engagement} color={s.attention === 'red' ? 'var(--color-error-500)' : 'var(--color-warning-500)'} /></div>
                <div className="w-10 text-right text-[13px] font-semibold text-neutral-700">{s.engagement}%</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick actions" subtitle="Common classroom tools" icon={<Radio className="h-5 w-5" />} />
          <div className="grid grid-cols-2 gap-3 px-5 pb-5">
            {['Start quiz', 'Take attendance', 'Send announcement', 'Open whiteboard', 'Log incident', 'Start timer'].map((a) => (
              <button key={a} className="group rounded-2xl border border-neutral-200/70 bg-white/50 p-4 text-left transition-smooth hover:border-ink-300 hover:bg-ink-50/50 hover:shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-neutral-300 transition-smooth group-hover:text-ink-500" />
                <div className="mt-2 text-[12px] font-medium text-neutral-700">{a}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
