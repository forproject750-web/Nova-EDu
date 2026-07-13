import { useEffect, useState } from 'react';
import { User, Mail, Target, Save, Loader2, CheckCircle2, Calendar, BookOpen, Award } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, type TestResult, type Category } from '../lib/supabase';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Profile({ onNavigate }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setTargetExam(profile.target_exam || '');
      setAge(profile.age?.toString() || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: rData }, { data: cData }] = await Promise.all([
        supabase.from('test_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      ]);
      setResults((rData as TestResult[]) || []);
      setCategories((cData as Category[]) || []);
      setLoadingStats(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await supabase
      .from('profiles')
      .update({ full_name: fullName, target_exam: targetExam, age: age ? parseInt(age) : null })
      .eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const catMap = new Map(categories.map(c => [c.id, c]));
  const totalTests = results.length;
  const totalQuestions = results.reduce((s, r) => s + r.total_questions, 0);
  const totalCorrect = results.reduce((s, r) => s + r.score, 0);
  const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '';

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Profil</h1>
        <p className="mt-1 text-ink-400">Shaxsiy ma\'lumotlaringizni boshqaring</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-500 to-accent-500 text-2xl font-bold text-white">
            {fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{fullName || 'Foydalanuvchi'}</h2>
            <p className="text-sm text-ink-400">{user?.email}</p>
            {memberSince && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                <Calendar className="h-3.5 w-3.5" /> {memberSince} dan beri a'zo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <BookOpen className="mx-auto mb-2 h-6 w-6 text-nova-400" />
          <div className="font-display text-2xl font-bold">{totalTests}</div>
          <div className="text-xs text-ink-400">Testlar</div>
        </div>
        <div className="card p-5 text-center">
          <Target className="mx-auto mb-2 h-6 w-6 text-accent-400" />
          <div className="font-display text-2xl font-bold">{avgScore}%</div>
          <div className="text-xs text-ink-400">O\'rtacha</div>
        </div>
        <div className="card p-5 text-center">
          <Award className="mx-auto mb-2 h-6 w-6 text-amber-400" />
          <div className="font-display text-2xl font-bold">{totalCorrect}</div>
          <div className="text-xs text-ink-400">To\'g\'ri javoblar</div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Ma\'lumotlarni tahrirlash</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">To\'liq ism</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ism Familiya"
                className="input-field pl-11"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field pl-11 opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Yosh</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Masalan: 16"
                min="7"
                max="100"
                className="input-field pl-11"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Maqsad qilingan imtihon</label>
            <div className="relative">
              <Target className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="Masalan: CEFR B2, Agentlik matematika..."
                className="input-field pl-11"
              />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-accent-400" /> Saqlandi
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Saqlash
              </>
            )}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Testlar tarixi</h2>
        {loadingStats ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-nova-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-400">
            Hali test topshirmagansiz
            <button onClick={() => onNavigate('categories')} className="btn-primary mt-3">
              Test boshlash
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((r) => {
              const cat = catMap.get(r.category_id);
              const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
              const date = new Date(r.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <button
                  key={r.id}
                  onClick={() => onNavigate(`result:${r.id}`)}
                  className="flex w-full items-center gap-4 rounded-xl border border-ink-800 bg-ink-900/50 p-4 transition-all hover:border-ink-700"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{cat?.name || 'Test'}</div>
                    <div className="text-xs text-ink-500">{date} • {r.score}/{r.total_questions}</div>
                  </div>
                  <div className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${
                    pct >= 80 ? 'bg-accent-500/10 text-accent-400' :
                    pct >= 50 ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {pct}%
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
