import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

// Fades + lifts children into place once they cross into the viewport.
// `as` lets the wrapper render as a section/div/etc without an extra span.
export default function Reveal({ children, as: Tag = "div", delay = 0, y = 28, x = 0, className = "", ...rest }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y, x });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [delay, y, x]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
