/*
# NOVA EDU Schema Update: CEFR Skills + Registration Flow

1. Purpose
   - Add `age` and `prep_type` to profiles so registration can ask name, age,
     and whether the student prepares for CEFR or Agency school entrance.
   - Add `skill` column to questions to support CEFR's 4 skills:
     Reading, Writing, Speaking, Listening. Agency questions get skill='general'.
   - Update existing CEFR questions to distribute across the 4 skills.
   - Agency questions remain skill='general'.

2. Changes
   - profiles: + age (int), + prep_type ('cefr'|'agency')
   - questions: + skill ('reading'|'writing'|'speaking'|'listening'|'general')

3. Security
   - No policy changes. Existing RLS covers the new columns.
*/

-- Add columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age int,
  ADD COLUMN IF NOT EXISTS prep_type text DEFAULT '' CHECK (prep_type IN ('', 'cefr', 'agency'));

-- Add skill column to questions
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS skill text DEFAULT 'general' CHECK (skill IN ('reading','writing','speaking','listening','general'));

-- Distribute CEFR questions across 4 skills (round-robin by question order within each category)
-- We use a CTE to assign skills cyclically: reading, writing, speaking, listening
DO $$
DECLARE
  cat_rec RECORD;
  q_rec RECORD;
  skill_arr text[] := ARRAY['reading','writing','speaking','listening'];
  idx int;
BEGIN
  FOR cat_rec IN SELECT id FROM categories WHERE type = 'cefr' LOOP
    idx := 0;
    FOR q_rec IN SELECT id FROM questions WHERE category_id = cat_rec.id ORDER BY created_at LOOP
      UPDATE questions SET skill = skill_arr[(idx % 4) + 1] WHERE id = q_rec.id;
      idx := idx + 1;
    END LOOP;
  END LOOP;
END $$;

-- Agency questions stay 'general' (already the default)
UPDATE questions SET skill = 'general'
  WHERE category_id IN (SELECT id FROM categories WHERE type = 'agency')
  AND skill IS DISTINCT FROM 'general';
