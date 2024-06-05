
import React, { useRef } from 'react'
import { useGLTF, Shadow } from '@react-three/drei'

export function StonePlatform(props) {
  const { nodes, materials } = useGLTF('/stone_platform.glb')
  return (
    <group {...props} dispose={null}>
                <Shadow
  color="black"
  colorStop={0}
  opacity={0.7}
  scale={2}
/>
      <mesh
        receiveShadow
        geometry={nodes.Cylinder001__0.geometry}
        material={materials['Scene_-_Root']}
        position={[0, -1.6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.025}
      />
    </group>
  )
}

useGLTF.preload('/stone_platform.glb')