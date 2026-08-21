import { useEffect, useRef, useState } from 'react';
import { Brain, ShieldCheck, Lock, Eye, EyeOff, Camera, CameraOff, Video } from 'lucide-react';
import { Card, CardHeader, Badge, Ring } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useStudents, EMOTION_COLORS } from '@/lib/hooks';

type EmotionKey = 'focused' | 'engaged' | 'neutral' | 'confused' | 'distracted' | 'absent';

export function EmotionView() {
  const { user, profile } = useAuth();
  const { students } = useStudents();
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [motion, setMotion] = useState(0);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionKey>('neutral');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const lastSaveRef = useRef<number>(0);

  const participants = students.filter((s) => s.opt_in);
  const dist = participants.reduce<Record<string, number>>((acc, s) => {
    acc[s.emotion] = (acc[s.emotion] ?? 0) + 1;
    return acc;
  }, {});
  const total = participants.length;
  const focused = (dist.focused ?? 0) + (dist.engaged ?? 0);
  const focusPct = total ? Math.round((focused / total) * 100) : 0;

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setDetectedEmotion('neutral');
    setBrightness(0);
    setMotion(0);
  };

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      analyze();
    } catch {
      setError('Camera access was denied. Please allow camera permissions and try again.');
    }
  };

  const analyze = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(analyze);
      return;
    }
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 64, 48);
    const frame = ctx.getImageData(0, 0, 64, 48);
    const data = frame.data;

    let sumBright = 0;
    for (let i = 0; i < data.length; i += 4) {
      sumBright += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBright = sumBright / (data.length / 4);
    setBrightness(Math.round((avgBright / 255) * 100));

    let motionSum = 0;
    if (prevFrameRef.current) {
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const diff = Math.abs(data[i] - prevFrameRef.current[i]);
        if (diff > 25) count++;
      }
      motionSum = Math.round((count / (data.length / 4)) * 100);
    }
    prevFrameRef.current = new Uint8ClampedArray(data);
    setMotion(motionSum);

    let emotion: EmotionKey = 'neutral';
    if (motionSum > 25) emotion = 'distracted';
    else if (motionSum > 12) emotion = 'engaged';
    else if (avgBright > 120) emotion = 'focused';
    else if (avgBright < 50) emotion = 'confused';
    setDetectedEmotion(emotion);

    const now = Date.now();
    if (user && now - lastSaveRef.current > 5000) {
      lastSaveRef.current = now;
      supabase.from('emotion_readings').insert({ user_id: user.id, org_id: profile?.org_id, teacher_id: profile?.teacher_id, emotion, count: 1 }).then(() => {});
    }

    rafRef.current = requestAnimationFrame(analyze);
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Emotion Detection</h1>
          <p className="mt-1 text-[13px] text-neutral-500">Privacy-friendly, on-device analysis · students opt in individually</p>
        </div>
        <button
          onClick={active ? stop : start}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-smooth ${active ? 'bg-error-500/10 text-error-500' : 'bg-ink-500 text-white hover:bg-ink-600'}`}
        >
          {active ? <><CameraOff className="h-4 w-4" /> Stop camera</> : <><Camera className="h-4 w-4" /> Start camera</>}
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-r from-ink-50 to-sky-soft px-6 py-4">
          <ShieldCheck className="h-5 w-5 text-success-500" />
          <div className="flex-1 text-[12px] text-neutral-600">
            <span className="font-semibold text-neutral-800">Privacy by design.</span> All analysis runs locally in your browser. No faces are stored, transmitted, or identifiable. Only aggregate emotion counts are saved.
          </div>
          <Lock className="h-4 w-4 text-neutral-400" />
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-error-500/10 px-5 py-4 text-[13px] text-error-500">
          <CameraOff className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <Card className="overflow-hidden">
          <CardHeader title="Live camera" subtitle="On-device face analysis" icon={<Video className="h-5 w-5" />} action={active ? <Badge tone="green"><span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Live</Badge> : <Badge tone="neutral">Off</Badge>} />
          <div className="relative aspect-video bg-neutral-900">
            <video ref={videoRef} className={`h-full w-full object-cover ${active ? 'opacity-100' : 'opacity-0'}`} playsInline muted />
            {!active && (
              <div className="absolute inset-0 grid place-items-center text-neutral-500">
                <div className="text-center">
                  <Camera className="mx-auto h-10 w-10 text-neutral-600" />
                  <div className="mt-2 text-[13px]">Camera is off</div>
                </div>
              </div>
            )}
            {active && (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-neutral-900/60 px-3 py-1.5 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-error-500" />
                <span className="text-[11px] font-medium text-white">ANALYZING</span>
              </div>
            )}
            {active && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="rounded-xl bg-neutral-900/60 px-3 py-2 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wide text-white/60">Detected</div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold capitalize text-white">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: EMOTION_COLORS[detectedEmotion] }} />
                    {detectedEmotion}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-xl bg-neutral-900/60 px-3 py-2 text-center backdrop-blur">
                    <div className="text-[10px] uppercase tracking-wide text-white/60">Light</div>
                    <div className="text-[13px] font-semibold text-white">{brightness}%</div>
                  </div>
                  <div className="rounded-xl bg-neutral-900/60 px-3 py-2 text-center backdrop-blur">
                    <div className="text-[10px] uppercase tracking-wide text-white/60">Motion</div>
                    <div className="text-[13px] font-semibold text-white">{motion}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </Card>

        <Card className="flex flex-col items-center p-6">
          <Ring value={focusPct} size={140} stroke={12} color="var(--color-success-500)" sublabel="focused / engaged" />
          <div className="mt-3 text-center">
            <div className="text-[13px] font-medium text-neutral-700">Class focus level</div>
            <div className="text-[11px] text-neutral-400">{focused} of {total} participating</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Emotion distribution" subtitle="Live aggregate from roster" icon={<Brain className="h-5 w-5" />} action={active ? <Badge tone="green">Live</Badge> : <Badge tone="neutral">Paused</Badge>} />
          <div className="space-y-3 px-6 pb-6">
            {Object.entries(EMOTION_COLORS).map(([emo, color]) => {
              const count = dist[emo] ?? 0;
              const pct = total ? (count / total) * 100 : 0;
              return (
                <div key={emo} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                  <span className="w-24 text-[12px] capitalize text-neutral-600">{emo}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full transition-smooth" style={{ width: `${pct}%`, background: color, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                  <span className="w-8 text-right text-[12px] font-semibold text-neutral-700">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Participating students" subtitle="Only students with opt-in consent are analyzed" icon={<ShieldCheck className="h-5 w-5" />} action={<Badge tone="blue">{participants.length} opted in</Badge>} />
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-3 lg:grid-cols-4">
          {participants.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white/50 p-3 transition-smooth hover:border-ink-200 hover:bg-ink-50/40">
              <div className="grid h-10 w-10 place-items-center rounded-xl text-[12px] font-semibold text-white" style={{ background: EMOTION_COLORS[s.emotion] }}>{s.initials}</div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-neutral-800">{s.name}</div>
                <div className="text-[11px] capitalize text-neutral-500">{s.emotion}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
