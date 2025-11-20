import { TransformationType } from '../types';

export interface AIServiceConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic';
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async simplifyText(text: string, targetComplexity: 'simple' | 'moderate' = 'simple'): Promise<string> {
    const prompt = targetComplexity === 'simple'
      ? `Rewrite the following text using simple, clear language. Use shorter sentences, common words, and break complex ideas into smaller parts. Maintain all key information but make it easier to read:\n\n${text}`
      : `Rewrite the following text with moderate simplification. Clarify complex sentences and use more common words where possible, but maintain some technical accuracy:\n\n${text}`;

    return this.callAI(prompt);
  }

  async summarizeText(text: string, maxLength: 'brief' | 'detailed' = 'brief'): Promise<string> {
    const lengthGuide = maxLength === 'brief' ? '3-5 bullet points' : '2-3 short paragraphs with key points as bullets';
    const prompt = `Summarize the following text in ${lengthGuide}. Focus on the main ideas and actionable information:\n\n${text}`;

    return this.callAI(prompt);
  }

  async extractKeyPoints(text: string): Promise<string[]> {
    const prompt = `Extract the key points from the following text as a simple list. Each point should be one clear sentence:\n\n${text}`;
    const result = await this.callAI(prompt);
    return result.split('\n').filter(line => line.trim().length > 0);
  }

  private async callAI(prompt: string): Promise<string> {
    if (this.config.provider === 'openai') {
      return this.callOpenAI(prompt);
    } else {
      return this.callAnthropic(prompt);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that makes content more accessible for neurodivergent readers. Be clear, concise, and preserve important information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }
}
