// Shows the real photo when one exists. Otherwise a tinted, clearly labelled demo tile.
const TINTS = ['#EDE4D3', '#E4DACB', '#D9D2C5', '#EADCD2', '#DCDFD3', '#E6E0D8'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function ProductImage({
  src, name, variant = 0, className = '', ratio = 'aspect-[3/4]',
}: {
  src?: string | null;
  name: string;
  variant?: number;
  className?: string;
  ratio?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`${ratio} w-full object-cover ${className}`} loading="lazy" />;
  }
  const tint = TINTS[(hash(name) + variant) % TINTS.length];
  return (
    <div
      className={`${ratio} relative flex w-full items-center justify-center ${className}`}
      style={{ backgroundColor: tint }}
      role="img"
      aria-label={`${name} (demo image)`}
    >
      <span className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.2em] text-ink/40">Demo image</span>
      <span className="px-6 text-center font-display text-xl text-ink/45">{name}</span>
    </div>
  );
}
