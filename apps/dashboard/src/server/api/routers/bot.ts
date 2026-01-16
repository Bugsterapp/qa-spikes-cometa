import { protectedProcedure, createTRPCRouter } from '../trpc';
import { BotServiceClient } from '../../../utils/apiBot';
import { z } from 'zod';
import { BankName, Currency, DocumentType, TaxingSystem, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import handleTRPCError from '../../../utils/trpcErrorHandler';

const authHeader = `Token ${process.env.BOT_API_TOKEN}`;
const PAGE_SIZE = 50;

const legalDocumentsSchema = z.object({
  legal_representative_name: z.string().optional().nullable(),
  legal_representative_last_name: z.string().optional().nullable(),
  legal_representative_curp: z.string().optional().nullable(),
  legal_representative_birth_date: z.string().optional().nullable(),
  web_url: z.string().optional().nullable(),
  proof_of_address_issued_at: z.string().optional().nullable(),
  status: z.record(z.string().optional().nullable()).optional().nullable(),
});

export const botRouter = createTRPCRouter({
  getBankAccounts: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        cursor: z.string().nullish(),
        pageSize: z.number().optional().default(PAGE_SIZE),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await BotServiceClient.getSchoolBankAccountsApiV1SchoolSchoolIdBankAccountsGet(
          input.schoolId,
          {
            page: Number(input.cursor) || 1,
            page_size: input.pageSize,
          },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  createBankAccount: protectedProcedure.input(z.instanceof(FormData)).mutation(async ({ input }) => {
    const schoolId = input.get('schoolId') as string;
    const owner = input.get('owner') as string;
    const nickname = input.get('nickname') as string;
    const bankName = input.get('bank_name') as BankName;
    const accountNumber = input.get('account_number') as string;
    const accountCurrency = input.get('account_currency') as Currency;
    const documentType = input.get('document_type') as DocumentType;
    const documentNumber = input.get('document_number') as string;
    const file = input.get('file') as File | null;

    try {
      const response = await BotServiceClient.createBankAccountApiV1SchoolSchoolIdBankAccountPost(
        schoolId,
        {
          owner,
          nickname,
          bank_name: bankName,
          account_number: accountNumber,
          account_currency: accountCurrency,
          document_type: documentType,
          document_number: documentNumber,
          ...(file ? { file } : {}),
        },
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      handleTRPCError(error);
    }
  }),
  deleteBankAccount: protectedProcedure
    .input(
      z.object({
        bankAccountId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await BotServiceClient.deleteBankAccountApiV1BankAccountBankAccountIdDelete(
          input.bankAccountId,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  getOnboarding: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await BotServiceClient.getOnboardingApiV1OnboardingGet(
          { school_id: input.schoolId },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        if (!response.data || response.data.length === 0) {
          const createResponse = await BotServiceClient.createOnboardingApiV1OnboardingPost(
            {
              school_id: input.schoolId,
              state: {
                welcome_incomplete: false,
                show_onboarding_in_nav: true,
                setup_confirmed: false,
              },
            },
            {
              headers: {
                Authorization: authHeader,
              },
            }
          );
          return [createResponse.data];
        }

        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  patchOnboarding: protectedProcedure
    .input(
      z.object({
        onboardingId: z.string(),
        data: z.object({
          state: z
            .object({
              welcome_incomplete: z.boolean().optional(),
              show_onboarding_in_nav: z.boolean().optional(),
              setup_confirmed: z.boolean().optional(),
              tasks: z.record(z.string(), z.nativeEnum(OnboardingTaskStatus)).optional().nullable(),
            })
            .optional()
            .nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await BotServiceClient.patchOnboardingApiV1OnboardingOnboardingIdPatch(
          input.onboardingId,
          input.data,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  getFiscalEntities: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await BotServiceClient.getSchoolFiscalEntitiesApiV1SchoolSchoolIdFiscalEntitiesGet(
          input.schoolId,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  createFiscalEntity: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        data: z.object({
          name: z.string(),
          tax_id: z.string(),
          taxing_system: z.nativeEnum(TaxingSystem),
          country: z.string().optional().nullable(),
          state: z.string().optional().nullable(),
          city: z.string().optional().nullable(),
          address_name: z.string().optional().nullable(),
          postal_code: z.string().optional().nullable(),
          address_number: z.string().optional().nullable(),
          district: z.string().optional().nullable(),
          issued_at: z.string(),
          csd_password: z.string().optional().nullable(),
          fiscal_entity_file: z.any().optional(),
          csd_key_file: z.any().optional(),
          csd_certificate_file: z.any().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const processedData = { ...input.data };

        const fileFields = ['fiscal_entity_file', 'csd_key_file', 'csd_certificate_file'];

        const processFileField = (fieldName: string): void => {
          const fileData = processedData[fieldName as keyof typeof processedData];

          const isFileDataObject = fileData && typeof fileData === 'object';
          if (!isFileDataObject) return;

          const { name, type, data } = fileData as { name: string; type: string; data: string };

          const isDataFormattedCorrectly = data?.startsWith('data:');
          if (!isDataFormattedCorrectly) return;

          const splitData = data.split(',');

          if (splitData.length <= 1) return;

          const base64Data = splitData[1];

          const fileBlob = base64FileIntoFileBlob(base64Data, name, type);
          (processedData as Record<string, unknown>)[fieldName] = fileBlob;
        };

        const base64FileIntoFileBlob = (base64Data: string, name: string, type: string): File => {
          const binaryData = Buffer.from(base64Data, 'base64');
          const uint8Array = new Uint8Array(binaryData);
          return new File([uint8Array], name, { type });
        };

        fileFields.forEach((fieldName) => processFileField(fieldName));

        const response = await BotServiceClient.createFiscalEntityApiV1SchoolSchoolIdFiscalEntityPost(
          input.schoolId,
          processedData as Parameters<typeof BotServiceClient.createFiscalEntityApiV1SchoolSchoolIdFiscalEntityPost>[1],
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        return response.data;
      } catch (error: unknown) {
        handleTRPCError(error);
      }
    }),
  deleteFiscalEntity: protectedProcedure
    .input(
      z.object({
        fiscalEntityId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await BotServiceClient.deleteFiscalEntityApiV1FiscalEntityFiscalEntityIdDelete(
          input.fiscalEntityId,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  getLegalDocuments: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await BotServiceClient.getLegalDocumentsApiV1LegalDocumentsGet(
          {
            school_id: input.schoolId,
          },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data[0] || null;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  createLegalDocuments: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        data: legalDocumentsSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await BotServiceClient.createLegalDocumentsApiV1LegalDocumentsSchoolSchoolIdPost(
          input.schoolId,
          input.data,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  updateLegalDocuments: protectedProcedure
    .input(
      z.object({
        legalDocumentsId: z.string(),
        data: legalDocumentsSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await BotServiceClient.updateLegalDocumentsApiV1LegalDocumentsLegalDocumentsIdPatch(
          input.legalDocumentsId,
          input.data,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  deleteLegalDocumentFile: protectedProcedure
    .input(
      z.object({
        legalDocumentsId: z.string(),
        fileId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await BotServiceClient.deleteLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdFilesFileIdDelete(
          input.legalDocumentsId,
          input.fileId,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
