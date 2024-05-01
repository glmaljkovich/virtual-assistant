'use client';
 
import { useChat } from 'ai/react';
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useState } from 'react';
import Speech from "@/components/vrm/Speech"

const CHAT_ENDPOINT = '/api/chat'
type ChatProps = {
    setText: Dispatch<SetStateAction<string>>
}

export default function Chat({setText}: ChatProps) {
  const [sourcesForMessages, setSourcesForMessages] = useState<Record<string, any>>({});
  const [stream, setStream] = useState<ReadableStream|null>()
  const [croppedText, setCroppedText] = useState<string>()
  const { messages, input, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading } = useChat({
    api: CHAT_ENDPOINT,
    onFinish: (message) => {
        setText(message.content)
    }
  });

  const handlePrompt = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (chatEndpointIsLoading) {
        return
    }
    handleSubmit(e)
  }
 
  return (
    <div className='flex flex-col gap-4'>
      <ul className='flex flex-col gap-2 max-h-48 overflow-y-auto'>
        {messages.map((m, index) => (
          <li key={index} className='max-w-3/4 bg-slate-800/80 rounded-xl p-4'>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </li>
        ))}
      </ul>
 
      <form className='flex gap-4 w-full' onSubmit={handlePrompt}>
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