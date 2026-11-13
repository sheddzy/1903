'use client';
import { useState } from 'react';
import ProductImage from '@/components/ProductImage';

// Hover to zoom. Falls back to labelled demo tiles when no photographs are uploaded.
export default function ProductGallery({ name, urls }: { name: string; urls: string[] }) {
  const slots: (string | null)[] = urls.length ? urls : [null, null, null];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {slots.map((u, i) => (
          <button key={i} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}
            className={`w-16 border ${i === active ? 'border-ink' : 'border-transparent'}`}>
            <ProductImage src={u} name={name} variant={i} />
          </button>
        ))}
      </div>
      <div
        className="relative flex-1 cursor-zoom-in overflow-hidden"
        onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      >
        <div style={{ transform: zoom.on ? 'scale(1.8)' : 'scale(1)', transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: zoom.on ? 'none' : 'transform 0.2s' }}>
          <ProductImage src={slots[active]} name={name} variant={active} />
        </div>
      </div>
    </div>
  );
}
