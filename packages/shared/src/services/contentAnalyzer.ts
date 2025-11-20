import { ContentAnalysis } from '../types';

export class ContentAnalyzer {
  analyzeContent(element: HTMLElement | Document = document): ContentAnalysis {
    const textContent = this.extractTextContent(element);
    const wordCount = this.countWords(textContent);
    const readingTime = this.estimateReadingTime(wordCount);
    const complexity = this.assessComplexity(textContent);
    const contentType = this.detectContentType(element);
    const hasAudio = this.detectAudio(element);
    const hasVideo = this.detectVideo(element);

    return {
      contentType,
      complexity,
      wordCount,
      estimatedReadingTime: readingTime,
      hasAudio,
      hasVideo,
    };
  }

  private extractTextContent(element: HTMLElement | Document): string {
    // Get main content, excluding nav, footer, ads, etc.
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post',
      '#content',
    ];

    let mainContent: HTMLElement | null = null;

    if (element instanceof Document) {
      for (const selector of contentSelectors) {
        mainContent = element.querySelector(selector);
        if (mainContent) break;
      }
    }

    const targetElement = mainContent || (element instanceof Document ? element.body : element);
    return targetElement?.innerText || '';
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private estimateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private assessComplexity(text: string): number {
    // Simple complexity score based on:
    // - Average sentence length
    // - Average word length
    // - Presence of complex punctuation

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Normalize scores to 0-100 scale
    const sentenceScore = Math.min((avgSentenceLength / 30) * 50, 50);
    const wordScore = Math.min((avgWordLength / 8) * 50, 50);

    return Math.round(sentenceScore + wordScore);
  }

  private detectContentType(element: HTMLElement | Document): ContentAnalysis['contentType'] {
    const doc = element instanceof Document ? element : element.ownerDocument;
    if (!doc) return 'unknown';

    const url = doc.location?.href || '';
    const title = doc.title || '';

    // Check for video platforms
    if (url.includes('youtube.com') || url.includes('vimeo.com')) {
      return 'video';
    }

    // Check for email
    if (url.includes('mail.google.com') || url.includes('outlook')) {
      return 'email';
    }

    // Check for social media
    if (url.match(/(twitter|facebook|instagram|linkedin|reddit)\.com/)) {
      return 'social';
    }

    // Check for documentation
    if (url.match(/(docs\.|documentation|api\.|\/wiki|\/guide|\/reference)/)) {
      return 'documentation';
    }

    // Check for article indicators
    const hasArticleTag = doc.querySelector('article') !== null;
    const hasDateMeta = doc.querySelector('meta[property="article:published_time"]') !== null;

    if (hasArticleTag || hasDateMeta) {
      return 'article';
    }

    return 'unknown';
  }

  private detectAudio(element: HTMLElement | Document): boolean {
    const doc = element instanceof Document ? element : element.ownerDocument;
    if (!doc) return false;

    return doc.querySelector('audio') !== null;
  }

  private detectVideo(element: HTMLElement | Document): boolean {
    const doc = element instanceof Document ? element : element.ownerDocument;
    if (!doc) return false;

    return doc.querySelector('video') !== null ||
           doc.querySelector('iframe[src*="youtube"]') !== null ||
           doc.querySelector('iframe[src*="vimeo"]') !== null;
  }
}
