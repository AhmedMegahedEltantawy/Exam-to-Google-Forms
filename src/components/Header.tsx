import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  hasAccessToken: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  hasAccessToken,
  isLoggingIn,
  onLogin,
  onLogout,
  lang,
  onToggleLang,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 relative overflow-hidden">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {isAr ? 'محول الاختبارات الذكي' : 'Smart Exam Converter'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3" />
                AI Forms
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {isAr
                ? 'تحويل ملفات Word و Excel و PDF إلى نماذج Google Forms بضغطة زر'
                : 'Convert Word, Excel & PDF exams to Google Forms quizzes in seconds'}
            </p>
          </div>
        </div>

        {/* Actions & Google Auth */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            id="btn-lang-toggle"
            type="button"
            onClick={onToggleLang}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            {isAr ? 'English' : 'عربي'}
          </button>

          {/* Google Auth Status / Button */}
          {user && hasAccessToken ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pl-3">
              <div className="flex items-center gap-2 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-2 ring-indigo-500/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden md:block text-right">
                  <div className="font-semibold text-slate-800 leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" />
                    {isAr ? 'حساب Google متصل' : 'Connected to Google'}
                  </div>
                </div>
              </div>

              <button
                id="btn-logout"
                type="button"
                onClick={onLogout}
                title={isAr ? 'تسجيل الخروج' : 'Sign out'}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-google-login"
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition-all hover:shadow hover:border-slate-400 disabled:opacity-50"
            >
              {/* Official Google 'G' icon */}
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? (isAr ? 'جاري الاتصال...' : 'Connecting...') : (isAr ? 'ربط حساب Google' : 'Connect Google')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
