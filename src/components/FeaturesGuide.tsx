import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface FeaturesGuideProps {
  lang: 'ar' | 'en';
}

export const FeaturesGuide: React.FC<FeaturesGuideProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  return (
    <div className="mt-12 bg-white rounded-3xl border-2 border-indigo-100 p-6 sm:p-10 shadow-sm space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <HelpCircle className="w-3.5 h-3.5" />
          {isAr ? 'خطوات التحويل والتنسيقات المدعومة' : 'Supported Formats & Conversion Workflow'}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          {isAr
            ? 'كيف تقوم بتحويل أي اختبار إلى نماذج Google بكل سهولة؟'
            : 'How to convert any exam to Google Forms seamlessly?'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          {isAr
            ? 'يتعرف الذكاء الاصطناعي على مختلف أنماط كتابة الاختبارات باللغتين العربية والإنجليزية'
            : 'Our AI recognizes various exam structures in both Arabic and English'}
        </p>
      </div>

      {/* 3 Step Process Grid as in Geometric Balance Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-6 border border-slate-200 rounded-2xl flex flex-col gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 rounded-full flex items-center justify-center font-bold text-indigo-600 bg-white shadow-xs">
            ١
          </div>
          <h4 className="font-bold text-slate-900">{isAr ? 'تحليل الملف' : 'File Analysis'}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'معالجة النصوص وتصنيف أنواع الأسئلة (اختيار من متعدد، صح أو خطأ، مقالي، إجابات قصيرة)'
              : 'Text processing and question classification (multiple choice, true/false, short answers)'}
          </p>
        </div>

        <div className="bg-slate-50 p-6 border border-slate-200 rounded-2xl flex flex-col gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 rounded-full flex items-center justify-center font-bold text-indigo-600 bg-white shadow-xs">
            ٢
          </div>
          <h4 className="font-bold text-slate-900">{isAr ? 'مراجعة المسودة' : 'Review Draft'}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'تأكد من صحة الأسئلة والإجابات والدرجات قبل التصدير النهائي مع إمكانية الإضافة والتعديل'
              : 'Verify questions, correct answers and point values prior to export with full editing flexibility'}
          </p>
        </div>

        <div className="bg-slate-50 p-6 border border-slate-200 rounded-2xl flex flex-col gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 rounded-full flex items-center justify-center font-bold text-indigo-600 bg-white shadow-xs">
            ٣
          </div>
          <h4 className="font-bold text-slate-900">{isAr ? 'إنشاء النموذج' : 'Form Creation'}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'تصدير مباشر إلى حسابك في Google Forms وتوليد روابط الاختبار ورمز الاستجابة السريعة QR'
              : 'Direct export to your Google Forms account with instant test links and QR code'}
          </p>
        </div>
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Word Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 transition-all shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {isAr ? 'ملفات وورد Word (.docx)' : 'Word Documents (.docx)'}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'يقبل مستندات الاختبارات المكتوبة بـ Word. يتعرف تلقائياً على ترقيم الأسئلة، والاختيارات وعلامات النجمة (*) أو الألوان المحددة للإجابة الصحيحة.'
              : 'Accepts Word exams. Detects numbered questions, option letters, asterisks (*) or bold text marking correct answers.'}
          </p>
        </div>

        {/* Excel Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 transition-all shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 border border-emerald-100">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {isAr ? 'جداول إكسيل Excel (.xlsx / .csv)' : 'Excel Sheets (.xlsx / .csv)'}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'يقبل شيتات الإكسيل بأي تقسيم أعمدة (نص السؤال، الخيارات، الإجابة الصحيحة، الدرجة). يقوم الذكاء الاصطناعي بربطها تلقائياً.'
              : 'Accepts Excel spreadsheets with columns for Question, Options, Correct Answer, and Points with automatic mapping.'}
          </p>
        </div>

        {/* PDF Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-rose-300 transition-all shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 border border-rose-100">
            <FileCode className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {isAr ? 'مستندات PDF وملفات النصوص' : 'PDFs & Text Files'}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'يقبل ملفات PDF المصورة والنصية، بالإضافة إلى إمكانية نسخ ولصق نص أي اختبار مباشرة في خانة النص.'
              : 'Accepts text & scanned PDF exams, as well as direct text pasting for fast conversion.'}
          </p>
        </div>
      </div>

      {/* Security & Features Strip */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-indigo-900">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? 'تصحيح ودرجات تلقائية (Google Forms Quiz)' : 'Auto Grading & Points in Google Forms'}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{isAr ? 'تكامل رسمي وآمن مع حساب Google الخاص بك' : 'Official Google Workspace Integration'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{isAr ? 'تحويل فوري في ثوانٍ معدودة' : 'Instant Conversion in Seconds'}</span>
        </div>
      </div>
    </div>
  );
};
