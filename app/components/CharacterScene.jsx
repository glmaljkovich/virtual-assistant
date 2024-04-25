import {CameraControls, OrbitControls, PerspectiveCamera} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Stars } from "./Cubes";
import { Suspense, useEffect, useState, useRef } from "react";
import { Object3D } from "three";
import { useControls } from "leva";
import {loadMixamoAnimation} from "./vrm/loadMixamoAnimation"
import * as THREE from 'three';

export function Camera1(props = {default: boolean = true, lookAt: Object3D}) {
    const camera = useRef()

    useEffect(() => {
        if (props.lookAt) {
            camera.current.add(props.lookAt.current)
        }
    }, [])

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
    const [mixer, setMixer] = useState()
    const expressions = useControls({
        enableMouthControl: false,
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
    
    function loadFBX(vrm) {
        // create AnimationMixer for VRM
        const mixerio = new THREE.AnimationMixer(vrm.scene)
        setMixer(mixerio)
    }

    useEffect(() => {
        const loadAnimation = async () => {
            if (mixer) {
                const animationUrl = '/talking.fbx'
                // Load animation
                const clip = await loadMixamoAnimation(animationUrl, vrm)
                console.log(clip)
                console.log(mixer)
                // Apply the loaded animation to mixer and play
                mixer.clipAction( clip ).play();
            }
        }
        loadAnimation()
    }, [mixer, vrm])
    
    useFrame(({pointer, clock}, delta) => {
        const x = (pointer.x * viewport.width) / 2
        const y = (pointer.y * viewport.height) / 2
        const rotX = (pointer.x * viewport.width)
        const rotY = (pointer.x * viewport.height)
        const getRandom = (items) => {
            return items[Math.floor(Math.random()*items.length)];
        }
        if (vrm) {
            // follow cursor
            lookAt.current.position.set(x, y, 0)
            vrm.lookAt.target = lookAt.current
            // talk
            const s = Math.sin( Math.PI * clock.elapsedTime );
            const movements = ['aa', 'ee', 'ih', 'oh', 'ou']
            //const movement = getRandom(movements)
            const movement = 'ih'
            vrm.expressionManager.setValue(movement, 0.5 * s)
            // for (const mov of movements) {
            //     if (mov !== movement) {
            //         vrm.expressionManager.setValue(mov, vrm.expressionManager.getValue(mov) - 0.5 * s)
            //     }
            // }

            // rotation
            const hips = vrm.humanoid.getNormalizedBoneNode('chest')
            hips.rotation.set(hips.rotation.x + rotX, hips.rotation.y + rotY, 0)
            vrm.expressionManager.setValue('blink', 0.1 - 0.1 * s);
            if (expressions.enableMouthControl) {
                for (const expression in expressions) {
                    const element = expressions[expression];
                    vrm.expressionManager.setValue(expression, expressions[expression])
                }
            }

            // if animation is loaded
	        if (mixer) {
		        // update the animation
		        mixer.update( delta );
	        }

            vrm.update(delta)
        }
    })

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.crossOrigin = 'anonymous';
    
        loader.register((parser) => { return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true }); });

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
            loadFBX(model)
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