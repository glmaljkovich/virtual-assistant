import { CameraControls, OrbitControls, PerspectiveCamera} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Light1, Light2, Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { useControls } from "leva";

export function Camera1(props = {default: boolean = true, lookAt: Object3D}) {
    const camera = useRef()

    useEffect(() => {
        if (props.lookAt) {
            camera.current.add(props.lookAt.current)
        }
    }, [])
    useFrame(({pointer}) => {
        
    })
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

export const Character = ({vrm, setVrm, lookAt}) => {
    const modelPath = '/Pocho.vrm'
    const {scene, viewport} = useThree()
    const expressions = useControls({
        happy: { value: 0, min: -1, max: 1, step: 0.1 },
        sad: { value: 0, min: -1, max: 1, step: 0.1 },
        blink: { value: 0, min: -1, max: 1, step: 0.1 },
        angry: { value: 0, min: -1, max: 1, step: 0.1 },
        surprised: { value: 0, min: -1, max: 1, step: 0.1 },
        relaxed: { value: 0, min: -1, max: 1, step: 0.1 },
        aa: { value: 0, min: -1, max: 1, step: 0.1 },
        ee: { value: 0, min: -1, max: 1, step: 0.1 },
        ih: { value: 0, min: -1, max: 1, step: 0.1 },
        oh: { value: 0, min: -1, max: 1, step: 0.1 },
        ou: { value: 0, min: -1, max: 1, step: 0.1 },
      })
    
    useFrame(({pointer, clock}) => {
        const x = (pointer.x * viewport.width) / 2
        const y = (pointer.y * viewport.height) / 2
        if (vrm) {
            // follow cursor
            lookAt.current.position.set(x, y, 0)
            vrm.lookAt.target = lookAt.current
            // blink
            const s = Math.sin( Math.PI * clock.elapsedTime );
            //vrm.expressionManager.setValue('blink', 1 - s );
            for (const expression in expressions) {
                    const element = expressions[expression];
                    vrm.expressionManager.setValue(expression, expressions[expression])
            }
            vrm.update(clock.getDelta())
        }
    })

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.crossOrigin = 'anonymous';
    
        loader.register((parser) => { return new VRMLoaderPlugin(parser); });

        loader.load(modelPath, (gltf) => {
            const model = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices( gltf.scene );
            VRMUtils.removeUnnecessaryJoints( gltf.scene );
            model.scene.traverse( ( obj ) => {
                obj.frustumCulled = false;

            } );
            scene.add(model.scene)
            console.log(model)
            setVrm(model)
        })
    }, [scene, setVrm])
    return (
        <>{vrm && <primitive object={vrm.scene} />}</>
    )
}

export default function CharacterScene() {
    const [vrm, setVrm] = useState()
    const lookAt = useRef()
    return (
        <Suspense fallback={null}>
            <Canvas flat className="canvi">
                <Camera1 lookAt={lookAt}/>
                <spotLight position={[0, 2, -1]} intensity={0.4} />
                <ambientLight intensity={0.65} />
                <Stars />
                <Character setVrm={setVrm} vrm={vrm} lookAt={lookAt} />
                <object3D ref={lookAt}/>
            </Canvas>
        </Suspense>

    )
  }