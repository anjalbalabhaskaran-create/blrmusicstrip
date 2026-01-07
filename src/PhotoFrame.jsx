import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useState, Suspense, useEffect, useRef } from 'react'
import { photoFrameData } from './photoFrameData'
import Lightbox3D from './Lightbox3D'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom';

// Individual Frame Component with clickable box
function Frame({ id, position, scale, onClick, clickableWidth, clickableHeight, clickableDepth, clickableOffsetX, clickableOffsetY, showClickableArea }) {
  const { scene } = useGLTF(`/models/p${id}.glb`)
  const [isHovered, setIsHovered] = useState(false)
  
  console.log(`Rendering frame ${id} at position:`, position, `scale:`, scale); // Debug log
  
  const handleClick = (e) => {
    console.log(`Photo frame ${id} clicked!`); // Debug log
    e.stopPropagation();
    onClick(id);
  };

  // Calculate the effective scale - 1.2x for any frame when hovered, 1x otherwise
  const effectiveScale = isHovered ? scale * 1.2 : scale;

  return (
    <group position={position}>
      {/* Main clickable area - properly dimensioned for each frame with X/Y offset */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setIsHovered(true)
          console.log(`Frame ${id} hovered - scaling up to 1.2x`);
          console.log(`Hovering over frame ${id}, dimensions: ${clickableWidth.toFixed(2)} x ${clickableHeight.toFixed(2)}, offset: ${clickableOffsetX.toFixed(2)}, ${clickableOffsetY.toFixed(2)}`);
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'auto'
          setIsHovered(false)
          console.log(`Frame ${id} unhovered - scaling back to 1x`);
        }}
        position={[clickableOffsetX, clickableOffsetY, 0.1]} // Apply X/Y offset and slightly in front of frame
      >
        <boxGeometry args={[clickableWidth, clickableHeight, clickableDepth]} />
        <meshBasicMaterial 
          transparent 
          opacity={showClickableArea ? 0.3 : 0} 
          color={showClickableArea ? "cyan" : "cyan"} 
        />
      </mesh>
      
      {/* The actual frame model */}
      <primitive 
        object={scene.clone()} 
        scale={[effectiveScale, effectiveScale, effectiveScale]}
        rotation={[Math.PI / 2, 0, 0]} // Default: flat
      />
    </group>
  )
}

