// Lightbox.jsx - Simple video lightbox
import React from 'react';
import './Lightbox.css';

const Lightbox = ({ videoIndex, onClose, onVideoPlay, onVideoPause }) => {
  console.log(`🔍 Lightbox received videoIndex: ${videoIndex}`);
  
  if (!videoIndex) return null;

  // Participant data for each video/location - simplified names only
  const participantData = {
    1: "Stanley Carvalho, Gopal Navale, Gerard Sequira, C K Meena, Harish Chouthoy - A glimpse into how Anglo-Indian social culture and hippie culture influences shaped Bangalore’s early relationship with Western music, dance, and artistic freedom.",
    2: "Kirtana Kumar, Konarak Reddy - Set during the period of the Emergency, this story brings together the music piece Prison Diaries, composed and performed by Konarak Reddy and narrated by Kirtana Kumar. Dedicated to Konarak’s mother, Snehalata Reddy, the composition reflects her experiences in Central Jail. Personal accounts by Kirtana Kumar and Konarak Reddy further explore how life and art mirror each other in response to the same incident.",
    3: "John Mathew, Gerard Sequira - Tracing the moment when an idea turned into action, this story follows the journey of Sun Beam Motha,one of the organiser of the music strip,whose road trip to Germany lead to early sparks that led to the formation of the Bangalore Music Strip as a public, musician-led space. ",
    4: "Gopal Navale, Gerard Sequira, Stanley Carvalho, Kirtana Kumar, C. K. Meena, Harish Chouthoy, Konarak Reddy - An account of ingenuity and DIY spirit, when musicians repurposed everyday objects to power performances in the absence of formal infrastructure.",
    5: "C. K. Meena - A personal memory of C K Meena of how she lost her guitar at the music strip.",
    6: "Gopal Navale, Harish Chouthoy, Gerard Sequira, Stanley Carvalho, Viroj Suvarna, Konarak Reddy, Kirtana Kumar - As the Music Strip faded from physical space due to various reasons, it grew in memory—becoming a small step that influenced later music movements across the city.",
    7: "Gerard Sequira, Gopal Navale - From moments of rare harmony between musicians and authority when police commissioner H T Sangliana vibed with the music strip  to crackdown and lathi charge at freedom charge, this story captures the fragile balance between freedom and control in public space.",
    8: "Raman Iyer, Stanley Carvalho, No Neighbours Around, Gopal Navale, Harish Chouthoy, Konarak Reddy, Kirtana Kumar, Gerard Sequira - A reflection on how grassroots, community-driven music spaces gradually gave way to sponsored events, raising questions about access, ownership, and creative autonomy."
  };

  // Vimeo links for tvintro, P1-P8
  const vimeoLinks = {
    'tvintro': "https://vimeo.com/1140284080?fl=ip&fe=ec",
    1: "https://vimeo.com/1140283273?fl=ip&fe=ec",
    2: "https://vimeo.com/1140283414?fl=ip&fe=ec",
    3: "https://vimeo.com/1140283468?fl=ip&fe=ec",
    4: "https://vimeo.com/1140283547?fl=ip&fe=ec",
    5: "https://vimeo.com/1140283694?fl=ip&fe=ec",
    6: "https://vimeo.com/1140283758?fl=ip&fe=ec",
    7: "https://vimeo.com/1140283914?fl=ip&fe=ec",
    8: "https://vimeo.com/1140283972?fl=ip&fe=ec"
  };

  // Determine if videoIndex is a direct path (string) or a number
  const isDirectPath = typeof videoIndex === 'string';

  // For participant band and vimeo, extract the number if videoIndex is a direct path like '/video/1.webm'
  let participantKey = videoIndex;
  let vimeoKey = 'tvintro';
  if (typeof videoIndex === 'number' && vimeoLinks[videoIndex]) {
    vimeoKey = videoIndex;
    participantKey = videoIndex;
  } else if (isDirectPath) {
    const match = videoIndex.match(/(\d+)\.webm$/);
    if (match && vimeoLinks[parseInt(match[1], 10)]) {
      vimeoKey = parseInt(match[1], 10);
      participantKey = parseInt(match[1], 10);
    }
  } else if (videoIndex === 'tvintro') {
    vimeoKey = 'tvintro';
  }
  const participants = participantData[participantKey] || "";
  const vimeoUrl = vimeoLinks[vimeoKey] || vimeoLinks['tvintro'];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleVideoPlay = () => {
    console.log('🎬 Video started playing in lightbox');
    if (onVideoPlay) onVideoPlay();
  };

  const handleVideoPause = () => {
    console.log('🎬 Video paused in lightbox');
    if (onVideoPause) onVideoPause();
  };

  const handleVideoEnded = () => {
    console.log('🎬 Video ended in lightbox');
    if (onVideoPause) onVideoPause();
  };

  // Improved split logic for names and description
  let names = '';
  let description = '';
  if (participants) {
    // Try splitting by newline first
    let parts = participants.split(/\n|\r/);
    if (parts.length < 2) {
      // If no newline, try splitting by dash
      parts = participants.split(/\s+-\s+/);
    }
    if (parts.length < 2) {
      // If still no split, try splitting by period followed by space
      parts = participants.split(/\.\s+/);
    }
    names = parts[0].trim();
    description = parts.slice(1).join(' ').trim();
  }

  return (
    <div className="lightbox-overlay" onClick={handleBackdropClick}>
      <div className="lightbox-container">
        <div className="lightbox-video" style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden'}}>
          <iframe
            src={vimeoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
            title="Vimeo video player"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
          ></iframe>
        </div>
        {/* Simple horizontal band with participant text and description */}
        {participants && (
          <div className="participants-band">
            <div className="band-content">
              <div className="text-line" style={{fontSize: '16px', fontWeight: 500}}>
                Interviewed personalities: {names}
              </div>
              {description && (
                <div className="description-line" style={{fontSize: '13px', color: '#fff'}}>
                  {description}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <button className="lightbox-close" onClick={onClose}>✕</button>
    </div>
  );
};

export default Lightbox;
