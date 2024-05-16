import {
  CameraControls,
  OrbitControls,
  PerspectiveCamera,
  Grid,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D } from "three";
import { Leva } from "leva";
import { LuRefreshCcw } from "react-icons/lu";

import { Character } from "@/components/vrm/Character";
import Chat from "@/components/Chat";

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

  return (
    <div className="h-dvh w-full">
      <div className="absolute top-0 z-10 left-0 text-center">
        <div className=" text-xl mt-2 ml-2 w-auto z-10 uppercase tracking-wider font-bold text-white px-4 rounded-3xl bg-slate-800">
          {assistant}
          <span
            className="pointer "
            onClick={() =>
              assistant === "Illia"
                ? setAssistant("Amelia")
                : setAssistant("Illia")
            }
          >
            <LuRefreshCcw className="text-sm text-blue-300 inline-block ml-2" />
          </span>
        </div>
      </div>
      <div className="relative h-full">
        <Canvas flat className="canvi">
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
          <spotLight position={[0, 2, -1]} intensity={0.5} />
          <ambientLight intensity={0.6} />
          <Ground />
          <Stars />
          <Character
            lookAt={lookAt}
            text={fullText}
            thinking={thinking}
            assistant={assistant}
            emotion={emotion}
          />
          <object3D ref={lookAt} />
        </Canvas>
        <Leva collapsed hidden />
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
