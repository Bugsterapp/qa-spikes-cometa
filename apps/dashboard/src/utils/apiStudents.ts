import { Api } from '@cometa/trpc/src/students/types';

export const StudentsServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_SCHOOLS_URL }).api;
