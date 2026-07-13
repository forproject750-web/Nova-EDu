import { useState } from 'react';
import {
  Rocket, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, AlertCircle,
  Loader2, Calendar, BookOpen, GraduationCap, CheckCircle2, School, Crown,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

type Props = {
  mode: 'login' | 'signup';
  onNavigate: (page: string) => void;
};

export default function Auth({ mode, onNavigate }: Props) {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [prepType, setPrepType] = useState<'cefr' | 'agency' | ''>('');
  const [agencyPath, setAgencyPath] = useState<'president' | 'specialized' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!fullName.trim()) return setError('Ism familiyani kiriting');
      if (!phone.trim()) return setError('Telefon raqamini kiriting');
      if (!age || parseInt(age) < 7 || parseInt(age) > 100) return setError('Yoshingizni to\'g\'ri kiriting');
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!prepType) return setError('Tayyorgarlik yo\'nalishini tanlang');
      if (prepType === 'agency' && !agencyPath) return setError('Rejani tanlang');
      setStep(3);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) return setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');

    setLoading(true);
    const { error } = await signUp({
      email, password, fullName, phone,
      age: parseInt(age),
      prepType: prepType as 'cefr' | 'agency',
      agencyPath: prepType === 'agency' ? agencyPath as 'president' | 'specialized' : '',
    });

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      onNavigate('dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-8">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nova-500/10 blur-[120px]" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-8 text-center">
          <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nova-500 to-accent-500">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">NOVA<span className="text-nova-400">EDU</span></span>
          </button>
        </div>

        <div className="card p-8">
          <h1 className="mb-2 font-display text-2xl font-bold">
            {isSignup ? 'Ro\'yxatdan o\'tish' : 'Tizimga kirish'}
          </h1>
          <p className="mb-6 text-sm text-ink-400">
            {isSignup
              ? step === 1 ? 'Birinchi qadam — shaxsiy ma\'lumotlar'
              : step === 2 ? 'Ikkinchi qadam — yo\'nalishni tanlang'
              : 'Hisob ma\'lumotlarini yarating'
            : 'Hisobingizga kiring va davom eting'}
          </p>

          {/* Step indicator */}
          {isSignup && (
            <div className="mb-6 flex items-center gap-2">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step >= s ? 'bg-nova-500 text-white' : 'bg-ink-800 text-ink-500'
                  }`}>
                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                  {i < 2 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? 'bg-nova-500' : 'bg-ink-800'}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {isSignup ? (
            <form onSubmit={step < 3 ? handleNext : handleSubmit} className="space-y-4">
              {/* Step 1: Name, Phone, Age */}
              {step === 1 && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-300">Ism familiya</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ism Familiya" className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-300">Telefon raqami</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 90 123 45 67" className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-300">Yoshingiz</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                        placeholder="Masalan: 16" min="7" max="100" className="input-field pl-11" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5">
                    Davom etish <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Step 2: Prep Type + Agency Path */}
              {step === 2 && (
                <>
                  <button type="button" onClick={() => { setStep(1); setError(null); }}
                    className="btn-ghost -ml-2 mb-2 text-xs">
                    <ArrowLeft className="h-4 w-4" /> Orqaga
                  </button>
                  <label className="block text-xs font-medium text-ink-300">Nima uchun tayyorgarlik ko\'rasiz?</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button type="button" onClick={() => { setPrepType('cefr'); setAgencyPath(''); }}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        prepType === 'cefr' ? 'border-nova-500 bg-nova-500/10' : 'border-ink-700 bg-ink-900/50 hover:border-ink-600'
                      }`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
                        prepType === 'cefr' ? 'bg-nova-500 text-white' : 'bg-ink-800 text-ink-400'
                      }`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">CEFR ingliz tili</div>
                        <div className="text-xs text-ink-400">Reading, Writing, Speaking, Listening</div>
                      </div>
                      {prepType === 'cefr' && <CheckCircle2 className="h-5 w-5 text-nova-400" />}
                    </button>
                    <button type="button" onClick={() => setPrepType('agency')}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        prepType === 'agency' ? 'border-nova-500 bg-nova-500/10' : 'border-ink-700 bg-ink-900/50 hover:border-ink-600'
                      }`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
                        prepType === 'agency' ? 'bg-nova-500 text-white' : 'bg-ink-800 text-ink-400'
                      }`}>
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">Agentlik maktablari</div>
                        <div className="text-xs text-ink-400">Prezident va Ixtisoslashtirilgan</div>
                      </div>
                      {prepType === 'agency' && <CheckCircle2 className="h-5 w-5 text-nova-400" />}
                    </button>
                  </div>

                  {/* Agency path selection */}
                  {prepType === 'agency' && (
                    <div className="animate-fade-in space-y-3 pt-2">
                      <label className="block text-xs font-medium text-ink-300">Qaysi rejaga ko\'ra tayyorlanasiz?</label>
                      <button type="button" onClick={() => setAgencyPath('president')}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          agencyPath === 'president' ? 'border-amber-500 bg-amber-500/10' : 'border-ink-700 bg-ink-900/50 hover:border-ink-600'
                        }`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
                          agencyPath === 'president' ? 'bg-amber-500 text-white' : 'bg-ink-800 text-ink-400'
                        }`}>
                          <Crown className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Prezident maktabi</div>
                          <div className="text-xs text-ink-400">5-sinfga qabul (4-sinf bitiruvchilari)</div>
                        </div>
                        {agencyPath === 'president' && <CheckCircle2 className="h-5 w-5 text-amber-400" />}
                      </button>
                      <button type="button" onClick={() => setAgencyPath('specialized')}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          agencyPath === 'specialized' ? 'border-sky-500 bg-sky-500/10' : 'border-ink-700 bg-ink-900/50 hover:border-ink-600'
                        }`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
                          agencyPath === 'specialized' ? 'bg-sky-500 text-white' : 'bg-ink-800 text-ink-400'
                        }`}>
                          <School className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Ixtisoslashtirilgan maktab</div>
                          <div className="text-xs text-ink-400">5–9-sinf bitiruvchilari uchun</div>
                        </div>
                        {agencyPath === 'specialized' && <CheckCircle2 className="h-5 w-5 text-sky-400" />}
                      </button>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full py-3.5">
                    Davom etish <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Step 3: Email + Password */}
              {step === 3 && (
                <>
                  <button type="button" onClick={() => { setStep(2); setError(null); }}
                    className="btn-ghost -ml-2 mb-2 text-xs">
                    <ArrowLeft className="h-4 w-4" /> Orqaga
                  </button>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com" required className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-300">Parol</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" required className="input-field pl-11" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Ro\'yxatdan o\'tish <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </>
              )}
            </form>
          ) : (
            /* Login form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com" required className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-300">Parol</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required className="input-field pl-11" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>Kirish <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-ink-400">
            {isSignup ? (
              <>Hisobingiz bormi?{' '}
                <button onClick={() => onNavigate('login')} className="font-semibold text-nova-400 hover:text-nova-300">Kirish</button>
              </>
            ) : (
              <>Hisobingiz yo\'qmi?{' '}
                <button onClick={() => onNavigate('signup')} className="font-semibold text-nova-400 hover:text-nova-300">Ro\'yxatdan o\'tish</button>
              </>
            )}
          </div>
        </div>

        <button onClick={() => onNavigate('landing')} className="mt-6 block w-full text-center text-sm text-ink-500 hover:text-ink-300">
          Bosh sahifaga qaytish
        </button>
      </div>
    </div>
  );
}
