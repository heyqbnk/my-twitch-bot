import { ChatUserstate } from 'tmi.js';

// Tmi.js has a bit outdated types. That's why we are extending some of them.

declare module 'tmi.js' {
  interface Events {
    redeem(
      channel: string,
      username: string,
      rewardType: 'highlighted-message' | 'skip-subs-mode-message' | string,
      tags: ChatUserstate,
      message?: string,
    ): void;
  }
}
