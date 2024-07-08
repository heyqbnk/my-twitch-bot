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
  const formattedMessage = message
    // Remove trailing spaces.
    .trim()
    // Replace all forbidden symbols with spaces.
    .replace(/[^\p{L}\s.,_0-9-!?]+/gu, ' ')
    // Replace all 2+ spaces with the only one.
    .replace(/\s{2,}/g, ' ');

  console.log('Message before:', message, '\n\nMessage after:', formattedMessage);

  // The message should not be empty or exceed the maximum length.
  if (!formattedMessage || formattedMessage.length > maxTextLength) {
    return;
  }

  // Request audio chunks.
  const text = `${username} написал: ${formattedMessage}`;
  console.log('Going to synthesize text:', text);

  const response = await elevenLabsClient.generate({
    // TODO: We can make this voice dynamic.
    voice: 'Rachel',
    text,
    model_id: 'eleven_multilingual_v2',
  }) as unknown as ReadableStream;

  console.log('Text was synthesized:', text);

  // Collect all audio chunks and send them to queue.
  audioQueue.push(await new Response(response).arrayBuffer()).catch(console.error);
});

// Connect the Twitch client and start receiving events.
twitchClient.connect().catch(console.error);
