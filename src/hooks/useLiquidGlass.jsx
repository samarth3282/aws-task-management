import { useEffect } from 'react';
import liquidGlass from '../lib/liquid-glass';

/**
 * React hook to apply Apple-style liquid glass refraction to a component.
 * @param {import('react').RefObject} ref - React ref of the target element.
 * @param {boolean} active - Whether the effect should be active.
 * @param {Object} [options] - Options to configure liquid glass strength, blur, etc.
 */
export function useLiquidGlass(ref, active = true, options = {}) {
  useEffect(() => {
    if (active && ref.current) {
      const effect = liquidGlass(ref.current, options);
      return () => {
        if (effect) effect.destroy();
      };
    }
  }, [ref, active, options.scale, options.chroma, options.border, options.mapBlur, options.blur, options.saturate, options.radius, options.fallbackBlur]);
}
