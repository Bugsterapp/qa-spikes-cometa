/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AccountType */
export enum AccountType {
  CC = 'CC',
  CA = 'CA',
  CB = 'CB',
}

/** AllowedColumnName */
export enum AllowedColumnName {
  CURP = 'CURP',
  NombresR1 = 'Nombres R1',
  ApellidosR1 = 'Apellidos R1',
  NombresR2 = 'Nombres R2',
  ApellidosR2 = 'Apellidos R2',
  EmailR1 = 'Email R1',
  EmailR2 = 'Email R2',
  FechaDeNacimiento = 'Fecha de Nacimiento',
  Matricula = 'Matricula',
  Genero = 'Genero',
  GeneroR1 = 'Genero R1',
  GeneroR2 = 'Genero R2',
}

/** AytColumnName */
export enum AytColumnName {
  CURP = 'CURP',
  Matricula = 'Matricula',
  Nivel = 'Nivel',
  Grado = 'Grado',
  Grupo = 'Grupo',
  Nombres = 'Nombres',
  Apellidos = 'Apellidos',
  Genero = 'Genero',
  FechaDeNacimiento = 'Fecha de Nacimiento',
  NombresR1 = 'Nombres R1',
  ApellidosR1 = 'Apellidos R1',
  CelularR1 = 'Celular R1',
  EmailR1 = 'Email R1',
  GeneroR1 = 'Genero R1',
  NombresR2 = 'Nombres R2',
  ApellidosR2 = 'Apellidos R2',
  CelularR2 = 'Celular R2',
  EmailR2 = 'Email R2',
  GeneroR2 = 'Genero R2',
}

/** BankAccountEntity */
export interface BankAccountEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Owner */
  owner: string;
  /** Nickname */
  nickname: string;
  /** Bank Name */
  bank_name: string;
  /** Account Type */
  account_type: string;
  /** Account Number */
  account_number: string;
  /** Document Type */
  document_type: string;
  /** Document Number */
  document_number: string;
}

/** BankName */
export enum BankName {
  ABCCAPITAL = 'ABC CAPITAL',
  ACTINVER = 'ACTINVER',
  AFIRME = 'AFIRME',
  AKALA = 'AKALA',
  ALTERNATIVOS = 'ALTERNATIVOS',
  ARCUS = 'ARCUS',
  ASPINTEGRAOPC = 'ASP INTEGRA OPC',
  AUTOFIN = 'AUTOFIN',
  AZTECA = 'AZTECA',
  BAJIO = 'BAJIO',
  BANAMEX = 'BANAMEX',
  BANCOFINTERRA = 'BANCO FINTERRA',
  BANCOS3 = 'BANCO S3',
  BANCOMEXT = 'BANCOMEXT',
  BANCOPPEL = 'BANCOPPEL',
  BANCREA = 'BANCREA',
  BANJERCITO = 'BANJERCITO',
  BANKOFAMERICA = 'BANK OF AMERICA',
  BANKAOOL = 'BANKAOOL',
  BANOBRAS = 'BANOBRAS',
  BANORTE = 'BANORTE',
  BANREGIO = 'BANREGIO',
  BANSEFI = 'BANSEFI',
  BANSI = 'BANSI',
  BANXICO = 'BANXICO',
  BARCLAYS = 'BARCLAYS',
  BBASE = 'BBASE',
  BBVAMEXICO = 'BBVA MEXICO',
  BMONEX = 'BMONEX',
  CAJAPOPMEXICA = 'CAJA POP MEXICA',
  CAJATELEFONIST = 'CAJA TELEFONIST',
  CBINTERCAM = 'CB INTERCAM',
  CIBOLSA = 'CI BOLSA',
  CIBANCO = 'CIBANCO',
  COMPARTAMOS = 'COMPARTAMOS',
  CONSUBANCO = 'CONSUBANCO',
  CREDICAPITAL = 'CREDICAPITAL',
  CREDITSUISSE = 'CREDIT SUISSE',
  CRISTOBALCOLON = 'CRISTOBAL COLON',
  CoDiValida = 'CoDi Valida',
  DONDE = 'DONDE',
  EVERCORE = 'EVERCORE',
  FINAMEX = 'FINAMEX',
  FINCOMUN = 'FINCOMUN',
  FOMPED = 'FOMPED',
  FONDOFIRA = 'FONDO (FIRA)',
  GBM = 'GBM',
  GEMSTP = 'GEM - STP',
  HIPOTECARIAFED = 'HIPOTECARIA FED',
  HSBC = 'HSBC',
  ICBC = 'ICBC',
  INBURSA = 'INBURSA',
  INDEVAL = 'INDEVAL',
  INMOBILIARIO = 'INMOBILIARIO',
  INTERCAMBANCO = 'INTERCAM BANCO',
  INVERCAP = 'INVERCAP',
  INVEX = 'INVEX',
  JPMORGAN = 'JP MORGAN',
  KUSPIT = 'KUSPIT',
  LIBERTAD = 'LIBERTAD',
  MASARI = 'MASARI',
  MIFEL = 'MIFEL',
  MIZUHOBANK = 'MIZUHO BANK',
  MONEXCB = 'MONEXCB',
  MUFG = 'MUFG',
  MULTIVABANCO = 'MULTIVA BANCO',
  MULTIVACBOLSA = 'MULTIVA CBOLSA',
  NAFIN = 'NAFIN',
  PAGATODO = 'PAGATODO',
  PROFUTURO = 'PROFUTURO',
  REFORMA = 'REFORMA',
  SABADELL = 'SABADELL',
  SANTANDER = 'SANTANDER',
  SCOTIABANK = 'SCOTIABANK',
  SHINHAN = 'SHINHAN',
  STP = 'STP',
  TRANSFER = 'TRANSFER',
  UNAGRA = 'UNAGRA',
  VALMEX = 'VALMEX',
  VALUE = 'VALUE',
  VEPORMAS = 'VE POR MAS',
  VECTOR = 'VECTOR',
  VOLKSWAGEN = 'VOLKSWAGEN',
}

/** Body_create_bank_account_api_v1_school__school_id__bank_account_post */
export interface BodyCreateBankAccountApiV1SchoolSchoolIdBankAccountPost {
  /**
   * File
   * @format binary
   */
  file?: File;
  /** Owner */
  owner: string;
  /** Nickname */
  nickname: string;
  bank_name: BankName;
  /** @default "CB" */
  account_type?: AccountType;
  /** Account Number */
  account_number: string;
  /** @default "MXN" */
  account_currency?: Currency;
  /** @default "RFC" */
  document_type?: DocumentType;
  /** Document Number */
  document_number: string;
}

/** Body_create_fiscal_entity_api_v1_school__school_id__fiscal_entity_post */
export interface BodyCreateFiscalEntityApiV1SchoolSchoolIdFiscalEntityPost {
  /**
   * Fiscal Entity File
   * @format binary
   */
  fiscal_entity_file?: File;
  /**
   * Csd Key File
   * @format binary
   */
  csd_key_file?: File;
  /**
   * Csd Certificate File
   * @format binary
   */
  csd_certificate_file?: File;
  /** Name */
  name: string;
  /** Tax Id */
  tax_id: string;
  taxing_system: TaxingSystem;
  /**
   * Country
   * Country code (only MX is currently supported)
   * @default "MX"
   */
  country?: string | null;
  /** State */
  state?: string | null;
  /** City */
  city?: string | null;
  /** Address Name */
  address_name?: string | null;
  /** Postal Code */
  postal_code?: string | null;
  /** Address Number */
  address_number?: string | null;
  /** District */
  district?: string | null;
  /**
   * Issued At
   * @format date-time
   */
  issued_at: string;
  /** Csd Password */
  csd_password?: string | null;
}

