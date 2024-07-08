/**
 * Awaits for specified amount of time.
 * @param timeout - time in ms.
 */
function wait(timeout: number): Promise<void> {
  return new Promise(res => setTimeout(res, timeout));
}

export class AudioQueue {
  private readonly queue: ArrayBuffer[][] = [];
  private readonly playInterval: number;
  private readonly volume: number;
  private isRunning = false;

  constructor(options: {
    /**
     * Timeout between text-to-speech audio.
     */
    playInterval: number;
    /**
     * Play volume. Must be a value in bounds [0, 100].
     */
    volume: number;
  }) {
    this.playInterval = options.playInterval;
    // Volume value must be in bounds [0, 1].
    this.volume = Math.max(Math.min(options.volume, 100), 0) / 100;
  }

  /**
   * Adds new audio chunks to play.
   * @param buffers - audio chunks.
   */
  async push(buffers: ArrayBuffer[]): Promise<void> {
    this.queue.push(buffers);
    await this.run();
  }

  /**
   * Runs the audio queue play.
   * @private
   */
  private async run(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    // We are iterating over all queue audio chunks and play them. The variable "i" is created
    // outside the cycle, as we want to know how many queue items were proceeded.
    let i;
    for (i = 0; i < this.queue.length; i++) {
      const audio = new Audio();
      audio.volume = this.volume;
      audio.src = URL.createObjectURL(new Blob(this.queue[i], { type: 'audio/wav' }));

      try {
        // Play the audio. The promise will be resolved whenever audio started playing.
        await audio.play();

        // Await for the audio to end.
        await new Promise<void>(res => {
          audio.addEventListener('ended', () => res(), { once: true });
        });

        // Wait a bit before the next queue item.
        await wait(this.playInterval);
      } catch (e) {
        // In case, something went wrong, we are just breaking the cycle and then removing
        // items we already processed.
        console.error(e);
        break
      }
    }

    // Remove processed items.
    this.queue.splice(0, i);
    this.isRunning = false;
  }
}