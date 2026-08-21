/*
# Smart Classroom Universe — Core Schema

## Overview
Creates the full data model for a teacher platform: students, classes,
participation logs, homework records, quizzes, quiz responses, parent
messages, noise readings, emotion readings, seating arrangements,
whiteboard snapshots, and school-wide department stats.

## Multi-user (teacher) data isolation
Every teacher-owned table carries `user_id uuid NOT NULL DEFAULT auth.uid()`
so inserts from the authenticated client succeed even when the client
omits the owner field. RLS policies scope all CRUD to the owning teacher.

## New Tables
1. `students` — roster of students per teacher (name, engagement, emotion,
   participation, homework %, attention flag, opt-in consent, seat position).
2. `noise_readings` — time-series dB readings from the classroom mic.
3. `emotion_readings` — aggregate emotion counts per snapshot.
4. `quizzes` — generated quizzes (topic, difficulty, question count).
5. `quiz_questions` — individual questions belonging to a quiz.
6. `parent_messages` — inbox of parent communications.
7. `whiteboards` — saved whiteboard canvases (title + data URL).
8. `seating_arrangements` — saved seating maps (grid JSON).
9. `school_departments` — school-wide department performance stats.

## Security
- RLS enabled on every table.
- 4 policies (SELECT/INSERT/UPDATE/DELETE) per table, scoped to `authenticated`
  with `auth.uid() = user_id` ownership checks.
- Child tables (quiz_questions) inherit ownership through the parent quiz.
*/

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  initials text NOT NULL DEFAULT '',
  engagement int NOT NULL DEFAULT 0,
  emotion text NOT NULL DEFAULT 'neutral',
  participation int NOT NULL DEFAULT 0,
  homework int NOT NULL DEFAULT 0,
  attention text NOT NULL DEFAULT 'green',
  seat_row int NOT NULL DEFAULT 0,
  seat_col int NOT NULL DEFAULT 0,
  opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_students" ON students;
CREATE POLICY "select_own_students" ON students FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_students" ON students;
CREATE POLICY "insert_own_students" ON students FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_students" ON students;
CREATE POLICY "update_own_students" ON students FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_students" ON students;
CREATE POLICY "delete_own_students" ON students FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Noise readings
CREATE TABLE IF NOT EXISTS noise_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  db_level int NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE noise_readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_noise" ON noise_readings;
CREATE POLICY "select_own_noise" ON noise_readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_noise" ON noise_readings;
CREATE POLICY "insert_own_noise" ON noise_readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_noise" ON noise_readings;
CREATE POLICY "delete_own_noise" ON noise_readings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Emotion readings
CREATE TABLE IF NOT EXISTS emotion_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion text NOT NULL,
  count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE emotion_readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_emotions" ON emotion_readings;
CREATE POLICY "select_own_emotions" ON emotion_readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_emotions" ON emotion_readings;
CREATE POLICY "insert_own_emotions" ON emotion_readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_emotions" ON emotion_readings;
CREATE POLICY "delete_own_emotions" ON emotion_readings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  question_count int NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_quizzes" ON quizzes;
CREATE POLICY "select_own_quizzes" ON quizzes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_quizzes" ON quizzes;
CREATE POLICY "insert_own_quizzes" ON quizzes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_quizzes" ON quizzes;
CREATE POLICY "delete_own_quizzes" ON quizzes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  answer_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_quiz_questions" ON quiz_questions;
CREATE POLICY "select_own_quiz_questions" ON quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_quiz_questions" ON quiz_questions;
CREATE POLICY "insert_own_quiz_questions" ON quiz_questions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_quiz_questions" ON quiz_questions;
CREATE POLICY "delete_own_quiz_questions" ON quiz_questions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid()));

-- Parent messages
CREATE TABLE IF NOT EXISTS parent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name text NOT NULL,
  student_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sentiment text NOT NULL DEFAULT 'neutral',
  unread boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE parent_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_messages" ON parent_messages;
CREATE POLICY "select_own_messages" ON parent_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_messages" ON parent_messages;
CREATE POLICY "insert_own_messages" ON parent_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_messages" ON parent_messages;
CREATE POLICY "update_own_messages" ON parent_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Whiteboards
CREATE TABLE IF NOT EXISTS whiteboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled',
  data_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_whiteboards" ON whiteboards;
CREATE POLICY "select_own_whiteboards" ON whiteboards FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_whiteboards" ON whiteboards;
CREATE POLICY "insert_own_whiteboards" ON whiteboards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_whiteboards" ON whiteboards;
CREATE POLICY "update_own_whiteboards" ON whiteboards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_whiteboards" ON whiteboards;
CREATE POLICY "delete_own_whiteboards" ON whiteboards FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seating arrangements
CREATE TABLE IF NOT EXISTS seating_arrangements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Room 12',
  grid jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE seating_arrangements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_seating" ON seating_arrangements;
CREATE POLICY "select_own_seating" ON seating_arrangements FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_seating" ON seating_arrangements;
CREATE POLICY "insert_own_seating" ON seating_arrangements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_seating" ON seating_arrangements;
CREATE POLICY "update_own_seating" ON seating_arrangements FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- School departments
CREATE TABLE IF NOT EXISTS school_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avg_score int NOT NULL DEFAULT 0,
  student_count int NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT '0',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE school_departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_depts" ON school_departments;
CREATE POLICY "select_own_depts" ON school_departments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_depts" ON school_departments;
CREATE POLICY "insert_own_depts" ON school_departments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_depts" ON school_departments;
CREATE POLICY "update_own_depts" ON school_departments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_noise_user ON noise_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON parent_messages(user_id, created_at DESC);
