import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod/v3';
import { NextApiRequest, NextApiResponse } from 'next';
import * as Sentry from '@sentry/nextjs';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Create a new ratelimiter, that allows 100 requests per hour
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '24 h'),
  analytics: true,
});

const questionSchema = z.object({
  question: z.string(),
  type: z.enum(['multiple_choice', 'open_ended', 'text']),
  options: z.array(z.string()),
});

const generatedContentSchema = z.object({
  title: z.string(),
  message: z.string(),
  questions: z.array(questionSchema),
  extra_data: z.string(),
});

export interface Question {
  question: string;
  type: 'multiple_choice' | 'open_ended' | 'text';
  options: string[];
}

export interface AnnouncementAIResult {
  title: string;
  message: string;
  questions: Question[];
  needsExtraData: boolean;
  extraDataPrompt?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting check
  const forwarded = req.headers['x-forwarded-for'];

  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress || '127.0.0.1';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }

  try {
    const { action, text, currentMessageForPrompt, customPrompt, extraDataRequest, userExtraData } = req.body;

    switch (action) {
      case 'improveText':
        return await handleImproveText(text, res);

      case 'summarizeText':
        return await handleSummarizeText(text, res);

      case 'emojifyText':
        return await handleEmojifyText(text, res);

      case 'generateContent':
        return await handleGenerateContent(currentMessageForPrompt, customPrompt, res);

      case 'submitExtraData':
        return await handleSubmitExtraData(currentMessageForPrompt, extraDataRequest, userExtraData, res);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleImproveText(currentMessage: string, res: NextApiResponse) {
  if (!currentMessage?.trim()) {
    return res.json({ text: currentMessage });
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4.1'),
      system:
        'Eres un asistente de una escuela que se encarga de enviar comunicados de parte del colegio a los padres de familia.',
      prompt: `Mejora el siguiente texto manteniendo su significado pero haciéndolo más profesional y claro: ${currentMessage}. Solo devuelve el texto mejorado sin ningún otro comentario.`,
    });

    return res.json({ text: text.trim() });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo mejorar el texto. Por favor, intenta de nuevo.' });
  }
}

async function handleSummarizeText(currentMessage: string, res: NextApiResponse) {
  if (!currentMessage?.trim()) {
    return res.json({ text: currentMessage });
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4.1'),
      system:
        'Eres un asistente de una escuela que se encarga de enviar comunicados de parte del colegio a los padres de familia.',
      prompt: `Resumen el siguiente texto manteniendo su significado: ${currentMessage}. Solo devuelve el texto resumido sin ningún otro comentario.`,
    });

    return res.json({ text: text.trim() });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo resumir el texto. Por favor, intenta de nuevo.' });
  }
}

async function handleEmojifyText(currentMessage: string, res: NextApiResponse) {
  if (!currentMessage?.trim()) {
    return res.json({ text: currentMessage });
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4.1'),
      system:
        'Eres un asistente de una escuela que se encarga de enviar comunicados de parte del colegio a los padres de familia.',
      prompt: `Reescribe el siguiente texto agregando emojis haciéndolo más amigable y divertido: ${currentMessage}. Solo devuelve el texto reescrito sin ningún otro comentario.`,
    });

    return res.json({ text: text.trim() });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo emojificar el texto. Por favor, intenta de nuevo.' });
  }
}

async function handleGenerateContent(
  currentMessageForPrompt: string,
  customPrompt: string | undefined,
  res: NextApiResponse
): Promise<void> {
  const prompt =
    customPrompt ||
    `A partir del siguiente texto, genera un título y un mensaje para un comunicado cuyo contexto es el de colegios primarios y secundarios privados de latinoamérica. Además, puedes generar, en caso de ser necesario, preguntas con opciones o preguntas abiertas: "${currentMessageForPrompt}". Si necesitas algún dato adicional, para poder generar el comunicado, puedes pedirlo a través del output "extra_data".`;

  try {
    const { object } = await generateObject({
      model: openai('gpt-4.1'),
      prompt: prompt,
      schema: generatedContentSchema,
    });

    if (object.extra_data && object.extra_data.trim() && !customPrompt) {
      return res.json({
        title: '',
        message: '',
        questions: [],
        needsExtraData: true,
        extraDataPrompt: object.extra_data,
      } as AnnouncementAIResult);
    } else {
      return res.json({
        title: object.title,
        message: object.message,
        questions: object.questions,
        needsExtraData: false,
      } as AnnouncementAIResult);
    }
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo generar el contenido. Por favor, intenta de nuevo.' });
  }
}

async function handleSubmitExtraData(
  initialUserMessage: string,
  extraDataRequest: string,
  userExtraData: string,
  res: NextApiResponse
): Promise<void> {
  const fullContextPrompt = `A partir del siguiente texto inicial del usuario: "${initialUserMessage}"

La IA había solicitado información adicional: "${extraDataRequest}"

Respuesta del usuario a la información solicitada: "${userExtraData}"

Ahora, con toda esta información completa, genera un título y un mensaje profesional para un comunicado cuyo contexto es el de colegios primarios y secundarios privados de latinoamérica. Ya no solicites más información adicional en extra_data, genera el contenido final.`;

  try {
    const { object } = await generateObject({
      model: openai('gpt-4.1'),
      prompt: fullContextPrompt,
      schema: generatedContentSchema,
    });

    return res.json({
      title: object.title,
      message: object.message,
      questions: object.questions,
      needsExtraData: false,
    } as AnnouncementAIResult);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo generar el contenido. Por favor, intenta de nuevo.' });
  }
}
