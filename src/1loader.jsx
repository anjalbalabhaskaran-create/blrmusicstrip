import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import { useGlobalAudio } from './GlobalAudioContext.jsx';
import { getAssetPath } from './utils/assetPath';

const GIF_SRC = getAssetPath('/video/walkingmusicians.gif');

// Button style constants from IntroLoader
const LOADER_STYLE = {
  btnText: 'Start',
  btnWidth: 140,
  btnHeight: 58,
  btnScale: 0.69,
  btnOpacity: 1,
  btnTextColor: '#312d2f',
};

const Page1Loader = ({ onNext }) => {
  // Get global audio context
  const { playAudio, updateVolumeForPage, toggleMute, isMuted } = useGlobalAudio();

  // Handle mute toggle
  const handleMuteToggle = (e) => {
    e.stopPropagation();
    toggleMute();
  };
  
  // Constants
  const LEVA_DEFAULTS = {
    title: 'What remains when the song fades?',
    subtitle: 'The story of Bangalore music strip',
    titleSize: 36,
    subtitleSize: 24,
    barWidth: 400,
    barHeight: 40,
    barStroke: '#000',
    barFill: '#fff',
    barRadius: 20,
    gifSize: 36,
    gifOpacity: 1,
  };

  // Use constants only
  const title = LEVA_DEFAULTS.title;
  const subtitle = LEVA_DEFAULTS.subtitle;
  const titleSize = LEVA_DEFAULTS.titleSize;
  const subtitleSize = LEVA_DEFAULTS.subtitleSize;
  const barWidth = LEVA_DEFAULTS.barWidth;
  const barHeight = LEVA_DEFAULTS.barHeight;
  const barStroke = LEVA_DEFAULTS.barStroke;
  const barFill = LEVA_DEFAULTS.barFill;
  const barRadius = LEVA_DEFAULTS.barRadius;

  // GIF constants
  const gifSize = LEVA_DEFAULTS.gifSize;
  const gifOpacity = LEVA_DEFAULTS.gifOpacity;
  const gifScale = 2;
  const gifY = -18;

  // Button positioning constants
  const btnX = 0;
  const btnY = 12;

  // Fixed Y positioning values (from Leva controls)
  const titleY = 0;
  const subtitleY = 2;
  const progressBarY = 13;
  const progressPercentY = -12;
  const gifYControl = -139;
  const buttonY = -24;

  const [progress, setProgress] = useState(0);
  const [showStart, setShowStart] = useState(false);
  const [gifPaused, setGifPaused] = useState(false);
  const gifRef = useRef(null);

  // Start background music when component mounts
  useEffect(() => {
    updateVolumeForPage('loader');
    // Try to start audio immediately
    playAudio();
  }, [playAudio, updateVolumeForPage]);

  useEffect(() => {
    let start = Date.now();
    let raf;
    const tick = () => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, Math.round((elapsed / 8000) * 100));
      setProgress(percent);
      
      // Pause GIF at 90% progress
      if (percent >= 90) {
        setGifPaused(true);
      }
      
      if (percent < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setShowStart(true);
      }
    };
    tick();
    return () => raf && cancelAnimationFrame(raf);
  }, []);

  // Calculate GIF position inside bar
  const gifX = (progress / 100) * (barWidth - gifSize);

  // Handle start button click
  const handleStart = () => {
    // Ensure audio starts on user interaction
    playAudio();
    if (onNext) onNext();
  };

  return (
    <>
      {/* Volume Button - Consistent Minimal UI */}
      <button
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          width: 28,
          height: 28,
          background: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.3)',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          zIndex: 1000,
          transition: 'all 0.15s ease',
          backdropFilter: 'blur(8px)',
          color: 'rgba(0, 0, 0, 0.8)',
        }}
        onClick={handleMuteToggle}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'rgba(0, 0, 0, 0.6)';
          e.target.style.color = 'rgba(0, 0, 0, 1)';
          e.target.style.background = 'rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(0, 0, 0, 0.3)';
          e.target.style.color = 'rgba(0, 0, 0, 0.8)';
          e.target.style.background = 'transparent';
        }}
      >
        {isMuted ? '×' : '○'}
      </button>

      <div style={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Helvetica Neue, Arial, sans-serif',
      }}>
      <div style={{ textAlign: 'center', marginBottom: 40, transform: `translateY(${titleY}px)` }}>
        <div style={{
          fontFamily: 'Helvetica Neue',
          fontWeight: '400',
          fontSize: titleSize,
          marginBottom: 12,
          color: '#000',
          transform: `translateY(${subtitleY}px)`,
        }}>{title}</div>
        <div style={{
          fontFamily: 'Helvetica Neue',
          fontWeight: '100',
          fontSize: subtitleSize,
          marginBottom: 32,
          color: '#000',
        }}>{subtitle}</div>
      </div>
      {/* Progress Bar from BeginningLoading.jsx */}
      <div style={{
        width: '90vw', // 90% of viewport width
        height: '2px',
        backgroundColor: '#cccccc', // Grey background line
        position: 'relative',
        marginBottom: '60px', // Fixed margin to prevent shifting
        transform: `translateY(${progressBarY}px)`,
      }}>
        {/* Progress Fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'black', // Black fill
          transition: 'width 0.1s ease-out',
        }} />
        
        {/* Walking Musicians GIF */}
        <div style={{
          position: 'absolute',
          top: `${gifYControl}px`, // Fixed position
          left: `calc(${Math.min(progress, 90)}% - 40px)`, // Stop movement at 90%
          transition: 'left 0.1s ease-out',
          zIndex: 10,
        }}>
          <img
            src={GIF_SRC}
            alt="Walking Musicians"
            style={{
              width: '192px', // Scaled up by 2x (96px * 2 = 192px)
              height: 'auto',
              objectFit: 'contain',
              opacity: gifPaused ? 0.5 : 1,
              filter: gifPaused ? 'grayscale(100%)' : 'none',
              transition: 'opacity 0.2s, filter 0.2s',
            }}
          />
        </div>
      </div>

      {/* Loading Percentage from BeginningLoading.jsx */}
      <div style={{
        fontSize: '16px',
        fontWeight: '300',
        color: 'black',
        textAlign: 'center',
        marginBottom: '40px',
        height: '20px', // Fixed height to prevent layout shift
        transform: `translateY(${progressPercentY}px)`,
      }}>
        {Math.floor(progress)}%
      </div>
      <button
        className="introloader-btn"
        style={{
          width: LOADER_STYLE.btnWidth,
          height: LOADER_STYLE.btnHeight,
          transform: `translate(${btnX}px, ${btnY + buttonY}px) scale(${LOADER_STYLE.btnScale})`,
          opacity: showStart ? LOADER_STYLE.btnOpacity : 0.5,
          cursor: showStart ? 'pointer' : 'not-allowed',
          pointerEvents: showStart ? 'auto' : 'none',
          transition: 'all 0.2s',
        }}
        disabled={!showStart}
        onClick={showStart ? handleStart : undefined}
      >
        <span className="introloader-btn-text" style={{ color: LOADER_STYLE.btnTextColor }}>{LOADER_STYLE.btnText}</span>
      </button>
      </div>
    </>
  );
};

export default Page1Loader;
