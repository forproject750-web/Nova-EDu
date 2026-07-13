import { useEffect, useState } from 'react';
import {
  Headphones,
  BookOpenText,
  PenLine,
  Mic,
  ArrowRight,
  Loader2,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, type PlacementResult, type TestResult, type Lesson, type DailyProgress, type Category } from '../lib/supabase';

type Props = {
  onNavigate: (page: string) => void;
};

type Skill = {
  key: 'listening' | 'reading' | 'writing' | 'speaking';
  label: string;
  desc: string;
  icon: typeof Headphones;
  gradient: string;
  iconWrap: string;
  iconText: string;
  border: string;
  ring: string;
  cta: string;
};

const skills: Skill[] = [
  {
    key: 'listening',
    label: 'Listening',
    desc: "Audiodan kelib chiqib javob berish",
    icon: Headphones,
    gradient: 'from-violet-500/20 to-violet-600/5',
    iconWrap: 'bg-violet-500/15',
    iconText: 'text-violet-400',
    border: 'hover:border-violet-500/40',
    ring: 'hover:shadow-violet-500/20',
    cta: 'bg-violet-500 hover:bg-violet-600 hover:shadow-violet-500/25',
  },
  {
    key: 'reading',
    label: 'Reading',
    desc: "Matnni o'qish va tushunish",
    icon: BookOpenText,
    gradient: 'from-nova-500/20 to-nova-600/5',
    iconWrap: 'bg-nova-500/15',
    iconText: 'text-nova-400',
    border: 'hover:border-nova-500/40',
    ring: 'hover:shadow-nova-500/20',
    cta: 'bg-nova-500 hover:bg-nova-600 hover:shadow-nova-500/25',
  },
  {
    key: 'writing',
    label: 'Writing',
    desc: 'Insho yozish va AI baholash',
    icon: PenLine,
    gradient: 'from-accent-500/20 to-accent-600/5',
    iconWrap: 'bg-accent-500/15',
    iconText: 'text-accent-400',
    border: 'hover:border-accent-500/40',
    ring: 'hover:shadow-accent-500/20',
    cta: 'bg-accent-500 hover:bg-accent-600 hover:shadow-accent-500/25',
  },
  {
    key: 'speaking',
    label: 'Speaking',
    desc: "Ovozni yozib olish va AI muloqot",
    icon: Mic,
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconWrap: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    border: 'hover:border-amber-500/40',
    ring: 'hover:shadow-amber-500/20',
    cta: 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25',
  },
];

