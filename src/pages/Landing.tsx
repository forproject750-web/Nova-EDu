import { Rocket, BookOpen, Trophy, LineChart, ArrowRight, Star, GraduationCap, Atom, Calculator, Languages, Clock, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Landing({ onNavigate }: Props) {
  const { user } = useAuth();

  const features = [
    { icon: BookOpen, title: 'CEFR A1–C2 Tayyorgarlik', desc: '6 darajali ingliz tili tayyorgarligi — har bir daraja uchun maxsus savollar va tushuntirishlar.' },
    { icon: GraduationCap, title: 'Agentlik Maktablari', desc: 'Matematika, fizika, kimyo, biologiya, ingliz tili va tarix fanlariga to\'liq tayyorgarlik.' },
    { icon: LineChart, title: 'Progress Kuzatuvi', desc: 'Har bir test natijasi saqlanadi. Statistika va grafiklar orqali o\'z rivojlanishingizni kuzating.' },
    { icon: Clock, title: 'Vaqt bilan Test', desc: 'Haqiqiy imtihon shartlarini simulyatsiya qiluvchi taymer bilan testlar yeching.' },
    { icon: Target, title: 'Tushuntirishlar', desc: 'Har bir savol uchun to\'liq tushuntirish. Xato qilsangiz ham nimaga noto\'g\'ri ekanligini bilasiz.' },
    { icon: Trophy, title: 'Leaderboard', desc: 'Boshqa o\'quvchilar bilan raqobatlang va eng yaxshi natijalarga ega bo\'ling.' },
  ];

  const stats = [
    { value: '12', label: 'Fanlar' },
    { value: '60+', label: 'Savollar' },
    { value: '6', label: 'CEFR Darajalari' },
    { value: '∞', label: 'Marta Urinish' },
  ];

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ink-800/50 bg-ink-950/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nova-500 to-accent-500">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">NOVA<span className="text-nova-400">EDU</span></span>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <a href="#features" className="btn-ghost">Imkoniyatlar</a>
            <a href="#about" className="btn-ghost">Haqida</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => onNavigate('dashboard')} className="btn-primary">
                Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('login')} className="btn-ghost hidden sm:inline-flex">Kirish</button>
                <button onClick={() => onNavigate('signup')} className="btn-primary">
                  Ro'yxatdan o'tish <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(51,128,255,0.15),_transparent_60%)]" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-nova-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/50 px-4 py-1.5 text-xs font-medium text-ink-300 animate-fade-in">
            <Star className="h-3.5 w-3.5 text-accent-400" />
            CEFR va Agentlik maktablari uchun #1 platforma
          </div>
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl animate-slide-up">
            Imtihonga <span className="gradient-text">tayyor</span> bo'ling.
            <br />Kelajakni <span className="gradient-text">quring</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-400 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            NOVA EDU — o'quvchilarni CEFR ingliz tili va Agentlik maktablari kirish imtihonlariga
            professional darajada tayyorlaydigan platforma. Amaliy testlar, tushuntirishlar va
            progress kuzatuvi bilan.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => onNavigate('signup')} className="btn-primary px-8 py-4 text-base">
              Bepul boshlash <ArrowRight className="h-5 w-5" />
            </button>
            <button onClick={() => onNavigate('login')} className="btn-secondary px-8 py-4 text-base">
              Tizimga kirish
            </button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {stats.map((s) => (
              <div key={s.label} className="card p-6">
                <div className="font-display text-3xl font-bold text-nova-400">{s.value}</div>
                <div className="mt-1 text-sm text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">Nima uchun NOVA EDU?</h2>
          <p className="mt-3 text-ink-400">O'quvchilar uchun yaratilgan, natijalar uchun optimallashtirilgan</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card group p-6 transition-all hover:border-nova-500/30 hover:bg-ink-800/50 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-nova-500/10 text-nova-400 transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects preview */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">Fanlar va Darajalar</h2>
          <p className="mt-3 text-ink-400">12 ta to'liq tayyorgarlik yo'nalishi</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, name: 'CEFR A1–C2', color: 'text-emerald-400 bg-emerald-500/10' },
            { icon: Calculator, name: 'Matematika', color: 'text-orange-400 bg-orange-500/10' },
            { icon: Atom, name: 'Fizika', color: 'text-sky-400 bg-sky-500/10' },
            { icon: Languages, name: 'Ingliz tili', color: 'text-amber-400 bg-amber-500/10' },
          ].map((s) => (
            <div key={s.name} className="card flex items-center gap-3 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-500">Hamkorlar</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Bizning hamkorlarimiz</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          <div className="card group relative overflow-hidden p-8 transition-all hover:border-nova-500/30 hover:bg-ink-800/50 animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(51,128,255,0.06),_transparent_70%)]" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-full max-w-sm" style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.15))' }}>
                <img src="/partners/ixtisos-ai.svg" alt="IXTISOS AI" className="w-full" />
              </div>
              <p className="text-center text-sm text-ink-400">
                IXTISOS AI — NOVA EDU bilan hamkorlikda o'quvchilarga AI yordamida
                sifatli ta'lim beradi va kelajakka kafolatlangan yo'l ko'rsatadi.
              </p>
              <div className="flex items-center gap-2 rounded-full border border-nova-500/20 bg-nova-500/5 px-4 py-1.5 text-xs font-medium text-nova-400">
                <Star className="h-3.5 w-3.5" />
                Rasmiy hamkor dasturi
              </div>
            </div>
          </div>

          {/* CEFR IDNS Partner */}
          <div className="card group relative overflow-hidden p-8 transition-all hover:border-sky-500/30 hover:bg-ink-800/50 animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,210,255,0.06),_transparent_70%)]" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-full max-w-sm" style={{ filter: 'drop-shadow(0 0 20px rgba(0,210,255,0.15))' }}>
                <img src="/partners/cefr-idns.svg" alt="CEFR IDNS" className="w-full" />
              </div>
              <p className="text-center text-sm text-ink-400">
                CEFR IDNS — NOVA EDU bilan hamkorlikda ingliz tili
                CEFR darajasini aniqlash va rivojlantirishda yordam beradi.
              </p>
              <div className="flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-4 py-1.5 text-xs font-medium text-sky-400">
                <Star className="h-3.5 w-3.5" />
                Rasmiy hamkor dasturi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="card relative overflow-hidden p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(51,128,255,0.1),_transparent_70%)]" />
          <div className="relative">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-nova-400" />
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Bugun o'qishni boshlang
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-400">
              Minglab o'quvchilar NOVA EDU yordamida imtihonlardan yuqori ball bilan o'tishgan.
              Sizning navbatingiz.
            </p>
            <button onClick={() => onNavigate('signup')} className="btn-primary mt-8 px-8 py-4 text-base">
              Ro'yxatdan o'tish — Bepul <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-800/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-nova-500 to-accent-500">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">NOVA<span className="text-nova-400">EDU</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-ink-400">
              <a href="#features" className="hover:text-white transition-colors">Imkoniyatlar</a>
              <a href="#about" className="hover:text-white transition-colors">Haqida</a>
            </div>
            <div className="text-center text-sm text-ink-500">
              <p>Muallif: Muhammadiyev Hojiakbar</p>
              <p className="mt-1">© 2026 NOVA EDU. Barcha huquqlar himoyalangan.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
