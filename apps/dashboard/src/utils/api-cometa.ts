import { Api } from '@cometa/trpc/src/cometa/types';

export const CometaServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_COMETA_URL }).api;
