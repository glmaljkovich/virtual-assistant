import {
  CameraControls,
  OrbitControls,
  PerspectiveCamera,
  AccumulativeShadows,
  RandomizedLight,
  Grid,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D } from "three";
import { Leva } from "leva";
import { LuRefreshCcw } from "react-icons/lu";
import { FaBug } from "react-icons/fa";
import { easing } from "maath";

import { Character } from "@/components/vrm/Character";
import Chat from "@/components/Chat";
import {Skybox} from "@/components/Skybox"

import { EffectComposer, Bloom, DepthOfField   } from "@react-three/postprocessing"


function Effects() {
    const { size } = useThree()
    const yellow = "#facc15"
    return (
        <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0} focalLength={0.1} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
    )
}

export function Camera1(
  props = { default: (boolean = true), lookAt: Object3D },
) {
  const camera = useRef();
  useEffect(() => {
    if (props.lookAt) {
      camera.current.add(props.lookAt.current);
    }
  }, [props.lookAt]);

  return (
    <PerspectiveCamera
      name="Camera1"
      makeDefault={true}
      position={[0, 1.7, 3]}
      fov={22}
      rotation={[-0.1, 0, 0]}
      ref={camera}
    />
  );
}

function CursorLight(props = {lookAt}) {
    const lookAtLight = useRef();
    useFrame(() => {
      if(lookAtLight.current) {
          lookAtLight.current.position.set(props.lookAt.current.position.x, props.lookAt.current.position.y + 1.3, 0.35)
      }
    })
    return (
        <pointLight ref={lookAtLight} color={'#EFBD4E'} decay={1.2} intensity={0.15}/>
    )
}

function Platform() {
    return (
        <mesh position={[0,-0.15,-1]} receiveShadow>
        <boxGeometry args={[6,0.1,5]}/>
        <meshToonMaterial color="white"/>
      </mesh>
    )
}

function Ground() {
  const gridConfig = {
    cellSize: 0.75,
    cellThickness: 0.6,
    cellColor: "#6f6f6f",
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: "#9d4b4b",
    fadeDistance: 30,
    fadeStrength: 1.5,
    followCamera: false,
    infiniteGrid: true,
  };
  return <Grid position={[0, -0.01, 0]} args={[10, 10]} {...gridConfig} />;
}

export default function CharacterScene() {
  const lookAt = useRef();
  
  const [fullText, setFullText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [assistant, setAssistant] = useState("Illia");
  const [emotion, setEmotion] = useState("");
  const [debug, setDebug] = useState(false)

  const toggleDebug = () => {
    setDebug((debug) => !debug)
  }

  return (
    <div className="h-dvh w-full">
      <div className="absolute top-0 z-10 left-0 text-center">
        <div className=" text-xl mt-2 ml-2 w-auto z-10 uppercase tracking-wider font-bold text-white px-4 rounded-3xl bg-slate-800">
          {assistant.substring(0, assistant.length -2)}<span className="text-teal-400">{assistant.substring(assistant.length - 2)}</span>
          <span
            className="pointer "
            onClick={() =>
              assistant === "Illia"
                ? setAssistant("Amelia")
                : setAssistant("Illia")
            }
          >
            <LuRefreshCcw className="text-sm text-blue-300 inline-block cursor-pointer ml-2" />
          </span>
        </div>
      </div>
      <div className="absolute top-4 z-10 right-4 cursor-pointer" onClick={toggleDebug}>
        <FaBug className="text-blue-800/50"/>
      </div>
      <div className="relative h-full">
        <Canvas shadows className="canvi">
          <Camera1 lookAt={lookAt} />
          <OrbitControls
            target={[0, 1.3, 0]}
            maxDistance={5.5}
            minDistance={1}
            maxAzimuthAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 2}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
            enablePan={false}
          />
          <Skybox />
          <Effects />
          <spotLight position={[0, 2, -1]} intensity={0.7} />
          <ambientLight intensity={0.8} />
          {debug && <Ground /> }
          <Character
            lookAt={lookAt}
            text={fullText}
            thinking={thinking}
            assistant={assistant}
            emotion={emotion}
          />
          <Platform />
          <object3D ref={lookAt} />
          <CursorLight lookAt={lookAt} />
          <pointLight position={[0,2.3,-0.25]} color={'#EFBD4E'} decay={1.2} intensity={0.55}/>
          
        </Canvas>
        <Leva collapsed hidden={!debug} />
        <div className="w-full px-4 md:w-1/3 bottom-6 md:left-1/3 absolute ">
          <Chat
            setText={setFullText}
            setThinking={setThinking}
            agentName={assistant}
            setEmotion={(emot) => setEmotion(emot)}
          />
        </div>
      </div>
    </div>
  );
}
