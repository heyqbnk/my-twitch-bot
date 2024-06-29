export interface SpeechClient {
  /**
   * Synthesizes specified text.
   * @param text - text to synthesize.
   */
  synthesize(text: string): Promise<Buffer>;
}