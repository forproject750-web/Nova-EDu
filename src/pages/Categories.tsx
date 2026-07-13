import { useEffect, useState } from 'react';
import {
  BookOpen, Calculator, Atom, FlaskConical, Dna, Languages, Landmark,
  Sprout, Leaf, TreePine, Mountain, Star, Crown,
  ArrowRight, Loader2, BookOpenText, PenLine, Mic, Headphones,
} from 'lucide-react';
import { supabase, type Category } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type Props = {
  onNavigate: (page: string) => void;
};

const categoryIconMap: Record<string, typeof BookOpen> = {
  BookOpen, Calculator, Atom, FlaskConical, Dna, Languages, Landmark,
  Sprout, Leaf, TreePine, Mountain, Star, Crown,
};

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20',
  blue: 'from-nova-500/20 to-nova-600/5 text-nova-400 border-nova-500/20',
  cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
  indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
  violet: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20',
  orange: 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20',
  sky: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20',
  rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
  lime: 'from-lime-500/20 to-lime-600/5 text-lime-400 border-lime-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
  teal: 'from-teal-500/20 to-teal-600/5 text-teal-400 border-teal-500/20',
};

const skills = [
  { key: 'reading', label: 'Reading', desc: 'Matnni o\'qish va tushunish', icon: BookOpenText, color: 'from-nova-500/20 to-nova-600/5 text-nova-400 border-nova-500/20' },
  { key: 'writing', label: 'Writing', desc: 'Insho va yozish ko\'nikmalari', icon: PenLine, color: 'from-accent-500/20 to-accent-600/5 text-accent-400 border-accent-500/20' },
  { key: 'speaking', label: 'Speaking', desc: 'Og\'zaki nutq va so\'zlashish', icon: Mic, color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20' },
  { key: 'listening', label: 'Listening', desc: 'Eshitish va tushunish', icon: Headphones, color: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20' },
];

export default function Categories({ onNavigate }: Props) {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const prepType = profile?.prep_type || 'cefr';
  const isCEFR = prepType === 'cefr';

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      setCategories((cats as Category[]) || []);

      if (cats) {
        const counts: Record<string, number> = {};
        for (const c of cats as Category[]) {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', c.id);
          counts[c.id] = count || 0;
        }
        setQuestionCounts(counts);

        // Count questions per skill across all CEFR categories
        const cefrCatIds = (cats as Category[]).filter(c => c.type === 'cefr').map(c => c.id);
        const skillC: Record<string, number> = { reading: 0, writing: 0, speaking: 0, listening: 0 };
        for (const cid of cefrCatIds) {
          const { data: qs } = await supabase
            .from('questions')
            .select('skill')
            .eq('category_id', cid);
          if (qs) {
            for (const q of qs as { skill: string }[]) {
              if (q.skill in skillC) skillC[q.skill]++;
            }
          }
        }
        setSkillCounts(skillC);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nova-500" />
      </div>
    );
  }

  const agencyCats = categories.filter(c => c.type === 'agency');

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {isCEFR ? 'CEFR Ingliz Tili' : 'Agentlik Maktablari'}
        </h1>
        <p className="mt-1 text-ink-400">
          {isCEFR
            ? '4 ta asosiy ko\'nikma: Reading, Writing, Speaking, Listening'
            : 'Fan bo\'yicha test tanlang va tayyorgarlikni boshlang'}
        </p>
      </div>

      {isCEFR ? (
        <>
          {/* CEFR: 4 Skills */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-nova-400" />
              <h2 className="font-display text-xl font-semibold">Asosiy Ko\'nikmalar</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => onNavigate(`cefr-skill:${s.key}`)}
                  className={`card group relative overflow-hidden bg-gradient-to-br ${s.color} p-6 text-left transition-all hover:scale-[1.02] animate-slide-up`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900/50">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-ink-900/50 px-3 py-1 text-xs font-medium">
                      {skillCounts[s.key] || 0} savol
                    </span>
                  </div>
                  <h3 className="mb-1 font-display text-lg font-bold text-white">{s.label}</h3>
                  <p className="text-sm text-ink-300">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                    Ko\'nikmani boshlash <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CEFR Levels */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-nova-400" />
              <h2 className="font-display text-xl font-semibold">Darajalar bo\'yicha</h2>
              <span className="rounded-full bg-ink-800 px-2.5 py-0.5 text-xs text-ink-400">A1–C2</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.filter(c => c.type === 'cefr').map((c, i) => {
                const Icon = categoryIconMap[c.icon_name] || BookOpen;
                const colorClass = colorMap[c.color] || colorMap.blue;
                return (
                  <button
                    key={c.id}
                    onClick={() => onNavigate(`test:${c.slug}`)}
                    className={`card group relative overflow-hidden bg-gradient-to-br ${colorClass} p-5 text-left transition-all hover:scale-[1.02] animate-slide-up`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900/50">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-white">{c.name}</h3>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs text-ink-300">{c.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-ink-400">{questionCounts[c.id] || 0} savol</span>
                      <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Agency: Subject cards */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-orange-400" />
              <h2 className="font-display text-xl font-semibold">Fanlar</h2>
              <span className="rounded-full bg-ink-800 px-2.5 py-0.5 text-xs text-ink-400">{agencyCats.length} ta</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agencyCats.map((c, i) => {
                const Icon = categoryIconMap[c.icon_name] || BookOpen;
                const colorClass = colorMap[c.color] || colorMap.orange;
                return (
                  <button
                    key={c.id}
                    onClick={() => onNavigate(`test:${c.slug}`)}
                    className={`card group relative overflow-hidden bg-gradient-to-br ${colorClass} p-6 text-left transition-all hover:scale-[1.02] animate-slide-up`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900/50">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-ink-900/50 px-3 py-1 text-xs font-medium">
                        {questionCounts[c.id] || 0} savol
                      </span>
                    </div>
                    <h3 className="mb-1 font-display text-lg font-bold text-white">{c.name}</h3>
                    <p className="line-clamp-2 text-sm text-ink-300">{c.description}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      Testni boshlash <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
