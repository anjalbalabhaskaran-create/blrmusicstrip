// TextOverlay.jsx
import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import gsap from 'gsap';
import './TextOverlay.css';

const paragraphs = [
  { 
    content: (
      <>
        <strong><span style={{ color: '#000000' }}>Scroll up and down</span></strong> through the cityscape. The past stretches wide and each surreal detail is a door to a sonic memory. Look for <strong><span style={{ color: '#800000' }}>8 unusually coloured objects</span></strong>. Jukeboxes, radios, newspapers, amplifiers. And <strong><span style={{ color: '#000000' }}>click</span></strong> to uncover the rhythms they've been saving just for you.
      </>
    ), 
    style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' } 
  },
  { text: "The Time from Swings and Balls to bohemian dreams", style: { top: '80%', left: '20%' } },
  { text: "The time when freedom was just a chord away", style: { top: '20%', left: '65%' } },
  { text: "The time when a vision travelled 7000 miles", style: { bottom: '20%', left: '20%' } },
  { text: "The time when sparks met strings", style: { top: '30%', left: '20%' } },
  { text: "The time when the guitar got stolen", style: { top: '90%', left: '20%' } },
  { text: "The time when sound faded but spirit stayed", style: { top: '10%', left: '50%' } },
  { text: "The time when law and music struck a chord", style: { top: '80%', right: '50%' } },
  { text: "The time when beats bowed to brands", style: { top: '10%', right: '20%' } },
];

const TextOverlay = forwardRef((props, ref) => {
  const textRefs = useRef([]);
  const textStates = useRef(new Array(9).fill(false)); // Track current visibility state for 9 texts

  useImperativeHandle(ref, () => ({
    setTextVisibility: (index, visible) => {
      const el = textRefs.current[index];
      if (!el) return;

      // Only animate if the state actually changed
      if (textStates.current[index] === visible) return;
      
      textStates.current[index] = visible;

      gsap.to(el, {
        opacity: visible ? 1 : 0,
        duration: 0.7,
        ease: visible ? 'power2.in' : 'power2.out', // ease in on entry, ease out on exit
        onStart: () => {
          if (visible) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
          }
        },
        onComplete: () => {
          if (!visible) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          }
        },
      });
    }
  }));

  useEffect(() => {
    // Initially hide all text elements using simple CSS
    textRefs.current.forEach((el, index) => {
      if (el) {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        console.log(`Text ${index} initialized as hidden`);
      }
    });
  }, []);

  return (
    <div className="text-overlay-container">
      {paragraphs.map((para, index) => {
        return (
          <p
            key={index}
            ref={(el) => (textRefs.current[index] = el)}
            className="text-paragraph"
            style={{
              position: 'absolute',
              ...para.style,
              // Force update
            }}
          >
            {para.content || para.text}
          </p>
        );
      })}
    </div>
  );
});

export default TextOverlay;
