import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoFrame from './PhotoFrame'
import { Html } from '@react-three/drei'
import React from 'react'
import { useGlobalAudio } from './GlobalAudioContext.jsx'

const Experience = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Use global audio context instead of local audio
  const { updateVolumeForPage, toggleMute, isMuted } = useGlobalAudio();

  // TV zoom state
  const [isZoomed, setIsZoomed] = useState(false);

  // Music strip hover state
  const [isMusicStripHovered, setIsMusicStripHovered] = useState(false);

  // Fixed values for Intro TV Video (from Leva controls - final values)
  const videoConfig = {
    x: 30, // px offset (from Leva)
    y: -52, // px offset (from Leva)
    width: 14.0, // vw (from Leva)
    height: 19.2, // vh (from Leva)
    scale: 1.13, // scale factor (from Leva)
    volume: 1.00, // audio volume (from Leva)
    objectFit: 'cover',
  };

  // Fixed values for B0 layer
  const b0Controls = {
    b0Scale: 0.93,
    b0X: -423,
    b0Y: -314,
    b0ParallaxX: 50.0,
    b0ParallaxY: 50.0,
    b0Opacity: 1.00,
  };

  // Fixed values for Text Layer (restored for visibility)
  const textControls = {
    textX: 73,
    textY: 16,
    textScale: 0.68,
    textParallaxX: 11.0,
    textParallaxY: 11.2,
    textFontSize: 24,
    textColor: '#000000',
    textOpacity: 1.00,
    textFontWeight: 100,
    textMaxWidth: 600,
  };
  const textContent = 'Click to start the stroll\nthrough the memories';

  // Original values for all parallax layers
  const b1Controls = {
    b1Scale: 1.6,
    b1X: 15,
    b1Y: -95,
    b1ParallaxX: 0,
    b1ParallaxY: 0,
    b1Opacity: 1.0,
  }

  const b2Controls = {
    b2Scale: 1.15,
    b2X: -27,
    b2Y: -29, // Fixed value
    b2ParallaxX: 1,
    b2ParallaxY: 1,
    b2Opacity: 1.0,
  }

  // Fixed values for B3 layer (restored for visibility)
  const b3Controls = {
    b3Scale: 0.8,
    b3X: -160,
    b3Y: 91,
    b3ParallaxX: 2,
    b3ParallaxY: 2,
    b3Opacity: 1.0,
  }

  // Responsive values for PhotoFrame and video
  const groupScale = 0.33;
  const globalX = 0.69;
  const globalY = 0.32;

  // Original MusicStrip Button values from Leva panel
  const musicBtnStyle = {
    width: 252,
    height: 480,
    position: 'absolute',
    left: 220,
    top: 0,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    borderRadius: 12,
    zIndex: 15,
    cursor: 'pointer',
    fontFamily: 'Helvetica Neue',
    fontWeight: 100,
    fontSize: 18,
    transition: 'color 0.2s',
    pointerEvents: 'auto',
  };

  // Original TV Button values (from Leva controls)
  const rectButtonControls = {
    width: 340,
    height: 250,
    x: 585,
    y: 230,
    backgroundColor: '#ff6b6b',
    borderColor: '#000000',
    borderWidth: 0,
    borderRadius: 0,
    opacity: 0.0, // Made invisible
    text: 'TV',
    textColor: '#ffffff',
    fontSize: 16,
  };

  // Original zoom transition values (from Leva controls)
  const zoomControls = {
    zoomScale: 5.0,
    zoomCenterX: 15,
    zoomCenterY: -425,
    transitionDuration: 2600,
    targetLayerOpacity: 0.1,
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1)
  }

  const handleImageError = (imageName) => {
    console.error(`Failed to load image: ${imageName}`)
    console.error(`Full path attempted: /parallax/${imageName}`)
    setHasError(true)
  }

  // Set lower volume for Experience page when component mounts
  useEffect(() => {
    updateVolumeForPage('experience');
  }, [updateVolumeForPage]);

  // Handle mute/unmute using global audio
  const handleMuteToggle = () => {
    toggleMute();
  };

  // Handle TV button click for zoom
  const handleTVClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsZoomed(!isZoomed);
    console.log('TV Button clicked! Zoom:', !isZoomed);
  };

  // Handle Music Strip button click - simple navigation
  const handleMusicStripClick = (e) => {
    console.log('Music Strip Button clicked!');
    e.stopPropagation();
    navigate('/musicstrip');
  };

  // Handle Music Strip hover states
  const handleMusicStripMouseEnter = () => {
    console.log('Music Strip Button hover enter');
    setIsMusicStripHovered(true);
  };

  const handleMusicStripMouseLeave = () => {
    console.log('Music Strip Button hover leave');
    setIsMusicStripHovered(false);
  };

  // Handle click outside to close zoom
  const handleContainerClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
      console.log('Clicked outside - closing zoom');
    }
  };

  return (
    <div 
      className="experience-container"
      style={{
        transform: isZoomed 
          ? `translate(${-zoomControls.zoomCenterX}px, ${-zoomControls.zoomCenterY}px) scale(${zoomControls.zoomScale})`
          : 'translate(0px, 0px) scale(1)',
        transition: isZoomed 
          ? `transform ${zoomControls.transitionDuration}ms ease-in-out`
          : `transform ${zoomControls.transitionDuration}ms ease-out`,
        transformOrigin: 'center center',
        background: '#1a1a1a', // Consistent background color
      }}
      onClick={handleContainerClick}
    >
      {/* Volume Button - Ultra Minimal UI */}
      <button
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          width: 28,
          height: 28,
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          zIndex: 1000,
          transition: 'all 0.15s ease',
          backdropFilter: 'blur(8px)',
          color: 'rgba(255, 255, 255, 0.8)',
        }}
        onClick={handleMuteToggle}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          e.target.style.color = 'rgba(255, 255, 255, 1)';
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          e.target.style.background = 'transparent';
        }}
      >
        {isMuted ? '×' : '○'}
      </button>

      {/* Music Strip Button */}
      <button
        className="musicstrip-btn"
        style={musicBtnStyle}
        onClick={handleMusicStripClick}
        onMouseEnter={handleMusicStripMouseEnter}
        onMouseLeave={handleMusicStripMouseLeave}
      >
        {/* No text, button is empty for UI/interaction only */}
      </button>

      {/* TV Button with Leva Controls */}
      <button
        style={{
          position: 'absolute',
          width: `${rectButtonControls.width}px`,
          height: `${rectButtonControls.height}px`,
          left: `${rectButtonControls.x}px`,
          top: `${rectButtonControls.y}px`,
          backgroundColor: rectButtonControls.backgroundColor,
          border: `${rectButtonControls.borderWidth}px solid ${rectButtonControls.borderColor}`,
          borderRadius: `${rectButtonControls.borderRadius}px`,
          opacity: rectButtonControls.opacity,
          color: rectButtonControls.textColor,
          fontSize: `${rectButtonControls.fontSize}px`,
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          fontWeight: '400',
          cursor: 'pointer',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          pointerEvents: 'auto',
        }}
        onClick={handleTVClick}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        {rectButtonControls.text}
      </button>

      {/* Debug Info - Removed position indicator */}


      {/* B0 Layer (behind B1) */}
      <div 
        className="parallax-layer layer-b0"
        style={{
          transform: `translate(${b0Controls.b0X + mousePos.x * b0Controls.b0ParallaxX}px, ${b0Controls.b0Y + mousePos.y * b0Controls.b0ParallaxY}px) scale(${b0Controls.b0Scale})`,
          opacity: isZoomed ? zoomControls.targetLayerOpacity : b0Controls.b0Opacity,
          zIndex: 0,
          pointerEvents: 'none',
          transition: isZoomed 
            ? `opacity ${zoomControls.transitionDuration}ms ease-in-out`
            : 'opacity 0ms',
            position: 'absolute',
        }}
      >
        <img 
          src="/parallax/B0.jpg"
          alt="B0 Layer" 
          onLoad={handleImageLoad}
          onError={() => handleImageError('B0.jpg')}
        />
      </div>

      {/* Text Layer (hover text and creative UI) */}
      <div 
        className="parallax-layer layer-text"
        style={{
          transform: `translate(${textControls.textX + mousePos.x * textControls.textParallaxX}px, ${textControls.textY + mousePos.y * textControls.textParallaxY}px) scale(${textControls.textScale})`,
          opacity: isMusicStripHovered ? textControls.textOpacity : 0,
          zIndex: 2, // In front of B1 layer
          position: 'absolute',
          color: textControls.textColor,
          fontSize: `${textControls.textFontSize}px`,
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          fontWeight: textControls.textFontWeight,
          textAlign: 'center',
          lineHeight: '1.4',
          maxWidth: `${textControls.textMaxWidth}px`,
          pointerEvents: 'none',
          transition: isMusicStripHovered 
            ? 'opacity 0.4s ease-in'
            : 'opacity 0.4s ease-out',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
          whiteSpace: 'pre-line',
        }}
      >
        {textContent}
        
        {/* Creative UI Elements - Simple & Minimal */}
        <div 
          style={{
            marginTop: '15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
          }}
        >
          {/* Minimal Text Button */}
          <div 
            style={{
              padding: '8px 16px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '300',
              border: '1px solid #333',
              borderRadius: '2px',
              opacity: isMusicStripHovered ? 1 : 0,
              transform: isMusicStripHovered ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.4s ease',
              background: 'transparent',
            }}
          >
            START
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        button, .musicstrip-btn {
          cursor: pointer !important;
        }
        
        /* Ensure proper scrolling behavior */
        .experience-container {
          box-sizing: border-box;
        }
        
        .experience-container::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        .experience-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .experience-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
        }
        
        .experience-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* Background Layer (B1.png) */}
      <div 
        className="parallax-layer layer-back"
        style={{
          transform: `translate(${b1Controls.b1X + mousePos.x * b1Controls.b1ParallaxX}px, ${b1Controls.b1Y + mousePos.y * b1Controls.b1ParallaxY}px) scale(${b1Controls.b1Scale})`,
          opacity: isZoomed ? zoomControls.targetLayerOpacity : b1Controls.b1Opacity,
          zIndex: 1,
          pointerEvents: 'none',
          transition: isZoomed 
            ? `opacity ${zoomControls.transitionDuration}ms ease-in-out`
            : 'opacity 0ms',
            position: 'absolute',
        }}
      >
        <img 
          src="/parallax/B1.png" 
          alt="Background Layer" 
          onLoad={handleImageLoad}
          onError={() => handleImageError('B1.png')}
        />
      </div>


      {/* Middle Layer (B2.png) */}
      <div 
        className="parallax-layer layer-middle"
        style={{
          transform: `translate(${b2Controls.b2X + mousePos.x * b2Controls.b2ParallaxX}px, ${b2Controls.b2Y + mousePos.y * b2Controls.b2ParallaxY}px) scale(${b2Controls.b2Scale})`,
          opacity: b2Controls.b2Opacity,
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {/* Video background behind B2 image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0, // Video is behind B2 image
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <video
            autoPlay
            loop
            muted={isMuted} // Respect the global mute state
            playsInline
            className="background-video b2-video"
            style={{
              position: 'absolute',
              top: `calc(50% + ${videoConfig.y}px)`,
              left: `calc(50% + ${videoConfig.x}px)`,
              width: `${videoConfig.width}vw`,
              height: `${videoConfig.height}vh`,
              transform: `translate(-50%, -50%) scale(${videoConfig.scale})`,
              objectFit: videoConfig.objectFit,
              zIndex: 0,
              pointerEvents: 'auto', // allow video to play
              background: 'black',
            }}
            volume={videoConfig.volume}
            onLoadedData={e => { 
              e.target.play(); 
              e.target.volume = videoConfig.volume;
              console.debug('Video loaded with audio:', '/video/tvintro.webm', 'Volume:', videoConfig.volume) 
            }}
          >
            <source src="/video/tvintro.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* B2 image above video */}
        <img 
          src="/parallax/B2.png" 
          alt="Middle Layer" 
          onLoad={handleImageLoad}
          onError={() => handleImageError('B2.png')}
          style={{ position: 'relative', zIndex: 1 }}
        />
      </div>


      {/* Front Layer (B3.png - closest) */}
      <div 
        className="parallax-layer layer-front"
        style={{
          transform: `translate(${b3Controls.b3X + mousePos.x * b3Controls.b3ParallaxX}px, ${b3Controls.b3Y + mousePos.y * b3Controls.b3ParallaxY}px) scale(${b3Controls.b3Scale})`,
          opacity: isZoomed ? zoomControls.targetLayerOpacity : b3Controls.b3Opacity,
          zIndex: 1,
          pointerEvents: 'none',
          transition: isZoomed 
            ? `opacity ${zoomControls.transitionDuration}ms ease-in-out`
            : 'opacity 0ms',
            position: 'absolute',
        }}
      >
        <img 
          src="/parallax/B3.png" 
          alt="Front Layer" 
          onLoad={handleImageLoad}
          onError={() => handleImageError('B3.png')}
        />
      </div>



      {/* Photo Frames */}
      <div>
        {[...Array(15)].map((_, idx) => (
          <PhotoFrame key={idx + 1} id={idx + 1} globalX={globalX} globalY={globalY} groupScale={groupScale} />
        ))}
      </div>

      {/* Content overlay for future frame positioning */}
      <div className="content-overlay" style={{ pointerEvents: 'none' }}>
        {/* Photo frames will be positioned here */}
      </div>
    </div>
  )
}

export default Experience