
import { useControls } from "leva";
import { loadMixamoAnimation } from "./loadMixamoAnimation"
import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Suspense, useEffect, useState, useRef } from "react";
import { lerp } from "three/src/math/MathUtils.js";

export const Character = ({vrm, setVrm, lookAt, text}) => {
    const modelPath = '/Pocho.vrm'
    const {scene, viewport} = useThree()
    const [mixer, setMixer] = useState()
    const [speaking, setSpeaking] = useState(false)
    const [mouthExpr, setMouthExpr] = useState('aa')
    const [utter, setUtterance] = useState(null)
    const bounding = useRef()
    const expressions = useControls({
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
        if(text !== "") {
                let utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Male'))
    
                console.log(text)
                utterance.onend = () => {
                    console.log("speak end")
                    setSpeaking(false)
                }
                speechSynthesis.speak(utterance);
                setSpeaking(true)

        }
    }, [text])
    // clear mouth expressions after speak end
    useEffect(() => {
        const expressions = ['aa', 'ee', 'ih', 'oh', 'ou']
        if(!speaking) {
            for (const expression of expressions) {
                vrm?.expressionManager?.setValue(expression, 0)
            }
        }
    }, [speaking, vrm])



    // load animation
    useEffect(() => {
        const loadAnimation = async () => {
            if (mixer) {
                const animationUrl = '/talking.fbx'
                // Load animation
                const clip = await loadMixamoAnimation(animationUrl, vrm)
                // Apply the loaded animation to mixer and play
                mixer.clipAction( clip ).play();
                mixer.update()
            }
        }
        loadAnimation()
    }, [mixer, vrm])

    useEffect(() => {
        const loadAnimation = async () => {
            const animationUrl = '/talking.fbx'
            const clip = await loadMixamoAnimation(animationUrl, vrm)
            if (mixer && speaking) {
                // Load animation
                // Apply the loaded animation to mixer and play
                mixer.clipAction( clip ).play();
            } else if (mixer) {
                mixer.clipAction(clip).stop();
                // mixer.stopAllAction();
            }
        }
        loadAnimation()

    }, [mixer, speaking, vrm])

    // load model
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.crossOrigin = 'anonymous';
    
        loader.register((parser) => { return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true }); });

        function loadFBX(vrm) {
            // create AnimationMixer for VRM
            const mixerio = new THREE.AnimationMixer(vrm.scene)
            setMixer(mixerio)
        }

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
	        if (mixer && speaking) {
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