

export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
}

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
}

export interface ChatSession {
    id:string;
    title: string;
    messages: Message[];
    createdAt: string;
    analysis?: AnalysisResult | null;
}

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
}

export interface TextStats {
    words: number;
    characters: number;
    sentences: number;
    readingTime: number; // in minutes
}

// Types for Structured Document Analysis
export interface Flag {
    id: string;
    title: string;
    clause: string;
    explanation: string;
    severity: 'Low' | 'Medium' | 'High';
}

export interface Risk {
    area: string;
    assessment: string;
    score: number; // A score from 1 (low risk) to 10 (high risk)
}

export interface Insight {
    id: string;
    recommendation: string;
    justification: string;
}

// This represents the structured data we expect from the AI's JSON output.
export interface AIAnalysisData {
    plainLanguageSummary: string;
    flags: Flag[];
    riskAssessment: {
        overallSummary: string;
        risks: Risk[];
    };
    aiInsights: {
        overallSummary: string;
        recommendations: Insight[];
    };
}

// This is the full analysis object used in the app state, combining AI data with client-side processed info.
export interface AnalysisResult extends AIAnalysisData {
    docType: string;
    stats: TextStats;
}
