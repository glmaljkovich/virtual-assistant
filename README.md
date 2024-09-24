# virtual-assistant
This is a demo of controlling a 3d avatar and make it have natural conversations using react-three-fiber, OpenAI API, ElevenLabs TTS, NextJs, vercel @ai/sdk and VRM avatars.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
### API endpoints
```
app/api
  chat
  emotion
  tts
```
- chat: chatGPT conversation API via vercel @ai/sdk
- emotion: send chatGpt the user's
question and get an emotion name to use for animating the avatar

- tts: ElevenLabs API

## Scene

The avatars are sourced from VRoid Studio since they can be animated via Adobe Mixamo and they include a controller for facial features.



