// MusicStrip.jsx
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, RandomizedLight } from '@react-three/drei';
import { getProject, val } from '@theatre/core';
import { SheetProvider, PerspectiveCamera, useCurrentSheet } from '@theatre/r3f';
import { useGlobalAudio } from './GlobalAudioContext.jsx';
import { useNavigate } from 'react-router-dom';

import MusicStripModel from './MusicStripModel';
import musicStripState from './Music Strip Animation.theatre-project-state.json';
import Lightbox from './Lightbox';
import TextOverlay from './TextOverlay';

const musicStripProject = getProject('Music Strip Animation', {
  state: musicStripState,
});
const animationSheet = musicStripProject.sheet('Camera Flythrough');

function Scene({ onVideoTrigger, textRef, onScrollPositionChange }) {
  const sheet = useCurrentSheet();
  const scroll = useScroll();
  const modelRef = useRef();
  const lastPositionRef = useRef(0);

  useFrame(() => {
    const sequenceLength = val(sheet.sequence.pointer.length);
    const targetPosition = scroll.offset * sequenceLength;
    
    // Smooth interpolation to reduce jumpiness - very slow transitions
    const smoothFactor = 0.02; // Further reduced from 0.05 for very slow transitions
    const smoothPosition = lastPositionRef.current + (targetPosition - lastPositionRef.current) * smoothFactor;
    lastPositionRef.current = smoothPosition;
    
    sheet.sequence.position = smoothPosition;

    // Pass scroll position to parent for metro sound control and button visibility
    if (onScrollPositionChange) {
      onScrollPositionChange(smoothPosition);
    }

    if (modelRef.current) {
      modelRef.current.setVisibility("S2", !(smoothPosition >= 0 && smoothPosition < 2));
      modelRef.current.setVisibility("S1", smoothPosition < 2);

      // Control visibility for all P1-P8 meshes based on scroll position
      modelRef.current.setVisibility("P1", smoothPosition >= 0 && smoothPosition < 2);
      modelRef.current.setVisibility("P2", smoothPosition >= 2 && smoothPosition < 4);
      modelRef.current.setVisibility("P3", smoothPosition >= 6 && smoothPosition < 8);
      modelRef.current.setVisibility("P4", smoothPosition >= 8 && smoothPosition < 10);
      modelRef.current.setVisibility("P5", smoothPosition >= 11.49 && smoothPosition < 12.53); // Restored visibility range
      modelRef.current.setVisibility("P6", smoothPosition >= 13 && smoothPosition < 15);
      modelRef.current.setVisibility("P7", smoothPosition >= 14 && smoothPosition < 16.5);
      modelRef.current.setVisibility("P8", smoothPosition >= 16 && smoothPosition < 18);
    }

    // Debug message
    if (smoothPosition === 0) {
      console.log('🎬 At start position - P1 and P5 should be visible and clickable');
    }

    if (textRef.current) {
      textRef.current.setTextVisibility(0, smoothPosition >= 0 && smoothPosition < 0.8); // Restored visibility
      textRef.current.setTextVisibility(1, smoothPosition >= 3.2 && smoothPosition < 4.5);
      textRef.current.setTextVisibility(2, smoothPosition >= 6.34 && smoothPosition < 8.6);
      textRef.current.setTextVisibility(3, smoothPosition >= 8.75 && smoothPosition < 9.23);
      textRef.current.setTextVisibility(4, smoothPosition >= 11.49 && smoothPosition < 12.53);
      textRef.current.setTextVisibility(5, smoothPosition >= 13 && smoothPosition < 13.9);
      textRef.current.setTextVisibility(6, smoothPosition >= 15.5 && smoothPosition < 16.7);
      textRef.current.setTextVisibility(7, smoothPosition >= 16.6 && smoothPosition < 17.5);
      textRef.current.setTextVisibility(8, smoothPosition >= 18.44 && smoothPosition < 18.88);
    }

    // Control saturation for P1-P8 meshes based on text visibility
    if (modelRef.current) {
      // Define which P mesh should be highlighted and when
      const highlightConditions = [
        { mesh: "P1", active: smoothPosition >= 0 && smoothPosition < 0.8 },
        { mesh: "P2", active: smoothPosition >= 3.2 && smoothPosition < 4.5 },
        { mesh: "P3", active: smoothPosition >= 6.34 && smoothPosition < 8.6 },
        { mesh: "P4", active: smoothPosition >= 8.75 && smoothPosition < 9.23 },
        { mesh: "P5", active: smoothPosition >= 11.49 && smoothPosition < 12.53 },
        { mesh: "P6", active: smoothPosition >= 13 && smoothPosition < 13.9 },
        { mesh: "P7", active: smoothPosition >= 15.5 && smoothPosition < 16.7 },
        { mesh: "P8", active: smoothPosition >= 16.6 && smoothPosition < 17.5 },
      ];

      // Find if any P mesh should be highlighted
      const activeHighlight = highlightConditions.find(condition => condition.active);

      if (activeHighlight) {
        // Decrease saturation of all other meshes to 0.3 (30% saturation)
        modelRef.current.setGlobalSaturation(0.3, [activeHighlight.mesh]);
        // Increase saturation of the active P mesh to 1.8 (180% saturation)
        modelRef.current.setSaturation(activeHighlight.mesh, 1.8);
      } else {
        // Restore normal saturation for all meshes when no text is visible
        modelRef.current.setGlobalSaturation(1.0, []);
        // Also restore normal saturation for all P meshes individually
        ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"].forEach(meshName => {
          modelRef.current.setSaturation(meshName, 1.0);
        });
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={2} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <RandomizedLight castShadow amount={10} frames={100} position={[0, 3, 0]} />

      <Suspense fallback={null}>
        <MusicStripModel ref={modelRef} onVideoTrigger={onVideoTrigger} />
      </Suspense>

      <PerspectiveCamera
        theatreKey="Camera"
        makeDefault
        position={[5, 3, 5]}
        fov={45}
        near={0.01}
        far={10}
      />
    </>
  );
}

const MusicStrip = () => {
  // Get global audio context - stop intro music on this page
  const { updateVolumeForPage } = useGlobalAudio();
  
  // Stop intro music when entering music strip
  useEffect(() => {
    updateVolumeForPage('musicstrip'); // This will pause intro music
  }, [updateVolumeForPage]);

  const navigate = useNavigate();
  const [videoIndex, setVideoIndex] = useState(null);
  const textRef = useRef();
  const audioRef = useRef(); // This handles bg.m4a background music

  // Debug videoIndex changes
  useEffect(() => {
    console.log(`🎬 MusicStrip videoIndex changed to:`, videoIndex);
  }, [videoIndex]);
  
  // Audio refs for all ambient sounds
  const firstAudioRef = useRef();
  const secondAudioRef = useRef();
  const hippieAudioRef = useRef();
  const cubbonAudioRef = useRef();
  const streetAudioRef = useRef();
  const metroAudioRef = useRef();
  const churchStreetAudioRef = useRef();
  
  const fadeIntervalRef = useRef(null);
  const soundFadeIntervals = useRef({}); // Store fade intervals for each sound
  
  const [currentPosition, setCurrentPosition] = useState(0);
  const [activeSounds, setActiveSounds] = useState(new Set()); // Track which sounds are playing
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); // Track lightbox state
  const [showNavButtons, setShowNavButtons] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showPositionIndicator, setShowPositionIndicator] = useState(false);
  const positionIndicatorTimerRef = useRef(null);

  // Loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Simulate loading bar progress (replace with real loading if needed)
  useEffect(() => {
    if (loadingProgress < 100) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoadingComplete(true);
            return 100;
          }
          return prev + 2 + Math.random() * 3; // random speed
        });
      }, 40);
      return () => clearInterval(interval);
    } else {
      setLoadingComplete(true);
    }
  }, [loadingProgress]);

  // Enhanced video trigger function with debugging
  const handleVideoTrigger = (index) => {
    console.log(`🎬 Video trigger called with index: ${index}`);
    console.log(`🎬 Current videoIndex state before update: ${videoIndex}`);
    console.log(`🎬 Current background music volume: ${audioRef.current?.volume}`);
    console.log(`🎬 Current lightbox state: ${isLightboxOpen}`);
    // Instead of just setting index, set an object with video src for P1-P8
    let videoSrc = null;
    if (index >= 1 && index <= 8) {
      videoSrc = `/video/${index}.webm`;
    }
    setVideoIndex(videoSrc || index); // If not P1-P8, fallback to index
    console.log(`🎬 SetVideoIndex called with:`, videoSrc || index);
  };

  // Function to fade any audio in or out
  const fadeAudio = (audio, targetVolume, duration = 1500) => {
    if (!audio) return;
    
    // Clear any existing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    const startVolume = audio.volume;
    const volumeStep = (targetVolume - startVolume) / (duration / 50);
    let currentVolume = startVolume;
    
    fadeIntervalRef.current = setInterval(() => {
      currentVolume += volumeStep;
      
      // Check if we've reached the target
      if ((volumeStep > 0 && currentVolume >= targetVolume) || 
          (volumeStep < 0 && currentVolume <= targetVolume)) {
        currentVolume = targetVolume;
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      
      audio.volume = Math.max(0, Math.min(1, currentVolume));
    }, 50);
  };

  // Function to fade specific sound audio in or out
  const fadeSoundAudio = (audioRef, soundName, targetVolume, duration = 800, shouldPause = true) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Clear any existing fade for this sound
    if (soundFadeIntervals.current[soundName]) {
      clearInterval(soundFadeIntervals.current[soundName]);
    }
    
    const startVolume = audio.volume;
    const volumeStep = (targetVolume - startVolume) / (duration / 50);
    let currentVolume = startVolume;
    
    soundFadeIntervals.current[soundName] = setInterval(() => {
      currentVolume += volumeStep;
      
      // Check if we've reached the target
      if ((volumeStep > 0 && currentVolume >= targetVolume) || 
          (volumeStep < 0 && currentVolume <= targetVolume)) {
        currentVolume = targetVolume;
        clearInterval(soundFadeIntervals.current[soundName]);
        soundFadeIntervals.current[soundName] = null;
        
        // Only pause the audio if we're fading out to 0 AND shouldPause is true
        if (targetVolume === 0 && shouldPause) {
          audio.pause();
        }
      }
      
      audio.volume = Math.max(0, Math.min(1, currentVolume));
    }, 50);
  };

  // Handle scroll position changes for all background sounds
  const handleScrollPositionChange = (position) => {
    // Update position for display
    setCurrentPosition(position);

    // (Hide temporary position indicator output)
    // setShowPositionIndicator(true);
    if (positionIndicatorTimerRef.current) clearTimeout(positionIndicatorTimerRef.current);
    positionIndicatorTimerRef.current = setTimeout(() => setShowPositionIndicator(false), 1200);

    // Buttons threshold >= 19.8, only when no lightbox
    if (!isLightboxOpen) {
      setShowNavButtons(position >= 19.8);
    }

    if (isLightboxOpen) {
      return;
    }
    
    // Adjust background music volume based on position (only if lightbox is not open)
    const bgAudio = audioRef.current;
    if (bgAudio && !isLightboxOpen) {
      const targetBgVolume = position >= 2 ? 0.08 : 0.10; // Lowered from 0.16/0.20 to 0.08/0.10
      if (Math.abs(bgAudio.volume - targetBgVolume) > 0.02) {
        fadeAudio(bgAudio, targetBgVolume, 1000); // Smooth transition over 1 second
      }
    }
    
    // BLOCK AMBIENT SOUND CHANGES WHEN LIGHTBOX IS OPEN
    if (isLightboxOpen) {
      console.log('🚫 Ambient sound changes blocked - lightbox is open');
      return; // Exit early, don't adjust any ambient sounds
    }
    
    // Define sound ranges with maximum volumes for better audibility
    const soundRanges = [
      { name: 'first', ref: firstAudioRef, start: 2.3, end: 6, volume: 1.0 }, // Increased to 1.0
      { name: '2nd', ref: secondAudioRef, start: 6, end: 8.72, volume: 1.0 }, // Increased to 1.0
      { name: 'hippie', ref: hippieAudioRef, start: 8.72, end: 10, volume: 1.0 }, // Increased to 1.0
      { name: 'cubbon', ref: cubbonAudioRef, start: 10, end: 15, volume: 1.0 }, // Increased to 1.0
      { name: 'street', ref: streetAudioRef, start: 15, end: 17.5, volume: 1.0 }, // Increased to 1.0
      { name: 'metro', ref: metroAudioRef, start: 17.5, end: 18.10, volume: 1.0 }, // Increased to 1.0
      { name: 'churchStreet', ref: churchStreetAudioRef, start: 18.10, end: 19.8, volume: 1.0 }, // Increased to 1.0
    ];

    // Check each sound range
    soundRanges.forEach(({ name, ref, start, end, volume }) => {
      const audio = ref.current;
      if (!audio) return;

      const shouldPlay = position >= start && position < end;
      const isPlaying = activeSounds.has(name);

      if (shouldPlay && !isPlaying) {
        console.log(`Starting ${name} sound - fade in`);
        setActiveSounds(prev => new Set([...prev, name]));
        audio.currentTime = 0; // Reset to beginning
        audio.volume = 0; // Start at 0 volume
        audio.play().then(() => {
          fadeSoundAudio(ref, name, volume, 600, false); // Fade in over 600ms, don't pause when done
        }).catch(console.error);
      } else if (!shouldPlay && isPlaying) {
        console.log(`Stopping ${name} sound - fade out`);
        setActiveSounds(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
        fadeSoundAudio(ref, name, 0, 400, true); // Fade out over 400ms and pause
      }
    });
  };

  // Background music effect (bg.m4a plays only in MusicStrip)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Set audio properties
      audio.loop = true;
      audio.volume = 0; // Start with volume at 0 for fade-in effect
      
      // Add event listeners for debugging
      audio.addEventListener('loadstart', () => console.log('🎵 bg.m4a: Load started'));
      audio.addEventListener('loadeddata', () => console.log('🎵 bg.m4a: Data loaded'));
      audio.addEventListener('canplay', () => console.log('🎵 bg.m4a: Can start playing'));
      audio.addEventListener('play', () => console.log('🎵 bg.m4a: Started playing'));
      audio.addEventListener('pause', () => console.log('🎵 bg.m4a: Paused'));
      audio.addEventListener('error', (e) => console.error('🎵 bg.m4a Error:', e));
      
      // Try to play audio after 500ms delay with fade-in
      const playAudio = async () => {
        setTimeout(async () => {
          try {
            console.log('🎵 Attempting to start bg.m4a background music...');
            await audio.play();
            console.log('🎵 bg.m4a background music started successfully with fade-in');
            // Start fade-in effect over 2 seconds with decreased volume
            fadeAudio(audio, 0.10, 2000); // Lowered from 0.25 to 0.10 for better balance
          } catch (error) {
            console.log('🎵 bg.m4a autoplay blocked. User interaction required:', error);
          }
        }, 500); // 500ms delay
      };

      playAudio();

      // Cleanup function to pause audio when component unmounts
      return () => {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        // Clear all sound fade intervals
        Object.values(soundFadeIntervals.current).forEach(interval => {
          if (interval) clearInterval(interval);
        });
        
        // Clean up main background music
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
        }
        
        // Clean up all background sounds
        [firstAudioRef, secondAudioRef, hippieAudioRef, cubbonAudioRef, 
         streetAudioRef, metroAudioRef, churchStreetAudioRef].forEach(ref => {
          if (ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
            ref.current.volume = 0;
          }
        });
      };
    }
  }, []);

  // Handle user interaction to start audio if autoplay was blocked
  const handleUserInteraction = () => {
    console.log('🎵 User interaction detected - attempting to start audio...');
    const audio = audioRef.current;
    if (audio && audio.paused) {
      console.log('🎵 Background music is paused, starting...');
      // Start with volume 0 and fade in
      audio.volume = 0;
      audio.play().then(() => {
        console.log('🎵 Background music started via user interaction with fade-in');
        // Fade in over 2 seconds with decreased volume
        const fadeInAudio = (audio, targetVolume = 0.08, duration = 2000) => { // Lowered from 0.15 to 0.08
          const startVolume = 0;
          const volumeStep = targetVolume / (duration / 50);
          let currentVolume = startVolume;
          
          const fadeInterval = setInterval(() => {
            currentVolume += volumeStep;
            if (currentVolume >= targetVolume) {
              currentVolume = targetVolume;
              clearInterval(fadeInterval);
            }
            audio.volume = currentVolume;
          }, 50);
        };
        fadeInAudio(audio, 0.08, 2000); // Lowered from 0.15 to 0.08
      }).catch((error) => {
        console.error('🎵 Failed to start background music:', error);
      });
    } else if (audio && !audio.paused) {
      console.log('🎵 Background music is already playing');
    } else if (!audio) {
      console.error('🎵 Background music audio element not found');
    }
    
    // Also try to start any ambient sounds that should be playing based on current position
    const soundRefs = [
      { name: 'first', ref: firstAudioRef, start: 2.3, end: 6 },
      { name: '2nd', ref: secondAudioRef, start: 6, end: 8.72 },
      { name: 'hippie', ref: hippieAudioRef, start: 8.72, end: 10 },
      { name: 'cubbon', ref: cubbonAudioRef, start: 10, end: 15 },
      { name: 'street', ref: streetAudioRef, start: 15, end: 17.5 },
      { name: 'metro', ref: metroAudioRef, start: 17.5, end: 18.10 },
      { name: 'churchStreet', ref: churchStreetAudioRef, start: 18.10, end: 19.8 },
    ];
    
    soundRefs.forEach(({ name, ref, start, end }) => {
      const soundAudio = ref.current;
      if (soundAudio && soundAudio.paused && currentPosition >= start && currentPosition < end && !activeSounds.has(name)) {
        console.log(`User interaction: Starting ${name} sound`);
        soundAudio.play().catch(console.error);
      }
    });
  };

  // Watch for videoIndex changes to handle fade-out when lightbox opens
  useEffect(() => {
    console.log('🎬 videoIndex changed:', videoIndex, '- isLightboxOpen will be:', videoIndex !== null);
    console.log('🎬 Background music current volume:', audioRef.current?.volume);
    console.log('🎬 Background music paused state:', audioRef.current?.paused);
    if (videoIndex !== null) {
      console.log('🎬 Lightbox opened - FADING OUT ALL audio');
      // Fade out bg.m4a smoothly
      const bgAudio = audioRef.current;
      if (bgAudio) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        fadeAudio(bgAudio, 0, 800); // Fade out over 800ms
        setTimeout(() => { bgAudio.pause(); }, 800); // Pause after fade out
      }
      // Fade out all ambient sounds smoothly
      const ambientRefs = [
        { name: 'first', ref: firstAudioRef },
        { name: '2nd', ref: secondAudioRef },
        { name: 'hippie', ref: hippieAudioRef },
        { name: 'cubbon', ref: cubbonAudioRef },
        { name: 'street', ref: streetAudioRef },
        { name: 'metro', ref: metroAudioRef },
        { name: 'churchStreet', ref: churchStreetAudioRef },
      ];
      ambientRefs.forEach(({ name, ref }) => {
        const ambientAudio = ref.current;
        if (ambientAudio) {
          if (soundFadeIntervals.current[name]) {
            clearInterval(soundFadeIntervals.current[name]);
            soundFadeIntervals.current[name] = null;
          }
          fadeSoundAudio(ref, name, 0, 800, true); // Fade out and pause
        }
      });
      handleLightboxOpen();
    } else {
      console.log('🎬 videoIndex is null - lightbox should be closed');
    }
  }, [videoIndex]);

  // Handle video playing (ensure audio stays muted during video playback)
  const handleVideoPlay = () => {
    console.log('🎬 Video playing - ensuring all audio stays muted');
    // Audio should already be paused from lightbox opening, but double-check
    const bgAudio = audioRef.current;
    if (bgAudio && !bgAudio.paused) {
      console.log('🔇 Video playing - pausing bg.m4a as backup');
      bgAudio.pause();
      bgAudio.volume = 0;
    }
  };

  // Handle video pausing/ending (do nothing - wait for lightbox close)
  const handleVideoPause = () => {
    console.log('🎬 Video paused/ended - waiting for lightbox close to restore audio');
    // Don't restore audio here - only when lightbox fully closes
  };

  // Handle lightbox opening (completely mute background music and ambient sounds)
  const handleLightboxOpen = () => {
    console.log('🔇 LIGHTBOX OPENED - Setting state and ensuring all audio is muted');
    setIsLightboxOpen(true); // Prevent scroll-based volume adjustments
    
    // Double-check that bg.m4a is muted (should already be done in useEffect)
    const audio = audioRef.current;
    if (audio && audio.volume > 0) {
      console.log('🔇 Double-check: bg.m4a still has volume', audio.volume, '- setting to 0');
      audio.volume = 0;
    }
    
    // Double-check that all ambient sounds are muted
    const ambientRefs = [
      { name: 'first', ref: firstAudioRef },
      { name: '2nd', ref: secondAudioRef },
      { name: 'hippie', ref: hippieAudioRef },
      { name: 'cubbon', ref: cubbonAudioRef },
      { name: 'street', ref: streetAudioRef },
      { name: 'metro', ref: metroAudioRef },
      { name: 'churchStreet', ref: churchStreetAudioRef },
    ];
    
    ambientRefs.forEach(({ name, ref }) => {
      const ambientAudio = ref.current;
      if (ambientAudio && ambientAudio.volume > 0) {
        console.log(`🔇 Double-check: ${name} still has volume`, ambientAudio.volume, '- setting to 0');
        ambientAudio.volume = 0;
      }
    });
  };

  // Handle lightbox closing (restore background music and ambient sounds volume)
  const handleLightboxClose = () => {
    console.log('🔊 LIGHTBOX CLOSED - Restoring audio levels');
    setIsLightboxOpen(false); // Re-enable scroll-based volume adjustments
    // RESTORE background music (bg.m4a) - restart and fade in
    const audio = audioRef.current;
    if (audio) {
      const targetVolume = currentPosition >= 2 ? 0.08 : 0.10; // Lowered from 0.16/0.20 to 0.08/0.10
      audio.volume = 0; // Start at 0
      audio.play().then(() => {
        fadeAudio(audio, targetVolume, 800); // Gentle fade back to normal volume
      }).catch((error) => {
        console.error('🔊 Failed to restart bg.m4a:', error);
      });
    }
    // RESTORE ambient sounds based on current scroll position
    const soundRanges = [
      { name: 'first', ref: firstAudioRef, start: 2.3, end: 6, volume: 1.0 },
      { name: '2nd', ref: secondAudioRef, start: 6, end: 8.72, volume: 1.0 },
      { name: 'hippie', ref: hippieAudioRef, start: 8.72, end: 10, volume: 1.0 },
      { name: 'cubbon', ref: cubbonAudioRef, start: 10, end: 15, volume: 1.0 },
      { name: 'street', ref: streetAudioRef, start: 15, end: 17.5, volume: 1.0 },
      { name: 'metro', ref: metroAudioRef, start: 17.5, end: 18.10, volume: 1.0 },
      { name: 'churchStreet', ref: churchStreetAudioRef, start: 18.10, end: 19.8, volume: 1.0 },
    ];
    soundRanges.forEach(({ name, ref, start, end, volume }) => {
      const shouldRestore = currentPosition >= start && currentPosition < end;
      const ambientAudio = ref.current;
      if (shouldRestore && ambientAudio) {
        setActiveSounds(prev => new Set([...prev, name]));
        ambientAudio.volume = 0; // Start at 0
        ambientAudio.play().then(() => {
          fadeSoundAudio(ref, name, volume, 800, false); // Gentle fade back to normal volume
        }).catch((error) => {
          console.error(`🔊 Failed to restart ${name}:`, error);
        });
      }
    });
    setVideoIndex(null);
  };

  // Refs for loader bar and gif
  const loaderBarRef = useRef();
  const loaderGifRef = useRef();
  const [gifLeft, setGifLeft] = useState(0);

  // Move GIF from left to right as progress increases
  useEffect(() => {
    if (loaderBarRef.current && loaderGifRef.current) {
      const barWidth = loaderBarRef.current.offsetWidth;
      const gifWidth = loaderGifRef.current.offsetWidth;
      const maxLeft = barWidth - gifWidth;
      const left = Math.max(0, Math.min(maxLeft, (loadingProgress / 100) * maxLeft));
      setGifLeft(left);
    }
  }, [loadingProgress]);

  return (
    <>
      {/* Loading Overlay - always rendered, covers viewport when loading */}
      <div
        className="loading-overlay"
        style={{
          display: loadingComplete ? 'none' : 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'white',
          zIndex: 9999,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div className="loader-content" style={{textAlign: 'center', width: '85vw', maxWidth: 1200, position: 'relative', height: 120}}>
          <img 
            ref={loaderGifRef}
            src="/video/walkingmusicians.gif" 
            alt="Walking Musicians" 
            className="loader-musicians" 
            style={{
              height: 90, 
              position: 'absolute',
              top: 0,
              left: gifLeft,
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'left 0.2s',
              zIndex: 2,
            }} 
            onError={e => {e.target.style.display='none'}} 
          />
          <div ref={loaderBarRef} className="loader-bar-container" style={{width: '85vw', maxWidth: 1200, height: 7, background: '#eee', borderRadius: 6, overflow: 'hidden', margin: '90px auto 24px auto', position: 'relative'}}>
            <div className="loader-bar" style={{ height: '100%', background: '#222', width: `${loadingProgress}%`, transition: 'width 0.2s' }} />
          </div>
          <div className="loader-text" style={{marginTop: 32, fontSize: 20, color: '#222'}}>Scroll up or down to explore the experience</div>
          <div className="scroll-animation" style={{marginTop: 16}}>
            <div className="scroll-arrow" style={{width: 32, height: 32, borderLeft: '5px solid #222', borderBottom: '5px solid #222', transform: 'rotate(-45deg)', margin: '0 auto', animation: 'bounce 1s infinite'}} />
          </div>
        </div>
        <style>{`@keyframes bounce {0%,100%{transform:translateY(0) rotate(-45deg);}50%{transform:translateY(16px) rotate(-45deg);}}`}</style>
      </div>
      {/* Main Experience (hidden until loading complete) */}
      <div style={{ display: loadingComplete ? 'block' : 'none', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'white', overflow: 'hidden' }}>
        {/* Background Music */}
        <audio 
          ref={audioRef}
          src="/music/bg.m4a"
          preload="auto"
          style={{ display: 'none' }}
        />
        
        {/* Background Sounds */}
        <audio ref={firstAudioRef} src="/sounds/first.mp3" loop preload="auto" style={{ display: 'none' }} />
        <audio ref={secondAudioRef} src="/sounds/2nd.mp3" loop preload="auto" style={{ display: 'none' }} />
        <audio ref={hippieAudioRef} src="/sounds/Hippie.mp3" loop preload="auto" style={{ display: 'none' }} />
        <audio ref={cubbonAudioRef} src="/sounds/cubbon.mp3" loop preload="auto" style={{ display: 'none' }} />
        <audio ref={streetAudioRef} src="/sounds/street.mp3" loop preload="auto" style={{ display: 'none' }} />
        <audio ref={metroAudioRef} src="/sounds/metro.mp3" loop preload="auto" style={{ display: 'none' }} />
        <audio ref={churchStreetAudioRef} src="/sounds/church street.mp3" loop preload="auto" style={{ display: 'none' }} />
        <Canvas shadows onClick={handleUserInteraction} style={{ width: '100vw', height: '100vh', display: 'block', background: 'white' }}>
          <ScrollControls pages={5} damping={0.01}> {/* much lower damping for very slow scroll */}
            <SheetProvider sheet={animationSheet}>
              <Scene 
                onVideoTrigger={handleVideoTrigger} 
                textRef={textRef} 
                onScrollPositionChange={handleScrollPositionChange}
              />
            </SheetProvider>
          </ScrollControls>
        </Canvas>

        <Lightbox 
          videoIndex={videoIndex} 
          onClose={handleLightboxClose}
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
        />
        <TextOverlay ref={textRef} />

        {/* Centered navigation buttons with fade transitions (visible only when allowed) */}
        <div className={`nav-buttons ${showNavButtons && !isLightboxOpen && !showCredits ? 'visible' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/experience')}>Home</button>
          <button className="nav-button" onClick={() => setShowCredits(true)}>Credits</button>
        </div>

        {/* Remove temporary position indicator from rendering */}
        {/* {showPositionIndicator && !showNavButtons && !showCredits && !isLightboxOpen && (
          <div className="position-indicator">{currentPosition.toFixed(2)}</div>
        )} */}

        {/* Simple Credits lightbox (no gradients) */}
        {showCredits && (
          <div className="lightbox-overlay">
            <div className="credits-box">
              <button className="credits-close" onClick={() => setShowCredits(false)}>×</button>
              <h2>Credits</h2>
              <p>What remains when the song fades? The story of Bangalore music strip</p>

              <h3>Video Interviewed personalities</h3>

              <p>
                <strong>Stanley Carvalho</strong><br/>
                Journalist and Author/Editor-Reuters/Deccan Herald<br/>
                Participant at the Music strip
              </p>

              <p>
                <strong>Kirtana Kumar</strong><br/>
                Indian actor, director, and film-maker, Author<br/>
                Participant/Performer at the Music strip
              </p>

              <p>
                <strong>Gopal Navale</strong><br/>
                Composer/Singer<br/>
                Participant/Performer at the Music strip 
              </p>

              <p>
                <strong>Konarak Reddy</strong><br/>
                Guitarist/Musician<br/>
                Participant/Performer at the Music strip 
              </p>

              <p>
                <strong>C K Meena</strong><br/>
                Journalist and Author- CityTab/Deccan Herald<br/>
                Participant at the Music strip
              </p>

              <p>
                <strong>Gerard Sequira</strong><br/>
                Web Designer<br/>
                Participant at the Music strip
              </p>

              <p>
                <strong>John Mathew</strong><br/>
                Designer<br/>
                Close friend of the organiser of the Music strip
              </p>

              <p>
                <strong>Harish Chouthoy</strong><br/>
                Guitarist/Musician<br/>
                Participant/Performer at the Music strip 
              </p>

              <p>
                <strong>Viroj Suvarna</strong><br/>
                Owner of Take 5, Indira Nagar-Bangalore, Goa<br/>
                Participant at the Music strip 
              </p>

              <p>
                <strong>Raman Iyer</strong><br/>
                Saxophonist/Musician<br/>
                Participant/Performer at the Music strip 
              </p>

              <p>
                <strong>No Neighbours around</strong><br/>
                Rock band,Bangalore- Vignesh Siva, Vikas Gotla and Vishwesh Siva 
              </p>

              <p><strong>Research, Documentation and Design Development  :</strong> Anjal B, Science Gallery Bengaluru</p>

              <p><strong>Web experience Design:</strong> Anjal B, Amal Dev Chandran</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MusicStrip;
