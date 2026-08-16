import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetPath } from './utils/assetPath';

const BeginningLoading = ({ onComplete }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const handleStartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Start button clicked!'); // Debug log
    console.log('onComplete prop:', onComplete); // Debug log
    console.log('navigate function:', navigate); // Debug log
    
    try {
      if (onComplete) {
        console.log('Calling onComplete callback'); // Debug log
        onComplete();
      } else {
        console.log('Navigating to /1loader'); // Debug log
        // Navigate to 1loader page
        navigate('/1loader');
      }
    } catch (error) {
      console.error('Error in handleStartClick:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const elapsed = Date.now() - startTime;
        const minLoadTime = 10000; // 10 seconds minimum
        
        if (prev >= 100 && elapsed >= minLoadTime) {
          clearInterval(interval);
          console.log('Loading complete! Setting isComplete to true'); // Debug log
          setIsComplete(true);
          return 100;
        }
        
        // Calculate progress based on time, but don't exceed 100 until minimum time
        const timeProgress = Math.min((elapsed / minLoadTime) * 100, 100);
        return Math.min(prev + 1, timeProgress);
      });
    }, 100); // Update every 100ms for 10 second duration

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      position: 'relative', // Add relative positioning
    }}>
      {/* Loading Bar Container - Fixed Position */}
      <div style={{
        width: '90vw', // 90% of viewport width
        height: '2px',
        backgroundColor: '#cccccc', // Grey background line
        position: 'absolute', // Fixed absolute position
        top: '50%', // Center vertically
        left: '5vw', // Center horizontally (5% margin on each side)
        transform: 'translateY(-50%)', // Perfect vertical centering
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
          top: '-67px', // Fine-tuned position
          left: `calc(${Math.min(progress, 98)}% - 40px)`, // Stop movement at 98%
          transition: 'left 0.1s ease-out',
          zIndex: 10,
        }}>
          <img
            src={getAssetPath('/video/walkingmusicians.gif')}
            alt="Walking Musicians"
            style={{
              width: '96px', // Increased by 1.2x (80px * 1.2 = 96px)
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      {/* Loading Percentage - Fixed Position */}
      <div style={{
        fontSize: '16px',
        fontWeight: '300',
        color: 'black',
        textAlign: 'center',
        position: 'absolute',
        top: 'calc(50% + 30px)', // Fixed position below progress bar
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        {Math.floor(progress)}%
      </div>

      {/* Start Button - Fixed Position */}
      {isComplete && (
        <div style={{ position: 'absolute', top: 'calc(50% + 80px)', left: '50%', transform: 'translateX(-50%)' }}>
          <button
            onClick={handleStartClick}
            onMouseDown={() => console.log('Button mouse down')}
            onMouseUp={() => console.log('Button mouse up')}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '300',
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              zIndex: 100, // Ensure button is on top
              pointerEvents: 'auto', // Ensure button receives clicks
            }}
            onMouseEnter={(e) => {
              console.log('Button hover enter'); // Debug log
              e.target.style.backgroundColor = '#333';
            }}
            onMouseLeave={(e) => {
              console.log('Button hover leave'); // Debug log
              e.target.style.backgroundColor = 'black';
            }}
          >
            Start
          </button>
          {/* Debug indicator */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: 'red',
            fontWeight: 'bold'
          }}>
            Button Ready
          </div>
        </div>
      )}
    </div>
  );
};

export default BeginningLoading;
