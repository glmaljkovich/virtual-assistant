'use client';
import Image from "next/image";
import { Loader } from '@react-three/drei'
import CharacterScene from "@/components/CharacterScene"

export default function Home() {
  return (
        <div className="h-full w-full">
          <Loader />
          <CharacterScene />
        </div>
  );
}
