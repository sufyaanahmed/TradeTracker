// Shared Navigation component for Palrin
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../../lib/AuthContext';

export default function Navigation() {
  const router = useRouter();
  const { user } = useAuth();
  const currentPath = router.pathname;

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Research', href: '/research', icon: 'query_stats' },
    { label: 'Sectors', href: '/research/sectors', icon: 'donut_small' },
    { label: 'Macro', href: '/research/macro', icon: 'public' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center gap-8">
        <a href="/dashboard" className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl font-bold">rocket_launch</span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Palrin</h2>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href ||
              (item.href !== '/dashboard' && currentPath.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{user?.displayName || 'Trader'}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Palrin Pro</p>
        </div>
        <button
          onClick={handleSignOut}
          className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="Sign out"
        >
          <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">logout</span>
        </button>
      </div>
    </header>
  );
}
