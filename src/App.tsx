import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ExamEditor } from './components/ExamEditor';
import { ExportControls } from './components/ExportControls';
import { SuccessModal } from './components/SuccessModal';
import { FeaturesGuide } from './components/FeaturesGuide';
import { ExamData, FormPublishResult, ParseProgress } from './types';
import { initAuth, googleSignIn, logOutUser } from './lib/firebase';
import { createGoogleFormFromExam } from './lib/formsApi';
import { Sparkles, FileText, CheckCircle2, History, ExternalLink } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [parseProgress, setParseProgress] = useState<ParseProgress>({
    status: 'idle',
    message: '',
  });

  const [currentExam, setCurrentExam] = useState<ExamData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusText, setPublishStatusText] = useState('');
  const [publishResult, setPublishResult] = useState<FormPublishResult | null>(null);
  const [recentForms, setRecentForms] = useState<FormPublishResult[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isAr = lang === 'ar';

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        if (token) {
          setAccessToken(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setGeneralError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setGeneralError(
        err.message || (isAr ? 'فشل تسجيل الدخول بحساب Google. يرجى المحاولة مرة أخرى.' : 'Google sign-in failed. Please try again.')
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logOutUser();
    setUser(null);
    setAccessToken(null);
  };

  // Handle Extract & Parse with AI
  const handleExamExtracted = async (extracted: {
    text?: string;
    fileData?: string;
    mimeType?: string;
    defaultPoints: number;
    isQuiz: boolean;
    fileName?: string;
  }) => {
    setGeneralError(null);
    setParseProgress({
      status: 'ai_analyzing',
      message: isAr ? 'يقوم الذكاء الاصطناعي بتحليل الاختبار واستخراج الأسئلة والإجابات...' : 'AI is analyzing exam structure, questions & answers...',
    });

    try {
      const response = await fetch('/api/parse-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extracted),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || (isAr ? 'فشل استخراج بيانات الاختبار' : 'Failed to parse exam'));
      }

      const examData: ExamData = json.data;

      // If title is missing or generic, use the file name
      if (!examData.title || examData.title === 'Exam' || examData.title === 'اختبار') {
        examData.title = extracted.fileName
          ? extracted.fileName.replace(/\.[^/.]+$/, '')
          : isAr
          ? 'اختبار إلكتروني جديد'
          : 'New Online Quiz';
      }

      setCurrentExam(examData);
      setParseProgress({ status: 'done', message: '' });

      // Smooth scroll to editor
      setTimeout(() => {
        const editorEl = document.getElementById('exam-editor-section');
        if (editorEl) {
          editorEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Parse exam error:', err);
      setGeneralError(err.message || (isAr ? 'حدث خطأ أثناء تحليل الاختبار' : 'Error parsing exam'));
      setParseProgress({ status: 'error', message: err.message });
    }
  };

  // Handle Export to Google Forms
  const handleExportToGoogleForms = async () => {
    if (!currentExam) return;

    if (!accessToken) {
      // Prompt user to sign in first
      await handleGoogleLogin();
      return;
    }

    setIsPublishing(true);
    setPublishStatusText(isAr ? '1/3 جاري إنشاء نموذج Google Forms الجديد...' : '1/3 Creating Google Form...');
    setGeneralError(null);

    try {
      setPublishStatusText(isAr ? '2/3 جاري إضافة وتنسيق الأسئلة وتفعيل التصحيح التلقائي...' : '2/3 Adding questions & configuring grading...');
      const result = await createGoogleFormFromExam(currentExam, accessToken);

      setPublishStatusText(isAr ? '3/3 تم إنشاء النموذج بنجاح!' : '3/3 Form created successfully!');
      setPublishResult(result);
      setRecentForms((prev) => [result, ...prev]);
    } catch (err: any) {
      console.error('Publish error:', err);
      // If token expired, clear token and ask user to re-authenticate
      if (err.message && (err.message.includes('401') || err.message.includes('UNAUTHENTICATED') || err.message.includes('token'))) {
        setAccessToken(null);
        setGeneralError(
          isAr
            ? 'انتهت صلاحية جلسة Google، يرجى تسجيل الدخول مجدداً للاتصال بالنماذج.'
            : 'Google session expired. Please sign in again to connect.'
        );
      } else {
        setGeneralError(
          err.message || (isAr ? 'فشل إنشاء النموذج على Google Forms' : 'Failed to create Google Form')
        );
      }
    } finally {
      setIsPublishing(false);
      setPublishStatusText('');
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white"
    >
      {/* Top Navigation */}
      <Header
        user={user}
        hasAccessToken={Boolean(accessToken)}
        isLoggingIn={isLoggingIn}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner with Geometric Accents */}
        <div className="text-center space-y-3 py-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {isAr
                ? 'تحويل الاختبارات المدرسية والجامعية إلى Google Forms في لحظات'
                : 'Convert Word, Excel & PDF Exams into Google Forms Quizzes'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'حوّل أي اختبار إلى نموذج Google فوري' : 'Convert Any Exam to Google Forms Instantly'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'ارفع ملف اختبارك بصيغة Word أو شيت Excel أو مستند PDF، وسيقوم الذكاء الاصطناعي بالتعرف على الأسئلة والاختيارات والإجابات الصحيحة ونقلها مباشرة إلى Google Forms مع التصحيح التلقائي.'
              : 'Upload your Word, Excel, or PDF exam. AI will extract questions, choices, correct answers, and points, creating a ready-to-use Google Forms quiz directly in your account.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in">
            <span>{generalError}</span>
            <button
              type="button"
              onClick={() => setGeneralError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Upload & Extract */}
        <UploadSection
          onExamExtracted={handleExamExtracted}
          parseProgress={parseProgress}
          lang={lang}
        />

        {/* Section 2: Interactive Exam Editor & Customizer (If exam is parsed) */}
        {currentExam && (
          <div id="exam-editor-section" className="space-y-6 animate-in fade-in duration-300">
            <ExamEditor
              exam={currentExam}
              onChange={setCurrentExam}
              onReset={() => setCurrentExam(null)}
              lang={lang}
            />

            {/* Section 3: Export to Google Forms Bar */}
            <ExportControls
              exam={currentExam}
              user={user}
              hasAccessToken={Boolean(accessToken)}
              isPublishing={isPublishing}
              publishStatusText={publishStatusText}
              onConnectGoogle={handleGoogleLogin}
              onExportToGoogleForms={handleExportToGoogleForms}
              lang={lang}
            />
          </div>
        )}

        {/* Recent Forms History (If any created in this session) */}
        {recentForms.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-indigo-600" />
              {isAr ? 'النماذج التي تم إنشاؤها في هذه الجلسة' : 'Recently Created Google Forms'}
            </h3>
            <div className="space-y-2">
              {recentForms.map((item, idx) => (
                <div
                  key={item.formId || idx}
                  className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200 gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500">
                        {item.questionCount} {isAr ? 'سؤال' : 'questions'} • {item.totalPoints}{' '}
                        {isAr ? 'درجة' : 'points'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.responderUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isAr ? 'فتح للاختبار' : 'Take Quiz'}</span>
                    </a>
                    <a
                      href={item.editUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                    >
                      <span>{isAr ? 'تعديل في جوجل' : 'Edit in Google'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features & File Format Guide */}
        <FeaturesGuide lang={lang} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 font-medium">
        <p>
          {isAr
            ? 'محول الاختبارات إلى نماذج جوجل (Google Forms) © 2025 - متوافق مع Word و Excel و PDF'
            : 'Exam to Google Forms Converter © 2025 - Compatible with Word, Excel & PDF'}
        </p>
      </footer>

      {/* Success Modal */}
      {publishResult && (
        <SuccessModal
          result={publishResult}
          onClose={() => setPublishResult(null)}
          onCreateAnother={() => {
            setPublishResult(null);
            setCurrentExam(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
