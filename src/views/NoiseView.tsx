import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, AlertTriangle, Mic, MicOff } from 'lucide-react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

// org_id and teacher_id are pulled from the auth context at insert time

export function NoiseView() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(0);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setActive(false);
  };

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const db = Math.round(30 + (avg / 255) * 65);
        setCurrent(db);
        setHistory((h) => [...h.slice(-39), db]);

        const now = Date.now();
        if (user && now - lastSaveRef.current > 3000) {
          lastSaveRef.current = now;
          supabase.from('noise_readings').insert({ user_id: user.id, org_id: profile?.org_id, teacher_id: profile?.teacher_id, db_level: db }).then(() => {});
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError('Microphone access was denied. Please allow mic permissions and try again.');
    }
  };

  useEffect(() => () => stop(), []);

  const level = current > 70 ? 'red' : current > 55 ? 'amber' : 'green';
  const levelLabel = current > 70 ? 'Too loud' : current > 55 ? 'Moderate' : 'Calm';
  const color = current > 70 ? 'var(--color-error-500)' : current > 55 ? 'var(--color-warning-500)' : 'var(--color-success-500)';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Noise Level Monitor</h1>
          <p className="mt-1 text-[13px] text-neutral-500">Live ambient sound from your classroom microphone</p>
        </div>
        <button
          onClick={active ? stop : start}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-smooth ${active ? 'bg-error-500/10 text-error-500' : 'bg-ink-500 text-white hover:bg-ink-600'}`}
        >
          {active ? <><MicOff className="h-4 w-4" /> Stop mic</> : <><Mic className="h-4 w-4" /> Start mic</>}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-error-500/10 px-5 py-4 text-[13px] text-error-500">
          <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <Card className="flex flex-col items-center justify-center p-8">
          <div className="relative grid h-40 w-40 place-items-center">
            <div className="absolute inset-0 rounded-full" style={{ background: active ? `radial-gradient(circle, ${color}22, transparent 70%)` : 'transparent' }} />
            <div className="relative text-center">
              <div className="text-5xl font-semibold tracking-tight text-neutral-800">{active ? current : '--'}</div>
              <div className="text-[13px] text-neutral-400">dB SPL</div>
            </div>
          </div>
          {active ? (
            <Badge tone={level as 'red' | 'amber' | 'green'}>
              {current > 70 ? <AlertTriangle className="h-3 w-3" /> : current > 30 ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {levelLabel}
            </Badge>
          ) : (
            <Badge tone="neutral"><MicOff className="h-3 w-3" /> Mic off</Badge>
          )}
          <div className="mt-4 w-full max-w-xs">
            <div className="relative h-2 rounded-full bg-neutral-100">
              <div className="absolute left-0 top-0 h-2 rounded-full transition-smooth" style={{ width: `${current}%`, background: color }} />
              <div className="absolute top-0 h-2 w-px bg-neutral-400" style={{ left: '55%' }} />
              <div className="absolute top-0 h-2 w-px bg-error-500" style={{ left: '70%' }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-neutral-400"><span>30</span><span>55</span><span>70+</span></div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Sound waveform" subtitle="Live frequency analysis · last 40 samples" icon={<Volume2 className="h-5 w-5" />} action={active ? <Badge tone="green">Recording</Badge> : <Badge tone="neutral">Idle</Badge>} />
          <div className="px-6 pb-6">
            <div className="flex h-48 items-end gap-1.5">
              {(active ? history : Array.from({ length: 40 }, () => 0)).map((s, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md transition-smooth"
                  style={{
                    height: `${Math.max(2, s)}%`,
                    background: s > 70 ? 'var(--color-error-500)' : s > 55 ? 'var(--color-warning-500)' : 'var(--color-ink-400)',
                    opacity: 0.4 + (i / 40) * 0.6,
                  }}
                />
              ))}
            </div>
            {active && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[{ l: 'Average', v: history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : 0 }, { l: 'Peak', v: history.length ? Math.max(...history) : 0 }, { l: 'Lowest', v: history.length ? Math.min(...history) : 0 }].map((m) => (
                  <div key={m.l} className="rounded-2xl bg-neutral-50 p-3 text-center">
                    <div className="text-2xl font-semibold text-neutral-800">{m.v}<span className="text-sm text-neutral-400"> dB</span></div>
                    <div className="text-[11px] text-neutral-500">{m.l}</div>
                  </div>
                ))}
              </div>
            )}
            {!active && (
              <div className="grid h-32 place-items-center text-[13px] text-neutral-400">
                Press "Start mic" to begin live noise monitoring
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
