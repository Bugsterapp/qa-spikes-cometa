import { Api } from '@cometa/trpc/src/admissions/types';

export const AdmissionsServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_ADMISSIONS_URL }).api;
