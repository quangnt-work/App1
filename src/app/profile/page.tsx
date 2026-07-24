'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { User, Settings, LogOut, Moon, Sun, Bell, HelpCircle, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tài khoản và cài đặt ứng dụng
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border animate-shimmer h-24" />
          <div className="space-y-4">
            <div className="h-16 rounded-2xl bg-card border border-border animate-shimmer" />
            <div className="h-16 rounded-2xl bg-card border border-border animate-shimmer" />
            <div className="h-16 rounded-2xl bg-card border border-border animate-shimmer" />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
          {/* User Info Card */}
          <div className="p-6 rounded-3xl bg-card border border-border flex items-center gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || <User size={28} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">
                {user?.user_metadata?.full_name || 'Học viên RusSkill'}
              </h2>
              <p className="text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          {/* Settings Groups */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-2">Cài đặt ứng dụng</h3>
            
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              <SettingItem 
                icon={<Moon size={20} />} 
                label="Giao diện tối (Dark Mode)" 
                rightElement={
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                }
              />
              <div className="h-px bg-border ml-12" />
              <SettingItem 
                icon={<Bell size={20} />} 
                label="Thông báo nhắc nhở học" 
                rightElement={
                  <button className="text-sm text-primary font-medium">Bật</button>
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-2">Hỗ trợ & Bảo mật</h3>
            
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              <SettingItem 
                icon={<Settings size={20} />} 
                label="Cài đặt tài khoản" 
              />
              <div className="h-px bg-border ml-12" />
              <SettingItem 
                icon={<Shield size={20} />} 
                label="Chính sách bảo mật" 
              />
              <div className="h-px bg-border ml-12" />
              <SettingItem 
                icon={<HelpCircle size={20} />} 
                label="Trung tâm trợ giúp" 
              />
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl bg-danger-soft text-danger font-semibold flex items-center justify-center gap-2 hover:bg-danger/10 transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

function SettingItem({ icon, label, rightElement }: { icon: React.ReactNode, label: string, rightElement?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4 text-foreground font-medium">
        <div className="text-muted-foreground">{icon}</div>
        {label}
      </div>
      {rightElement || <div className="text-muted-foreground"><Settings size={16} className="opacity-0" /></div>}
    </div>
  );
}
