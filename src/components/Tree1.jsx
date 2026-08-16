
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { getAssetPath } from '../utils/assetPath'

export function Model(props) {
  const { nodes, materials } = useGLTF(getAssetPath('/models/Tree1.glb'))
  return (
    <group {...props} dispose={null}>
      <mesh
        name="Plane"
        castShadow
        receiveShadow
        geometry={nodes.Plane.geometry}
        material={materials['Material.001']}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.35}
      />
    </group>
  )
}

useGLTF.preload('/tree1.glb')

