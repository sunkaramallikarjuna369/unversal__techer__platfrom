import { useEffect, useState, useCallback } from 'react';
import { supabase, type Student } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export const EMOTION_COLORS: Record<string, string> = {
  focused: '#10b981',
  engaged: '#06b6d4',
  neutral: '#94a3b8',
  confused: '#f59e0b',
  distracted: '#ef4444',
  absent: '#475569',
};

export const ATTENTION_LABEL: Record<string, string> = {
  green: 'On track',
  amber: 'Watch closely',
  red: 'Needs attention',
};

export function useStudents(selectedTeacherId?: string | null) {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    let query = supabase.from('students').select('*').eq('user_id', user.id);
    if (selectedTeacherId) {
      query = query.eq('teacher_id', selectedTeacherId);
    } else if (profile?.role === 'teacher' && profile.teacher_id) {
      query = query.eq('teacher_id', profile.teacher_id);
    }
    const { data } = await query.order('name');
    setStudents((data ?? []) as Student[]);
    setLoading(false);
  }, [user, profile, selectedTeacherId]);

  useEffect(() => { load(); }, [load]);

  const updateStudent = useCallback(async (id: string, patch: Partial<Student>) => {
    await supabase.from('students').update(patch).eq('id', id);
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  return { students, loading, reload: load, updateStudent };
}
