export const ALLOWED_MEMBERSHIPS = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];

export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
}

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024;
export const ALLOWED_PDF_TYPES = ['application/pdf'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export enum DocumentSection {
  Articles = 'articles',
  ProofOfAddress = 'proofOfAddress',
  LegalRepresentative = 'legalRepresentative',
}

export type DocumentType = 'articles_of_incorporation' | 'proof_of_address' | 'legal_representative';

export const DOCUMENT_CONFIG = {
  [DocumentSection.Articles]: {
    title: 'Acta constitutiva',
    description: 'Sube el documento que acredita la constitución legal del colegio.',
    successMessage: 'Acta constitutiva guardada correctamente',
    documentType: 'articles_of_incorporation' as DocumentType,
    filesKey: 'articles_of_incorporation_files' as const,
    statusKey: 'articles_of_incorporation' as const,
  },
  [DocumentSection.ProofOfAddress]: {
    title: 'Comprobante de domicilio',
    description: 'Adjunta un recibo reciente (máx. 2 meses) de luz, agua o teléfono.',
    successMessage: 'Comprobante de domicilio guardado correctamente',
    documentType: 'proof_of_address' as DocumentType,
    filesKey: 'proof_of_address_files' as const,
    statusKey: 'proof_of_address' as const,
  },
  [DocumentSection.LegalRepresentative]: {
    title: 'Representante Legal',
    description: 'Completa los datos y sube la identificación oficial del representante legal.',
    successMessage: 'Representante legal guardado correctamente',
    documentType: 'legal_representative' as DocumentType,
    filesKey: 'legal_representative_files' as const,
    statusKey: 'legal_representative_id' as const,
  },
};

export const DOCUMENT_SECTIONS_ORDER = [
  DocumentSection.Articles,
  DocumentSection.ProofOfAddress,
  DocumentSection.LegalRepresentative,
] as const;

export const DETAILS_DRAWER_SHEET_CLASS =
  'max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]';

export const FORM_STYLES = {
  loadingContainer: 'flex items-center justify-center h-40',
  loadingImage: 'mx-auto',
  formContainer: 'flex flex-col gap-8',
  inputGroup: 'flex flex-col gap-2',
  label: 'text-[#22283a] text-base font-normal',
  separator: 'w-full h-px bg-[#DFE3E8]',
  sectionTitle: 'text-[#22283a] text-base font-semibold',
} as const;

export const COMMON_PLACEHOLDERS = {
  fileUpload:
    "Arrastra el archivo o <span class='text-blue-600 font-bold cursor-pointer underline font-lota'>haz click aquí</span> para seleccionarlo desde tu computadora",
} as const;
