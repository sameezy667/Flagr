// src/services/llama-api.services.ts

import { Message, MessageRole, AIAnalysisData } from '../types';

// --- CONFIGURATION ---
const API_BASE_URL = 'https://api.groq.com/openai/v1';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY; 
const MODEL_NAME = 'llama3-8b-8192';

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
 * Generates the structured legal analysis by calling the external Llama 3 API.
 */
export async function generateDocumentAnalysis(
  documentContent: string,
  docType: string
): Promise<AIAnalysisData> {
  if (!API_KEY) {
    throw new Error("Missing API Key. Please add VITE_GROQ_API_KEY to your .env.local file.");
  }

  const systemPrompt = getDocumentAnalysisPrompt(docType);
  const userPrompt = `Document for analysis:\n\n${documentContent}`;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        // THE DEFINITIVE FIX: Force the API to return a valid JSON object.
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Llama API:', errorData);
      throw new Error(`API returned an error: ${errorData.error?.message || response.statusText}`);
    }

    const responseData = await response.json();
    const messageContent = responseData.choices[0]?.message?.content;

    if (!messageContent) {
      throw new Error("API response did not contain a valid message.");
    }
    
    // The 'extractJsonFromString' helper is no longer needed because JSON mode guarantees a valid string.
    const parsedData = JSON.parse(messageContent);
    return parsedData as AIAnalysisData;

  } catch (error) {
    console.error('Error during Llama API call or JSON parsing:', error);
    if (error instanceof SyntaxError) {
      console.error("The AI returned a response that was not valid JSON.", error);
    }
    throw new Error(
      'Failed to get a valid analysis from the AI. The AI response may have been incomplete or improperly formatted.'
    );
  }
}

// The rest of the file remains the same.

/**
 * Streams the chat response for follow-up questions from the Llama 3 API.
 */
export async function* streamChatResponse(
  history: Message[]
): AsyncGenerator<string> {
  if (!API_KEY) {
      yield "Error: Missing API Key in the application configuration.";
      return;
  }
    const systemInstruction = `You are Flagr, an expert AI assistant specializing in document analysis. The user has already seen the initial analysis of their document. Your role now is to answer follow-up questions accurately and conversationally, based ONLY on the document context provided in the chat history. If the answernot in the document, state that clearly. Use formatting like bolding and bullet points to improve readability.`;

    const messages = [
        { role: 'system', content: systemInstruction },
        ...history.map(msg => ({
            role: msg.role === MessageRole.USER ? 'user' : 'assistant',
            content: msg.content
        }))
    ];

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7,
        stream: true,
        max_tokens: 2048,
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
          if (data.trim() === '[DONE]') return;
          try {
            const chunk = JSON.parse(data);
            const content = chunk.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            console.error('Error parsing stream chunk:', data);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from Llama API:', error);
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