import { useState } from 'react';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, Building2, User, UserCog, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { seedOrgData } from '@/lib/seed';

type Mode = 'home' | 'register' | 'principal' | 'teacher';

export function AuthView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === 'register') {
      const { data, error } = await signUp(email, password, displayName);
      if (error) { setError(error); setBusy(false); return; }
      if (!data.user) {
        setError('Your account could not be created. Please try again.');
        setBusy(false);
        return;
      }

      const { data: orgData, error: orgError } = await supabase.from('organizations').insert({
        name: orgName,
        address: orgAddress,
        created_by: data.user.id,
      }).select().maybeSingle();

      if (orgError || !orgData) {
        setError(orgError?.message ?? 'Your account was created, but the organization could not be set up. Please sign in and try again.');
        setBusy(false);
        return;
      }

      const { error: profileError } = await supabase.from('profiles').update({
        org_id: orgData.id,
        role: 'principal',
        display_name: displayName,
      }).eq('id', data.user.id);

      if (profileError) {
        setError(profileError.message);
        setBusy(false);
        return;
      }

      await seedOrgData(orgData.id, data.user.id);
      setBusy(false);
    } else if (mode === 'principal' || mode === 'teacher') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.includes('Invalid login credentials') ? 'Email or password is incorrect.' : error);
      }
      setBusy(false);
    }
  };

  if (mode === 'home') {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-sky-soft via-white to-sky-soft px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-ink-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg animate-fade-up">
          <div className="glass-strong rounded-3xl p-10 shadow-[0_20px_80px_-20px_rgba(31,51,192,0.25)]">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-ink-500 to-ink-700 text-white shadow-lg shadow-ink-500/30">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-neutral-800">Smart Classroom Universe</h1>
              <p className="mt-1.5 text-[14px] text-neutral-500">The intelligent platform for modern schools</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/60 p-5 text-left transition-smooth hover:border-ink-300 hover:bg-ink-50/50 hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink-500 text-white"><Building2 className="h-6 w-6" /></div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-neutral-800">Register your organization</div>
                  <div className="text-[12px] text-neutral-500">School heads create their school and become the principal</div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 transition-smooth group-hover:text-ink-500" />
              </button>

              <button
                onClick={() => { setMode('principal'); setError(null); }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/60 p-5 text-left transition-smooth hover:border-ink-300 hover:bg-ink-50/50 hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-ink-600 to-ink-800 text-white"><UserCog className="h-6 w-6" /></div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-neutral-800">Principal login</div>
                  <div className="text-[12px] text-neutral-500">Full access — manage teachers, view all classrooms, school-wide insights</div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 transition-smooth group-hover:text-ink-500" />
              </button>

              <button
                onClick={() => { setMode('teacher'); setError(null); }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/60 p-5 text-left transition-smooth hover:border-ink-300 hover:bg-ink-50/50 hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-ink-500 text-white"><BookOpen className="h-6 w-6" /></div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-neutral-800">Teacher login</div>
                  <div className="text-[12px] text-neutral-500">Access your classroom — engagement, quizzes, whiteboard, parents</div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 transition-smooth group-hover:text-ink-500" />
              </button>
            </div>

            <p className="mt-8 text-center text-[11px] text-neutral-400">
              By continuing you agree to protect student privacy and use data responsibly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isRegister = mode === 'register';
  const title = isRegister ? 'Register your school' : mode === 'principal' ? 'Principal login' : 'Teacher login';
  const subtitle = isRegister ? 'Create your organization and principal account' : mode === 'principal' ? 'Sign in to manage your school' : 'Sign in to your classroom';

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-sky-soft via-white to-sky-soft px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-ink-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="glass-strong rounded-3xl p-8 shadow-[0_20px_80px_-20px_rgba(31,51,192,0.25)]">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ink-500 to-ink-700 text-white shadow-lg shadow-ink-500/30">
              {isRegister ? <Building2 className="h-7 w-7" /> : mode === 'principal' ? <UserCog className="h-7 w-7" /> : <BookOpen className="h-7 w-7" />}
            </div>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-neutral-800">{title}</h1>
            <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <>
                <Field icon={<Building2 className="h-4 w-4" />} label="School / Organization name">
                  <input required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Oakridge Elementary School" className={inputCls} />
                </Field>
                <Field icon={<Building2 className="h-4 w-4" />} label="Address (optional)">
                  <input value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} placeholder="123 Education Lane" className={inputCls} />
                </Field>
                <Field icon={<User className="h-4 w-4" />} label="Your name (Principal)">
                  <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Dr. Julia Martinez" className={inputCls} />
                </Field>
              </>
            )}

            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="principal@school.edu" className={inputCls} />
            </Field>

            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
            </Field>

            {error && <div className="rounded-xl bg-error-500/10 px-4 py-3 text-[13px] text-error-500">{error}</div>}

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ink-500 to-ink-600 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-ink-500/25 transition-smooth hover:shadow-xl hover:shadow-ink-500/30 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isRegister ? 'Create organization' : 'Sign in'} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-neutral-500">
            <button onClick={() => { setMode('home'); setError(null); }} className="font-semibold text-ink-600 transition-smooth hover:text-ink-700">← Back to options</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-neutral-200 bg-white/70 py-3 pl-10 pr-3 text-[14px] text-neutral-800 outline-none transition-smooth placeholder:text-neutral-400 focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10';

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-neutral-600">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
