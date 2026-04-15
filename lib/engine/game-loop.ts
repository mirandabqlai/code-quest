// lib/engine/game-loop.ts
//
// The game loop runs ~60 times per second and calls update().
// Delta time is clamped to prevent physics jumps when the tab is backgrounded.

export interface GameLoopCallbacks {
  update: (dt: number) => void;  // dt = seconds since last frame
}

export class GameLoop {
  private animationId: number | null = null;
  private lastTime = 0;
  private callbacks: GameLoopCallbacks;

  constructor(callbacks: GameLoopCallbacks) {
    this.callbacks = callbacks;
  }

  start(): void {
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (now: number): void => {
    const rawDt = (now - this.lastTime) / 1000;
    // Clamp to 100ms max — prevents huge jumps if tab was hidden
    const dt = Math.min(rawDt, 0.1);
    this.lastTime = now;

    this.callbacks.update(dt);
    this.animationId = requestAnimationFrame(this.tick);
  };
}
