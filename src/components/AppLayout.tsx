import { type ReactNode } from 'react';
import { Rocket, LayoutDashboard, BookOpen, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Props = {
  children: ReactNode;
  onNavigate: (page: string) => void;
  current: string;
};

export default function AppLayout({ children, onNavigate, current }: Props) {
  const { profile, signOut } = useAuth();

  const isCEFR = profile?.prep_type === 'cefr';
  const sectionLabel = isCEFR ? 'CEFR xonasi' : profile?.agency_path === 'president' ? 'Prezident maktabi' : 'Ixtisoslashtirilgan';
  const roomRoute = isCEFR ? 'cefr-room' : 'agency-room';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: roomRoute, label: sectionLabel, icon: BookOpen },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-ink-950">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-ink-800 bg-ink-900/50 md:flex">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nova-500 to-accent-500">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold">NOVA<span className="text-nova-400">EDU</span></span>
        </button>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                current === item.id
                  ? 'bg-nova-500/10 text-nova-400'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-white'
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
              {current === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-ink-800 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nova-500/20 text-sm font-semibold text-nova-400">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{profile?.full_name || 'User'}</div>
              <div className="truncate text-xs text-ink-500">O'quvchi</div>
            </div>
          </div>
          <button
            onClick={() => { signOut(); onNavigate('landing'); }}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-400 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </aside>

      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-nova-500 to-accent-500">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-base font-bold">NOVA<span className="text-nova-400">EDU</span></span>
          </button>
          <button
            onClick={() => { signOut(); onNavigate('landing'); }}
            className="rounded-lg p-2 text-ink-400 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-1 px-4 pb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                current === item.id
                  ? 'bg-nova-500/10 text-nova-400'
                  : 'text-ink-400'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="md:ml-64">
        <div className="min-h-screen px-4 py-6 pt-20 md:px-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
