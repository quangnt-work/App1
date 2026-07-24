'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { BookOpen, Sun, Moon, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const desktopNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn', label: 'Học tập' },
  { href: '/progress', label: 'Tiến độ' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  return (
    <header
      className="sticky top-0 z-50
                 bg-card/95 backdrop-blur-md border-b border-border
                 hidden md:block"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-bold text-primary
                     hover:opacity-80 transition-opacity"
        >
          <BookOpen size={24} />
          <span>RusSkill</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="flex items-center gap-1" role="navigation">
          {desktopNavItems.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/');

            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                           ${
                             isActive
                               ? 'bg-primary-soft text-primary'
                               : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                           }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-muted-foreground
                       hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Đổi theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground
                       hover:text-danger hover:bg-danger-soft transition-colors"
            aria-label="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
