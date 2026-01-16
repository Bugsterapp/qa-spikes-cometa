import { Api } from '@cometa/trpc/src/concepts/types';

export const ConceptsServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_CONCEPTS_URL }).api;
