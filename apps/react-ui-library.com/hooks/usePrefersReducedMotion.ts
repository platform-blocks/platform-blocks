import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReduced(mq.matches);
      update();
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } catch {
      // ignore
    }
  }, []);
  return reduced;
}
