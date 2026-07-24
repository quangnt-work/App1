'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart3, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Trang chủ', icon: Home },
  { href: '/learn', label: 'Học', icon: BookOpen },
  { href: '/progress', label: 'Tiến độ', icon: BarChart3 },
  { href: '/profile', label: 'Cá nhân', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-card/95 backdrop-blur-md border-t border-border
                 md:hidden"
      role="navigation"
      aria-label="Menu chính"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5
                         w-16 h-full text-xs font-medium transition-colors
                         ${
                           isActive
                             ? 'text-primary'
                             : 'text-muted-foreground hover:text-foreground'
                         }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all"
              />
              <span>{label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
