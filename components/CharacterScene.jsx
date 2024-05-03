import {CameraControls, OrbitControls, PerspectiveCamera, Grid} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D } from "three";
import { Leva } from "leva";

import { Character } from "@/components/vrm/Character"
import Chat from "@/components/Chat"

export function Camera1(props = {default: boolean = true, lookAt: Object3D}) {
    const camera = useRef()
    useEffect(() => {
        if (props.lookAt) {
            camera.current.add(props.lookAt.current)
        }
    }, [props.lookAt])

    return (
        <PerspectiveCamera
            name="Camera1"
            makeDefault={true}
            position={[0,1.7,3]}
            fov={22}
            rotation={[-0.1,0,0]}
            ref={camera}
        />
    )
}

function Ground() {
    const gridConfig = {
      cellSize: 0.5,
      cellThickness: 0.5,
      cellColor: '#6f6f6f',
      sectionSize: 3,
      sectionThickness: 1,
      sectionColor: '#9d4b4b',
      fadeDistance: 30,
      fadeStrength: 1,
      followCamera: false,
      infiniteGrid: true
    }
    return <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
  }

function BasicInput() {
    const [text, setText] = useState("")
    return (
        <form onSubmit={(e) => {e.preventDefault(); setFullText(text); setText("")}}>
        <input 
            type="text" 
            placeholder="Say something" 
            className="absolute w-1/3 bottom-6 left-1/3 bg-slate-700 text-xl shadow-lg px-2 rounded-xl text-slate-200 border-0 focus:border-0 outline-sky-500" 
            value={text}
            name="text"
            onChange={(e) => {setText(e.target.value);}}
        />
    </form>
    )
}

export default function CharacterScene() {
    const lookAt = useRef()

    const [fullText, setFullText] = useState("")
    const [thinking, setThinking] = useState(false)
    const [assistant, setAssistant] = useState('Illia')
    return (
        <div className="h-full w-full">
            <div className="absolute top-0 left-0 text-xl w-auto z-10 uppercase tracking-wider font-bold text-white px-4 rounded-tl-xl rounded-br-3xl bg-slate-700">
                {assistant}
                <span className="pointer " onClick={() => assistant === 'Illia' ? setAssistant('Amelia') : setAssistant('Illia') }>
                    🔄
                </span>
            </div>
                <Canvas flat className="canvi">
                    <Camera1 lookAt={lookAt} />
                    <OrbitControls
                        target={[0,1.3,0]}
                        maxDistance={5.5}
                        minDistance={1}
                        maxAzimuthAngle={Math.PI / 2}
                        minAzimuthAngle={-Math.PI / 2}
                        maxPolarAngle={Math.PI / 1.5}
                        minPolarAngle={Math.PI / 4}
                        enablePan={false}
                        
                    />
                    <spotLight position={[0, 2, -1]} intensity={0.5} />
                    <ambientLight intensity={0.6} />
                    <Stars />
                    <Character lookAt={lookAt} text={fullText} thinking={thinking} assistant={assistant} />
                    <object3D ref={lookAt}/>
                </Canvas>
                <Leva collapsed />
            <div className="w-full px-4 md:w-1/3 bottom-6 md:left-1/3 absolute ">
                <Chat setText={setFullText} setThinking={setThinking} agentName={assistant}/>
            </div>
        </div>
    )
  }