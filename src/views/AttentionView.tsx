import { Sparkles, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardHeader, Badge, Avatar } from '@/components/ui';
import { useStudents, ATTENTION_LABEL } from '@/lib/hooks';
import type { Student } from '@/lib/supabase';

interface Insight {
  student: Student;
  reasons: string[];
  suggestion: string;
  priority: 'high' | 'medium';
}

export function AttentionView() {
  const { students, loading } = useStudents();

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading…</div>;

  const flagged = students.filter((s) => s.attention !== 'green');
  const insights: Insight[] = flagged.map((s) => {
    const reasons: string[] = [];
    if (s.engagement < 40) reasons.push(`Engagement critically low at ${s.engagement}%`);
    else if (s.engagement < 60) reasons.push(`Engagement dropped to ${s.engagement}%`);
    if (s.emotion === 'distracted') reasons.push('Detected "distracted" emotion for several minutes');
    if (s.emotion === 'confused') reasons.push('Showing confusion signals on current topic');
    if (s.participation < 35) reasons.push(`No participation in last questions (${s.participation}%)`);
    if (s.homework < 60) reasons.push('Homework completion trending down');

    let suggestion = 'Try a direct, low-stakes question to re-engage.';
    if (s.emotion === 'confused') suggestion = `Offer a 1:1 check-in or pair ${s.name.split(' ')[0]} with a peer for the next exercise.`;
    if (s.emotion === 'distracted') suggestion = `Move ${s.name.split(' ')[0]} closer to the front during the next activity.`;

    return { student: s, reasons, suggestion, priority: s.attention === 'red' ? 'high' as const : 'medium' as const };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
            <Sparkles className="h-6 w-6 text-ink-500" /> AI Attention
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">Smart suggestions for students who need a nudge right now</p>
        </div>
        <Badge tone="blue"><Sparkles className="h-3 w-3" /> Updated just now</Badge>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-r from-ink-500/5 to-transparent px-6 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink-500 text-white"><Sparkles className="h-4 w-4" /></div>
          <div className="flex-1 text-[13px] text-neutral-600">
            <span className="font-semibold text-neutral-800">AI summary.</span> {insights.length} students show declining signals this period. {insights.filter((i) => i.priority === 'high').length} high-priority, {insights.filter((i) => i.priority === 'medium').length} medium.
          </div>
        </div>
      </Card>

      {insights.length === 0 && (
        <Card className="p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-success-500" />
          <div className="mt-3 text-[15px] font-medium text-neutral-700">All students are on track</div>
          <div className="mt-1 text-[13px] text-neutral-400">No attention flags detected this period.</div>
        </Card>
      )}

      <div className="space-y-4 stagger">
        {insights.map((ins) => (
          <Card key={ins.student.id} className="overflow-hidden">
            <div className="flex flex-col gap-0 lg:flex-row">
              <div className={`flex items-center gap-3 p-5 lg:w-64 lg:border-r lg:border-neutral-200/60 ${ins.priority === 'high' ? 'bg-error-500/5' : 'bg-warning-500/5'}`}>
                <Avatar initials={ins.student.initials} tone={ins.priority === 'high' ? 'red' : 'amber'} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-neutral-800">{ins.student.name}</div>
                  <Badge tone={ins.priority === 'high' ? 'red' : 'amber'}>
                    <AlertTriangle className="h-3 w-3" /> {ATTENTION_LABEL[ins.student.attention]}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Signals detected</div>
                <ul className="mt-2 space-y-1.5">
                  {ins.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-[13px] text-neutral-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300" /> {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-2xl bg-ink-50/60 p-3.5">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Suggested action</div>
                      <div className="mt-0.5 text-[13px] text-neutral-700">{ins.suggestion}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-xl bg-ink-500 px-3.5 py-2 text-[12px] font-medium text-white transition-smooth hover:bg-ink-600">
                    Apply suggestion <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded-xl border border-neutral-200 px-3.5 py-2 text-[12px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50">Dismiss</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
