
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Skybox(props) {
  const { nodes, materials } = useGLTF('/skybox.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <mesh

          geometry={nodes.Sphere__0.geometry}
          material={materials['Scene_-_Root']}
          rotation={[-Math.PI / 2, 0, Math.PI]}
          scale={1000}
          position={[0,-70,0]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/skybox.glb')