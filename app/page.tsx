export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 p-4">
      <h1
        className="text-2xl text-[var(--neon-gold)] tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-pixel)' }}
      >
        CODE QUEST
      </h1>
      <p
        className="text-sm text-[var(--neon-blue)] tracking-[6px] uppercase"
        style={{ fontFamily: 'var(--font-pixel)' }}
      >
        Turn any codebase into a game
      </p>
      <p className="text-[var(--text-dim)] text-center max-w-md">
        Paste a GitHub repo URL. Get a retro pixel-art arcade game
        that teaches how the code works.
      </p>
    </main>
  );
}
