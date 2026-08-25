import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  Sparkles,
  ClipboardList,
  Layers,
  Check,
  AlertCircle,
  Settings2,
  FileCheck,
} from 'lucide-react';
import { SAMPLE_EXAMS, SampleExam } from '../data/sampleExams';
import { parseUploadedFile, ExtractedFileContent } from '../lib/fileParsers';
import { ParseProgress } from '../types';

interface UploadSectionProps {
  onExamExtracted: (extracted: { text?: string; fileData?: string; mimeType?: string; defaultPoints: number; isQuiz: boolean; fileName?: string }) => void;
  parseProgress: ParseProgress;
  lang: 'ar' | 'en';
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onExamExtracted,
  parseProgress,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isQuiz, setIsQuiz] = useState(true);
  const [defaultPoints, setDefaultPoints] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleExam) => {
    setRawText(sample.content);
    setActiveTab('paste');
    setErrorMessage(null);
  };

  const handleStartParsing = async () => {
    setErrorMessage(null);

    if (activeTab === 'upload') {
      if (!selectedFile) {
        setErrorMessage(isAr ? 'يرجى اختيار ملف اختبار أولاً (Word أو Excel أو PDF)' : 'Please select an exam file first (Word, Excel, or PDF)');
        return;
      }

      try {
        const parsed = await parseUploadedFile(selectedFile);
        onExamExtracted({
          text: parsed.text,
          fileData: parsed.fileData,
          mimeType: parsed.mimeType,
          defaultPoints,
          isQuiz,
          fileName: selectedFile.name,
        });
      } catch (err: any) {
        setErrorMessage(err.message || (isAr ? 'حدث خطأ أثناء قراءة الملف' : 'Error reading uploaded file'));
      }
    } else {
      // Paste / Samples
      if (!rawText.trim()) {
        setErrorMessage(isAr ? 'يرجى إدخال أو لصق نص الاختبار' : 'Please enter or paste exam text');
        return;
      }

      onExamExtracted({
        text: rawText,
        defaultPoints,
        isQuiz,
        fileName: isAr ? 'اختبار مخصص' : 'Custom Exam',
      });
    }
  };

  const isParsing = parseProgress.status === 'reading_file' || parseProgress.status === 'ai_analyzing';

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center text-sm font-bold shadow-xs">
              ١
            </span>
            {isAr ? 'رفع أو إدخال ملف الاختبار' : 'Upload or Enter Exam File'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isAr
              ? 'يدعم ملفات Word (.docx) و Excel (.xlsx / .csv) و PDF (.pdf) أو اللصق المباشر'
              : 'Supports Word (.docx), Excel (.xlsx / .csv), PDF (.pdf) or direct text paste'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button
            id="tab-upload"
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {isAr ? 'رفع ملف' : 'Upload File'}
          </button>
          <button
            id="tab-paste"
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {isAr ? 'لصق نص' : 'Paste Text'}
          </button>
          <button
            id="tab-samples"
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'samples'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? 'نماذج جاهزة' : 'Sample Exams'}
          </button>
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="mt-6">
        {/* TAB 1: FILE DROPZONE */}
        {activeTab === 'upload' && (
          <div>
            <div
              id="dropzone-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.xlsx,.xls,.csv,.pdf,.txt"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{selectedFile.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB —{' '}
                    <span className="text-emerald-700 font-semibold">
                      {isAr ? 'تم تحديد الملف بنجاح، اضغط لتغييره' : 'File selected. Click to change'}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-5 border border-indigo-100 shadow-xs">
                    <Upload className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {isAr
                      ? 'قم برفع ملف الاختبار هنا'
                      : 'Upload your exam file here'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                    {isAr
                      ? 'يدعم المحول صيغ Word (docx)، Excel (xlsx) و PDF. سيتم استخراج الأسئلة تلقائياً وتحويلها لنماذج جوجل.'
                      : 'Supports Word (.docx), Excel (.xlsx), PDF (.pdf). Questions will be parsed and formatted automatically.'}
                  </p>

                  {/* Format Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                      <FileText className="w-3.5 h-3.5" />
                      <span>DOCX</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>XLSX</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold border border-red-100">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PASTE TEXT */}
        {activeTab === 'paste' && (
          <div>
            <textarea
              id="input-exam-text"
              rows={8}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={
                isAr
                  ? `الصق هنا نص الاختبار أو الأسئلة مع الاختيارات والإجابات الصحيحة...\n\nمثال:\nس1: ما هي عاصمة فرنسا؟\nأ) مدريد\nب) باريس *\nج) روما\n(درجة: 2)\n\nس2: صح أو خطأ: الأرض تدور حول الشمس.\nأ) صح *\nب) خطأ`
                  : `Paste your exam questions and choices here...\n\nExample:\nQ1: What is the capital of France?\nA) Madrid\nB) Paris *\nC) Rome\n[Points: 2]\n\nQ2: True or False: Earth revolves around the Sun.\nA) True *\nB) False`
              }
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono leading-relaxed resize-y bg-slate-50/60 text-slate-800"
            />
          </div>
        )}

        {/* TAB 3: SAMPLE EXAMS */}
        {activeTab === 'samples' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_EXAMS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800">
                        {isAr ? sample.name : sample.nameEn}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">{sample.category}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    {isAr ? 'تجربة النموذج' : 'Load Sample'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Options Row (Quiz Mode & Default Points) */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <div className="flex flex-wrap items-center gap-6">
            {/* Quiz Mode Switch */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                id="checkbox-is-quiz"
                type="checkbox"
                checked={isQuiz}
                onChange={(e) => setIsQuiz(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {isAr ? 'تفعيل وضع الاختبار والدرجات (Quiz Mode)' : 'Enable Quiz Mode & Grading'}
              </span>
            </label>

            {/* Default Points */}
            {isQuiz && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'الدرجة لكل سؤال:' : 'Default Points/Question:'}</span>
                <select
                  id="select-default-points"
                  value={defaultPoints}
                  onChange={(e) => setDefaultPoints(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>
            )}
          </div>

          {/* AI Extract Button */}
          <button
            id="btn-extract-exam"
            type="button"
            onClick={handleStartParsing}
            disabled={isParsing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {isParsing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{parseProgress.message || (isAr ? 'جاري التحليل واستخراج الأسئلة...' : 'Analyzing exam...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'استخراج وتحليل الاختبار بالذكاء الاصطناعي' : 'Extract & Parse with AI'}</span>
              </>
            )}
          </button>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
