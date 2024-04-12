'use client';
import { Canvas } from '@react-three/fiber'
import { Fisheye, OrbitControls, CameraControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { Cubes, Camera, Light1, Light2 } from '@/app/components/Cubes'
import { Loader } from '@react-three/drei'


export default function Scene() {
    return (
        <>
        <Loader />
        <Canvas>
        <CameraControls distance={20}/>
        <Camera />
                <Cubes></Cubes>

                <Light1 />
                <Light2 />

            
        </Canvas>
    </>
    )
  }