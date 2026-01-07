import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PhotoFrameLightbox = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Handler for clicking the background to close the lightbox
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('lightbox-bg')) {
      navigate(-1);
    }
  };

  return (
    <div
      className="lightbox-bg"
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
        overflow: 'hidden',
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
        }}
      />
      <div
        style={{
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          padding: 24,
          maxWidth: '40vw',
          maxHeight: '40vh',
          width: '40vw',
          height: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{color: 'red', fontWeight: 'bold', marginBottom: 8}}>LIGHTBOX MODAL</div>
        {/* Replace with your GLB viewer for photoframe P{id} */}
        <span style={{fontSize: 24, color: '#222'}}>PhotoFrame {id} (GLB Viewer Here)</span>
      </div>
    </div>
  );
};

export default PhotoFrameLightbox;
