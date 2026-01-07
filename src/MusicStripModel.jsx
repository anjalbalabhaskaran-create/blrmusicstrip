import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import gsap from 'gsap';
// import TreeWorld from './TreeWorld';
import CloudsLayer from './Clouds';

const TARGET_MESHES = ['S1', 'S2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']; // meshes you want to fade
const VIDEO_MESHES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const LOW_RENDER_ORDER_MESHES = [
  'T3','P7','T1','T2','P6'
];

const HIGH_RENDER_ORDER_MESHES = [
  'P3',
];

const MusicStripModel = forwardRef(({ onVideoTrigger }, ref) => {
  // Clear the old model from cache first
  useGLTF.clear('./models/ms5.glb');
  
  // Use performance-optimized loading
  const { scene } = useGLTF('./models/ms4.glb', true); // Enable draco compression if available
  const camera = useThree((s) => s.camera);

  const meshRefs = useRef({});
  const allMeshRefs = useRef({}); // Store ALL meshes for saturation control
  const videoMeshes = useRef({});
  const rootGroup = useRef();

  // Deep clone to keep original scene intact
  const clonedScene = scene.clone(true);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if (!child.isMesh) return;

      const { name } = child;
      const lname = name.toLowerCase();

      // Hide floor/base/plane/ground meshes
      if (
        lname.includes("floor") ||
        lname.includes("ground") ||
        lname.includes("plane") ||
        lname.includes("base") ||
        child.position.y < -2
      ) {
        child.visible = false;
      }

      // Apply early render order to specific text meshes
      if (LOW_RENDER_ORDER_MESHES.includes(name)) {
        child.renderOrder = 1;
        child.material.depthWrite = false;
      }

      // Apply early render order to specific text meshes
      if (HIGH_RENDER_ORDER_MESHES.includes(name)) {
        child.renderOrder = 9;
        child.material.depthWrite = false;
      }

      // Collect ALL meshes for saturation control (except hidden ones)
      if (!lname.includes("floor") && 
          !lname.includes("ground") && 
          !lname.includes("plane") && 
          !lname.includes("base") && 
          child.position.y >= -2) {
        // Clone material to avoid affecting other instances
        if (child.material) {
          const mat = child.material.clone();
          child.material = mat;
          allMeshRefs.current[name] = child;
        }
      }

      // Collect and prep fadeable meshes
      if (TARGET_MESHES.includes(name)) {
        const mat = child.material.clone();
        mat.transparent = true;
        mat.opacity = 1;
        child.material = mat;
        meshRefs.current[name] = child;
      }

      // Collect video clickable meshes - more flexible matching
      if (VIDEO_MESHES.includes(name)) {
        videoMeshes.current[name] = child;
        child.userData.videoIndex = Number(name.replace('P', '')); // P1 -> 1, P2 -> 2, etc.
        
        console.log(`🎬 Setup: ${name} assigned videoIndex ${child.userData.videoIndex}`);
        
        // Special logging for P5
        if (name === 'P5') {
          console.log(`🔍 P5 MESH SETUP:`, {
            name: child.name,
            videoIndex: child.userData.videoIndex,
            position: child.position,
            visible: child.visible,
            material: child.material?.name
          });
        }
      } else if (name.match(/^P0?\d+$/)) {
        // Handle cases like P05, P08, etc.
        const videoNum = parseInt(name.replace(/^P0?/, ''));
        if (videoNum <= 8) {
          videoMeshes.current[name] = child;
          child.userData.videoIndex = videoNum;
        }
      } else if (name.startsWith('P') && /P\d+/.test(name)) {
        console.log(`⚠️ Found P mesh not recognized: ${name}`);
      }

      // Performance optimizations for materials
      if (child.material) {
        // Optimize material properties
        child.material.transparent = child.material.transparent || false;
        child.material.alphaTest = child.material.alphaTest || 0.5;
        
        // Disable unnecessary features for better performance
        if (!child.material.transparent) {
          child.material.depthWrite = true;
        }
        
        // Enable frustum culling
        child.frustumCulled = true;
      }

      // Optimize geometry
      if (child.geometry) {
        // Dispose of unnecessary attributes
        if (child.geometry.attributes.uv2) {
          child.geometry.deleteAttribute('uv2');
        }
      }
    });
  }, [clonedScene]);

  useImperativeHandle(ref, () => ({
    setVisibility: (meshName, visible) => {
      const mesh = meshRefs.current[meshName];
      if (!mesh || !mesh.material) return;

      gsap.to(mesh.material, {
        opacity: visible ? 1 : 0,
        duration: 0.03,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (!visible && mesh.material.opacity < 0.01) {
            mesh.visible = false;
          }
        },
        onStart: () => {
          if (visible) mesh.visible = true;
        },
      });
    },
    setSaturation: (meshName, saturation) => {
      const mesh = meshRefs.current[meshName];
      if (!mesh || !mesh.material) return;

      // Store original color if not already stored
      if (!mesh.userData.originalColor) {
        mesh.userData.originalColor = mesh.material.color.clone();
      }

      // Create a temporary color to work with
      const color = mesh.userData.originalColor.clone();
      
      // Convert to HSL, modify saturation, convert back to RGB
      const hsl = {};
      color.getHSL(hsl);
      
      // Apply saturation multiplier (1.0 = normal, 2.0 = double saturation, 0.0 = grayscale)
      hsl.s = Math.min(1.0, hsl.s * saturation);
      
      // Set the new color
      color.setHSL(hsl.h, hsl.s, hsl.l);
      mesh.material.color.copy(color);
    },
    setGlobalSaturation: (saturation, excludeMeshes = []) => {
      // Apply saturation to all meshes except those in excludeMeshes array
      Object.entries(allMeshRefs.current).forEach(([meshName, mesh]) => {
        if (excludeMeshes.includes(meshName)) return;
        if (!mesh || !mesh.material || !mesh.material.color) return;

        // Store original color if not already stored
        if (!mesh.userData.originalColor) {
          mesh.userData.originalColor = mesh.material.color.clone();
        }

        // Create a temporary color to work with
        const color = mesh.userData.originalColor.clone();
        
        // Convert to HSL, modify saturation, convert back to RGB
        const hsl = {};
        color.getHSL(hsl);
        
        // Apply saturation multiplier
        hsl.s = Math.min(1.0, hsl.s * saturation);
        
        // Set the new color
        color.setHSL(hsl.h, hsl.s, hsl.l);
        mesh.material.color.copy(color);
      });
    },
    setPulsing: (meshName, shouldPulse) => {
      const mesh = meshRefs.current[meshName];
      console.log(`🔄 setPulsing called for ${meshName}, shouldPulse: ${shouldPulse}, mesh found: ${!!mesh}`);
      
      if (!mesh) {
        console.log(`❌ Mesh ${meshName} not found in meshRefs.current:`, Object.keys(meshRefs.current));
        return;
      }

      // Kill any existing pulse animation
      gsap.killTweensOf(mesh.scale);
      console.log(`🎯 Killed existing tweens for ${meshName}`);

      if (shouldPulse) {
        // Store original scale if not already stored
        if (!mesh.userData.originalScale) {
          mesh.userData.originalScale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
          console.log(`📏 Stored original scale for ${meshName}:`, mesh.userData.originalScale);
        }

        console.log(`✨ Starting firefly-like pulse animation for ${meshName}`);
        // Create very slow, gentle firefly-like pulsing animation
        gsap.to(mesh.scale, {
          x: mesh.userData.originalScale.x * 1.02, // Even more subtle 2% larger
          y: mesh.userData.originalScale.y * 1.02,
          z: mesh.userData.originalScale.z * 1.02,
          duration: 6.0, // Much slower - 6 seconds each way (12 second full cycle)
          ease: 'sine.inOut', // Gentle, natural easing like firefly breathing
          yoyo: true,
          repeat: -1, // Infinite repeat
          onStart: () => console.log(`🪲 Very slow firefly pulse animation started for ${meshName}`),
          onUpdate: () => {
            // Only log every 30th update to avoid spam
            if (Math.random() < 0.03) {
              console.log(`🌟 Slow firefly pulsing ${meshName}, current scale:`, mesh.scale.x.toFixed(4));
            }
          }
        });
      } else {
        // Restore original scale
        if (mesh.userData.originalScale) {
          console.log(`🔄 Very gently restoring original scale for ${meshName}`);
          gsap.to(mesh.scale, {
            x: mesh.userData.originalScale.x,
            y: mesh.userData.originalScale.y,
            z: mesh.userData.originalScale.z,
            duration: 2.5, // Even slower, very gentle restoration
            ease: 'sine.out', // Gentle easing to match firefly theme
            onComplete: () => console.log(`✅ Scale very gently restored for ${meshName}`)
          });
        }
      }
    },
  }));

  const handlePointerDown = useCallback(
    (e) => {
      console.log(`🖱️ Pointer down detected on:`, e.object?.name || 'unknown');
      e.stopPropagation();

      const clicked = e.object;
      
      if (!clicked || !clicked.name) {
        console.log(`🖱️ No object clicked or no name`);
        return;
      }

      console.log(`🖱️ Clicked object:`, clicked.name);

      let target = clicked;
      while (target && target.parent && !VIDEO_MESHES.includes(target.name)) {
        target = target.parent;
      }

      console.log(`🖱️ Final target:`, target?.name || 'none');
      console.log(`🖱️ Is video mesh:`, VIDEO_MESHES.includes(target?.name || ''));

      if (target && VIDEO_MESHES.includes(target.name)) {
        const idx = target.userData?.videoIndex;
        console.log(`🎬 Clicked ${target.name} - triggering video ${idx}`);
        console.log(`🎬 Target userData:`, target.userData);
        if (idx !== undefined && idx !== null && onVideoTrigger) {
          console.log(`🎬 Calling onVideoTrigger with ${idx}`);
          onVideoTrigger(idx);
        } else {
          console.log(`🎬 NOT calling onVideoTrigger - idx:${idx}, onVideoTrigger:${!!onVideoTrigger}`);
        }
      } else {
        console.log(`🖱️ Not a video mesh click`);
      }
    },
    [onVideoTrigger]
  );

  return (
    <group ref={rootGroup} position={[0, 0, 0]} scale={1} onPointerDown={handlePointerDown} pointerEvents="none">
      <primitive object={clonedScene} />
      <CloudsLayer />
      {/* <TreeWorld camera={camera} /> */}
    </group>
  );
});

export default MusicStripModel;
useGLTF.preload('/models/ms4.glb');
