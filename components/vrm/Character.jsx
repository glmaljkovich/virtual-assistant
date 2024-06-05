
import { useControls, Leva } from "leva";
import { loadMixamoAnimation } from "./loadMixamoAnimation"
import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Suspense, useEffect, useState, useRef, memo } from "react";
import { lerp } from "three/src/math/MathUtils.js";

export const Character = function Character({ lookAt, text, thinking, assistant, emotion}) {
    const {scene, viewport} = useThree()
    const [mixer, setMixer] = useState()
    const [speaking, setSpeaking] = useState(false)
    const [mouthExpr, setMouthExpr] = useState('aa')
    const [vrm, setVrm] = useState()
    const [clips, setClips] = useState()
    const [nextBlinkTime, setNextBlinkTime] = useState(0);

    const bounding = useRef()
    const expressions = useControls({
        enableFaceControl: false,
        pitch: {value: 1.4, min: 0, max: 2, step: 0.1},
        blink: { value: 0, min: -1, max: 1, step: 0.1 },
        happy: { value: 0, min: -1, max: 1, step: 0.1 },
        sad: { value: 0, min: -1, max: 1, step: 0.1 },
        angry: { value: 0, min: -1, max: 1, step: 0.1 },
        surprised: { value: 0, min: -1, max: 1, step: 0.1 },
        relaxed: { value: 0, min: -1, max: 1, step: 0.1 },
      })

    const getModelPath = (assistant) => {
        const assistants = {
            'Illia': '/Illia.vrm',
            'Amelia': '/Amelia.vrm'
        }
        return assistants[assistant]
    }

    // speak
    useEffect(() => {
        if(text !== "" && !thinking) {
            setSpeaking(true)
        } else {
            setSpeaking(false)
        }
    }, [expressions.pitch, text, thinking])

    // emote
    useEffect(() => {
        const emotions = [
            "happy",
            "sad",
            "angry",
            "surprised",
            "relaxed"
        ]
        if(emotion !== ""){
            vrm?.expressionManager.setValue(emotion, 0.5)
        } else {
            for (const emot of emotions) {
                vrm?.expressionManager.setValue(emot, 0)
            }
        }
    }, [vrm, emotion])

    // clear mouth expressions after speak end
    useEffect(() => {
        const expressions = ['aa', 'ee', 'ih', 'oh', 'ou']
        if(!speaking) {
            for (const expression of expressions) {
                vrm?.expressionManager?.setValue(expression, 0)
            }
        }
    }, [speaking, vrm])

    // load model
    useEffect(() => {
        console.log("loading model")
        const loader = new GLTFLoader();
        loader.crossOrigin = 'anonymous';
    
        loader.register((parser) => { return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true }); });

        loader.load(getModelPath(assistant), (gltf) => {
            const model = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices( gltf.scene );
            VRMUtils.removeUnnecessaryJoints( gltf.scene );
            model.scene.traverse( ( obj ) => {
                obj.frustumCulled = false;

            } );
            model.scene.name = "character"
            // remove previously loaded model
            scene.remove(scene.children.find(obj => obj.name === "character"))
            scene.add(model.scene)
            console.log(model)
            setVrm(model)
            setNextBlinkTime(getRandomBlinkTime(0));
        })
    }, [assistant, scene, setVrm])

    // load mixer
    useEffect(() => {
        function loadFBX(vrm) {
            // create AnimationMixer for VRM
            const mixerio = new THREE.AnimationMixer(vrm.scene)
            console.log("loading mixer...")
            setMixer(mixerio)
            console.log(mixerio)
        }

        if (vrm) {
            loadFBX(vrm)
        }
    }, [vrm])

    // preload animations
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

        if (vrm && mixer) {
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
                    mixer.clipAction(clips['talking'])?.stop()
                    mixer.clipAction(clips['idle'])?.stop()
                    const thinkAction = mixer.clipAction(clips['think'])
                    thinkAction.clampWhenFinished = true
                    thinkAction?.setLoop(THREE.LoopOnce).play();
                } else if (speaking) {
                    console.log("speaking")
                    // Load animation
                    // Apply the loaded animation to mixer and play
                    mixer.clipAction(clips['think'])?.stop()
                    mixer.clipAction(clips['idle'])?.stop()
                    mixer.clipAction(clips['talking'])?.play();
                } else {
                    console.log("speak/think back to Idle")
                    mixer.clipAction(clips['talking'])?.stop()
                    mixer.clipAction(clips['think'])?.stop()
                    mixer.clipAction(clips['idle'])?.play();
                }
            }

        }
        loadAnimation()
    }, [mixer, thinking, speaking, vrm, clips])

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

    const getRandomBlinkTime = (currentTime) => {
        return currentTime + Math.random() * (6 - 2) + 2; // Random time between 2 and 6 seconds from currentTime
    };
    
    const handleBlink = (expressionManager, elapsedTime) => {
        const blinkDuration = 0.1; // Duration of the blink closing or opening phase
        const blinkStart = nextBlinkTime - blinkDuration;
        const blinkEnd = nextBlinkTime + blinkDuration;
    
        if (elapsedTime >= blinkStart && elapsedTime <= nextBlinkTime) {
          // Closing eyes smoothly
          const blinkProgress = (elapsedTime - blinkStart) / blinkDuration;
          expressionManager.setValue('blink', blinkProgress);
        } else if (elapsedTime > nextBlinkTime && elapsedTime <= blinkEnd) {
          // Opening eyes smoothly
          const blinkProgress = 1 - ((elapsedTime - nextBlinkTime) / blinkDuration);
          expressionManager.setValue('blink', blinkProgress);
        } else if (elapsedTime > blinkEnd) {
          // Blink complete, set new blink time
          expressionManager.setValue('blink', 0);
          setNextBlinkTime(getRandomBlinkTime(elapsedTime));
        }
    };

    // animate
    useFrame(({pointer, clock}, delta) => {
        const x = (pointer.x * viewport.width) / 2
        const y = (pointer.y * viewport.height) / 2
        const rotX = (pointer.x * viewport.width) / 15

        if (vrm) {
            // follow cursor
            lookAt.current.position.set(x, y, 0)
            vrm.lookAt.target = lookAt.current

            const mouthSpeed = Math.sin( Math.PI * clock.elapsedTime * 3.5 );
            
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
            // bounding?.current.rotation.set(0, rotX / 2, 0)
            const chest = vrm.humanoid.getNormalizedBoneNode('chest')
            const neck = vrm.humanoid.getNormalizedBoneNode('neck')

            // blink
            handleBlink(vrm.expressionManager, clock.elapsedTime)
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
            // rotation has to happen after animations
            neck.rotation.set(0, rotX, 0)
            chest.rotation.set(0, rotX / 2, 0)
            vrm.update(delta)
        }
    })

    return (
        <>{vrm && <primitive ref={bounding} object={vrm.scene} />}</>
    )
}