export default function CefrRoom({ onNavigate }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [placement, setPlacement] = useState<PlacementResult | null>(null);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayDone, setTodayDone] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startIso = startOfDay.toISOString();

      const [
        { data: placementData },
        { data: catsData },
        { data: resultsData },
      ] = await Promise.all([
        supabase
          .from('placement_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('categories')
          .select('*')
          .eq('type', 'cefr')
          .order('sort_order', { ascending: true }),
        supabase
          .from('test_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setPlacement((placementData as PlacementResult | null) || null);
      setCategories((catsData as Category[]) || []);
      setRecentResults((resultsData as TestResult[]) || []);

      const cefrCatIds = ((catsData as Category[]) || []).map((c) => c.id);

      if (cefrCatIds.length > 0) {
        const dayOfYear = Math.floor(
          (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
        );
        const todayDay = ((dayOfYear - 1) % 7) + 1;

        const { data: todayLessons } = await supabase
          .from('lessons')
          .select('*')
          .in('category_id', cefrCatIds)
          .eq('day_number', todayDay)
          .order('order_index', { ascending: true });

        const lessons = (todayLessons as Lesson[]) || [];
        setTodayTotal(lessons.length);

        if (lessons.length > 0) {
          const lessonIds = lessons.map((l) => l.id);
          const { data: progress } = await supabase
            .from('daily_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds)
            .gte('created_at', startIso);

          const progressRows = (progress as DailyProgress[]) || [];
          const done = progressRows.filter((p) => p.status === 'completed').length;
          setTodayDone(done);
        }
      }

      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nova-500" />
      </div>
    );
  }

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
  const hasPlacement = !!placement;
  const level = placement?.determined_level;

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/50 px-3 py-1 text-xs font-medium text-ink-300">
          <Sparkles className="h-3.5 w-3.5 text-nova-400" />
          CEFR Ingliz Tili Moduli
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          CEFR <span className="gradient-text">Xonasi</span>
        </h1>
        <p className="mt-1.5 text-ink-400">
          4 ta asosiy ko'nikma: Listening, Reading, Writing, Speaking
        </p>
      </div>

      <section className="animate-slide-up">
        {hasPlacement ? (
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-nova-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-500 to-accent-500 text-white shadow-lg shadow-nova-500/20">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-ink-400">Sizning darajangiz</p>
                  <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                    <span className="bg-gradient-to-r from-nova-400 to-accent-400 bg-clip-text text-transparent">
                      {level}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {placement!.total_questions > 0
                      ? `${placement!.score}/${placement!.total_questions} to'g'ri javob`
                      : 'Placement test yakunlandi'}
                  </p>
                </div>
              </div>
              <button onClick={() => onNavigate('cefr-placement')} className="btn-secondary">
                Qayta topshirish <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="card relative overflow-hidden bg-gradient-to-br from-nova-500/15 via-ink-900/80 to-accent-500/10 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nova-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-500 to-accent-500 text-white shadow-lg shadow-nova-500/25">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold sm:text-2xl">Placement Test</h2>
                  <p className="mt-1 max-w-md text-sm text-ink-400">
                    Darajangizni aniqlang (A1–B2) va sizga mos darslar bilan
                    ishni boshlang. Test qisqa va to'g'ri yo'nalish beradi.
                  </p>
                </div>
              </div>
              <button onClick={() => onNavigate('cefr-placement')} className="btn-primary w-full shrink-0 sm:w-auto">
                Darajani aniqlash <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-nova-400" />
          <h2 className="font-display text-xl font-semibold">Ko'nikma xonalari</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((s, i) => (
            <div key={s.key} className={`card group relative overflow-hidden bg-gradient-to-br ${s.gradient} p-6 transition-all duration-300 hover:scale-[1.02] ${s.border} hover:shadow-lg ${s.ring} animate-slide-up`}
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${s.iconWrap} ${s.iconText} transition-transform duration-300 group-hover:scale-110`}>
                    <s.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{s.label}</h3>
                    <p className="mt-1 text-sm text-ink-300">{s.desc}</p>
                  </div>
                </div>
                <button onClick={() => onNavigate(`cefr-skill:${s.key}`)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] ${s.cta}`}>
                  Boshlash <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent-400" />
              <h2 className="font-display text-lg font-semibold">Bugungi reja</h2>
            </div>
            <span className="rounded-full bg-ink-800 px-3 py-1 text-xs font-medium text-ink-300">
              {todayDone}/{todayTotal} dars
            </span>
          </div>
          {todayTotal === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800">
                <Clock className="h-6 w-6 text-ink-500" />
              </div>
              <p className="text-sm text-ink-400">Bugun uchun rejalashtirilgan darslar topilmadi</p>
              <button onClick={() => onNavigate('categories')} className="btn-ghost mt-3 text-xs">
                Ko'nikmalarni ko'rish <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <p className="text-sm text-ink-400">
                  Bugungi reja: <span className="font-semibold text-ink-100">{todayDone}/{todayTotal}</span> dars bajarildi
                </p>
                <p className="font-display text-2xl font-bold text-accent-400">{todayPct}%</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-ink-800">
                <div className="h-full rounded-full bg-gradient-to-r from-nova-500 to-accent-500 transition-all duration-700 ease-out"
                  style={{ width: `${todayPct}%` }} />
              </div>
              {todayDone === todayTotal ? (
                <p className="flex items-center gap-1.5 text-sm text-accent-400">
                  <Trophy className="h-4 w-4" /> Bugungi reja bajarildi! Tabriklaymiz!
                </p>
              ) : (
                <p className="text-xs text-ink-500">
                  {todayTotal - todayDone} ta dars qoldi — davom eting!
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-semibold">So'nggi faollik</h2>
            </div>
            <span className="text-xs text-ink-500">CEFR natijalari</span>
          </div>
          {recentResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800">
                <Trophy className="h-6 w-6 text-ink-500" />
              </div>
              <p className="text-sm text-ink-400">Hali CEFR testi topshirmagansiz</p>
              <button onClick={() => onNavigate('categories')} className="btn-primary mt-4">
                Birinchi testni boshlash <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentResults.map((r) => {
                const cat = catMap.get(r.category_id);
                const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
                const mins = Math.floor((r.time_spent_seconds || 0) / 60);
                const secs = (r.time_spent_seconds || 0) % 60;
                return (
                  <div key={r.id} className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-900/50 p-4 transition-all hover:border-ink-700">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nova-500/10 text-nova-400">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{cat?.name || 'CEFR Test'}</div>
                      <div className="text-xs text-ink-500">{r.score}/{r.total_questions} to'g'ri • {mins}m {secs}s</div>
                    </div>
                    <div className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${
                      pct >= 80 ? 'bg-accent-500/10 text-accent-400' : pct >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
