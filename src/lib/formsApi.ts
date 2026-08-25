import { ExamData, FormPublishResult } from '../types';

export const createGoogleFormFromExam = async (
  exam: ExamData,
  accessToken: string
): Promise<FormPublishResult> => {
  if (!accessToken) {
    throw new Error('Access token is missing. Please sign in with Google first.');
  }

  // 1. Create the initial empty Google Form
  const createFormRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: exam.title || 'اختبار جديد (Google Form)',
        documentTitle: exam.title || 'اختبار جديد (Google Form)',
      },
    }),
  });

  if (!createFormRes.ok) {
    const errorData = await createFormRes.json().catch(() => ({}));
    console.error('Error creating Google Form:', errorData);
    throw new Error(
      errorData.error?.message || `Failed to create Google Form: HTTP ${createFormRes.status}`
    );
  }

  const createdForm = await createFormRes.json();
  const formId = createdForm.formId;
  const responderUri = createdForm.responderUri;
  const editUri = `https://docs.google.com/forms/d/${formId}/edit`;

  // 2. Prepare batchUpdate requests
  const requests: any[] = [];

  // Update description if present
  if (exam.description && exam.description.trim()) {
    requests.push({
      updateFormInfo: {
        info: {
          description: exam.description.trim(),
        },
        updateMask: 'description',
      },
    });
  }

  // Enable quiz mode if requested
  if (exam.isQuiz) {
    requests.push({
      updateSettings: {
        settings: {
          quizSettings: {
            isQuiz: true,
          },
        },
        updateMask: 'quizSettings.isQuiz',
      },
    });
  }

  // Add questions
  let itemIndex = 0;
  let totalPoints = 0;

  for (const question of exam.questions) {
    const isChoiceType = ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(question.type);
    const validOptions = (question.options || []).filter((opt) => opt && opt.trim().length > 0);
    const safeOptions = validOptions.length > 0 ? validOptions : ['خيار 1', 'خيار 2'];

    const correctAnswers = (question.correctAnswers || [])
      .filter((ans) => ans && ans.trim().length > 0)
      .map((ans) => ({ value: ans.trim() }));

    const pointValue = typeof question.pointValue === 'number' ? question.pointValue : 1;
    totalPoints += pointValue;

    const questionObject: any = {
      required: question.required !== false,
    };

    // Grading setup for Quiz
    if (exam.isQuiz) {
      const gradingObj: any = {
        pointValue: pointValue,
      };

      if (correctAnswers.length > 0) {
        gradingObj.correctAnswers = {
          answers: correctAnswers,
        };

        // For autograded questions (with correctAnswers), feedback MUST be in whenRight / whenWrong
        if (question.explanation && question.explanation.trim()) {
          const feedbackText = question.explanation.trim();
          gradingObj.whenRight = { text: feedbackText };
          gradingObj.whenWrong = { text: feedbackText };
        }
      } else {
        // For non-autograded questions, generalFeedback is allowed
        if (question.explanation && question.explanation.trim()) {
          gradingObj.generalFeedback = {
            text: question.explanation.trim(),
          };
        }
      }

      questionObject.grading = gradingObj;
    }

    // Choice or Text configuration
    if (isChoiceType) {
      questionObject.choiceQuestion = {
        type: question.type,
        options: safeOptions.map((opt) => ({ value: opt })),
        shuffle: false,
      };
    } else {
      questionObject.textQuestion = {
        paragraph: question.type === 'PARAGRAPH',
      };
    }

    requests.push({
      createItem: {
        item: {
          title: question.title || `السؤال ${itemIndex + 1}`,
          description: question.description ? question.description.trim() : undefined,
          questionItem: {
            question: questionObject,
          },
        },
        location: {
          index: itemIndex,
        },
      },
    });

    itemIndex++;
  }

  // Execute batchUpdate if there are requests
  if (requests.length > 0) {
    const batchUpdateRes = await fetch(
      `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!batchUpdateRes.ok) {
      const errorData = await batchUpdateRes.json().catch(() => ({}));
      console.error('Error applying batchUpdate to Google Form:', errorData);
      throw new Error(
        errorData.error?.message ||
          `Failed to populate questions in Google Form: HTTP ${batchUpdateRes.status}`
      );
    }
  }

  return {
    formId,
    title: exam.title || 'Google Form',
    responderUri: responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
    editUri,
    createdAt: new Date().toISOString(),
    questionCount: exam.questions.length,
    totalPoints: exam.isQuiz ? totalPoints : 0,
  };
};
