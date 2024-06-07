// import { NextApiRequest, NextApiResponse } from 'next';
// import { NextResponse } from 'next/server';
// import WebSocket from 'ws'

// export async function POST(req: NextApiRequest, res: NextApiResponse) {

//   const { message, assistant } = req.body;

//   const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY; // Store your API key in environment variables
  
//   const austinVoice = "Xb3zeLrTi6F4ziIcXdwk"
//   const astridVoice = "Qdi0R9qF3aZ4OQvNyxyM"
//   const assistantVoices = new Map(Object.entries({
//       'Illia': austinVoice,
//       'Amelia': astridVoice
//     }))
    
//   const voiceId = assistantVoices.get(assistant)
//   const model = "eleven_turbo_v2"
//   const elevenLabsEndpoint = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&optimize_streaming_latency=1`;

//   const WebSocket = require('ws');

//   const ws = new WebSocket(elevenLabsEndpoint, {
//     headers: {
//       'Authorization': `Bearer ${elevenLabsApiKey}`
//     }
//   });

//   const stream = new ReadableStream({
//     start(controller) {
//       ws.on('open', () => {
//         const streamReq = JSON.stringify({
//             text: message,
//             voice_settings: {
//                 similarity_boost: 0.75,
//                 stability: 0.5
//             },
//             xi_api_key: elevenLabsApiKey
//         })
//         ws.send(streamReq);
//       });

//       ws.on('message', (data: WebSocket.Data) => {
//         if (typeof data === 'string') {
//           const buffer = Buffer.from(data, 'base64');
//           controller.enqueue(buffer);
//         } else if (data instanceof Buffer || data instanceof Uint8Array) {
//           controller.enqueue(data);
//         }
//       });

//       ws.on('close', () => {
//         controller.close();
//       });

//       ws.on('error', (error: Error) => {
//         console.error('WebSocket error:', error);
//         controller.error(error);
//       });
//     },
//   });

//   return new NextResponse(stream, {
//     headers: {
//       'Content-Type': 'application/octet-stream',
//       'Access-Control-Allow-Origin': '*',
//       'Transfer-Encoding': 'chunked',
//     },
//   });
// }
