import React from 'react';
import { useNavigate } from 'react-router-dom';

const photoframeTexts = [
  'Memory 1', 'Memory 2', 'Memory 3', 'Memory 4', 'Memory 5',
  'Memory 6', 'Memory 7', 'Memory 8', 'Memory 9', 'Memory 10',
  'Memory 11', 'Memory 12', 'Memory 13', 'Memory 14', 'Memory 15'
];

const PhotoFrameGallery = () => {
  const navigate = useNavigate();

  // Handler for clicking the background to close the gallery
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('gallery-bg')) {
      navigate('/');
    }
  };

  return (
    <div
      className="gallery-bg"
      onClick={handleBackgroundClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        background: 'none',
      }}
    >
      <img
        src={"/background image/loader background.png"}
        alt="Background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          background: '#fff',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          zIndex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
        }}
      >
        {[...Array(15)].map((_, idx) => (
          <div
            key={idx + 1}
            style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              padding: 24,
              maxWidth: '320px',
              maxHeight: '320px',
              width: '320px',
              height: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Replace below with your GLB viewer for photoframe P{idx+1} */}
            <div style={{width: 120, height: 120, background: '#eee', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#888'}}>
              GLB {idx+1}
            </div>
            <div style={{fontSize: 18, color: '#222', textAlign: 'center'}}>
              {photoframeTexts[idx]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoFrameGallery;
