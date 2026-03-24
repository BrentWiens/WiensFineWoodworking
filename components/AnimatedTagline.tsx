'use client';

import { useState, useEffect } from 'react';

const WORDS = ['dining', 'coffee', 'end'];
const INTERVAL = 1800;
const DURATION = 350;

export default function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, DURATION);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className={`text-2xl md:text-3xl text-white/95 mb-4 drop-shadow-md font-light`}>
      <span className="text-white/60">[</span>
      <span style={{ display: 'inline-grid' }}>
        {WORDS.map((word, i) => (
          <span
            key={word}
            style={{
              gridArea: '1 / 1',
              opacity: i === index ? (visible ? 1 : 0) : 0,
              transform: i === index && !visible ? 'translateY(6px)' : 'translateY(0)',
              transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms ease`,
            }}
          >
            {word}
          </span>
        ))}
      </span>
      <span className="text-white/60">]</span>
      {' '}tables and desks, handcrafted in Kitchener
    </p>
  );
}
