import { useEffect, useState } from 'react';
import {
  Calculator, Atom, FlaskConical, Dna, Languages, Landmark, Lightbulb, Brain,
  ArrowRight, Loader2, Trophy, Clock, TrendingUp, ChevronRight, Crown, School,
  Award, Star, Target,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, type Category, type TestResult, type DailyProgress } from '../lib/supabase';

type Props = {
  onNavigate: (page: string) => void;
};

const categoryIconMap: Record<string, typeof Calculator> = {
  Calculator, Atom, FlaskConical, Dna, Languages, Landmark, Lightbulb, Brain,
};

const colorMap: Record<string, string> = {
  orange: 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20',
  green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20',
  blue: 'from-nova-500/20 to-nova-600/5 text-nova-400 border-nova-500/20',
  cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
  violet: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20',
  sky: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20',
  rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
  teal: 'from-teal-500/20 to-teal-600/5 text-teal-400 border-teal-500/20',
};

export default function AgencyRoom({ onNavigate }: Props) {
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const agencyPath = profile?.agency_path || 'specialized';
  const isPresident = agencyPath === 'president';

  useEffect(() => {
    if (!user) return;

    (async () => {
      const pathFilter = isPresident ? 'president' : 'specialized';

      const [{ data: catsData }, { data: progressData }, { data: resultsData }] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('type', 'agency')
          .or(`path.eq.${pathFilter},path.eq.both`)
          .order('sort_order', { ascending: true }),
        supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('test_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setCategories((catsData as Category[]) || []);
      setProgress((progressData as DailyProgress[]) || []);
      setResults((resultsData as TestResult[]) || []);
      setLoading(false);
    })();
  }, [user, isPresident]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nova-500" />
      </div>
    );
  }

  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Daily progress: count today's lessons
  const today = new Date().toISOString().split('T')[0];
  const todayProgress = progress.filter((p) => p.created_at?.startsWith(today));
  const completedToday = todayProgress.filter((p) => p.status === 'completed').length;
  const totalToday = todayProgress.length || 0;
  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Recent agency test results
  const agencyResults = results
    .filter((r) => catMap.has(r.category_id))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isPresident ? 'bg-amber-500/15 text-amber-400' : 'bg-nova-500/15 text-nova-400'
            }`}
          >
            {isPresident ? <Crown className="h-6 w-6" /> : <School className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {isPresident ? 'Prezident Maktabi' : 'Agentlik Maktabi'}
            </h1>
            <p className="mt-1 text-ink-400">
              {isPresident
                ? 'Quvnoq va qiziqarli mashg\'ulotlar bilan tayyorgarlik'
                : 'Maxsus fanlar bo\'yicha professional tayyorgarlik'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily progress bar */}
      <div
        className={`card animate-slide-up bg-gradient-to-br p-6 ${
          isPresident
            ? 'from-amber-500/10 to-orange-500/5 border-amber-500/20'
            : 'from-nova-500/10 to-accent-500/5 border-nova-500/20'
        }`}
        style={{ animationDelay: '0.05s' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target
              className={`h-5 w-5 ${isPresident ? 'text-amber-400' : 'text-nova-400'}`}
            />
            <span className="font-display text-lg font-semibold">
              {isPresident
                ? `Bugungi vazifa: ${completedToday}/${totalToday} tugadi!`
                : `Bugungi reja: ${completedToday}/${totalToday} dars bajarildi`}
            </span>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              isPresident
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-nova-500/15 text-nova-400'
            }`}
          >
            {progressPct}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-ink-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPresident
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-nova-500 to-accent-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {totalToday === 0 && (
          <p className="mt-3 text-sm text-ink-400">
            {isPresident
              ? 'Bugun hali vazifa yo\'q — birinchi mashg\'ulotni boshlang!'
              : 'Bugun uchun reja belgilanmagan — fan tanlab boshlang.'}
          </p>
        )}
      </div>

      {/* Subject cards */}
      <div>
        <div className="mb-4 flex items-center gap-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {isPresident ? (
            <Star className="h-5 w-5 text-amber-400" />
          ) : (
            <Calculator className="h-5 w-5 text-nova-400" />
          )}
          <h2 className="font-display text-xl font-semibold">
            {isPresident ? 'Quvnoq Fanlar' : 'Fanlar'}
          </h2>
          <span className="rounded-full bg-ink-800 px-2.5 py-0.5 text-xs text-ink-400">
            {categories.length} ta
          </span>
        </div>

        <div
          className={`grid gap-4 ${
            isPresident
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {categories.map((c, i) => {
            const Icon = categoryIconMap[c.icon_name] || Calculator;
            const colorClass = colorMap[c.color] || colorMap.orange;
            return (
              <button
                key={c.id}
                onClick={() => onNavigate(`test:${c.slug}`)}
                className={`card group relative overflow-hidden bg-gradient-to-br ${colorClass} text-left transition-all hover:scale-[1.03] active:scale-[0.99] animate-slide-up ${
                  isPresident ? 'rounded-2xl p-6' : 'rounded-xl p-5'
                }`}
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              >
                <div
                  className={`mb-4 flex items-center justify-between ${
                    isPresident ? '' : 'mb-3'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center rounded-2xl bg-ink-900/50 ${
                      isPresident ? 'h-14 w-14' : 'h-11 w-11 rounded-xl'
                    }`}
                  >
                    <Icon className={isPresident ? 'h-7 w-7' : 'h-5 w-5'} />
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 ${
                      isPresident ? 'h-6 w-6' : ''
                    }`}
                  />
                </div>
                <h3
                  className={`mb-1 font-display font-bold text-white ${
                    isPresident ? 'text-lg' : 'text-base'
                  }`}
                >
                  {c.name}
                </h3>
                <p
                  className={`line-clamp-2 text-ink-300 ${
                    isPresident ? 'text-sm' : 'text-xs'
                  }`}
                >
                  {c.description}
                </p>
                <div
                  className={`mt-4 flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100 ${
                    isPresident ? 'text-base' : ''
                  }`}
                >
                  {isPresident ? 'Boshlash' : 'Testni boshlash'}{' '}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent test results - only for specialized path */}
      {!isPresident && agencyResults.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-xl font-semibold">So\'nggi natijalar</h2>
          </div>
          <div className="card p-6">
            <div className="space-y-3">
              {agencyResults.map((r) => {
                const cat = catMap.get(r.category_id);
                const pct =
                  r.total_questions > 0
                    ? Math.round((r.score / r.total_questions) * 100)
                    : 0;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-900/50 p-4 transition-all hover:border-ink-700"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nova-500/10 text-nova-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {cat?.name || 'Test'}
                      </div>
                      <div className="text-xs text-ink-500">
                        {r.score}/{r.total_questions} to\'g\'ri •{' '}
                        {Math.floor((r.time_spent_seconds || 0) / 60)}m{' '}
                        {(r.time_spent_seconds || 0) % 60}s
                      </div>
                    </div>
                    <div
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${
                        pct >= 80
                          ? 'bg-accent-500/10 text-accent-400'
                          : pct >= 50
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats footer - specialized path */}
      {!isPresident && agencyResults.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-nova-500/10 text-nova-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-bold">{agencyResults.length}</div>
            <div className="mt-0.5 text-sm text-ink-400">Jami testlar</div>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-bold">
              {agencyResults.length > 0
                ? Math.max(
                    ...agencyResults.map((r) =>
                      r.total_questions > 0
                        ? Math.round((r.score / r.total_questions) * 100)
                        : 0
                    )
                )
                : 0}
              %
            </div>
            <div className="mt-0.5 text-sm text-ink-400">Eng yuqori ball</div>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-bold">
              {Math.floor(
                agencyResults.reduce(
                  (sum, r) => sum + (r.time_spent_seconds || 0),
                  0
                ) / 60
              )}
              m
            </div>
            <div className="mt-0.5 text-sm text-ink-400">Jami vaqt</div>
          </div>
        </div>
      )}
    </div>
  );
}
