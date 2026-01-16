import { Api } from '@cometa/trpc/src/bot/types';

export const BotServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_BOT_URL }).api;
