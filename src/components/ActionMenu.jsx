import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Row action dropdown that renders into document.body, so it is never
 * clipped by a table's `overflow-x-auto` wrapper. Opens below the trigger,
 * or above it when there isn't enough room.
 *
 * <ActionMenu open={...} onClose={...} trigger={<button .../>} className="w-48">
 *   ...menu items...
 * </ActionMenu>
 */
export default function ActionMenu({ open, onClose, trigger, children, className = "w-48" }) {
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const place = () => {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const menuH = menu ? menu.offsetHeight : 0;
      const gap = 8;
      const fitsBelow = r.bottom + gap + menuH <= window.innerHeight;
      setPos({
        top: fitsBelow ? r.bottom + gap : Math.max(gap, r.top - gap - menuH),
        right: Math.max(gap, window.innerWidth - r.right),
      });
    };
    place();
    // Re-measure once the menu has its real height.
    const raf = requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={anchorRef} className="relative inline-block text-left">
      {trigger}
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[999]" onClick={onClose} />
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: pos?.top ?? 0,
                right: pos?.right ?? 0,
                visibility: pos ? "visible" : "hidden",
              }}
              className={`${className} bg-white border border-slate-100 shadow-xl rounded-2xl p-1 z-[1000] text-xs text-left animate-fade-in`}
            >
              {children}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
