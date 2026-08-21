import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'principal' | 'teacher';

export type Profile = {
  id: string;
  org_id: string | null;
  role: UserRole;
  display_name: string;
  teacher_id: string | null;
};

export type Organization = {
  id: string;
  name: string;
  address: string;
  current_year: string;
  created_by: string | null;
  created_at: string;
};

export type Teacher = {
  id: string;
  org_id: string;
  profile_id: string | null;
  name: string;
  email: string;
  subject: string;
  grade: string;
  room: string;
  active: boolean;
  created_at: string;
};

export type Student = {
  id: string;
  org_id: string | null;
  teacher_id: string | null;
  user_id: string;
  name: string;
  initials: string;
  engagement: number;
  emotion: 'focused' | 'engaged' | 'neutral' | 'confused' | 'distracted' | 'absent';
  participation: number;
  homework: number;
  attention: 'green' | 'amber' | 'red';
  seat_row: number;
  seat_col: number;
  opt_in: boolean;
  created_at: string;
};

export type NoiseReading = {
  id: string;
  db_level: number;
  created_at: string;
};

export type EmotionReading = {
  id: string;
  emotion: string;
  count: number;
  created_at: string;
};

export type Quiz = {
  id: string;
  topic: string;
  difficulty: string;
  question_count: number;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  answer_index: number;
};

export type ParentMessage = {
  id: string;
  parent_name: string;
  student_name: string;
  subject: string;
  body: string;
  encrypted_body: string;
  sentiment: 'positive' | 'neutral' | 'concern';
  unread: boolean;
  created_at: string;
};

export type Whiteboard = {
  id: string;
  title: string;
  data_url: string;
  created_at: string;
};

export type SeatingArrangement = {
  id: string;
  name: string;
  grid: (string | null)[][];
  created_at: string;
};

export type SchoolDepartment = {
  id: string;
  name: string;
  avg_score: number;
  student_count: number;
  trend: string;
};
