/*
# Organization & Role Tables (Part 1: tables + columns only)

Creates organizations, teachers, and profiles tables. Adds org_id and
teacher_id columns to all existing tables. No policies that reference
profiles are created here — those go in Part 2.
*/

-- Organizations (no policies yet — added in part 2)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text DEFAULT '',
  current_year text NOT NULL DEFAULT '2025-2026',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Teachers (no profile_id yet, no policies yet)
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  grade text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'teacher' CHECK (role IN ('principal', 'teacher')),
  display_name text NOT NULL DEFAULT '',
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add profile_id to teachers (completes the circular ref)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Helper functions
CREATE OR REPLACE FUNCTION get_my_org_id() RETURNS uuid AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_role() RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_teacher_id() RETURNS uuid AS $$
  SELECT teacher_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add org_id and teacher_id to existing tables
ALTER TABLE students ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE noise_readings ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE noise_readings ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE emotion_readings ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE emotion_readings ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE parent_messages ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE parent_messages ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE parent_messages ADD COLUMN IF NOT EXISTS encrypted_body text DEFAULT '';
ALTER TABLE whiteboards ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE whiteboards ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE seating_arrangements ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE seating_arrangements ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE school_departments ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_org ON students(org_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_org ON teachers(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_noise_teacher ON noise_readings(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_teacher ON parent_messages(teacher_id, created_at DESC);
