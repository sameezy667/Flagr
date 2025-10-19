// src/services/llama-api.services.ts
// Note: Despite the filename, this service now uses Google Gemini API

import { Message, MessageRole, AIAnalysisData } from '../types';
import JSON5 from 'json5';

// --- CONFIGURATION ---
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Creates the detailed system prompt for document analysis.
 * The prompt now only needs to describe the *content* of the JSON.
 */
function getDocumentAnalysisPrompt(docType: string): string {
  return `You are an expert AI legal assistant. Your task is to analyze a ${docType} and return a structured JSON object. The JSON output must conform to this exact TypeScript interface:
interface AIAnalysisData {
  plainLanguageSummary: string;
  flags: { id: string; title: string; clause: string; explanation: string; severity: 'Low' | 'Medium' | 'High'; suggestedRewrite: string; }[];
  riskAssessment: { overallSummary: string; risks: { area: string; assessment: string; score: number; }[]; };
  aiInsights: { overallSummary: string; recommendations: { id: string; recommendation: string; justification: string; }[]; };
  detectedDocType?: string;
}

First, as a preliminary step, identify the most likely type of this document (e.g., 'Employment Agreement', 'Privacy Policy', 'Terms of Service'). Add this identification to the final JSON object under a key called 'detectedDocType'. Then, proceed with the rest of the analysis as requested.

GUIDELINES:
1.  **plainLanguageSummary**: Concise, neutral summary in simple language.
2.  **flags**: Look for POWER EXPANSION, VAGUE LANGUAGE, RIGHTS RESTRICTIONS, SURVEILLANCE, EMERGENCY POWERS, FINANCIAL IMPACT. 'clause' must be an exact quote. If none, return [].
3.  **riskAssessment**: Provide an 'overallSummary' and list 'risks' with a 'score' from 1-10.
4.  **aiInsights**: Provide an 'overallSummary' and 'recommendations'.
5.  **suggestedRewrite**: For each flag you create, also provide a 'suggestedRewrite' property. This should contain a rewritten version of the clause that is safer and more favorable to the user.
Generate at least 2-3 flags, 2-3 risks, and 2-3 insights for a complex document.
`;
}

/**
 * Generates the structured legal analysis by calling the Google Gemini API.
 */
