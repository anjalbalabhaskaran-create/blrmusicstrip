import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getAssetPath } from './utils/assetPath'

// Auto-rotating frame component
function RotatingFrame({ frameId }) {
  const { scene } = useGLTF(getAssetPath(`/models/p${frameId}.glb`))
  const meshRef = useRef()
  const [calculatedScale, setCalculatedScale] = useState(1.0)

  // Calculate optimal scale based on model dimensions
  useEffect(() => {
    if (scene) {
      // Create a bounding box for the entire scene
      const box = new THREE.Box3().setFromObject(scene)
      const size = box.getSize(new THREE.Vector3())

      // Model dimensions
      const modelWidth = size.x   // Length (X-axis)
      const modelHeight = size.y  // Height (Y-axis)
      const modelDepth = size.z   // Breadth/Depth (Z-axis)

      // 3D viewer dimensions (estimated based on camera settings and FOV)
      // With camera at [0,0,30] and FOV 40°, the visible area dimensions are approximately:
      const viewerWidth = 24    // X-axis extent
      const viewerHeight = 18   // Y-axis extent (considering aspect ratio)
      const viewerDepth = 24    // Z-axis extent

      // Calculate scale factors for each dimension to achieve 90% fill
      const scaleForWidth = (viewerWidth * 0.9) / modelWidth
      const scaleForHeight = (viewerHeight * 0.9) / modelHeight
      const scaleForDepth = (viewerDepth * 0.9) / modelDepth

      // Find which dimension is largest in the model
      const maxModelDimension = Math.max(modelWidth, modelHeight, modelDepth)
      let finalScale

      if (maxModelDimension === modelWidth) {
        // Width is largest, scale based on viewer width
        finalScale = scaleForWidth
      } else if (maxModelDimension === modelHeight) {
        // Height is largest, scale based on viewer height
        finalScale = scaleForHeight
      } else {
        // Depth is largest, scale based on viewer depth
        finalScale = scaleForDepth
      }

      // Clamp the scale to reasonable bounds
      finalScale = Math.max(0.1, Math.min(finalScale, 5.0))

      setCalculatedScale(finalScale)
    }
  }, [scene, frameId])

  // Set initial rotation to show top elevation, then gently tilt in different directions
  // No continuous rotation after opening
  // Animate a gentle tilt using a sine wave
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      meshRef.current.rotation.x = -Math.PI / 2 + Math.sin(t) * 0.02 // tilt up/down (reduced)
      meshRef.current.rotation.y = Math.PI + Math.cos(t * 0.7) * 0.02 // tilt left/right (reduced)
    }
  })

  // Flip the model by scaling X by -1 and apply calculated scale
  return (
    <group position={[0, 0, 0]}>
      <primitive
        ref={meshRef}
        object={scene.clone()}
        scale={[-calculatedScale, calculatedScale, calculatedScale]} // Dynamic scale based on model dimensions
        rotation={[-Math.PI / 2, Math.PI, 0]} // Top elevation rotated 180°
        position={[0, 0, 0]}
      />
    </group>
  )
}

const Lightbox3D = ({ frameId, frameData, onClose, onNavigate }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleContentClick = (e) => {
    // Only close if clicking outside the description panel (right side)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Navigation handlers
  const handlePrevious = () => {
    const prevFrameId = frameId > 1 ? frameId - 1 : 15
    if (onNavigate) onNavigate(prevFrameId)
  }

  const handleNext = () => {
    const nextFrameId = frameId < 15 ? frameId + 1 : 1
    if (onNavigate) onNavigate(nextFrameId)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // Special layout for frames 1, 4, 5, 9, and 10 - full 3D viewer with only title.
  // NOTE: this used to be two separate `return` branches, each with its own <Canvas>.
  // Navigating between a "special" and "regular" frame therefore unmounted one WebGL
  // context and mounted another - repeated browsing through the gallery could leak
  // contexts fast enough to hit a browser's simultaneous-WebGL-context limit (Firefox
  // in particular), causing "WebGL context was lost" and the whole page going
  // unresponsive. Kept as a single render tree with one persistent <Canvas> instead,
  // varying only layout/styling so React never remounts it.
  const isSpecial = frameId === 1 || frameId === 4 || frameId === 5 || frameId === 9 || frameId === 10

  return (
    <div className="lightbox-overlay" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Left Navigation Arrow - Outside lightbox */}
      <button
        onClick={handlePrevious}
        style={{
          position: 'absolute',
          left: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid white',
          color: 'white',
          fontSize: '20px',
          padding: '12px 15px',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 1001
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)'
          e.target.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.8)'
          e.target.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        ←
      </button>

      {/* Right Navigation Arrow - Outside lightbox */}
      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid white',
          color: 'white',
          fontSize: '20px',
          padding: '12px 15px',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 1001
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)'
          e.target.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.8)'
          e.target.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        →
      </button>

      <div className="lightbox-container" onClick={handleContentClick}>
        <div className="lightbox-content" style={isSpecial ? { flexDirection: 'column', height: '100%' } : undefined}>
          {/* 3D viewer + title - same DOM position/type regardless of layout, so the
              Canvas (and its WebGL context) is never unmounted when frameId changes
              between special and regular frames. */}
          <div className={isSpecial ? undefined : 'lightbox-left'}>
            <div className="lightbox-3d" style={isSpecial ? { flex: '9', width: '100%', height: '90%' } : undefined}>
              <Canvas
                camera={{ position: [0, 0, 30], fov: 40 }}
                style={{ width: '100%', height: '100%' }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-5, -5, -5]} intensity={0.3} />

                <Suspense fallback={null}>
                  <RotatingFrame frameId={frameId} />
                </Suspense>

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={false}
                  maxDistance={40}
                  minDistance={5}
                  zoomToCursor={true}
                />
              </Canvas>
            </div>
            <h2 className="lightbox-title">{frameData.title}</h2>
          </div>

          {/* Right Side: Description and Quote - only for the regular layout */}
          {!isSpecial && (
            <div className="lightbox-right" onClick={(e) => e.stopPropagation()}>
              {frameData.isDualContent ? (
                // Dual content layout for frames 11 and 12
                <div className="dual-content-container">
                  <div className="content-section">
                    <p className="lightbox-description">{frameData.description1}</p>
                    <p className="lightbox-description lightbox-quote">- {frameData.quote1}</p>
                  </div>

                  <div className="content-divider"></div>

                  <div className="content-section">
                    <p className="lightbox-description">{frameData.description2}</p>
                    <p className="lightbox-description lightbox-quote">- {frameData.quote2}</p>
                  </div>
                </div>
              ) : (
                // Standard content layout for other frames
                <>
                  <p className="lightbox-description">{frameData.description}</p>
                  <p className="lightbox-description lightbox-quote">{frameData.quote}</p>
                </>
              )}

              <div className="lightbox-meta">
                <span className="frame-id">Frame #{frameId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lightbox3D
