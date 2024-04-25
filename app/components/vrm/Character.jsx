
import { useControls } from "leva";
import { loadMixamoAnimation } from "./loadMixamoAnimation"
import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Suspense, useEffect, useState, useRef } from "react";

export const Character = ({vrm, setVrm, lookAt}) => {
    const modelPath = '/Pocho.vrm'
    const {scene, viewport} = useThree()
    const [mixer, setMixer] = useState()
    const [mouthExpr, setMouthExpr] = useState('aa')
    const bounding = useRef()
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
    // load animation
    useEffect(() => {
        const loadAnimation = async () => {
            if (mixer) {
                const animationUrl = '/talking.fbx'
                // Load animation
                const clip = await loadMixamoAnimation(animationUrl, vrm)
                // Apply the loaded animation to mixer and play
                mixer.clipAction( clip ).play();
            }
        }
        loadAnimation()
    }, [mixer, vrm])

    // load model
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
    // head animations
    useEffect(() => {
        const changeMouth = () => {
            const expressions = ['aa', 'ee', 'ih', 'oh', 'ou']
            const getRandom = (items) => {
                return items[Math.floor(Math.random()*items.length)];
            }
            const expr = getRandom(expressions)
            console.log(expr)
            setMouthExpr(expr)
        }
        setTimeout(changeMouth, 1000)
    }, [mouthExpr, setMouthExpr])
    // animate
    useFrame(({pointer, clock}, delta) => {
        const x = (pointer.x * viewport.width) / 2
        const y = (pointer.y * viewport.height) / 2
        const rotX = (pointer.x * viewport.width) / 8

        if (vrm) {
            // follow cursor
            lookAt.current.position.set(x, y, 0)
            vrm.lookAt.target = lookAt.current

            // talk
            const s = Math.sin( Math.PI * clock.elapsedTime );
            vrm.expressionManager.setValue(mouthExpr, 0.5 * s)

            // rotation
            bounding?.current.rotation.set(0, rotX, 0)
            // blink
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

    return (
        <>{vrm && <primitive ref={bounding} object={vrm.scene} />}</>
    )
}