export async function generateDocumentAnalysis(
  documentContent: string,
  docType: string
): Promise<AIAnalysisData> {
  if (!API_KEY) {
    throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const systemPrompt = getDocumentAnalysisPrompt(docType);
  const userPrompt = `Document for analysis:\n\n${documentContent}`;

  try {
    const response = await fetch(`${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Gemini API:', errorData);
      throw new Error(`API returned an error: ${errorData.error?.message || response.statusText}`);
    }

    const responseData = await response.json();
    const messageContent = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!messageContent) {
      throw new Error("API response did not contain a valid message.");
    }
    
    const parsedData = JSON.parse(messageContent);
    return parsedData as AIAnalysisData;

  } catch (error) {
    console.error('Error during Gemini API call or JSON parsing:', error);
    if (error instanceof SyntaxError) {
      console.error("The AI returned a response that was not valid JSON.", error);
    }
    throw new Error(
      'Failed to get a valid analysis from the AI. The AI response may have been incomplete or improperly formatted.'
    );
  }
}

/**
 * Creates the system prompt for contract template generation.
 */
function getTemplateGenerationPrompt(contractType: string): string {
  return `You are an expert AI legal assistant. Generate a safe, compliant ${contractType} contract template.

Respond ONLY with a valid JSON object with two keys:
- template: the full contract template as plain text
- flags: an array of risk flags, each with { id, title, clause, explanation, severity, suggestedRewrite }
Do NOT include any other text, explanation, or formatting. Only output the JSON object.`;
}

/**
 * Generates a contract template and risk flags using the AI API.
 */
export async function generateContractTemplate(contractType: string): Promise<{ template: string; flags: any[] }> {
  if (!API_KEY) {
    throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const systemPrompt = getTemplateGenerationPrompt(contractType);
  const userPrompt = `Generate a ${contractType} template.`;

  try {
    const response = await fetch(`${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      let errorMessage = `API returned an error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) errorMessage = errorData.error.message;
        if (errorData.failed_generation) errorMessage += `\nDetails: ${errorData.failed_generation}`;
      } catch {}
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    const messageContent = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!messageContent) {
      throw new Error("API response did not contain a valid message.");
    }
    console.log('Raw AI contract template output:', messageContent);
    // Try to extract a valid JSON object
    let parsed = null;
    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON5.parse(jsonMatch[0]);
      } catch (err) {
        // ignore
      }
    }
    // If not a valid object, try to extract an array
    if (!parsed) {
      const arrayMatch = messageContent.match(/\[([\s\S]*)\]/);
      if (arrayMatch) {
        try {
          const flags = JSON5.parse(arrayMatch[0]);
          parsed = { template: '', flags };
        } catch (err) {
          // ignore
        }
      }
    }
    // If still not parsed, try to reconstruct from fragments
    if (!parsed) {
      // Try to find all objects and wrap in an array
      const allObjects = messageContent.match(/\{[^}]+\}/g);
      if (allObjects && allObjects.length > 1) {
        try {
          const flags = allObjects.map((obj: any) => JSON5.parse(obj));
          parsed = { template: '', flags };
        } catch (err) {
          // ignore
        }
      }
    }
    if (!parsed) {
      // Last resort: try to extract "template" and "flags" manually
      const templateMatch = messageContent.match(/"template"\s*:\s*"([\s\S]*?)",\s*"flags"/);
      const flagsMatch = messageContent.match(/"flags"\s*:\s*(\[.*\])\s*\}/s);
      if (templateMatch && flagsMatch) {
        try {
          const template = templateMatch[1];
          const flags = JSON5.parse(flagsMatch[1]);
          parsed = { template, flags };
        } catch (err) {
          throw new Error('Failed to parse AI JSON output. Raw output:\n' + messageContent);
        }
      } else {
        throw new Error('Failed to parse AI JSON output. Raw output:\n' + messageContent);
      }
    }
    if (!parsed.template || typeof parsed.template !== 'string') {
      parsed.template = '';
    }
    if (!parsed.flags || !Array.isArray(parsed.flags)) {
      parsed.flags = [];
    }
    return parsed;
  } catch (error) {
    console.error('Error during contract template generation:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate contract template.');
  }
}

// The rest of the file remains the same.

/**
 * Streams the chat response for follow-up questions from the Gemini API.
 */
export async function* streamChatResponse(
  history: Message[]
): AsyncGenerator<string> {
  if (!API_KEY) {
      yield "Error: Missing API Key in the application configuration.";
      return;
  }
    const systemInstruction = `You are Flagr, an expert AI assistant specializing in document analysis. The user has already seen the initial analysis of their document. Your role now is to answer follow-up questions accurately and conversationally, based ONLY on the document context provided in the chat history. If the answernot in the document, state that clearly. Use formatting like bolding and bullet points to improve readability.`;

    // Convert message history to Gemini format
    const contents = [
      {
        parts: [{ text: systemInstruction }]
      },
      ...history.map(msg => ({
        role: msg.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

  try {
    const response = await fetch(`${API_BASE_URL}/${MODEL_NAME}:streamGenerateContent?key=${API_KEY}&alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok || !response.body) {
       const errorText = await response.text();
       throw new Error(`Failed to stream from the AI: ${response.statusText} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          try {
            const chunk = JSON.parse(data);
            const content = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) yield content;
          } catch (e) {
            console.error('Error parsing stream chunk:', data);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from Gemini API:', error);
    yield `Error: Could not get a response from the AI. Check API key and provider status.`;
  }
}

/**
 * A utility function to generate a title from a message.
 */
export function generateTitleFromMessage(message: string): string {
  const cleanMessage = message.replace(/(\*|_|`)/g, '').trim();
  const words = cleanMessage.split(/\s+/);
  const title = words.slice(0, 5).join(' ');
  return words.length > 5 ? `${title}...` : title;
}