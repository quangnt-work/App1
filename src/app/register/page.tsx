'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const translateError = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('is invalid')) {
      // Extract the field name for context
      if (lower.includes('email')) return 'Địa chỉ email không hợp lệ. Vui lòng sử dụng email thật.';
      if (lower.includes('password')) return 'Mật khẩu không hợp lệ.';
      return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    }
    if (lower.includes('already registered') || lower.includes('already been registered'))
      return 'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.';
    if (lower.includes('rate limit') || lower.includes('too many requests'))
      return 'Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.';
    if (lower.includes('weak password') || lower.includes('at least'))
      return 'Mật khẩu quá yếu. Hãy dùng ít nhất 6 ký tự, bao gồm chữ và số.';
    if (lower.includes('signup is disabled'))
      return 'Chức năng đăng ký đang tạm thời bị tắt. Liên hệ quản trị viên.';
    if (lower.includes('network') || lower.includes('fetch'))
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
    return message; // Fallback: show original message
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(translateError(authError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
      },
    });
  };

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Kiểm tra email!
          </h1>
          <p className="text-muted-foreground mb-6">
            Chúng tôi đã gửi link xác nhận đến <strong>{email}</strong>.
            Hãy nhấn vào link trong email để kích hoạt tài khoản.
          </p>
          <Link
            href="/login"
            className="inline-flex px-6 py-2.5 rounded-xl bg-primary text-primary-foreground
                       font-semibold hover:bg-primary-hover transition-colors"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary">
            <BookOpen size={32} />
            <span className="text-2xl font-bold">RusSkill</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">
            Tạo tài khoản mới
          </h1>
          <p className="text-muted-foreground mt-1">
            Bắt đầu luyện nghe & nói tiếng Nga ngay hôm nay
          </p>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Họ và tên
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border
                             bg-background text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                             transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border
                             bg-background text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                             transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border
                             bg-background text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-danger-soft text-danger text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground
                         font-semibold hover:bg-primary-hover transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full py-2.5 rounded-xl border border-border
                       text-foreground font-medium hover:bg-muted transition-colors
                       flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Đăng ký bằng Google
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
