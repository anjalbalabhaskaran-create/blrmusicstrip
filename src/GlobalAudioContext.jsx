import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const AudioContext = createContext();

export const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
};

export const GlobalAudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume
  const [currentPage, setCurrentPage] = useState('loader');

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      console.log('🎵 Initializing global audio with: /music/Intro music.m4a');
      audioRef.current = new Audio('/music/Intro music.m4a'); // Changed from bg.m4a to Intro music.m4a
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      
      // Add event listeners for debugging
      audioRef.current.addEventListener('loadstart', () => console.log('🎵 Global Audio: Load started'));
      audioRef.current.addEventListener('canplay', () => console.log('🎵 Global Audio: Can play Intro music.m4a'));
      audioRef.current.addEventListener('error', (e) => console.error('🎵 Global Audio Error:', e));
    }
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      console.log(`🔊 Volume updated to: ${volume} for page: ${currentPage}`);
    }
  }, [volume, currentPage]);

  // Update mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const playAudio = async () => {
    if (audioRef.current && !isPlaying) {
      try {
        console.log('🎵 Attempting to play Intro music.m4a...');
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('🎵 Intro music.m4a playing successfully');
      } catch (error) {
        console.warn('⚠️ Could not play intro music (likely autoplay restriction):', error);
        // On first user interaction, try again
        const tryAgainOnInteraction = () => {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            console.log('🎵 Intro music.m4a started after user interaction');
            document.removeEventListener('click', tryAgainOnInteraction);
            document.removeEventListener('keydown', tryAgainOnInteraction);
          }).catch(e => console.warn('Still cannot play:', e));
        };
        document.addEventListener('click', tryAgainOnInteraction, { once: true });
        document.addEventListener('keydown', tryAgainOnInteraction, { once: true });
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('⏸️ Intro music.m4a paused');
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const setVolumeLevel = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  };

  // Set volume based on current page
  const updateVolumeForPage = (page) => {
    setCurrentPage(page);
    console.log(`📄 Page changed to: ${page}`);
    switch (page) {
      case 'loader':
      case 'intro2':
      case 'intro3':
        console.log(`🎵 Playing Intro music.m4a for ${page} at volume 0.7`);
        setVolumeLevel(0.7); // Normal volume for intro pages
        playAudio(); // Ensure audio is playing
        break;
      case 'experience':
        console.log(`🎵 Playing Intro music.m4a for experience at volume 0.2`);
        setVolumeLevel(0.2); // Much lower volume for experience page
        playAudio(); // Ensure audio is playing
        break;
      case 'musicstrip':
        console.log(`⏹️ Stopping Intro music.m4a for music strip (bg.m4a will play there)`);
        pauseAudio(); // Stop intro music on music strip
        break;
      default:
        setVolumeLevel(0.7);
    }
  };

  const value = {
    playAudio,
    pauseAudio,
    toggleMute,
    setVolumeLevel,
    updateVolumeForPage,
    isPlaying,
    isMuted,
    volume,
    currentPage,
    audioRef
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
