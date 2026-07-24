import { useState, useCallback, useRef, useEffect } from 'react';
import { toCanvas } from 'html-to-image';

const DUR = 500;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eioC = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eIn2 = (t) => t * t;
const eOut2 = (t) => 1 - (1 - t) * (1 - t);

let globalCanvas = null;
let globalCtx = null;

function ensureGlobalCanvas() {
  if (!globalCanvas) {
    globalCanvas = document.createElement('canvas');
    globalCanvas.style.position = 'fixed';
    globalCanvas.style.top = '0';
    globalCanvas.style.left = '0';
    globalCanvas.style.width = '100vw';
    globalCanvas.style.height = '100vh';
    globalCanvas.style.pointerEvents = 'none';
    globalCanvas.style.zIndex = '9999';
    document.body.appendChild(globalCanvas);

    const dpr = window.devicePixelRatio || 1;
    globalCanvas.width = window.innerWidth * dpr;
    globalCanvas.height = window.innerHeight * dpr;
    
    globalCtx = globalCanvas.getContext('2d');
    globalCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function clearGlobalCanvas() {
  if (globalCtx && globalCanvas) {
    globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
  }
}

function renderGenie(ctx, off, cw, ch, rawT, dir, dock, win) {
  ctx.clearRect(0, 0, cw, ch);
  const WIN_W = win.w;
  const WIN_H = win.h;
  
  for (let y = 0; y < WIN_H; y++) {
    const r = y / WIN_H;
    const rowXStart = dir === 'minimize' ? (1 - r) * 0.65 : r * 0.65;
    const xP = clamp((rawT - rowXStart) / (1 - rowXStart), 0, 1);
    const xE = eioC(xP);
    
    const rowYStart = dir === 'minimize' ? (1 - r) * 0.2 : r * 0.2;
    const yP = clamp((rawT - rowYStart) / (1 - rowYStart), 0, 1);
    const yE = eIn2(yP);
    
    let left, right, destY;
    if (dir === 'minimize') {
      left = lerp(win.x, dock.x, xE);
      right = lerp(win.x + WIN_W, dock.x, xE);
      destY = lerp(win.y + y, dock.y, yE);
    } else {
      left = lerp(dock.x, win.x, xE);
      right = lerp(dock.x, win.x + WIN_W, xE);
      destY = lerp(dock.y, win.y + y, yE);
    }
    
    const rowW = right - left;
    if (rowW < 0.8) continue;
    ctx.drawImage(off, 0, y, WIN_W, 1, left, destY, rowW, 1);
  }

  const glowRaw = dir === 'minimize' ? rawT : 1 - rawT;
  if (glowRaw > 0.75) {
    const a = eOut2((glowRaw - 0.75) / 0.25) * 0.3;
    const hex = Math.round(a * 255).toString(16).padStart(2, '0');
    const g = ctx.createRadialGradient(dock.x, dock.y, 0, dock.x, dock.y, 55);
    g.addColorStop(0, '#ffffff' + hex);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
  }
}

export function useMacWindow(id = 'default', options = {}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const domRef = useRef(null);
  const offCanvasRef = useRef(null);
  const rectRef = useRef(null);

  const targetSelector = options.targetSelector || '.nav__logo-mark';

  const handleMinimize = useCallback(async () => {
    if (isMinimized || !domRef.current) return;
    
    ensureGlobalCanvas();
    const el = domRef.current;
    const rect = el.getBoundingClientRect();
    rectRef.current = rect;

    const logo = document.querySelector(targetSelector);
    const dockRect = logo ? logo.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 50, width: 40, height: 40 };
    const dockCenter = { x: dockRect.left + dockRect.width / 2, y: dockRect.top + dockRect.height / 2 };
    
    const winProps = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };

    try {
      offCanvasRef.current = await toCanvas(el, { pixelRatio: window.devicePixelRatio || 1, cacheBust: false });
    } catch (e) {
      console.error("Failed to snapshot window", e);
      return;
    }

    el.style.opacity = '0';
    el.style.pointerEvents = 'none';

    window.__minimizedWindow = id;

    let start = null;
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    function frame(ts) {
      if (!start) start = ts;
      const rawT = clamp((ts - start) / DUR, 0, 1);
      renderGenie(globalCtx, offCanvasRef.current, cw, ch, rawT, 'minimize', dockCenter, winProps);
      
      if (rawT < 1) {
        requestAnimationFrame(frame);
      } else {
        clearGlobalCanvas();
        setIsMinimized(true);
      }
    }
    requestAnimationFrame(frame);
  }, [id, isMinimized, targetSelector]);

  const handleRestore = useCallback(() => {
    if (!isMinimized || !offCanvasRef.current || !rectRef.current) return;
    
    ensureGlobalCanvas();
    const logo = document.querySelector(targetSelector);
    const dockRect = logo ? logo.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 50, width: 40, height: 40 };

    const dockCenter = { x: dockRect.left + dockRect.width / 2, y: dockRect.top + dockRect.height / 2 };
    
    const rect = rectRef.current;
    const winProps = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };

    let start = null;
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    function frame(ts) {
      if (!start) start = ts;
      const rawT = clamp((ts - start) / DUR, 0, 1);
      renderGenie(globalCtx, offCanvasRef.current, cw, ch, rawT, 'restore', dockCenter, winProps);
      
      if (rawT < 1) {
        requestAnimationFrame(frame);
      } else {
        clearGlobalCanvas();
        setIsMinimized(false);
        if (domRef.current) {
          const oldTransition = domRef.current.style.transition;
          domRef.current.style.transition = 'none';
          domRef.current.style.opacity = '1';
          void domRef.current.offsetHeight; // force reflow
          domRef.current.style.transition = oldTransition;
          domRef.current.style.pointerEvents = 'auto';
        }
        if (window.__minimizedWindow === id) {
          window.__minimizedWindow = null;
        }
      }
    }
    requestAnimationFrame(frame);
  }, [id, isMinimized]);

  const handleMaximize = useCallback(() => {
    if (isMinimized) return;
    setIsMaximized(m => !m);
  }, [isMinimized]);

  useEffect(() => {
    const onRestoreEvent = (e) => {
      if (e.detail?.id === id || (!e.detail?.id && window.__minimizedWindow === id)) {
        handleRestore();
      }
    };
    window.addEventListener('restore-mac-window', onRestoreEvent);
    return () => window.removeEventListener('restore-mac-window', onRestoreEvent);
  }, [id, handleRestore]);

  return { domRef, isMinimized, isMaximized, handleMinimize, handleRestore, handleMaximize };
}
