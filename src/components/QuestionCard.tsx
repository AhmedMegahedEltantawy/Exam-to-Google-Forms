import React from 'react';
import {
  Question,
  QuestionType,
} from '../types';
import {
  Trash2,
  Copy,
  Plus,
  X,
  Check,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  CheckSquare,
  ChevronDownSquare,
  AlignLeft,
  Type as TextIcon,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  isQuiz: boolean;
  onUpdate: (updated: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  lang: 'ar' | 'en';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  isQuiz,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  lang,
}) => {
  const isAr = lang === 'ar';

  const isChoiceType = ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(question.type);

  const handleTypeChange = (newType: QuestionType) => {
    let options = question.options || [];
    if (['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(newType) && options.length === 0) {
      options = [isAr ? 'الخيار 1' : 'Option 1', isAr ? 'الخيار 2' : 'Option 2'];
    }
    onUpdate({
      ...question,
      type: newType,
      options,
    });
  };

  const handleOptionChange = (optIndex: number, val: string) => {
    const newOptions = [...(question.options || [])];
    const oldVal = newOptions[optIndex];
    newOptions[optIndex] = val;

    // Also update correct answers if this was marked as correct
    let newCorrect = [...(question.correctAnswers || [])];
    if (newCorrect.includes(oldVal)) {
      newCorrect = newCorrect.map((c) => (c === oldVal ? val : c));
    }

    onUpdate({
      ...question,
      options: newOptions,
      correctAnswers: newCorrect,
    });
  };

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOptionName = isAr
      ? `الخيار ${currentOptions.length + 1}`
      : `Option ${currentOptions.length + 1}`;
    onUpdate({
      ...question,
      options: [...currentOptions, newOptionName],
    });
  };

  const handleRemoveOption = (optIndex: number) => {
    const currentOptions = question.options || [];
    const removedVal = currentOptions[optIndex];
    const newOptions = currentOptions.filter((_, idx) => idx !== optIndex);
    const newCorrect = (question.correctAnswers || []).filter((c) => c !== removedVal);

    onUpdate({
      ...question,
      options: newOptions,
      correctAnswers: newCorrect,
    });
  };

  const toggleCorrectAnswer = (optionVal: string) => {
    let currentCorrect = [...(question.correctAnswers || [])];

    if (question.type === 'RADIO' || question.type === 'DROP_DOWN') {
      // Single correct answer
      if (currentCorrect.includes(optionVal)) {
        currentCorrect = [];
      } else {
        currentCorrect = [optionVal];
      }
    } else {
      // Multiple answers allowed (CHECKBOX)
      if (currentCorrect.includes(optionVal)) {
        currentCorrect = currentCorrect.filter((c) => c !== optionVal);
      } else {
        currentCorrect.push(optionVal);
      }
    }

    onUpdate({
      ...question,
      correctAnswers: currentCorrect,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all p-5 sm:p-6 mb-4 relative">
      {/* Header of Question Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full border border-indigo-600 bg-white text-indigo-600 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>

          {/* Question Type Selector */}
          <select
            id={`question-type-${index}`}
            value={question.type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="RADIO">{isAr ? 'اختيار من متعدد (إجابة واحدة)' : 'Multiple Choice (Single)'}</option>
            <option value="CHECKBOX">{isAr ? 'مربعات اختيار (إجابات متعددة)' : 'Checkboxes (Multiple)'}</option>
            <option value="DROP_DOWN">{isAr ? 'قائمة منسدلة (Drop Down)' : 'Dropdown'}</option>
            <option value="TEXT">{isAr ? 'إجابة قصيرة (Short Answer)' : 'Short Answer'}</option>
            <option value="PARAGRAPH">{isAr ? 'فقرة / مقال (Paragraph)' : 'Paragraph'}</option>
          </select>

          {/* Required toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={question.required !== false}
              onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
              className="w-3.5 h-3.5 text-indigo-600 rounded"
            />
            <span>{isAr ? 'مطلوب' : 'Required'}</span>
          </label>
        </div>

        {/* Right side controls: Move, Duplicate, Delete, Points */}
        <div className="flex items-center gap-2">
          {isQuiz && (
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
              <span className="text-xs font-bold">{isAr ? 'الدرجة:' : 'Pts:'}</span>
              <input
                id={`question-points-${index}`}
                type="number"
                min="0"
                max="100"
                value={question.pointValue ?? 1}
                onChange={(e) =>
                  onUpdate({ ...question, pointValue: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-12 bg-white text-center font-bold text-xs border border-indigo-300 rounded px-1 py-0.5"
              />
            </div>
          )}

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              title={isAr ? 'تحريك لأعلى' : 'Move Up'}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalQuestions - 1}
              onClick={onMoveDown}
              title={isAr ? 'تحريك لأسفل' : 'Move Down'}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 border-r border-l border-slate-200"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              title={isAr ? 'تكرار السؤال' : 'Duplicate'}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title={isAr ? 'حذف السؤال' : 'Delete'}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-r border-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Question Title & Description Input */}
      <div className="mt-4 space-y-2">
        <input
          id={`input-qtitle-${index}`}
          type="text"
          value={question.title}
          onChange={(e) => onUpdate({ ...question, title: e.target.value })}
          placeholder={isAr ? 'اكتب نص السؤال هنا...' : 'Question text...'}
          className="w-full text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 focus:border-indigo-600 pb-1.5 focus:outline-hidden transition-colors"
        />

        <input
          type="text"
          value={question.description || ''}
          onChange={(e) => onUpdate({ ...question, description: e.target.value })}
          placeholder={isAr ? 'وصف إضافي أو إرشادات توضيحية للسؤال (اختياري)...' : 'Optional subtitle/hint...'}
          className="w-full text-xs text-slate-500 border-b border-transparent focus:border-slate-300 pb-1 focus:outline-hidden"
        />
      </div>

      {/* Question Body: Choices or Textbox */}
      <div className="mt-4">
        {isChoiceType ? (
          <div className="space-y-2">
            {(question.options || []).map((option, optIdx) => {
              const isCorrect = (question.correctAnswers || []).includes(option);
              return (
                <div
                  key={optIdx}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Radio / Checkbox indicator */}
                  <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                    {question.type === 'RADIO' && <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />}
                    {question.type === 'CHECKBOX' && <div className="w-3.5 h-3.5 rounded-xs border-2 border-slate-400" />}
                    {question.type === 'DROP_DOWN' && <span className="text-xs font-mono">{optIdx + 1}.</span>}
                  </div>

                  {/* Option Text Input */}
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden"
                    placeholder={`${isAr ? 'الخيار' : 'Option'} ${optIdx + 1}`}
                  />

                  {/* Mark as Correct Answer toggle */}
                  {isQuiz && (
                    <button
                      type="button"
                      onClick={() => toggleCorrectAnswer(option)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {isCorrect
                        ? isAr
                          ? 'إجابة صحيحة'
                          : 'Correct Answer'
                        : isAr
                        ? 'تحديد كصحيحة'
                        : 'Set Correct'}
                    </button>
                  )}

                  {/* Remove option button */}
                  {(question.options?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200/50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Option button */}
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 py-1.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAr ? 'إضافة خيار جديد' : 'Add Option'}
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
            {question.type === 'TEXT' ? (
              <div className="flex items-center gap-2">
                <TextIcon className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'حقل إجابة نصية قصيرة للمجيب' : 'Short text response field for respondents'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'حقل إجابة فقرة طويلة / مقال' : 'Long paragraph response field for respondents'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Explanation / Feedback */}
      {isQuiz && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAr ? 'التغذية الراجعة / شرح الإجابة للطلاب (اختياري):' : 'Answer feedback & explanation (optional):'}</span>
          </div>
          <input
            type="text"
            value={question.explanation || ''}
            onChange={(e) => onUpdate({ ...question, explanation: e.target.value })}
            placeholder={isAr ? 'شرح سبب صحة الإجابة يظهر للطالب بعد التسليم...' : 'Explanation shown to students after submitting...'}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
};
