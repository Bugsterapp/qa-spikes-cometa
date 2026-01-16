import { protectedProcedure, createTRPCRouter } from '../trpc';
import { z } from 'zod';
import handleTRPCError from '../../../utils/trpcErrorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_BASE_URL || '';

export const backofficeRouter = createTRPCRouter({
  updateCSD: protectedProcedure
    .input(
      z.object({
        fiscalEntityId: z.string(),
        csd_key_file: z.any(),
        csd_certificate_file: z.any(),
        csd_password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const keyFile = processFile(input.csd_key_file);
        const certFile = processFile(input.csd_certificate_file);

        if (!keyFile || !certFile) {
          throw new Error('Error al procesar los archivos CSD. Por favor intenta nuevamente.');
        }

        const formData = new FormData();
        formData.append('fiscal_entity', input.fiscalEntityId);
        formData.append('password', input.csd_password);
        formData.append('key_file', keyFile);
        formData.append('cer_file', certFile);

        const response = await fetch(`${API_BASE_URL}/api/v1/backoffice/csd/`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorMessage = await parseErrorResponse(response);
          throw new Error(errorMessage);
        }

        return await response.json();
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});

function base64FileIntoFileBlob(base64Data: string, name: string, type: string): File {
  const binaryData = Buffer.from(base64Data, 'base64');
  const uint8Array = new Uint8Array(binaryData);
  return new File([uint8Array], name, { type });
}

function processFile(fileData: any): File | null {
  if (!fileData || typeof fileData !== 'object') return null;

  const { name, type, data } = fileData as { name: string; type: string; data: string };

  if (!data?.startsWith('data:')) return null;

  const splitData = data.split(',');
  if (splitData.length <= 1 || !splitData[1]) return null;

  const base64Data = splitData[1];
  return base64FileIntoFileBlob(base64Data, name, type);
}

function sanitizeJsonString(jsonStr: string): string {
  let result = '';
  let inDoubleQuote = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (char === '"') {
      inDoubleQuote = !inDoubleQuote;
      result += char;
    } else if (char === "'" && !inDoubleQuote) {
      result += '"';
    } else {
      result += char;
    }
  }

  return result;
}

function extractErrorMessages(errorObj: Record<string, unknown>): string[] {
  const errorMessages: string[] = [];

  for (const messages of Object.values(errorObj)) {
    if (Array.isArray(messages)) {
      errorMessages.push(...messages);
    } else if (typeof messages === 'string') {
      errorMessages.push(messages);
    }
  }

  return errorMessages;
}

function parseEmbeddedJsonError(rawError: string): string {
  const dictMatch = rawError.match(/\{[\s\S]*?\}/);

  if (!dictMatch) return rawError;

  try {
    const jsonStr = dictMatch[0];
    const sanitized = sanitizeJsonString(jsonStr);
    const errorObj = JSON.parse(sanitized);
    const errorMessages = extractErrorMessages(errorObj);

    return errorMessages.length > 0 ? errorMessages.join('. ') : rawError;
  } catch {
    return rawError;
  }
}

async function parseErrorResponse(response: Response): Promise<string> {
  const defaultError = 'Error al procesar la solicitud';

  try {
    const errorText = await response.text();
    const errorData = JSON.parse(errorText);

    if (errorData.error) {
      return parseEmbeddedJsonError(errorData.error as string);
    }

    if (errorData.detail) return errorData.detail;
    if (errorData.message) return errorData.message;

    return defaultError;
  } catch {
    return defaultError;
  }
}
