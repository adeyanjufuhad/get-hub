export function HeroGrainientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="bg-draft-grid absolute inset-0 opacity-60 dark:opacity-35"
        style={{
          maskImage:
            "radial-gradient(75% 70% at 50% 15%, black 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(75% 70% at 50% 15%, black 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, rgba(234,88,12,0.11) 0%, rgba(250,249,245,0) 72%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, rgba(251,146,60,0.14) 0%, rgba(15,16,18,0) 72%)",
        }}
      />
    </div>
  );
}