/** Body_get_enrollment_api_v1_schoolcycle__schoolcycle_id__enrollment_post */
export interface BodyGetEnrollmentApiV1SchoolcycleSchoolcycleIdEnrollmentPost {
  /**
   * Csv File
   * @format binary
   */
  csv_file: File;
}

/** Body_payments_register_api_v1_school__school_id__upload_payments_report_post */
export interface BodyPaymentsRegisterApiV1SchoolSchoolIdUploadPaymentsReportPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_process_file_to_cometa_structure_api_v1_onboarding_process_cometa__school_id__post */
export interface BodyProcessFileToCometaStructureApiV1OnboardingProcessCometaSchoolIdPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_process_file_to_servo_structure_api_v1_onboarding_process_servo__school_id__post */
export interface BodyProcessFileToServoStructureApiV1OnboardingProcessServoSchoolIdPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_process_file_to_standard_structure_api_v1_onboarding_process_standard__school_id__post */
export interface BodyProcessFileToStandardStructureApiV1OnboardingProcessStandardSchoolIdPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_file_api_v1_onboarding_upload_file_post */
export interface BodyUploadFileApiV1OnboardingUploadFilePost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_legal_document_file_api_v1_legal_documents__legal_documents_id__upload_file_post */
export interface BodyUploadLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdUploadFilePost {
  /** Document Type */
  document_type: string;
  /**
   * File
   * @format binary
   */
  file: File;
}

/** BotBankAccountEntity */
export interface BotBankAccountEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Owner */
  owner: string;
  /** Nickname */
  nickname: string;
  /** Bank Name */
  bank_name: BankName | string;
  /** Account Type */
  account_type: AccountType | string;
  /** Account Number */
  account_number: string;
  /** Document Type */
  document_type: DocumentType | string;
  /** Document Number */
  document_number: string;
  /** File Url */
  file_url?: string | null;
  status: OnboardingStatus;
  /** Reason */
  reason?: string | null;
}

/** BotFiscalEntityDTO */
export interface BotFiscalEntityDTO {
  /** Country */
  country?: string | null;
  /** State */
  state?: string | null;
  /** City */
  city?: string | null;
  /** Address Name */
  address_name?: string | null;
  /** Postal Code */
  postal_code?: string | null;
  /** Address Number */
  address_number?: string | null;
  /** District */
  district?: string | null;
  /** Name */
  name: string;
  /** Tax Id */
  tax_id: string;
  taxing_system: TaxingSystem;
  status: OnboardingStatus;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Csd Password */
  csd_password?: string | null;
  /** Reason */
  reason?: string | null;
  /** Fiscal Entity File Url */
  fiscal_entity_file_url?: string | null;
  /** Issued At */
  issued_at?: string | null;
  /** Csd Key File Url */
  csd_key_file_url?: string | null;
  /** Csd Certificate File Url */
  csd_certificate_file_url?: string | null;
  /** Created */
  created?: string | null;
  /** Certificate Expiry */
  certificate_expiry?: string | null;
  /** Taxing System Name */
  taxing_system_name: string;
}

/** ColumnStatusEntity */
export interface ColumnStatusEntity {
  /** Column */
  column: string;
  /** Status */
  status: string;
  /** Total */
  total: number;
  /** Valid */
  valid: number;
  /** Invalid */
  invalid: number;
  /** Empty */
  empty: number;
}

/** CompleteSchoolCreationRequest */
export interface CompleteSchoolCreationRequest {
  school: SchoolCreationRequest;
  user: UserCreationRequestForCompleteSchool;
}

/** CompleteSchoolCreationResponse */
export interface CompleteSchoolCreationResponse {
  school: SchoolCreationResponse;
  user: UserCreationResponse;
  membership: MembershipCreationResponse;
  onboarding: OnboardingEntity;
}

/** ConceptEntity */
export interface ConceptEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /**
   * Entity Id
   * @format uuid
   */
  entity_id: string;
  /**
   * Payout Config Id
   * @format uuid
   */
  payout_config_id: string;
}

/** CreateLegalDocumentsRequest */
export interface CreateLegalDocumentsRequest {
  /** Legal Representative Name */
  legal_representative_name?: string | null;
  /** Legal Representative Last Name */
  legal_representative_last_name?: string | null;
  /** Legal Representative Curp */
  legal_representative_curp?: string | null;
  /** Legal Representative Birth Date */
  legal_representative_birth_date?: string | null;
  /** Web Url */
  web_url?: string | null;
  /** Proof Of Address Issued At */
  proof_of_address_issued_at?: string | null;
}

/** Currency */
export enum Currency {
  MXN = 'MXN',
}

/** DocumentType */
export enum DocumentType {
  RFC = 'RFC',
  CURP = 'CURP',
}

/** DownloadFileEntity */
export interface DownloadFileEntity {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** DriveFolderUrlRequest */
export interface DriveFolderUrlRequest {
  /** Drive Folder Url */
  drive_folder_url: string;
}

/** EmailRequest */
export interface EmailRequest {
  /** Email */
  email: string;
}

/** Enrollment */
export interface Enrollment {
  /** Student Enrollment Code */
  student_enrollment_code: string;
  /** Student Id */
  student_id?: string | null;
  /** Student Name */
  student_name?: string | null;
  /** Student Last Name */
  student_last_name?: string | null;
  /** Id */
  id?: string | null;
  /** Section Id */
  section_id?: string | null;
  /** Level */
  level?: string | null;
  /** Grade */
  grade?: string | null;
  /** Group */
  group?: string | null;
}

/** FailedStudent */
export interface FailedStudent {
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /** Error */
  error: string;
}

/** FileEntity */
export interface FileEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** File Reference */
  file_reference: string;
  /** File Name */
  file_name: string;
  /** File Type */
  file_type: string;
  /** File Size */
  file_size: number;
  /** Document Type */
  document_type?: string | null;
  /** @default "pending" */
  status?: OnboardingStatus;
  /** Reason */
  reason?: string | null;
  /**
   * Created
   * @format date-time
   */
  created: string;
  /**
   * Modified
   * @format date-time
   */
  modified: string;
}

/** FileResponse */
export interface FileResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** File Url */
  file_url: string;
  /** File Name */
  file_name: string;
  /** File Type */
  file_type: string;
  /** File Size */
  file_size: number;
  /** Document Type */
  document_type?: string | null;
  /** @default "pending" */
  status?: OnboardingStatus;
  /** Reason */
  reason?: string | null;
  /**
   * Created
   * @format date-time
   */
  created: string;
  /**
   * Modified
   * @format date-time
   */
  modified: string;
}

/** FiscalEntityEntity */
export interface FiscalEntityEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Tax Id */
  tax_id: string;
  /** Taxing System */
  taxing_system: string;
  /**
   * Certificate Expiry
   * @format date-time
   */
  certificate_expiry: string;
  /**
   * Uploaded Csds At
   * @format date-time
   */
  uploaded_csds_at: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
}

/** GenerateReportRequest */
export interface GenerateReportRequest {
  /** Drive Folder Url */
  drive_folder_url: string;
  /** School Cycle Id */
  school_cycle_id: string;
}

