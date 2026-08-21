import { useState, useEffect } from 'react';
import { UserCog, Plus, Trash2, Mail, BookOpen, RefreshCw, Check, X } from 'lucide-react';
import { Card, CardHeader, Badge, Avatar } from '@/components/ui';
import { supabase, type Teacher } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function TeachersView() {
  const { profile, org } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!profile?.org_id) return;
    const { data } = await supabase.from('teachers').select('*').eq('org_id', profile.org_id).order('name');
    setTeachers((data ?? []) as Teacher[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile?.org_id]);

  const addTeacher = async () => {
    if (!profile?.org_id) return;
    setError(null);
    setAdding(true);
    const { error } = await supabase.from('teachers').insert({
      org_id: profile.org_id,
      name: newName,
      email: newEmail,
      subject: newSubject || 'General',
      grade: newGrade,
      room: newRoom,
      active: true,
    });
    if (error) setError(error.message);
    else {
      setNewName(''); setNewEmail(''); setNewSubject(''); setNewGrade(''); setNewRoom('');
      setShowAdd(false);
      load();
    }
    setAdding(false);
  };

  const toggleActive = async (t: Teacher) => {
    await supabase.from('teachers').update({ active: !t.active }).eq('id', t.id);
    load();
  };

  const removeTeacher = async (id: string) => {
    await supabase.from('teachers').delete().eq('id', id);
    load();
  };

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading teachers…</div>;

  const activeCount = teachers.filter((t) => t.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
            <UserCog className="h-6 w-6 text-ink-500" /> Teacher Management
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">{org?.name} · {activeCount} active teachers · Year {org?.current_year}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 rounded-xl bg-ink-500 px-4 py-2.5 text-[13px] font-medium text-white transition-smooth hover:bg-ink-600">
          <Plus className="h-4 w-4" /> Add teacher
        </button>
      </div>

      {showAdd && (
        <Card className="animate-fade-up">
          <CardHeader title="Add a new teacher" subtitle="They'll appear in your organization's roster" icon={<Plus className="h-5 w-5" />} />
          <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">Full name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Smith" className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="jsmith@school.edu" className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">Subject</label>
              <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Mathematics" className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">Grade</label>
              <input value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="Grade 5" className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">Room</label>
              <input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="Room 12" className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={addTeacher} disabled={adding || !newName || !newEmail} className="flex items-center gap-2 rounded-xl bg-ink-500 px-4 py-2.5 text-[13px] font-medium text-white transition-smooth hover:bg-ink-600 disabled:opacity-60">
                {adding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Add
              </button>
              <button onClick={() => setShowAdd(false)} className="rounded-xl border border-neutral-200 px-4 py-2.5 text-[13px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {error && <div className="mx-6 mb-4 rounded-xl bg-error-500/10 px-4 py-3 text-[13px] text-error-500">{error}</div>}
        </Card>
      )}

      <Card>
        <CardHeader title="Your teachers" subtitle="Manage faculty across your organization" icon={<BookOpen className="h-5 w-5" />} action={<Badge tone="blue">{teachers.length} total</Badge>} />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.length === 0 && <div className="col-span-full px-3 py-8 text-center text-[13px] text-neutral-400">No teachers yet. Click "Add teacher" to create your first.</div>}
          {teachers.map((t) => (
            <div key={t.id} className={`rounded-2xl border p-4 transition-smooth ${t.active ? 'border-neutral-200/60 bg-white/50' : 'border-neutral-200/40 bg-neutral-50/50 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar initials={t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)} />
                  <div>
                    <div className="text-[13px] font-semibold text-neutral-800">{t.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Mail className="h-3 w-3" /> {t.email}</div>
                  </div>
                </div>
                <button onClick={() => removeTeacher(t.id)} className="rounded-lg p-1 text-neutral-300 transition-smooth hover:bg-neutral-100 hover:text-error-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="blue">{t.subject}</Badge>
                {t.grade && <Badge tone="neutral">{t.grade}</Badge>}
                {t.room && <Badge tone="neutral">{t.room}</Badge>}
                <Badge tone={t.active ? 'green' : 'red'}>{t.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <button onClick={() => toggleActive(t)} className="mt-3 w-full rounded-xl border border-neutral-200 py-2 text-[12px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50">
                {t.active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
