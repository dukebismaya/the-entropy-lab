import { FieldValue } from 'firebase-admin/firestore';
import type { IncomingMessage, ServerResponse } from 'http';
import { getAdminDb } from '../server/firebaseAdmin.js';

type FeedbackType = 'error' | 'feedback';

type FeedbackPayload = {
  type: FeedbackType;
  message: string;
  gameVersion?: string;
  platform?: string;
  renpyVersion?: string;
  scene?: string;
};

const allowedTypes: FeedbackType[] = ['error', 'feedback'];

const parseBody = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
  const knownBody = (req as IncomingMessage & { body?: unknown }).body;
  if (knownBody && typeof knownBody === 'object') {
    return knownBody as Record<string, unknown>;
  }

  return new Promise((resolve, reject) => {
    let data = '';
    req
      .on('data', chunk => {
        data += chunk;
      })
      .on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};

const validatePayload = (body: Record<string, unknown>): { payload?: FeedbackPayload; errors: string[] } => {
  const errors: string[] = [];
  const type = body.type;
  const message = body.message;
  const gameVersion = body.gameVersion;
  const platform = body.platform;
  const renpyVersion = body.renpyVersion;
  const scene = body.scene;

  if (!allowedTypes.includes(type as FeedbackType)) {
    errors.push('type must be "error" or "feedback"');
  }

  const messageString = typeof message === 'string' ? message.trim() : '';
  if (!messageString || messageString.length < 5) {
    errors.push('message must be a string with at least 5 characters');
  }

  if (gameVersion !== undefined && typeof gameVersion !== 'string') {
    errors.push('gameVersion must be a string when provided');
  }

  if (platform !== undefined && typeof platform !== 'string') {
    errors.push('platform must be a string when provided');
  }

  if (renpyVersion !== undefined && typeof renpyVersion !== 'string') {
    errors.push('renpyVersion must be a string when provided');
  }

  if (scene !== undefined && typeof scene !== 'string') {
    errors.push('scene must be a string when provided');
  }

  if (errors.length) {
    return { errors };
  }

  return {
    errors,
    payload: {
      type: type as FeedbackType,
      message: messageString,
      gameVersion: (gameVersion as string | undefined)?.trim(),
      platform: (platform as string | undefined)?.trim(),
      renpyVersion: (renpyVersion as string | undefined)?.trim(),
      scene: (scene as string | undefined)?.trim(),
    },
  };
};

const sendDiscordNotification = async (payload: FeedbackPayload) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL is not configured');
  }

  const lines = [
    `**New ${payload.type === 'error' ? 'Error' : 'Feedback'} Report**`,
    `Message: ${payload.message}`,
    payload.gameVersion ? `Game Version: ${payload.gameVersion}` : 'Game Version: n/a',
    payload.platform ? `Platform: ${payload.platform}` : 'Platform: n/a',
    payload.renpyVersion ? `Ren'Py Version: ${payload.renpyVersion}` : "Ren'Py Version: n/a",
    payload.scene ? `Scene: ${payload.scene}` : undefined,
    `Received At: ${new Date().toISOString()}`,
  ].filter(Boolean);

  const content = lines.join('\n').slice(0, 1900); // Discord limit is 2000 chars

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} ${text}`);
  }
};

const respond = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    respond(res, 405, { error: 'Method not allowed' });
    return;
  }

  let body: Record<string, unknown>;

  try {
    body = await parseBody(req);
  } catch (error) {
    respond(res, 400, { error: 'Invalid JSON payload' });
    return;
  }

  const { payload, errors } = validatePayload(body);

  if (!payload || errors.length) {
    respond(res, 400, { error: 'Validation failed', details: errors });
    return;
  }

  let db;
  try {
    db = getAdminDb();
  } catch (error) {
    console.error('Firebase Admin init error', error);
    respond(res, 500, { error: 'Server configuration error' });
    return;
  }

  const reportDocument: Record<string, unknown> = {
    type: payload.type,
    message: payload.message,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (payload.gameVersion) reportDocument.gameVersion = payload.gameVersion;
  if (payload.platform) reportDocument.platform = payload.platform;
  if (payload.renpyVersion) reportDocument.renpyVersion = payload.renpyVersion;
  if (payload.scene) reportDocument.scene = payload.scene;

  try {
    await db.collection('gameReports').add(reportDocument);
    await sendDiscordNotification(payload);
    respond(res, 200, { success: true });
  } catch (error) {
    console.error('feedback API error', error);
    respond(res, 500, { error: 'Failed to process feedback' });
  }
}