/** GuardianNotificationResumeEntity */
export interface GuardianNotificationResumeEntity {
  /** Total */
  total: number;
  /** Enabled */
  enabled: number;
  /** Enabled Email */
  enabled_email: number;
  /** Enabled Phone */
  enabled_phone: number;
  /** Available Email */
  available_email: number;
  /** Available Phone */
  available_phone: number;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** LegalDocumentsResponse */
export interface LegalDocumentsResponse {
  /** Legal Representative Name */
  legal_representative_name?: string | null;
  /** Legal Representative Last Name */
  legal_representative_last_name?: string | null;
  /** Legal Representative Curp */
  legal_representative_curp?: string | null;
  /** Legal Representative Birth Date */
  legal_representative_birth_date?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  status: LegalDocumentsStatus;
  /** Web Url */
  web_url?: string | null;
  /** Proof Of Address Issued At */
  proof_of_address_issued_at?: string | null;
  /**
   * Created
   * @format date-time
   */
  created: string;
  /**
   * Modified
   * @format date-time
   */
  modified: string;
  /**
   * Articles Of Incorporation Files
   * @default []
   */
  articles_of_incorporation_files?: FileResponse[];
  /**
   * Proof Of Address Files
   * @default []
   */
  proof_of_address_files?: FileResponse[];
  /**
   * Legal Representative Files
   * @default []
   */
  legal_representative_files?: FileResponse[];
}

/** LegalDocumentsStatus */
export interface LegalDocumentsStatus {
  general?: OnboardingStatus | null;
  articles_of_incorporation?: OnboardingStatus | null;
  proof_of_address?: OnboardingStatus | null;
  legal_representative_id?: OnboardingStatus | null;
}

/** LevelEntity */
export interface LevelEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Total Students */
  total_students: number;
  /** Sections */
  sections: SectionEntity[];
  /** Type */
  type: string;
  /** Order */
  order: number;
}

/** LoginRequest */
export interface LoginRequest {
  /** Username */
  username: string;
  /** Password */
  password: string;
}

/** MembershipCreationResponse */
export interface MembershipCreationResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** User Id */
  user_id: string | null;
  /** School Id */
  school_id: string | null;
  /** User */
  user: object | null;
  /** School */
  school: object | null;
}

/** OnboardingCreate */
export interface OnboardingCreate {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  state?: OnboardingState | null;
}

/** OnboardingEntity */
export interface OnboardingEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  state: OnboardingState;
  /**
   * Created
   * @format date-time
   */
  created: string;
  /**
   * Modified
   * @format date-time
   */
  modified: string;
}

/** OnboardingState */
export interface OnboardingState {
  /**
   * Welcome Incomplete
   * Whether the welcome step is incomplete
   * @default true
   */
  welcome_incomplete?: boolean;
  /**
   * Show Onboarding In Nav
   * Whether to show onboarding in navigation
   * @default false
   */
  show_onboarding_in_nav?: boolean;
  /**
   * Setup Confirmed
   * Whether the setup has been confirmed
   * @default false
   */
  setup_confirmed?: boolean;
  /**
   * Tasks
   * Status of each onboarding task
   */
  tasks?: Record<string, OnboardingTaskStatus>;
}

/** OnboardingStateUpdate */
export interface OnboardingStateUpdate {
  /** Welcome Incomplete */
  welcome_incomplete?: boolean | null;
  /** Show Onboarding In Nav */
  show_onboarding_in_nav?: boolean | null;
  /** Setup Confirmed */
  setup_confirmed?: boolean | null;
  /** Tasks */
  tasks?: Record<string, OnboardingTaskStatus> | null;
}

/** OnboardingStatus */
export enum OnboardingStatus {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
}

/** OnboardingTaskId */
export enum OnboardingTaskId {
  BankAccounts = 'bank-accounts',
  FiscalEntities = 'fiscal-entities',
  Invoicing = 'invoicing',
  DiscountsSurcharges = 'discounts-surcharges',
  Legal = 'legal',
  Students = 'students',
  AcademicLevels = 'academic-levels',
  CreateConcepts = 'create-concepts',
  AssignConcepts = 'assign-concepts',
  CreateScholarships = 'create-scholarships',
  AssignScholarships = 'assign-scholarships',
}

/** OnboardingTaskStatus */
export enum OnboardingTaskStatus {
  Pending = 'pending',
  Completed = 'completed',
  InReview = 'in-review',
  Error = 'error',
}

/** OnboardingUpdate */
export interface OnboardingUpdate {
  state?: OnboardingStateUpdate | null;
}

/** PaginatedBankAccountsResponse */
export interface PaginatedBankAccountsResponse {
  /** Count */
  count: number;
  /** Next */
  next?: string | null;
  /** Previous */
  previous?: string | null;
  /** Results */
  results: BotBankAccountEntity[];
  /** Page Size */
  page_size: number;
  /** Page Number */
  page_number: number;
}

/** PayinHistoryCreate */
export interface PayinHistoryCreate {
  /** User Email */
  user_email: string;
  /** Status */
  status: string;
  /** Original File */
  original_file: string;
  /** Pre Import File */
  pre_import_file: string;
  /** Imported File */
  imported_file: string;
  /** Payins Count */
  payins_count: number;
  /** Payins Processed Count */
  payins_processed_count: number;
  /** Guardian Notifications */
  guardian_notifications: string;
  /** Concept Restrictions */
  concept_restrictions: string;
}

/** PayinHistoryResponse */
export interface PayinHistoryResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date
   */
  created_at: string;
  /** User Email */
  user_email: string;
  /** Status */
  status: string;
  /** Original File */
  original_file: string;
  /** Pre Import File */
  pre_import_file: string;
  /** Imported File */
  imported_file: string;
  /** Payins Count */
  payins_count: number;
  /** Payins Processed Count */
  payins_processed_count: number;
  /** Guardian Notifications */
  guardian_notifications: string;
  /** Concept Restrictions */
  concept_restrictions: string;
}

/** PayinHistoryUpdate */
export interface PayinHistoryUpdate {
  /** Status */
  status?: string | null;
  /** Imported File */
  imported_file?: string | null;
  /** Payins Count */
  payins_count?: number | null;
  /** Payins Processed Count */
  payins_processed_count?: number | null;
  /** Guardian Notifications */
  guardian_notifications?: string | null;
  /** Concept Restrictions */
  concept_restrictions?: string | null;
}

/** PaymentsReportRequest */
export interface PaymentsReportRequest {
  /**
   * View Mode
   * @default "BY_GRADE_GROUP"
   */
  view_mode?: string;
  /** Drive Folder Url */
  drive_folder_url: string;
}

/** PreviewDataEntity */
export interface PreviewDataEntity {
  /** Columns */
  columns: string[][];
  /** Rows */
  rows?: string[][] | null;
  /** Rows Index */
  rows_index?: number[] | null;
}

/** ProcessedFileEntity */
export interface ProcessedFileEntity {
  /** Columns */
  columns: string[];
  /** Rows */
  rows: string[][];
  /** Rows Status */
  rows_status: RowStatusEntity[][];
  /** Rows Index */
  rows_index: number[];
  /** Resumen */
  resumen?: object | null;
  /** Download Url */
  download_url?: string | null;
  /** Columns Status */
  columns_status?: ColumnStatusEntity[] | null;
  /** Structure */
  structure?: object | null;
  /** Summary */
  summary?: object | null;
  /** Total Rows */
  total_rows?: number | null;
  /** Total Pages */
  total_pages?: number | null;
}

/** ProcessedFileEntityResponse */
export interface ProcessedFileEntityResponse {
  result: ProcessedFileEntity;
}

/** RowStatusEntity */
export interface RowStatusEntity {
  /** Valid */
  valid: boolean;
  /** Reason */
  reason?: string | null;
}

