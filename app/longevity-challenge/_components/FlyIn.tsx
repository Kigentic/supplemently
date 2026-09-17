// Scroll-getriggertes Einflieg-Element, nur für /longevity-challenge.
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function FlyIn({
  children,
  delayMs = 0,
  from = 'bottom',
  className = '',
}: {
  children: ReactNode;
  delayMs?: number;
  from?: 'left' | 'right' | 'bottom';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    from === 'left' ? '-translate-x-10' : from === 'right' ? 'translate-x-10' : 'translate-y-10';

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-x-0 translate-y-0 opacity-100' : `${hiddenTransform} opacity-0`} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
