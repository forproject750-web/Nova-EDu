import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Trophy, ArrowRight, ChevronLeft, Loader2, RotateCcw, Home } from 'lucide-react';
import { supabase, type TestResult, type Category, type Question } from '../lib/supabase';

type Props = {
  resultId: string;
  onNavigate: (page: string) => void;
};

export default function Result({ resultId, onNavigate }: Props) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: res } = await supabase
        .from('test_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();

      if (!res) {
        onNavigate('dashboard');
        return;
      }

      const r = res as TestResult;
      setResult(r);

      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('id', r.category_id)
        .maybeSingle();
      setCategory(cat as Category);

      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', r.category_id)
        .order('created_at', { ascending: true });
      setQuestions((qs as Question[]) || []);

      setLoading(false);
    })();
  }, [resultId, onNavigate]);

  if (loading || !result) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nova-500" />
      </div>
    );
  }

  const pct = result.total_questions > 0 ? Math.round((result.score / result.total_questions) * 100) : 0;
  const mins = Math.floor((result.time_spent_seconds || 0) / 60);
  const secs = (result.time_spent_seconds || 0) % 60;

  const grade =
    pct >= 90 ? { label: 'A\'lo', color: 'text-accent-400', bg: 'from-accent-500/20 to-accent-600/5', icon: Trophy } :
    pct >= 70 ? { label: 'Yaxshi', color: 'text-nova-400', bg: 'from-nova-500/20 to-nova-600/5', icon: CheckCircle2 } :
    pct >= 50 ? { label: 'Qoniqarli', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', icon: CheckCircle2 } :
    { label: 'Qayta urinish', color: 'text-red-400', bg: 'from-red-500/20 to-red-600/5', icon: XCircle };

  const GradeIcon = grade.icon;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <button onClick={() => onNavigate('dashboard')} className="btn-ghost -ml-2 text-xs">
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </button>

      {/* Score card */}
      <div className={`card relative overflow-hidden bg-gradient-to-br ${grade.bg} p-8 text-center`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03),_transparent_70%)]" />
        <div className="relative">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900/50 ${grade.color}`}>
            <GradeIcon className="h-8 w-8" />
          </div>
          <h1 className="font-display text-5xl font-bold">{pct}%</h1>
          <p className="mt-2 text-lg text-ink-300">
            {result.score} / {result.total_questions} to\'g\'ri javob
          </p>
          <div className={`mt-3 inline-flex items-center gap-2 rounded-full bg-ink-900/50 px-4 py-1.5 text-sm font-medium ${grade.color}`}>
            {grade.label}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {mins}m {secs}s
            </span>
            <span>•</span>
            <span>{category?.name}</span>
          </div>
        </div>
      </div>

      {/* Answer review */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Javoblarni ko\'rib chiqish</h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAnswer = (result.answers as Record<string, string>)[q.id];
            const isCorrect = userAnswer === q.correct_answer;
            const options = [
              { key: 'a', text: q.option_a },
              { key: 'b', text: q.option_b },
              { key: 'c', text: q.option_c },
              { key: 'd', text: q.option_d },
            ];

            return (
              <div key={q.id} className="card p-5">
                <div className="mb-3 flex items-start gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isCorrect ? 'bg-accent-500/10 text-accent-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-ink-500">Savol {i + 1}</div>
                    <p className="text-sm font-medium">{q.question_text}</p>
                  </div>
                </div>

                <div className="ml-10 space-y-2">
                  {options.map((opt) => {
                    const isUser = userAnswer === opt.key;
                    const isRight = q.correct_answer === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                          isRight
                            ? 'border-accent-500/30 bg-accent-500/10 text-accent-400'
                            : isUser
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-ink-800 bg-ink-900/30 text-ink-400'
                        }`}
                      >
                        <span className="font-bold uppercase">{opt.key}</span>
                        <span>{opt.text}</span>
                        {isRight && <CheckCircle2 className="ml-auto h-4 w-4" />}
                        {isUser && !isRight && <XCircle className="ml-auto h-4 w-4" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="ml-10 mt-3 rounded-lg border border-ink-800 bg-ink-900/50 px-3 py-2.5">
                    <div className="text-xs font-medium text-ink-500">Tushuntirish</div>
                    <p className="mt-0.5 text-sm text-ink-300">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={() => onNavigate(`test:${category?.slug}`)} className="btn-primary flex-1">
          <RotateCcw className="h-4 w-4" /> Qayta urinish
        </button>
        <button onClick={() => onNavigate('categories')} className="btn-secondary flex-1">
          Boshqa test <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={() => onNavigate('dashboard')} className="btn-secondary flex-1">
          <Home className="h-4 w-4" /> Dashboard
        </button>
      </div>
    </div>
  );
}
