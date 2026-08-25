import React from 'react';
import { ExamData, Question, QuestionType } from '../types';
import { QuestionCard } from './QuestionCard';
import {
  FileText,
  Plus,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Hash,
  Award,
  Trash2,
  ListPlus,
  CheckSquare2,
} from 'lucide-react';

interface ExamEditorProps {
  exam: ExamData;
  onChange: (updatedExam: ExamData) => void;
  onReset: () => void;
  lang: 'ar' | 'en';
}

export const ExamEditor: React.FC<ExamEditorProps> = ({
  exam,
  onChange,
  onReset,
  lang,
}) => {
  const isAr = lang === 'ar';

  const totalPoints = exam.questions.reduce((acc, q) => acc + (q.pointValue || 1), 0);
  const questionsWithAnswers = exam.questions.filter(
    (q) => (q.correctAnswers && q.correctAnswers.length > 0) || !['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(q.type)
  ).length;

  const handleUpdateQuestion = (index: number, updated: Question) => {
    const newQuestions = [...exam.questions];
    newQuestions[index] = updated;
    onChange({
      ...exam,
      questions: newQuestions,
    });
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = exam.questions.filter((_, idx) => idx !== index);
    onChange({
      ...exam,
      questions: newQuestions,
    });
  };

  const handleDuplicateQuestion = (index: number) => {
    const original = exam.questions[index];
    const duplicated: Question = {
      ...original,
      id: `q_${Date.now()}_dup`,
      title: `${original.title} (${isAr ? 'نسخة' : 'Copy'})`,
    };
    const newQuestions = [...exam.questions];
    newQuestions.splice(index + 1, 0, duplicated);
    onChange({
      ...exam,
      questions: newQuestions,
    });
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= exam.questions.length) return;
    const newQuestions = [...exam.questions];
    const [moved] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, moved);
    onChange({
      ...exam,
      questions: newQuestions,
    });
  };

  const handleAddNewQuestion = (type: QuestionType = 'RADIO') => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      title: isAr ? `سؤال جديد ${exam.questions.length + 1}` : `New Question ${exam.questions.length + 1}`,
      type,
      options: ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(type)
        ? [isAr ? 'الخيار 1' : 'Option 1', isAr ? 'الخيار 2' : 'Option 2', isAr ? 'الخيار 3' : 'Option 3', isAr ? 'الخيار 4' : 'Option 4']
        : undefined,
      correctAnswers: [],
      pointValue: 1,
      required: true,
    };
    onChange({
      ...exam,
      questions: [...exam.questions, newQ],
    });
  };

  const handleAddTrueFalse = () => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      title: isAr ? 'صح أم خطأ: ' : 'True or False: ',
      type: 'RADIO',
      options: isAr ? ['صح', 'خطأ'] : ['True', 'False'],
      correctAnswers: [isAr ? 'صح' : 'True'],
      pointValue: 1,
      required: true,
    };
    onChange({
      ...exam,
      questions: [...exam.questions, newQ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Form Metadata Card */}
      <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center text-sm font-bold shadow-xs">
              ٢
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isAr ? 'مراجعة وتعديل نموذج الاختبار' : 'Review & Edit Exam Form'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'يمكنك تعديل الأسئلة، الاختيارات، الإجابات الصحيحة، والدرجات قبل التحويل'
                  : 'Customize questions, answer choices, scoring, and feedback before export'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              {isAr ? 'إعادة تعيين / رفع جديد' : 'Reset / Upload New'}
            </button>
          </div>
        </div>

        {/* Stats Header */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-700">{isAr ? 'عدد الأسئلة' : 'Questions'}</div>
              <div className="text-lg font-black text-indigo-950">{exam.questions.length}</div>
            </div>
          </div>

          {exam.isQuiz && (
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-800">{isAr ? 'مجموع الدرجات' : 'Total Points'}</div>
                <div className="text-lg font-black text-amber-950">{totalPoints} {isAr ? 'درجة' : 'pts'}</div>
              </div>
            </div>
          )}

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800">{isAr ? 'الإجابات المحددة' : 'Answers Set'}</div>
              <div className="text-lg font-black text-emerald-950">
                {questionsWithAnswers} / {exam.questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Form Title & Description Fields */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'عنوان النموذج (Google Form Title):' : 'Form Title:'}
            </label>
            <input
              id="input-form-title"
              type="text"
              value={exam.title}
              onChange={(e) => onChange({ ...exam, title: e.target.value })}
              placeholder={isAr ? 'عنوان الاختبار...' : 'Exam Title...'}
              className="w-full text-base sm:text-lg font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'وصف أو تعليمات الاختبار (Instructions / Description):' : 'Form Description:'}
            </label>
            <textarea
              id="input-form-description"
              rows={2}
              value={exam.description || ''}
              onChange={(e) => onChange({ ...exam, description: e.target.value })}
              placeholder={isAr ? 'اكتب تعليمات الاختبار، المدة الزمنية، أو رسالة ترحيبية للطلاب...' : 'Enter instructions or details for respondents...'}
              className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-indigo-600 rounded-full inline-block"></span>
            {isAr ? 'قائمة الأسئلة' : 'Questions List'} ({exam.questions.length})
          </h3>
        </div>

        {exam.questions.map((q, idx) => (
          <QuestionCard
            key={q.id || idx}
            question={q}
            index={idx}
            totalQuestions={exam.questions.length}
            isQuiz={exam.isQuiz}
            onUpdate={(updated) => handleUpdateQuestion(idx, updated)}
            onDelete={() => handleDeleteQuestion(idx)}
            onDuplicate={() => handleDuplicateQuestion(idx)}
            onMoveUp={() => handleMoveQuestion(idx, idx - 1)}
            onMoveDown={() => handleMoveQuestion(idx, idx + 1)}
            lang={lang}
          />
        ))}

        {/* Add Question Controls */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-add-choice-q"
            type="button"
            onClick={() => handleAddNewQuestion('RADIO')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold rounded-xl transition-colors border border-indigo-100"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'سؤال اختيار من متعدد' : 'Add Multiple Choice'}
          </button>

          <button
            id="btn-add-truefalse-q"
            type="button"
            onClick={handleAddTrueFalse}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold rounded-xl transition-colors border border-emerald-100"
          >
            <CheckSquare2 className="w-4 h-4" />
            {isAr ? 'سؤال صح أو خطأ' : 'Add True/False'}
          </button>

          <button
            id="btn-add-shorttext-q"
            type="button"
            onClick={() => handleAddNewQuestion('TEXT')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors border border-slate-200"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'سؤال إجابة قصيرة' : 'Add Short Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};
