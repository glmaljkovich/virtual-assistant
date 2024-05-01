import {PerspectiveCamera} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D } from "three";

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
            position={[0,1.5,2]}
            rotation={[-0.1, 0,0]}
            zoom={1.4}
            ref={camera}
        />
    )
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
    const [vrm, setVrm] = useState()
    const lookAt = useRef()
    const [fullText, setFullText] = useState("")
    return (
        <div className="h-full w-full">
            <Suspense fallback={null}>
                <Canvas flat className="canvi">
                    <Camera1 lookAt={lookAt}/>
                    <spotLight position={[0, 2, -1]} intensity={0.4} />
                    <ambientLight intensity={0.65} />
                    <Stars />
                    <Character setVrm={setVrm} vrm={vrm} lookAt={lookAt} text={fullText} />
                    <object3D ref={lookAt}/>
                </Canvas>
            </Suspense>
            <div className="w-full px-4 md:w-1/3 bottom-6 md:left-1/3 absolute ">
                <Chat setText={setFullText}/>
            </div>
        </div>
    )
  }