/** SchoolCreationRequest */
export interface SchoolCreationRequest {
  /**
   * Name
   * School name
   */
  name: string;
  /**
   * Phone
   * School phone number
   */
  phone: string;
  /**
   * Email
   * School email address
   */
  email: string;
  /**
   * Institutional Id
   * Institutional identifier
   */
  institutional_id: string;
  /**
   * Organization Id
   * Organization ID
   */
  organization_id?: string | null;
}

/** SchoolCreationResponse */
export interface SchoolCreationResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Phone */
  phone: string;
  /** Email */
  email: string;
  /** Institutional Id */
  institutional_id: string;
  /** Organization Id */
  organization_id: string | null;
  /** Short Slug */
  short_slug?: string | null;
  /** Slug Name */
  slug_name?: string | null;
  /** Status */
  status?: string | null;
  /** Country */
  country?: string | null;
  /** State */
  state?: string | null;
  /** City */
  city?: string | null;
  /** Address Name */
  address_name?: string | null;
  /** Address Number */
  address_number?: string | null;
  /** Postal Code */
  postal_code?: string | null;
  /** Logo */
  logo?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** SchoolEntity */
export interface SchoolEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Status */
  status: string;
  /** Logo */
  logo: string;
  /** Does Invoice */
  does_invoice: boolean;
  /** Partial Payment Interest Type */
  partial_payment_interest_type: string;
  /** Partial Payment Interest Freeze */
  partial_payment_interest_freeze: boolean;
  /** Discount Order */
  discount_order: string;
  /** Scholarship Lost Config */
  scholarship_lost_config: string;
  /** Scholarship Is Accumulative */
  scholarship_is_accumulative: boolean;
  /** Commissions Schema */
  commissions_schema: object;
  /** Payment Preferences */
  payment_preferences: object;
  /** Config Portal */
  config_portal: object;
  /** Discounts Config */
  discounts_config: object;
}

/** SchoolNameRequest */
export interface SchoolNameRequest {
  /** Name */
  name: string;
}

/** SectionEntity */
export interface SectionEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Grade */
  grade: string;
  /** Group */
  group: string;
  /** Without Group */
  without_group: boolean;
  /** Last Section */
  last_section: boolean;
  /**
   * Next
   * @format uuid
   */
  next: string;
  /** Total Students */
  total_students: number;
}

/** ShortSlugEntity */
export interface ShortSlugEntity {
  /** Short Slug */
  short_slug: string;
}

/** StatusEntity */
export interface StatusEntity {
  /** Status */
  status: string;
  /** Reasons */
  reasons: string[];
}

/** StoredFileEntity */
export interface StoredFileEntity {
  /** Id */
  id: string;
  /** File Size */
  file_size: number;
  /** File Url */
  file_url: string;
  /** File Name */
  file_name: string;
  /** File Type */
  file_type: string;
  /** School Id */
  school_id: string;
  /** Created At */
  created_at?: string | null;
}

/** Students */
export interface Students {
  /** Student Ids */
  student_ids: string[];
}

/** TaxingSystem */
export enum TaxingSystem {
  Value601 = '601',
  Value603 = '603',
  Value605 = '605',
  Value606 = '606',
  Value607 = '607',
  Value608 = '608',
  Value610 = '610',
  Value611 = '611',
  Value612 = '612',
  Value614 = '614',
  Value615 = '615',
  Value616 = '616',
  Value620 = '620',
  Value621 = '621',
  Value622 = '622',
  Value623 = '623',
  Value624 = '624',
  Value625 = '625',
  Value626 = '626',
  Value628 = '628',
  Value629 = '629',
  Value630 = '630',
}

/** TransferStudents */
export interface TransferStudents {
  /** Student Ids */
  student_ids: string[];
  /** Inactivate */
  inactivate: boolean;
  /** Bypass Enrollment Code */
  bypass_enrollment_code: boolean;
  /** Bypass Identifier */
  bypass_identifier: boolean;
}

/** UpdateBankAccountRequest */
export interface UpdateBankAccountRequest {
  /** Owner */
  owner?: string | null;
  /** Nickname */
  nickname?: string | null;
  bank_name?: BankName | null;
  account_type?: AccountType | null;
  /** Account Number */
  account_number?: string | null;
  account_currency?: Currency | null;
  document_type?: DocumentType | null;
  /** Document Number */
  document_number?: string | null;
}

/** UpdateFileStatusRequest */
export interface UpdateFileStatusRequest {
  status: OnboardingStatus;
}

/** UpdateFiscalEntityRequest */
export interface UpdateFiscalEntityRequest {
  /** Name */
  name?: string | null;
  /** Tax Id */
  tax_id?: string | null;
  taxing_system?: TaxingSystem | null;
  /** Country */
  country?: string | null;
  /** State */
  state?: string | null;
  /** City */
  city?: string | null;
  /** Address Name */
  address_name?: string | null;
  /** Postal Code */
  postal_code?: string | null;
  /** Address Number */
  address_number?: string | null;
  /** District */
  district?: string | null;
  /** Issued At */
  issued_at?: string | null;
  /** Csd Password */
  csd_password?: string | null;
  /** Reason */
  reason?: string | null;
}

/** UpdateLegalDocumentsRequest */
export interface UpdateLegalDocumentsRequest {
  /** Legal Representative Name */
  legal_representative_name?: string | null;
  /** Legal Representative Last Name */
  legal_representative_last_name?: string | null;
  /** Legal Representative Curp */
  legal_representative_curp?: string | null;
  /** Legal Representative Birth Date */
  legal_representative_birth_date?: string | null;
  status?: LegalDocumentsStatus | null;
  /** Web Url */
  web_url?: string | null;
  /** Proof Of Address Issued At */
  proof_of_address_issued_at?: string | null;
}

/** UpdateStudentSectionResponse */
export interface UpdateStudentSectionResponse {
  /** Updated Students */
  updated_students: string[];
  /** Failed Students */
  failed_students: FailedStudent[];
}

/** UserCreationRequestForCompleteSchool */
export interface UserCreationRequestForCompleteSchool {
  /**
   * First Name
   * First name
   * @minLength 1
   * @maxLength 100
   */
  first_name: string;
  /**
   * Last Name
   * Last name
   * @minLength 1
   * @maxLength 100
   */
  last_name: string;
  /**
   * Email
   * Email address
   */
  email: string;
  /**
   * Mobile
   * Mobile number
   */
  mobile?: string | null;
  /**
   * Membership
   * Membership type
   */
  membership: string;
}

/** UserCreationResponse */
export interface UserCreationResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Email */
  email: string;
  /** Mobile */
  mobile?: string | null;
  /** Membership */
  membership: string;
  /** Last Login */
  last_login?: string | null;
}

