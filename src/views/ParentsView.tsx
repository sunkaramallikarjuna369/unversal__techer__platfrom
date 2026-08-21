import { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Paperclip, Smile, Star, Lock } from 'lucide-react';
import { Card, Badge, Avatar } from '@/components/ui';
import { supabase, type ParentMessage } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { encryptText } from '@/lib/crypto';

const sentimentTone = { positive: 'green', neutral: 'blue', concern: 'red' } as const;

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ParentsView() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [active, setActive] = useState<ParentMessage | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('parent_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const msgs = (data ?? []) as ParentMessage[];
    setMessages(msgs);
    if (msgs.length > 0 && !active) setActive(msgs[0]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const markRead = async (msg: ParentMessage) => {
    if (!msg.unread) return;
    await supabase.from('parent_messages').update({ unread: false }).eq('id', msg.id);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m)));
    setActive((prev) => (prev && prev.id === msg.id ? { ...prev, unread: false } : prev));
  };

  const send = async () => {
    if (!reply.trim() || !active || !user || !profile?.org_id) return;
    const encrypted = await encryptText(reply, user.id);
    await supabase.from('parent_messages').insert({
      user_id: user.id,
      org_id: profile.org_id,
      teacher_id: profile.teacher_id,
      parent_name: active.parent_name,
      student_name: active.student_name,
      subject: 'Re: ' + active.subject,
      body: reply,
      encrypted_body: encrypted,
      sentiment: 'neutral',
      unread: false,
    });
    setReply('');
    load();
  };

  if (loading) return <div className="grid h-64 place-items-center text-[13px] text-neutral-400">Loading messages…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-800">
          <MessageSquare className="h-6 w-6 text-ink-500" /> Parent Communication Center
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">Messages, updates, and broadcast announcements — <Lock className="inline h-3 w-3" /> end-to-end encrypted</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <Card className="flex flex-col lg:col-span-1">
          <div className="border-b border-neutral-200/60 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input placeholder="Search messages…" className="w-full rounded-xl border border-neutral-200 bg-white/70 py-2 pl-9 pr-3 text-[13px] outline-none focus:border-ink-300 focus:ring-4 focus:ring-ink-500/10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar" style={{ maxHeight: '500px' }}>
            {messages.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-neutral-400">No messages yet</div>}
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => { setActive(m); markRead(m); }}
                className={`flex w-full items-start gap-3 border-b border-neutral-100/80 p-4 text-left transition-smooth hover:bg-neutral-50 ${active?.id === m.id ? 'bg-ink-50/60' : ''}`}
              >
                <Avatar initials={m.parent_name.split(' ').map((w) => w[0]).join('').slice(0, 2)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-neutral-800">{m.parent_name}</span>
                    <span className="shrink-0 text-[11px] text-neutral-400">{timeAgo(m.created_at)}</span>
                  </div>
                  <div className="truncate text-[12px] font-medium text-neutral-600">{m.subject}</div>
                  <div className="mt-0.5 truncate text-[11px] text-neutral-400">{m.body}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone={sentimentTone[m.sentiment]}>{m.sentiment}</Badge>
                    {m.unread && <span className="h-2 w-2 rounded-full bg-ink-500" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          {active ? (
            <>
              <div className="flex items-center justify-between border-b border-neutral-200/60 p-5">
                <div className="flex items-center gap-3">
                  <Avatar initials={active.parent_name.split(' ').map((w) => w[0]).join('').slice(0, 2)} />
                  <div>
                    <div className="text-[14px] font-semibold text-neutral-800">{active.parent_name}</div>
                    <div className="text-[11px] text-neutral-500">Re: {active.student_name} · {active.subject}</div>
                  </div>
                </div>
                <Badge tone={sentimentTone[active.sentiment]}><Star className="h-3 w-3" /> {active.sentiment}</Badge>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5 no-scrollbar" style={{ maxHeight: '400px' }}>
                <div className="flex justify-start">
                  <div className="max-w-md rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-[13px] text-neutral-700">{active.body}</div>
                </div>
              </div>

              <div className="border-t border-neutral-200/60 p-4">
                <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white/70 p-2.5">
                  <button className="rounded-xl p-2 text-neutral-400 transition-smooth hover:bg-neutral-100"><Paperclip className="h-4 w-4" /></button>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-1.5 text-[13px] text-neutral-700 outline-none placeholder:text-neutral-400"
                  />
                  <button className="rounded-xl p-2 text-neutral-400 transition-smooth hover:bg-neutral-100"><Smile className="h-4 w-4" /></button>
                  <button onClick={send} className="flex items-center gap-1.5 rounded-xl bg-ink-500 px-4 py-2 text-[12px] font-medium text-white transition-smooth hover:bg-ink-600">
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-12 text-center">
              <div>
                <MessageSquare className="mx-auto h-10 w-10 text-neutral-300" />
                <div className="mt-2 text-[14px] font-medium text-neutral-600">Select a message</div>
                <div className="text-[13px] text-neutral-400">Choose a conversation from the list</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
