import * as THREE from "three"
import { useRef, useMemo } from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { getAssetPath } from "./utils/assetPath"
// import { useControls } from "leva"

export default function CloudLayer() {
  const groupRef = useRef()
  const { camera } = useThree()

  const texture = useLoader(THREE.TextureLoader, getAssetPath("/cloud.png"))

  // Final values from Leva UI (hardcoded)
  const count = 35
  const spacing = 9
  const scale = 11
  const y = 6
  const opacity = 1
  const rotationSpeed = 0.02
  const billboard = true

  // Optional: keep this if you want to re-enable Leva later
  /*
  const {
    count,
    spacing,
    scale,
    y,
    opacity,
    rotationSpeed,
    billboard,
  } = useControls("Clouds", {
    count: { value: 35, min: 1, max: 50, step: 1 },
    spacing: { value: 9, min: 5, max: 100, step: 1 },
    scale: { value: 11, min: 1, max: 100, step: 1 },
    y: { value: 6, min: -50, max: 100, step: 1 },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    rotationSpeed: { value: 0.02, min: 0, max: 0.1, step: 0.001 },
    billboard: { value: true },
  })
  */

  const positions = useMemo(() => {
    const pos = []
    const gridSize = Math.ceil(Math.sqrt(count))

    for (let xi = 0; xi < gridSize; xi++) {
      for (let zi = 0; zi < gridSize; zi++) {
        if (pos.length < count) {
          pos.push([
            (xi - gridSize / 2) * spacing,
            y,
            (zi - gridSize / 2) * spacing,
          ])
        }
      }
    }
    return pos
  }, [count, spacing, y])

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * rotationSpeed

    if (billboard) {
      groupRef.current.children.forEach((mesh) => {
        mesh.lookAt(camera.position)
      })
    }
  })

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <planeGeometry args={[scale, scale]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
