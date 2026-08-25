import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper function to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for executing Gemini call with retry and model fallback
async function generateExamWithFallback(ai: GoogleGenAI, contents: any[], systemPrompt: string, defaultPoints: number = 1) {
  const modelsToTry = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-flash-lite"];
  const maxRetriesPerModel = 2;
  let lastError: any = null;

  const schemaConfig = {
    systemInstruction: systemPrompt,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Title of the exam / quiz",
        },
        description: {
          type: Type.STRING,
          description: "Description or instructions for the exam",
        },
        isQuiz: {
          type: Type.BOOLEAN,
          description: "Whether this is a graded quiz",
        },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description: "Unique ID for question",
              },
              title: {
                type: Type.STRING,
                description: "The question text prompt",
              },
              description: {
                type: Type.STRING,
                description: "Optional context or subtitle for the question",
              },
              type: {
                type: Type.STRING,
                enum: ["RADIO", "CHECKBOX", "DROP_DOWN", "TEXT", "PARAGRAPH"],
                description: "Question type",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of options for multiple choice or dropdown questions",
              },
              correctAnswers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of exact option strings or text strings that are correct",
              },
              pointValue: {
                type: Type.NUMBER,
                description: "Point value for this question",
              },
              explanation: {
                type: Type.STRING,
                description: "Feedback or explanation for the answer",
              },
              required: {
                type: Type.BOOLEAN,
                description: "Whether this question is required",
              },
            },
            required: ["title", "type"],
          },
        },
      },
      required: ["title", "questions"],
    },
  };

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`[parse-exam] Trying model: ${modelName} (attempt ${attempt}/${maxRetriesPerModel})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: schemaConfig,
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text.trim());
          return parsed;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[parse-exam] Attempt ${attempt} on ${modelName} failed:`, errMsg);

        // Check if error is transient (503 High Demand / 429 Rate limit / 500)
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("500") ||
          errMsg.includes("INTERNAL");

        if (isTransient && attempt < maxRetriesPerModel) {
          const delayMs = attempt * 1200;
          console.log(`[parse-exam] Waiting ${delayMs}ms before retrying ${modelName}...`);
          await sleep(delayMs);
          continue; // Retry same model
        }

        // If not transient or reached max retries for this model, break to try next fallback model
        break;
      }
    }
  }

  throw lastError || new Error("Failed to parse exam with available AI models.");
}

// Exam parsing endpoint
app.post("/api/parse-exam", async (req, res) => {
  try {
    const { text, fileData, mimeType, defaultPoints, isQuiz } = req.body;

    if (!text && !fileData) {
      return res.status(400).json({ error: "No exam text or file data provided" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert educational AI and exam-to-quiz converter.
Your mission is to accurately parse, extract, and structure any test, exam, quiz, questionnaire, or worksheet (in Arabic, English, or any language) from the provided content into a well-structured quiz format ready for Google Forms.

Rules for question extraction:
1. Identify the exam title and general instructions/description.
2. Extract all questions in sequential order.
3. For each question, determine its type:
   - "RADIO" for single-choice / multiple-choice with one correct answer or True/False (صح/خطأ).
   - "CHECKBOX" for multiple answers / select all that apply.
   - "DROP_DOWN" for dropdown selection.
   - "TEXT" for short answer questions.
   - "PARAGRAPH" for long essay/explanation questions.
4. Extract options/choices clearly. Clean up prefix labels like (A, B, C, D) or (أ، ب، ج، د) from the choice value, or keep them if they are part of the option meaning.
5. Identify the correct answer(s) if provided or marked (e.g. asterisks, bold, answer key at the end, marked letter like [A], (صح), etc.). If the answer key is clearly deduced or provided, set the correct answers. If not explicitly known, leave correct answers empty or provide the best deduction.
6. Set appropriate point values (default to ${defaultPoints || 1} point per question if not specified).
7. Capture any feedback, hint, or explanation if present in the source document.
8. Maintain the original language (Arabic, English, etc.) accurately with correct grammar, punctuation, and formatting.`;

    const contents: any[] = [];

    if (fileData && mimeType) {
      // PDF or Image direct multimodal processing
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: fileData,
        },
      });
      contents.push({
        text: `Please parse this attached exam file into the structured quiz schema. Additional text instructions: ${text || "Extract all questions, options, and answer keys."}`,
      });
    } else {
      contents.push({
        text: `Please parse the following exam content into the structured quiz schema:\n\n${text}`,
      });
    }

    const parsedJson = await generateExamWithFallback(ai, contents, systemPrompt, defaultPoints);
    
    // Ensure every question has a unique ID and safe defaults
    if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
      parsedJson.questions = parsedJson.questions.map((q: any, idx: number) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        title: q.title || `السؤال ${idx + 1}`,
        description: q.description || "",
        type: q.type || (q.options && q.options.length > 0 ? "RADIO" : "TEXT"),
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [],
        pointValue: typeof q.pointValue === "number" ? q.pointValue : (defaultPoints || 1),
        explanation: q.explanation || "",
        required: q.required !== false,
      }));
    }

    return res.json({
      success: true,
      data: parsedJson,
    });
  } catch (error: any) {
    console.error("Error in /api/parse-exam:", error);
    
    let cleanMessage = error?.message || "Failed to parse exam content";
    try {
      if (cleanMessage.startsWith("{") || cleanMessage.includes('"error"')) {
        const parsed = JSON.parse(cleanMessage.replace(/^[^{]*/, ""));
        if (parsed.error?.message) {
          cleanMessage = parsed.error.message;
        }
      }
    } catch {
      // Keep original
    }

    if (cleanMessage.includes("503") || cleanMessage.includes("high demand") || cleanMessage.includes("UNAVAILABLE")) {
      cleanMessage = "The AI service is currently experiencing high demand. Please try again in a few seconds (الخدمة تشهد ضغطاً مؤقتاً، يرجى إعادة المحاولة).";
    }

    return res.status(500).json({
      success: false,
      error: cleanMessage,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
