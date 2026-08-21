import { useRef, useState, useEffect } from 'react';
import { PenLine, Eraser, Undo2, Download, Trash2, Pencil, Save, FolderOpen } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { supabase, type Whiteboard } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type Tool = 'pen' | 'eraser';

export function WhiteboardView() {
  const { user, profile } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#2f49f0');
  const [size, setSize] = useState(3);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [saved, setSaved] = useState<Whiteboard[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctxRef.current = ctx;
  }, []);

  const loadSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from('whiteboards').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8);
    setSaved((data ?? []) as Whiteboard[]);
  };

  useEffect(() => { loadSaved(); }, [user]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    const ctx = ctxRef.current!;
    history.current.push(ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height));
    if (history.current.length > 30) history.current.shift();
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ctxRef.current!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 6 : size;
    ctx.stroke();
    last.current = p;
  };

  const end = () => { drawing.current = false; last.current = null; };

  const undo = () => {
    const ctx = ctxRef.current!;
    const prev = history.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
  };

  const clear = () => {
    const ctx = ctxRef.current!;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const save = async () => {
    if (!user || !canvasRef.current) return;
    setSaving(true);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    await supabase.from('whiteboards').insert({ user_id: user.id, org_id: profile?.org_id, teacher_id: profile?.teacher_id, title: `Board ${new Date().toLocaleDateString()}`, data_url: dataUrl });
    loadSaved();
    setSaving(false);
  };

  const loadBoard = (b: Whiteboard) => {
    const img = new Image();
    img.onload = () => {
      const ctx = ctxRef.current!;
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = b.data_url;
  };

  const colors = ['#2f49f0', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#0f172a'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
          <PenLine className="h-6 w-6 text-ink-500" /> Interactive Whiteboard
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">Draw, sketch, and explain — save your canvases to your library</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200/60 bg-white/60 px-4 py-3">
          <div className="flex gap-1.5">
            <button onClick={() => setTool('pen')} className={`grid h-9 w-9 place-items-center rounded-xl transition-smooth ${tool === 'pen' ? 'bg-ink-500 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}><Pencil className="h-4 w-4" /></button>
            <button onClick={() => setTool('eraser')} className={`grid h-9 w-9 place-items-center rounded-xl transition-smooth ${tool === 'eraser' ? 'bg-ink-500 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}><Eraser className="h-4 w-4" /></button>
          </div>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="flex gap-1.5">
            {colors.map((c) => (
              <button key={c} onClick={() => { setColor(c); setTool('pen'); }} className={`h-7 w-7 rounded-full border-2 transition-smooth ${color === c && tool === 'pen' ? 'border-neutral-800 scale-110' : 'border-white'}`} style={{ background: c }} />
            ))}
          </div>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400">Size</span>
            <input type="range" min={1} max={12} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-ink-500" />
          </div>
          <div className="ml-auto flex gap-1.5">
            <button onClick={undo} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-[12px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50"><Undo2 className="h-3.5 w-3.5" /> Undo</button>
            <button onClick={clear} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-[12px] font-medium text-neutral-600 transition-smooth hover:bg-neutral-50"><Trash2 className="h-3.5 w-3.5" /> Clear</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-ink-500 px-3 py-2 text-[12px] font-medium text-white transition-smooth hover:bg-ink-600 disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
        <div className="relative bg-white">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="h-[60vh] min-h-[400px] w-full touch-none"
            style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          />
        </div>
      </Card>

      {saved.length > 0 && (
        <Card>
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-ink-500" />
              <h3 className="text-[15px] font-semibold tracking-tight text-neutral-800">Saved canvases</h3>
            </div>
            <Badge tone="blue">{saved.length} boards</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-3 lg:grid-cols-4">
            {saved.map((b) => (
              <button key={b.id} onClick={() => loadBoard(b)} className="group overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/50 transition-smooth hover:border-ink-200 hover:shadow-sm">
                <div className="aspect-video bg-white">
                  {b.data_url ? <img src={b.data_url} alt={b.title} className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center text-neutral-300"><PenLine className="h-6 w-6" /></div>}
                </div>
                <div className="truncate p-2 text-[11px] font-medium text-neutral-600">{b.title}</div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
