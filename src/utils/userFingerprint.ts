/**
 * User fingerprinting utility for anonymous user identification
 * This creates a unique identifier for each user without requiring authentication
 */

export interface UserFingerprint {
  id: string;
  createdAt: string;
  lastSeen: string;
}

class UserFingerprintService {
  private readonly STORAGE_KEY = '90s_fresh_user_fingerprint';
  private readonly FINGERPRINT_EXPIRY_DAYS = 365; // 1 year

  /**
   * Generate a browser fingerprint based on various browser characteristics
   */
  private generateFingerprint(): string {
    const components: string[] = [];

    // Screen resolution and color depth
    components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Language
    components.push(navigator.language);

    // Platform
    components.push(navigator.platform);

    // User agent (truncated for privacy)
    components.push(navigator.userAgent.slice(0, 50));

    // Available fonts (limited check)
    const testFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];
    const availableFonts = testFonts.filter(font => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return false;
      
      context.font = `12px ${font}`;
      const testWidth = context.measureText('test').width;
      context.font = '12px monospace';
      const monospaceWidth = context.measureText('test').width;
      return testWidth !== monospaceWidth;
    });
    components.push(availableFonts.join(','));

    // Canvas fingerprint (simplified)
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.textBaseline = 'top';
        context.font = '14px Arial';
        context.fillText('90s Fresh Fingerprint', 2, 2);
        components.push(canvas.toDataURL().slice(-20));
      }
    } catch (e) {
      components.push('canvas-error');
    }

    // WebGL fingerprint (simplified)
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        components.push(`${vendor}-${renderer}`.slice(0, 30));
      } else {
        components.push('no-webgl');
      }
    } catch (e) {
      components.push('webgl-error');
    }

    // Combine all components and create hash
    const fingerprintString = components.join('|');
    return this.simpleHash(fingerprintString);
  }

  /**
   * Simple hash function for fingerprint generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get or create user fingerprint
   */
  public getUserFingerprint(): UserFingerprint {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const fingerprint: UserFingerprint = JSON.parse(stored);
        
        // Check if fingerprint is still valid (not expired)
        const createdAt = new Date(fingerprint.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < this.FINGERPRINT_EXPIRY_DAYS) {
          // Update last seen
          fingerprint.lastSeen = now.toISOString();
          this.saveFingerprint(fingerprint);
          return fingerprint;
        }
      }
      
      // Create new fingerprint
      const newFingerprint: UserFingerprint = {
        id: this.generateFingerprint(),
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
      
      this.saveFingerprint(newFingerprint);
      return newFingerprint;
      
    } catch (error) {
      console.error('Error getting user fingerprint:', error);
      
      // Fallback: create a new fingerprint
      const fallbackFingerprint: UserFingerprint = {
        id: this.generateFingerprint(),
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
      
      this.saveFingerprint(fallbackFingerprint);
      return fallbackFingerprint;
    }
  }

  /**
   * Save fingerprint to localStorage
   */
  private saveFingerprint(fingerprint: UserFingerprint): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fingerprint));
    } catch (error) {
      console.error('Error saving fingerprint:', error);
    }
  }

  /**
   * Get user ID for API calls
   */
  public getUserId(): string {
    return this.getUserFingerprint().id;
  }

  /**
   * Check if user has voted on a specific meme
   */
  public hasVotedOnMeme(memeId: string): boolean {
    try {
      const votesKey = `90s_fresh_votes_${this.getUserId()}`;
      const votes = localStorage.getItem(votesKey);
      
      if (!votes) return false;
      
      const votedMemes: string[] = JSON.parse(votes);
      return votedMemes.includes(memeId);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }

  /**
   * Mark a meme as voted by the user
   */
  public markMemeAsVoted(memeId: string): void {
    try {
      const votesKey = `90s_fresh_votes_${this.getUserId()}`;
      const votes = localStorage.getItem(votesKey);
      
      let votedMemes: string[] = [];
      if (votes) {
        votedMemes = JSON.parse(votes);
      }
      
      if (!votedMemes.includes(memeId)) {
        votedMemes.push(memeId);
        localStorage.setItem(votesKey, JSON.stringify(votedMemes));
      }
    } catch (error) {
      console.error('Error marking meme as voted:', error);
    }
  }

  /**
   * Clear all vote records (for testing or user request)
   */
  public clearVoteHistory(): void {
    try {
      const votesKey = `90s_fresh_votes_${this.getUserId()}`;
      localStorage.removeItem(votesKey);
    } catch (error) {
      console.error('Error clearing vote history:', error);
    }
  }

  /**
   * Get all voted meme IDs for this user
   */
  public getVotedMemes(): string[] {
    try {
      const votesKey = `90s_fresh_votes_${this.getUserId()}`;
      const votes = localStorage.getItem(votesKey);
      
      if (!votes) return [];
      
      return JSON.parse(votes);
    } catch (error) {
      console.error('Error getting voted memes:', error);
      return [];
    }
  }
}

// Export singleton instance
export const userFingerprint = new UserFingerprintService();
export default userFingerprint;
