import React from 'react';
import { User } from 'firebase/auth';
import { ExamData } from '../types';
import {
  Send,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  FileCheck2,
} from 'lucide-react';

interface ExportControlsProps {
  exam: ExamData;
  user: User | null;
  hasAccessToken: boolean;
  isPublishing: boolean;
  publishStatusText: string;
  onConnectGoogle: () => void;
  onExportToGoogleForms: () => void;
  lang: 'ar' | 'en';
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  exam,
  user,
  hasAccessToken,
  isPublishing,
  publishStatusText,
  onConnectGoogle,
  onExportToGoogleForms,
  lang,
}) => {
  const isAr = lang === 'ar';
  const totalPoints = exam.questions.reduce((acc, q) => acc + (q.pointValue || 1), 0);

  return (
    <div className="bg-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl mt-8 border border-indigo-800 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Summary Info */}
        <div className="text-center lg:text-right space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'جاهز للتصدير الفوري' : 'Ready for Instant Export'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'تحويل الاختبار إلى نموذج Google Forms' : 'Convert Exam to Google Form'}
          </h3>
          <p className="text-sm text-indigo-200 leading-relaxed">
            {isAr
              ? `سيتم إنشاء نموذج Google Forms يحتوي على ${exam.questions.length} سؤال ${
                  exam.isQuiz ? `بإجمالي ${totalPoints} درجة` : ''
                } وتنسيق تلقائي للأسئلة والإجابات وتفعيل التصحيح الذاتي.`
              : `Will create a Google Form with ${exam.questions.length} questions ${
                  exam.isQuiz ? `(${totalPoints} points total)` : ''
                } and automatic grading.`}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full lg:w-auto flex flex-col items-center gap-3">
          {hasAccessToken ? (
            <button
              id="btn-export-forms"
              type="button"
              onClick={onExportToGoogleForms}
              disabled={isPublishing || exam.questions.length === 0}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white text-base font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{publishStatusText || (isAr ? 'جاري إنشاء النموذج...' : 'Creating form...')}</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-6 h-6" />
                  <span>{isAr ? 'إنشاء النموذج على Google Forms الآن' : 'Create Google Form Now'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              id="btn-auth-and-export"
              type="button"
              onClick={onConnectGoogle}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 text-base font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
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
              <span>{isAr ? 'تسجيل الدخول بحساب Google للتصدير' : 'Sign in with Google to Export'}</span>
            </button>
          )}

          <div className="text-xs text-indigo-200/80 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>
              {isAr
                ? 'يتم إنشاء النموذج بأمان ومباشرة داخل حساب Google الخاص بك'
                : 'Direct, secure creation in your own Google account'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
