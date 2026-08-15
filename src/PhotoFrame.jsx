import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useState, Suspense, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { photoFrameData } from './photoFrameData'
import Lightbox3D from './Lightbox3D'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom';
import { getAssetPath } from './utils/assetPath'

// Individual Frame Component with clickable box
function Frame({ id, position, scale, onClick, showClickableArea }) {
  const { scene } = useGLTF(getAssetPath(`/models/p${id}.glb`))
  const [isHovered, setIsHovered] = useState(false)
  // Clickable box computed from the model's own raw geometry bounding box, so it always
  // matches the visible picture exactly regardless of how big any individual model's raw
  // geometry happens to be - both the hitbox and the visible primitive apply the SAME
  // `scale` multiplier to the SAME source geometry, so they stay in lockstep by
  // construction. (An earlier attempt at this looked broken in real-browser testing, but
  // that testing was corrupted by a since-fixed bug where the whole scene was
  // accidentally mounted 15 times over - this should actually work now.)
  const [boxSize, setBoxSize] = useState([1, 1, 0.2])
  const [boxCenter, setBoxCenter] = useState([0, 0, 0])

  useEffect(() => {
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    // Shrink the hitbox somewhat from the model's full raw bounding box: frames are
    // packed closely enough on the wall that some models' raw geometry is wide enough
    // for the hitbox to bleed into a neighboring frame's space at full size.
    const shrink = 0.7
    setBoxSize([(size.x || 1) * shrink, (size.y || 1) * shrink, Math.max(size.z, 0.05)])
    setBoxCenter([center.x, center.y, center.z])
  }, [scene])

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(id);
  };

  // Calculate the effective scale - 1.2x for any frame when hovered, 1x otherwise
  const effectiveScale = isHovered ? scale * 1.2 : scale;

  return (
    <group position={position}>
      {/* Main clickable area - wrapped in a group with the same rotation/scale as the
          model, so the box (positioned/sized in the model's own raw local space) lands
          exactly on top of the visible frame regardless of scale. Uses the base `scale`
          (not the hover-inflated effectiveScale) so the hitbox itself doesn't jump size
          on hover. */}
      <group position={[0, 0, 0.1]}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={[scale, scale, scale]}>
          <mesh
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
              setIsHovered(true)
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'auto'
              setIsHovered(false)
            }}
            position={boxCenter}
          >
            <boxGeometry args={boxSize} />
            <meshBasicMaterial
              transparent
              opacity={showClickableArea ? 0.3 : 0}
              color={showClickableArea ? "cyan" : "cyan"}
            />
          </mesh>
        </group>
      </group>

      {/* The actual frame model */}
      <primitive
        object={scene.clone()}
        scale={[effectiveScale, effectiveScale, effectiveScale]}
        rotation={[Math.PI / 2, 0, 0]} // Default: flat
      />
    </group>
  )
}

const PhotoFrameContainer = ({ globalX = 1, globalY = -1, groupScale = 0.74, stageScale = 1 }) => {
  const [selectedFrame, setSelectedFrame] = useState(null)
  const navigate = useNavigate();

  const showClickableArea = true; // TEMP debug - re-checking alignment now that the 15x-canvas bug is fixed

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
            // NOTE: tried making this scale-aware (zoom: 4 * stageScale) to compensate for
            // a suspected canvas-sizing mismatch at non-1:1 stage scale. Real-browser
            // testing showed that made things worse (new visual shift, still unresponsive
            // in both Safari and Firefox), so reverted to the original fixed value pending
            // real diagnostic data instead of further guessing.
            zoom: 4
          }}
          // r3f measures this element's size (via a ResizeObserver-based hook) to set up
          // both the WebGL drawing buffer AND the camera frustum. A percentage size (100%)
          // makes that measurement depend on the parent's layout resolving first, which is
          // asynchronous and was observed taking multiple seconds (canvas stuck at the
          // browser's 300x150 default the whole time - no working raycasts until it
          // resolved). This box is always exactly 1512x982 in its own layout space
          // regardless of viewport (the ancestor's CSS transform handles all visual
          // scaling separately), so sizing it with fixed pixel values removes that
          // dependency entirely.
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1512,
            height: 982,
            zIndex: 2
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          
          <Suspense fallback={null}>
            {/* Group scaling: scale all positions and models together, keeping spacing consistent */}
            {framePositions.map((frame) => {
              return (
                <Frame
                  key={frame.id}
                  id={frame.id}
                  position={[frame.x * groupScale + globalX, frame.y * groupScale + globalY, frame.z]}
                  scale={frame.scale * groupScale}
                  onClick={handleFrameClick}
                  showClickableArea={showClickableArea}
                />
              )
            })}
          </Suspense>
          
          {/* Orbit controls removed - camera is now locked */}
        </Canvas>
      </div>

      {/* Lightbox - portaled to document.body so its `position:fixed` overlay is
          contained by the real viewport, not by the stage's scaled/transformed ancestor
          (a transform on an ancestor makes fixed-position descendants size/position
          relative to that ancestor's box instead of the viewport). */}
      {selectedFrame && createPortal(
        <Lightbox3D
          frameId={selectedFrame}
          frameData={photoFrameData[selectedFrame]}
          onClose={closeLightbox}
          onNavigate={navigateFrame}
        />,
        document.body
      )}
    </>
  )
}

// Preload all GLB files
for (let i = 1; i <= 15; i++) {
  useGLTF.preload(getAssetPath(`/models/p${i}.glb`))
}

export default PhotoFrameContainer