/*
# Fix profile policy recursion

## Problem
The profile SELECT policy queried `profiles` from inside its own policy.
Postgres detects this as infinite recursion and returns a 500 error when
registration tries to load the newly-created profile.

## Security change
Profiles are private identity/role records. A signed-in user may read and
update only their own profile. Organization membership and role checks for
other tables use SECURITY DEFINER helper functions and do not depend on a
recursive profile policy.
*/

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
