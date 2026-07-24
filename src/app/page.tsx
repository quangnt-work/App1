import Link from 'next/link';
import { BookOpen, Headphones, Mic, BarChart3, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-primary-soft text-primary text-sm font-medium mb-8
                       animate-fade-in"
          >
            <BookOpen size={16} />
            Chuyên biệt Nghe & Nói
          </div>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold
                       text-foreground leading-tight mb-6
                       animate-fade-in-up"
          >
            Luyện{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Tiếng Nga
            </span>{' '}
            <br className="hidden sm:block" />
            bằng tai và giọng nói
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10
                       animate-fade-in-up delay-200"
          >
            App luyện nghe và phát âm tiếng Nga dành cho học sinh từ 12 tuổi.
            Nghe → Nói → Theo dõi tiến bộ mỗi ngày.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4
                       animate-fade-in-up delay-300"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                         bg-primary text-primary-foreground font-semibold text-lg
                         hover:bg-primary-hover transition-all
                         shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
                         hover:-translate-y-0.5"
            >
              Bắt đầu miễn phí
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                         bg-muted text-foreground font-medium text-lg
                         hover:bg-border transition-colors"
            >
              Đã có tài khoản
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12
                       text-foreground"
          >
            Học tiếng Nga theo cách hiệu quả nhất
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className="p-6 rounded-2xl bg-card border border-border
                         shadow-sm hover:shadow-md transition-shadow
                         animate-fade-in"
            >
              <div
                className="w-12 h-12 rounded-xl bg-listening-soft
                           flex items-center justify-center mb-4"
              >
                <Headphones className="text-listening" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Luyện Nghe</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nghe phát âm chuẩn từ người bản xứ. Chọn đáp án, nhận diện
                hình ảnh, luyện nghe chính tả.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="p-6 rounded-2xl bg-card border border-border
                         shadow-sm hover:shadow-md transition-shadow
                         animate-fade-in delay-100"
            >
              <div
                className="w-12 h-12 rounded-xl bg-speaking-soft
                           flex items-center justify-center mb-4"
              >
                <Mic className="text-speaking" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Luyện Nói</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nghe mẫu → Nói theo → Nhận phản hồi phát âm tức thì.
                AI đánh giá độ chính xác giọng nói của bạn.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="p-6 rounded-2xl bg-card border border-border
                         shadow-sm hover:shadow-md transition-shadow
                         animate-fade-in delay-200"
            >
              <div
                className="w-12 h-12 rounded-xl bg-success-soft
                           flex items-center justify-center mb-4"
              >
                <BarChart3 className="text-success" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Theo dõi Tiến độ</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Dashboard trực quan: phút nghe, phút nói, điểm phát âm,
                streak hàng ngày. Luôn biết mình đang ở đâu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>
          © {new Date().getFullYear()} RusSkill — Luyện Nghe & Nói Tiếng Nga
        </p>
      </footer>
    </div>
  );
}
