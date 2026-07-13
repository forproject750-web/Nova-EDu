import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'cefr' | 'agency';
  level: string;
  icon_name: string;
  color: string;
  sort_order: number;
  path: '' | 'president' | 'specialized' | 'both';
};

export type Question = {
  id: string;
  category_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skill: 'reading' | 'writing' | 'speaking' | 'listening' | 'general';
  passage_text: string;
  audio_url: string;
  lesson_id: string | null;
};

export type TestResult = {
  id: string;
  user_id: string;
  category_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  time_spent_seconds: number;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  target_exam: string;
  age: number | null;
  prep_type: '' | 'cefr' | 'agency';
  phone: string;
  agency_path: '' | 'president' | 'specialized';
  created_at: string;
};

export type Lesson = {
  id: string;
  category_id: string;
  skill: 'reading' | 'writing' | 'speaking' | 'listening' | 'general';
  title: string;
  description: string;
  content: Record<string, unknown>;
  day_number: number;
  order_index: number;
  created_at: string;
};

export type DailyProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  score: number;
  completed_at: string | null;
  created_at: string;
};

export type PlacementResult = {
  id: string;
  user_id: string;
  determined_level: 'A1' | 'A2' | 'B1' | 'B2';
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  created_at: string;
};

export type Essay = {
  id: string;
  user_id: string;
  prompt: string;
  essay_text: string;
  ai_score: number;
  ai_feedback: string;
  level: string;
  created_at: string;
};

export type SpeakingRecord = {
  id: string;
  user_id: string;
  prompt: string;
  audio_url: string;
  ai_feedback: string;
  duration_seconds: number;
  created_at: string;
};
