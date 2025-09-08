/**
 * Share utility functions for memes
 */

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

class ShareService {
  /**
   * Get the current meme URL
   */
  private getMemeUrl(memeId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/memes/${memeId}`;
  }

  /**
   * Copy meme URL to clipboard
   */
  async copyToClipboard(memeId: string): Promise<boolean> {
    try {
      const url = this.getMemeUrl(memeId);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      return this.fallbackCopyToClipboard(memeId);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyToClipboard(memeId: string): boolean {
    try {
      const url = this.getMemeUrl(memeId);
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }

  /**
   * Share using Web Share API (mobile devices)
   */
  async shareNative(memeId: string, options: ShareOptions = {}): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      const url = this.getMemeUrl(memeId);
      await navigator.share({
        title: options.title || 'Check out this 90s meme!',
        text: options.text || 'Look at this radical 90s meme!',
        url: url
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    }
  }

  /**
   * Share to Twitter
   */
  shareToTwitter(memeId: string, text?: string): void {
    const url = this.getMemeUrl(memeId);
    const tweetText = text || 'Check out this radical 90s meme!';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  /**
   * Share to Facebook
   */
  shareToFacebook(memeId: string): void {
    const url = this.getMemeUrl(memeId);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  }

  /**
   * Share to Reddit
   */
  shareToReddit(memeId: string, title?: string): void {
    const url = this.getMemeUrl(memeId);
    const redditTitle = title || 'Check out this 90s meme!';
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(redditTitle)}`;
    window.open(redditUrl, '_blank', 'width=550,height=420');
  }

  /**
   * Share via email
   */
  shareViaEmail(memeId: string, subject?: string, body?: string): void {
    const url = this.getMemeUrl(memeId);
    const emailSubject = subject || 'Check out this 90s meme!';
    const emailBody = body || `Look at this radical 90s meme!\n\n${url}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = emailUrl;
  }

  /**
   * Get share options based on device capabilities
   */
  getAvailableShareOptions(): {
    native: boolean;
    clipboard: boolean;
    social: boolean;
  } {
    return {
      native: !!navigator.share,
      clipboard: !!navigator.clipboard,
      social: true
    };
  }

  /**
   * Main share function that tries different methods
   */
  async share(memeId: string, options: ShareOptions = {}): Promise<{
    success: boolean;
    method: string;
    error?: string;
  }> {
    const shareOptions = this.getAvailableShareOptions();

    // Try native share first (mobile)
    if (shareOptions.native) {
      const nativeSuccess = await this.shareNative(memeId, options);
      if (nativeSuccess) {
        return { success: true, method: 'native' };
      }
    }

    // Fallback to clipboard
    if (shareOptions.clipboard) {
      const clipboardSuccess = await this.copyToClipboard(memeId);
      if (clipboardSuccess) {
        return { success: true, method: 'clipboard' };
      }
    }

    return {
      success: false,
      method: 'none',
      error: 'No sharing method available'
    };
  }
}

// Export singleton instance
export const shareService = new ShareService();
export default shareService;
