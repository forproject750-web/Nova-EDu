import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Test from './pages/Test';
import CefrSkillTest from './pages/CefrSkillTest';
import CefrRoom from './pages/CefrRoom';
import AgencyRoom from './pages/AgencyRoom';
import Result from './pages/Result';
import Profile from './pages/Profile';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<string>('landing');

  useEffect(() => {
    if (loading) return;
    if (!user && page !== 'landing' && page !== 'login' && page !== 'signup') {
      setPage('landing');
    }
  }, [user, loading, page]);

  const navigate = (p: string) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-10 w-10 animate-spin text-nova-500" />
      </div>
    );
  }

  if (page === 'landing') return <Landing onNavigate={navigate} />;
  if (page === 'login') return <Auth mode="login" onNavigate={navigate} />;
  if (page === 'signup') return <Auth mode="signup" onNavigate={navigate} />;

  if (!user) return <Landing onNavigate={navigate} />;

  if (page === 'cefr-room') {
    return (
      <AppLayout onNavigate={navigate} current="categories">
        <CefrRoom onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page === 'agency-room') {
    return (
      <AppLayout onNavigate={navigate} current="categories">
        <AgencyRoom onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page.startsWith('test:')) {
    const slug = page.slice(5);
    return (
      <AppLayout onNavigate={navigate} current="categories">
        <Test slug={slug} onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page.startsWith('cefr-skill:')) {
    const skill = page.slice(11) as 'reading' | 'writing' | 'speaking' | 'listening';
    return (
      <AppLayout onNavigate={navigate} current="categories">
        <CefrSkillTest skill={skill} onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page.startsWith('result:')) {
    const resultId = page.slice(7);
    return (
      <AppLayout onNavigate={navigate} current="dashboard">
        <Result resultId={resultId} onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page === 'dashboard') {
    return (
      <AppLayout onNavigate={navigate} current="dashboard">
        <Dashboard onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page === 'categories') {
    return (
      <AppLayout onNavigate={navigate} current="categories">
        <Categories onNavigate={navigate} />
      </AppLayout>
    );
  }

  if (page === 'profile') {
    return (
      <AppLayout onNavigate={navigate} current="profile">
        <Profile onNavigate={navigate} />
      </AppLayout>
    );
  }

  return <Landing onNavigate={navigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