const PhotoFrameContainer = ({ globalX = 1, globalY = -1, groupScale = 0.74 }) => {
  const [selectedFrame, setSelectedFrame] = useState(null)
  const navigate = useNavigate();
  
  // Fixed: Hide clickable areas (no more Leva control)
  const showClickableArea = false;
  
  // Fixed controls for frames 1, 2, and 3 (removed from Leva) - using current Leva values
  const frame1Controls = {
    f1_x: 0.0,
    f1_y: 0.0,
    f1_width: 1.7,
    f1_height: 1.1,
    f1_depth: 0.2,
    f1_scale: 1.0,
  }
  
  const frame2Controls = {
    f2_x: 0.0,
    f2_y: 0.0,
    f2_width: 2.1,
    f2_height: 1.4,
    f2_depth: 0.2,
    f2_scale: 1.0,
  }
  
  const frame3Controls = {
    f3_x: 0.0,
    f3_y: 0.0,
    f3_width: 1.7,
    f3_height: 1.1,
    f3_depth: 0.1,
    f3_scale: 1.0,
  }
  
  // Remaining Leva controls for frames 4-15
  const frame4Controls = {
    f4_x: 0.1,
    f4_y: 0.1,
    f4_width: 2.4,
    f4_height: 1.5,
    f4_depth: 0.2,
    f4_scale: 1.0,
  }
  
  const frame5Controls = {
    f5_x: 0.0,
    f5_y: 0.0,
    f5_width: 1.9,
    f5_height: 1.2,
    f5_depth: 0.2,
    f5_scale: 1.0,
  }
  
  const frame6Controls = {
    f6_x: 0.0,
    f6_y: 0.0,
    f6_width: 1.7,
    f6_height: 1.1,
    f6_depth: 0.2,
    f6_scale: 1.0,
  }
  
  // Remaining Leva controls for frames 7-15
  const frame7Controls = {
    f7_x: 0.0,
    f7_y: 0.0,
    f7_width: 1.4,
    f7_height: 1.7,
    f7_depth: 0.2,
    f7_scale: 1.0,
  }
  
  const frame8Controls = {
    f8_x: 0.0,
    f8_y: 0.0,
    f8_width: 1.8,
    f8_height: 0.9,
    f8_depth: 0.2,
    f8_scale: 1.0,
  }
  
  const frame9Controls = {
    f9_x: 0.0,
    f9_y: 0.0,
    f9_width: 1.8,
    f9_height: 0.9,
    f9_depth: 0.2,
    f9_scale: 1.0,
  }
  
  // Remaining Leva controls for frames 10-15
  const frame10Controls = {
    f10_x: 0.0,
    f10_y: 0.0,
    f10_width: 1.7,
    f10_height: 2.5,
    f10_depth: 0.2,
    f10_scale: 1.0,
  }
  
  const frame11Controls = {
    f11_x: 0.0,
    f11_y: 0.0,
    f11_width: 1.4,
    f11_height: 2.0,
    f11_depth: 0.2,
    f11_scale: 1.0,
  }
  
  const frame12Controls = {
    f12_x: 0.0,
    f12_y: 0.0,
    f12_width: 1.1,
    f12_height: 1.5,
    f12_depth: 0.2,
    f12_scale: 1.0,
  }
  
  // All frames now use fixed controls (no more Leva)
  const frame13Controls = {
    f13_x: 0.0,
    f13_y: 0.1,
    f13_width: 0.9,
    f13_height: 1.2,
    f13_depth: 0.2,
    f13_scale: 1.0,
  }
  
  const frame14Controls = {
    f14_x: -0.1,
    f14_y: 0.0,
    f14_width: 1.8,
    f14_height: 0.7,
    f14_depth: 0.2,
    f14_scale: 1.0,
  }
  
  const frame15Controls = {
    f15_x: 0.0,
    f15_y: 0.0,
    f15_width: 2.4,
    f15_height: 1.1,
    f15_depth: 0.2,
    f15_scale: 1.0,
  }
  
  // Function to get frame-specific controls
  const getFrameControls = (frameId) => {
    const controlsMap = {
      1: frame1Controls,
      2: frame2Controls,
      3: frame3Controls,
      4: frame4Controls,
      5: frame5Controls,
      6: frame6Controls,
      7: frame7Controls,
      8: frame8Controls,
      9: frame9Controls,
      10: frame10Controls,
      11: frame11Controls,
      12: frame12Controls,
      13: frame13Controls,
      14: frame14Controls,
      15: frame15Controls,
    }
    return controlsMap[frameId]
  }
  
  // Absolute values for 15 frames (with global scale applied)
  const globalScale = 0.52;
  const framePositions = [
    { id: 1, x: -5,  y: 13, z: -15, scale: 0.8 * globalScale },   // p1.glb
    { id: 2, x: 17,  y: 16, z: -15, scale: 1.0 * globalScale },  // p2.glb
    { id: 3, x: 10,  y: 9,  z: -15, scale: 0.8 * globalScale },  // p3.glb
    { id: 4, x: 19,  y: 5,  z: -15, scale: 1.1 * globalScale },  // p4.glb
    { id: 5, x: 24,  y: 13, z: -15, scale: 0.9 * globalScale },  // p5.glb
    { id: 6, x: 17,  y: 11, z: -15, scale: 0.8 * globalScale },  // p6.glb
    { id: 7, x: 3,   y: 14, z: -15, scale: 1.1 * globalScale },  // p7.glb
    { id: 8, x: -4,  y: 17, z: -15, scale: 0.6 * globalScale },  // p8.glb
    { id: 9, x: 9,   y: 13, z: -15, scale: 0.6 * globalScale },  // p9.glb
    { id: 10, x: 28, y: 6,  z: -15, scale: 0.6 * globalScale },  // p10.glb
    { id: 11, x: 15, y: -2, z: -15, scale: 0.5 * globalScale },  // p11.glb
    { id: 12, x: 30, y: 14, z: -15, scale: 0.4 * globalScale },   // p12.glb
    { id: 13, x: 20, y: 0, z: -15, scale: 0.3 * globalScale },    // p13.glb
    { id: 14, x: 11, y: 5, z: -15, scale: 0.2 * globalScale },    // p14.glb
    { id: 15, x: 27, y: -1, z: -15, scale: 0.3 * globalScale },   // p15.glb
  ];

  // Camera distance (was from Leva, now fixed)
  const cameraDistance = 20.0;

  const handleFrameClick = (frameId) => {
    console.log(`Opening lightbox for frame ${frameId}`); // Debug log
    setSelectedFrame(frameId)
  }

  const closeLightbox = () => {
    setSelectedFrame(null)
  }

  const navigateFrame = (frameId) => {
    setSelectedFrame(frameId)
  }

  return (
    <>
      <div className="photo-frame-container">
        <Canvas
          camera={{
            position: [0, 0, cameraDistance], // Center camera for front elevation
            near: 0.1,
            far: 1000,
            orthographic: true,
            zoom: 4 // Lower zoom to make frames visible
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          
          <Suspense fallback={null}>
            {/* Group scaling: scale all positions and models together, keeping spacing consistent */}
            {framePositions.map((frame) => {
              const controls = getFrameControls(frame.id)
              const widthKey = `f${frame.id}_width`
              const heightKey = `f${frame.id}_height`
              const depthKey = `f${frame.id}_depth`
              const scaleKey = `f${frame.id}_scale`
              const xKey = `f${frame.id}_x`
              const yKey = `f${frame.id}_y`
              
              return (
                <Frame
                  key={frame.id}
                  id={frame.id}
                  position={[frame.x * groupScale + globalX, frame.y * groupScale + globalY, frame.z]}
                  scale={frame.scale * groupScale}
                  onClick={handleFrameClick}
                  clickableWidth={controls[widthKey] * controls[scaleKey]}
                  clickableHeight={controls[heightKey] * controls[scaleKey]}
                  clickableDepth={controls[depthKey] * controls[scaleKey]}
                  clickableOffsetX={controls[xKey]}
                  clickableOffsetY={controls[yKey]}
                  showClickableArea={showClickableArea}
                />
              )
            })}
          </Suspense>
          
          {/* Orbit controls removed - camera is now locked */}
        </Canvas>
      </div>

      {/* Lightbox */}
      {selectedFrame && (
        <Lightbox3D 
          frameId={selectedFrame}
          frameData={photoFrameData[selectedFrame]}
          onClose={closeLightbox}
          onNavigate={navigateFrame}
        />
      )}
    </>
  )
}

// Preload all GLB files
for (let i = 1; i <= 15; i++) {
  useGLTF.preload(`/models/p${i}.glb`)
}

export default PhotoFrameContainer