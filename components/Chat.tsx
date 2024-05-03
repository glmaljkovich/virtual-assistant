'use client';
 
import { useChat } from 'ai/react';
import { AudioHTMLAttributes, ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react';

const CHAT_ENDPOINT = '/api/chat'
type ChatProps = {
    setText: Dispatch<SetStateAction<string>>,
    setThinking: Dispatch<SetStateAction<boolean>>,
    agentName: string
}

export default function Chat({setText, setThinking, agentName}: ChatProps) {
  const player = useRef<HTMLAudioElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading } = useChat({
    api: CHAT_ENDPOINT,
    body: {
      agentName: agentName
    },
    onFinish: async (message) => {
      const audio = await getElevenLabsResponse(message.content)
      // const audio = await (await fetch('/hmm.mp3')).blob()
      const reader = new FileReader();
      setThinking(false)
      reader.readAsDataURL(audio)
      reader.onload = () => {
        if (player.current) {
            player.current.src = reader.result as string;
            player.current.play();
            setText(message.content)
          }
      };
    },
  });

  const getElevenLabsResponse = async (text: string) => {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text
      })
    });

    if (response.status === 401) {
      console.log("Your ElevenLabs API Key is invalid. Kindly check and try again.", {
        type: "error",
        autoClose: 5000
      });
    }

    const data = await response.blob();
    return data;
  };

  const handlePrompt = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (chatEndpointIsLoading) {
        return
    }
    setThinking(true)
    handleSubmit(e)
  }
 
  return (
    <div className='flex flex-col gap-4'>
      <ul className='flex flex-col gap-2 max-h-48 overflow-y-auto inner-shadow'>
        {messages.map((m, index) => (
          <li key={index} className='max-w-3/4 flex gap-4 items-center'>
            {m.role === 'user' && <span className='text-slate-500 w-8'>You</span>}
            {m.role !== 'user' && <span className='text-purple-300 w-8'>AI</span>}
            <div className='bg-slate-900/80 rounded-xl p-4'>
              {m.role === 'user' && <span className='text-slate-500'>{m.content}</span>}
              {m.role !== 'user' && <span className='text-slate-300'>{m.content}</span>}
            </div>

          </li>
        ))}
      </ul>
 
      <form className='flex gap-4 w-full' onSubmit={handlePrompt}>
          <audio ref={player} onEnded={() => setText("")}/>
          <input
          placeholder='Ask me anything...'
          value={input}
          className="inline flex-shrink w-full bg-slate-700 text-xl shadow-lg px-2 rounded-xl text-slate-200 border-0 focus:border-0 outline-sky-500" 
          onChange={handleInputChange} />
        <button className='inline' type="submit">Send</button>
      </form>
    </div>
  );
}