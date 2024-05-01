
import { useControls } from "leva";
import { loadMixamoAnimation } from "./loadMixamoAnimation"
import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Suspense, useEffect, useState, useRef, memo } from "react";
import { lerp } from "three/src/math/MathUtils.js";

export const Character = function Character({ lookAt, text, thinking}) {
    const modelPath = '/Pocho.vrm'
    const {scene, viewport} = useThree()
    const [mixer, setMixer] = useState()
    const [speaking, setSpeaking] = useState(false)
    const [mouthExpr, setMouthExpr] = useState('aa')
    const [vrm, setVrm] = useState()
    const [clips, setClips] = useState()

    const bounding = useRef()
    const expressions = useControls({
        pitch: {value: 1.4, min: 0, max: 2, step: 0.1},
        enableFaceControl: false,
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

    // speak
    useEffect(() => {
        if(text !== "" && !thinking) {
            setSpeaking(true)
        } else {
            setSpeaking(false)
        }
    }, [expressions.pitch, text, thinking])

    // clear mouth expressions after speak end
    useEffect(() => {
        const expressions = ['aa', 'ee', 'ih', 'oh', 'ou']
        if(!speaking) {
            for (const expression of expressions) {
                vrm?.expressionManager?.setValue(expression, 0)
            }
        }
    }, [speaking, vrm])

    // preload
    useEffect(() => {
        const loadAnimation = async () => {
            if (mixer) {
                console.log("loading animations")
                // talk
                const animationUrl = '/talking.fbx'
                const clip = await loadMixamoAnimation(animationUrl, vrm, 'talking')
                // think
                const animationUrl2 = '/think.fbx'
                const clip2 = await loadMixamoAnimation(animationUrl2, vrm, 'think')
                // idle
                const animationUrl3 = '/Idle2.fbx'
                const clip3 = await loadMixamoAnimation(animationUrl3, vrm, 'idle')
                // Apply the loaded animation to mixer and play

                setClips({
                    'idle': clip3,
                    'talking': clip,
                    'think': clip2
                })
            }
        }
        function loadFBX(vrm) {
            // create AnimationMixer for VRM
            const mixerio = new THREE.AnimationMixer(vrm.scene)
            console.log("loading mixer...")
            setMixer(mixerio)
            console.log(mixerio)
        }

        if (vrm && !mixer) {
            loadFBX(vrm)
        } else {
            loadAnimation()
        }
    }, [mixer, vrm])

    // think
    useEffect(() => {
        const loadAnimation = async () => {
            if (mixer && clips) {
                console.log('playing animations')
                if (thinking) {
                    console.log("thinking anim")
                    mixer.stopAllAction()
                    mixer.clipAction(clips['think'])?.setLoop(THREE.LoopOnce).play();
                } else if (speaking) {
                    console.log("speaking")
                    // Load animation
                    // Apply the loaded animation to mixer and play
                    mixer.stopAllAction()
                    mixer.clipAction(clips['talking'])?.play();
                } else {
                    console.log("speak/think back to Idle")
                    mixer.stopAllAction()
                    mixer.clipAction(clips['idle'])?.play();
                }
                mixer.update(0)
            }

        }
        loadAnimation()
    }, [mixer, thinking, speaking, vrm, clips])

    // load model
    useEffect(() => {
        console.log("loading model")
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
        })
    }, [scene, setVrm])

    // talking animation
    useEffect(() => {
        const changeMouth = () => {
            const getNextExpression = (expr) => {
                const nextExpressions = {
                    'aa': 'ou',
                    'ee': 'ih',
                    'ih': 'oh',
                    'oh': 'ee',
                    'ou': 'aa'
                }
                return nextExpressions[expr]
            }
            const expr = getNextExpression(mouthExpr)
            setMouthExpr(expr)
        }
        setTimeout(changeMouth, 600)
    }, [mouthExpr, setMouthExpr])

    // animate
    useFrame(({pointer, clock}, delta) => {
        const x = (pointer.x * viewport.width) / 2
        const y = (pointer.y * viewport.height) / 2
        const rotX = (pointer.x * viewport.width) / 15

        if (vrm) {
            // follow cursor
            lookAt.current.position.set(x, y, 0)
            vrm.lookAt.target = lookAt.current

            const blinkSpeed = Math.sin( Math.PI * clock.elapsedTime * 2 );
            const mouthSpeed = Math.sin( Math.PI * clock.elapsedTime * 3 );
            
            // talk
            if (!expressions.enableFaceControl && speaking) {
                vrm.expressionManager.setValue(mouthExpr, lerp(0.1, 0.6, mouthSpeed))
                // clear other expressions
                const expressions = ['aa', 'ee', 'ih', 'oh', 'ou']
                for (const expr of expressions) {
                    if (expr !== mouthExpr) {
                        vrm.expressionManager.setValue(expr, lerp(0, 0.15, mouthSpeed))
                    }
                }
            }

            // rotation
            bounding?.current.rotation.set(0, rotX / 2, 0)
            const neck = vrm.humanoid.getNormalizedBoneNode('neck')
            neck.rotation.set(0, rotX * 2, 0)

            // blink
            vrm.expressionManager.setValue('blink', lerp(0, 1, blinkSpeed));
            // control panel
            if (expressions.enableFaceControl) {
                for (const expression in expressions) {
                    const element = expressions[expression];
                    vrm.expressionManager.setValue(expression, expressions[expression])
                }
            }

            // if animation is loaded
	        if (mixer) {
		        // update the animation
		        mixer.update(delta);
	        }

            vrm.update(delta)
        }
    })

    return (
        <>{vrm && <primitive ref={bounding} object={vrm.scene} />}</>
    )
}
