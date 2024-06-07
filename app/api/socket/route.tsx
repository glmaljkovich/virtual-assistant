import { WebSocketServer, WebSocket } from 'ws';
import type { NextApiRequest, NextApiResponse } from 'next';

let wss: WebSocketServer;
let elevenWs: WebSocket | null = null;

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    wss.on('connection', (ws) => {
      ws.on('message', async (body) => {
        const { message, assistant } = JSON.parse(body.toString());

        if (!elevenWs || elevenWs.readyState !== WebSocket.OPEN) {
            const austinVoice = "Xb3zeLrTi6F4ziIcXdwk"
            const astridVoice = "Qdi0R9qF3aZ4OQvNyxyM"
            const assistantVoices = new Map(Object.entries({
                'Illia': austinVoice,
                'Amelia': astridVoice
            }))
            
            const voiceId = assistantVoices.get(assistant)
            const model = "eleven_turbo_v2"
            const elevenLabsEndpoint = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&optimize_streaming_latency=1`;

            const elevenWs = new WebSocket(elevenLabsEndpoint, {
            headers: {
                'Authorization': `Bearer ${elevenLabsApiKey}`
            }
            });

            elevenWs.on('open', () => {
                const text = message.length > 0 ? message: " "
                const streamReq = JSON.stringify({
                    text: text,
                    voice_settings: {
                        similarity_boost: 0.75,
                        stability: 0.5
                    },
                    xi_api_key: elevenLabsApiKey
                })
                elevenWs.send(streamReq);
            });

            elevenWs.on('message', (data) => {
            if (typeof data === 'string') {
                const buffer = Buffer.from(data, 'base64');
                ws.send(buffer);
            } else if (data instanceof Buffer || data instanceof Uint8Array) {
                ws.send(data);
            }
            });

            elevenWs.on('close', () => {
            ws.close();
            });

            elevenWs.on('error', (error) => {
            console.error('WebSocket error:', error);
            ws.close();
            });
        } else {
            const streamReq = JSON.stringify({
                text: message,
                voice_settings: {
                    similarity_boost: 0.75,
                    stability: 0.5
                },
                xi_api_key: elevenLabsApiKey
            })
            elevenWs.send(streamReq);
        }
      });
    });
  }

  res.status(200).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
