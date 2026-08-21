import { useState, useEffect } from 'react';
import { FileQuestion, Sparkles, Plus, Trash2, Check, RefreshCw, Save } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { supabase, type Quiz, type QuizQuestion } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const QUIZ_TOPICS = [
  'Fractions & decimals', 'Photosynthesis', 'World War II timeline',
  "Newton's laws of motion", 'Shakespeare sonnets', 'Cell biology',
  'Algebra basics', 'The water cycle', 'Ancient Egypt',
];

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

const SAMPLE_QUIZ: QuizItem[] = [
  { id: 'q1', question: 'What is 1/2 + 1/4?', options: ['1/6', '2/6', '3/4', '1/8'], answer: 2 },
  { id: 'q2', question: 'Which fraction is equivalent to 0.75?', options: ['1/4', '3/4', '7/5', '5/8'], answer: 1 },
  { id: 'q3', question: 'Convert 3/10 to a decimal.', options: ['0.3', '0.03', '3.0', '0.13'], answer: 0 },
  { id: 'q4', question: 'Which is greater: 2/3 or 0.6?', options: ['2/3', '0.6', 'They are equal', 'Cannot compare'], answer: 0 },
  { id: 'q5', question: 'Simplify 6/8 to lowest terms.', options: ['3/4', '2/3', '6/8', '1/2'], answer: 0 },
];

export function QuizView() {
  const { user, profile } = useAuth();
  const [topic, setTopic] = useState(QUIZ_TOPICS[0]);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<QuizItem[]>(SAMPLE_QUIZ);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);
  const [saving, setSaving] = useState(false);

  const loadSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from('quizzes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    setSavedQuizzes((data ?? []) as Quiz[]);
  };

  useEffect(() => { loadSaved(); }, [user]);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setQuiz(SAMPLE_QUIZ.slice(0, count));
      setSelected({});
      setGenerating(false);
    }, 1200);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { data } = await supabase.from('quizzes').insert({ user_id: user.id, org_id: profile?.org_id, teacher_id: profile?.teacher_id, topic, difficulty, question_count: quiz.length }).select().single();
    if (data) {
      const rows = quiz.map((q) => ({ quiz_id: data.id, org_id: profile?.org_id, question: q.question, options: q.options, answer_index: q.answer }));
      await supabase.from('quiz_questions').insert(rows);
      loadSaved();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
          <FileQuestion className="h-6 w-6 text-ink-500" /> Instant Quiz Generator
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">Create a quiz in seconds — pick a topic, difficulty, and length</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <Card className="lg:col-span-1">
          <CardHeader title="Quiz setup" subtitle="Configure and generate" icon={<Sparkles className="h-5 w-5" />} />
          <div className="space-y-5 px-6 pb-6">
            <div>
              <label className="text-[12px] font-medium text-neutral-600">Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[13px] text-neutral-700 outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10">
                {QUIZ_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-neutral-600">Number of questions</label>
              <div className="mt-1.5 flex gap-2">
                {[3, 5, 10].map((n) => (
                  <button key={n} onClick={() => setCount(n)} className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-smooth ${count === n ? 'bg-ink-500 text-white' : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-neutral-600">Difficulty</label>
              <div className="mt-1.5 flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize transition-smooth ${difficulty === d ? 'bg-ink-500 text-white' : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>{d}</button>
                ))}
              </div>
            </div>
            <button onClick={generate} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ink-500 to-ink-600 py-3 text-[13px] font-semibold text-white shadow-lg shadow-ink-500/25 transition-smooth hover:shadow-xl hover:shadow-ink-500/30 disabled:opacity-60">
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? 'Generating…' : 'Generate quiz'}
            </button>
            <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-ink-50 py-2.5 text-[13px] font-medium text-ink-600 transition-smooth hover:bg-ink-100 disabled:opacity-60">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to library
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Generated quiz" subtitle={`${quiz.length} questions · ${topic} · ${difficulty}`} icon={<FileQuestion className="h-5 w-5" />} action={<Badge tone="blue">Auto-graded</Badge>} />
          <div className="space-y-4 px-5 pb-5">
            {quiz.map((q, qi) => (
              <div key={q.id} className="rounded-2xl border border-neutral-200/60 bg-white/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ink-50 text-[11px] font-semibold text-ink-600">{qi + 1}</span>
                    <div className="text-[14px] font-medium text-neutral-800">{q.question}</div>
                  </div>
                  <button className="rounded-lg p-1 text-neutral-300 transition-smooth hover:bg-neutral-100 hover:text-error-500"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const isSel = selected[q.id] === oi;
                    const isAns = q.answer === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setSelected((p) => ({ ...p, [q.id]: oi }))}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-smooth ${
                          isSel ? (isAns ? 'border-success-500 bg-success-500/10 text-success-500' : 'border-error-500 bg-error-500/10 text-error-500') : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${isSel ? (isAns ? 'border-success-500 bg-success-500 text-white' : 'border-error-500 bg-error-500 text-white') : 'border-neutral-300 text-neutral-400'}`}>
                          {isSel && isAns ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 py-3 text-[13px] font-medium text-neutral-400 transition-smooth hover:border-ink-300 hover:text-ink-500">
              <Plus className="h-4 w-4" /> Add question
            </button>
          </div>
        </Card>
      </div>

      {savedQuizzes.length > 0 && (
        <Card>
          <CardHeader title="Saved quizzes" subtitle="Your quiz library" icon={<Save className="h-5 w-5" />} action={<Badge tone="blue">{savedQuizzes.length} saved</Badge>} />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedQuizzes.map((q) => (
              <div key={q.id} className="rounded-2xl border border-neutral-200/60 bg-white/50 p-4 transition-smooth hover:border-ink-200 hover:bg-ink-50/40">
                <div className="text-[13px] font-medium text-neutral-800">{q.topic}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                  <span className="capitalize">{q.difficulty}</span> · {q.question_count} questions
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
