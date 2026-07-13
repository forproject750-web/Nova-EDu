import { useEffect, useState, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, type Question, type Category } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type Props = {
  slug: string;
  onNavigate: (page: string) => void;
};

export default function Test({ slug, onNavigate }: Props) {
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!cat) {
        onNavigate('categories');
        return;
      }

      setCategory(cat as Category);

      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', (cat as Category).id)
        .order('created_at', { ascending: true });

      setQuestions((qs as Question[]) || []);
      setStartTime(Date.now());
      setLoading(false);
    })();
  }, [slug, onNavigate]);

  useEffect(() => {
    if (loading || questions.length === 0) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, questions.length, startTime]);

  const handleAnswer = useCallback((questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user || !category) return;
    setSubmitting(true);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_answer) score++;
    }

    const { data, error } = await supabase
      .from('test_results')
      .insert({
        user_id: user.id,
        category_id: category.id,
        score,
        total_questions: questions.length,
        answers,
        time_spent_seconds: timeSpent,
      })
      .select('*')
      .maybeSingle();

    setSubmitting(false);

    if (!error && data) {
      onNavigate(`result:${(data as { id: string }).id}`);
    }
  }, [user, category, questions, answers, startTime, onNavigate]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nova-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-ink-500" />
        <p className="text-ink-400">Bu kategoriyada hozircha savollar yo\'q</p>
        <button onClick={() => onNavigate('categories')} className="btn-primary mt-4">
          Kategoriyalarga qaytish
        </button>
      </div>
    );
  }

  const q = questions[current];
  const options = [
    { key: 'a', text: q.option_a },
    { key: 'b', text: q.option_b },
    { key: 'c', text: q.option_c },
    { key: 'd', text: q.option_d },
  ];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => onNavigate('categories')} className="btn-ghost mb-2 -ml-2 text-xs">
            <ChevronLeft className="h-4 w-4" /> Kategoriyalar
          </button>
          <h1 className="font-display text-2xl font-bold">{category?.name}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 px-4 py-2.5">
          <Clock className="h-4 w-4 text-nova-400" />
          <span className="font-mono text-sm font-semibold tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-2 flex justify-between text-xs text-ink-400">
          <span>Savol {current + 1} / {questions.length}</span>
          <span>{answeredCount} / {questions.length} javob berilgan</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-nova-500 to-accent-500 transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="card p-6 animate-scale-in" key={q.id}>
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            q.difficulty === 'easy' ? 'bg-accent-500/10 text-accent-400' :
            q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {q.difficulty === 'easy' ? 'Oson' : q.difficulty === 'medium' ? 'O\'rta' : 'Qiyin'}
          </span>
        </div>
        <h2 className="mb-6 text-lg font-medium leading-relaxed">{q.question_text}</h2>

        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = answers[q.id] === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleAnswer(q.id, opt.key)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-nova-500 bg-nova-500/10 text-white'
                    : 'border-ink-700 bg-ink-900/50 text-ink-200 hover:border-ink-600 hover:bg-ink-800'
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase transition-all ${
                  isSelected ? 'bg-nova-500 text-white' : 'bg-ink-800 text-ink-400'
                }`}>
                  {opt.key}
                </div>
                <span className="text-sm">{opt.text}</span>
                {isSelected && <CheckCircle2 className="ml-auto h-5 w-5 text-nova-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" /> Oldingi
        </button>

        {/* Question dots */}
        <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === current ? 'bg-nova-500 scale-125' :
                answers[qq.id] ? 'bg-accent-500' : 'bg-ink-700'
              }`}
            />
          ))}
        </div>

        {current === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            className="btn-primary"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                Yakunlash
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            className="btn-primary"
          >
            Keyingi <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!allAnswered && current === questions.length - 1 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {questions.length - answeredCount} ta savolga javob berilmagan. Yakunlash uchun barchasiga javob bering.
        </div>
      )}
    </div>
  );
}
