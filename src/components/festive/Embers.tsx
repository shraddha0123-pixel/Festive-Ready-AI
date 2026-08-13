const embers = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 5.7 + 3) % 100}%`,
  delay: `${(i * 1.3) % 12}s`,
  duration: `${12 + ((i * 3) % 9)}s`,
  size: 2 + (i % 3),
}));

export function Embers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className="animate-ember absolute bottom-0 rounded-full bg-gold"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDelay: e.delay,
            animationDuration: e.duration,
            boxShadow: "0 0 10px 2px color-mix(in oklab, var(--gold) 60%, transparent)",
          }}
        />
      ))}
    </div>
  );
}
