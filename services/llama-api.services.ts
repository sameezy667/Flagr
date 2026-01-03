// src/services/llama-api.services.ts
// Note: Despite the filename, this service now uses Google Gemini API

import { Message, MessageRole, AIAnalysisData } from '../types';
import JSON5 from 'json5';
import { GoogleGenAI } from '@google/genai';

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const MODEL_NAME = 'gemini-flash-lite-latest';

// Initialize GoogleGenAI instance
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Creates the detailed system prompt for document analysis.
 * The prompt now only needs to describe the *content* of the JSON.
 */
function getDocumentAnalysisPrompt(docType: string): string {
  return `You are an expert AI legal assistant. Analyze the ${docType} and return ONLY a valid JSON object.

CRITICAL REQUIREMENTS:
- Return ONLY raw JSON - no markdown, no code blocks, no explanations
- The JSON must be valid and parseable
- Do not wrap in \`\`\`json\`\`\` blocks
- Start response with { and end with }

Required JSON structure:
{
  "plainLanguageSummary": "string",
  "flags": [{"id": "string", "title": "string", "clause": "string", "explanation": "string", "severity": "Low|Medium|High", "suggestedRewrite": "string"}],
  "riskAssessment": {"overallSummary": "string", "risks": [{"area": "string", "assessment": "string", "score": number}]},
  "aiInsights": {"overallSummary": "string", "recommendations": [{"id": "string", "recommendation": "string", "justification": "string"}]},
  "detectedDocType": "string"
}

Analysis Guidelines:
1. plainLanguageSummary: Brief, clear summary in simple language
2. flags: Find concerning clauses (POWER EXPANSION, VAGUE LANGUAGE, RIGHTS RESTRICTIONS, SURVEILLANCE, EMERGENCY POWERS, FINANCIAL IMPACT)
3. riskAssessment: Overall compliance analysis with risk scores 1-10
4. aiInsights: Actionable recommendations for improvement
5. detectedDocType: Type of document (e.g., "Privacy Policy", "Terms of Service")

Return the JSON object immediately, no other text:`;
}

/**
 * Generates the structured legal analysis by calling the Google Gemini API.
 */
export async function generateDocumentAnalysis(
  documentContent: string,
  docType: string
): Promise<AIAnalysisData> {
  if (!ai) {
    throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const systemPrompt = getDocumentAnalysisPrompt(docType);
  const userPrompt = `Document for analysis:\n\n${documentContent}`;

  const config = {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'application/json',
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: systemPrompt + "\n\n" + userPrompt,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      config,
      contents,
    });

    let messageContent = '';
    for await (const chunk of response) {
      messageContent += chunk.text || '';
    }

    if (!messageContent) {
      throw new Error("API response did not contain a valid message.");
    }
    
    console.log('Raw AI response:', messageContent);
    
    // Production-ready JSON parsing with comprehensive fallback
    let parsedData;
    let jsonString = messageContent.trim();
    
    try {
      // Method 1: Direct JSON parsing
      parsedData = JSON.parse(jsonString);
    } catch (e1) {
      console.log('Method 1 failed, trying method 2...');
      try {
        // Method 2: Remove markdown code blocks
        const codeBlockMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1].trim();
          parsedData = JSON.parse(jsonString);
        } else {
          throw new Error('No code block found');
        }
      } catch (e2) {
        console.log('Method 2 failed, trying method 3...');
        try {
          // Method 3: Extract JSON object from text
          const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
            parsedData = JSON.parse(jsonString);
          } else {
            throw new Error('No JSON object found');
          }
        } catch (e3) {
          console.log('Method 3 failed, trying method 4...');
          try {
            // Method 4: JSON5 parsing (more lenient)
            parsedData = JSON5.parse(jsonString);
          } catch (e4) {
            console.log('Method 4 failed, trying method 5...');
            try {
              // Method 5: Extract JSON from mixed content
              const lines = jsonString.split('\n');
              let jsonLines = [];
              let inJson = false;
              
              for (const line of lines) {
                if (line.trim().startsWith('{')) inJson = true;
                if (inJson) jsonLines.push(line);
                if (line.trim().endsWith('}')) break;
              }
              
              if (jsonLines.length > 0) {
                parsedData = JSON.parse(jsonLines.join('\n'));
              } else {
                throw new Error('Could not extract JSON');
              }
            } catch (e5) {
              console.error('All parsing methods failed. Creating fallback response.');
              // Method 6: Fallback response
              parsedData = {
                plainLanguageSummary: "Document analysis completed, but response format was invalid. Please try again.",
                flags: [
                  {
                    id: "parsing-error",
                    title: "Analysis Parsing Error",
                    clause: "Unable to parse AI response",
                    explanation: "The AI response could not be properly parsed. This may be due to formatting issues.",
                    severity: "Medium",
                    suggestedRewrite: "Please try uploading the document again."
                  }
                ],
                riskAssessment: {
                  overallSummary: "Unable to complete full risk assessment due to parsing error.",
                  risks: [
                    {
                      area: "Technical",
                      assessment: "Response parsing failed",
                      score: 5
                    }
                  ]
                },
                aiInsights: {
                  overallSummary: "Analysis incomplete due to technical issues.",
                  recommendations: [
                    {
                      id: "retry",
                      recommendation: "Try uploading the document again",
                      justification: "Technical parsing error occurred"
                    }
                  ]
                },
                detectedDocType: "Unknown"
              };
            }
          }
        }
      }
    }
    
    // Validate the parsed data structure
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Parsed data is not a valid object');
    }
    
    // Ensure required fields exist
    if (!parsedData.plainLanguageSummary) parsedData.plainLanguageSummary = "Document analysis completed.";
    if (!parsedData.flags) parsedData.flags = [];
    if (!parsedData.riskAssessment) parsedData.riskAssessment = { overallSummary: "Risk assessment unavailable.", risks: [] };
    if (!parsedData.aiInsights) parsedData.aiInsights = { overallSummary: "AI insights unavailable.", recommendations: [] };
    
    return parsedData as AIAnalysisData;

  } catch (error) {
    console.error('Error during Gemini API call or JSON parsing:', error);
    
    // If it's a quota or API error, re-throw with the original message
    if (error instanceof Error && (error.message.includes('quota') || error.message.includes('API Error'))) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      console.error("The AI returned a response that was not valid JSON.", error);
    }
    
    throw new Error(
      `Failed to get a valid analysis from the AI: ${error instanceof Error ? error.message : 'Unknown error'}`
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
  if (!ai) {
    throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const systemPrompt = getTemplateGenerationPrompt(contractType);
  const userPrompt = `Generate a ${contractType} template.`;

  const config = {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'application/json',
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: systemPrompt + "\n\n" + userPrompt,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      config,
      contents,
    });

    let messageContent = '';
    for await (const chunk of response) {
      messageContent += chunk.text || '';
    }

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
  if (!ai) {
      yield "Error: Missing API Key in the application configuration.";
      return;
  }
  
  const systemInstruction = `You are Flagr, an expert AI assistant specializing in document analysis. The user has already seen the initial analysis of their document. Your role now is to answer follow-up questions accurately and conversationally, based ONLY on the document context provided in the chat history. If the answer is not in the document, state that clearly. Use formatting like bolding and bullet points to improve readability.`;

  // Convert message history to Gemini format
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }]
    },
    ...history.map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  ];

  const config = {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'text/plain',
  };

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
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