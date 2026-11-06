'use client';

import { useEffect, useRef, useState } from 'react';

export interface GalleryJumpBarLink {
  id: string;
  /** Short enough that all four fit on one row on a phone. */
  label: string;
}

/**
 * A slim, pinned copy of the gallery's jump links. It stays out of the way while the
 * full-size section links are on screen, slides in under the main nav once they've
 * scrolled past, and highlights the section currently being viewed.
 *
 * `watchId` is the element whose scrolling away reveals the bar.
 */
export default function GalleryJumpBar({
  links,
  watchId,
}: {
  links: GalleryJumpBarLink[];
  watchId: string;
}) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [top, setTop] = useState(0);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // The main nav is fixed and wraps to two rows on phones, so measure it rather
    // than hardcode its height.
    const mainNav = document.querySelector<HTMLElement>('nav[aria-label="Main navigation"]');
    const watched = document.getElementById(watchId);
    if (!mainNav || !watched) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const navBottom = mainNav.getBoundingClientRect().bottom;
      setTop(navBottom);
      setVisible(watched.getBoundingClientRect().bottom <= navBottom);

      // The current section is the last one whose top has passed under the bar.
      const line = navBottom + (barRef.current?.offsetHeight ?? 0) + 1;
      let current: string | null = null;
      for (const { id } of links) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [links, watchId]);

  return (
    <nav
      ref={barRef}
      aria-label="Jump to gallery section"
      data-testid="gallery-jump-bar"
      // `invisible` (visibility: hidden) also takes the links out of the tab order
      // while the bar is tucked away.
      className={`fixed inset-x-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 ${
        visible ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
      }`}
      style={{ top }}
    >
      {/* Centred at every width. `w-max mx-auto` rather than `justify-center`: if the
          row ever outgrows a narrow screen, it scrolls from the first link instead of
          clipping it off the left edge. Tighter spacing and slightly smaller text on
          phones keep all four links on one row of a 390px-wide screen. */}
      <div className="overflow-x-auto px-2 sm:px-6 py-2">
        <ul className="flex w-max mx-auto gap-1 sm:gap-2">
          {links.map(({ id, label }) => {
            const isActive = id === active;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  data-testid={`jumpbar-${id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`block whitespace-nowrap rounded-full px-2 sm:px-3 py-1 text-[13px] sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                    isActive
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
