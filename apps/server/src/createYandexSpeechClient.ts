import { Buffer } from 'node:buffer';

import { cloudApi, serviceClients, Session } from '@yandex-cloud/nodejs-sdk';
import type { IIAmCredentials } from '@yandex-cloud/nodejs-sdk/dist/types.js';

import type { SpeechClient } from './types.js';

/**
 * Creates a Yandex SpeechKit client.
 * @param token - IAM token information.
 */
export function createYandexSpeechClient(token: IIAmCredentials): SpeechClient {
  const session = new Session({
    serviceAccountJson: token,
  });
  const cloudService = session.client(serviceClients.SynthesizerClient);

  return {
    async synthesize(text: string): Promise<Buffer> {
      let buffer = Buffer.from('');

      const response = cloudService.utteranceSynthesis(
        cloudApi.ai.tts.UtteranceSynthesisRequest.fromPartial({
          text
        }),
      );

      for await (const chunk of response) {
        const audioChunk = chunk.audioChunk?.data;
        if (audioChunk) {
          buffer = Buffer.concat([buffer, audioChunk]);
        }
      }

      return buffer;
    },
  };
}