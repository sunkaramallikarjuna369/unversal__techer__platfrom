import { useState } from 'react';
import { GraduationCap, Search, Bell, ChevronRight, Menu, X, LogOut, Building2 } from 'lucide-react';
import { NAV, type ViewId, type NavItem } from '@/lib/data';
import { useAuth } from '@/lib/auth';

const GROUPS: NavItem['group'][] = ['Live', 'Analytics', 'Tools', 'Community', 'Administration'];

export function Sidebar({
  active, onSelect, open, onClose,
}: { active: ViewId; onSelect: (id: ViewId) => void; open: boolean; onClose: () => void }) {
  const { profile, org } = useAuth();
  const role = profile?.role ?? 'teacher';
  const visibleNav = NAV.filter((n) => n.roles.includes(role));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-neutral-900/20 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 h-full w-[260px] shrink-0 flex-col border-r border-neutral-200/60 bg-white/70 backdrop-blur-xl transition-transform duration-300 lg:flex lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-ink-500 to-ink-700 text-white shadow-lg shadow-ink-500/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[13px] font-semibold tracking-tight text-neutral-800">Smart Classroom</div>
              <div className="text-[11px] font-medium text-ink-500">Universe</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {org && (
          <div className="mx-3 mb-2 rounded-xl bg-ink-50/60 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><Building2 className="h-3 w-3" /> Organization</div>
            <div className="truncate text-[12px] font-semibold text-neutral-800">{org.name}</div>
            <div className="text-[10px] text-neutral-400">Year: {org.current_year}</div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          {GROUPS.map((group) => {
            const items = visibleNav.filter((n) => n.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-5">
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{group}</div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { onSelect(item.id); onClose(); }}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-smooth ${
                          isActive
                            ? 'bg-ink-500/8 text-ink-700 shadow-sm'
                            : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-800'
                        }`}
                      >
                        <Icon className={`h-[18px] w-[18px] transition-smooth ${isActive ? 'text-ink-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-ink-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <SidebarFooter />
      </aside>
    </>
  );
}

function SidebarFooter() {
  const { profile, signOut } = useAuth();
  const name = profile?.display_name || 'User';
  const initials = name.slice(0, 2).toUpperCase();
  const roleLabel = profile?.role === 'principal' ? 'Principal' : 'Teacher';
  return (
    <div className="border-t border-neutral-200/60 p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-ink-50 to-sky-soft p-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-ink-500 text-[12px] font-semibold text-white">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold text-neutral-800">{name}</div>
          <div className="truncate text-[11px] text-neutral-500">{roleLabel}</div>
        </div>
        <button onClick={signOut} className="rounded-lg p-1.5 text-neutral-400 transition-smooth hover:bg-white hover:text-error-500" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { profile } = useAuth();
  const [q, setQ] = useState('');
  const name = profile?.display_name || 'T';
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-neutral-200/60 bg-white/60 px-5 py-3.5 backdrop-blur-xl lg:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 text-[13px] text-neutral-400">
        <span>Classroom</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-neutral-700">{title}</span>
      </div>

      <div className="relative ml-auto hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search students, classes, reports…"
          className="w-72 rounded-xl border border-neutral-200/70 bg-white/70 py-2 pl-9 pr-3 text-[13px] text-neutral-700 outline-none transition-smooth placeholder:text-neutral-400 focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <button className="relative rounded-xl p-2.5 text-neutral-500 transition-smooth hover:bg-neutral-100">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
        </button>
        <div className="hidden h-8 w-px bg-neutral-200 sm:block" />
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ink-500 to-ink-700 text-[12px] font-semibold text-white">{initials}</div>
      </div>
    </header>
  );
}
