import { useEffect, useState } from 'react';
import {
  BookOpen, Trophy, Clock, Target, TrendingUp, ArrowRight, Award, Zap,
  ChevronRight, BookOpenText, PenLine, Mic, Headphones, Sparkles, Flame,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, type TestResult, type Category, type PlacementResult } from '../lib/supabase';

type Props = {
  onNavigate: (page: string) => void;
};

const skillMeta: Record<string, { label: string; icon: typeof BookOpenText; color: string }> = {
  reading: { label: 'Reading', icon: BookOpenText, color: 'text-nova-400 bg-nova-500/10' },
  writing: { label: 'Writing', icon: PenLine, color: 'text-accent-400 bg-accent-500/10' },
  speaking: { label: 'Speaking', icon: Mic, color: 'text-amber-400 bg-amber-500/10' },
  listening: { label: 'Listening', icon: Headphones, color: 'text-violet-400 bg-violet-500/10' },
};

export default function Dashboard({ onNavigate }: Props) {
  const { user, profile } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [placement, setPlacement] = useState<PlacementResult | null>(null);
  const [todayProgress, setTodayProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const prepType = profile?.prep_type || 'cefr';
  const isCEFR = prepType === 'cefr';
  const isPresident = profile?.agency_path === 'president';

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: resultsData }, { data: catsData }, { data: placementData }] = await Promise.all([
        supabase.from('test_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('placement_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      setResults((resultsData as TestResult[]) || []);
      setCategories((catsData as Category[]) || []);
      setPlacement(placementData as PlacementResult | null);

      // Calculate today's progress
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const dayNum = ((dayOfYear % 7) || 1);

      const catFilter = isCEFR
        ? catsData?.filter(c => c.type === 'cefr').map(c => c.id) || []
        : catsData?.filter(c => c.type === 'agency' && (c.path === profile?.agency_path || c.path === 'both')).map(c => c.id) || [];

      let totalLessons = 0;
      if (catFilter.length > 0) {
        const { data: lessons } = await supabase.from('lessons').select('id').in('category_id', catFilter).eq('day_number', dayNum);
        totalLessons = lessons?.length || 0;
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startOfToday.toISOString());

      setTodayProgress({
        completed: progressData?.length || 0,
        total: totalLessons,
      });

      setLoading(false);
    })();
  }, [user, isCEFR, profile?.agency_path]);

  const totalTests = results.length;
  const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0);
  const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTime = results.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
  const bestScore = results.length > 0
    ? Math.max(...results.map(r => r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0))
    : 0;

  const recentResults = results.slice(0, 5);
  const catMap = new Map(categories.map(c => [c.id, c]));
  const dailyPct = todayProgress.total > 0 ? Math.round((todayProgress.completed / todayProgress.total) * 100) : 0;

  const stats = [
    { label: 'Jami testlar', value: totalTests, icon: BookOpen, color: 'text-nova-400 bg-nova-500/10' },
    { label: 'O\'rtacha ball', value: `${avgScore}%`, icon: Target, color: 'text-accent-400 bg-accent-500/10' },
    { label: 'Eng yuqori', value: `${bestScore}%`, icon: Trophy, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Jami vaqt', value: `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`, icon: Clock, color: 'text-sky-400 bg-sky-500/10' },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nova-500 border-t-transparent" />
      </div>
    );
  }

  const roomLabel = isCEFR ? 'CEFR xonasi' : isPresident ? 'Prezident maktabi' : 'Ixtisoslashtirilgan';
  const roomRoute = isCEFR ? 'cefr-room' : 'agency-room';

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Salom, {profile?.full_name?.split(' ')[0] || 'O\'quvchi'}!
        </h1>
        <p className="mt-1 text-ink-400">
          {isCEFR ? 'CEFR ingliz tili tayyorgarligi' : isPresident ? 'Prezident maktabiga tayyorgarlik' : 'Ixtisoslashtirilgan maktabga tayyorgarlik'}
        </p>
      </div>

      {/* Daily Progress Bar */}
      <div className="card relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(51,128,255,0.08),_transparent_70%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nova-500/10 text-nova-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">
                {isPresident ? 'Bugungi vazifa' : 'Bugungi reja'}
              </div>
              <div className="text-sm text-ink-400">
                {todayProgress.total > 0
                  ? `${todayProgress.completed}/${todayProgress.total} dars bajarildi`
                  : 'Bugun uchun darslar yuklanmoqda'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold gradient-text">{dailyPct}%</div>
            <div className="text-xs text-ink-500">bugungi maqsad</div>
          </div>
        </div>
        <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-nova-500 to-accent-500 transition-all duration-500"
            style={{ width: `${dailyPct}%` }}
          />
        </div>
        {dailyPct === 100 && (
          <div className="relative mt-3 flex items-center gap-2 text-sm text-accent-400 animate-fade-in">
            <Sparkles className="h-4 w-4" /> Bugungi maqsad bajarildi! Ajoyib!
          </div>
        )}
      </div>

      {/* CEFR Placement Banner */}
      {isCEFR && !placement && (
        <button onClick={() => onNavigate('cefr-placement')} className="card group w-full overflow-hidden p-6 text-left transition-all hover:border-nova-500/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Target className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-semibold">Placement Test</div>
              <div className="text-sm text-ink-400">Boshlang\'ich darajangizni aniqlang (A1–B2)</div>
            </div>
            <ArrowRight className="h-5 w-5 text-ink-500 transition-all group-hover:translate-x-1 group-hover:text-nova-400" />
          </div>
        </button>
      )}

      {isCEFR && placement && (
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nova-500 to-accent-500 text-white">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-ink-400">Sizning darajangiz</div>
            <div className="font-display text-xl font-bold gradient-text">{placement.determined_level}</div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="mt-0.5 text-sm text-ink-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent tests */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">So\'nggi natijalar</h2>
              <button onClick={() => onNavigate(roomRoute)} className="btn-ghost text-xs">
                {roomLabel} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-800">
                  <BookOpen className="h-7 w-7 text-ink-500" />
                </div>
                <p className="text-sm text-ink-400">Hali test topshirmagansiz</p>
                <button onClick={() => onNavigate(roomRoute)} className="btn-primary mt-4">
                  Birinchi testni boshlash <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResults.map((r) => {
                  const cat = catMap.get(r.category_id);
                  const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
                  return (
                    <div key={r.id} className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-900/50 p-4 transition-all hover:border-ink-700">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nova-500/10 text-nova-400">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{cat?.name || 'Test'}</div>
                        <div className="text-xs text-ink-500">
                          {r.score}/{r.total_questions} to\'g\'ri • {Math.floor((r.time_spent_seconds || 0) / 60)}m {(r.time_spent_seconds || 0) % 60}s
                        </div>
                      </div>
                      <div className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${
                        pct >= 80 ? 'bg-accent-500/10 text-accent-400' :
                        pct >= 50 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick start */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-nova-400" />
              <h2 className="font-display text-lg font-semibold">Tezkor start</h2>
            </div>
            <p className="mb-4 text-sm text-ink-400">
              {isCEFR ? 'Ko\'nikmadan birini tanlang' : 'Fandan birini tanlang'}
            </p>
            <div className="space-y-2">
              {isCEFR ? (
                <>
                  {Object.entries(skillMeta).map(([key, sm]) => (
                    <button key={key} onClick={() => onNavigate(`cefr-skill:${key}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-ink-800 bg-ink-900/50 px-4 py-3 text-sm font-medium transition-all hover:border-nova-500/30 hover:bg-ink-800">
                      <span className="flex items-center gap-2">
                        <sm.icon className={`h-4 w-4 ${sm.color.split(' ')[0]}`} />
                        {sm.label}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-500" />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {categories.filter(c => c.type === 'agency' && (c.path === profile?.agency_path || c.path === 'both')).slice(0, 5).map((c) => (
                    <button key={c.id} onClick={() => onNavigate(`test:${c.slug}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-ink-800 bg-ink-900/50 px-4 py-3 text-sm font-medium transition-all hover:border-nova-500/30 hover:bg-ink-800">
                      <span className="truncate">{c.name}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-500" />
                    </button>
                  ))}
                </>
              )}
            </div>
            <button onClick={() => onNavigate(roomRoute)} className="btn-secondary mt-4 w-full">
              {roomLabel}ga kirish
            </button>
          </div>

          {/* Progress card */}
          {totalTests > 0 && (
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent-400" />
                <h2 className="font-display text-lg font-semibold">Rivojlanish</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink-400">Umumiy o\'tish foizi</span>
                    <span className="font-semibold text-accent-400">{avgScore}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-nova-500 to-accent-500 transition-all duration-500"
                      style={{ width: `${avgScore}%` }} />
                  </div>
                </div>
                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-ink-400">Jami savollar</span>
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-400">To\'g\'ri javoblar</span>
                  <span className="font-semibold text-accent-400">{totalCorrect}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