/** UserEntity */
export interface UserEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Email */
  email: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        if (Array.isArray(property) && property.every((p) => p instanceof Blob)) {
          property.forEach((p) => formData.append(key, p));
        } else {
          formData.append(
            key,
            property instanceof Blob
              ? property
              : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`
          );
        }
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title bot-api
 * @version 0.1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags auth
     * @name LoginApiV1AuthLoginPost
     * @summary Login
     * @request POST:/api/v1/auth/login
     */
    loginApiV1AuthLoginPost: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name GetUserIdFromTokenApiV1AuthUserIdGet
     * @summary Get User Id From Token
     * @request GET:/api/v1/auth/user-id
     */
    getUserIdFromTokenApiV1AuthUserIdGet: (params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/auth/user-id`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSchoolByIdApiV1SchoolSchoolIdGet
     * @summary Get School By Id
     * @request GET:/api/v1/school/{school_id}
     */
    getSchoolByIdApiV1SchoolSchoolIdGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolEntity, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetGuardiansNotificationsResumeApiV1SchoolSchoolIdGuardiansNotificationsResumeGet
     * @summary Get Guardians Notifications Resume
     * @request GET:/api/v1/school/{school_id}/guardians_notifications_resume
     */
    getGuardiansNotificationsResumeApiV1SchoolSchoolIdGuardiansNotificationsResumeGet: (
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<GuardianNotificationResumeEntity, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/guardians_notifications_resume`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSchoolsBankaccountsApiV1SchoolSchoolIdBankaccountsGet
     * @summary Get Schools Bankaccounts
     * @request GET:/api/v1/school/{school_id}/bankaccounts
     */
    getSchoolsBankaccountsApiV1SchoolSchoolIdBankaccountsGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<BankAccountEntity[], HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/bankaccounts`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSchoolsFiscalentitiesApiV1SchoolSchoolIdFiscalentitiesGet
     * @summary Get Schools Fiscalentities
     * @request GET:/api/v1/school/{school_id}/fiscalentities
     */
    getSchoolsFiscalentitiesApiV1SchoolSchoolIdFiscalentitiesGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<FiscalEntityEntity[], HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/fiscalentities`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSectionsResumeApiV1SchoolSchoolIdSectionsResumeGet
     * @summary Get Sections Resume
     * @request GET:/api/v1/school/{school_id}/sections_resume
     */
    getSectionsResumeApiV1SchoolSchoolIdSectionsResumeGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<LevelEntity[], HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/sections_resume`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GenerateReportApiV1SchoolSchoolIdGenerateReportPost
     * @summary Generate Report
     * @request POST:/api/v1/school/{school_id}/generate_report
     */
    generateReportApiV1SchoolSchoolIdGenerateReportPost: (
      schoolId: string,
      data: GenerateReportRequest,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/generate_report`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetDriveFolderUrlApiV1SchoolSchoolIdDriveFolderUrlGet
     * @summary Get Drive Folder Url
     * @request GET:/api/v1/school/{school_id}/drive_folder_url
     */
    getDriveFolderUrlApiV1SchoolSchoolIdDriveFolderUrlGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/drive_folder_url`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name UpsertDriveFolderUrlApiV1SchoolSchoolIdDriveFolderUrlPost
     * @summary Upsert Drive Folder Url
     * @request POST:/api/v1/school/{school_id}/drive_folder_url
     */
    upsertDriveFolderUrlApiV1SchoolSchoolIdDriveFolderUrlPost: (
      schoolId: string,
      data: DriveFolderUrlRequest,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/drive_folder_url`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetOnboardingStatusApiV1SchoolSchoolIdOnboardingStatusGet
     * @summary Get Onboarding Status
     * @request GET:/api/v1/school/{school_id}/onboarding_status
     */
    getOnboardingStatusApiV1SchoolSchoolIdOnboardingStatusGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<StatusEntity, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/onboarding_status`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSchoolsConceptsApiV1SchoolSchoolIdConceptsGet
     * @summary Get Schools Concepts
     * @request GET:/api/v1/school/{school_id}/concepts
     */
    getSchoolsConceptsApiV1SchoolSchoolIdConceptsGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<ConceptEntity[], HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/concepts`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name CreatePaymentsReportApiV1SchoolSchoolIdPaymentsReportPost
     * @summary Create Payments Report
     * @request POST:/api/v1/school/{school_id}/payments-report
     */
    createPaymentsReportApiV1SchoolSchoolIdPaymentsReportPost: (
      schoolId: string,
      data: PaymentsReportRequest,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/payments-report`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name PaymentsRegisterApiV1SchoolSchoolIdUploadPaymentsReportPost
     * @summary Payments Register
     * @request POST:/api/v1/school/{school_id}/upload-payments-report
     */
    paymentsRegisterApiV1SchoolSchoolIdUploadPaymentsReportPost: (
      schoolId: string,
      data: BodyPaymentsRegisterApiV1SchoolSchoolIdUploadPaymentsReportPost,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/upload-payments-report`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSchoolBankAccountsApiV1SchoolSchoolIdBankAccountsGet
     * @summary Get School Bank Accounts
     * @request GET:/api/v1/school/{school_id}/bank_accounts
     */
    getSchoolBankAccountsApiV1SchoolSchoolIdBankAccountsGet: (
      schoolId: string,
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Page Size
         * @default 50
         */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedBankAccountsResponse, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/bank_accounts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name CreateBankAccountApiV1SchoolSchoolIdBankAccountPost
     * @summary Create Bank Account
     * @request POST:/api/v1/school/{school_id}/bank_account
     */
    createBankAccountApiV1SchoolSchoolIdBankAccountPost: (
      schoolId: string,
      data: BodyCreateBankAccountApiV1SchoolSchoolIdBankAccountPost,
      params: RequestParams = {}
    ) =>
      this.request<BotBankAccountEntity, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/bank_account`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name GetSchoolFiscalEntitiesApiV1SchoolSchoolIdFiscalEntitiesGet
     * @summary Get School Fiscal Entities
     * @request GET:/api/v1/school/{school_id}/fiscal_entities
     */
    getSchoolFiscalEntitiesApiV1SchoolSchoolIdFiscalEntitiesGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<BotFiscalEntityDTO[], HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/fiscal_entities`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school
     * @name CreateFiscalEntityApiV1SchoolSchoolIdFiscalEntityPost
     * @summary Create Fiscal Entity
     * @request POST:/api/v1/school/{school_id}/fiscal_entity
     */
    createFiscalEntityApiV1SchoolSchoolIdFiscalEntityPost: (
      schoolId: string,
      data: BodyCreateFiscalEntityApiV1SchoolSchoolIdFiscalEntityPost,
      params: RequestParams = {}
    ) =>
      this.request<BotFiscalEntityDTO, HTTPValidationError>({
        path: `/api/v1/school/${schoolId}/fiscal_entity`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schoolcycle
     * @name UpdateSectionApiV1SchoolcycleSchoolcycleIdUpdateSectionSectionIdPost
     * @summary Update Section
     * @request POST:/api/v1/schoolcycle/{schoolcycle_id}/update_section/{section_id}
     */
    updateSectionApiV1SchoolcycleSchoolcycleIdUpdateSectionSectionIdPost: (
      schoolcycleId: string,
      sectionId: string,
      data: Students,
      params: RequestParams = {}
    ) =>
      this.request<UpdateStudentSectionResponse, HTTPValidationError>({
        path: `/api/v1/schoolcycle/${schoolcycleId}/update_section/${sectionId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schoolcycle
     * @name UpdateToOtherSchoolSectionApiV1SchoolcycleSchoolcycleIdUpdateToOtherSchoolSectionSectionIdPost
     * @summary Update To Other School Section
     * @request POST:/api/v1/schoolcycle/{schoolcycle_id}/update_to_other_school_section/{section_id}
     */
    updateToOtherSchoolSectionApiV1SchoolcycleSchoolcycleIdUpdateToOtherSchoolSectionSectionIdPost: (
      schoolcycleId: string,
      sectionId: string,
      data: TransferStudents,
      params: RequestParams = {}
    ) =>
      this.request<UpdateStudentSectionResponse, HTTPValidationError>({
        path: `/api/v1/schoolcycle/${schoolcycleId}/update_to_other_school_section/${sectionId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schoolcycle
     * @name UpdateToNextSectionApiV1SchoolcycleSchoolcycleIdUpdateToNextSectionPost
     * @summary Update To Next Section
     * @request POST:/api/v1/schoolcycle/{schoolcycle_id}/update_to_next_section
     */
    updateToNextSectionApiV1SchoolcycleSchoolcycleIdUpdateToNextSectionPost: (
      schoolcycleId: string,
      data: Students,
      params: RequestParams = {}
    ) =>
      this.request<UpdateStudentSectionResponse, HTTPValidationError>({
        path: `/api/v1/schoolcycle/${schoolcycleId}/update_to_next_section`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schoolcycle
     * @name GetEnrollmentApiV1SchoolcycleSchoolcycleIdEnrollmentPost
     * @summary Get Enrollment
     * @request POST:/api/v1/schoolcycle/{schoolcycle_id}/enrollment
     */
    getEnrollmentApiV1SchoolcycleSchoolcycleIdEnrollmentPost: (
      schoolcycleId: string,
      data: BodyGetEnrollmentApiV1SchoolcycleSchoolcycleIdEnrollmentPost,
      query?: {
        /**
         * Header
         * @default false
         */
        header?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<Enrollment[], HTTPValidationError>({
        path: `/api/v1/schoolcycle/${schoolcycleId}/enrollment`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags user
     * @name FindUserByEmailApiV1UserFindByEmailPost
     * @summary Find User By Email
     * @request POST:/api/v1/user/find_by_email
     */
    findUserByEmailApiV1UserFindByEmailPost: (data: EmailRequest, params: RequestParams = {}) =>
      this.request<UserEntity, HTTPValidationError>({
        path: `/api/v1/user/find_by_email`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags user
     * @name CheckUserIsStaffApiV1UserIsStaffUserIdGet
     * @summary Check User Is Staff
     * @request GET:/api/v1/user/is_staff/{user_id}
     */
    checkUserIsStaffApiV1UserIsStaffUserIdGet: (userId: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/user/is_staff/${userId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags user
     * @name GetEmailByUserIdApiV1UserGetEmailUserIdGet
     * @summary Get Email By User Id
     * @request GET:/api/v1/user/get_email/{user_id}
     */
    getEmailByUserIdApiV1UserGetEmailUserIdGet: (userId: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/user/get_email/${userId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name CreateOnboardingApiV1OnboardingPost
     * @summary Create Onboarding
     * @request POST:/api/v1/onboarding/
     */
    createOnboardingApiV1OnboardingPost: (data: OnboardingCreate, params: RequestParams = {}) =>
      this.request<OnboardingEntity, HTTPValidationError>({
        path: `/api/v1/onboarding/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name GetOnboardingApiV1OnboardingGet
     * @summary Get Onboarding
     * @request GET:/api/v1/onboarding/
     */
    getOnboardingApiV1OnboardingGet: (
      query: {
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<OnboardingEntity[], HTTPValidationError>({
        path: `/api/v1/onboarding/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name PatchOnboardingApiV1OnboardingOnboardingIdPatch
     * @summary Patch Onboarding
     * @request PATCH:/api/v1/onboarding/{onboarding_id}
     */
    patchOnboardingApiV1OnboardingOnboardingIdPatch: (
      onboardingId: string,
      data: OnboardingUpdate,
      params: RequestParams = {}
    ) =>
      this.request<OnboardingEntity, HTTPValidationError>({
        path: `/api/v1/onboarding/${onboardingId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name ProcessImportLevelsApiV1OnboardingProcessImportLevelsSchoolIdPost
     * @summary Process Import Levels
     * @request POST:/api/v1/onboarding/process-import-levels/{school_id}
     */
    processImportLevelsApiV1OnboardingProcessImportLevelsSchoolIdPost: (
      schoolId: string,
      data: object,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/process-import-levels/${schoolId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name ProcessImportStructureApiV1OnboardingProcessImportStructureSchoolIdPost
     * @summary Process Import Structure
     * @request POST:/api/v1/onboarding/process-import-structure/{school_id}
     */
    processImportStructureApiV1OnboardingProcessImportStructureSchoolIdPost: (
      schoolId: string,
      data: object,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/process-import-structure/${schoolId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name AytValidFileStructureInfoApiV1OnboardingAytValidFileStructureInfoSchoolIdGet
     * @summary Ayt Valid File Structure Info
     * @request GET:/api/v1/onboarding/ayt-valid-file-structure-info/{school_id}
     */
    aytValidFileStructureInfoApiV1OnboardingAytValidFileStructureInfoSchoolIdGet: (
      schoolId: string,
      query: {
        /**
         * File Type
         * Depends if required level or sections
         */
        file_type: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/ayt-valid-file-structure-info/${schoolId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags payin-history
     * @name CreatePayinHistoryApiV1PayinHistoryPost
     * @summary Create Payin History
     * @request POST:/api/v1/payin-history/
     */
    createPayinHistoryApiV1PayinHistoryPost: (data: PayinHistoryCreate, params: RequestParams = {}) =>
      this.request<PayinHistoryResponse, HTTPValidationError>({
        path: `/api/v1/payin-history/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags payin-history
     * @name GetAllPayinHistoryApiV1PayinHistoryGet
     * @summary Get All Payin History
     * @request GET:/api/v1/payin-history/
     */
    getAllPayinHistoryApiV1PayinHistoryGet: (
      query?: {
        /** User Email */
        user_email?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<PayinHistoryResponse[], HTTPValidationError>({
        path: `/api/v1/payin-history/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags payin-history
     * @name GetPayinHistoryByIdApiV1PayinHistoryPayinHistoryIdGet
     * @summary Get Payin History By Id
     * @request GET:/api/v1/payin-history/{payin_history_id}
     */
    getPayinHistoryByIdApiV1PayinHistoryPayinHistoryIdGet: (payinHistoryId: string, params: RequestParams = {}) =>
      this.request<PayinHistoryResponse, HTTPValidationError>({
        path: `/api/v1/payin-history/${payinHistoryId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags payin-history
     * @name UpdatePayinHistoryApiV1PayinHistoryPayinHistoryIdPut
     * @summary Update Payin History
     * @request PUT:/api/v1/payin-history/{payin_history_id}
     */
    updatePayinHistoryApiV1PayinHistoryPayinHistoryIdPut: (
      payinHistoryId: string,
      data: PayinHistoryUpdate,
      params: RequestParams = {}
    ) =>
      this.request<PayinHistoryResponse, HTTPValidationError>({
        path: `/api/v1/payin-history/${payinHistoryId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags payin-history
     * @name DeletePayinHistoryApiV1PayinHistoryPayinHistoryIdDelete
     * @summary Delete Payin History
     * @request DELETE:/api/v1/payin-history/{payin_history_id}
     */
    deletePayinHistoryApiV1PayinHistoryPayinHistoryIdDelete: (payinHistoryId: string, params: RequestParams = {}) =>
      this.request<object, HTTPValidationError>({
        path: `/api/v1/payin-history/${payinHistoryId}`,
        method: 'DELETE',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags guardian
     * @name GetGuardianCommunicationPreferencesApiV1GuardianCommunicationPreferencesGuardianIdGet
     * @summary Get Guardian Communication Preferences
     * @request GET:/api/v1/guardian/communication-preferences/{guardian_id}
     */
    getGuardianCommunicationPreferencesApiV1GuardianCommunicationPreferencesGuardianIdGet: (
      guardianId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/guardian/communication-preferences/${guardianId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags bank_account
     * @name PatchBankAccountApiV1BankAccountBankAccountIdPatch
     * @summary Patch Bank Account
     * @request PATCH:/api/v1/bank_account/{bank_account_id}
     */
    patchBankAccountApiV1BankAccountBankAccountIdPatch: (
      bankAccountId: string,
      data: UpdateBankAccountRequest,
      params: RequestParams = {}
    ) =>
      this.request<BotBankAccountEntity, HTTPValidationError>({
        path: `/api/v1/bank_account/${bankAccountId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags bank_account
     * @name DeleteBankAccountApiV1BankAccountBankAccountIdDelete
     * @summary Delete Bank Account
     * @request DELETE:/api/v1/bank_account/{bank_account_id}
     */
    deleteBankAccountApiV1BankAccountBankAccountIdDelete: (bankAccountId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/bank_account/${bankAccountId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags bank_account
     * @name ApproveBankAccountApiV1BankAccountBankAccountIdApprovePost
     * @summary Approve Bank Account
     * @request POST:/api/v1/bank_account/{bank_account_id}/approve
     */
    approveBankAccountApiV1BankAccountBankAccountIdApprovePost: (
      bankAccountId: string,
      query?: {
        /** Reason */
        reason?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BotBankAccountEntity, HTTPValidationError>({
        path: `/api/v1/bank_account/${bankAccountId}/approve`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags bank_account
     * @name DeclineBankAccountApiV1BankAccountBankAccountIdDeclinePost
     * @summary Decline Bank Account
     * @request POST:/api/v1/bank_account/{bank_account_id}/decline
     */
    declineBankAccountApiV1BankAccountBankAccountIdDeclinePost: (
      bankAccountId: string,
      query?: {
        /** Reason */
        reason?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BotBankAccountEntity, HTTPValidationError>({
        path: `/api/v1/bank_account/${bankAccountId}/decline`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags fiscal_entity
     * @name PatchFiscalEntityApiV1FiscalEntityFiscalEntityIdPatch
     * @summary Patch Fiscal Entity
     * @request PATCH:/api/v1/fiscal_entity/{fiscal_entity_id}
     */
    patchFiscalEntityApiV1FiscalEntityFiscalEntityIdPatch: (
      fiscalEntityId: string,
      data: UpdateFiscalEntityRequest,
      params: RequestParams = {}
    ) =>
      this.request<BotFiscalEntityDTO, HTTPValidationError>({
        path: `/api/v1/fiscal_entity/${fiscalEntityId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags fiscal_entity
     * @name DeleteFiscalEntityApiV1FiscalEntityFiscalEntityIdDelete
     * @summary Delete Fiscal Entity
     * @request DELETE:/api/v1/fiscal_entity/{fiscal_entity_id}
     */
    deleteFiscalEntityApiV1FiscalEntityFiscalEntityIdDelete: (fiscalEntityId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/fiscal_entity/${fiscalEntityId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags fiscal_entity
     * @name ApproveFiscalEntityApiV1FiscalEntityFiscalEntityIdApprovePost
     * @summary Approve Fiscal Entity
     * @request POST:/api/v1/fiscal_entity/{fiscal_entity_id}/approve
     */
    approveFiscalEntityApiV1FiscalEntityFiscalEntityIdApprovePost: (
      fiscalEntityId: string,
      query?: {
        /** Reason */
        reason?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BotFiscalEntityDTO, HTTPValidationError>({
        path: `/api/v1/fiscal_entity/${fiscalEntityId}/approve`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags fiscal_entity
     * @name DeclineFiscalEntityApiV1FiscalEntityFiscalEntityIdDeclinePost
     * @summary Decline Fiscal Entity
     * @request POST:/api/v1/fiscal_entity/{fiscal_entity_id}/decline
     */
    declineFiscalEntityApiV1FiscalEntityFiscalEntityIdDeclinePost: (
      fiscalEntityId: string,
      query?: {
        /** Reason */
        reason?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BotFiscalEntityDTO, HTTPValidationError>({
        path: `/api/v1/fiscal_entity/${fiscalEntityId}/decline`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags legal_documents
     * @name GetLegalDocumentsApiV1LegalDocumentsGet
     * @summary Get Legal Documents
     * @request GET:/api/v1/legal_documents/
     */
    getLegalDocumentsApiV1LegalDocumentsGet: (
      query?: {
        /** School Id */
        school_id?: string | null;
        /** Legal Documents Id */
        legal_documents_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<LegalDocumentsResponse[], HTTPValidationError>({
        path: `/api/v1/legal_documents/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags legal_documents
     * @name CreateLegalDocumentsApiV1LegalDocumentsSchoolSchoolIdPost
     * @summary Create Legal Documents
     * @request POST:/api/v1/legal_documents/school/{school_id}
     */
    createLegalDocumentsApiV1LegalDocumentsSchoolSchoolIdPost: (
      schoolId: string,
      data: CreateLegalDocumentsRequest,
      params: RequestParams = {}
    ) =>
      this.request<LegalDocumentsResponse, HTTPValidationError>({
        path: `/api/v1/legal_documents/school/${schoolId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags legal_documents
     * @name UpdateLegalDocumentsApiV1LegalDocumentsLegalDocumentsIdPatch
     * @summary Update Legal Documents
     * @request PATCH:/api/v1/legal_documents/{legal_documents_id}
     */
    updateLegalDocumentsApiV1LegalDocumentsLegalDocumentsIdPatch: (
      legalDocumentsId: string,
      data: UpdateLegalDocumentsRequest,
      params: RequestParams = {}
    ) =>
      this.request<LegalDocumentsResponse, HTTPValidationError>({
        path: `/api/v1/legal_documents/${legalDocumentsId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags legal_documents
     * @name DeleteLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdFilesFileIdDelete
     * @summary Delete Legal Document File
     * @request DELETE:/api/v1/legal_documents/{legal_documents_id}/files/{file_id}
     */
    deleteLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdFilesFileIdDelete: (
      legalDocumentsId: string,
      fileId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/legal_documents/${legalDocumentsId}/files/${fileId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags legal_documents
     * @name UpdateLegalDocumentFileStatusApiV1LegalDocumentsLegalDocumentsIdFilesFileIdStatusPatch
     * @summary Update Legal Document File Status
     * @request PATCH:/api/v1/legal_documents/{legal_documents_id}/files/{file_id}/status
     */
    updateLegalDocumentFileStatusApiV1LegalDocumentsLegalDocumentsIdFilesFileIdStatusPatch: (
      legalDocumentsId: string,
      fileId: string,
      data: UpdateFileStatusRequest,
      query?: {
        /** Reason */
        reason?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<FileEntity, HTTPValidationError>({
        path: `/api/v1/legal_documents/${legalDocumentsId}/files/${fileId}/status`,
        method: 'PATCH',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name GenerateShortSlugApiV1OnboardingGenerateShortSlugPost
     * @summary Generate Short Slug
     * @request POST:/api/v1/onboarding/generate_short_slug
     */
    generateShortSlugApiV1OnboardingGenerateShortSlugPost: (data: SchoolNameRequest, params: RequestParams = {}) =>
      this.request<ShortSlugEntity, HTTPValidationError>({
        path: `/api/v1/onboarding/generate_short_slug`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name UploadFileApiV1OnboardingUploadFilePost
     * @summary Upload File
     * @request POST:/api/v1/onboarding/upload_file
     */
    uploadFileApiV1OnboardingUploadFilePost: (
      data: BodyUploadFileApiV1OnboardingUploadFilePost,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/upload_file`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name DownloadFileApiV1OnboardingDownloadFilenameGet
     * @summary Download File
     * @request GET:/api/v1/onboarding/download/{filename}
     */
    downloadFileApiV1OnboardingDownloadFilenameGet: (
      filename: string,
      query?: {
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<DownloadFileEntity, HTTPValidationError>({
        path: `/api/v1/onboarding/download/${filename}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name GetOnboardingFilesApiV1OnboardingOnboardingFilesSchoolIdGet
     * @summary Get Onboarding Files
     * @request GET:/api/v1/onboarding/onboarding-files/{school_id}
     */
    getOnboardingFilesApiV1OnboardingOnboardingFilesSchoolIdGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<StoredFileEntity[], HTTPValidationError>({
        path: `/api/v1/onboarding/onboarding-files/${schoolId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name CompleteWithGenericsApiV1OnboardingCompleteWithGenericsPost
     * @summary Complete With Generics
     * @request POST:/api/v1/onboarding/complete-with-generics
     */
    completeWithGenericsApiV1OnboardingCompleteWithGenericsPost: (
      query?: {
        /** School Id */
        school_id?: string | null;
        /** Column Name */
        column_name?: AllowedColumnName | null;
        /**
         * Size
         * Number of items per page
         * @default 15
         */
        size?: number | null;
        /**
         * Page
         * Page number
         * @default 1
         */
        page?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProcessedFileEntityResponse, HTTPValidationError>({
        path: `/api/v1/onboarding/complete-with-generics`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name ProcessFileToCometaStructureApiV1OnboardingProcessCometaSchoolIdPost
     * @summary Process File To Cometa Structure
     * @request POST:/api/v1/onboarding/process-cometa/{school_id}
     */
    processFileToCometaStructureApiV1OnboardingProcessCometaSchoolIdPost: (
      schoolId: string,
      data: BodyProcessFileToCometaStructureApiV1OnboardingProcessCometaSchoolIdPost,
      query?: {
        /**
         * Size
         * Number of items per page
         * @default 15
         */
        size?: number | null;
        /**
         * Page
         * Page number
         * @default 1
         */
        page?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProcessedFileEntityResponse, HTTPValidationError>({
        path: `/api/v1/onboarding/process-cometa/${schoolId}`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name ProcessFileToServoStructureApiV1OnboardingProcessServoSchoolIdPost
     * @summary Process File To Servo Structure
     * @request POST:/api/v1/onboarding/process-servo/{school_id}
     */
    processFileToServoStructureApiV1OnboardingProcessServoSchoolIdPost: (
      schoolId: string,
      data: BodyProcessFileToServoStructureApiV1OnboardingProcessServoSchoolIdPost,
      query?: {
        /**
         * Size
         * Number of items per page
         * @default 15
         */
        size?: number | null;
        /**
         * Page
         * Page number
         * @default 1
         */
        page?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProcessedFileEntityResponse, HTTPValidationError>({
        path: `/api/v1/onboarding/process-servo/${schoolId}`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name ProcessFileToStandardStructureApiV1OnboardingProcessStandardSchoolIdPost
     * @summary Process File To Standard Structure
     * @request POST:/api/v1/onboarding/process-standard/{school_id}
     */
    processFileToStandardStructureApiV1OnboardingProcessStandardSchoolIdPost: (
      schoolId: string,
      data: BodyProcessFileToStandardStructureApiV1OnboardingProcessStandardSchoolIdPost,
      query?: {
        /**
         * Size
         * Number of items per page
         * @default 15
         */
        size?: number | null;
        /**
         * Page
         * Page number
         * @default 1
         */
        page?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProcessedFileEntityResponse, HTTPValidationError>({
        path: `/api/v1/onboarding/process-standard/${schoolId}`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name UpdatePreviewApiV1OnboardingPreviewSchoolIdPut
     * @summary Update Preview
     * @request PUT:/api/v1/onboarding/preview/{school_id}
     */
    updatePreviewApiV1OnboardingPreviewSchoolIdPut: (
      schoolId: string,
      data: PreviewDataEntity,
      query?: {
        /**
         * Size
         * Number of items per page
         * @default 15
         */
        size?: number | null;
        /**
         * Page
         * Page number
         * @default 1
         */
        page?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProcessedFileEntityResponse, HTTPValidationError>({
        path: `/api/v1/onboarding/preview/${schoolId}`,
        method: 'PUT',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name GetPreviewApiV1OnboardingPreviewSchoolIdGet
     * @summary Get Preview
     * @request GET:/api/v1/onboarding/preview/{school_id}
     */
    getPreviewApiV1OnboardingPreviewSchoolIdGet: (
      schoolId: string,
      query?: {
        /**
         * Size
         * Number of items per page
         * @default 15
         */
        size?: number | null;
        /**
         * Page
         * Page number
         * @default 1
         */
        page?: number | null;
        /**
         * Error Only Column
         * Return only errors
         */
        error_only_column?: AytColumnName | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProcessedFileEntityResponse, HTTPValidationError>({
        path: `/api/v1/onboarding/preview/${schoolId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name ProcessImportAytToCometaApiV1OnboardingProcessImportAytSchoolIdSchoolCycleIdPost
     * @summary Process Import Ayt To Cometa
     * @request POST:/api/v1/onboarding/process-import-ayt/{school_id}/{school_cycle_id}
     */
    processImportAytToCometaApiV1OnboardingProcessImportAytSchoolIdSchoolCycleIdPost: (
      schoolId: string,
      schoolCycleId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/process-import-ayt/${schoolId}/${schoolCycleId}`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name AytFileInfoApiV1OnboardingAytFileInfoSchoolIdGet
     * @summary Ayt File Info
     * @request GET:/api/v1/onboarding/ayt-file-info/{school_id}
     */
    aytFileInfoApiV1OnboardingAytFileInfoSchoolIdGet: (
      schoolId: string,
      query: {
        /**
         * File Type
         * Type of file: 'valid' or 'invalid'
         */
        file_type: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/ayt-file-info/${schoolId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags onboarding
     * @name RecordsOfAytFilesApiV1OnboardingRecordsOfAytFilesSchoolIdGet
     * @summary Records Of Ayt Files
     * @request GET:/api/v1/onboarding/records-of-ayt-files/{school_id}
     */
    recordsOfAytFilesApiV1OnboardingRecordsOfAytFilesSchoolIdGet: (
      schoolId: string,
      query: {
        /**
         * File Type
         * Type of file: 'valid' or 'invalid'
         */
        file_type: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/onboarding/records-of-ayt-files/${schoolId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin-school
     * @name CreateCompleteSchoolApiV1SchoolPost
     * @summary Create Complete School
     * @request POST:/api/v1/school/
     */
    createCompleteSchoolApiV1SchoolPost: (data: CompleteSchoolCreationRequest, params: RequestParams = {}) =>
      this.request<CompleteSchoolCreationResponse, HTTPValidationError>({
        path: `/api/v1/school/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags legal_documents
     * @name UploadLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdUploadFilePost
     * @summary Upload Legal Document File
     * @request POST:/api/v1/legal_documents/{legal_documents_id}/upload-file
     */
    uploadLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdUploadFilePost: (
      legalDocumentsId: string,
      data: BodyUploadLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdUploadFilePost,
      params: RequestParams = {}
    ) =>
      this.request<FileEntity, HTTPValidationError>({
        path: `/api/v1/legal_documents/${legalDocumentsId}/upload-file`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),
  };
}
