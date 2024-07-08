import { ElevenLabsClient } from 'elevenlabs';
import { Client } from 'tmi.js';

import { AudioQueue } from './AudioQueue';
import { getOptions } from './getOptions';

const {
  apiKey,
  maxTextLength,
  channels,
  volume,
  playInterval,
  ttsRewardId,
} = getOptions();

// Queue containing all audio requests.
const audioQueue = new AudioQueue({ volume, playInterval });

// We use ElevenLabs for text synthesis.
const elevenLabsClient = new ElevenLabsClient({ apiKey });

// Twitch client looking for chat events.
const twitchClient = new Client({ channels });

// Whenever a user redeems a reward, we check if it was TTS. In case it was, we are synthesizing
// the text.
twitchClient.on('redeem', async (
  _channel,
  username,
  rewardType,
  _tags,
  message?: string,
) => {
  if (rewardType !== ttsRewardId || !message) {
    return;
  }

  // Format the message.
  message = message
    // Remove trailing spaces.
    .trim()
    // Replace all forbidden symbols with spaces.
    .replace(/[^\p{L}\s._0-9-]+/gu, ' ')
    // Replace all 2+ spaces with the only one.
    .replace(/\s{2,}/g, ' ');

  // The message should not be empty or exceed the maximum length.
  if (!message || message.length > maxTextLength) {
    return;
  }

  // Request audio chunks.
  const response = await elevenLabsClient.generate({
    // TODO: We can make this voice dynamic.
    voice: 'Rachel',
    text: `${username} написал: ${message}`,
    model_id: 'eleven_multilingual_v2',
  });

  // Collect all audio chunks and send them to queue.
  const buffers: ArrayBuffer[] = [];
  for await (const data of response) {
    buffers.push(data);
  }

  audioQueue.push(buffers).catch(console.error);
});

// Connect the Twitch client and start receiving events.
twitchClient.connect().catch(console.error);
