/*
# NOVA EDU — Full Learning Platform Schema

1. Purpose
   - Add phone + agency_path to profiles for the new onboarding flow.
   - Add path to categories (president / specialized) for Agency module.
   - Add passage_text + audio_url to questions for Reading/Listening skills.
   - Create lessons table for daily learning paths (CEFR + Agency).
   - Create daily_progress to track per-lesson completion + daily plan %.
   - Create placement_results for CEFR placement test (A1–B2).
   - Create essays for Writing skill (AI-scored).
   - Create speaking_records for Speaking skill (voice recordings + AI feedback).

2. New Tables
   - lessons: daily lesson per category/skill, with day_number + content JSONB.
   - daily_progress: user × lesson completion tracker.
   - placement_results: CEFR placement test outcome per user.
   - essays: user essay submissions with AI score + feedback.
   - speaking_records: user voice recordings with AI feedback.

3. Modified Tables
   - profiles: + phone (text), + agency_path ('president'|'specialized'|'').
   - categories: + path ('president'|'specialized'|'both'|'').
   - questions: + passage_text (text, for Reading), + audio_url (text, for Listening), + lesson_id (FK lessons).

4. Security
   - RLS enabled on every new table.
   - Owner-scoped CRUD via auth.uid() on all user-data tables.
   - lessons is read-only for authenticated users (shared content).
*/

-- ============ PROFILES ============
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS agency_path text DEFAULT '' CHECK (agency_path IN ('', 'president', 'specialized'));

-- ============ CATEGORIES ============
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS path text DEFAULT '' CHECK (path IN ('', 'president', 'specialized', 'both'));

-- Tag existing agency categories
UPDATE categories SET path = 'specialized' WHERE type = 'agency' AND slug IN ('mathematics','physics','chemistry','biology');
UPDATE categories SET path = 'both' WHERE type = 'agency' AND slug IN ('critical-thinking','english','history');

-- Add President-specific categories
INSERT INTO categories (name, slug, description, type, path, icon_name, color, sort_order)
VALUES
  ('Mantiqiy Masalalar', 'logic-puzzles', 'Boshlang''ich sinf o''quvchilari uchun mantiqiy masalalar', 'agency', 'president', 'Calculator', 'orange', 20),
  ('Tanqidiy Fikrlash', 'critical-thinking-kids', 'Kichik yoshdagilar uchun tanqidiy fikrlash', 'agency', 'president', 'Lightbulb', 'amber', 21),
  ('Matematika Asoslari', 'math-basics', 'Boshlang''ich matematika', 'agency', 'president', 'Calculator', 'green', 22),
  ('Ingliz Tili Asoslari', 'english-basics', 'Boshlang''ich ingliz tili', 'agency', 'president', 'Languages', 'cyan', 23)
ON CONFLICT (slug) DO NOTHING;

-- ============ QUESTIONS ============
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS passage_text text DEFAULT '',
  ADD COLUMN IF NOT EXISTS audio_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS lesson_id uuid DEFAULT null;

-- ============ LESSONS ============
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  skill text DEFAULT 'general' CHECK (skill IN ('reading','writing','speaking','listening','general')),
  title text NOT NULL,
  description text DEFAULT '',
  content jsonb DEFAULT '{}'::jsonb,
  day_number int DEFAULT 1,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_lessons" ON lessons;
CREATE POLICY "select_lessons" ON lessons FOR SELECT
  TO authenticated USING (true);

-- Add FK from questions to lessons
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'questions_lesson_id_fkey') THEN
    ALTER TABLE questions ADD CONSTRAINT questions_lesson_id_fkey
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============ DAILY PROGRESS ============
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  score int DEFAULT 0,
  completed_at timestamptz DEFAULT null,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_progress" ON daily_progress;
CREATE POLICY "select_own_progress" ON daily_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON daily_progress;
CREATE POLICY "insert_own_progress" ON daily_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON daily_progress;
CREATE POLICY "update_own_progress" ON daily_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON daily_progress;
CREATE POLICY "delete_own_progress" ON daily_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user ON daily_progress(user_id);

-- ============ PLACEMENT RESULTS ============
CREATE TABLE IF NOT EXISTS placement_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  determined_level text CHECK (determined_level IN ('A1','A2','B1','B2')),
  score int DEFAULT 0,
  total_questions int DEFAULT 0,
  answers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE placement_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_placement" ON placement_results;
CREATE POLICY "select_own_placement" ON placement_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_placement" ON placement_results;
CREATE POLICY "insert_own_placement" ON placement_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_placement" ON placement_results;
CREATE POLICY "delete_own_placement" ON placement_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_placement_user ON placement_results(user_id);

-- ============ ESSAYS ============
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  essay_text text DEFAULT '',
  ai_score int DEFAULT 0,
  ai_feedback text DEFAULT '',
  level text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_essays" ON essays;
CREATE POLICY "select_own_essays" ON essays FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_essays" ON essays;
CREATE POLICY "insert_own_essays" ON essays FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_essays" ON essays;
CREATE POLICY "update_own_essays" ON essays FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_essays" ON essays;
CREATE POLICY "delete_own_essays" ON essays FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_essays_user ON essays(user_id);

-- ============ SPEAKING RECORDS ============
CREATE TABLE IF NOT EXISTS speaking_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  audio_url text DEFAULT '',
  ai_feedback text DEFAULT '',
  duration_seconds int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE speaking_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_speaking" ON speaking_records;
CREATE POLICY "select_own_speaking" ON speaking_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_speaking" ON speaking_records;
CREATE POLICY "insert_own_speaking" ON speaking_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_speaking" ON speaking_records;
CREATE POLICY "update_own_speaking" ON speaking_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_speaking" ON speaking_records;
CREATE POLICY "delete_own_speaking" ON speaking_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_speaking_user ON speaking_records(user_id);
