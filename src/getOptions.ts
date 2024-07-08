/**
 * Returns external environment options.
 * @throws {Error} "apiKey" parameter is missing
 * @throws {Error} "ttsRewardId" parameter is missing
 * @throws {Error} "channels" parameter is empty or missing
 */
export function getOptions(): {
  apiKey: string;
  channels: string[];
  maxTextLength: number;
  playInterval: number;
  ttsRewardId: string;
  volume: number;
} {
  const searchParams = new URLSearchParams(window.location.search);

  const apiKey = searchParams.get('apiKey');
  if (!apiKey) {
    throw new Error('"apiKey" parameter is missing');
  }

  const ttsRewardId = searchParams.get('ttsRewardId');
  if (!ttsRewardId) {
    throw new Error('"ttsRewardId" parameter is missing');
  }

  const channels = searchParams.getAll('channels');
  if (!channels.length) {
    throw new Error('"channels" parameter is empty or missing');
  }

  return {
    apiKey,
    channels,
    maxTextLength: Number(searchParams.get('maxTextLength')) || 170,
    playInterval: Number(searchParams.get('playInterval')) || 1000,
    ttsRewardId,
    volume: Number(searchParams.get('volume')) || 100,
  };
}