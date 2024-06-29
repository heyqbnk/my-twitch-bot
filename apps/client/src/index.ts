import io from 'socket.io-client';

const socket = io(':3001');

const queue: Buffer[] = [];
let isRunning = false;

function wait(timeout: number): Promise<void> {
  return new Promise(res => setTimeout(res, timeout));
}

async function runQueue() {
  if (isRunning) {
    return;
  }
  isRunning = true;

  for (const buffer of queue) {
    const audio = new Audio();
    audio.volume = .4;
    audio.src = URL.createObjectURL(
      new Blob([buffer], { type: 'audio/wav' }),
    );

    await audio.play();
    await new Promise<void>(res => {
      audio.addEventListener('ended', () => res(), { once: true });
    });
    await wait(1000);
  }

  queue.splice(0, queue.length);
  isRunning = false;
}

socket.on('tts', (buffer: Buffer) => {
  queue.push(buffer);
  void runQueue();
});
