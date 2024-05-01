'use client';
import { Canvas, useThree } from '@react-three/fiber'
import { CameraControls, Bvh, ScrollControls, Scroll } from '@react-three/drei'
import { Cubes, Camera, Light1, Light2, Stars } from '@/components/Cubes'
import { EffectComposer, Selection, Outline, ToneMapping     } from "@react-three/postprocessing"


function Effects() {
    const { size } = useThree()
    const yellow = "#facc15"
    return (
        <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={4}>
        <Outline visibleEdgeColor={yellow} hiddenEdgeColor={yellow} blur width={size.width * 1.25} edgeStrength={10} />
        <ToneMapping />
        </EffectComposer>
    )
}

function Sections() {
    return (
        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left">
            <a
                href="https://lelemem-4ny1sejawdu.streamlit.app/"
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                target="_blank"
                rel="noopener noreferrer"
            >
                <h2 className="mb-3 text-2xl font-semibold">
                🤖 Chat Resume{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                A chatbot with my work history. Ask away...
                </p>
            </a>

            <a
                href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                target="_blank"
                rel="noopener noreferrer"
            >
                <h2 className="mb-3 text-2xl font-semibold">
                Learn{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Learn about Next.js in an interactive course with&nbsp;quizzes!
                </p>
            </a>

            <a
                href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                target="_blank"
                rel="noopener noreferrer"
            >
                <h2 className="mb-3 text-2xl font-semibold">
                Templates{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Explore starter templates for Next.js.
                </p>
            </a>
        </div>
    )
}

export function Content() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
            <p className="fixed left-0 top-0 flex w-full justify-center from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:p-4">
            <span className="font-mono font-bold">glmaljkovich</span>
            </p>
            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t dark:from-black dark:via-black lg:static lg:size-auto p-4 lg:bg-none">
            Portfolio
            </div>
        </div>
        <div className="lg:p-24 p-6 lg:bg-gradient-to-r lg:from-r min-h-24 lg:m-24 mx-6 mt-48 rounded-lg border border-yellow-300 backdrop-blur">
          <h1 className="text-4xl">Gabriel L. Maljkovich</h1>
          <div className="h-2 w-24 bg-gradient-to-l from-l from-yellow-400 rounded"></div>
          <h1 className="text-slate-300 font-bold text-xl">Full-Stack Developer</h1>
          <p className="text-slate-300 font-bold">Data Engineer</p>
          <p className="text-slate-300 italic">and more...</p>
        </div>
        <Sections />
        <Sections />
        <Sections />
        <Sections />
        <Sections />
        <Sections />
        <Sections />
        <Sections />
      </main>
      
    )
}

export default function Scene() {
    return (
        <Canvas flat className="min-h-screen">
            <ScrollControls pages={1}>
                <Scroll className="min-h-screen">
                    <Camera />
                    <Light1 />
                    <Light2 />
                    <Stars />
                    <Bvh firstHitOnly>
                        <Selection>                
                                <Effects />
                                <Cubes></Cubes>
                        </Selection>
                    </Bvh>
                </Scroll>
                <Scroll html style={{ width: '100%' }}>
                    <Content />
                </Scroll>

            </ScrollControls>
        </Canvas>
    )
  }