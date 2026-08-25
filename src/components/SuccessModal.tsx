import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { FormPublishResult } from '../types';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Download,
  PlusCircle,
  X,
  FileSpreadsheet,
  FileCheck2,
} from 'lucide-react';

interface SuccessModalProps {
  result: FormPublishResult;
  onClose: () => void;
  onCreateAnother: () => void;
  lang: 'ar' | 'en';
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  result,
  onClose,
  onCreateAnother,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [copiedLink, setCopiedLink] = useState<'responder' | 'edit' | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopy = (text: string, type: 'responder' | 'edit') => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${result.title || 'Google_Form_Exam'}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    result.responderUri
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-indigo-100 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {isAr ? 'تم إنشاء النموذج بنجاح!' : 'Google Form Created Successfully!'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {isAr
              ? `تم إنشاء وتنسيق نموذج "${result.title}" مباشرة على حساب Google Forms الخاص بك.`
              : `"${result.title}" has been published to your Google Forms account.`}
          </p>
        </div>

        {/* Details card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-6 space-y-3">
          {/* Main Links */}
          <div className="space-y-2.5">
            {/* Responder link (For students) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {isAr ? 'رابط الإجابة للاختبار (للطلاب / المتدربين):' : 'Student / Response Link:'}
                </div>
                <div className="text-xs text-slate-500 font-mono truncate max-w-xs sm:max-w-sm">
                  {result.responderUri}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(result.responderUri, 'responder')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {copiedLink === 'responder' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{isAr ? 'تم النسخ' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ' : 'Copy'}</span>
                    </>
                  )}
                </button>

                <a
                  href={result.responderUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فتح النموذج' : 'Open'}</span>
                </a>
              </div>
            </div>

            {/* Edit link (For teacher) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {isAr ? 'رابط التعديل والإعدادات (للمعلم / المنشئ):' : 'Teacher / Editor Link:'}
                </div>
                <div className="text-xs text-slate-500 font-mono truncate max-w-xs sm:max-w-sm">
                  {result.editUri}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(result.editUri, 'edit')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {copiedLink === 'edit' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{isAr ? 'تم النسخ' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ' : 'Copy'}</span>
                    </>
                  )}
                </button>

                <a
                  href={result.editUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل النموذج' : 'Edit Form'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* QR Code toggle */}
          {showQr && (
            <div className="pt-3 border-t border-slate-200 text-center flex flex-col items-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-40 h-40 rounded-xl border border-slate-200 p-2 bg-white shadow-xs"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {isAr ? 'امسح الرمز بالكاميرا لفتح الاختبار فوراً على الهاتف' : 'Scan with mobile camera to take quiz'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <QrCode className="w-4 h-4" />
              <span>{showQr ? (isAr ? 'إخفاء رمز QR' : 'Hide QR') : (isAr ? 'عرض رمز QR' : 'Show QR')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تنزيل نسخة JSON' : 'Download JSON'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? 'تحويل اختبار جديد' : 'Convert Another Exam'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
