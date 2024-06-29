import { createHttpServer } from './createHttpServer.js';
import { createIo } from './createIo.js';
import { createYandexSpeechClient } from './createYandexSpeechClient.js';
import { createTwitchClient } from './createTwitchClient.js';

import speechToken from '../authorized_key.json';

import 'dotenv/config';

// Extract required env variables and check if they are valid.
const {
  TWITCH_TTS_REWARD_ID: ttsRewardId,
  TWITCH_CHANNEL: channel,
  PORT: portStr,
} = process.env;

const port = parseInt(portStr || '', 10);

if (!ttsRewardId) {
  throw new Error('"TWITCH_TTS_REWARD_ID" env variable is invalid');
}

if (!channel) {
  throw new Error('"TWITCH_CHANNEL" env variable is invalid');
}

if (!port) {
  throw new Error('"PORT" env variable is invalid');
}

// Create HTTP and WebSocket servers.
const server = createHttpServer();
const io = createIo(server);

// Create a Yandex speech client.
const yandexSpeechClient = createYandexSpeechClient({
  accessKeyId: speechToken.id,
  privateKey: speechToken.private_key,
  serviceAccountId: speechToken.service_account_id,
});

// Create a Twitch client.
const twitchClient = createTwitchClient({
  clientOptions: {
    channels: [channel],
  },
  ttsRewardId,
  async onTTS(text: string) {
    io.emit('tts', await yandexSpeechClient.synthesize(text));
  },
});

// Start HTTP sever and connect the Twitch client.
server.listen(port, () => {
  twitchClient.connect().catch(console.error);
});