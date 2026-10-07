"use client";

import { useEffect, useRef } from "react";

/**
 * Global scanning-reticle cursor.
 * Mount this ONCE in app/layout.js (inside <body>), not on individual pages.
 * It listens on `document`, so it automatically covers every route.
 *
 * Any element that should feel "clickable" (expand the ring on hover) either
 * matches the default selector below (a, button, input) or carries the
 * `data-cursor-hover` attribute.
 */
export default function ScanCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf;

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }

    function loop() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    }

    function onEnter(e) {
      if (e.target.closest("a, button, input, [data-cursor-hover]")) {
        ring.dataset.hover = "true";
      }
    }
    function onLeave(e) {
      if (e.target.closest("a, button, input, [data-cursor-hover]")) {
        ring.dataset.hover = "false";
      }
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    loop();

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hidden [@media(hover:hover)]:block">
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-6 w-6 rounded-full border-[1.5px] border-emerald-700 transition-[width,height,background-color] duration-150 ease-out data-[hover=true]:h-11 data-[hover=true]:w-11 data-[hover=true]:bg-emerald-700/10"
      >
        <span className="absolute left-1/2 top-1/2 h-3 w-[1.5px] -translate-x-1/2 -translate-y-[calc(100%+6px)] bg-emerald-700" />
        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-3 -translate-x-[calc(100%+6px)] -translate-y-1/2 bg-emerald-700" />
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] w-[3px] rounded-full bg-emerald-700"
      />
    </div>
  );
}