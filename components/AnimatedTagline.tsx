'use client';

import { useState, useEffect } from 'react';

const WORDS = ['dining', 'coffee', 'end'];
const INTERVAL = 1800;
const DURATION = 350;

export default function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, DURATION);
    }, INTERVAL);
    return () => {
      clearInterval(interval);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    // The page's h1. It was previously a <p>, which left the homepage — the page
    // most worth ranking — with no h1 at all.
    <h1 className={`text-2xl md:text-3xl text-white/95 mb-4 drop-shadow-md font-light`}>
      {/*
        Only the current word is in the DOM. Stacking all three so they could
        cross-fade meant the heading's text content read "[diningcoffeeend] tables
        and desks…" — which is what a crawler indexes and what a screen reader
        announces, since aria-hidden does not remove text from either.
        min-width reserves room for the longest word so the line doesn't reflow.
      */}
      <span className="text-white/60" aria-hidden="true">[</span>
      <span
        style={{
          display: 'inline-block',
          minWidth: '6ch',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms ease`,
        }}
      >
        {WORDS[index]}
      </span>
      <span className="text-white/60" aria-hidden="true">]</span>
      {' '}tables and desks, handcrafted in Kitchener
    </h1>
  );
}
