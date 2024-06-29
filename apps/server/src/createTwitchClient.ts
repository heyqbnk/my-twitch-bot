import { Client, Options as ClientOptions } from 'tmi.js';

interface Options {
  /**
   * Options passed to the original tmi.js client.
   */
  clientOptions: ClientOptions;
  /**
   * Callback, which be called if some text synthesizing was requested.
   * @param text - text to synthesize.
   */
  onTTS(text: string): void;
  /**
   * Text-to-speech reward identifier.
   */
  ttsRewardId: string;
}

export function createTwitchClient({
  ttsRewardId,
  clientOptions,
  onTTS,
}: Options): Client {
  const client = new Client(clientOptions);

  // Whenever a user redeems a reward, we check if it was TTS. In case it was, we are synthesizing
  // the text.
  client.on('redeem', async (
    _channel,
    _username,
    rewardType,
    _tags,
    message?: string,
  ) => {
    if (rewardType === ttsRewardId && message) {
      onTTS(message);
    }
  });

  return client;
}