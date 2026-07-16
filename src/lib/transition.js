import { flushSync } from 'react-dom';

export function withViewTransition(updateFn) {
  if (!document.startViewTransition) {
    updateFn();
    return;
  }
  document.startViewTransition(() => {
    flushSync(() => {
      updateFn();
    });
  });
}
