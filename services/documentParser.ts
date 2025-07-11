import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { TextStats } from '../types';

// PDF.js worker configuration with fallback
const workerSources = [
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.js',
    'https://unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js'
];

// Try to set the worker source with fallback
let workerSet = false;
for (const source of workerSources) {
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = source;
        console.log('[DEBUG] PDF.js worker set to:', source);
        workerSet = true;
        break;
    } catch (error) {
        console.warn('[DEBUG] Failed to set worker source:', source, error);
    }
}

if (!workerSet) {
    console.error('[DEBUG] Failed to set any PDF.js worker source');
}

// Helper to read file as ArrayBuffer
const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};

// Helper to read file as text
const readAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

/**
 * Extracts raw text content from various file types.
 * @param file The file to parse (PDF, DOCX, TXT, etc.).
 * @returns A promise that resolves with the extracted text.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            try {
                const arrayBuffer = await readAsArrayBuffer(file);
                const typedArray = new Uint8Array(arrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let textContent = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const text = await page.getTextContent();
                    textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
                }
                return textContent;
            } catch (error) {
                console.error('Error parsing PDF:', error);
                throw new Error('Failed to parse PDF file.');
            }
        case 'docx':
            try {
                const arrayBuffer = await readAsArrayBuffer(file);
                const result = await mammoth.extractRawText({ arrayBuffer });
                return result.value;
            } catch (error) {
                console.error('Error parsing DOCX:', error);
                throw new Error('Failed to parse DOCX file.');
            }
        case 'txt':
        case 'md':
        case 'rtf':
        case 'html':
        case 'xml':
            return readAsText(file);
        default:
            if (extension === 'doc') {
                throw new Error('.doc files are not supported. Please convert to .docx, .pdf, or a text format.');
            }
            throw new Error(`Unsupported file type: .${extension}`);
    }
};

/**
 * Auto-detects document type based on keywords in the content.
 * @param text The document content.
 * @returns A string representing the detected document type.
 */
export const detectDocumentType = (text: string): string => {
    const textLower = text.toLowerCase();
    
    if (["privacy policy", "privacy notice", "data collection"].some(term => textLower.includes(term))) {
        return "Privacy Policy";
    }
    if (["terms of service", "terms of use", "user agreement"].some(term => textLower.includes(term))) {
        return "Terms of Service";
    }
    if (["bill", "act", "legislation", "congress", "senate"].some(term => textLower.includes(term))) {
        return "Legislation/Bill";
    }
    if (["policy", "directive", "guideline", "procedure"].some(term => textLower.includes(term))) {
        return "Policy Document";
    }
    if (["contract", "agreement", "license"].some(term => textLower.includes(term))) {
        return "Contract/Agreement";
    }
    
    return "Legal Document";
};

/**
 * Cleans and preprocesses text for analysis.
 * @param text The raw text content.
 * @returns Cleaned and truncated text.
 */
export const cleanText = (text: string): string => {
    let cleanedText = text.replace(/�/g, ' ').replace(/\x00/g, ' '); // Remove common artifacts
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim(); // Replace multiple whitespace with single space
    
    // Limit length for model context window, as in the Python example
    if (cleanedText.length > 4000) {
        cleanedText = cleanedText.substring(0, 4000) + "...";
    }
    
    return cleanedText;
};

/**
 * Calculates basic statistics for a given text.
 * @param text The text to analyze.
 * @returns An object containing text statistics.
 */
export const getTextStats = (text: string): TextStats => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    // A simple sentence counter. More robust methods exist but this is a good estimate.
    const sentences = (text.match(/[.!?…]+/g) || []).length || 1;
    const readingTime = Math.max(1, Math.round(words / 200)); // Assumes 200 WPM reading speed

    return {
        words,
        characters,
        sentences,
        readingTime
    };
};