import { supabase } from '@/lib/supabase';

const SAMPLE_STUDENTS = [
  { name: 'Ava Mitchell', initials: 'AM', engagement: 92, emotion: 'focused', participation: 88, homework: 96, attention: 'green', seat_row: 0, seat_col: 0, opt_in: true },
  { name: 'Liam Chen', initials: 'LC', engagement: 78, emotion: 'engaged', participation: 72, homework: 84, attention: 'green', seat_row: 0, seat_col: 1, opt_in: true },
  { name: 'Sofia Reyes', initials: 'SR', engagement: 45, emotion: 'confused', participation: 38, homework: 61, attention: 'red', seat_row: 0, seat_col: 2, opt_in: true },
  { name: 'Noah Patel', initials: 'NP', engagement: 64, emotion: 'neutral', participation: 55, homework: 70, attention: 'amber', seat_row: 1, seat_col: 0, opt_in: false },
  { name: 'Mia Johansson', initials: 'MJ', engagement: 88, emotion: 'focused', participation: 91, homework: 93, attention: 'green', seat_row: 1, seat_col: 1, opt_in: true },
  { name: 'Ethan Brooks', initials: 'EB', engagement: 31, emotion: 'distracted', participation: 22, homework: 48, attention: 'red', seat_row: 1, seat_col: 2, opt_in: true },
  { name: 'Olivia Tanaka', initials: 'OT', engagement: 81, emotion: 'engaged', participation: 76, homework: 88, attention: 'green', seat_row: 2, seat_col: 0, opt_in: true },
  { name: 'Lucas Moreno', initials: 'LM', engagement: 57, emotion: 'neutral', participation: 49, homework: 66, attention: 'amber', seat_row: 2, seat_col: 1, opt_in: false },
  { name: 'Emma Okafor', initials: 'EO', engagement: 95, emotion: 'focused', participation: 94, homework: 98, attention: 'green', seat_row: 2, seat_col: 2, opt_in: true },
  { name: 'Ben Carter', initials: 'BC', engagement: 52, emotion: 'confused', participation: 44, homework: 58, attention: 'amber', seat_row: 3, seat_col: 0, opt_in: true },
  { name: 'Zoe Nakamura', initials: 'ZN', engagement: 73, emotion: 'engaged', participation: 68, homework: 79, attention: 'green', seat_row: 3, seat_col: 1, opt_in: true },
  { name: 'Henry Walsh', initials: 'HW', engagement: 38, emotion: 'distracted', participation: 30, homework: 52, attention: 'red', seat_row: 3, seat_col: 2, opt_in: true },
];

const SAMPLE_MESSAGES = [
  { parent_name: 'Mrs. Mitchell', student_name: 'Ava Mitchell', subject: 'Progress update', body: 'Thank you for the detailed feedback on Ava this week. She really enjoyed the science lab!', sentiment: 'positive', unread: true },
  { parent_name: 'Mr. Reyes', student_name: 'Sofia Reyes', subject: 'Extra help request', body: "Could we schedule a call about Sofia's math struggles? She seems frustrated with fractions.", sentiment: 'neutral', unread: true },
  { parent_name: 'Dr. Brooks', student_name: 'Ethan Brooks', subject: 'Attendance note', body: 'Ethan will be late tomorrow due to a dentist appointment.', sentiment: 'neutral', unread: false },
  { parent_name: 'Ms. Okafor', student_name: 'Emma Okafor', subject: 'Enrichment ideas', body: 'Emma is loving the advanced reading group! Any suggestions for extra books?', sentiment: 'positive', unread: false },
  { parent_name: 'Mr. Walsh', student_name: 'Henry Walsh', subject: 'Homework concern', body: 'Henry seems overwhelmed with the workload lately. Can we talk about adjustments?', sentiment: 'concern', unread: false },
];

const SAMPLE_DEPARTMENTS = [
  { name: 'Mathematics', avg_score: 78, student_count: 342, trend: '+4' },
  { name: 'Science', avg_score: 82, student_count: 298, trend: '+2' },
  { name: 'English', avg_score: 75, student_count: 311, trend: '-1' },
  { name: 'History', avg_score: 71, student_count: 264, trend: '+3' },
  { name: 'Arts', avg_score: 86, student_count: 189, trend: '+5' },
  { name: 'Languages', avg_score: 79, student_count: 227, trend: '0' },
];

export async function seedUserData(userId: string, orgId?: string, teacherId?: string) {
  const { data: existing } = await supabase.from('students').select('id').eq('user_id', userId).limit(1);
  if (existing && existing.length > 0) return;

  const studentRows = SAMPLE_STUDENTS.map((s) => ({
    ...s,
    user_id: userId,
    org_id: orgId ?? null,
    teacher_id: teacherId ?? null,
  }));
  await supabase.from('students').insert(studentRows);

  const msgRows = SAMPLE_MESSAGES.map((m) => ({
    ...m,
    user_id: userId,
    org_id: orgId ?? null,
    teacher_id: teacherId ?? null,
  }));
  await supabase.from('parent_messages').insert(msgRows);

  if (orgId) {
    const deptRows = SAMPLE_DEPARTMENTS.map((d) => ({ ...d, user_id: userId, org_id: orgId }));
    await supabase.from('school_departments').insert(deptRows);
  }
}

export async function seedOrgData(orgId: string, userId: string) {
  const deptRows = SAMPLE_DEPARTMENTS.map((d) => ({ ...d, user_id: userId, org_id: orgId }));
  await supabase.from('school_departments').insert(deptRows);
}
