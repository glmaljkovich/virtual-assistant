"use client";

import { useChat, Message } from "ai/react";
import classnames from "classnames";
import {
  AudioHTMLAttributes,
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaMicrophone } from "react-icons/fa";
import { RxPaperPlane } from "react-icons/rx";

const CHAT_ENDPOINT = "/api/chat";
type ChatProps = {
  setText: Dispatch<SetStateAction<string>>;
  setThinking: Dispatch<SetStateAction<boolean>>;
  agentName: string;
  setEmotion: (emotion: string) => void;
};

interface ElevenLabsWSResponse {
  audio: string;
  isFinal: boolean;
  normalizedAlignment: {
    char_start_times_ms: number[];
    chars_durations_ms: number[];
    chars: string[];
  };
  alignment: {
    char_start_times_ms: number[];
    chars_durations_ms: number[];
    chars: string[];
  };
}

export default function Chat({
  setText,
  setThinking,
  agentName,
  setEmotion,
}: ChatProps) {
  const player = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const [isFetchingAudio, setFetchingAudio] = useState(false)
  const messagesEndRef = useRef<null | HTMLLIElement>(null);
  const lastSentIndexRef = useRef<number>(0);
  const [wordsToSpeak, setWordsToSpeak] = useState<string[]>([])
  const [isStreaming, setStreaming] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading: chatEndpointIsLoading,
  } = useChat({
    api: CHAT_ENDPOINT,
    body: {
      agentName: agentName,
    },
    onFinish: async (message) => {
      setStreaming(false)
    },
    onResponse: async (res) => {
      setStreaming(true)
    }
  });

  const finishSpeaking = useCallback(() => {
    console.log("finish speaking")
    setText("");
    setEmotion("");
  }, [setEmotion, setText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {

    const getElevenLabsResponse = async (text: string, previous: string) => {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          assistant: agentName,
          previous: previous
        }),
      });
  
      if (response.status === 401) {
        console.log(
          "Your ElevenLabs API Key is invalid. Kindly check and try again.",
          {
            type: "error",
            autoClose: 5000,
          },
        );
      }
  
      const data = await response.blob();
      return data;
    };

    const getAudio = async (content: string) => {
        const previous = content.substring(0, lastSentIndexRef.current)
        setFetchingAudio(true)
        const audio = await getElevenLabsResponse(content, previous);
        setFetchingAudio(false)
        const reader = new FileReader();
        reader.onload = () => {
          setAudioQueue((prevQueue) => [...prevQueue, reader.result as string]);
          setText(content);
        };
        reader.readAsDataURL(audio);
        console.log(content, lastSentIndexRef.current)
      }

    if (!isFetchingAudio && wordsToSpeak.length !== 0) {
      getAudio(wordsToSpeak[0])
      setWordsToSpeak(wordsToSpeak.slice(1))
    } else if (!isStreaming && !isFetchingAudio && !isPlayingRef.current && wordsToSpeak.length === 0) {
      finishSpeaking()
    }
  }, [isFetchingAudio, wordsToSpeak, agentName, setText, finishSpeaking, isStreaming])

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    const fetchEmotion = async (content: string) => {
      const emotionResponse = await fetch("/api/emotion", {
        method: "POST",
        body: JSON.stringify({ message: content }),
      });
      const emotion = await emotionResponse.text();
      console.log("setting emotion", emotion)
      setEmotion(emotion);
    }
    const isCompleteWord = (word: string): boolean => {
      return /[.,!?;:]+$/.test(word);  // Check if the word ends with a space or punctuation.
    };

    if (latestMessage && latestMessage.role !== 'user') {
      setThinking(false)
      const content = latestMessage.content
      if (isCompleteWord(content)) {
        const newEnding = content.length
        const newWords = content.substring(lastSentIndexRef.current)
        if (newWords.length > 0) {
          lastSentIndexRef.current = newEnding
          setWordsToSpeak((words) => [...words, newWords])
        }
      }
    } else if (latestMessage && latestMessage.role === 'user') {
      lastSentIndexRef.current = 0
      fetchEmotion(latestMessage.content)
    }
  }, [messages, agentName, setEmotion, setThinking, setText]);
  

  useEffect(() => {
    const playNextAudio = () => {
      if (!player.current) return;
  
      isPlayingRef.current = true;
      const nextAudioData = audioQueue[0];
      player.current.src = nextAudioData;
      player.current.play().then(() => {
        player.current!.onended = () => {
          setAudioQueue((prevQueue) => prevQueue.slice(1));
          isPlayingRef.current = false;
        };
      }).catch((error) => {
        console.error('Error playing audio:', error);
        isPlayingRef.current = false;
      });
    };
    if (audioQueue.length > 0 && !isPlayingRef.current) {
      playNextAudio();
    } else if (audioQueue.length === 0 && wordsToSpeak.length === 0){
      finishSpeaking()
    }
  }, [audioQueue, finishSpeaking, wordsToSpeak.length]);

  const handlePrompt = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatEndpointIsLoading) {
      return;
    }
    setThinking(true);
    setStreaming(true)
    const playThinkingSound = async () => {
      const reader = new FileReader();
      const voiceMap = new Map(
        Object.entries({
          Illia: "/hmm_illia.mp3",
          Amelia: "hmm_amelia.mp3",
        }),
      );
      const audio = await (await fetch(voiceMap.get(agentName)!)).blob();
      reader.readAsDataURL(audio);
      reader.onload = () => {
        if (player.current) {
          player.current.src = reader.result as string;
          player.current.play();
        }
      };
    };
    playThinkingSound();
    handleSubmit(e);
  };

  useEffect(() => {
    const speechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (speechRecognition && !recognitionRef.current) {
      recognitionRef.current = new speechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcriptResult = event.results[lastResultIndex][0].transcript;
        append({ content: transcriptResult, role: "user" });
        setRecording(false);
        recognitionRef.current?.stop();
      };

      recognitionRef.current.onstart = () => {
        setRecording(true);
        console.log("start recognition");
      };

      recognitionRef.current.onnomatch = () => {
        console.log("no match");
      };

      recognitionRef.current.onend = () => {
        console.log("end recognition");
      };
    }
  }, [recognitionRef, append]);

  return (
    <div className="flex flex-col gap-4 relative">
      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto inner-shadow">
        {messages.map((m, index) => (
          <li key={index} className="max-w-3/4 flex gap-4 items-center">
            {m.role === "user" && (
              <span className="text-slate-500 w-8">You</span>
            )}
            {m.role !== "user" && (
              <span className="text-purple-300 w-8">AI</span>
            )}
            <div className="bg-slate-900/80 rounded-xl p-4">
              {m.role === "user" && (
                <span className="text-slate-500">{m.content}</span>
              )}
              {m.role !== "user" && (
                <span className="text-slate-300">{m.content}</span>
              )}
            </div>
          </li>
        ))}
        <li ref={messagesEndRef}></li>
      </ul>

      <form className="flex gap-4 w-full" onSubmit={handlePrompt}>
        <audio ref={player} />
        <span
          className={classnames(
            [
              "rounded-full ",
              "flex-shrink-0",
              "bg-transparent ",
              "border ",
              "border-slate-200/50 ",
              "text-blue-300 ",
              "text-center ",
              "w-7",
            ],
            {
              "bg-red-500": recording,
            },
          )}
          onTouchStart={() => {
            recognitionRef.current?.start();
            setRecording(true);
          }}
          onMouseDown={() => {
            recognitionRef.current?.start();
            setRecording(true);
          }}
          onMouseUp={() => {
            recognitionRef.current?.stop();
            setRecording(false);
          }}
          onTouchEnd={() => {
            recognitionRef.current?.stop();
            setRecording(false);
          }}
        >
          <FaMicrophone className="inline-flex" />
        </span>
        <input
          placeholder="Ask me anything..."
          value={input}
          className="inline flex-shrink w-full bg-slate-800 text-xl shadow-lg px-2 rounded-xl text-slate-200 border-0 focus:border-0 outline-sky-500"
          onChange={handleInputChange}
        />
        <button className="inline" type="submit">
          <RxPaperPlane />
        </button>
      </form>
    </div>
  );
}
