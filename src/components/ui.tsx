import type { ReactNode } from 'react';

export function Card({
  children, className = '', onClick,
}: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-3xl shadow-[0_2px_24px_-8px_rgba(31,51,192,0.18)] transition-smooth ${onClick ? 'cursor-pointer hover:shadow-[0_8px_40px_-12px_rgba(31,51,192,0.28)] hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title, subtitle, icon, action,
}: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 p-6 pb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-50 text-ink-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-neutral-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-neutral-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children, tone = 'neutral',
}: { children: ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-neutral-100 text-neutral-600',
    green: 'bg-success-500/10 text-success-500',
    amber: 'bg-warning-500/15 text-warning-500',
    red: 'bg-error-500/10 text-error-500',
    blue: 'bg-ink-50 text-ink-600',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Ring({
  value, size = 120, stroke = 10, color = 'var(--color-ink-500)', label, sublabel,
}: {
  value: number; size?: number; stroke?: number; color?: string; label?: string; sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-neutral-200)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-neutral-800">{label ?? `${value}%`}</div>
          {sublabel && <div className="text-[11px] text-neutral-400">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

export function Bar({
  value, max = 100, color = 'var(--color-ink-500)', height = 8,
}: { value: number; max?: number; color?: string; height?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full overflow-hidden rounded-full bg-neutral-100" style={{ height }}>
      <div
        className="h-full rounded-full transition-smooth"
        style={{ width: `${pct}%`, background: color, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }}
      />
    </div>
  );
}

export function Avatar({ initials, tone = 'ink' }: { initials: string; tone?: 'ink' | 'amber' | 'red' | 'green' }) {
  const tones: Record<string, string> = {
    ink: 'bg-ink-50 text-ink-600',
    amber: 'bg-warning-500/15 text-warning-500',
    red: 'bg-error-500/10 text-error-500',
    green: 'bg-success-500/10 text-success-500',
  };
  return (
    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${tones[tone]}`}>
      {initials}
    </div>
  );
}
