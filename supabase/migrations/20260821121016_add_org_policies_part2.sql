/*
# Organization & Role Policies (Part 2: all RLS policies + rollover)

Adds RLS policies to organizations, teachers, profiles, and updates all
existing table policies for org-scoped + role-based access.
Principals see all rows in their org; teachers see only their own data.
*/

-- Organizations policies
DROP POLICY IF EXISTS "select_own_org" ON organizations;
CREATE POLICY "select_own_org" ON organizations FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_org" ON organizations;
CREATE POLICY "insert_own_org" ON organizations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "update_own_org" ON organizations;
CREATE POLICY "update_own_org" ON organizations FOR UPDATE TO authenticated
  USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Teachers policies
DROP POLICY IF EXISTS "select_org_teachers" ON teachers;
CREATE POLICY "select_org_teachers" ON teachers FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_teachers" ON teachers;
CREATE POLICY "insert_org_teachers" ON teachers FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT me.org_id FROM profiles me WHERE me.id = auth.uid() AND me.role = 'principal'));
DROP POLICY IF EXISTS "update_org_teachers" ON teachers;
CREATE POLICY "update_org_teachers" ON teachers FOR UPDATE TO authenticated
  USING (org_id IN (SELECT me.org_id FROM profiles me WHERE me.id = auth.uid() AND me.role = 'principal'))
  WITH CHECK (org_id IN (SELECT me.org_id FROM profiles me WHERE me.id = auth.uid() AND me.role = 'principal'));
DROP POLICY IF EXISTS "delete_org_teachers" ON teachers;
CREATE POLICY "delete_org_teachers" ON teachers FOR DELETE TO authenticated
  USING (org_id IN (SELECT me.org_id FROM profiles me WHERE me.id = auth.uid() AND me.role = 'principal'));

-- Profiles policies
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Students RLS
DROP POLICY IF EXISTS "select_own_students" ON students;
CREATE POLICY "select_own_students" ON students FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_students" ON students;
CREATE POLICY "insert_own_students" ON students FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "update_own_students" ON students;
CREATE POLICY "update_own_students" ON students FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()))
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "delete_own_students" ON students;
CREATE POLICY "delete_own_students" ON students FOR DELETE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- Noise readings RLS
DROP POLICY IF EXISTS "select_own_noise" ON noise_readings;
CREATE POLICY "select_own_noise" ON noise_readings FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_noise" ON noise_readings;
CREATE POLICY "insert_own_noise" ON noise_readings FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "delete_own_noise" ON noise_readings;
CREATE POLICY "delete_own_noise" ON noise_readings FOR DELETE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- Emotion readings RLS
DROP POLICY IF EXISTS "select_own_emotions" ON emotion_readings;
CREATE POLICY "select_own_emotions" ON emotion_readings FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_emotions" ON emotion_readings;
CREATE POLICY "insert_own_emotions" ON emotion_readings FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "delete_own_emotions" ON emotion_readings;
CREATE POLICY "delete_own_emotions" ON emotion_readings FOR DELETE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- Quizzes RLS
DROP POLICY IF EXISTS "select_own_quizzes" ON quizzes;
CREATE POLICY "select_own_quizzes" ON quizzes FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_quizzes" ON quizzes;
CREATE POLICY "insert_own_quizzes" ON quizzes FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "delete_own_quizzes" ON quizzes;
CREATE POLICY "delete_own_quizzes" ON quizzes FOR DELETE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- Quiz questions RLS
DROP POLICY IF EXISTS "select_own_quiz_questions" ON quiz_questions;
CREATE POLICY "select_own_quiz_questions" ON quiz_questions FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.teacher_id = get_my_teacher_id())));
DROP POLICY IF EXISTS "insert_own_quiz_questions" ON quiz_questions;
CREATE POLICY "insert_own_quiz_questions" ON quiz_questions FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND (get_my_role() = 'principal' OR quizzes.teacher_id = get_my_teacher_id())));
DROP POLICY IF EXISTS "delete_own_quiz_questions" ON quiz_questions;
CREATE POLICY "delete_own_quiz_questions" ON quiz_questions FOR DELETE TO authenticated
  USING (org_id = get_my_org_id() AND EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND (get_my_role() = 'principal' OR quizzes.teacher_id = get_my_teacher_id())));

-- Parent messages RLS
DROP POLICY IF EXISTS "select_own_messages" ON parent_messages;
CREATE POLICY "select_own_messages" ON parent_messages FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_messages" ON parent_messages;
CREATE POLICY "insert_own_messages" ON parent_messages FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "update_own_messages" ON parent_messages;
CREATE POLICY "update_own_messages" ON parent_messages FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()))
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- Whiteboards RLS
DROP POLICY IF EXISTS "select_own_whiteboards" ON whiteboards;
CREATE POLICY "select_own_whiteboards" ON whiteboards FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_whiteboards" ON whiteboards;
CREATE POLICY "insert_own_whiteboards" ON whiteboards FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "update_own_whiteboards" ON whiteboards;
CREATE POLICY "update_own_whiteboards" ON whiteboards FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()))
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "delete_own_whiteboards" ON whiteboards;
CREATE POLICY "delete_own_whiteboards" ON whiteboards FOR DELETE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- Seating arrangements RLS
DROP POLICY IF EXISTS "select_own_seating" ON seating_arrangements;
CREATE POLICY "select_own_seating" ON seating_arrangements FOR SELECT TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "insert_own_seating" ON seating_arrangements;
CREATE POLICY "insert_own_seating" ON seating_arrangements FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));
DROP POLICY IF EXISTS "update_own_seating" ON seating_arrangements;
CREATE POLICY "update_own_seating" ON seating_arrangements FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()))
  WITH CHECK (org_id = get_my_org_id() AND (get_my_role() = 'principal' OR teacher_id = get_my_teacher_id()));

-- School departments RLS
DROP POLICY IF EXISTS "select_own_depts" ON school_departments;
CREATE POLICY "select_own_depts" ON school_departments FOR SELECT TO authenticated
  USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "insert_own_depts" ON school_departments;
CREATE POLICY "insert_own_depts" ON school_departments FOR INSERT TO authenticated
  WITH CHECK (org_id = get_my_org_id() AND get_my_role() = 'principal');
DROP POLICY IF EXISTS "update_own_depts" ON school_departments;
CREATE POLICY "update_own_depts" ON school_departments FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id() AND get_my_role() = 'principal')
  WITH CHECK (org_id = get_my_org_id() AND get_my_role() = 'principal');

-- Yearly rollover function (principal only)
CREATE OR REPLACE FUNCTION rollover_year(new_year text) RETURNS void AS $$
DECLARE
  my_org uuid;
BEGIN
  my_org := get_my_org_id();
  IF get_my_role() != 'principal' THEN
    RAISE EXCEPTION 'Only principals can perform year rollover';
  END IF;
  DELETE FROM noise_readings WHERE org_id = my_org;
  DELETE FROM emotion_readings WHERE org_id = my_org;
  DELETE FROM quiz_questions WHERE org_id = my_org;
  DELETE FROM quizzes WHERE org_id = my_org;
  DELETE FROM parent_messages WHERE org_id = my_org;
  DELETE FROM whiteboards WHERE org_id = my_org;
  DELETE FROM seating_arrangements WHERE org_id = my_org;
  DELETE FROM students WHERE org_id = my_org;
  UPDATE teachers SET active = false WHERE org_id = my_org;
  UPDATE organizations SET current_year = new_year WHERE id = my_org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
