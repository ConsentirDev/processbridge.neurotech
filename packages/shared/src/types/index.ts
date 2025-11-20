export interface ProcessingProfile {
  id: string;
  name: string;
  preferences: {
    audioProcessingDelay: 'low' | 'medium' | 'high';
    readingDifficulty: 'low' | 'medium' | 'high';
    preferredTransformations: TransformationType[];
    ttsSpeed: number; // 0.5 to 2.0
    ttsVoice?: string;
    textComplexity: 'simple' | 'moderate' | 'original';
  };
}

export type TransformationType =
  | 'simplify'
  | 'tts'
  | 'summarize'
  | 'chunk'
  | 'bionic'
  | 'transcript';

export interface Transformation {
  type: TransformationType;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface ContentAnalysis {
  contentType: 'article' | 'documentation' | 'email' | 'social' | 'video' | 'unknown';
  complexity: number; // 0-100
  wordCount: number;
  estimatedReadingTime: number; // minutes
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface TransformationResult {
  type: TransformationType;
  originalContent: string;
  transformedContent: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface UserSettings {
  profile: ProcessingProfile;
  apiKey?: string;
  apiProvider: 'openai' | 'anthropic';
  enabledTransformations: TransformationType[];
  autoDetectStruggle: boolean;
  privacyMode: boolean;
}
