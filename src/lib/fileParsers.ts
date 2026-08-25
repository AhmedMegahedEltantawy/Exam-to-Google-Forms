import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ExtractedFileContent {
  text?: string;
  fileData?: string; // base64
  mimeType?: string;
  fileName: string;
  fileSize: number;
}

// Convert a File to base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:*/*;base64, prefix
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Parse uploaded file based on its extension/type
export const parseUploadedFile = async (file: File): Promise<ExtractedFileContent> => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Word document (.docx)
  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
      text: result.value,
      fileName: file.name,
      fileSize: file.size,
    };
  }

  // Excel / CSV spreadsheet (.xlsx, .xls, .csv)
  if (['xlsx', 'xls', 'csv'].includes(extension)) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let combinedText = '';

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetCsv = XLSX.utils.sheet_to_csv(worksheet);
      if (sheetCsv.trim()) {
        combinedText += `--- ورق العمل / Sheet: ${sheetName} ---\n${sheetCsv}\n\n`;
      }
    });

    return {
      text: combinedText,
      fileName: file.name,
      fileSize: file.size,
    };
  }

  // PDF Document (.pdf) -> multimodal base64 for Gemini
  if (extension === 'pdf' || file.type === 'application/pdf') {
    const base64 = await fileToBase64(file);
    return {
      fileData: base64,
      mimeType: 'application/pdf',
      fileName: file.name,
      fileSize: file.size,
    };
  }

  // Plain text / Markdown (.txt, .md)
  if (['txt', 'text', 'md'].includes(extension) || file.type.startsWith('text/')) {
    const text = await file.text();
    return {
      text,
      fileName: file.name,
      fileSize: file.size,
    };
  }

  // Fallback: try reading as arrayBuffer or text or base64
  try {
    const text = await file.text();
    if (text && text.trim().length > 10) {
      return {
        text,
        fileName: file.name,
        fileSize: file.size,
      };
    }
  } catch (e) {
    // If not text, send as base64
  }

  const base64 = await fileToBase64(file);
  return {
    fileData: base64,
    mimeType: file.type || 'application/octet-stream',
    fileName: file.name,
    fileSize: file.size,
  };
};
