import {PerspectiveCamera} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D } from "three";

import { Character } from "@/app/components/vrm/Character"
import { div } from "three/examples/jsm/nodes/Nodes.js";

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


export default function CharacterScene() {
    const [vrm, setVrm] = useState()
    const lookAt = useRef()
    const [text, setText] = useState("")
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

        </div>


    )
  }