/*
# NOVA EDU Platform Schema

1. Purpose
   NOVA EDU helps students prepare for CEFR (A1–C2) English proficiency exams
   and Agency school entrance exams (math, physics, English, etc.).

2. New Tables
   - `profiles` — extends auth.users with display name, avatar, target exam
   - `categories` — exam categories (CEFR levels + Agency school subjects)
   - `questions` — multiple-choice questions belonging to a category
   - `test_results` — stores each completed test attempt with score and answers

3. Columns
   profiles:
     id (uuid, FK auth.users), full_name, avatar_url, target_exam, created_at
   categories:
     id (uuid), name, slug, description, type ('cefr'|'agency'),
     level (for CEFR: A1–C2), icon_name, color, sort_order, created_at
   questions:
     id (uuid), category_id (FK), question_text, option_a, option_b,
     option_c, option_d, correct_answer ('a'|'b'|'c'|'d'),
     explanation, difficulty ('easy'|'medium'|'hard'), created_at
   test_results:
     id (uuid), user_id (FK auth.users, default auth.uid()),
     category_id (FK), score (int), total_questions (int),
     answers (jsonb), time_spent_seconds (int), created_at

4. Security
   - RLS enabled on all tables.
   - profiles: owner-scoped CRUD (authenticated only).
   - categories: public read (anon + authenticated), no writes from frontend.
   - questions: public read (anon + authenticated), no writes from frontend.
   - test_results: owner-scoped CRUD (authenticated only).

5. Notes
   - user_id columns default to auth.uid() so frontend inserts work
     without explicitly passing user_id.
   - Seed data includes CEFR categories (A1–C2) and Agency school
     subjects (Mathematics, Physics, Chemistry, Biology, English, History)
     with sample questions for each.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  target_exam text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  type text NOT NULL DEFAULT 'cefr' CHECK (type IN ('cefr','agency')),
  level text DEFAULT '',
  icon_name text DEFAULT 'BookOpen',
  color text DEFAULT 'blue',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  explanation text DEFAULT '',
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_questions" ON questions;
CREATE POLICY "read_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);

-- TEST RESULTS
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_spent_seconds int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_results" ON test_results;
CREATE POLICY "select_own_results" ON test_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_results" ON test_results;
CREATE POLICY "insert_own_results" ON test_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_results" ON test_results;
CREATE POLICY "update_own_results" ON test_results FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_results" ON test_results;
CREATE POLICY "delete_own_results" ON test_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_category_id ON test_results(category_id);

-- SEED: CATEGORIES
INSERT INTO categories (name, slug, description, type, level, icon_name, color, sort_order) VALUES
('A1 - Beginner', 'cefr-a1', 'Basic phrases and everyday expressions. Introduce yourself and ask simple questions.', 'cefr', 'A1', 'Sprout', 'emerald', 1),
('A2 - Elementary', 'cefr-a2', 'Common daily expressions, routine tasks, describe background and immediate needs.', 'cefr', 'A2', 'Leaf', 'green', 2),
('B1 - Intermediate', 'cefr-b1', 'Deal with most travel situations, produce simple connected text on familiar topics.', 'cefr', 'B1', 'TreePine', 'blue', 3),
('B2 - Upper Intermediate', 'cefr-b2', 'Interact with fluency, discuss advantages/disadvantages, write detailed texts.', 'cefr', 'B2', 'Mountain', 'cyan', 4),
('C1 - Advanced', 'cefr-c1', 'Express ideas fluently, use language flexibly for social, academic and professional purposes.', 'cefr', 'C1', 'Star', 'indigo', 5),
('C2 - Proficient', 'cefr-c2', 'Understand virtually everything, summarize information from different sources, express precisely.', 'cefr', 'C2', 'Crown', 'violet', 6),
('Mathematics', 'agency-math', 'Algebra, geometry, calculus and problem-solving for Agency school entrance exams.', 'agency', '', 'Calculator', 'orange', 7),
('Physics', 'agency-physics', 'Mechanics, electricity, thermodynamics and modern physics preparation.', 'agency', '', 'Atom', 'sky', 8),
('Chemistry', 'agency-chemistry', 'Organic, inorganic and physical chemistry fundamentals for entrance exams.', 'agency', '', 'FlaskConical', 'rose', 9),
('Biology', 'agency-biology', 'Cell biology, genetics, human anatomy and ecology for entrance exams.', 'agency', '', 'Dna', 'lime', 10),
('English Grammar', 'agency-english', 'Advanced grammar, vocabulary and reading comprehension for Agency school exams.', 'agency', '', 'Languages', 'amber', 11),
('History', 'agency-history', 'World and national history, key events and historical analysis.', 'agency', '', 'Landmark', 'teal', 12)
ON CONFLICT (slug) DO NOTHING;

-- SEED: QUESTIONS (CEFR A1)
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='cefr-a1'), 'What is the correct greeting in the morning?', 'Good night', 'Good morning', 'Good evening', 'Goodbye', 'b', 'Good morning is the standard greeting before noon.', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a1'), 'Choose the correct article: "___ apple"', 'A', 'An', 'The', 'No article', 'b', 'Use "an" before words starting with a vowel sound.', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a1'), 'What does "Hello" mean?', 'Goodbye', 'Thank you', 'A greeting', 'Sorry', 'c', 'Hello is a common greeting used to say hi.', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a1'), 'Complete: "My name ___ John."', 'am', 'is', 'are', 'be', 'b', 'With singular subjects we use "is".', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a1'), 'Which is a question word?', 'Book', 'Where', 'Table', 'Run', 'b', 'Where is used to ask about places.', 'easy');

-- CEFR A2
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='cefr-a2'), 'Choose the past tense of "go":', 'goed', 'went', 'gone', 'going', 'b', 'The past tense of "go" is "went".', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a2'), 'Complete: "I ___ TV when she called."', 'watch', 'watched', 'was watching', 'am watching', 'c', 'Past continuous is used for an action in progress when interrupted.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-a2'), 'Which word means "happy"?', 'Sad', 'Angry', 'Glad', 'Tired', 'c', 'Glad means happy or pleased.', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a2'), 'Choose the correct preposition: "The book is ___ the table."', 'in', 'on', 'at', 'to', 'b', 'Use "on" for surfaces like tables.', 'easy'),
((SELECT id FROM categories WHERE slug='cefr-a2'), 'Complete: "She ___ to school every day."', 'go', 'goes', 'going', 'gone', 'b', 'Third person singular adds -es: goes.', 'easy');

-- CEFR B1
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='cefr-b1'), 'Choose the correct form: "If it rains, we ___ stay home."', 'will', 'would', 'had', 'have', 'a', 'First conditional uses will + base verb in the result clause.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-b1'), 'Which sentence uses the present perfect correctly?', 'I am lived here for 5 years.', 'I have lived here for 5 years.', 'I living here for 5 years.', 'I will lived here for 5 years.', 'b', 'Present perfect: have/has + past participle.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-b1'), 'What does "ambitious" mean?', 'Lazy', 'Having strong desire for success', 'Boring', 'Angry', 'b', 'Ambitious means having a strong desire to succeed.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-b1'), 'Choose the passive voice: "The cake ___ by Mary."', 'bakes', 'was baked', 'is baking', 'baked', 'b', 'Passive: be + past participle. "was baked" is correct.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-b1'), 'Complete: "I wish I ___ taller."', 'am', 'was', 'were', 'be', 'c', 'After "I wish", use "were" for present unreal situations.', 'hard');

-- CEFR B2
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='cefr-b2'), 'Choose the correct inversion: "Not only ___ late, but he also forgot the tickets."', 'he was', 'was he', 'he is', 'is he', 'b', 'Negative adverbial at the start triggers inversion: was he.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-b2'), 'Which is a correct mixed conditional?', 'If I had studied, I would pass.', 'If I studied, I will pass.', 'If I had studied, I will pass.', 'If I study, I would have passed.', 'a', 'Past condition + present result uses would + base.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-b2'), 'What does "meticulous" mean?', 'Careless', 'Very careful about details', 'Fast', 'Slow', 'b', 'Meticulous means showing great attention to detail.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-b2'), 'Choose the correct cleft sentence: "It was John who ___ the window."', 'break', 'breaks', 'broke', 'breaking', 'c', 'Cleft sentence "It was X who..." uses past tense for past events.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-b2'), 'Which phrasal verb means "to postpone"?', 'Put off', 'Put up', 'Put down', 'Put away', 'a', 'Put off means to delay or postpone.', 'medium');

-- CEFR C1
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='cefr-c1'), 'Choose the correct subjunctive: "The committee insisted that he ___ present."', 'is', 'be', 'was', 'being', 'b', 'Subjunctive after insist/suggest uses base form "be".', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c1'), 'What does "ubiquitous" mean?', 'Rare', 'Present everywhere', 'Unique', 'Invisible', 'b', 'Ubiquitous means present, appearing, or found everywhere.', 'medium'),
((SELECT id FROM categories WHERE slug='cefr-c1'), 'Choose the correct participle clause: "___ the report, she left the office."', 'Finishing', 'Having finished', 'Finished', 'To finish', 'b', 'Perfect participle "having finished" shows completed prior action.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c1'), 'Which is a correct fronted negative?', 'Seldom I have seen such beauty.', 'Seldom have I seen such beauty.', 'Seldom I saw such beauty.', 'Seldom did I seen such beauty.', 'b', 'Fronted negative adverb triggers inversion: have I.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c1'), 'What does "to mitigate" mean?', 'To increase', 'To reduce severity', 'To eliminate', 'To delay', 'b', 'Mitigate means to make less severe or painful.', 'medium');

-- CEFR C2
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='cefr-c2'), 'Choose the correct nuance: "His argument was ___ flawed."', 'subtly', 'subtle', 'subtleness', 'subtling', 'a', 'Adverb "subtly" modifies the adjective "flawed".', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c2'), 'What does "obfuscate" mean?', 'To clarify', 'To deliberately make unclear', 'To simplify', 'To repeat', 'b', 'Obfuscate means to deliberately make something unclear or confusing.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c2'), 'Choose the correct elliptical construction: "She can play piano, and so ___ John."', 'can', 'does', 'plays', 'is', 'a', 'After "so", repeat the auxiliary: so can John.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c2'), 'What does "a pyrrhic victory" refer to?', 'An easy win', 'A victory won at too great a cost', 'A shared victory', 'A defeat', 'b', 'A Pyrrhic victory is won at such cost it is tantamount to defeat.', 'hard'),
((SELECT id FROM categories WHERE slug='cefr-c2'), 'Choose the correct inversion: "Rarely ___ such dedication."', 'we see', 'do we see', 'we do see', 'seen we', 'b', 'Fronted "rarely" triggers inversion: do we see.', 'hard');

-- AGENCY: MATHEMATICS
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='agency-math'), 'Solve: 2x + 6 = 14. What is x?', '3', '4', '5', '6', 'b', '2x = 14 - 6 = 8, so x = 4.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-math'), 'What is the area of a circle with radius 5? (π ≈ 3.14)', '78.5', '31.4', '15.7', '62.8', 'a', 'Area = πr² = 3.14 × 25 = 78.5.', 'medium'),
((SELECT id FROM categories WHERE slug='agency-math'), 'If f(x) = x² + 3x, what is f(2)?', '10', '8', '12', '6', 'a', 'f(2) = 4 + 6 = 10.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-math'), 'What is the derivative of x³?', '3x²', '3x', 'x²', '3', 'a', 'Power rule: d/dx(xⁿ) = nxⁿ⁻¹, so 3x².', 'medium'),
((SELECT id FROM categories WHERE slug='agency-math'), 'In a triangle, if two angles are 50° and 60°, what is the third angle?', '60°', '70°', '80°', '90°', 'b', 'Angles sum to 180°, so 180 - 50 - 60 = 70°.', 'easy');

-- AGENCY: PHYSICS
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='agency-physics'), 'What is the SI unit of force?', 'Joule', 'Watt', 'Newton', 'Pascal', 'c', 'Force is measured in Newtons (N).', 'easy'),
((SELECT id FROM categories WHERE slug='agency-physics'), 'What is the acceleration due to gravity on Earth?', '9.8 m/s²', '8.9 m/s²', '10.8 m/s²', '9.8 km/s²', 'a', 'Standard gravity is approximately 9.8 m/s².', 'easy'),
((SELECT id FROM categories WHERE slug='agency-physics'), 'Which law states "For every action, there is an equal and opposite reaction"?', 'First Law', 'Second Law', 'Third Law', 'Law of Gravitation', 'c', 'Newton''s Third Law of Motion.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-physics'), 'What is the speed of light in vacuum?', '3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁵ m/s', 'a', 'Light travels at approximately 3×10⁸ m/s in vacuum.', 'medium'),
((SELECT id FROM categories WHERE slug='agency-physics'), 'What does Ohm''s Law state?', 'V = IR', 'V = I/R', 'V = R/I', 'I = V×R', 'a', 'Voltage equals current times resistance: V = IR.', 'medium');

-- AGENCY: CHEMISTRY
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='agency-chemistry'), 'What is the chemical symbol for Gold?', 'Go', 'Au', 'Gd', 'Ag', 'b', 'Au comes from the Latin "aurum" meaning gold.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-chemistry'), 'What is the pH of a neutral solution?', '0', '7', '14', '1', 'b', 'A neutral solution has pH 7 at 25°C.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-chemistry'), 'How many electrons does a carbon atom have?', '4', '6', '8', '12', 'b', 'Carbon has atomic number 6, so 6 electrons.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-chemistry'), 'What type of bond is formed between Na and Cl?', 'Covalent', 'Ionic', 'Metallic', 'Hydrogen', 'b', 'Na donates an electron to Cl, forming an ionic bond.', 'medium'),
((SELECT id FROM categories WHERE slug='agency-chemistry'), 'What is the most abundant gas in Earth''s atmosphere?', 'Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen', 'c', 'Nitrogen makes up about 78% of Earth''s atmosphere.', 'medium');

-- AGENCY: BIOLOGY
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='agency-biology'), 'What is the powerhouse of the cell?', 'Nucleus', 'Mitochondria', 'Ribosome', 'Golgi body', 'b', 'Mitochondria produce ATP, the cell''s energy currency.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-biology'), 'What does DNA stand for?', 'Deoxyribonucleic Acid', 'Dinucleic Acid', 'Deoxyribose Nuclear Acid', 'Double Nucleic Acid', 'a', 'DNA = Deoxyribonucleic Acid.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-biology'), 'How many chromosomes do humans have?', '23', '46', '48', '44', 'b', 'Humans have 23 pairs = 46 chromosomes.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-biology'), 'What process do plants use to make food?', 'Respiration', 'Photosynthesis', 'Digestion', 'Fermentation', 'b', 'Photosynthesis converts light energy into chemical energy.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-biology'), 'Which blood type is the universal donor?', 'A', 'B', 'AB', 'O negative', 'd', 'O negative blood can be donated to any blood type.', 'medium');

-- AGENCY: ENGLISH GRAMMAR
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='agency-english'), 'Choose the correct sentence:', 'He don''t like tea.', 'He doesn''t likes tea.', 'He doesn''t like tea.', 'He not like tea.', 'c', 'Doesn''t + base verb: doesn''t like.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-english'), 'Identify the adverb: "She sings beautifully."', 'She', 'sings', 'beautifully', 'None', 'c', 'Beautifully modifies the verb sings.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-english'), 'Choose the correct article: "___ Himalayas are majestic."', 'A', 'An', 'The', 'No article', 'c', 'Use "the" with mountain ranges.', 'medium'),
((SELECT id FROM categories WHERE slug='agency-english'), 'Which is a correct tag question? "You''re coming, ___?"', 'are you', 'aren''t you', 'do you', 'don''t you', 'b', 'Positive statement + negative tag: aren''t you.', 'medium'),
((SELECT id FROM categories WHERE slug='agency-english'), 'Choose the correct relative pronoun: "The book ___ I read was great."', 'who', 'whose', 'which', 'where', 'c', 'Use "which" for things in a defining relative clause.', 'medium');

-- AGENCY: HISTORY
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
((SELECT id FROM categories WHERE slug='agency-history'), 'In which year did World War II end?', '1943', '1944', '1945', '1946', 'c', 'WWII ended in September 1945 with Japan''s surrender.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-history'), 'Who was the first President of the United States?', 'Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams', 'b', 'George Washington served from 1789 to 1797.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-history'), 'The Great Wall of China was primarily built to defend against which group?', 'Mongols', 'Japanese', 'Koreans', 'Vietnamese', 'a', 'The Great Wall defended against nomadic Mongol tribes.', 'medium'),
((SELECT id FROM categories WHERE slug='agency-history'), 'Which empire was ruled by Julius Caesar?', 'Greek', 'Roman', 'Persian', 'Egyptian', 'b', 'Julius Caesar was a Roman general and statesman.', 'easy'),
((SELECT id FROM categories WHERE slug='agency-history'), 'The Silk Road connected which two regions?', 'Europe and Africa', 'Asia and Europe', 'Africa and Asia', 'Americas and Europe', 'b', 'The Silk Road linked East Asia to the Mediterranean.', 'medium');
