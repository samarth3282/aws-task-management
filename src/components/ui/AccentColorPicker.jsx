import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { accentColors, useAccentColor } from "../../contexts/AccentColorContext.jsx";
import { useLiquidGlass } from "../../hooks/useLiquidGlass.jsx";
import gsap from "gsap";

const AccentColorPicker = () => {
  const { accentColor, setAccentColorAnimated } = useAccentColor();
  const [isOpen, setIsOpen] = useState(false);

  // Simplified device detect for sizes
  const isMobileTouch = typeof window !== 'undefined' && window.innerWidth < 768;

  const containerRef = useRef(null);
  const drawerRef = useRef(null);
  const colorsRef = useRef([]);
  const timelineRef = useRef(null);
  const colorInputRef = useRef(null);
  const customColorButtonRef = useRef(null);

  useLiquidGlass(drawerRef, true, { scale: -90, border: 0.1, blur: 12, radius: 999 });

  /* Outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHoverEnter = (event) => {
    const button = event.currentTarget;
    gsap.killTweensOf(button);
    gsap.to(button, {
      scale: 1.35,
      y: -2,
      duration: 0.45,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const handleHoverLeave = (event) => {
    const button = event.currentTarget;
    gsap.killTweensOf(button);
    gsap.to(button, {
      scale: 1,
      y: 0,
      duration: 0.35,
      ease: "elastic.out(1, 0.6)",
    });
  };

  /* Animation Setup */
  useLayoutEffect(() => {
    const drawer = drawerRef.current;
    const buttons = colorsRef.current;
    if (!drawer) return;

    const initialHeight = isMobileTouch ? 40 : 48;
    gsap.set(drawer, { height: initialHeight });
    gsap.set(buttons, {
      y: -12,
      opacity: 0,
      scale: 0.75,
      pointerEvents: "none",
    });

    const tl = gsap.timeline({ paused: true });
    tl.to(drawer, {
      height: () => drawer.scrollHeight,
      duration: 0.6,
      ease: "elastic.out(1, 0.75)",
    });
    tl.to(
      buttons,
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.05,
        duration: 0.45,
        ease: "elastic.out(1, 0.6)",
        pointerEvents: "auto",
      },
      0.05
    );

    timelineRef.current = tl;
  }, [isMobileTouch]);

  useLayoutEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (isOpen) {
      tl.play();
    } else {
      tl.reverse();
    }
  }, [isOpen]);

  const handleColorChange = async (colorKey, event) => {
    const button = event.currentTarget;
    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    gsap.to(button, {
      scale: 0.65,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    });

    setIsOpen(false);
    await new Promise(resolve => setTimeout(resolve, 350));
    await setAccentColorAnimated(colorKey, x, y);
  };

  const handleCustomColorClick = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColorInput = (event) => {
    const customHex = event.target.value;
    setAccentColorAnimated('custom', 0, 0, customHex);
  };

  const handleCustomColorChange = async (event) => {
    const button = customColorButtonRef.current;
    if (button) {
      gsap.to(button, {
        scale: 0.65,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      });
      setIsOpen(false);
    }
  };

  const currentColor = accentColors[accentColor] || accentColors.amber;
  const containerWidth = isMobileTouch ? 40 : 48;
  const initialHeight = isMobileTouch ? 40 : 48;
  const mainButtonSize = isMobileTouch ? 24 : 32;
  const colorButtonSize = isMobileTouch ? 20 : 28;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: containerWidth, height: initialHeight }}>
      <div
        ref={drawerRef}
        className="liquid-glass-surface"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          borderRadius: '999px',
          overflow: 'hidden',
          width: containerWidth,
          height: initialHeight,
        }}
      >
        <button
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            borderRadius: '999px',
            flexShrink: 0,
            border: 'none',
            padding: 0,
            width: mainButtonSize,
            height: mainButtonSize,
            backgroundColor: currentColor.hex,
            cursor: 'pointer'
          }}
        />

        {Object.keys(accentColors).filter(k => k !== 'custom').map((colorKey, index) => {
          const color = accentColors[colorKey];
          const isSelected = accentColor === colorKey;
          return (
            <button
              key={colorKey}
              ref={(el) => { if (el) colorsRef.current[index] = el; }}
              onClick={(e) => handleColorChange(colorKey, e)}
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}
              aria-label={`Select ${color.name}`}
              style={{
                borderRadius: '999px',
                flexShrink: 0,
                border: 'none',
                padding: 0,
                width: colorButtonSize,
                height: colorButtonSize,
                backgroundColor: color.hex,
                boxShadow: isSelected
                  ? `0 0 0 2px var(--color-surface), 0 0 0 3px ${color.hex}`
                  : `0 2px 8px rgba(0,0,0,0.2)`,
                cursor: 'pointer'
              }}
            />
          );
        })}

        <button
          ref={(el) => {
            customColorButtonRef.current = el;
            if (el) colorsRef.current[Object.keys(accentColors).length - 1] = el;
          }}
          onClick={handleCustomColorClick}
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
          aria-label="Select custom color"
          style={{
            borderRadius: '999px',
            flexShrink: 0,
            border: 'none',
            padding: 0,
            width: colorButtonSize,
            height: colorButtonSize,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
            boxShadow: accentColor === 'custom'
              ? `0 0 0 2px var(--color-surface), 0 0 0 3px rgba(102, 126, 234, 0.8)`
              : `0 2px 8px rgba(0,0,0,0.3)`,
            cursor: 'pointer'
          }}
        />

        <input
          ref={colorInputRef}
          type="color"
          onInput={handleCustomColorInput}
          onChange={handleCustomColorChange}
          style={{ display: 'none' }}
          aria-label="Custom color picker"
        />
      </div>
    </div>
  );
};

export default AccentColorPicker;
