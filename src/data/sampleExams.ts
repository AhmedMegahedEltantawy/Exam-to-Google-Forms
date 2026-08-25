export interface SampleExam {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  icon: string;
  content: string;
}

export const SAMPLE_EXAMS: SampleExam[] = [
  {
    id: 'general-science-ar',
    name: 'اختبار العلوم العامة والفيزياء (عربي)',
    nameEn: 'General Science & Physics Quiz (Arabic)',
    category: 'علوم',
    icon: 'Atom',
    content: `اختبار منتصف الفصل الدراسي - مادة العلوم العامة
التعليمات: أجب عن جميع الأسئلة التالية بدقة. الدرجة الكلية: 10 درجات.

س1: ما هو الكوكب الأقرب إلى الشمس في المجموعة الشمسية؟
أ) الزهرة
ب) عطارد *
ج) المريخ
د) الأرض
(درجة: 2)

س2: ما هي وحدة قياس القوة في النظام الدولي للوحدات (SI)؟
أ) الجول
ب) الواط
ج) النيوتن *
د) الباسكال
(درجة: 2)

س3: الغاز الذي تستهلكه النباتات في عملية البناء الضوئي هو:
أ) الأكسجين
ب) ثاني أكسيد الكربون *
ج) النيتروجين
د) الهيدروجين
(درجة: 2)

س4: صح أم خطأ: سرعة الضوء في الفراغ أكبر من سرعة الصوت في الهواء.
أ) صح *
ب) خطأ
(درجة: 2)
توضيح: سرعة الضوء تبلغ حوالي 300,000 كم/ث بينما سرعة الصوت 343 م/ث تقريباً.

س5: ما هو رمز عنصر الماء الكيميائي؟
(سؤال إجابة قصيرة - درجة: 2)
الإجابة النموذجية: H2O`,
  },
  {
    id: 'arabic-grammar',
    name: 'اختبار قواعد اللغة العربية والنحو',
    nameEn: 'Arabic Grammar Test',
    category: 'لغة عربية',
    icon: 'BookOpen',
    content: `اختبار مهارات النحو والإعراب
القسم: اللغة العربية

س1: ما هو إعراب كلمة "العلمُ" في جملة: "العلمُ نورٌ"؟
أ) فاعل مرفوع
ب) مبتدأ مرفوع وعلامة رفعه الضمة *
ج) خبر مرفوع
د) مفعول به منصوب
(درجة: 2)

س2: أي من الحروف التالية يُعد من حروف الجزم التي تجزم الفعل المضارع؟
أ) لن
ب) كي
ج) لم *
د) أن
(درجة: 2)

س3: حدد الكلمات التي تعبر عن جمع مذكر سالم (اختر كل ما ينطبق):
أ) المعلمون *
ب) الفاطمات
ج) المهندسين *
د) الأقلام
(درجة: 2)

س4: صح أم خطأ: الفاعل دائماً يكون منصوباً في اللغة العربية.
أ) صح
ب) خطأ *
(درجة: 1)
توضيح: الفاعل من المرفوعات دائماً.`,
  },
  {
    id: 'excel-tabular-exam',
    name: 'نموذج جدول إكسيل (شيت الأسئلة)',
    nameEn: 'Excel Sheet Table Format',
    category: 'إكسيل',
    icon: 'Table',
    content: `رقم السؤال,نص السؤال,نوع السؤال,الخيار أ,الخيار ب,الخيار ج,الخيار د,الإجابة الصحيحة,الدرجة
1,ما هي عاصمة مصر؟,اختيار من متعدد,الإسكندرية,القاهرة,الجيزة,أسوان,القاهرة,1
2,كم عدد قارات العالم المأهولة؟,اختيار من متعدد,5,6,7,8,7,1
3,الإنترنت بدأ تحت اسم شبكة أربانت ARPANET,صح أو خطأ,صح,خطأ,,,صح,1
4,ما هي لغة البرمجة الأكثر استخداماً في تطوير واجهات الويب؟,اختيار من متعدد,بايثون,جافاسكريبت,سي بلس بلس,كوتلن,جافاسكريبت,2`,
  },
  {
    id: 'english-computer-science',
    name: 'Computer Science Fundamentals (English)',
    nameEn: 'Computer Science Quiz',
    category: 'Technology',
    icon: 'Code',
    content: `Computer Science 101 - Final Assessment
Instructions: Choose the best answer for each question. Total points: 10.

1. Which data structure operates on a First-In-First-Out (FIFO) basis?
A) Stack
B) Queue *
C) Tree
D) Graph
[Points: 2]

2. What does HTTP stand for?
A) HyperText Transfer Protocol *
B) High Transfer Text Platform
C) Hyperlink Transmission Tech Process
D) Host Transport Terminal Protocol
[Points: 2]

3. Which of the following are programming languages? (Select all that apply)
A) Python *
B) HTML
C) TypeScript *
D) CSS
E) Rust *
[Points: 3]

4. True or False: Binary search has a time complexity of O(log n) on sorted arrays.
A) True *
B) False
[Points: 1]
Feedback: Binary search divides the search interval in half every step.

5. What is the output of 2 + 2 * 3 in standard operator precedence?
Answer: 8
[Points: 2]`,
  },
];
