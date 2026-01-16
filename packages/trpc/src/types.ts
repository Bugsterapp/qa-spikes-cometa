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

export enum AccountTypeEnum {
  CC = 'CC',
  CA = 'CA',
  CB = 'CB',
}

/** Single adjustment for simulation */
export interface AdjustmentItem {
  type: TypeAceEnum;
  /**
   * @format decimal
   * @pattern ^-?\d{0,3}(?:\.\d{0,2})?$
   */
  percentage?: string | null;
  /**
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  amount?: string | null;
}

/** Serializer for AdjustmentRule CRUD operations */
export interface AdjustmentRule {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school: string;
  /** Type of adjustment */
  rule_type: RuleTypeEnum;
  /**
   * Application order (1-N, only relevant in sequential mode)
   * @min -2147483648
   * @max 2147483647
   */
  order: number;
  /** Whether the rule is active */
  is_active?: boolean;
  /** Specific config (e.g.: {"is_accumulative": true} for scholarships) */
  config?: Record<string, any>;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
}

export interface AffectedConcept {
  /** @format uuid */
  id: string;
  name: string;
  /** @format uuid */
  school_cycle: string;
  /** @format double */
  prev_price: number;
  /** @format double */
  new_price: number;
  fulfillments: any[];
}

export interface AllowedBlockPeriodResponse {
  /** @format uuid */
  id: string;
  /** @format date */
  start_date: string;
  /** @format date */
  end_date: string;
  template_id: string;
}

export interface AnnulInvoiceRequestDTO {
  /** @minItems 1 */
  invoice_ids: string[];
}

export interface AnnulInvoiceResponseDTO {
  success_count: number;
  failed_count: number;
  results: AnnulInvoiceResultDTO[];
}

export interface AnnulInvoiceResultDTO {
  /** @format uuid */
  invoice_id: string;
  status: AnnulInvoiceResultDTOStatusEnum;
  message: string | null;
}

export enum AnnulInvoiceResultDTOStatusEnum {
  Success = 'success',
  Failed = 'failed',
}

export interface AssignBilling {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Guardian used for billing.
   * @format uuid
   */
  billing_guardian?: string | null;
}

export interface AssignBillings {
  students: AssignBilling[];
}

export interface AssignConceptsDTO {
  /** @format uuid */
  student_id: string;
  concept_ids: string[];
}

export interface AssignmentStatusRequest {
  concept_id: string;
  students_ids: string[];
}

export interface AsyncInvoiceResponseDTO {
  /** Operation status message */
  message: string;
  /** Total number of invoices to process */
  invoice_count: number;
  /** Number of parallel batches that will be created */
  estimated_batches: number;
}

export interface AttributeCreate {
  /** @maxLength 255 */
  name: string;
  /** @maxLength 100 */
  type: string;
}

export interface Attributes {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** @maxLength 255 */
  name: string;
  /** @maxLength 100 */
  type: string;
}

export interface AuthDashboardRequestDTO {
  username: string;
  password: string;
}

export interface AuthDashboardResponseDTO {
  token: string;
  user: User;
}

export interface AuthRequest {
  auth_token: string;
}

export interface AuthToken {
  username: string;
  password: string;
  token: string;
}

export interface AvailableScholarship {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Name of scholarship. */
  name: string;
  /** @format double */
  value: number;
  /** Type of discount. */
  type: TypeF30Enum;
  concepts: string[];
  /** @format uuid */
  scholarship: string;
  /** Indicates if scholarship is already assigned to student. */
  is_already_assigned: boolean;
  /**
   * List of order ids that will not be apply the scholarship
   * @default []
   */
  orders_to_skip?: string[];
}

export interface AvailableScholarshipDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of scholarship.
   * @maxLength 64
   */
  name: string;
  /** @format double */
  value: number;
  /** Type of discount. */
  type: TypeF30Enum;
  concepts?: string[];
  /** @format uuid */
  scholarship: string;
  /** Indicates if scholarship is already assigned to student. */
  is_already_assigned: boolean;
  /**
   * List of order ids that will not be apply the scholarship
   * @default []
   */
  orders_to_skip?: string[];
  /** Affected concept for expired student scholarship. */
  affected_concepts: AffectedConcept[];
  /** Types of concepts that are affected by scholarship. */
  affected_concept_types?: ConceptTypesEnum[];
  /** Excluded concepts on scholarship */
  excluded_concepts: string;
}

export interface BadRequestResponse {
  error: string;
}

export enum BalanceTypeEnum {
  Discount = 'discount',
  Surcharge = 'surcharge',
}

export interface BankAccountHistory {
  history_id: number;
  /** @format date-time */
  history_date: string;
  history_change_reason: string | null;
  history_type: string;
  history_user: string;
  /** @format uuid */
  bank_account_id: string;
  account_type: string;
  owner: string;
  nickname: string;
  bank_name: string;
  account_number: string;
  archived: boolean;
}

export interface BankHolidayRequest {
  /**
   * Date in YYYY-MM-DD format
   * @format date
   */
  holiday_date: string;
}

export interface BankHolidayResponse {
  payouts_rescheduled: number;
  /** @format date */
  holiday_date: string;
  /** @format date */
  next_date: string;
  message: string;
}

export interface BaseAdmin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 250 */
  job_title: string;
}

export interface BaseConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  type: string;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  school_cycle: SchoolCycle;
  students_assigned_count: string;
  unique_price: string;
  last_order_price: string;
  /** Offering of the concept */
  offering?: OfferingEnum;
  optional: string;
}

export interface BaseEnum {
  id: string;
  name: string;
}

export interface BasicBankAccount {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
}

export interface BillingGuardian {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
}

export interface BillingGuardianInfo {
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  billable_dependents?: SlimStudent[];
  /** Fiscal regime config for billing. */
  taxing_system?: TaxingSystemEnum | BlankEnum | NullEnum | null;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /** Schema of cfdi uses depending of concept type for billing. */
  cfdi_config?: Record<string, any>;
  /** Type of fiscal regime for billing. */
  taxing_type?: TaxingTypeEnum | BlankEnum | NullEnum | null;
}

export interface BillingStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /** Section name */
  section: string;
  billing_guardian: BillingGuardian;
  guardians: Guardian[];
  /** Workaround for self-onboarding process. Signals when student has concept generated. */
  is_ready?: boolean;
}

export enum BlankEnum {
  Value = '',
}

export interface BookKeeperOrderUpdateRequest {
  name?: string;
  paid_orders_required?: string[];
  paid_orders_required_proxy?: string[];
}

export interface BookKeeperUpdateConceptResponse {
  /** @format uuid */
  id: string;
  name: string;
  school_cycle_id: string;
  is_billable: boolean;
  bank_account_id: string;
  payment_only_in_dashboard: boolean;
  tax_code: string | null;
  tax_unit: string | null;
  has_sales_tax: boolean;
  use_education_complement: boolean;
  institutional_id: string | null;
  offering: OfferingEnum;
  does_invoice_as_general_public: boolean;
  not_invoicing_bank_account_id: string | null;
}

export interface BookKeeperUpdateOrderResponse {
  /** @format uuid */
  id: string;
  name: string;
  concept: string;
  school: string;
  paid_orders_required: string[];
  paid_orders_required_proxy: string[];
}

export interface CFDIUser {
  transport: TransportEnum | NullEnum | null;
  other: OtherEnum | NullEnum | null;
}

export enum CardTypeEnum {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  AMEX = 'AMEX',
}

export interface ChangeBankAccountRequest {
  /** @format uuid */
  bank_account_id: string;
}

export interface ChangeLimitResponse {
  message: string;
}

export enum ChangeTypeEnum {
  Onboarding = 'onboarding',
  Reconfiguration = 'reconfiguration',
}

export interface CheckBlockActiveResponse {
  is_blocked: boolean;
  /** @format date */
  checked_date: string;
  /** @format date */
  start_date?: string | null;
  /** @format date */
  end_date?: string | null;
}

export enum CollectedAtEnum {
  PortalDePagosCometa = 'Portal de pagos Cometa',
  DirectoAColegio = 'Directo a Colegio',
}

export interface CollectionsGraphicRequest {
  concepts: string[];
}

export interface CollectionsGraphicResponse {
  period: Period;
  total_students: number;
  on_time_students: OnTimeStudentsStatistics;
  delinquent_students: DelinquentStudentsStatistics;
}

export interface ColumnsResponse {
  columns: Record<string, string>;
}

/** DTO for individual commission configuration per payment method */
export interface CommissionConfigDTO {
  /**
   * Fixed commission amount in MXN per transaction
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  fixed: string;
  /**
   * Percentage commission as decimal (e.g., 0.0201 for 2.01%)
   * @format decimal
   * @pattern ^-?\d{0,1}(?:\.\d{0,4})?$
   */
  percentage: string;
  /**
   * Commission distribution: 0 = 100% school, 1 = 100% guardian, 0.5 = 50% school, 50% guardian
   * @format decimal
   * @pattern ^-?\d{0,1}(?:\.\d{0,2})?$
   */
  commission_distribution: string;
}

/** DTO for updating school commissions schema */
export interface CommissionsSchemaRequestDTO {
  /** DTO for individual commission configuration per payment method */
  credit_card: CommissionConfigDTO;
  /** DTO for individual commission configuration per payment method */
  debit_card: CommissionConfigDTO;
  /** DTO for individual commission configuration per payment method */
  amex_credit_card: CommissionConfigDTO;
  /** DTO for individual commission configuration per payment method */
  bank_transfer: CommissionConfigDTO;
  /** DTO for individual commission configuration per payment method */
  oxxo: CommissionConfigDTO;
  /** DTO for individual commission configuration per payment method */
  ticket: CommissionConfigDTO;
  /** DTO for individual commission configuration per payment method */
  digital_currency?: CommissionConfigDTO;
}

/** DTO for school commissions schema response */
export interface CommissionsSchemaResponseDTO {
  /** @format uuid */
  school_id: string;
  school_name: string;
  commissions_schema: Record<string, any>;
  /** @format date-time */
  updated_at: string;
}

/** DTO for commissions schema update operation response */
export interface CommissionsSchemaUpdateResponseDTO {
  message: string;
  /** @format uuid */
  school_id: string;
}

export interface CommissionsUpdateErrorResponse {
  commissions_schema: string[];
}

export enum CompoundingEnum {
  SINGLE = 'SINGLE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  MONTHLY = 'MONTHLY',
}

export interface Concept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  type: string;
  /** Description of the concept. */
  description?: string | null;
}

export interface ConceptAutoAssignedGrade {
  id: string;
  name: string;
  is_all_assigned: boolean;
  sections: ConceptAutoAssignedSection[];
}

export interface ConceptAutoAssignedLevel {
  id: string;
  name: string;
  is_all_assigned: boolean;
  grades: ConceptAutoAssignedGrade[];
}

export interface ConceptAutoAssignedSection {
  id: string;
  name: string;
  is_already_assigned: boolean;
  /** @format uuid */
  concept_availability_id?: string | null;
}

export interface ConceptOrdersListSuccessResponse {
  id: string;
  name: string;
  delinquent_students: number;
  total_students: number;
  due: string;
  price: string;
}

export interface ConceptSerializerStatic {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Name of the concept. Concatenate concept basename with rootConcept name */
  name: string;
  type: string;
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard: boolean;
  optional: boolean;
  subscription: string;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable: boolean;
  display_type: string;
}

export interface ConceptSlim {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /** Type of the concept. */
  type: ConceptSlimTypeEnum;
  school_cycle: SchoolCycle;
}

export enum ConceptSlimTypeEnum {
  MONTHLY_FEE = 'MONTHLY_FEE',
  INSCRIPTION = 'INSCRIPTION',
  TRANSPORT = 'TRANSPORT',
  PRE_DEBT = 'PRE_DEBT',
  OTHER = 'OTHER',
}

export interface ConceptSmall {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
}

export interface ConceptStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  state?: StateEnum;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  section: string;
  level: string;
  orders_to_pay: string;
  orders_payed: string;
  orders_to_pay_in_process: string;
  amount_paid: string;
  amount_to_pay: string;
  can_be_deassigned: string;
  concept_assignment_id: string;
}

export interface ConceptTypes {
  type: ConceptTypesEnum;
  name: string;
}

export enum ConceptTypesEnum {
  MONTHLY_FEE = 'MONTHLY_FEE',
  INSCRIPTION = 'INSCRIPTION',
  TRANSPORT = 'TRANSPORT',
  PRE_DEBT = 'PRE_DEBT',
  OTHER = 'OTHER',
  REINSCRIPTION = 'REINSCRIPTION',
  EXTRACURRICULAR = 'EXTRACURRICULAR',
  SPORTS = 'SPORTS',
  CAFETERIA = 'CAFETERIA',
  BOOKS_AND_MATERIALS = 'BOOKS_AND_MATERIALS',
  EXAMS_AND_CERTIFICATES = 'EXAMS_AND_CERTIFICATES',
  UNIFORMS_AND_MERCH = 'UNIFORMS_AND_MERCH',
  DONATION = 'DONATION',
  EVENTS = 'EVENTS',
  TRIPS = 'TRIPS',
  INSURANCE = 'INSURANCE',
}

export interface ConceptsList {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  root_concept?: string | null;
  orders: OrderImporter[];
}

/** Configuration history response */
export interface ConfigurationHistory {
  /** @format uuid */
  id: string;
  /** @format date-time */
  timestamp: string;
  user: ConfigurationHistoryUser | null;
  change_type: ChangeTypeEnum;
  apply_independently: boolean;
  rules: ConfigurationHistoryRule[];
  description: string;
  recalculation_triggered: boolean;
  recalculation_trigger: RecalculationTriggerEnum | NullEnum | null;
  rules_created_count: number;
  rules_deleted_count: number;
}

/** Rule snapshot in configuration history */
export interface ConfigurationHistoryRule {
  rule_type: string;
  order: number;
  is_active: boolean;
  config: Record<string, any>;
}

/** User information in configuration history */
export interface ConfigurationHistoryUser {
  /** @format uuid */
  id: string;
  first_name: string;
  last_name: string;
}

export enum CountryEnum {
  AF = 'AF',
  AX = 'AX',
  AL = 'AL',
  DZ = 'DZ',
  AS = 'AS',
  AD = 'AD',
  AO = 'AO',
  AI = 'AI',
  AQ = 'AQ',
  AG = 'AG',
  AR = 'AR',
  AM = 'AM',
  AW = 'AW',
  AU = 'AU',
  AT = 'AT',
  AZ = 'AZ',
  BS = 'BS',
  BH = 'BH',
  BD = 'BD',
  BB = 'BB',
  BY = 'BY',
  BE = 'BE',
  BZ = 'BZ',
  BJ = 'BJ',
  BM = 'BM',
  BT = 'BT',
  BO = 'BO',
  BQ = 'BQ',
  BA = 'BA',
  BW = 'BW',
  BV = 'BV',
  BR = 'BR',
  IO = 'IO',
  BN = 'BN',
  BG = 'BG',
  BF = 'BF',
  BI = 'BI',
  CV = 'CV',
  KH = 'KH',
  CM = 'CM',
  CA = 'CA',
  KY = 'KY',
  CF = 'CF',
  TD = 'TD',
  CL = 'CL',
  CN = 'CN',
  CX = 'CX',
  CC = 'CC',
  CO = 'CO',
  KM = 'KM',
  CG = 'CG',
  CD = 'CD',
  CK = 'CK',
  CR = 'CR',
  CI = 'CI',
  HR = 'HR',
  CU = 'CU',
  CW = 'CW',
  CY = 'CY',
  CZ = 'CZ',
  DK = 'DK',
  DJ = 'DJ',
  DM = 'DM',
  DO = 'DO',
  EC = 'EC',
  EG = 'EG',
  SV = 'SV',
  GQ = 'GQ',
  ER = 'ER',
  EE = 'EE',
  SZ = 'SZ',
  ET = 'ET',
  FK = 'FK',
  FO = 'FO',
  FJ = 'FJ',
  FI = 'FI',
  FR = 'FR',
  GF = 'GF',
  PF = 'PF',
  TF = 'TF',
  GA = 'GA',
  GM = 'GM',
  GE = 'GE',
  DE = 'DE',
  GH = 'GH',
  GI = 'GI',
  GR = 'GR',
  GL = 'GL',
  GD = 'GD',
  GP = 'GP',
  GU = 'GU',
  GT = 'GT',
  GG = 'GG',
  GN = 'GN',
  GW = 'GW',
  GY = 'GY',
  HT = 'HT',
  HM = 'HM',
  VA = 'VA',
  HN = 'HN',
  HK = 'HK',
  HU = 'HU',
  IS = 'IS',
  IN = 'IN',
  ID = 'ID',
  IR = 'IR',
  IQ = 'IQ',
  IE = 'IE',
  IM = 'IM',
  IL = 'IL',
  IT = 'IT',
  JM = 'JM',
  JP = 'JP',
  JE = 'JE',
  JO = 'JO',
  KZ = 'KZ',
  KE = 'KE',
  KI = 'KI',
  KW = 'KW',
  KG = 'KG',
  LA = 'LA',
  LV = 'LV',
  LB = 'LB',
  LS = 'LS',
  LR = 'LR',
  LY = 'LY',
  LI = 'LI',
  LT = 'LT',
  LU = 'LU',
  MO = 'MO',
  MG = 'MG',
  MW = 'MW',
  MY = 'MY',
  MV = 'MV',
  ML = 'ML',
  MT = 'MT',
  MH = 'MH',
  MQ = 'MQ',
  MR = 'MR',
  MU = 'MU',
  YT = 'YT',
  MX = 'MX',
  FM = 'FM',
  MD = 'MD',
  MC = 'MC',
  MN = 'MN',
  ME = 'ME',
  MS = 'MS',
  MA = 'MA',
  MZ = 'MZ',
  MM = 'MM',
  NA = 'NA',
  NR = 'NR',
  NP = 'NP',
  NL = 'NL',
  NC = 'NC',
  NZ = 'NZ',
  NI = 'NI',
  NE = 'NE',
  NG = 'NG',
  NU = 'NU',
  NF = 'NF',
  KP = 'KP',
  MK = 'MK',
  MP = 'MP',
  NO = 'NO',
  OM = 'OM',
  PK = 'PK',
  PW = 'PW',
  PS = 'PS',
  PA = 'PA',
  PG = 'PG',
  PY = 'PY',
  PE = 'PE',
  PH = 'PH',
  PN = 'PN',
  PL = 'PL',
  PT = 'PT',
  PR = 'PR',
  QA = 'QA',
  RE = 'RE',
  RO = 'RO',
  RU = 'RU',
  RW = 'RW',
  BL = 'BL',
  SH = 'SH',
  KN = 'KN',
  LC = 'LC',
  MF = 'MF',
  PM = 'PM',
  VC = 'VC',
  WS = 'WS',
  SM = 'SM',
  ST = 'ST',
  SA = 'SA',
  SN = 'SN',
  RS = 'RS',
  SC = 'SC',
  SL = 'SL',
  SG = 'SG',
  SX = 'SX',
  SK = 'SK',
  SI = 'SI',
  SB = 'SB',
  SO = 'SO',
  ZA = 'ZA',
  GS = 'GS',
  KR = 'KR',
  SS = 'SS',
  ES = 'ES',
  LK = 'LK',
  SD = 'SD',
  SR = 'SR',
  SJ = 'SJ',
  SE = 'SE',
  CH = 'CH',
  SY = 'SY',
  TW = 'TW',
  TJ = 'TJ',
  TZ = 'TZ',
  TH = 'TH',
  TL = 'TL',
  TG = 'TG',
  TK = 'TK',
  TO = 'TO',
  TT = 'TT',
  TN = 'TN',
  TR = 'TR',
  TM = 'TM',
  TC = 'TC',
  TV = 'TV',
  UG = 'UG',
  UA = 'UA',
  AE = 'AE',
  GB = 'GB',
  UM = 'UM',
  US = 'US',
  UY = 'UY',
  UZ = 'UZ',
  VU = 'VU',
  VE = 'VE',
  VN = 'VN',
  VG = 'VG',
  VI = 'VI',
  WF = 'WF',
  EH = 'EH',
  YE = 'YE',
  ZM = 'ZM',
  ZW = 'ZW',
}

export interface CreateAdmin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /** @maxLength 128 */
  password: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 250 */
  job_title?: string;
}

export interface CreateAllowedBlockPeriodRequest {
  /** @format date */
  start_date: string;
  /** @format date */
  end_date: string;
  /** @maxLength 255 */
  template_id: string;
}

export interface CreateAssignGuardian {
  first_name: string;
  last_name: string;
  /** @format email */
  email: string;
  phone: string;
  /** @maxLength 1 */
  gender?: string;
  /** @format uuid */
  student_id: string;
  relationship?: string;
  has_student_custody?: boolean;
}

export interface CreateConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  entity: string | null;
  type: ConceptTypesEnum;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_cycle: string | null;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /** @default true */
  subscription?: boolean;
  optional?: boolean;
  /**
   * Bank account for dispersions of concept.
   * @format uuid
   */
  bank_account?: string | null;
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard?: boolean;
  /** Months when concept must be paid(for generate orders). */
  months_to_pay: MonthsToPayEnum[];
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  interest_schema?: InterestSchema[];
  early_bird_discounts?: EarlyBirdDiscount[];
  /** Indicates if concept have IVA. */
  has_sales_tax?: boolean;
  /**
   * Fiscal product code for billing purposes.
   * @maxLength 30
   */
  tax_code?: string | null;
  /**
   * Fiscal unit code for billing purposes.
   * @maxLength 30
   */
  tax_unit?: string | null;
  /**
   * Institutional identifier to send when use_education_complement is activated(aut_rvoe).
   * @maxLength 32
   */
  institutional_id?: string | null;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable?: boolean;
  orders?: OrderCreate[];
  setup_periodic_restrictions?: boolean;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  series?: string | null;
  /** Indicates if concept must be use educational complement on billing. */
  use_education_complement?: boolean;
  /**
   * Special dispersion config of concept
   * @format uuid
   */
  payout_config?: string | null;
  /** Offering of the concept */
  offering?: OfferingEnum;
  does_invoice_as_general_public?: boolean;
}

export interface CreateConceptAutoAssignRequestDTO {
  section_ids: string[];
  /** @default true */
  is_auto_assignable?: boolean;
}

export interface CreateConceptAutoAssignResponseDTO {
  id: string;
}

export interface CreateConceptWithAttributes {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  entity: string | null;
  type: ConceptTypesEnum;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_cycle: string | null;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  subscription?: boolean;
  optional?: boolean;
  /**
   * Bank account for dispersions of concept.
   * @format uuid
   */
  bank_account?: string | null;
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard?: boolean;
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  interest_schema?: InterestSchema[];
  early_bird_discounts?: EarlyBirdDiscount[];
  /** Indicates if concept have IVA. */
  has_sales_tax?: boolean;
  /**
   * Fiscal product code for billing purposes.
   * @maxLength 30
   */
  tax_code?: string | null;
  /**
   * Fiscal unit code for billing purposes.
   * @maxLength 30
   */
  tax_unit?: string | null;
  /**
   * Institutional identifier to send when use_education_complement is activated(aut_rvoe).
   * @maxLength 32
   */
  institutional_id?: string | null;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable?: boolean;
  orders_attributes?: OrderWithAttributes[];
  /** Indicates if concept must be use educational complement on billing. */
  use_education_complement?: boolean;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  series?: string | null;
  orders?: OrderStock[];
  /**
   * Special dispersion config of concept
   * @format uuid
   */
  payout_config?: string | null;
  /** Offering of the concept */
  offering?: OfferingEnum;
  does_invoice_as_general_public?: boolean;
}

export interface CreateConceptWithSinglePayment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  entity: string | null;
  type: ConceptTypesEnum;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_cycle: string | null;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /** @default true */
  subscription?: boolean;
  optional?: boolean;
  /**
   * Bank account for dispersions of concept.
   * @format uuid
   */
  bank_account?: string | null;
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard?: boolean;
  /** Months when concept must be paid(for generate orders). */
  months_to_pay?: MonthsToPayEnum[];
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  interest_schema?: InterestSchema[];
  early_bird_discounts?: EarlyBirdDiscount[];
  /** Indicates if concept have IVA. */
  has_sales_tax?: boolean;
  /**
   * Fiscal product code for billing purposes.
   * @maxLength 30
   */
  tax_code?: string | null;
  /**
   * Fiscal unit code for billing purposes.
   * @maxLength 30
   */
  tax_unit?: string | null;
  /**
   * Institutional identifier to send when use_education_complement is activated(aut_rvoe).
   * @maxLength 32
   */
  institutional_id?: string | null;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable?: boolean;
  orders?: OrderCreate[];
  setup_periodic_restrictions?: boolean;
  /** Indicates if concept must be use educational complement on billing. */
  use_education_complement?: boolean;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  series?: string | null;
  /**
   * Special dispersion config of concept
   * @format uuid
   */
  payout_config?: string | null;
  /** Offering of the concept */
  offering?: OfferingEnum;
  does_invoice_as_general_public?: boolean;
}

export interface CreateDashboardCreditNoteRequestDTO {
  /**
   * CASH = 01
   * TRANSFER = 03
   * CREDIT_CARD = 04
   * DEBIT_CARD = 28
   * TO_DEFINE = 99
   */
  payment_method: CreateDashboardCreditNoteRequestDTOPaymentMethodEnum;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  amount: string;
  observations?: string | null;
}

export enum CreateDashboardCreditNoteRequestDTOPaymentMethodEnum {
  Value01 = '01',
  Value03 = '03',
  Value04 = '04',
  Value28 = '28',
  Value99 = '99',
}

export interface CreateDashboardCreditNoteResponseDTO {
  id: string;
  client_identifier: string;
}

export interface CreateDashboardInvoiceRequestDTO {
  payin_fulfillment: number;
  observations?: string | null;
}

export interface CreateDashboardInvoiceResponseDTO {
  /** @format uuid */
  id: string;
}

export interface CreateKushkiPreference {
  /** @format uuid */
  guardian: string;
  items: CreateServicePreferenceItem[];
  preference_type: PreferenceTypeEnum;
  token?: string;
  card_type?: CardTypeEnum;
}

export interface CreateMassiveConceptAssignments {
  /** @minItems 1 */
  orders: string[];
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  concept: string;
  /** @minItems 1 */
  students: string[];
}

export interface CreatePayoutBalanceRequestDTO {
  payout_id: string;
  balance_type: BalanceTypeEnum;
  /**
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  amount: string;
  registered_by: string;
  comment: string;
}

export interface CreateRefundDashboardRequestDTO {
  payin_fulfillment_id: string;
  /** @format double */
  amount: number;
  invoice_action: InvoiceActionEnum;
  /**
   * cash = cash
   * transfer = transfer
   * credit_card = credit_card
   * debit_card = debit_card
   * to_define = to_define
   */
  payment_method?: CreateRefundDashboardRequestDTOPaymentMethodEnum;
  /** @format date */
  registered_at?: string;
  comment?: string;
  /** @default false */
  unassign_concept?: boolean;
}

export enum CreateRefundDashboardRequestDTOPaymentMethodEnum {
  Cash = 'cash',
  Transfer = 'transfer',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  ToDefine = 'to_define',
}

export interface CreateRefundDashboardResponseDTO {
  id: string;
  payin_fulfillment: string;
  action: string;
  amount: string;
  invoice?: string;
  /** @format date */
  registered_at: string;
  comment: string;
  payment_method: string;
  /** @default false */
  unassign_concept?: boolean;
}

export interface CreateSchoolBlockedPeriodRequest {
  /** @format date */
  start_date: string;
  /** @format date */
  end_date: string;
}

export interface CreateServicePreferenceItem {
  /** @format uuid */
  student: string | null;
  /** @format uuid */
  order: string;
}

export interface CreateSpecialDiscountDashboardRequestDTO {
  /** @maxLength 255 */
  name: string;
  /** @format uuid */
  student: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  order: string;
  /**
   * Amount or percentage of discount depending of type.
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  value?: string | null;
  /** Type of discount. */
  type: Type104Enum;
}

export interface CreateSubscriptionRequestDTO {
  /** @format uuid */
  guardian_id: string;
  /** @format uuid */
  student_id: string;
  /** @format uuid */
  concept_id: string;
  /** @format date */
  start_date: string;
  /** @format date */
  end_date?: string;
  card_type: CardTypeEnum;
  token?: string;
}

export interface CreateUpdateUserDTO {
  first_name?: string;
  last_name?: string;
  /** @format email */
  email?: string;
  mobile?: string | null;
  membership?: string;
  is_active?: boolean;
}

export interface CreateUser {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /** @maxLength 20 */
  mobile?: string | null;
  password?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Email address
   * Email address of the user.
   * @format email
   * @maxLength 254
   */
  email: string;
  /** @default false */
  is_staff?: boolean;
  auth_token: string;
}

export interface CreditNoteWithTotal {
  /** @format uuid */
  id: string;
  /** @format double */
  total: number;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface CustomConceptSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Name of the concept. Concatenate concept basename with rootConcept name */
  name: string;
  type: string;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable: boolean;
}

export interface CustomFulfillmentSerializerV2 {
  /**
   * Fulfillment unique identifier
   * @format uuid
   */
  id: string;
  /** Order name */
  order_name: string;
  /**
   * Student unique identifier
   * @format uuid
   */
  student_id: string | null;
  /** Student first name */
  student_first_name: string | null;
  /**
   * Total amount of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total: string;
  /**
   * Subtotal amount of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  subtotal: string;
  /**
   * Discount of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  discount: string;
  /**
   * Interest of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  interest: string;
  /** Discount breakdown */
  discount_breakdown: Record<string, any>;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  concept: CustomConceptSerializerV2;
  payin_fulfillments: CustomPayinFulfillmentDetailSerializerV2[];
}

export interface CustomPayinFulfillmentDetailSerializerV2 {
  /**
   * PayinFulfillment unique identifier
   * @format uuid
   */
  id: string;
  /**
   * Total paid amount of payinFulfillment
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_paid: string;
  /**
   * Paid date of payinFulfillment
   * @format date-time
   */
  paid_date: string;
}

export interface CustomPayinFulfillmentSerializerV2 {
  id: number;
  /**
   * Paid amount for payinFulfillment
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_paid: string;
  is_partial?: boolean;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  invoice: Invoice;
  fulfillment: CustomFulfillmentSerializerV2;
}

export interface CustomStudentPayinSerializerV2 {
  /**
   * Student unique identifier
   * @format uuid
   */
  student_id: string | null;
  /** Student first name */
  first_name: string | null;
  /** List of paid orders */
  orders: string[];
}

export interface DashbaordSchoolDueOrdersDelinquents {
  zero: number;
  low: number;
  mid: number;
  high: number;
  total: number;
}

export interface DashboardDependentFulfillment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
  /** Original amount to be paid(before discounts and interests) */
  amount: string;
  /** Final amount to be paid(after discounts and interests). */
  final_amount: string;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  currency: string;
  due: string;
  /** Payment status of the fulfillment */
  status?: StatusDc1Enum;
  /**
   * Total interest for fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  interest: string;
  total_charge: string;
  /**
   * Total discount of the fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  discount: string;
  /** Boolean indicates if first payin associated to order is pending. */
  pending: boolean;
  student: SlimStudent;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current pending amount to be paid. */
  pending_amount: string;
  order_id: string;
  is_due: string;
  /** Fulfillments required paid previously (only one level deep) */
  paid_fulfillments_required_proxy: string[];
  /** Fulfillments that require this fulfillment to be made (only one level deep) */
  fulfillments_dependent_proxy: string[];
  /** Fulfillments that require this fulfillments to be made (all levels deep) */
  fulfillments_dependent: string[];
  is_billable: boolean | null;
  /** Special Overcharges charged to the fulfillment */
  special_over_charges: SpecialOverCharge[];
  subscription: Record<string, any>;
}

export interface DashboardDependentOrder {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Original amount to be paid(before discounts and interests), belongs to order price amount.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  amount: string;
  /** Final amount to be paid(after discounts and interests). */
  final_amount: string;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  currency: string;
  due: string;
  /** Status of the student order (legacy version). */
  status: Status259Enum;
  /** Interest amount of fulfillment(order-student). */
  interest: string;
  /** Discount amount of fulfillment(order-student). */
  discount: string;
  /** Boolean indicates if first payin associated to order is pending. */
  pending: boolean;
  dependent: string;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current pending amount to be paid. */
  pending_amount: string;
  /** Fulfillment id for order student. */
  fulfillment_id: string;
  /** Interest + visible over charge amount amount of fulfillment(order-student). */
  total_charge: string;
  base_amount: string;
  /** status of the fulfillment */
  fulfillment_status: string;
}

export interface DashboardDependentOrderDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Original amount to be paid(before discounts and interests), belongs to order price amount.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  amount: string;
  tax_amount: string;
  pre_tax_price_amount: string;
  /** Final amount to be paid(after discounts and interests). */
  final_amount: string;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  currency: string;
  due: string;
  /** Status of the student order (legacy version). */
  status: Status259Enum;
  /** Interest amount of fulfillment(order-student). */
  interest: string;
  /** Discount amount of fulfillment(order-student). */
  discount: string;
  discount_breakdown: DiscountBreakdown;
  /** Boolean indicates if first payin associated to order is pending. */
  pending: boolean;
  dependent: SlimStudent;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current pending amount to be paid. */
  pending_amount: string;
  /** Fulfillment id for order student. */
  fulfillment_id: string;
  /** status of the fulfillment */
  fulfillment_status: string;
  fulfillment_base_amount: string;
  payins: Payin[];
  special_over_charges: SlimSpecialOverCharge[];
  original_due: string;
  is_interest_forgiven: boolean;
  forgiven_interest: string;
}

export interface DashboardFulfillment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  order_name: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  order_id: string;
  student: SlimStudent;
  guardian: BillingGuardian;
  /** Original amount to paid(original order amount). */
  amount: string;
  /** Final amount to paid(after discounts and interests). */
  final_amount: string;
  /** @format date-time */
  paid_date?: string | null;
  /** Payment status of the fulfillment */
  status?: StatusDc1Enum;
  /**
   * Interest of fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  interest: string;
  /**
   * Discount of fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  discount: string;
  /** Schema of detailed discounts aplied to fulfillment. */
  discount_breakdown?: Record<string, any>;
  /** Indicate if payment is manual (payment do not have transaction). */
  is_manual: string;
  /** @format date */
  due_date: string;
  /**
   * Current paid amount.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  paid_amount: string;
  /** Indicate if fulfillment has partial payins. */
  has_partial_payins: string;
  /** Indicate if first payment of fulfillment is collected at school. */
  collected_at_school: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  invoice: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  payout: DashboardPayoutIds | null;
  /**
   * Current pending amount to paid.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  pending_amount: string;
  payins: Payin[];
  /** Estado calculado en base a los estados de los Invoices de los payinFulfillments del fulfillment  */
  invoice_status: string;
  payin_fulfillments: PayinFulfillmentDetail[];
  is_sponsored: string;
  /**
   * Total guardian commission (commission + tax).
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  guardian_commission: string;
  /** Indicates if the interest of the fulfillment are forgiven */
  interest_forgiven?: boolean;
  /**
   * Original Price.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  original_amount: string;
  special_over_charges: string;
  refund: CreateRefundDashboardResponseDTO;
  amounts_config: Record<string, any>;
  /** @format date */
  original_due: string;
  is_billable: boolean;
}

export interface DashboardFulfillmentList {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  order_name: string;
  student: SlimStudent;
  guardian: BillingGuardian;
  /** Original amount to paid(original order amount). */
  amount: string;
  /** Final amount to paid(after discounts and interests). */
  final_amount: string;
  /** @format date-time */
  paid_date?: string | null;
  /** Payment status of the fulfillment */
  status?: StatusDc1Enum;
  /** Indicate if fulfillment has partial payins. */
  has_partial_payins: string;
  /**
   * Current paid amount.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  paid_amount: string;
  /** Estado calculado en base a los estados de los Invoices de los payinFulfillments del fulfillment  */
  invoice_status: string;
  /** Indicate if first payment of fulfillment is collected at school. */
  collected_at_school: string;
  payout: string;
  invoices: string;
  is_sponsored: string;
  /** Id del school cycle perteneciente al concepto pagado en el fulfillment */
  school_cycle_id: string;
}

export interface DashboardFulfillmentListSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  order_name: string;
  student: SlimStudent;
  guardian: BillingGuardian;
  /** Original amount to paid(original order amount). */
  amount: {
    /**
     * @format double
     * @default "0.00"
     * @example "9287.00"
     */
    string_value: string;
    /**
     * @default 0
     * @example 123
     */
    int_value: number;
    /**
     * @default 2
     * @example 2
     */
    coefficient: number;
  };
  /** Final amount to paid(after discounts and interests). */
  final_amount: string;
  /** @format date-time */
  paid_date?: string | null;
  /** Payment status of the fulfillment */
  status?: StatusDc1Enum;
  /**
   * Amount already paid for fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total_paid?: string;
  /** Estado calculado en base a los estados de los Invoices de los payinFulfillments del fulfillment  */
  invoice_status: InvoiceStatusEnum;
  /** Indicate if first payment of fulfillment is collected at school. */
  collected_at_school: boolean | null;
  payout: DashboardPayoutIds | null;
  payins: Payin[];
  invoices: Invoice[];
  is_sponsored: boolean;
}

export interface DashboardGuardian {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Activate or deactive send emails to guardian. */
  send_emails?: boolean;
  /** Activate or deactive send whatsapps to guardian. */
  send_whatsapps?: boolean;
  due_total: string;
  billing_info?: BillingGuardianInfo;
  dependents: DashboardStudentDetail[];
  /** @maxLength 255 */
  occupation?: string | null;
  /** @maxLength 255 */
  workplace?: string | null;
  /** @maxLength 255 */
  workphone?: string | null;
  /** @default "" */
  relationship: string;
  has_student_custody: boolean;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_id: string;
}

export interface DashboardGuardianActionSendMessage {
  type: DashboardGuardianActionSendMessageTypeEnum;
  selected_school: string;
}

export enum DashboardGuardianActionSendMessageTypeEnum {
  Onboard = 'onboard',
}

export interface DashboardGuardianSendOutboundRequestDTO {
  action: DashboardGuardianActionSendMessage;
}

export interface DashboardGuardianSlim {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Activate or deactive send emails to guardian. */
  send_emails?: boolean;
  /** Activate or deactive send whatsapps to guardian. */
  send_whatsapps?: boolean;
  billing_info?: BillingGuardianInfo;
  /** @maxLength 255 */
  occupation?: string | null;
  /** @maxLength 255 */
  workplace?: string | null;
  /** @maxLength 255 */
  workphone?: string | null;
  /** @default "" */
  relationship: string;
  has_student_custody: boolean;
  /** @format uuid */
  school_id?: string;
}

export interface DashboardJoyride {
  first_partial_payin?: boolean;
}

export interface DashboardLevel {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the level.
   * @maxLength 350
   */
  name: string;
  sections: DashboardSection[];
}

export interface DashboardPayin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  type: Type11EEnum;
  total_currency: string;
  invoices_pdfs: string[];
  /** Indicates if payment was received in school. */
  collected_at_school: boolean;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  created_by: User;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Schema that contains relevant information added at momment of registering a payment(comment, bank_name, reference, etc). */
  manual_payment_metadata: Record<string, any>;
  /**
   * Total amount of the payin.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  /** @format uuid */
  guardian: string;
  /** @format date */
  paid_date: string;
  fulfillments: any[];
  generate_invoice: boolean;
  /** @format uuid */
  manual_payment_account?: string;
  /** @maxLength 150 */
  comment?: string | null;
  show_comment?: boolean | null;
  transaction_reference?: string | null;
  sender_account_number?: string | null;
  card_last_digits?: string | null;
  bank_name?: string | null;
  is_partial: boolean;
  optional_orders: ValidateOptionalOrderStudent[];
}

export interface DashboardPayinDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  /** Type of the payin */
  type: Type11EEnum | NullEnum | null;
  /**
   * Total amount of the payin.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  total_currency: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  guardian: string | null;
  /**
   * Datetime when payment is executed, is diferent a datetime when payin was setted as successful.
   * @format date-time
   */
  paid_date: string | null;
  manual_payment_account: DetailBankAccount;
  /** Indicates if payment was received in school. */
  collected_at_school: boolean;
  fulfillments: DashboardFulfillmentList[];
  payin_fulfillments: DashboardPayinFulfillment[];
  has_invoice: boolean;
  created_by: User;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  comment: string;
  show_comment: string;
  transaction_reference: string;
  sender_account_number: string;
  card_last_digits: string;
  bank_name: string;
}

export interface DashboardPayinFulfillment {
  id: number;
  is_partial: boolean;
  /** @format double */
  total_paid: number;
  order: string;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  payout: Payout;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  payin: Payin;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  fulfillment: SimpleFulfillment;
  invoice: Invoice;
  refund: RetrieveRefundDashboardDTO | null;
  /**
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  paid_interest: string;
}

export interface DashboardPayout {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  status?: StatusFdeEnum;
  /**
   * Datetime when transaction started.
   * @format date-time
   */
  transaction_started?: string | null;
  /**
   * Date when transaction must be started, this in an approximation.
   * @format date
   */
  scheduled_date?: string | null;
  deposit_date: string;
}

export interface DashboardPayoutIds {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  status?: StatusFdeEnum;
  /**
   * Datetime when transaction started.
   * @format date-time
   */
  transaction_started?: string | null;
  /**
   * Date when transaction must be started, this in an approximation.
   * @format date
   */
  scheduled_date?: string | null;
  deposit_date: string;
}

export interface DashboardRootConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_cycle?: string | null;
  /** Type of the concept. */
  type: ConceptTypesEnum;
  /**
   * Name of the concept.
   * @maxLength 124
   */
  name: string;
}

export interface DashboardRootConceptDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_cycle?: string | null;
  /** Type of the concept. */
  type: ConceptTypesEnum;
  /**
   * Name of the concept.
   * @maxLength 124
   */
  name: string;
  concepts: Concept[];
}

export interface DashboardSchool {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the school.
   * @maxLength 350
   */
  name: string;
  job_title: string;
  /** Schema to specify some configs for school dashboard or invoicing. */
  config_dashboard?: Record<string, any>;
  /** Indicates if school uses our invoicing services. */
  does_invoice?: boolean;
  can_invoice_to_general_public?: boolean;
  /** If true, scholarships and partial payments are applied independently on the original amount. */
  apply_discounts_independently?: boolean;
  /**
   * Logo of the school.
   * @format uri
   */
  logo?: string | null;
  /** Indicate if is a demo school. */
  demo?: boolean;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Type of institution this school represents. */
  school_type?: SchoolTypeEnum | BlankEnum | NullEnum | null;
  /** Current status of the school */
  status?: Status2B3Enum;
  has_integration: boolean;
  /** Default cfdi config for invoice. */
  cfdi_use_config?: Record<string, any>;
  invoice_discount_breakdown: boolean;
}

export interface DashboardSchoolDueOrdersResume {
  total: number;
  delinquents: DashbaordSchoolDueOrdersDelinquents;
}

export interface DashboardSchoolFilters {
  concepts: Concept[];
  orders: OrderFilter[];
  sections: DashboardSchoolSection[];
  levels: DashboardSchoolLevel[];
  payment_methods: string[][];
  collected_at: string[][];
  concepts_types: string[][];
  concepts_months: [number, string][];
}

export interface DashboardSchoolLevel {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the level.
   * @maxLength 350
   */
  name: string;
}

export interface DashboardSchoolPayoutDetails {
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  /** Public summary for bank account related to payout. */
  bank_account: string;
  /** Account number for bank account related to payout. */
  bank_account_number: string;
  commission: string;
  payin_fulfillments: SimplePayinFulfillment[];
  status?: StatusFdeEnum;
  total_received: string;
  /**
   * Datetime when transaction started.
   * @format date-time
   */
  transaction_started?: string | null;
  /**
   * Date when transaction must be started, this in an approximation.
   * @format date
   */
  scheduled_date?: string | null;
  deposit_date: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  discounts: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  surcharges: string;
  discount_and_surcharge_details: string;
}

export interface DashboardSchoolPayouts {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  status?: StatusFdeEnum;
  /**
   * Datetime when transaction started.
   * @format date-time
   */
  transaction_started?: string | null;
  /** Public summary for bank account related to payout. */
  bank_account: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_received: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_emitted: string;
  /**
   * Date when transaction must be started, this in an approximation.
   * @format date
   */
  scheduled_date?: string | null;
  orders_count: number;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  deposit_date: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  discounts: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  surcharges: string;
}

export interface DashboardSchoolSection {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  level: string;
  /**
   * Grade of the section.
   * @maxLength 100
   */
  grade: string;
  /**
   * Internal name for section inside a grade.
   * @maxLength 50
   */
  group?: string | null;
}

export interface DashboardSchoolUpdate {
  /**
   * Name of the school.
   * @maxLength 350
   */
  name?: string;
  /**
   * Logo of the school.
   * @format uri
   */
  logo?: string | null;
  /**
   * Email contact of the school
   * @format email
   * @maxLength 254
   */
  email?: string;
  phone?: string;
  can_invoice_to_general_public?: boolean;
  /** @format time */
  emit_invoice_time?: string | null;
  enable_manual_pay_invoice?: boolean;
  /** Defines if scholarship discount is applied over the previous scholarship discount */
  scholarship_is_accumulative?: boolean;
  /** Determines which config is used for due orders and scholarships. */
  scholarship_lost_config?: ScholarshipLostConfigEnum;
  /** Configuration for scholarship settings */
  scholarship_config?: Record<string, any>;
  /** Enable discount breakdown in invoices */
  invoice_discount_breakdown?: boolean;
  /** Define if interest rate is frozen after first partial payment */
  partial_payment_interest_freeze?: boolean;
  /** Indicated amount over witch amount must be apply interests. */
  partial_payment_interest_type?: PartialPaymentInterestTypeEnum;
  /** Indicates if school uses our invoicing services. */
  does_invoice?: boolean;
  /** Default cfdi config for invoice. */
  cfdi_use_config?: Record<string, any>;
  /** Default cfdi config for discounts */
  discounts_config?: Record<string, any>;
}

export interface DashboardSchoolWithStudents {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the school.
   * @maxLength 350
   */
  name: string;
  /**
   * Logo of the school.
   * @format uri
   */
  logo?: string | null;
  /**
   * Email contact of the school
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Phone contact of the school
   * @maxLength 128
   */
  phone: string;
  levels: DashboardLevel[];
  can_perform_school_cycle_activation: string;
  /** Defines if scholarship discount is applied over the previous scholarship discount */
  scholarship_is_accumulative?: boolean;
  /** Determines which config is used for due orders and scholarships. */
  scholarship_lost_config?: ScholarshipLostConfigEnum;
  /** @example {"apply_interest":true,"apply_early_bird":false} */
  scholarship_config: {
    /** Whether to apply interest calculations when scholarships are active */
    apply_interest?: boolean;
    /** Whether to apply early bird discounts when scholarships are active */
    apply_early_bird?: boolean;
  };
  /** Define if interest rate is frozen after first partial payment */
  partial_payment_interest_freeze?: boolean;
  /** Indicated amount over witch amount must be apply interests. */
  partial_payment_interest_type?: PartialPaymentInterestTypeEnum;
  /** If true, scholarships and partial payments are applied independently on the original amount. */
  apply_discounts_independently?: boolean;
}

export interface DashboardSection {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
  students: DashboardStudentSlim[];
}

export interface DashboardStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name: string;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate: string | null;
  /** Gender of the person. */
  gender: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  section?: string | null;
  /**
   * Date when student join school.
   * @format date
   */
  entry_date?: string | null;
  /**
   * Guardian used for billing.
   * @format uuid
   */
  billing_guardian?: string | null;
  guardians: Guardian[];
  billing_guardian_info: BillingGuardianInfo;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  school_cycle_id: string | null;
  /** @format date */
  credential_expiration_date?: string | null;
}

export interface DashboardStudentDelinquency {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Level name */
  level: string | null;
  /** Section name */
  section: string | null;
  total_debt: string;
  fulfillments: string;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  number_of_past_due_orders: string;
  due_monthly_orders: string;
}

export interface DashboardStudentDelinquencyDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Level name */
  level: string | null;
  /** Section name */
  section: string | null;
  total_debt: string;
  number_of_past_due_orders: string;
  fulfillments: string;
  guardians: string;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
}

export interface DashboardStudentDelinquencyDetailSummary {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Level name */
  level: string;
  /** Section name */
  section: string;
  total_debt: string;
  number_of_past_due_orders: string;
  guardians: Guardian[];
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  guardian_id: string | null;
  guardian_name: string | null;
  delinquent_concepts: string;
}

export interface DashboardStudentDelinquencySummary {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Level name */
  level: string;
  /** Section name */
  section: string;
  total_debt: string;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  number_of_past_due_orders: string;
  due_monthly_orders: string;
  guardian_id: string | null;
  guardian_name: string | null;
  delinquent_concepts: string;
}

export interface DashboardStudentDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  guardians: Guardian[];
  billing_guardian_info: BillingGuardianInfo;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  section: InternalSection;
  due_orders: string;
  due_total_price: string;
  has_partial_payins: string;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  /** The current inscription status for the next cycle */
  inscription_status?: InscriptionStatusEnum;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  inscription_section: InscriptionSection[];
  /**
   * Student photo.
   * @format uri
   */
  photo?: string | null;
  /** @format date */
  credential_expiration_date?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
}

export interface DashboardStudentList {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  section: string;
  level: string;
  due_orders: string;
  due_total_price: string;
  has_partial_payins: string;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  /** The current inscription status for the next cycle */
  inscription_status?: InscriptionStatusEnum;
  next_inscription_status: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
}

export interface DashboardStudentListDueOrderSerializerV4 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  section: string;
  level: string;
  due_orders: string;
  due_total_price: string;
  has_partial_payins: string;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  /** The current inscription status for the next cycle */
  inscription_status?: InscriptionStatusEnum;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  section_for_selected_school_cycle: string;
  level_for_selected_school_cycle: string;
  status_for_selected_school_cycle: string;
  next_inscription_status: string;
}

export interface DashboardStudentResumeSerializerV2 {
  total: number;
  new: number;
  active: number;
  inactive: number;
  graduates: number;
  drop_outs: number;
}

export interface DashboardStudentSearch {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  level: string;
  section: string;
  guardians: SlimGuardian[];
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  /** The current inscription status for the next cycle */
  inscription_status?: InscriptionStatusEnum;
  scholarships: SlimStudentsScholarship[];
}

export interface DashboardStudentSlim {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
  assignment: string;
}

export interface DeleteConceptAutoAssignRequestDTO {
  concept_auto_assign_ids: string[];
  delete_concept_assignments: boolean;
}

export interface DelinquencyQuantity {
  /** Number of due orders. */
  due_orders: number;
  /** Number of students who owe that number of orders. */
  students_count: number;
}

export interface DelinquencyStatsHistoric {
  month: number;
  year: number;
  total_students: number;
  paid_students: number;
  delinquency_students: number;
  /**
   * @format decimal
   * @pattern ^-?\d{0,3}(?:\.\d{0,2})?$
   */
  paid_percentage: string;
}

export interface DelinquencyStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /** Section name */
  section: string | null;
  /** Level name */
  level: string | null;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Number of due orders by student. */
  due_orders: string;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
}

export interface DelinquentStudentsStatistics {
  value: number;
  /** @format double */
  percentage: number;
}

export interface DestroyMassiveConceptAssignment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
  /** Status for Massive Concept Assignment */
  status?: Status386Enum;
  /**
   * @min 0
   * @max 2147483647
   */
  student_quantity?: number | null;
  is_concept_optional: boolean;
}

export interface DetailAdmin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 250 */
  job_title: string;
  membership_name: string;
  permission_set: Membership;
  dashboard_joyride: DashboardJoyride;
}

export interface DetailBankAccount {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Type of the bank account, CLABE_ACCOUNT type only for Kushki tests. */
  account_type: AccountTypeEnum;
  /**
   * Name of the owner of the bank account.
   * @maxLength 255
   */
  owner: string;
  /**
   * Friendly name for bank account.
   * @maxLength 55
   */
  nickname?: string;
  /**
   * Name of the banck.
   * @maxLength 75
   */
  bank_name: string;
  /** @maxLength 55 */
  account_number: string;
  public_summary: string;
}

export interface DetailConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  type: string;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /** Indicates if concept have IVA. */
  has_sales_tax?: boolean;
  /**
   * Fiscal product code for billing purposes.
   * @maxLength 30
   */
  tax_code?: string | null;
  /**
   * Fiscal unit code for billing purposes.
   * @maxLength 30
   */
  tax_unit?: string | null;
  entity: FiscalEntity;
  /** Months when concept must be paid(for generate orders). */
  months_to_pay?: MonthsToPayEnum[];
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  early_bird_discounts?: EarlyBirdDiscount[];
  interest_schema?: InterestSchema[];
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard?: boolean;
  bank_account: DetailBankAccount;
  /**
   * Institutional identifier to send when use_education_complement is activated(aut_rvoe).
   * @maxLength 32
   */
  institutional_id?: string | null;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable?: boolean;
  orders: Order[];
  optional: boolean;
  subscription: boolean;
  school_cycle: SchoolCycle;
  /** Indicates if concept must be use educational complement on billing. */
  use_education_complement?: boolean;
  can_be_deleted: boolean;
  payout_config: PayoutConfig | null;
  auto_assigned_concepts: ConceptAutoAssignedLevel[];
  series: string;
  root_concept_id: string;
  /** Offering of the concept */
  offering?: OfferingEnum;
  does_invoice_as_general_public: boolean;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface DetailedConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Name of the concept. Concatenate concept basename with rootConcept name */
  name: string;
  type: string;
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard: boolean;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /** Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day). */
  payday: number;
  school_cycle: SchoolCycle;
}

export interface DetailedStudentOrder {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  concept: DetailedConcept;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  price_currency: string;
  due: string;
  /** Status of the student order (legacy version). */
  status: Status259Enum;
  /** Interest + visible over charge amount amount of fulfillment(order-student). */
  total_charge: string;
  /** Interest amount of fulfillment(order-student). */
  interest: string;
  /** Discount amount of fulfillment(order-student). */
  discount: string;
  /** Discount details of fulfillment(order-student). */
  discount_breakdown: Record<string, any>;
  /** Boolean indicates if first payin associated to order is pending. */
  pending: boolean;
  /** Deprecated. */
  expiration: string;
  /** Payins associated to fulfillment(order-student) */
  payins: Payin[] | null;
  invoice: Invoice | null;
  dependent: SlimStudent | null;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  /** Commission amount charged based on payin type. */
  commissions: string;
  /** Commission amount charged to guardian based on payin type. */
  guardian_commission: string;
  is_sponsored: string;
  base_amount: string;
  original_due: string;
}

export interface DiscountBreakdown {
  /**
   * Total amount of discounts applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  /** Details of discounts applied to the order. */
  details: DiscountBreakdownItems;
}

export interface DiscountBreakdownEarlyBird {
  /**
   * Total amount of discounts applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  details: DiscountBreakdownEarlyBirdDetail[];
}

export interface DiscountBreakdownEarlyBirdDetail {
  name: string;
  /**
   * Discount amount applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  discount: string;
  /** @format date */
  until_date: string;
}

export interface DiscountBreakdownItems {
  /** Scholarships applied to the order. */
  scholarships: DiscountBreakdownScholarship | null;
  /** Special discounts applied to the order. */
  special: DiscountBreakdownSpecial | null;
  /** Early bird discounts applied to the order. */
  early_bird: DiscountBreakdownEarlyBird | null;
}

export interface DiscountBreakdownScholarship {
  /**
   * Total amount of discounts applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  details: DiscountBreakdownScholarshipDetail[];
}

export interface DiscountBreakdownScholarshipDetail {
  name: string;
  /**
   * Discount amount applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  discount: string;
  /** @format uuid */
  id: string;
  active: boolean;
}

export interface DiscountBreakdownSpecial {
  /**
   * Total amount of discounts applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  details: DiscountBreakdownSpecialDetail[];
}

export interface DiscountBreakdownSpecialDetail {
  name: string;
  /**
   * Discount amount applied to the order.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  discount: string;
  /** @format uuid */
  id: string;
  type: string;
}

export enum DiscountOrderEnum {
  SC_EB_SD = 'SC_EB_SD',
  EB_SC_SD = 'EB_SC_SD',
  EB_IN_SC_SD = 'EB_IN_SC_SD',
}

export enum DiscountTypeEnum {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  FIXED = 'FIXED',
  BRILLAMONT = 'BRILLAMONT',
}

export interface EarlyBirdDiscount {
  name: string;
  discount_type: DiscountTypeEnum;
  /**
   * max number of days (count from due to backward) to get discount.
   * @min 0
   */
  up_to_days: number;
  /**
   * @format double
   * @min 0
   */
  discount_value: number;
}

export interface EarlyBirdDiscountSchema {
  name: string;
  discount_type: DiscountTypeEnum;
  /** @min 0 */
  up_to_days: number;
  /** @min 0 */
  discount_value: number;
}

export interface EmailRequestDTO {
  /** @format email */
  email: string;
}

export enum EntityTypeEnum {
  STUDENTS = 'STUDENTS',
  SECTIONS = 'SECTIONS',
}

export interface ErrorResponse {
  error: string;
}

export interface ExcelReport {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Filename used for generate report.
   * @maxLength 255
   */
  filename?: string | null;
  /** Status of the report. */
  status: StatusFc7Enum;
  url: string;
  /** Type of xls report. */
  report_type?: ReportTypeEnum;
}

export interface ExecutePayoutResponse {
  /** @format uuid */
  payout_id: string;
  message: string;
}

export interface ExternalAuthRequest {
  external_id: string;
}

export interface FailedInvoiceActionResponseDTO {
  /** @format uuid */
  id: string;
  /** @format date-time */
  created: string;
  status?: string | null;
  fail_origin?: string | null;
  provider_responses?: string | null;
  error_code?: string | null;
  failed_reason?: string | null;
}

export interface FailedInvoiceResponseDTO {
  /** @format uuid */
  id: string;
  status: string;
  /** @format date-time */
  created: string;
  school_name: string;
  payin_id: string | null;
  /** @format date-time */
  last_attempt_date: string | null;
  /** @format date-time */
  next_attempt_date: string | null;
  invoice_action: FailedInvoiceActionResponseDTO | null;
  fiscal_entity: FiscalEntityResponseDTO | null;
}

export interface FeatureToggle {
  /** @maxLength 255 */
  name: string;
  status: FeatureToggleStatusEnum;
}

export enum FeatureToggleStatusEnum {
  HIDDEN = 'HIDDEN',
  STAFF = 'STAFF',
  BETA = 'BETA',
  PUBLIC = 'PUBLIC',
}

export interface FilterFieldMetadata {
  /** Nombre del campo de filtro */
  name: string;
  /** Tipo de dato del filtro (ej. list, string, date) */
  type: string;
  /** Valores posibles para filtros de tipo enumerado */
  options?: string[] | null;
  /** Descripción del propósito del filtro */
  description: string;
}

export interface FilterPayouts {
  bank_accounts: BasicBankAccount[];
  statuses: BaseEnum[];
}

export interface FilterViewConcept {
  type: BaseEnum[];
  school_cycles: BaseEnum[];
  offering: BaseEnum[];
}

export interface FilterViewDelinquentStudents {
  due_orders: BaseEnum[];
  concepts: DetailedConcept[];
  concept_types: BaseEnum[];
  due_monthly_concepts: BaseEnum[];
  orders: Order[];
  levels: Level[];
  sections: Section[];
  fulfillment_statuses: BaseEnum[];
  school_cycles: SchoolCycle[];
  is_active: BaseEnum[];
  state: BaseEnum[];
}

export interface FilterViewInvoice {
  collected_at: BaseEnum[];
  concepts: DetailedConcept[];
  concept_types: BaseEnum[];
  orders: Order[];
  types: BaseEnum[];
  levels: Level[];
  sections: Section[];
  invoice_statuses: BaseEnum[];
  school_cycles: SchoolCycle[];
  billing_to: BaseEnum[];
  registered_by: User[];
  invoice_types: BaseEnum[];
}

export interface FilterViewPayinFulfillment {
  collected_at: BaseEnum[];
  concepts: DetailedConcept[];
  concept_types: BaseEnum[];
  orders: Order[];
  types: BaseEnum[];
  levels: Level[];
  sections: Section[];
  invoice_statuses: BaseEnum[];
  school_cycles: SchoolCycle[];
  billing_to: BaseEnum[];
  registered_by: User[];
}

export interface FilterViewPayins {
  bank_accounts: BasicBankAccount[];
  types: BaseEnum[];
  users: User[];
}

export interface FilterViewScholarship {
  levels: Level[];
  sections: Section[];
  scholarships: Scholarship[];
  active: BaseEnum[];
}

export interface FilterViewStudents {
  levels: Level[];
  sections: Section[];
  concepts: DetailedConcept[];
  scholarships: Scholarship[];
  due_orders: BaseEnum[];
  active: BaseEnum[];
  state: BaseEnum[];
  inscription_status: BaseEnum[];
  paid_status: BaseEnum[];
}

export interface FilterViewStudentsByLevel {
  concepts: DetailedConcept[];
  scholarships: Scholarship[];
  due_orders: BaseEnum[];
  has_debt: BaseEnum[];
  inscription_status: BaseEnum[];
}

export interface FiscalEntity {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of fiscal entity.
   * @maxLength 350
   */
  name: string;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 50
   */
  tax_id: string;
  /** Fiscal regime config for billing. */
  taxing_system: TaxingSystemEnum;
  /**
   * When the provided CSD for this tax ID expires
   * @format date-time
   */
  certificate_expiry?: string | null;
}

export interface FiscalEntityResponseDTO {
  /** @format uuid */
  id: string;
  name: string;
  tax_id: string;
  /** @format uuid */
  school_id?: string;
  school_name?: string;
}

export enum FraudStatusEnum {
  NoRisk = 'no_risk',
  LowRisk = 'low_risk',
  MediumRisk = 'medium_risk',
  HighRisk = 'high_risk',
  UnderInvestigation = 'under_investigation',
}

export interface FulfillmentInvoice {
  /** @format uuid */
  id: string;
  correlative_id: string;
  /** @format uuid */
  student_id: string;
}

export interface FulfillmentRequestDTO {
  /**
   * List of correlative IDs (max 500 items)
   * @maxItems 500
   */
  correlative_ids: string[];
}

export interface FulfillmentResponseDTO {
  /** @format uuid */
  id: string;
  correlative_id: string;
  /** @format uuid */
  order_id: string;
  order_name: string;
  /** @format uuid */
  student_id: string;
  student_name: string;
  /** @format uuid */
  school_id: string;
  school_name: string;
  /** @format date-time */
  due: string;
  /** @format uuid */
  guardian_id: string;
  guardian_name: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  total_paid: string;
  total_paid_currency: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  total_remaining: string;
  total_remaining_currency: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  discount: string;
  discount_currency: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  overcharge: string;
  overcharge_currency: string;
  status: string;
  /** @format date-time */
  paid_date: string;
}

export enum FulfillmentStatusesEnum {
  NOT_PAID = 'NOT_PAID',
  WAITING_PAID = 'WAITING_PAID',
  PAID = 'PAID',
  PARTIAL_PAID = 'PARTIAL_PAID',
}

export interface FulfillmentXLSReportParameters {
  /** Filter by concept UUID(s) */
  concepts?: string[];
  /** Filter by order UUID(s) */
  orders?: string[];
  /** Filter by school cycle UUID(s) */
  school_cycles?: string[];
  /** Filter by fulfillment status (e.g., NOT_PAID, WAITING_PAID, PAID, PARTIAL_PAID) */
  fulfillment_statuses?: FulfillmentStatusesEnum[];
  /** Filter by concept type (e.g., Colegiatura, Inscripción, Transporte, etc.) */
  concept_types?: ConceptTypesEnum[];
  /** Search text to filter results by a general search term */
  search?: string;
  /** Filter results within a specific date range. Expecting [start_date, end_date] */
  date_range?: string[];
  /** Additional configuration options for the report. For example, to include or exclude specific columns */
  config?: string[];
}

export enum GenderEnum {
  M = 'M',
  F = 'F',
}

export interface GenerateAuthLinkBadRequest {
  error: string;
}

export interface GenerateAuthLinkNotFound {
  error: string;
}

export interface GenerateAuthLinkRequest {
  /** @format email */
  email?: string | null;
  phone?: string | null;
}

export interface GenerateAuthLinkResponse {
  /** @format uri */
  auth_url: string;
}

export interface Guardian {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  billing_info?: BillingGuardianInfo;
  /** @default "" */
  relationship: string;
  has_student_custody: boolean;
}

export interface GuardianDebtRequest {
  /** Optional list of guardian IDs to filter. If not provided, returns all guardians in school. */
  guardian_ids?: string[];
}

export interface GuardianDebtResponse {
  /** @format uuid */
  guardian_id: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  total_debt: string;
  has_due_fulfillments: boolean;
}

export interface GuardianDependentFulfillment {
  /** @format uuid */
  id: string;
  /** @format uuid */
  order_id: string;
  payins: SlimPayinGuardianDependentFulfillment[];
  concept: SlimConceptGuardianDependentFulfillment;
  subscription: SlimSubscriptionGuardianDependentFulfillment;
  student: SlimStudentGuardianDependentFulfillment;
  /** Special Overcharges charged to the fulfillment */
  special_over_charges: SpecialOverCharge[];
  currency: string;
  /**
   * Original amount to be paid(before discounts and interests)
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  amount: string;
  /**
   * Original amount to be paid(before discounts and interests), it is the order price.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Final amount to be paid(after discounts and interests).
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  final_amount: string;
  /**
   * Current pending amount to be paid.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  pending_amount: string;
  /**
   * Total interest for fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  interest: string;
  /**
   * Total interest for fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total_overcharged: string;
  discount_breakdown: Record<string, any>;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  status: string;
  is_due: boolean;
  name: string;
  due: string;
  order_type: string;
  paid_fulfillments_required_proxy: string[];
  fulfillments_dependent_proxy: string[];
}

export interface GuardianDependentOrder {
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  student: SlimStudent;
  concept: ConceptSerializerStatic;
  /**
   * Original amount to be paid(before discounts and interests), belongs to order price amount.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  currency: string;
  /** Final amount to be paid(after discounts and interests). */
  final_amount: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  order_id: string;
  stock?: StockList;
  acquired: boolean;
  discount_breakdown: DiscountBreakdown;
}

export interface GuardianDependentPayin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Type of the payin */
  type: Type11EEnum | NullEnum | null;
  /** Method of the payin, include but to limited to: Visa, Mastercard, Kushki, oxxo. */
  method: string | null;
  /** Payment status for the payin. */
  status: Status91FEnum;
  /**
   * Total amount of the payin.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  total_currency: string;
  /** Orders that was paid in this payin. */
  orders: string;
  transaction: Transaction;
  /** Students for each fulfillment in this payin. */
  dependents: string;
  guardian: SlimGuardian;
  /**
   * The commission amount charged to the guardian.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  commission: string | null;
  /** Last day for pay if type of payment is ticket. */
  expiration: string;
  user_reports_as_paid: string;
  /**
   * File used as proof that the payment was done
   * @format uri
   */
  proof_of_payment: string | null;
}

export interface GuardianFacturamaValidateIds {
  guardian_ids: string[];
}

export interface GuardianFacturamaValidated {
  /** @format uuid */
  guardian_id: string;
  /** @default false */
  valid?: boolean;
  error?: Record<string, string>;
}

export interface GuardianListPayinSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Datetime when payment is executed, is diferent a datetime when payin was setted as successful.
   * @format date-time
   */
  paid_date?: string | null;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  /**
   * Total paid amount
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_paid: string;
  /** Number of fulfillments related to payin */
  count_paid_fulfillments: number;
  /** List of student with paid orders on this payin */
  students: CustomStudentPayinSerializerV2[];
}

export interface GuardianLogin {
  hash: string;
}

export interface GuardianLoginResponse {
  email: string;
  auth_token?: string;
}

export interface GuardianPayinSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Datetime when payment is executed, is diferent a datetime when payin was setted as successful.
   * @format date-time
   */
  paid_date: string | null;
  /** Guardian fullname */
  guardian_fullname: string;
  /** Payment method used to pay */
  payment_method: GuardianPayinSerializerV2PaymentMethodEnum;
  /** Source from where the payin was paid */
  collected_at: CollectedAtEnum;
  /**
   * Total paid amount
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_paid: string;
  payin_fulfillments: CustomPayinFulfillmentSerializerV2[];
}

export enum GuardianPayinSerializerV2PaymentMethodEnum {
  EnEfectivoTicketImpreso = 'En efectivo (Ticket impreso)',
  TransferenciaBancaria = 'Transferencia bancaria',
  EnATM = 'En ATM',
  TarjetaDeCredito = 'Tarjeta de crédito',
  TarjetaDeDebito = 'Tarjeta de débito',
  TarjetaPrepaga = 'Tarjeta prepaga',
  ChequeNominativo = 'Cheque nominativo',
  DepositoEnCheque = 'Depósito en cheque',
  DepositoEnEfectivo = 'Depósito en efectivo',
  Multipago = 'Multipago',
  Credito = 'Crédito',
  PagoDomiciliado = 'Pago Domiciliado',
  NominaEnEfectivo = 'Nomina en Efectivo',
  Compensacion = 'Compensación',
  DacionEnPago = 'Dación en pago',
}

export interface GuardianResponse {
  /** @format uuid */
  id: string;
  first_name: string;
  last_name: string;
  /** @format email */
  email: string;
  phone: string | null;
  block_cash_payments: boolean;
  dependents: Record<string, any>[];
  /** @format uuid */
  school_id: string;
}

export interface GuardianSignIn {
  /** First name of the person. */
  first_name: string;
  relative_portal_url: string;
  school_name: string;
  cellphone: string;
  country_code: string;
}

export interface GuardianStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  billing_guardian: BillingGuardian;
  /** Seccion */
  section_name: string;
  /** Workaround for self-onboarding process. Signals when student has concept generated. */
  is_ready: boolean;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  section?: string | null;
  guardians: Guardian[];
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school: string;
}

export interface GuardianStudentCreate {
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  section?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school: string;
}

export interface HTTP400BadRequest {
  error: string;
}

export interface HistoryChange {
  user: HistoryUser;
  id: string;
  timestamp: string;
  changed_fields: Record<string, HistoryFieldChange>;
  model_name: string;
  object_id: string;
  /** Type of change: created, changed, or deleted */
  history_type: HistoryTypeEnum;
}

export interface HistoryFieldChange {
  old: Record<string, any>;
  new: Record<string, any>;
}

export interface HistoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HistoryChange[];
}

export enum HistoryTypeEnum {
  Created = 'created',
  Changed = 'changed',
  Deleted = 'deleted',
}

export interface HistoryUser {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Inscription {
  school_cycle: string;
  status: string;
  section: string;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface InscriptionSection {
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  school_cycle: SchoolCycle;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  section: InternalSection;
  /**
   * Status of the inscription
   * @maxLength 150
   */
  status?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
}

export enum InscriptionStatusEnum {
  Inscrito = 'Inscrito',
  Reinscrito = 'Reinscrito',
  Pendiente = 'Pendiente',
  NoInscrito = 'No inscrito',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export interface InscriptionUpdate {
  /**
   * School Cycle of the inscription
   * @format uuid
   */
  school_cycle?: string | null;
  /**
   * Section of the inscription
   * @format uuid
   */
  section?: string | null;
  /**
   * Status of the inscription
   * @maxLength 150
   */
  status?: string | null;
}

export interface InterestSchema {
  compounding: CompoundingEnum;
  type: TypeF30Enum;
  /**
   * @format double
   * @min 0
   */
  value: number;
  /** @min -3 */
  day_offset: number;
  /** @min 0 */
  month_offset: number;
}

export interface InternalSchool {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the school.
   * @maxLength 350
   */
  name: string;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface InternalSection {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
  /**
   * Grade of the section.
   * @maxLength 100
   */
  grade: string;
  /**
   * Internal name for section inside a grade.
   * @maxLength 50
   */
  group?: string | null;
  level_name: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  level: string;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Invoice {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Id en el sistema del proveedor de facturación. */
  service_identifier: string | null;
  /** Id de la factura en el sistema fiscal(SAT). */
  fiscal_identifier: string | null;
  /** Código o número con el que identifica la factura el cliente. */
  client_identifier: string | null;
  billing_guardian: Guardian;
  /** Full name of the guardian */
  billing_guardian_fullname?: string;
  /** Indicated if is a paid invoice(PUE). */
  is_paid_invoice: boolean;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  status: StatusCf3Enum;
  /** Url of invoice in pdf format. */
  pdf_url: string;
  /** Url of invoice in XML format. */
  xml_url: string;
  /** Guardian tax_id (RFC) used to generate the invoice */
  tax_id?: string;
  /** Name of the entity that the invoice was generated for */
  billing_name?: string;
  /** Origin of the failure if the invoice was not generated successfully */
  fail_origin: string;
  type: TypeDb9Enum;
  /** ID de la factura desde la cual se genera la nota de credito */
  related_fiscal_identifier: string | null;
  /**
   * Datetime when the invoice was successfully emitted
   * @format date-time
   */
  expedition_date: string | null;
}

export enum InvoiceActionEnum {
  Cancel = 'cancel',
  EmitCreditNote = 'emit_credit_note',
  NoAction = 'no_action',
}

export interface InvoiceEnabledActions {
  cancel: boolean;
  reinvoice: boolean;
  reinvoice_with_relation: boolean;
  credit_note: boolean;
  cancel_credit_note: boolean;
  retry: boolean;
}

export interface InvoiceMassiveRetryRequestDTO {
  month?: MonthEnum;
  year?: number;
  /** @format uuid */
  fiscal_entity_id?: string | null;
  payin_id?: string | null;
  statuses?: StatusesEnum[];
  error_code?: string | null;
  fail_origin?: string | null;
  limit?: number | null;
}

export interface InvoiceRequestDTO {
  /**
   * @maxItems 250
   * @minItems 1
   */
  correlative_ids: string[];
  /** @default false */
  with_relation?: boolean;
  /** @default false */
  force_general_public?: boolean;
}

export interface InvoiceSendEmailRequestDTO {
  /** @format uuid */
  guardian_id: string;
}

export interface InvoiceSeries {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Identifier of the series
   * @maxLength 10
   */
  code: string;
}

export enum InvoiceStatusEnum {
  Pending = 'pending',
  Failed = 'failed',
  Success = 'success',
  Canceled = 'canceled',
  Canceling = 'canceling',
  NotRequested = 'not_requested',
  Multiple = 'multiple',
}

export interface InvoiceStudentGuardian {
  /** @format uuid */
  id: string;
  full_name: string;
  send_emails: boolean;
  /** @format email */
  email: string;
}

export interface InvoiceUrls {
  pdfs: string[];
  xmls: string[];
}

export enum JobTitleEnum {
  OWNER = 'OWNER',
  GENERAL_DIRECTOR = 'GENERAL_DIRECTOR',
  ADMINISTRATIVE_DIRECTOR = 'ADMINISTRATIVE_DIRECTOR',
  ACCOUNTANT = 'ACCOUNTANT',
  TREASURER = 'TREASURER',
  ADMISSIONS = 'ADMISSIONS',
  CASH_COLLECTION = 'CASH_COLLECTION',
  OTHER = 'OTHER',
}

export interface Level {
  /** @format uuid */
  id: string;
  name: string;
  type: string;
  order: number | null;
}

/** Serializer for creating school levels. */
export interface LevelCreate {
  /**
   * Name of the level.
   * @maxLength 350
   */
  name: string;
  /** Predefined level type. */
  type: LevelCreateTypeEnum;
  /**
   * Order of the Level respect the others
   * @min -32768
   * @max 32767
   */
  order?: number | null;
}

export enum LevelCreateTypeEnum {
  PRE_SCHOOL = 'PRE_SCHOOL',
  ELEMENTARY = 'ELEMENTARY',
  MIDDLE = 'MIDDLE',
  MIDDLEHIGH = 'MIDDLE-HIGH',
  HIGH = 'HIGH',
}

export interface ListConceptAutoAssignResponseDTO {
  id: string;
  name: string;
  is_all_assigned: boolean;
  grades: ConceptAutoAssignedGrade[];
}

export interface ListDashboardInvoiceResponseDTO {
  id: string;
  client_identifier: string;
  billing_guardian_name: string;
  billing_tax_id: string;
  status: StatusCf3Enum;
  order_id: string;
  order_name: string;
  payment_amount: string;
  pdf_url: string;
  guardian_name: string;
  invoice_type: string;
  fiscal_identifier: string;
  expedition_date: string;
  student_name: string;
  student_state: string;
  related_invoice: RelatedInvoice;
}

export interface ListGuardianFiltersMetadataDTO {
  filters: FilterFieldMetadata[];
}

export interface ListGuardianResponseDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  onboarding_stage: string;
  student: Record<string, any>;
}

export interface ListSubscriptionResponseDTO {
  /** @format uuid */
  id: string;
  student: SubscriptionStudentDTO;
  /** @format date */
  start_date: string;
  /** @format date */
  end_date: string;
  payday: number;
  metadata: Record<string, any>;
  concept: string;
  /** @format date */
  next_payment_date: string;
}

export interface MassiveConceptAssignmentHistory {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
  /** Status for Massive Concept Assignment */
  status?: Status386Enum;
  /**
   * @min 0
   * @max 2147483647
   */
  student_quantity?: number | null;
  /**
   * @min 0
   * @max 2147483647
   */
  student_processed?: number | null;
  /**
   * @min 0
   * @max 2147483647
   */
  student_processed_ok?: number | null;
  is_concept_optional: boolean;
}

export interface MassiveConceptDissasignment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Status for Massive Concept Dissasignment */
  status?: MassiveConceptDissasignmentStatusEnum;
  /**
   * @min 0
   * @max 2147483647
   */
  student_quantity?: number | null;
  /**
   * @min 0
   * @max 2147483647
   */
  student_processed?: number | null;
  /**
   * Error for Massive Concept Dissasignment
   * @maxLength 256
   */
  error?: string;
}

export enum MassiveConceptDissasignmentStatusEnum {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
  FINISHED_WITH_ERROR = 'FINISHED_WITH_ERROR',
}

export interface MassiveConceptDissasignmentsDissasign {
  concept_id: string;
  keep_debt: boolean;
  delete_all: boolean;
  students_ids: string[];
}

export interface MassiveScholarshipAssignmentCreateRequest {
  /** List of student Ids */
  student_ids: string[];
  /** List of school cycle Ids */
  school_cycle_ids: string[];
  scholarship_id: string;
}

export interface MassiveScholarshipAssignmentCreateResponse {
  id: string;
  status: string;
  assigned_students: number;
  total_students: number;
}

export interface MassiveScholarshipAssignmentRetrieveResponse {
  id: string;
  status: string;
  assigned_students: number;
  total_students: number;
}

export interface Membership {
  can_add_payment?: boolean;
  can_add_discount?: boolean;
  can_assign_scholarship?: boolean;
  can_deassign_scholarship?: boolean;
  can_assign_guardian?: boolean;
  can_deassign_guardian?: boolean;
  can_edit_guardian?: boolean;
  can_add_concept_assignment?: boolean;
  can_edit_concept_assignment?: boolean;
  can_delete_concept_assignment?: boolean;
  can_add_student?: boolean;
  can_edit_student?: boolean;
  can_send_whatsapp?: boolean;
  can_assign_billing_guardian?: boolean;
  can_view_student_status?: boolean;
  can_add_concept?: boolean;
  can_edit_stock?: boolean;
  can_view_collections_page?: boolean;
  can_view_received_payment_page?: boolean;
  can_view_delinquency_page?: boolean;
  can_view_concepts_page?: boolean;
  can_view_admissions_page?: boolean;
  can_view_income_stats_cards?: boolean;
  can_view_registered_payments_table?: boolean;
  can_view_payouts_table?: boolean;
  can_view_income_page?: boolean;
  can_view_student_total_debt?: boolean;
  can_view_scholarships_and_discounts?: boolean;
  can_delete_manual_payment?: boolean;
  can_perform_invoicing?: boolean;
  can_create_refund?: boolean;
  can_view_inscriptions_page?: boolean;
  can_view_inscriptions_quotas_page?: boolean;
  can_view_account_state_section?: boolean;
}

export interface MembershipCreate {
  /** @default true */
  can_add_payment?: boolean;
  /** @default true */
  can_add_discount?: boolean;
  /** @default true */
  can_assign_scholarship?: boolean;
  /** @default true */
  can_deassign_scholarship?: boolean;
  /** @default true */
  can_assign_guardian?: boolean;
  /** @default true */
  can_deassign_guardian?: boolean;
  /** @default true */
  can_edit_guardian?: boolean;
  /** @default true */
  can_add_concept_assignment?: boolean;
  /** @default true */
  can_edit_concept_assignment?: boolean;
  /** @default true */
  can_delete_concept_assignment?: boolean;
  /** @default true */
  can_add_student?: boolean;
  /** @default true */
  can_edit_student?: boolean;
  /** @default true */
  can_send_whatsapp?: boolean;
  /** @default true */
  can_assign_billing_guardian?: boolean;
  /** @default true */
  can_view_student_status?: boolean;
  /** @default true */
  can_add_concept?: boolean;
  /** @default true */
  can_edit_stock?: boolean;
  /** @default true */
  can_view_collections_page?: boolean;
  /** @default true */
  can_view_received_payment_page?: boolean;
  /** @default true */
  can_view_delinquency_page?: boolean;
  /** @default true */
  can_view_concepts_page?: boolean;
  /** @default true */
  can_view_admissions_page?: boolean;
  /** @default true */
  can_view_income_stats_cards?: boolean;
  /** @default true */
  can_view_registered_payments_table?: boolean;
  /** @default true */
  can_view_payouts_table?: boolean;
  /** @default true */
  can_view_income_page?: boolean;
  /** @default true */
  can_view_student_total_debt?: boolean;
  /** @default true */
  can_view_scholarships_and_discounts?: boolean;
  /** @default true */
  can_delete_manual_payment?: boolean;
  /** @default false */
  can_perform_invoicing?: boolean;
  /** @default false */
  can_create_refund?: boolean;
  /** @default true */
  can_view_inscriptions_page?: boolean;
  /** @default true */
  can_view_inscriptions_quotas_page?: boolean;
  /** @default true */
  can_view_account_state_section?: boolean;
  /**
   * UUID of the school
   * @format uuid
   */
  school_id: string;
  /**
   * UUID of the user
   * @format uuid
   */
  user_id: string;
  /**
   * Job title/role for the membership
   * @default "OWNER"
   */
  job_title?: JobTitleEnum;
}

export interface MembershipPermissionsResponseDTO {
  can_add_payment?: boolean;
  can_add_discount?: boolean;
  can_assign_scholarship?: boolean;
  can_deassign_scholarship?: boolean;
  can_assign_guardian?: boolean;
  can_deassign_guardian?: boolean;
  can_edit_guardian?: boolean;
  can_add_concept_assignment?: boolean;
  can_edit_concept_assignment?: boolean;
  can_delete_concept_assignment?: boolean;
  can_add_student?: boolean;
  can_edit_student?: boolean;
  can_send_whatsapp?: boolean;
  can_assign_billing_guardian?: boolean;
  can_view_student_status?: boolean;
  can_add_concept?: boolean;
  can_edit_stock?: boolean;
  can_view_collections_page?: boolean;
  can_view_received_payment_page?: boolean;
  can_view_delinquency_page?: boolean;
  can_view_concepts_page?: boolean;
  can_view_admissions_page?: boolean;
  can_view_income_stats_cards?: boolean;
  can_view_registered_payments_table?: boolean;
  can_view_payouts_table?: boolean;
  can_view_income_page?: boolean;
  can_view_student_total_debt?: boolean;
  can_view_scholarships_and_discounts?: boolean;
  can_delete_manual_payment?: boolean;
  can_perform_invoicing?: boolean;
  can_create_refund?: boolean;
  can_view_inscriptions_page?: boolean;
  can_view_inscriptions_quotas_page?: boolean;
  can_view_account_state_section?: boolean;
  /** @format uuid */
  id: string;
  job_title: string;
}

export interface MembershipRequestDto {
  can_add_payment: boolean;
  can_add_discount: boolean;
  can_assign_scholarship: boolean;
  can_deassign_scholarship: boolean;
  can_assign_guardian: boolean;
  can_deassign_guardian: boolean;
  can_edit_guardian: boolean;
  can_add_concept_assignment: boolean;
  can_edit_concept_assignment: boolean;
  can_delete_concept_assignment: boolean;
  can_add_student: boolean;
  can_edit_student: boolean;
  can_send_whatsapp: boolean;
  can_assign_billing_guardian: boolean;
  can_view_student_status: boolean;
  can_add_concept: boolean;
  can_edit_stock: boolean;
  can_view_collections_page: boolean;
  can_view_received_payment_page: boolean;
  can_view_delinquency_page: boolean;
  can_view_concepts_page: boolean;
  can_view_admissions_page: boolean;
  can_view_income_stats_cards: boolean;
  can_view_registered_payments_table: boolean;
  can_view_payouts_table: boolean;
  can_view_income_page: boolean;
  can_view_student_total_debt: boolean;
  can_view_scholarships_and_discounts: boolean;
  can_delete_manual_payment: boolean;
  can_perform_invoicing: boolean;
  can_create_refund: boolean;
  can_view_account_state_section: boolean;
  can_view_inscriptions_page: boolean;
  can_view_inscriptions_quotas_page: boolean;
}

export interface MembershipResponseDto {
  can_add_payment: boolean;
  can_add_discount: boolean;
  can_assign_scholarship: boolean;
  can_deassign_scholarship: boolean;
  can_assign_guardian: boolean;
  can_deassign_guardian: boolean;
  can_edit_guardian: boolean;
  can_add_concept_assignment: boolean;
  can_edit_concept_assignment: boolean;
  can_delete_concept_assignment: boolean;
  can_add_student: boolean;
  can_edit_student: boolean;
  can_send_whatsapp: boolean;
  can_assign_billing_guardian: boolean;
  can_view_student_status: boolean;
  can_add_concept: boolean;
  can_edit_stock: boolean;
  can_view_collections_page: boolean;
  can_view_received_payment_page: boolean;
  can_view_delinquency_page: boolean;
  can_view_concepts_page: boolean;
  can_view_admissions_page: boolean;
  can_view_income_stats_cards: boolean;
  can_view_registered_payments_table: boolean;
  can_view_payouts_table: boolean;
  can_view_income_page: boolean;
  can_view_student_total_debt: boolean;
  can_view_scholarships_and_discounts: boolean;
  can_delete_manual_payment: boolean;
  can_perform_invoicing: boolean;
  can_create_refund: boolean;
  can_view_account_state_section: boolean;
  can_view_inscriptions_page: boolean;
  can_view_inscriptions_quotas_page: boolean;
  /** @format uuid */
  id: string;
  job_title: string;
}

export enum MethodEnum {
  MAIL = 'MAIL',
  WHATSAPP = 'WHATSAPP',
}

export enum ModeEnum {
  Independent = 'independent',
  Sequential = 'sequential',
}

export enum MonthEnum {
  Value1 = '1',
  Value2 = '2',
  Value3 = '3',
  Value4 = '4',
  Value5 = '5',
  Value6 = '6',
  Value7 = '7',
  Value8 = '8',
  Value9 = '9',
  Value10 = '10',
  Value11 = '11',
  Value12 = '12',
}

export enum MonthsToPayEnum {
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
  Value7 = 7,
  Value8 = 8,
  Value9 = 9,
  Value10 = 10,
  Value11 = 11,
  Value12 = 12,
}

export interface NotFound {
  error: string;
}

export type NullEnum = null;

export enum OfferingEnum {
  SCHOLAR = 'SCHOLAR',
  OPEN_LOOP = 'OPEN_LOOP',
  MIX = 'MIX',
}

export interface OnTimeStudentsStatistics {
  value: number;
  /** @format double */
  percentage: number;
}

export enum OnboardingStageEnum {
  PROFILE = 'PROFILE',
  BILLING = 'BILLING',
  CFDI = 'CFDI',
  STUDENTS = 'STUDENTS',
  COMPLETED = 'COMPLETED',
}

export interface OptionalConceptOrders {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  /** Number of units saled */
  sold_units: string;
  /** Number of fulfillments in WAITING_PAID status */
  in_payment_process: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  stock?: StockList;
}

export interface OptionalOrder {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  concept: ConceptSerializerStatic;
  /**
   * Original amount to be paid(before discounts and interests), belongs to order price amount.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  currency: string;
  /** Final amount to be paid(after discounts and interests). */
  final_amount: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  order_id: string;
  stock?: StockList;
  discount_breakdown: DiscountBreakdown;
  acquired: boolean;
}

export interface OptionalOrderResponseDTO {
  /** @format uuid */
  order_id: string;
  order_name: string;
  /** @format uuid */
  student_id: string;
  student_name: string;
  /** @format uuid */
  school_id: string;
  school_name: string;
  concept_name: string;
  /** @format uuid */
  concept_id: string;
  is_optional: boolean;
  offering: string;
  /** @format date */
  due: string;
  /** @format double */
  price: number;
  currency: string;
  /** @format uuid */
  guardian_id: string;
  guardian_name: string;
  /** Available stock (null = unlimited) */
  stock?: number | null;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Order {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  concept_name: string;
  attributes: Attributes[];
}

export interface OrderCreate {
  name?: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
}

export interface OrderFilter {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  concept: string;
}

export interface OrderImporter {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  concept: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
}

export interface OrderStock {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
  stock?: Stock;
  concept_name?: string;
  attributes?: Attributes[];
}

export interface OrderStockValidate {
  data: OrderStockValidateItem[];
}

export interface OrderStockValidateItem {
  /** @format uuid */
  order_id: string;
  quantity: number;
}

export interface OrderStockValidateResponse {
  /** @format uuid */
  order_id: string;
  has_stock: boolean;
}

export interface OrderWithAttributes {
  /**
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  order_price: string;
  attributes: AttributeCreate[];
}

export interface OrganizationCreate {
  /** Name of the organization */
  name: string;
}

export interface OrganizationResponse {
  /** @format uuid */
  id: string;
  name: string;
}

export interface OrganizationUpdate {
  /** Name of the organization */
  name: string;
}

export enum OtherEnum {
  G01 = 'G01',
  G02 = 'G02',
  G03 = 'G03',
  I01 = 'I01',
  I02 = 'I02',
  I03 = 'I03',
  I04 = 'I04',
  I05 = 'I05',
  I06 = 'I06',
  I07 = 'I07',
  I08 = 'I08',
  D01 = 'D01',
  D02 = 'D02',
  D03 = 'D03',
  D04 = 'D04',
  D05 = 'D05',
  D06 = 'D06',
  D07 = 'D07',
  D08 = 'D08',
  D09 = 'D09',
  D10 = 'D10',
  CP01 = 'CP01',
  CN01 = 'CN01',
  S01 = 'S01',
}

export interface PaginatedAdjustmentRuleList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: AdjustmentRule[];
}

export interface PaginatedAllowedBlockPeriodResponseList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: AllowedBlockPeriodResponse[];
}

export interface PaginatedAttributesList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: Attributes[];
}

export interface PaginatedBankAccountHistoryList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: BankAccountHistory[];
}

export interface PaginatedBaseAdminList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: BaseAdmin[];
}

export interface PaginatedConceptStudentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: ConceptStudent[];
}

export interface PaginatedConfigurationHistoryList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: ConfigurationHistory[];
}

export interface PaginatedDashboardDependentFulfillmentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardDependentFulfillment[];
}

export interface PaginatedDashboardDependentOrderList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardDependentOrder[];
}

export interface PaginatedDashboardFulfillmentListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardFulfillmentList[];
}

export interface PaginatedDashboardFulfillmentListSerializerV2List {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardFulfillmentListSerializerV2[];
  total_amount?: {
    /**
     * @format double
     * @default "0.00"
     * @example "9287.00"
     */
    string_value: string;
    /**
     * @default 0
     * @example 123
     */
    int_value: number;
    /**
     * @default 2
     * @example 2
     */
    coefficient: number;
  };
}

export interface PaginatedDashboardPayinFulfillmentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardPayinFulfillment[];
  /**
   * @format double
   * @default "0.00"
   * @example "9287.00"
   */
  total_amount?: string | null;
}

export interface PaginatedDashboardRootConceptList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardRootConcept[];
}

export interface PaginatedDashboardSchoolPayoutsList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardSchoolPayouts[];
  /**
   * @format double
   * @example "9287.00"
   */
  total_received_amount: string | null;
  /**
   * @format double
   * @example "9287.00"
   */
  total_emitted_amount: string | null;
}

export interface PaginatedDashboardStudentDelinquencyList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardStudentDelinquency[];
}

export interface PaginatedDashboardStudentDelinquencySummaryList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardStudentDelinquencySummary[];
}

export interface PaginatedDashboardStudentListDueOrderSerializerV4List {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardStudentListDueOrderSerializerV4[];
}

export interface PaginatedDashboardStudentListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardStudentList[];
}

export interface PaginatedDashboardStudentSearchList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DashboardStudentSearch[];
}

export interface PaginatedDelinquencyStatsHistoricList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DelinquencyStatsHistoric[];
}

export interface PaginatedDelinquencyStudentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: DelinquencyStudent[];
}

export interface PaginatedGuardianDependentFulfillmentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: GuardianDependentFulfillment[];
}

export interface PaginatedGuardianDependentOrderList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: GuardianDependentOrder[];
}

export interface PaginatedGuardianListPayinSerializerV2List {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: GuardianListPayinSerializerV2[];
}

export interface PaginatedHistoryListResponseList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: HistoryListResponse[];
}

export interface PaginatedInscriptionList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: Inscription[];
}

export interface PaginatedInvoiceSeriesList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: InvoiceSeries[];
}

export interface PaginatedListDashboardInvoiceResponseDTOList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: ListDashboardInvoiceResponseDTO[];
}

export interface PaginatedMassiveConceptAssignmentHistoryList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: MassiveConceptAssignmentHistory[];
}

export interface PaginatedOptionalOrderList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: OptionalOrder[];
}

export interface PaginatedOrderList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: Order[];
}

export interface PaginatedPayinListResponseDTOList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: PayinListResponseDTO[];
  /**
   * @format double
   * @default "0.00"
   * @example "9287.00"
   */
  total_amount?: string | null;
}

export interface PaginatedScholarshipExpiredList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: ScholarshipExpired[];
}

export interface PaginatedScholarshipList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: Scholarship[];
}

export interface PaginatedScholarshipListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: ScholarshipList[];
}

export interface PaginatedSchoolBlockedPeriodResponseList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: SchoolBlockedPeriodResponse[];
}

export interface PaginatedSectionList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: Section[];
}

export interface PaginatedSlimBankAccountList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: SlimBankAccount[];
}

export interface PaginatedSlimGuardianList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: SlimGuardian[];
}

export interface PaginatedSlimStudentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: SlimStudent[];
  /** @example 2 */
  delinquent_students: number | null;
  /**
   * @format double
   * @example 0.5
   */
  payment_compliance_percentage: number | null;
}

export interface PaginatedSlimStudentSerializerV2List {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: SlimStudentSerializerV2[];
  /** @example 2 */
  delinquent_students: number | null;
  /**
   * @format double
   * @example 0.5
   */
  payment_compliance_percentage: number | null;
}

export interface PaginatedStockListHistoryList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: StockListHistory[];
}

export interface PaginatedStudentByLevelList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: StudentByLevel[];
}

export interface PaginatedStudentByLevelSerializerV2List {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: StudentByLevelSerializerV2[];
}

export interface PaginatedStudentsScholarshipList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results?: StudentsScholarship[];
}

export interface PaidReminderRequest {
  school_id: string;
  start_date: string;
  end_date: string;
  concept_type: string;
  level_type: string;
}

export enum PartialPaymentInterestTypeEnum {
  Total = 'total',
  Partial = 'partial',
  NoAply = 'no_aply',
}

/** Serializer for AdjustmentRule CRUD operations */
export interface PatchedAdjustmentRule {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school?: string;
  /** Type of adjustment */
  rule_type?: RuleTypeEnum;
  /**
   * Application order (1-N, only relevant in sequential mode)
   * @min -2147483648
   * @max 2147483647
   */
  order?: number;
  /** Whether the rule is active */
  is_active?: boolean;
  /** Specific config (e.g.: {"is_accumulative": true} for scholarships) */
  config?: Record<string, any>;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created?: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified?: string;
}

export interface PatchedAssignBillings {
  students?: AssignBilling[];
}

export interface PatchedAttributes {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /** @maxLength 255 */
  name?: string;
  /** @maxLength 100 */
  type?: string;
}

export interface PatchedAvoidScholarship {
  scholarship_id?: string;
  action?: string;
}

export interface PatchedBookKeeperUpdateConceptRequest {
  name?: string;
  type?: string;
  school_cycle_id?: string;
  is_billable?: boolean;
  bank_account_id?: string;
  payment_only_in_dashboard?: boolean;
  early_bird_discounts?: EarlyBirdDiscountSchema[];
  interest_schema?: InterestSchema[];
  /** @maxLength 30 */
  tax_code?: string;
  /** @maxLength 30 */
  tax_unit?: string;
  has_sales_tax?: boolean;
  use_education_complement?: boolean;
  /** @maxLength 32 */
  institutional_id?: string;
  offering?: OfferingEnum;
  does_invoice_as_general_public?: boolean;
  not_invoicing_bank_account_id?: string;
}

export interface PatchedChangeLimitRequest {
  is_limited?: boolean;
  observations?: string;
}

export interface PatchedChangeOrderPricesRequest {
  /** List of order UUIDs */
  orders?: string[];
  /**
   * New price for the orders
   * @format double
   */
  price?: number;
}

export interface PatchedDashboardGuardianSendOutboundResponseDTO {
  success?: string;
  error?: string;
}

export interface PatchedDashboardGuardianSlim {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name?: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Activate or deactive send emails to guardian. */
  send_emails?: boolean;
  /** Activate or deactive send whatsapps to guardian. */
  send_whatsapps?: boolean;
  billing_info?: BillingGuardianInfo;
  /** @maxLength 255 */
  occupation?: string | null;
  /** @maxLength 255 */
  workplace?: string | null;
  /** @maxLength 255 */
  workphone?: string | null;
  /** @default "" */
  relationship?: string;
  has_student_custody?: boolean;
  /** @format uuid */
  school_id?: string;
}

export interface PatchedDashboardSchoolUpdate {
  /**
   * Name of the school.
   * @maxLength 350
   */
  name?: string;
  /**
   * Logo of the school.
   * @format uri
   */
  logo?: string | null;
  /**
   * Email contact of the school
   * @format email
   * @maxLength 254
   */
  email?: string;
  phone?: string;
  can_invoice_to_general_public?: boolean;
  /** @format time */
  emit_invoice_time?: string | null;
  enable_manual_pay_invoice?: boolean;
  /** Defines if scholarship discount is applied over the previous scholarship discount */
  scholarship_is_accumulative?: boolean;
  /** Determines which config is used for due orders and scholarships. */
  scholarship_lost_config?: ScholarshipLostConfigEnum;
  /** Configuration for scholarship settings */
  scholarship_config?: Record<string, any>;
  /** Enable discount breakdown in invoices */
  invoice_discount_breakdown?: boolean;
  /** Define if interest rate is frozen after first partial payment */
  partial_payment_interest_freeze?: boolean;
  /** Indicated amount over witch amount must be apply interests. */
  partial_payment_interest_type?: PartialPaymentInterestTypeEnum;
  /** Indicates if school uses our invoicing services. */
  does_invoice?: boolean;
  /** Default cfdi config for invoice. */
  cfdi_use_config?: Record<string, any>;
  /** Default cfdi config for discounts */
  discounts_config?: Record<string, any>;
}

export interface PatchedDashboardStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name?: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  section?: string | null;
  /**
   * Date when student join school.
   * @format date
   */
  entry_date?: string | null;
  /**
   * Guardian used for billing.
   * @format uuid
   */
  billing_guardian?: string | null;
  guardians?: Guardian[];
  billing_guardian_info?: BillingGuardianInfo;
  /** True when the student is currently active. */
  is_active?: boolean;
  state?: StateEnum;
  school_cycle_id?: string | null;
  /** @format date */
  credential_expiration_date?: string | null;
}

export interface PatchedDetailAdmin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 250 */
  job_title?: string;
  membership_name?: string;
  permission_set?: Membership;
  dashboard_joyride?: DashboardJoyride;
}

export interface PatchedDetailConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name?: string;
  type?: string;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price?: string;
  /** Indicates if concept have IVA. */
  has_sales_tax?: boolean;
  /**
   * Fiscal product code for billing purposes.
   * @maxLength 30
   */
  tax_code?: string | null;
  /**
   * Fiscal unit code for billing purposes.
   * @maxLength 30
   */
  tax_unit?: string | null;
  entity?: FiscalEntity;
  /** Months when concept must be paid(for generate orders). */
  months_to_pay?: MonthsToPayEnum[];
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  early_bird_discounts?: EarlyBirdDiscount[];
  interest_schema?: InterestSchema[];
  /** Indicates if concept only can be paid on dashboard. */
  payment_only_in_dashboard?: boolean;
  bank_account?: DetailBankAccount;
  /**
   * Institutional identifier to send when use_education_complement is activated(aut_rvoe).
   * @maxLength 32
   */
  institutional_id?: string | null;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable?: boolean;
  orders?: Order[];
  optional?: boolean;
  subscription?: boolean;
  school_cycle?: SchoolCycle;
  /** Indicates if concept must be use educational complement on billing. */
  use_education_complement?: boolean;
  can_be_deleted?: boolean;
  payout_config?: PayoutConfig | null;
  auto_assigned_concepts?: ConceptAutoAssignedLevel[];
  series?: string;
  root_concept_id?: string;
  /** Offering of the concept */
  offering?: OfferingEnum;
  does_invoice_as_general_public?: boolean;
}

export interface PatchedEditFulfillmentBase {
  comment?: string;
  base?: string;
}

export interface PatchedEditFulfillmentDue {
  comment?: string;
  due?: string;
}

export interface PatchedForceScholarship {
  scholarship_id?: string;
  action?: string;
}

export interface PatchedGuardianStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  billing_guardian?: BillingGuardian;
  /** Seccion */
  section_name?: string;
  /** Workaround for self-onboarding process. Signals when student has concept generated. */
  is_ready?: boolean;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name?: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * National identifier of the student provided by the school.
   * @maxLength 20
   */
  identifier?: string | null;
  /**
   * Birthdate of the person.
   * @format date
   */
  birthdate?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  section?: string | null;
  guardians?: Guardian[];
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school?: string;
}

export interface PatchedMassiveConceptAssignmentHistory {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created?: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified?: string;
  /** Status for Massive Concept Assignment */
  status?: Status386Enum;
  /**
   * @min 0
   * @max 2147483647
   */
  student_quantity?: number | null;
  /**
   * @min 0
   * @max 2147483647
   */
  student_processed?: number | null;
  /**
   * @min 0
   * @max 2147483647
   */
  student_processed_ok?: number | null;
  is_concept_optional?: boolean;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface PatchedOrder {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name?: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price?: string;
  concept_name?: string;
  attributes?: Attributes[];
}

export interface PatchedPatchMembershipPermissionsRequestDTO {
  can_add_payment?: boolean;
  can_add_discount?: boolean;
  can_assign_scholarship?: boolean;
  can_deassign_scholarship?: boolean;
  can_assign_guardian?: boolean;
  can_deassign_guardian?: boolean;
  can_edit_guardian?: boolean;
  can_add_concept_assignment?: boolean;
  can_edit_concept_assignment?: boolean;
  can_delete_concept_assignment?: boolean;
  can_add_student?: boolean;
  can_edit_student?: boolean;
  can_send_whatsapp?: boolean;
  can_assign_billing_guardian?: boolean;
  can_view_student_status?: boolean;
  can_add_concept?: boolean;
  can_edit_stock?: boolean;
  can_view_collections_page?: boolean;
  can_view_received_payment_page?: boolean;
  can_view_delinquency_page?: boolean;
  can_view_concepts_page?: boolean;
  can_view_admissions_page?: boolean;
  can_view_income_stats_cards?: boolean;
  can_view_registered_payments_table?: boolean;
  can_view_payouts_table?: boolean;
  can_view_income_page?: boolean;
  can_view_student_total_debt?: boolean;
  can_view_scholarships_and_discounts?: boolean;
  can_delete_manual_payment?: boolean;
  can_perform_invoicing?: boolean;
  can_create_refund?: boolean;
  can_view_inscriptions_page?: boolean;
  can_view_inscriptions_quotas_page?: boolean;
  can_view_account_state_section?: boolean;
}

export interface PatchedRetrieveGuardian {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  hash?: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name?: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Landline number for guardian.
   * @maxLength 128
   */
  landline?: string | null;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  schools?: School[];
  dependents?: BillingStudent[];
  /** Current onboarding stage for guardian. */
  onboarding_stage?: OnboardingStageEnum;
  /** Fiscal regime config for billing. */
  taxing_system?: TaxingSystemEnum | BlankEnum | NullEnum | null;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  /** Schema of cfdi uses depending of concept type for billing. */
  cfdi_config?: Record<string, any>;
  /** TODO */
  tour_completed?: Record<string, any>;
  /**
   * External identifier for integration with clients.
   * @maxLength 24
   */
  external_id?: string | null;
  cfdi_config_detail?: {
    MONTHLY_FEE?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    INSCRIPTION?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    PRE_DEBT?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    TRANSPORT?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    OTHER?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
  };
  /** Type of fiscal regime for billing. */
  taxing_type?: TaxingTypeEnum | BlankEnum | NullEnum | null;
  has_payins?: string;
  fraud_status?: FraudStatusEnum | NullEnum | null;
  /** Block cash payment method for this guardian. */
  block_cash_payments?: boolean;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface PatchedSection {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  name?: string;
}

export interface PatchedSlimBankAccount {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /** Type of the bank account, CLABE_ACCOUNT type only for Kushki tests. */
  account_type?: AccountTypeEnum;
  /**
   * Name of the owner of the bank account.
   * @maxLength 255
   */
  owner?: string;
  /**
   * Friendly name for bank account.
   * @maxLength 55
   */
  nickname?: string;
  /**
   * Name of the banck.
   * @maxLength 75
   */
  bank_name?: string;
  public_summary?: string;
  /** @maxLength 55 */
  account_number?: string;
  archived?: boolean;
}

export interface PatchedStudentAssignmentDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  student_id?: string;
  /** @format date */
  start_date?: string | null;
  /** @format date */
  end_date?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  concept?: string;
  scholarships?: Scholarship[];
  orders_to_skip?: string[];
}

export interface PatchedStudentScholarshipCreate {
  /** @format uuid */
  scholarship_id?: string;
  orders_to_skip?: string[];
  /** @format uuid */
  school_cycle_id?: string;
  /** @default true */
  is_active?: boolean;
  /** @format uuid */
  student_id?: string;
  /** @format uuid */
  school_id?: string;
  date_ranges?: StudentScholarshipDateRange[];
}

export interface PatchedUpdateGuardian {
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name?: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Landline number for guardian.
   * @maxLength 128
   */
  landline?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  /** Fiscal regime config for billing. */
  taxing_system?: TaxingSystemEnum | BlankEnum | NullEnum | null;
  cfdi_config?: CFDIUser;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  onboarding_stage?: OnboardingStageEnum;
  billable_dependents?: string[];
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  terms_acceptance?: Record<string, any>;
  /** TODO */
  tour_completed?: Record<string, any>;
  taxing_type?: TaxingTypeEnum | NullEnum | null;
}

export interface PatchedUpdateGuardianDTO {
  occupation?: string | null;
  workplace?: string | null;
  workphone?: string | null;
}

export interface PatchedUpdateGuardianRequest {
  block_cash_payments?: boolean;
}

export interface PatchedUpdateQuantityRequest {
  action?: UpdateQuantityRequestActionEnum;
  quantity?: number;
  observations?: string;
}

export interface PatchedUser {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  /**
   * Email address
   * Email address of the user.
   * @format email
   */
  email?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Staff status
   * Designates whether the user can log into this admin site.
   */
  is_staff?: boolean;
  name?: string;
  /** @format date-time */
  date_joined?: string;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Payin {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Payment status for the payin. */
  status: Status91FEnum;
  /** Type of the payin */
  type: Type11EEnum | NullEnum | null;
  /** Method of the payin, include but to limited to: Visa, Mastercard, Kushki, oxxo. */
  method: string | null;
  guardian: SlimGuardian;
  /** Fullname of guardian who made the payment. */
  guardian_fullname?: string;
  /**
   * Total amount of the payin.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  transaction: Transaction;
  total_currency: string;
  /** Indicates if payin fulfillment was partially paid. */
  is_partial: boolean;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
  /**
   * Datetime when payment is executed, is diferent a datetime when payin was setted as successful.
   * @format date-time
   */
  paid_date: string | null;
  /**
   * Total paid amount
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_paid: string;
  /** Fullname of user who creates the object. */
  created_by_fullname?: string;
  /** Place where payin in collected. */
  collected_at: string;
  invoices: Invoice[];
  payout: DashboardPayout | null;
  payin_fullfillments: string;
}

export interface PayinAssignTransactionRequestDTO {
  /** @format uuid */
  payin_id: string;
  /** @minLength 16 */
  ticket_number: string;
  /** @format uuid */
  payout_id?: string;
}

export interface PayinCancelRequestDTO {
  /** @format uuid */
  payin_id: string;
}

export interface PayinFulfillmentDetail {
  id: number;
  is_partial: boolean;
  /**
   * Total paid amount for payin fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  total_paid: string;
  order: string;
  /** Payin id for payin fulfillment. */
  payin: string;
  /** Fulfillment id for payin fulfillment. */
  fulfillment: string;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  invoice: Invoice;
  invoices: Invoice[];
  paid_date: string;
  refund: RetrieveRefundDashboardDTO;
}

export interface PayinFulfillmentListResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: any[];
}

export interface PayinInvoice {
  /** @format uuid */
  id: string;
  correlative_id: string;
  /** @format uuid */
  guardian_id: string;
  guardian_name: string;
}

export interface PayinListResponseDTO {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  type: Type11EEnum;
  total_currency: string;
  invoices_pdfs: string[];
  /** Indicates if payment was received in school. */
  collected_at_school: boolean;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  created_by: User;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Schema that contains relevant information added at momment of registering a payment(comment, bank_name, reference, etc). */
  manual_payment_metadata: Record<string, any>;
  /**
   * Total amount of the payin.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  guardian: SlimGuardian;
  /** @format date-time */
  paid_date: string;
  fulfillments: any[];
  generate_invoice: boolean;
  manual_payment_account: SlimBankAccount;
  /** @maxLength 150 */
  comment?: string | null;
  show_comment?: boolean | null;
  transaction_reference?: string | null;
  sender_account_number?: string | null;
  card_last_digits?: string | null;
  bank_name?: string | null;
  is_partial: boolean;
  optional_orders: ValidateOptionalOrderStudent[];
}

export interface PayinProofOfPaymentRequest {
  /**
   * File used as proof that the payment was done
   * @format uri
   */
  proof_of_payment: string;
}

export interface PayinRedirectItemDTO {
  /** @format uuid */
  student_id: string;
  /** @format uuid */
  order_id: string;
}

export interface PayinRedirectRequestDTO {
  /** @format uuid */
  payin_id: string;
  /** List of items to redirect payment to. ORDER IS IMPORTANT: items will be paid in the order provided. Optional concepts must be fully paid and cannot be partial. */
  items: PayinRedirectItemDTO[];
}

export interface PayinRegenerateTicketRequestDTO {
  /** @format uuid */
  payin_id: string;
}

export interface PayinSyncRequestDTO {
  ticket_number: string;
  /** @format uuid */
  school_id: string;
  /** @format date-time */
  start_from: string;
}

export interface PaymentBlockedRequest {
  /** @format uuid */
  payment_id: string;
  /** @default "" */
  trace_id?: string;
  /** @default "" */
  span_id?: string;
}

export interface PaymentItem {
  /** @format uuid */
  student?: string;
  /** @format uuid */
  order: string;
}

export interface PaymentReminderRequest {
  school_id: string;
  start_date: string;
  end_date: string;
  concept_type: string;
  level_type: string;
}

export interface PaymentRequest {
  /** @format uuid */
  guardian: string;
  items: PaymentItem[];
  preference_type: PreferenceTypeEnum;
  token?: string;
  card_type?: CardTypeEnum;
  card_brand?: string;
}

export interface PaymentResponse {
  /** @format uuid */
  payment_id: string;
  trace_id: string;
  span_id: string;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Payout {
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
}

export interface PayoutConfig {
  not_invoicing_bank_account: DetailBankAccount;
}

export interface PayoutDetailResponse {
  /** @format uuid */
  id: string;
}

export interface PayoutManagementListResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: any[];
}

export interface Period {
  month_name: string;
  month: string;
  year: string;
}

export enum PreferenceTypeEnum {
  TRANSFER_IN = 'TRANSFER_IN',
  CASH_IN = 'CASH_IN',
  CARD = 'CARD',
}

export interface ProductServiceCatalog {
  DangerousMaterial: string;
  Complement: string;
  Name: string;
  Value: string;
}

export interface ProductServiceCatalogError {
  Message: string;
}

export enum RecalculationTriggerEnum {
  ModeChange = 'mode_change',
  OrderChange = 'order_change',
  ConfigChange = 'config_change',
}

export interface ReinvoiceRequestDTO {
  with_relation: boolean;
  /** @format uuid */
  invoice_id: string;
  observations?: string | null;
}

export interface RelatedInvoice {
  /** @format uuid */
  id: string;
  fiscal_identifier: string;
}

export interface RepairInvoiceRequestDTO {
  /**
   * ID del invoice a reparar
   * @format uuid
   */
  invoice_id: string;
  /** CFDI ID de Facturama (opcional, se busca automáticamente si no se provee) */
  service_identifier?: string | null;
}

export interface RepairInvoiceResponseDTO {
  /** Mensaje de éxito */
  message: string;
  /**
   * ID del invoice reparado
   * @format uuid
   */
  invoice_id: string;
  /** Nuevo status del invoice */
  status: string;
  /** Service identifier de Facturama */
  service_identifier: string;
  /** Fiscal identifier (UUID SAT) */
  fiscal_identifier: string;
}

export enum ReportTypeEnum {
  Delinquency = 'delinquency',
  Fulfillment = 'fulfillment',
  Payin = 'payin',
  PayinFulfillment = 'payin_fulfillment',
  Payout = 'payout',
  StudentOrders = 'student_orders',
  Students = 'students',
}

export interface RetrieveDashboardInvoiceResponseDTO {
  /** @format uuid */
  id: string;
  status: StatusCf3Enum;
  type: TypeDb9Enum;
  /** @format date-time */
  expedition_date: string;
  order_name: string;
  billing_guardian?: BillingGuardian;
  billing_guardian_name: string;
  tax_id: string;
  client_identifier: string;
  fiscal_identifier: string;
  related_invoice: RelatedInvoice;
  payin: PayinInvoice;
  /** @format double */
  subtotal: number;
  /** @format double */
  iva: number;
  /** @format double */
  isr: number;
  /** @format double */
  total: number;
  payment_method: string;
  files: string[];
  fulfillment: FulfillmentInvoice;
  enabled_actions: InvoiceEnabledActions;
  credit_notes: CreditNoteWithTotal[];
  has_invoices_pending_to_cancel: boolean;
  status_error: string;
  observations: string;
  guardians: InvoiceStudentGuardian[];
}

export interface RetrieveGuardian {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  hash: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Landline number for guardian.
   * @maxLength 128
   */
  landline?: string | null;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  schools: School[];
  dependents: BillingStudent[];
  /** Current onboarding stage for guardian. */
  onboarding_stage?: OnboardingStageEnum;
  /** Fiscal regime config for billing. */
  taxing_system?: TaxingSystemEnum | BlankEnum | NullEnum | null;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  /** Schema of cfdi uses depending of concept type for billing. */
  cfdi_config?: Record<string, any>;
  /** TODO */
  tour_completed?: Record<string, any>;
  /**
   * External identifier for integration with clients.
   * @maxLength 24
   */
  external_id?: string | null;
  cfdi_config_detail: {
    MONTHLY_FEE?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    INSCRIPTION?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    PRE_DEBT?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    TRANSPORT?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    OTHER?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
  };
  /** Type of fiscal regime for billing. */
  taxing_type?: TaxingTypeEnum | BlankEnum | NullEnum | null;
  has_payins: string;
  fraud_status: FraudStatusEnum | NullEnum | null;
  /** Block cash payment method for this guardian. */
  block_cash_payments?: boolean;
}

export interface RetrieveGuardianWithToken {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  hash: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Landline number for guardian.
   * @maxLength 128
   */
  landline?: string | null;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  schools: School[];
  dependents: BillingStudent[];
  /** Current onboarding stage for guardian. */
  onboarding_stage?: OnboardingStageEnum;
  /** Fiscal regime config for billing. */
  taxing_system?: TaxingSystemEnum | BlankEnum | NullEnum | null;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  /** Schema of cfdi uses depending of concept type for billing. */
  cfdi_config?: Record<string, any>;
  /** TODO */
  tour_completed?: Record<string, any>;
  /**
   * External identifier for integration with clients.
   * @maxLength 24
   */
  external_id?: string | null;
  cfdi_config_detail: {
    MONTHLY_FEE?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    INSCRIPTION?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    PRE_DEBT?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    TRANSPORT?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
    OTHER?: {
      /** @example "Gastos en general." */
      name: string;
      /** @example "G03" */
      code: string;
      /** @example "Otros Conceptos" */
      description: string;
    };
  };
  /** Type of fiscal regime for billing. */
  taxing_type?: TaxingTypeEnum | BlankEnum | NullEnum | null;
  has_payins: string;
  fraud_status: FraudStatusEnum | NullEnum | null;
  /** Block cash payment method for this guardian. */
  block_cash_payments?: boolean;
  token: string;
}

export interface RetrieveRefundDashboardDTO {
  id: string;
  payin_fulfillment: string;
  action: string;
  amount: string;
  invoice?: string;
  /** @format date */
  registered_at: string;
  comment: string;
  payment_method: string;
  /** @default false */
  unassign_concept?: boolean;
}

export interface RetrieveSubscribableConceptsResponseDTO {
  /** @format uuid */
  concept_id: string;
  concept_name: string;
  /** @format uuid */
  student_id: string;
  student_name: string;
  /** @format date */
  next_due: string;
  /** @format uuid */
  next_fulfillment_id: string;
  /** @format uuid */
  next_order_id: string;
  /** @format double */
  concept_price: number;
  has_due_order: boolean;
}

export interface RetrieveSubscriptionResponseDTO {
  /** @format uuid */
  id: string;
  student: SubscriptionStudentDTO;
  /** @format date */
  start_date: string;
  /** @format date */
  end_date: string;
  payday: number;
  metadata: Record<string, any>;
  concept: string;
  payment_has_failed: boolean;
  /** @format date */
  next_payment_date: string;
}

export interface RetryRequestDTO {
  /** @format uuid */
  invoice_id: string;
}

export enum RuleTypeEnum {
  Scholarship = 'scholarship',
  EarlyBird = 'early_bird',
  Interest = 'interest',
  SpecialDiscount = 'special_discount',
  SpecialOvercharge = 'special_overcharge',
}

export interface Scholarship {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of scholarship.
   * @maxLength 64
   */
  name: string;
  /**
   * Amount or percentage of discount depending of type.
   * @format decimal
   * @pattern ^-?\d{0,11}(?:\.\d{0,4})?$
   */
  value?: string | null;
  /** Type of discount. */
  type: TypeF30Enum;
  /** Types of concepts that are affected by scholarship. */
  affected_concept_types?: ConceptTypesEnum[];
  concepts?: string[];
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Date when scholarship was assigned, for thispurpose is the last date of modification for StudentScholarship */
  assigned_at: string;
  /** Excluded concepts on scholarship */
  excluded_concepts: ConceptSlim[];
}

export interface ScholarshipDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of scholarship.
   * @maxLength 64
   */
  name: string;
  /**
   * Amount or percentage of discount depending of type.
   * @format decimal
   * @pattern ^-?\d{0,11}(?:\.\d{0,4})?$
   */
  value?: string | null;
  /** Type of discount. */
  type: TypeF30Enum;
  /** Types of concepts that are affected by scholarship. */
  affected_concept_types?: ConceptTypesEnum[];
  concepts: ConceptSlim[];
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Excluded concepts on scholarship */
  excluded_concepts: ConceptSlim[];
  /**
   * User who created object.
   * @format uuid
   */
  created_by_id: string | null;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
}

export interface ScholarshipExpired {
  id: number;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  scholarship_id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  student_id: string;
  name: string;
  /** @format double */
  value: number;
  type: string;
  /**
   * Datetime on which the scholarship was assigned.
   * @format date-time
   */
  assigned_at: string;
  /**
   * Datetime on which the scholarship was de-assigned.
   * @format date-time
   */
  deassigned_at: string;
}

export interface ScholarshipExpiredDetail {
  id: number;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  scholarship_id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  student_id: string;
  name: string;
  /** @format double */
  value: number;
  type: string;
  /**
   * Datetime on which the scholarship was assigned.
   * @format date-time
   */
  assigned_at: string;
  /**
   * Datetime on which the scholarship was de-assigned.
   * @format date-time
   */
  deassigned_at: string;
  /** Affected concept for expired student scholarship. */
  affected_concepts: string;
}

export interface ScholarshipList {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of scholarship.
   * @maxLength 64
   */
  name: string;
  /**
   * Amount or percentage of discount depending of type.
   * @format decimal
   * @pattern ^-?\d{0,11}(?:\.\d{0,4})?$
   */
  value?: string | null;
  /** Type of discount. */
  type: TypeF30Enum;
  /** Types of concepts that are affected by scholarship. */
  affected_concept_types?: ConceptTypesEnum[];
  concepts?: string[];
}

export enum ScholarshipLostConfigEnum {
  NotLost = 'not_lost',
  ByOrder = 'by_order',
  ByStudent = 'by_student',
}

export interface ScholarshipSlim {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of scholarship.
   * @maxLength 64
   */
  name: string;
}

export interface ScholarshipValidate {
  student_scholarship_exists: boolean;
  paid_fulfillment_with_scholarship_exists: boolean;
  message: string;
}

export interface School {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the school.
   * @maxLength 350
   */
  name: string;
  /** Current status of the school */
  status?: Status2B3Enum;
  /**
   * Logo of the school.
   * @format uri
   */
  logo?: string | null;
  preferences: Record<string, any>;
  commission_distribution: Record<string, any>;
  /** Schema to specify some configs for school dashboard or invoicing. */
  config_dashboard?: Record<string, any>;
  /** Schema to specify some configs for payments portal of the school. */
  config_portal?: Record<string, any>;
  is_provider?: boolean;
  /** Indicates if school uses our invoicing services. */
  does_invoice?: boolean;
  gateway_credentials: Record<string, any>;
}

export interface SchoolBlockedPeriodResponse {
  /** @format uuid */
  id: string;
  /** @format uuid */
  school_id: string;
  /** @format uuid */
  allowed_period_id: string;
  /** @format date */
  start_date: string;
  /** @format date */
  end_date: string;
  campaign_id?: string | null;
  affected_fulfillment_ids: string[];
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface SchoolCycle {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the cycle.
   * @maxLength 255
   */
  name: string;
  /**
   * Year when the cycle starts.
   * @min -32768
   * @max 32767
   */
  year_start?: number | null;
  /**
   * Year when the cycle ends.
   * @min -32768
   * @max 32767
   */
  year_end?: number | null;
  /** True only for current cycle */
  is_active?: boolean;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  next_id: string | null;
}

export interface SchoolCycleCurrent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the cycle.
   * @maxLength 255
   */
  name: string;
  /** @format uuid */
  next_id?: string | null;
  next_name?: string | null;
  levels: SchoolCycleCurrentLevel[];
}

export interface SchoolCycleCurrentGroup {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
  /** @format uuid */
  next_id: string;
  next_name: string;
}

export interface SchoolCycleCurrentLevel {
  /** @format uuid */
  id: string;
  name: string;
  count_students: number;
  sections: SchoolCycleCurrentSection[];
}

export interface SchoolCycleCurrentSection {
  name: string;
  next_name: string;
  groups: SchoolCycleCurrentGroup[];
}

export interface SchoolCycleStatus {
  status: SchoolCycleStatusStatusEnum;
}

export enum SchoolCycleStatusStatusEnum {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export interface SchoolImport {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** @format date-time */
  deleted: string;
  deleted_by_cascade: boolean;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
  archived?: boolean;
  /** Country of location. */
  country?: CountryEnum;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  /** If true, scholarships and partial payments are applied independently on the original amount. */
  apply_discounts_independently?: boolean;
  /**
   * Name of the school.
   * @maxLength 350
   */
  name: string;
  /**
   * Name of the school slugified.
   * @maxLength 40
   */
  slug_name?: string | null;
  /**
   * Short slufify of the school's name.
   * @maxLength 3
   */
  short_slug?: string;
  /**
   * Slug url of the school's name.
   * @maxLength 40
   */
  slug_url?: string | null;
  /**
   * Logo of the school.
   * @format uri
   */
  logo?: string | null;
  /**
   * Phone contact of the school
   * @maxLength 128
   */
  phone: string;
  /** @maxLength 128 */
  secondary_phone?: string | null;
  /**
   * Email contact of the school
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * @format email
   * @maxLength 254
   */
  secondary_email?: string | null;
  /**
   * Custom sender for mailing, example use "Mi sender <sender@email.com>"
   * @maxLength 128
   */
  custom_email_sender?: string | null;
  /** Indicate if is a demo school. */
  demo?: boolean;
  /**
   * Institutional identifier to send when use_education_complement is activated(aut_rvoe).
   * @maxLength 32
   */
  institutional_id: string;
  /** Schema of commissions for the school. The attribute "commission_distribution" determines the commission distribution between school and guardian. 0 => 100% school, 1 100% guardian. */
  commissions_schema?: Record<string, any>;
  /** Schema that indicated which payment methods are active for school. */
  payment_preferences?: Record<string, any>;
  /** Schema to specify some configs for school dashboard or invoicing. */
  config_dashboard?: Record<string, any>;
  /** Schema to specify some configs for payments portal of the school. */
  config_portal?: Record<string, any>;
  /** Indicated amount over witch amount must be apply interests. */
  partial_payment_interest_type?: PartialPaymentInterestTypeEnum;
  /** Define if interest rate is frozen after first partial payment */
  partial_payment_interest_freeze?: boolean;
  /** Determines which config is used for due orders and scholarships. */
  scholarship_lost_config?: ScholarshipLostConfigEnum;
  /** https://www.notion.so/cometa/Configuracion-calculo-de-descuentos-a-nivel-de-colegio-6c3e67b4683f496690f3f7c11125fa7f */
  discount_order?: DiscountOrderEnum;
  /** Defines if scholarship discount is applied over the previous scholarship discount */
  scholarship_is_accumulative?: boolean;
  is_provider?: boolean;
  /** Indicates if school uses our invoicing services. */
  does_invoice?: boolean;
  can_invoice_to_general_public?: boolean;
  /** Default cfdi config for invoice. */
  cfdi_use_config?: Record<string, any>;
  /** Default cfdi config for discounts */
  discounts_config?: Record<string, any>;
  /** Current status of the school */
  status?: Status2B3Enum;
  /**
   * Deal/Opportunity id from CRM.
   * @maxLength 100
   */
  external_crm_id?: string | null;
  /** Indicates whether the school is a real physical campus or is used for external/commercial students. */
  is_real_campus?: boolean | null;
  /** Type of institution this school represents. */
  school_type?: SchoolTypeEnum | BlankEnum | NullEnum | null;
  /**
   * User who created object.
   * @format uuid
   */
  created_by?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  organization: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  group?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  gateway_credentials?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  counter?: string | null;
  members: string[];
}

export interface SchoolNotFoundResponse {
  detail: string;
}

export interface SchoolPayoutsResume {
  deposit_month: number;
  deposit_week: number;
  deposit_yesterday: number;
  deposit_today: number;
}

export enum SchoolTypeEnum {
  TechnicalSchool = 'technical_school',
  Extracurricular = 'extracurricular',
  University = 'university',
  K12 = 'k12',
  Kindergarten = 'kindergarten',
  Demo = 'demo',
  Events = 'events',
  Suppliers = 'suppliers',
  Highschool = 'highschool',
  ExternalSales = 'external_sales',
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Section {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  name: string;
}

export interface SectionFilter {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  level: string;
  /**
   * Grade of the section.
   * @maxLength 100
   */
  grade: string;
  /**
   * Internal name for section inside a grade.
   * @maxLength 50
   */
  group?: string | null;
}

export interface SectionWithLevel {
  /** @format uuid */
  id: string;
  grade: string;
  group: string;
  level: Level;
  without_group: boolean | null;
  /** @format uuid */
  last_section: string | null;
  /** @format uuid */
  next: string | null;
}

export interface SendCodeRequest {
  method: MethodEnum;
  value: string;
}

export enum ServiceEnum {
  KUSHKI = 'KUSHKI',
}

export interface SignupGuardian {
  first_name: string;
  last_name?: string;
  /** @format email */
  email: string;
  phone: string;
  onboarding_stage: OnboardingStageEnum;
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface SimpleFulfillment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  order_name: string;
  student: SlimStudent;
  student_fullname?: string;
  /**
   * Total guardian commission (commission + tax).
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  guardian_commission: string;
  /** @format date-time */
  deleted: string;
}

export interface SimplePayinFulfillment {
  id: number;
  correlative_id?: string;
  fulfillment_id: string;
  /** @format date-time */
  fulfillment_deleted: string;
  order_name: string;
  /** @format date-time */
  paid_date: string;
  final_amount: string;
  student: SlimStudent;
  student_fullname?: string;
  guardian: SlimGuardian;
  invoice_status: InvoiceStatusEnum | NullEnum | null;
  /**
   * Total guardian commission (commission + tax).
   * @format decimal
   * @pattern ^-?\d{0,9}(?:\.\d{0,2})?$
   */
  guardian_commission: string;
  refund: RetrieveRefundDashboardDTO | null;
}

/** Simulate calculation with example data */
export interface Simulate {
  /**
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  base_amount: string;
  mode: ModeEnum;
  adjustments: AdjustmentItem[];
}

export interface SingleSyncRequest {
  /** @format uuid */
  tenant_id: string;
  action: SingleSyncRequestActionEnum;
  entity_type: EntityTypeEnum;
  /** @format uuid */
  entity_id: string;
}

export enum SingleSyncRequestActionEnum {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface SlimBankAccount {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Type of the bank account, CLABE_ACCOUNT type only for Kushki tests. */
  account_type: AccountTypeEnum;
  /**
   * Name of the owner of the bank account.
   * @maxLength 255
   */
  owner: string;
  /**
   * Friendly name for bank account.
   * @maxLength 55
   */
  nickname?: string;
  /**
   * Name of the banck.
   * @maxLength 75
   */
  bank_name: string;
  public_summary: string;
  /** @maxLength 55 */
  account_number: string;
  archived?: boolean;
}

export interface SlimConceptGuardianDependentFulfillment {
  type: string;
  is_billable: boolean;
  payment_only_in_dashboard: boolean;
  optional: boolean;
}

export interface SlimGuardian {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  dependents_count: number;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  fraud_status: FraudStatusEnum | NullEnum | null;
  /** @default "" */
  relationship: string;
  has_student_custody: boolean;
}

export interface SlimPayinGuardianDependentFulfillment {
  /** @format uuid */
  id: string;
  /** @format date-time */
  created: string;
  /**
   * Total amount of the payin.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total: string;
  /**
   * Amount from this payin applied to this specific fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  total_paid?: string;
}

export interface SlimSpecialOverCharge {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of special charge.
   * @maxLength 255
   */
  name?: string;
  /**
   * Amount of over charge.
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  value?: string | null;
  is_visible?: boolean;
}

export interface SlimStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Level name */
  level: string | null;
  /** Section name */
  section: string | null;
  state?: StateEnum;
  lead_id?: string;
}

export interface SlimStudentGuardianDependentFulfillment {
  /** @format uuid */
  id: string;
}

export interface SlimStudentSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Level name */
  level: string | null;
  /** Section name */
  section: string | null;
  state?: StateEnum;
  lead_id?: string;
}

export interface SlimStudentsScholarship {
  id: number;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  scholarship_id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  student_id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  school_cycle_id: string | null;
}

export interface SlimSubscriptionGuardianDependentFulfillment {
  /** @format uuid */
  id: string;
  payment_has_failed: boolean;
  /** @format date */
  next_payment_date: string;
}

export interface SpecialDiscount {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** @maxLength 255 */
  name: string;
  /** @format uuid */
  student: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  order: string;
  /**
   * Amount or percentage of discount depending of type.
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  value?: string | null;
  /** Type of discount. */
  type: Type104Enum;
}

export interface SpecialOverCharge {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** @maxLength 255 */
  name: string;
  /**
   * Amount of over charge.
   * @format decimal
   * @pattern ^-?\d{0,13}(?:\.\d{0,2})?$
   */
  value?: string | null;
  is_visible?: boolean;
  /** @format uuid */
  student: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  order: string;
  /** Type of charge. */
  type: TypeF30Enum;
}

export enum StateEnum {
  Lead = 'lead',
  NewStudent = 'new_student',
  Active = 'active',
  Inactive = 'inactive',
  Graduated = 'graduated',
  DroppedOut = 'dropped_out',
}

export enum Status259Enum {
  DUE = 'DUE',
  PAID = 'PAID',
  PENDING = 'PENDING',
  OUTSTANDING = 'OUTSTANDING',
}

export enum Status2B3Enum {
  Operando = 'operando',
  Baja = 'baja',
  Onboarding = 'onboarding',
  Paused = 'paused',
}

export enum Status386Enum {
  STARTED = 'STARTED',
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  SUCCESS = 'SUCCESS',
  FAILED_AND_CANCELED = 'FAILED_AND_CANCELED',
  FAILED_ON_DELETION = 'FAILED_ON_DELETION',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  RETRYING = 'RETRYING',
}

export enum Status91FEnum {
  Approved = 'approved',
  Authorized = 'authorized',
  Pending = 'pending',
  InProcess = 'in_process',
  InMediation = 'in_mediation',
  Blocked = 'blocked',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
  ChargedBack = 'charged_back',
}

export enum StatusCf3Enum {
  Pending = 'pending',
  Failed = 'failed',
  Success = 'success',
  Canceled = 'canceled',
  Canceling = 'canceling',
  NotRequested = 'not_requested',
  Multiple = 'multiple',
}

export enum StatusDc1Enum {
  NOT_PAID = 'NOT_PAID',
  WAITING_PAID = 'WAITING_PAID',
  PAID = 'PAID',
  PARTIAL_PAID = 'PARTIAL_PAID',
}

export enum StatusFc7Enum {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
}

export enum StatusFdeEnum {
  SCHEDULED_STATUS = 'SCHEDULED_STATUS',
  PROCESSING_STATUS = 'PROCESSING_STATUS',
  APPROVED_STATUS = 'APPROVED_STATUS',
  DECLINED_STATUS = 'DECLINED_STATUS',
  CANCELED_STATUS = 'CANCELED_STATUS',
}

export enum StatusesEnum {
  Pending = 'pending',
  Failed = 'failed',
}

export interface Stock {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  quantity: number;
  is_limited?: boolean;
}

export interface StockList {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  quantity: number;
  is_limited?: boolean;
}

export interface StockListHistory {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  created_by: User;
  /** @format date-time */
  deleted: string;
  deleted_by_cascade: boolean;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /**
   * Modified at
   * Date time on which the object was last modified.
   * @format date-time
   */
  modified: string;
  archived?: boolean;
  observations?: string | null;
  /** Stock movement action */
  action?: StockListHistoryActionEnum | BlankEnum | NullEnum | null;
  /** Stock movement type */
  type?: StockListHistoryTypeEnum | BlankEnum | NullEnum | null;
  /**
   * Fulfillment
   * @format uuid
   */
  fulfillment_id?: string | null;
  /**
   * Date since the stock has been limited.
   * @format date-time
   */
  previous_limited_date?: string | null;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  previous_quantity?: number | null;
  previous_is_limited?: boolean | null;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  registered_quantity?: number | null;
  registered_is_limited?: boolean | null;
  /** @format date-time */
  registered_limited_date?: string | null;
  /**
   * photo of real stock
   * @min -2147483648
   * @max 2147483647
   */
  current_stock_quantity?: number | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  stock?: string | null;
}

export enum StockListHistoryActionEnum {
  SUM = 'SUM',
  SUBTRACT = 'SUBTRACT',
  LIMITED = 'LIMITED',
  UNLIMITED = 'UNLIMITED',
  SET_FIRST_TIME = 'SET_FIRST_TIME',
  UPDATE = 'UPDATE',
}

export enum StockListHistoryTypeEnum {
  INTERNAL_MOVEMENT = 'INTERNAL_MOVEMENT',
  EXTERNAL_MOVEMENT = 'EXTERNAL_MOVEMENT',
}

export interface Student {
  /** @format uuid */
  id: string;
  first_name: string;
  last_name: string;
}

export interface StudentAssignment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Due date of first order of concept assignment(legacy). */
  start_date: string;
  /** Due date of last order of concept assignment(legacy). */
  end_date: string;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  concept: DetailedConcept;
  /** Orders skipped for concept of concept assignment(legacy). */
  orders_to_skip: string;
}

export interface StudentAssignmentDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  student_id: string;
  /** @format date */
  start_date?: string | null;
  /** @format date */
  end_date?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  concept: string;
  scholarships: Scholarship[];
  orders_to_skip?: string[];
}

export interface StudentByLevel {
  /**
   * Name of the level.
   * @maxLength 350
   */
  name: string;
  level_id: string;
  children: string;
}

/** V2: Sums section counters for level total (single-pass) */
export interface StudentByLevelSerializerV2 {
  /**
   * Name of the level.
   * @maxLength 350
   */
  name: string;
  level_id: string;
  children: string;
}

export interface StudentConcept {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /** Indicates if concept is assigned to student. */
  is_assigned: string;
  is_optional: string;
  type: string;
}

export interface StudentConceptDetail {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  /** Schema of earlybird discounts for concept. */
  early_bird_discounts?: Record<string, any>;
  scholarships: Scholarship[];
  orders: VirtualOrder[];
  interests: Record<string, any>[];
}

export interface StudentConceptDetailSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Name of the concept. Concatenate concept basename with rootConcept name
   * @maxLength 512
   */
  name: string;
  /**
   * Price for concept orders.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Day of month when concept due, values between -3 and 28 (-1: last day, -2: penultimate day, -3: third to last day).
   * @min -32768
   * @max 32767
   */
  payday?: number;
  /** Schema of earlybird discounts for concept. */
  early_bird_discounts?: Record<string, any>;
  scholarships: Scholarship[];
  orders: VirtualOrderSerializerV2[];
  interests: Record<string, any>[];
}

export interface StudentInscriptionsSummary {
  re_registered_students_count: number;
  re_registered_students_denominator: number;
  new_registered: number;
  new_registered_denominator: number;
  next_cycle_count: number;
  school_cycle: string;
}

export interface StudentOrder {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  concept: DetailedConcept;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  price_currency: string;
  due: string;
  /** Status of the student order (legacy version). */
  status: Status259Enum;
  /** Interest + visible over charge amount amount of fulfillment(order-student). */
  total_charge: string;
  /** Interest amount of fulfillment(order-student). */
  interest: string;
  /** Discount amount of fulfillment(order-student). */
  discount: string;
  /** Discount details of fulfillment(order-student). */
  discount_breakdown: Record<string, any>;
  /** Boolean indicates if first payin associated to order is pending. */
  pending: boolean;
  /** Deprecated. */
  expiration: string;
  /** Payins associated to fulfillment(order-student) */
  payins: Payin[] | null;
  invoice: Invoice | null;
  dependent: SlimStudent | null;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  /** Commission amount charged based on payin type. */
  commissions: string;
  /** Commission amount charged to guardian based on payin type. */
  guardian_commission: string;
  is_sponsored: string;
  base_amount: string;
  original_due: string;
}

export interface StudentScholarshipCreate {
  /** @format uuid */
  scholarship_id: string;
  orders_to_skip?: string[];
  /** @format uuid */
  school_cycle_id: string;
  /** @default true */
  is_active?: boolean;
  /** @format uuid */
  student_id: string;
  /** @format uuid */
  school_id: string;
  date_ranges?: StudentScholarshipDateRange[];
}

export interface StudentScholarshipDateRange {
  id: number;
  /** @format date-time */
  start_date?: string;
  /** @format date-time */
  end_date?: string;
  /** @default true */
  is_active?: boolean;
}

export interface StudentScholarshipDateRangeUpdate {
  id?: number;
  /** @format date-time */
  start_date?: string;
  /** @format date-time */
  end_date?: string;
  /** @default true */
  is_active?: boolean;
}

export interface StudentScholarshipRetrieve {
  /** @format uuid */
  id: string;
  scholarship: Scholarship;
  student: Student;
  orders_to_skip: any[];
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  school_cycle: SchoolCycle;
  is_active: boolean;
  date_ranges: StudentScholarshipDateRange[];
  /** Affected concept for expired student scholarship. */
  affected_concepts: AffectedConcept[];
  is_deletable: boolean;
}

export interface StudentScholarshipUpdate {
  /** @format uuid */
  scholarship_id: string;
  orders_to_skip?: string[];
  /** @format uuid */
  school_cycle_id: string;
  /** @default true */
  is_active?: boolean;
  /** @format uuid */
  student_id: string;
  /** @format uuid */
  school_id: string;
  date_ranges?: StudentScholarshipDateRangeUpdate[];
  id: number;
}

export interface StudentStatusSummary {
  no_debt: number;
  partial_paid: number;
  due: number;
  status: string;
}

export interface StudentsScholarship {
  id: number;
  scholarship: ScholarshipSlim;
  student: string;
}

export interface SubscriptionStudentDTO {
  /** @format uuid */
  id: string;
  full_name: string;
  billing_guardian_name: string;
}

export interface SuccessResponse {
  message: string;
}

export interface SyncRequest {
  /** @format uuid */
  tenant_id: string;
  action: SyncRequestActionEnum;
  entity_type: EntityTypeEnum;
}

export enum SyncRequestActionEnum {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

export interface TableLinkCreateRequest {
  /** @format uuid */
  school_id: string;
  table_name: string;
  relative_url: string;
  filters?: Record<string, any>;
  columns?: Record<string, any>;
}

export interface TableLinkResponse {
  /** @format uuid */
  id: string;
  /** @format uuid */
  user_id: string;
  /** @format uuid */
  school_id: string;
  table_name: string;
  relative_url: string;
  hash: string;
  filters: Record<string, any>;
  columns: Record<string, any>;
}

export interface TableLinkUpdateRequest {
  filters?: Record<string, any>;
  columns?: Record<string, any>;
}

export enum TaxingSystemEnum {
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

export enum TaxingTypeEnum {
  N = 'N',
  M = 'M',
}

export interface Transaction {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /** Service used for payment. */
  service: ServiceEnum;
  /** Identifier reference of the transaction in the service. */
  identifier: string | null;
  /** Response status(http code) of the transaction. */
  status: number | null;
  details: string;
}

export enum TransportEnum {
  G01 = 'G01',
  G02 = 'G02',
  G03 = 'G03',
  I01 = 'I01',
  I02 = 'I02',
  I03 = 'I03',
  I04 = 'I04',
  I05 = 'I05',
  I06 = 'I06',
  I07 = 'I07',
  I08 = 'I08',
  D01 = 'D01',
  D02 = 'D02',
  D03 = 'D03',
  D04 = 'D04',
  D05 = 'D05',
  D06 = 'D06',
  D07 = 'D07',
  D08 = 'D08',
  D09 = 'D09',
  D10 = 'D10',
  CP01 = 'CP01',
  CN01 = 'CN01',
  S01 = 'S01',
}

export enum Type104Enum {
  INTEREST_FORG = 'INTEREST_FORG',
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  FIXED = 'FIXED',
  BRILLAMONT = 'BRILLAMONT',
}

export enum Type11EEnum {
  Ticket = 'ticket',
  BankTransfer = 'bank_transfer',
  Atm = 'atm',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  PrepaidCard = 'prepaid_card',
  NominalCheck = 'nominal_check',
  DepositCheck = 'deposit_check',
  DepositCash = 'deposit_cash',
  Multipay = 'multipay',
  Credit = 'credit',
  DirectDebit = 'direct_debit',
  CashPayroll = 'cash_payroll',
  Compensation = 'compensation',
  Giving = 'giving',
}

export enum TypeAceEnum {
  Scholarship = 'scholarship',
  EarlyBird = 'early_bird',
  Interest = 'interest',
  SpecialDiscount = 'special_discount',
  SpecialOvercharge = 'special_overcharge',
}

export enum TypeDb9Enum {
  Invoice = 'invoice',
  CreditNote = 'credit_note',
}

export enum TypeF30Enum {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  FIXED = 'FIXED',
  BRILLAMONT = 'BRILLAMONT',
}

export interface UnassignConceptsDTO {
  /** @format uuid */
  student_id: string;
}

export interface UpdateGuardian {
  /**
   * First name of the person.
   * @maxLength 250
   */
  first_name: string;
  /**
   * Last name of the person.
   * @maxLength 250
   */
  last_name?: string;
  /**
   * Email address for guardian.
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * Mobile phone number for guardian.
   * @maxLength 128
   */
  phone?: string | null;
  /**
   * Landline number for guardian.
   * @maxLength 128
   */
  landline?: string | null;
  /** Gender of the person. */
  gender?: GenderEnum | BlankEnum | NullEnum | null;
  /**
   * Fiscal identifier for billing(RFC).
   * @maxLength 20
   */
  tax_id?: string;
  /** Fiscal regime config for billing. */
  taxing_system?: TaxingSystemEnum | BlankEnum | NullEnum | null;
  cfdi_config: CFDIUser;
  /**
   * Address name for location.
   * @maxLength 128
   */
  address_name?: string;
  /**
   * Address number for location.
   * @maxLength 32
   */
  address_number?: string;
  /**
   * Address complement for location.
   * @maxLength 32
   */
  address_complement?: string | null;
  /**
   * District of location.
   * @maxLength 64
   */
  district?: string | null;
  /**
   * City of location.
   * @maxLength 64
   */
  city?: string;
  /**
   * State of location.
   * @maxLength 64
   */
  state?: string;
  /**
   * Postal Code of location.
   * @maxLength 16
   */
  postal_code?: string;
  onboarding_stage: OnboardingStageEnum;
  billable_dependents?: string[];
  /**
   * Fullname for billing.
   * @maxLength 128
   */
  billing_name?: string | null;
  terms_acceptance: Record<string, any>;
  /** TODO */
  tour_completed?: Record<string, any>;
  taxing_type: TaxingTypeEnum | NullEnum | null;
}

export enum UpdateQuantityRequestActionEnum {
  SUM = 'SUM',
  SUBTRACT = 'SUBTRACT',
}

export interface UpdateQuantityResponse {
  message: string;
}

export interface UpdateSchoolConfigDTO {
  config_dashboard: Record<string, any>;
  config_portal: Record<string, any>;
}

export interface UploadPhotoDTO {
  /** @format uri */
  photo?: string | null;
}

export interface UploadPhotoResponseDTO {
  photo: string;
}

export interface UrlShortenerResponse {
  /** @format uri */
  redirect_url: string;
}

export interface User {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Email address
   * Email address of the user.
   * @format email
   */
  email: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Staff status
   * Designates whether the user can log into this admin site.
   */
  is_staff: boolean;
  name: string;
  /** @format date-time */
  date_joined: string;
}

export interface UserDTO {
  /** @format uuid */
  id: string;
  first_name: string;
  last_name: string;
  /** @format email */
  email: string;
  mobile: string | null;
  membership: string;
  /** @format uuid */
  membership_id: string;
  /** @format date-time */
  last_login: string;
}

export interface UserListFiltersDTO {
  membership: BaseEnum[];
}

export interface UserReportAsPaid {
  is_paid: boolean;
}

export interface ValidateDeletionResponse {
  would_create_sponsored_payment: boolean;
  sponsored_payment_details?: Record<string, any>;
  message: string;
}

export interface ValidateOptionalOrderStudent {
  /** @format uuid */
  order: string;
  /** @format uuid */
  student: string | null;
}

export interface ValidatePreference {
  /** @format uuid */
  guardian: string;
  items: CreateServicePreferenceItem[];
  preference_type: PreferenceTypeEnum;
}

export interface ValidateSpecialOverChargeDeletion {
  /** @format uuid */
  student_id: string;
}

export interface VirtualOrder {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
  /** Indicates if order associated is due. */
  would_be_due: string;
  /** Indicated if student has this order a paid, partial paid or pending. */
  has_fulfillment: string;
  /** Indicates if student not have this order. */
  is_skipped: string;
}

export interface VirtualOrderSerializerV2 {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
  /** Indicates if order associated is due. */
  would_be_due: boolean;
  /** Indicated if student has this order a paid, partial paid or pending. */
  has_fulfillment: boolean;
  /** Indicates if student not have this order. */
  is_skipped: boolean;
  /**
   * Reflects the price of the fulfillment associated with the order if it exists and is paid.
   * @format decimal
   */
  fulfillment_amount?: string | null;
  /** Indicates if the order is associated with an optional concept. */
  optional: boolean;
}

export interface YearlyInvoiceZipRequest {
  /** Year to gather invoices from January 1 to December 15. */
  year: number;
}

export interface YearlyInvoiceZipResponse {
  status: string;
  download_url?: string | null;
}

export interface YearlyInvoiceZipStatusResponse {
  /** Status: "ready", "generating", "not_found", or "not_available" (before Dec 15) */
  status: string;
  download_url?: string | null;
  message?: string;
  /** Whether the current user will receive an email notification when the report is ready (only when status is "generating") */
  user_will_be_notified?: boolean;
}

export interface ZipReport {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  /**
   * Filename used for generate report.
   * @maxLength 255
   */
  filename?: string | null;
  /** Status of the report. */
  status: StatusFc7Enum;
  url: string;
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
 * @title No title
 * @version 0.0.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  academicCoordinator = {
    /**
     * @description Get debt information grouped by guardian for students in a school
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorGuardiansDebtCreate
     * @request POST:/academic-coordinator/{school_id}/guardians/debt/
     * @secure
     */
    academicCoordinatorGuardiansDebtCreate: (schoolId: string, data: GuardianDebtRequest, params: RequestParams = {}) =>
      this.request<GuardianDebtResponse[], any>({
        path: `/academic-coordinator/${schoolId}/guardians/debt/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new membership for a user in a school
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorMembershipsCreate
     * @request POST:/academic-coordinator/memberships/
     * @secure
     */
    academicCoordinatorMembershipsCreate: (data: MembershipCreate, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/memberships/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorMembershipsUpdate
     * @request PUT:/academic-coordinator/memberships/{id}/
     * @secure
     */
    academicCoordinatorMembershipsUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/memberships/${id}/`,
        method: 'PUT',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorMembershipsPartialUpdate
     * @request PATCH:/academic-coordinator/memberships/{id}/
     * @secure
     */
    academicCoordinatorMembershipsPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/memberships/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * @description Create a new organization
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorOrganizationsCreate
     * @request POST:/academic-coordinator/organizations/
     * @secure
     */
    academicCoordinatorOrganizationsCreate: (data: OrganizationCreate, params: RequestParams = {}) =>
      this.request<OrganizationResponse, Record<string, any>>({
        path: `/academic-coordinator/organizations/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an existing organization
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorOrganizationsUpdate
     * @request PUT:/academic-coordinator/organizations/{id}/
     * @secure
     */
    academicCoordinatorOrganizationsUpdate: (id: string, data: OrganizationUpdate, params: RequestParams = {}) =>
      this.request<OrganizationResponse, Record<string, any>>({
        path: `/academic-coordinator/organizations/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorOrganizationsPartialUpdate
     * @request PATCH:/academic-coordinator/organizations/{id}/
     * @secure
     */
    academicCoordinatorOrganizationsPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/organizations/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSchoolCyclesCreate
     * @request POST:/academic-coordinator/school_cycles/
     * @secure
     */
    academicCoordinatorSchoolCyclesCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/school_cycles/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSchoolCyclesRetrieve
     * @request GET:/academic-coordinator/school_cycles/{id}/
     * @secure
     */
    academicCoordinatorSchoolCyclesRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/school_cycles/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSchoolCyclesUpdate
     * @request PUT:/academic-coordinator/school_cycles/{id}/
     * @secure
     */
    academicCoordinatorSchoolCyclesUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/school_cycles/${id}/`,
        method: 'PUT',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSchoolCyclesPartialUpdate
     * @request PATCH:/academic-coordinator/school_cycles/{id}/
     * @secure
     */
    academicCoordinatorSchoolCyclesPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/school_cycles/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSchoolCyclesHasAssignedConceptsRetrieve
     * @request GET:/academic-coordinator/school_cycles/{id}/has_assigned_concepts/
     * @secure
     */
    academicCoordinatorSchoolCyclesHasAssignedConceptsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/school_cycles/${id}/has_assigned_concepts/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Create a new section.
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsCreate
     * @request POST:/academic-coordinator/sections/
     * @secure
     */
    academicCoordinatorSectionsCreate: (data: SectionWithLevel, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/academic-coordinator/sections/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a section
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsUpdate
     * @request PUT:/academic-coordinator/sections/{id}/
     * @secure
     */
    academicCoordinatorSectionsUpdate: (id: string, data: Section, params: RequestParams = {}) =>
      this.request<Section, Record<string, any>>({
        path: `/academic-coordinator/sections/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partial Update a section
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsPartialUpdate
     * @request PATCH:/academic-coordinator/sections/{id}/
     * @secure
     */
    academicCoordinatorSectionsPartialUpdate: (id: string, data: PatchedSection, params: RequestParams = {}) =>
      this.request<Section, Record<string, any>>({
        path: `/academic-coordinator/sections/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsDeleteDestroy
     * @request DELETE:/academic-coordinator/sections/{id}/delete/
     * @secure
     */
    academicCoordinatorSectionsDeleteDestroy: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/sections/${id}/delete/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Delete a list of sections for a id list.
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsBulkDeleteCreate
     * @request POST:/academic-coordinator/sections/bulk_delete/
     * @secure
     */
    academicCoordinatorSectionsBulkDeleteCreate: (params: RequestParams = {}) =>
      this.request<void, Record<string, any>>({
        path: `/academic-coordinator/sections/bulk_delete/`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Store temporary school form data
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsFormDataRetrieve
     * @request GET:/academic-coordinator/sections/form_data/
     * @secure
     */
    academicCoordinatorSectionsFormDataRetrieve: (
      query: {
        /**
         * UUID of the school
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/academic-coordinator/sections/form_data/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Store temporary school form data
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsFormDataCreate
     * @request POST:/academic-coordinator/sections/form_data/
     * @secure
     */
    academicCoordinatorSectionsFormDataCreate: (
      query: {
        /**
         * UUID of the school
         * @format uuid
         */
        school_id: string;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/academic-coordinator/sections/form_data/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve a list of sections for a given school.
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsListBySchoolList
     * @request GET:/academic-coordinator/sections/list_by_school/
     * @secure
     */
    academicCoordinatorSectionsListBySchoolList: (
      query: {
        /** A page number within the paginated result set. */
        page?: number;
        /**
         * UUID of the school
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSectionList, any>({
        path: `/academic-coordinator/sections/list_by_school/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update sections from form
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorSectionsUpdateFromFormCreate
     * @request POST:/academic-coordinator/sections/update_from_form/
     * @secure
     */
    academicCoordinatorSectionsUpdateFromFormCreate: (data: Section[], params: RequestParams = {}) =>
      this.request<void, Record<string, any>>({
        path: `/academic-coordinator/sections/update_from_form/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve fulfillments by concept types
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorStudentsGetPaidFulfillmentsByConceptTypesRetrieve
     * @request GET:/academic-coordinator/students/{id}/get_paid_fulfillments_by_concept_types/
     * @secure
     */
    academicCoordinatorStudentsGetPaidFulfillmentsByConceptTypesRetrieve: (
      id: string,
      query: {
        /** List of concept types. Valid values: INSCRIPTION, REINSCRIPTION, MONTHLY_FEE */
        concept_types: ('INSCRIPTION' | 'REINSCRIPTION' | 'MONTHLY_FEE')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/academic-coordinator/students/${id}/get_paid_fulfillments_by_concept_types/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic-coordinator
     * @name AcademicCoordinatorStudentsInscriptionsCreate
     * @request POST:/academic-coordinator/students/{id}/inscriptions/
     * @secure
     */
    academicCoordinatorStudentsInscriptionsCreate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/academic-coordinator/students/${id}/inscriptions/`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  };
  apiTokenAuth = {
    /**
     * No description
     *
     * @tags api-token-auth
     * @name ApiTokenAuthStaffCreate
     * @request POST:/api-token-auth/staff/
     * @secure
     */
    apiTokenAuthStaffCreate: (data: AuthToken, params: RequestParams = {}) =>
      this.request<AuthToken, any>({
        path: `/api-token-auth/staff/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  api = {
    /**
     * @description Generate authentication link for guardian app login. Requires only API secret key in headers.
     *
     * @tags api
     * @name ApiAppAuthLoginCreate
     * @request POST:/api/app/auth/login/
     * @secure
     */
    apiAppAuthLoginCreate: (data: GenerateAuthLinkRequest, params: RequestParams = {}) =>
      this.request<GenerateAuthLinkResponse, GenerateAuthLinkBadRequest | GenerateAuthLinkNotFound>({
        path: `/api/app/auth/login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get debt information for the authenticated guardian in the specified school.
     *
     * @tags api
     * @name ApiAppSchoolsGuardiansDebtRetrieve
     * @request GET:/api/app/schools/{school_id}/guardians/debt/
     * @secure
     */
    apiAppSchoolsGuardiansDebtRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<GuardianDebtResponse, any>({
        path: `/api/app/schools/${schoolId}/guardians/debt/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generate a hashed authentication URL for a Guardian
     *
     * @tags api
     * @name ApiAuthGuardianMagicLinkCreate
     * @request POST:/api/auth/guardian/magic-link/
     * @secure
     */
    apiAuthGuardianMagicLinkCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/guardian/magic-link/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Exchange username and password for Keycloak tokens
     *
     * @tags api
     * @name ApiAuthTokenCreateCreate
     * @request POST:/api/auth/token/create/
     * @secure
     */
    apiAuthTokenCreateCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/create/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Exchange a token for a new one with a different audience
     *
     * @tags api
     * @name ApiAuthTokenExchangeCreate
     * @request POST:/api/auth/token/exchange/
     * @secure
     */
    apiAuthTokenExchangeCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/exchange/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Invalidate the refresh token and log out the user
     *
     * @tags api
     * @name ApiAuthTokenLogoutCreate
     * @request POST:/api/auth/token/logout/
     * @secure
     */
    apiAuthTokenLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/logout/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Get the public key used to verify tokens
     *
     * @tags api
     * @name ApiAuthTokenPublicKeyRetrieve
     * @request GET:/api/auth/token/public-key/
     * @secure
     */
    apiAuthTokenPublicKeyRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/public-key/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Refresh an existing token using a refresh token
     *
     * @tags api
     * @name ApiAuthTokenRefreshCreate
     * @request POST:/api/auth/token/refresh/
     * @secure
     */
    apiAuthTokenRefreshCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/refresh/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Verify a token's validity and decode its content
     *
     * @tags api
     * @name ApiAuthTokenVerifyCreate
     * @request POST:/api/auth/token/verify/
     * @secure
     */
    apiAuthTokenVerifyCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/verify/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Get the OpenID configuration
     *
     * @tags api
     * @name ApiAuthTokenWellKnownRetrieve
     * @request GET:/api/auth/token/well-known/
     * @secure
     */
    apiAuthTokenWellKnownRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/token/well-known/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiDataPayoutInvoicesList
     * @request GET:/api/data/payout/invoices/
     * @secure
     */
    apiDataPayoutInvoicesList: (
      query?: {
        /** End date in 'dd/mm/yyyy' format. */
        date_end?: string;
        /** Start date in 'dd/mm/yyyy' format. */
        date_start?: string;
        /** Ending folio number for filtering. */
        folio_end?: number;
        /** Starting folio number for filtering. */
        folio_start?: number;
        /** Page number for pagination. Defaults to 0. */
        page?: number;
        /** RFC of the receiver to filter. */
        rfc?: string;
        /** Status of the CFDI ('all', 'active', 'canceled', 'pending'). Defaults to 'all'. */
        status?: string;
        /** Name of the receiver to filter. */
        tax_entity_name?: string;
        /** Type of CFDI ('issued', 'received'). Defaults to 'issued'. */
        type?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        {
          /** Unique identifier for the invoice */
          Id?: string;
          /** Type of CFDI ('I' for invoice) */
          CfdiType?: string;
          /** Invoice type (e.g., 'Emited') */
          Type?: string;
          /** Invoice folio number */
          Folio?: string;
          /** Invoice series */
          Serie?: string;
          /** Taxpayer name */
          TaxName?: string;
          /** Receiver's RFC */
          Rfc?: string;
          /** Issuer's RFC */
          RfcIssuer?: string;
          /**
           * Invoice issue date
           * @format date-time
           */
          Date?: string;
          /**
           * Subtotal amount
           * @format float
           */
          Subtotal?: number;
          /**
           * Total amount
           * @format float
           */
          Total?: number;
          /** Unique invoice identifier (UUID) */
          Uuid?: string;
          /** Indicates if the invoice is active */
          IsActive?: boolean;
          /** Payment method (e.g., 'PUE') */
          PaymentMethod?: string;
          /** Invoice status ('active', 'canceled', etc.) */
          Status?: string;
        }[],
        {
          msg?: string;
        }
      >({
        path: `/api/data/payout/invoices/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiDataTransactionsPayinsRetrieve
     * @request GET:/api/data/transactions/payins/{id}/
     * @secure
     */
    apiDataTransactionsPayinsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/data/transactions/payins/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsList
     * @request GET:/api/internal/schools/
     * @secure
     */
    apiInternalSchoolsList: (
      query?: {
        /** Which field to use when ordering the results. */
        ordering?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<InternalSchool[], any>({
        path: `/api/internal/schools/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsImportStudentsCreate
     * @request POST:/api/internal/schools/{id}/import_students/
     * @secure
     */
    apiInternalSchoolsImportStudentsCreate: (id: string, data: InternalSchool, params: RequestParams = {}) =>
      this.request<InternalSchool, any>({
        path: `/api/internal/schools/${id}/import_students/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsImporterCreate
     * @request POST:/api/internal/schools/{id}/importer/
     * @secure
     */
    apiInternalSchoolsImporterCreate: (id: string, data: InternalSchool, params: RequestParams = {}) =>
      this.request<InternalSchool, any>({
        path: `/api/internal/schools/${id}/importer/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsConceptsList
     * @request GET:/api/internal/schools/{school_id}/concepts/
     * @secure
     */
    apiInternalSchoolsConceptsList: (schoolId: string, params: RequestParams = {}) =>
      this.request<ConceptsList[], any>({
        path: `/api/internal/schools/${schoolId}/concepts/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsOrdersList
     * @request GET:/api/internal/schools/{school_id}/orders/
     * @secure
     */
    apiInternalSchoolsOrdersList: (schoolId: string, params: RequestParams = {}) =>
      this.request<OrderImporter[], any>({
        path: `/api/internal/schools/${schoolId}/orders/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsImporterSchoolCreate
     * @request POST:/api/internal/schools/importer_school/
     * @secure
     */
    apiInternalSchoolsImporterSchoolCreate: (data: SchoolImport, params: RequestParams = {}) =>
      this.request<SchoolImport, any>({
        path: `/api/internal/schools/importer_school/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsRemindersDeliquencyCreate
     * @request POST:/api/internal/schools/reminders/deliquency/
     * @secure
     */
    apiInternalSchoolsRemindersDeliquencyCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/internal/schools/reminders/deliquency/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsRemindersOnboardingCreate
     * @request POST:/api/internal/schools/reminders/onboarding/
     * @secure
     */
    apiInternalSchoolsRemindersOnboardingCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/internal/schools/reminders/onboarding/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description This endpoint doesn't use pagination
     *
     * @tags api
     * @name ApiInternalSchoolsRemindersPaidreminderCreate
     * @request POST:/api/internal/schools/reminders/paidreminder/
     * @secure
     */
    apiInternalSchoolsRemindersPaidreminderCreate: (data: PaidReminderRequest[], params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/internal/schools/reminders/paidreminder/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiInternalSchoolsRemindersWrongDataCreate
     * @request POST:/api/internal/schools/reminders/wrong_data/
     * @secure
     */
    apiInternalSchoolsRemindersWrongDataCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/internal/schools/reminders/wrong_data/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiPublicV1ConceptAssignmentsCreate
     * @request POST:/api/public/v1/concept-assignments/
     * @secure
     */
    apiPublicV1ConceptAssignmentsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/concept-assignments/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Orders
     *
     * @tags orders
     * @name ApiPublicV1ConceptsOrdersRetrieve
     * @request GET:/api/public/v1/concepts/{concept_id}/orders/
     */
    apiPublicV1ConceptsOrdersRetrieve: (conceptId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/concepts/${conceptId}/orders/`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description Guardians
     *
     * @tags Guardians
     * @name ApiPublicV1GuardiansRetrieve
     * @request GET:/api/public/v1/guardians/
     */
    apiPublicV1GuardiansRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/guardians/`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiPublicV1GuardiansCreate
     * @request POST:/api/public/v1/guardians/
     * @secure
     */
    apiPublicV1GuardiansCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/guardians/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiPublicV1GuardiansPartialUpdate
     * @request PATCH:/api/public/v1/guardians/{id}/
     * @secure
     */
    apiPublicV1GuardiansPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/guardians/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * @description School cycles
     *
     * @tags school-cycles
     * @name ApiPublicV1SchoolCyclesRetrieve
     * @request GET:/api/public/v1/school-cycles/
     */
    apiPublicV1SchoolCyclesRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/school-cycles/`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description Concepts
     *
     * @tags concepts
     * @name ApiPublicV1SchoolCyclesConceptsRetrieve
     * @request GET:/api/public/v1/school-cycles/{school_cycle_id}/concepts/
     */
    apiPublicV1SchoolCyclesConceptsRetrieve: (schoolCycleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/school-cycles/${schoolCycleId}/concepts/`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description List all fulfillments for a specific guardian and school. Args: request: The HTTP request object guardian_id: UUID of the guardian to get fulfillments for school_id: UUID of the school to filter fulfillments by *args: Additional positional arguments **kwargs: Additional keyword arguments Returns: Response: HTTP response containing serialized fulfillment data Raises: PermissionDenied: If JWT validation fails
     *
     * @tags api
     * @name ApiPublicV1SchoolsGuardiansFulfillmentsList
     * @request GET:/api/public/v1/schools/{school_id}/guardians/{guardian_id}/fulfillments/
     * @secure
     */
    apiPublicV1SchoolsGuardiansFulfillmentsList: (guardianId: string, schoolId: string, params: RequestParams = {}) =>
      this.request<GuardianDependentFulfillment[], any>({
        path: `/api/public/v1/schools/${schoolId}/guardians/${guardianId}/fulfillments/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Sections
     *
     * @tags sections
     * @name ApiPublicV1SectionsRetrieve
     * @request GET:/api/public/v1/sections/
     */
    apiPublicV1SectionsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/sections/`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description Students
     *
     * @tags students
     * @name ApiPublicV1StudentsRetrieve
     * @request GET:/api/public/v1/students/
     */
    apiPublicV1StudentsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/students/`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiPublicV1StudentsCreate
     * @request POST:/api/public/v1/students/
     * @secure
     */
    apiPublicV1StudentsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/students/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiPublicV1StudentsRetrieve2
     * @request GET:/api/public/v1/students/{id}/
     * @secure
     */
    apiPublicV1StudentsRetrieve2: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/students/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiPublicV1StudentsPartialUpdate
     * @request PATCH:/api/public/v1/students/{id}/
     * @secure
     */
    apiPublicV1StudentsPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/public/v1/students/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * @description OpenApi3 schema for this API. Format can be selected via content negotiation. - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json
     *
     * @tags api
     * @name ApiSchemaRetrieve
     * @request GET:/api/schema/
     * @secure
     */
    apiSchemaRetrieve: (
      query?: {
        format?: 'json' | 'yaml';
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>, any>({
        path: `/api/schema/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description OpenApi3 schema for this API. Format can be selected via content negotiation. - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json
     *
     * @tags api
     * @name ApiSchemaCustomRetrieve
     * @request GET:/api/schema-custom/
     * @secure
     */
    apiSchemaCustomRetrieve: (
      query?: {
        format?: 'json' | 'yaml';
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>, any>({
        path: `/api/schema-custom/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsPartialUpdate
     * @request PATCH:/api/v1/admissions/{student_lead_id}/
     * @secure
     */
    apiV1AdmissionsPartialUpdate: (studentLeadId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/${studentLeadId}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsAssignConceptsCreate
     * @request POST:/api/v1/admissions/assign_concepts/
     * @secure
     */
    apiV1AdmissionsAssignConceptsCreate: (data: AssignConceptsDTO, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/assign_concepts/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsCheckPaymentsRetrieve
     * @request GET:/api/v1/admissions/check_payments/{student_id}/
     * @secure
     */
    apiV1AdmissionsCheckPaymentsRetrieve: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/check_payments/${studentId}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsCreateGuardianCreate
     * @request POST:/api/v1/admissions/create_guardian/
     * @secure
     */
    apiV1AdmissionsCreateGuardianCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/create_guardian/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsCreateLeadCreate
     * @request POST:/api/v1/admissions/create_lead/
     * @secure
     */
    apiV1AdmissionsCreateLeadCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/create_lead/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsDeleteGuardianDestroy
     * @request DELETE:/api/v1/admissions/delete_guardian/{guardian_id}/
     * @secure
     */
    apiV1AdmissionsDeleteGuardianDestroy: (guardianId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/delete_guardian/${guardianId}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsDeleteStudentDestroy
     * @request DELETE:/api/v1/admissions/delete_student/{student_id}/
     * @secure
     */
    apiV1AdmissionsDeleteStudentDestroy: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/delete_student/${studentId}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsGuardianRetrieve
     * @request GET:/api/v1/admissions/guardian/{guardian_id}/
     * @secure
     */
    apiV1AdmissionsGuardianRetrieve: (guardianId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/guardian/${guardianId}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsLinkGuardianPartialUpdate
     * @request PATCH:/api/v1/admissions/link_guardian/{guardian_id}/
     * @secure
     */
    apiV1AdmissionsLinkGuardianPartialUpdate: (guardianId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/link_guardian/${guardianId}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsStudentLeadPartialUpdate
     * @request PATCH:/api/v1/admissions/student_lead/{student_id}/
     * @secure
     */
    apiV1AdmissionsStudentLeadPartialUpdate: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/student_lead/${studentId}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsUnassignConceptsCreate
     * @request POST:/api/v1/admissions/unassign_concepts/
     * @secure
     */
    apiV1AdmissionsUnassignConceptsCreate: (data: UnassignConceptsDTO, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/admissions/unassign_concepts/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AdmissionsUpdateGuardianPartialUpdate
     * @request PATCH:/api/v1/admissions/update_guardian/{guardian_id}/
     * @secure
     */
    apiV1AdmissionsUpdateGuardianPartialUpdate: (
      guardianId: string,
      data: PatchedUpdateGuardianDTO,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/admissions/update_guardian/${guardianId}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description List all allowed block periods
     *
     * @tags api
     * @name ApiV1AllowedBlockPeriodsList
     * @request GET:/api/v1/allowed-block-periods/
     * @secure
     */
    apiV1AllowedBlockPeriodsList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAllowedBlockPeriodResponseList, any>({
        path: `/api/v1/allowed-block-periods/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create allowed block period (Staff only)
     *
     * @tags api
     * @name ApiV1AllowedBlockPeriodsCreate
     * @request POST:/api/v1/allowed-block-periods/
     * @secure
     */
    apiV1AllowedBlockPeriodsCreate: (data: CreateAllowedBlockPeriodRequest, params: RequestParams = {}) =>
      this.request<AllowedBlockPeriodResponse, void>({
        path: `/api/v1/allowed-block-periods/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete allowed block period
     *
     * @tags api
     * @name ApiV1AllowedBlockPeriodsDestroy
     * @request DELETE:/api/v1/allowed-block-periods/{id}/
     * @secure
     */
    apiV1AllowedBlockPeriodsDestroy: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/v1/allowed-block-periods/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description List available periods where schools can create blocks (respects minimum advance days)
     *
     * @tags api
     * @name ApiV1AllowedBlockPeriodsAvailableList
     * @request GET:/api/v1/allowed-block-periods/available/
     * @secure
     */
    apiV1AllowedBlockPeriodsAvailableList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAllowedBlockPeriodResponseList, any>({
        path: `/api/v1/allowed-block-periods/available/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1AppShortUrlsList
     * @request GET:/api/v1/app/short_urls/
     * @secure
     */
    apiV1AppShortUrlsList: (
      query: {
        /** @minLength 1 */
        hash: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UrlShortenerResponse[], any>({
        path: `/api/v1/app/short_urls/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeCsdCreate
     * @request POST:/api/v1/backoffice/csd/
     * @secure
     */
    apiV1BackofficeCsdCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/csd/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeFiscalEntitiesRetrieve
     * @request GET:/api/v1/backoffice/fiscal_entities/
     * @secure
     */
    apiV1BackofficeFiscalEntitiesRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/fiscal_entities/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeGatewayCredentialsRetrieve
     * @request GET:/api/v1/backoffice/gateway_credentials/
     * @secure
     */
    apiV1BackofficeGatewayCredentialsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/gateway_credentials/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Cancel batch of invoices
     *
     * @tags api
     * @name ApiV1BackofficeInvoicingCancelInvoicesCreate
     * @request POST:/api/v1/backoffice/invoicing/cancel_invoices/
     * @secure
     */
    apiV1BackofficeInvoicingCancelInvoicesCreate: (data: InvoiceRequestDTO, params: RequestParams = {}) =>
      this.request<AsyncInvoiceResponseDTO, any>({
        path: `/api/v1/backoffice/invoicing/cancel_invoices/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generate batch of invoices
     *
     * @tags api
     * @name ApiV1BackofficeInvoicingGenerateInvoicesCreate
     * @request POST:/api/v1/backoffice/invoicing/generate_invoices/
     * @secure
     */
    apiV1BackofficeInvoicingGenerateInvoicesCreate: (data: InvoiceRequestDTO, params: RequestParams = {}) =>
      this.request<AsyncInvoiceResponseDTO, any>({
        path: `/api/v1/backoffice/invoicing/generate_invoices/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Re-emit batch of invoices with relation
     *
     * @tags api
     * @name ApiV1BackofficeInvoicingReEmitInvoicesCreate
     * @request POST:/api/v1/backoffice/invoicing/re_emit_invoices/
     * @secure
     */
    apiV1BackofficeInvoicingReEmitInvoicesCreate: (data: InvoiceRequestDTO, params: RequestParams = {}) =>
      this.request<AsyncInvoiceResponseDTO, any>({
        path: `/api/v1/backoffice/invoicing/re_emit_invoices/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Repair individual invoice by syncing with Facturama
     *
     * @tags api
     * @name ApiV1BackofficeInvoicingRepairCreate
     * @request POST:/api/v1/backoffice/invoicing/repair/
     * @secure
     */
    apiV1BackofficeInvoicingRepairCreate: (data: RepairInvoiceRequestDTO, params: RequestParams = {}) =>
      this.request<RepairInvoiceResponseDTO, any>({
        path: `/api/v1/backoffice/invoicing/repair/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Annul pending or failed invoices (deletes invoice and sets invoice_requested=False)
     *
     * @tags api
     * @name ApiV1BackofficeMassiveInvoiceRetryAnnulInvoicesCreate
     * @request POST:/api/v1/backoffice/massive-invoice-retry/annul_invoices/
     * @secure
     */
    apiV1BackofficeMassiveInvoiceRetryAnnulInvoicesCreate: (data: AnnulInvoiceRequestDTO, params: RequestParams = {}) =>
      this.request<AnnulInvoiceResponseDTO, any>({
        path: `/api/v1/backoffice/massive-invoice-retry/annul_invoices/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description A list of all fail invoices.
     *
     * @tags api
     * @name ApiV1BackofficeMassiveInvoiceRetryFailedInvoicesCreate
     * @request POST:/api/v1/backoffice/massive-invoice-retry/failed_invoices/
     * @secure
     */
    apiV1BackofficeMassiveInvoiceRetryFailedInvoicesCreate: (
      data: InvoiceMassiveRetryRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<FailedInvoiceResponseDTO[], any>({
        path: `/api/v1/backoffice/massive-invoice-retry/failed_invoices/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description A list of all fiscal entities.
     *
     * @tags api
     * @name ApiV1BackofficeMassiveInvoiceRetryFiscalEntitiesList
     * @request GET:/api/v1/backoffice/massive-invoice-retry/fiscal_entities/
     * @secure
     */
    apiV1BackofficeMassiveInvoiceRetryFiscalEntitiesList: (
      query?: {
        /** @minLength 1 */
        tax_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<FiscalEntityResponseDTO[], any>({
        path: `/api/v1/backoffice/massive-invoice-retry/fiscal_entities/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description execute massive retry in fail invoices.
     *
     * @tags api
     * @name ApiV1BackofficeMassiveInvoiceRetryMassiveRetryCreate
     * @request POST:/api/v1/backoffice/massive-invoice-retry/massive_retry/
     * @secure
     */
    apiV1BackofficeMassiveInvoiceRetryMassiveRetryCreate: (
      data: InvoiceMassiveRetryRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/massive-invoice-retry/massive_retry/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Update a membership
     *
     * @tags api
     * @name ApiV1BackofficeMembershipsUpdateMembershipUpdate
     * @request PUT:/api/v1/backoffice/memberships/{id}/update_membership/
     * @secure
     */
    apiV1BackofficeMembershipsUpdateMembershipUpdate: (
      id: string,
      data: MembershipRequestDto,
      params: RequestParams = {}
    ) =>
      this.request<MembershipResponseDto, any>({
        path: `/api/v1/backoffice/memberships/${id}/update_membership/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List PayinFulfillments without Payouts with pagination. Returns a paginated list of payments that don't have an associated Payout, along with the reason why they don't have one.
     *
     * @tags api
     * @name ApiV1BackofficePayinFulfillmentsList
     * @request GET:/api/v1/backoffice/payin-fulfillments/
     * @secure
     */
    apiV1BackofficePayinFulfillmentsList: (
      query?: {
        /** Filter by payin correlative_id (partial match) */
        correlative_id?: string;
        /** Filter by invoice_requested flag (true/false) */
        invoice_requested?: boolean;
        /** Page number */
        page?: number;
        /** Number of items per page (default: 50) */
        page_size?: number;
        /**
         * Filter by payin ID
         * @format uuid
         */
        payin_id?: string;
        /**
         * Filter by school ID
         * @format uuid
         */
        school_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PayinFulfillmentListResponse[], any>({
        path: `/api/v1/backoffice/payin-fulfillments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinCredentialsCreate
     * @request POST:/api/v1/backoffice/payin_credentials/
     * @secure
     */
    apiV1BackofficePayinCredentialsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/payin_credentials/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsList
     * @request GET:/api/v1/backoffice/payins/
     * @secure
     */
    apiV1BackofficePayinsList: (
      query?: {
        /** check if payin has been collected at school */
        collected_at_school?: boolean;
        /** correlative id of payin */
        correlative_id?: string;
        /** check if payin has associated fulfillments */
        has_fulfillments?: boolean;
        /** check if payin has an associated transaction at school */
        has_transaction?: boolean;
        /** limit result size */
        limit?: number;
        /** status of payin */
        status?: string;
        /** ticket number of payin transaction */
        ticket_number?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>[], any>({
        path: `/api/v1/backoffice/payins/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberList
     * @request GET:/api/v1/backoffice/payins/assign_ticket_number/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberList: (
      query?: {
        /** check if payin has been collected at school */
        collected_at_school?: boolean;
        /** correlative id of payin */
        correlative_id?: string;
        /** check if payin has associated fulfillments */
        has_fulfillments?: boolean;
        /** check if payin has an associated transaction at school */
        has_transaction?: boolean;
        /** limit result size */
        limit?: number;
        /** status of payin */
        status?: string;
        /** ticket number of payin transaction */
        ticket_number?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>[], any>({
        path: `/api/v1/backoffice/payins/assign_ticket_number/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberCreate
     * @request POST:/api/v1/backoffice/payins/assign_ticket_number/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberCreate: (
      data: PayinAssignTransactionRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/assign_ticket_number/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberAssignTicketNumberCreate
     * @request POST:/api/v1/backoffice/payins/assign_ticket_number/assign_ticket_number/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberAssignTicketNumberCreate: (
      data: PayinAssignTransactionRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/assign_ticket_number/assign_ticket_number/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cancel a pending payin. Only payins with 'pending' status can be canceled.
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberCancelPendingPayinCreate
     * @request POST:/api/v1/backoffice/payins/assign_ticket_number/cancel_pending_payin/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberCancelPendingPayinCreate: (
      data: PayinCancelRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          /** @format uuid */
          id?: string;
          correlative_id?: string;
          status?: string;
          modified_by?: string;
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/assign_ticket_number/cancel_pending_payin/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberRedirectPayinCreate
     * @request POST:/api/v1/backoffice/payins/assign_ticket_number/redirect_payin/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberRedirectPayinCreate: (
      data: PayinRedirectRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/assign_ticket_number/redirect_payin/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Regenerate Kushki ticket number for a pending payin. Creates a new ticket/reference number for OXXO (cash-in) or bank transfer payments. Only works for Kushki payins that are not yet paid and not manual.
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberRegenerateTicketNumberCreate
     * @request POST:/api/v1/backoffice/payins/assign_ticket_number/regenerate_ticket_number/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberRegenerateTicketNumberCreate: (
      data: PayinRegenerateTicketRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          /** @format uuid */
          id?: string;
          correlative_id?: string;
          ticket_number?: string;
          /** @format uuid */
          transaction_id?: string;
          /** @format uuid */
          old_transaction_id?: string;
          payin_type?: string;
          modified_by?: string;
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/assign_ticket_number/regenerate_ticket_number/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsAssignTicketNumberSyncPayinCreate
     * @request POST:/api/v1/backoffice/payins/assign_ticket_number/sync_payin/
     * @secure
     */
    apiV1BackofficePayinsAssignTicketNumberSyncPayinCreate: (data: PayinSyncRequestDTO, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/assign_ticket_number/sync_payin/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cancel a pending payin. Only payins with 'pending' status can be canceled.
     *
     * @tags api
     * @name ApiV1BackofficePayinsCancelPendingPayinCreate
     * @request POST:/api/v1/backoffice/payins/cancel_pending_payin/
     * @secure
     */
    apiV1BackofficePayinsCancelPendingPayinCreate: (data: PayinCancelRequestDTO, params: RequestParams = {}) =>
      this.request<
        {
          /** @format uuid */
          id?: string;
          correlative_id?: string;
          status?: string;
          modified_by?: string;
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/cancel_pending_payin/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsRedirectPayinCreate
     * @request POST:/api/v1/backoffice/payins/redirect_payin/
     * @secure
     */
    apiV1BackofficePayinsRedirectPayinCreate: (data: PayinRedirectRequestDTO, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/redirect_payin/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Regenerate Kushki ticket number for a pending payin. Creates a new ticket/reference number for OXXO (cash-in) or bank transfer payments. Only works for Kushki payins that are not yet paid and not manual.
     *
     * @tags api
     * @name ApiV1BackofficePayinsRegenerateTicketNumberCreate
     * @request POST:/api/v1/backoffice/payins/regenerate_ticket_number/
     * @secure
     */
    apiV1BackofficePayinsRegenerateTicketNumberCreate: (
      data: PayinRegenerateTicketRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          /** @format uuid */
          id?: string;
          correlative_id?: string;
          ticket_number?: string;
          /** @format uuid */
          transaction_id?: string;
          /** @format uuid */
          old_transaction_id?: string;
          payin_type?: string;
          modified_by?: string;
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/regenerate_ticket_number/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayinsSyncPayinCreate
     * @request POST:/api/v1/backoffice/payins/sync_payin/
     * @secure
     */
    apiV1BackofficePayinsSyncPayinCreate: (data: PayinSyncRequestDTO, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/payins/sync_payin/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List Payouts with SCHEDULED or DECLINED status. Returns a paginated list of payouts that are scheduled or declined, with basic information about the school, bank account, and amounts.
     *
     * @tags api
     * @name ApiV1BackofficePayoutManagementList
     * @request GET:/api/v1/backoffice/payout-management/
     * @secure
     */
    apiV1BackofficePayoutManagementList: (
      query?: {
        /** Filter by payout correlative_id (partial match) */
        correlative_id?: string;
        /** Page number */
        page?: number;
        /** Number of items per page (default: 50) */
        page_size?: number;
        /**
         * Filter by school ID
         * @format uuid
         */
        school_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PayoutManagementListResponse[], any>({
        path: `/api/v1/backoffice/payout-management/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get detailed information about a specific Payout.
     *
     * @tags api
     * @name ApiV1BackofficePayoutManagementRetrieve
     * @request GET:/api/v1/backoffice/payout-management/{id}/
     * @secure
     */
    apiV1BackofficePayoutManagementRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/payout-management/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description List all active bank accounts for the school associated with the payout.
     *
     * @tags api
     * @name ApiV1BackofficePayoutManagementBankAccountsRetrieve
     * @request GET:/api/v1/backoffice/payout-management/{id}/bank-accounts/
     * @secure
     */
    apiV1BackofficePayoutManagementBankAccountsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v1/backoffice/payout-management/${id}/bank-accounts/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Change the bank account associated with a payout.
     *
     * @tags api
     * @name ApiV1BackofficePayoutManagementChangeBankAccountUpdate
     * @request PUT:/api/v1/backoffice/payout-management/{id}/change-bank-account/
     * @secure
     */
    apiV1BackofficePayoutManagementChangeBankAccountUpdate: (
      id: string,
      data: ChangeBankAccountRequest,
      params: RequestParams = {}
    ) =>
      this.request<PayoutDetailResponse, any>({
        path: `/api/v1/backoffice/payout-management/${id}/change-bank-account/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Execute a single payout immediately. This will process the payout through the payment gateway (Kushki). The user must confirm this action in the frontend before calling this endpoint.
     *
     * @tags api
     * @name ApiV1BackofficePayoutManagementExecuteCreate
     * @request POST:/api/v1/backoffice/payout-management/{id}/execute/
     * @secure
     */
    apiV1BackofficePayoutManagementExecuteCreate: (id: string, params: RequestParams = {}) =>
      this.request<ExecutePayoutResponse, any>({
        path: `/api/v1/backoffice/payout-management/${id}/execute/`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Set a bank holiday and reschedule all SCHEDULED and DECLINED payouts from that date to the next available weekday. This endpoint will: 1. Find all payouts scheduled for the holiday date 2. Reschedule them to the next available weekday (Mon-Fri) 3. Set their status to SCHEDULED
     *
     * @tags api
     * @name ApiV1BackofficePayoutManagementBankHolidayCreate
     * @request POST:/api/v1/backoffice/payout-management/bank-holiday/
     * @secure
     */
    apiV1BackofficePayoutManagementBankHolidayCreate: (data: BankHolidayRequest, params: RequestParams = {}) =>
      this.request<BankHolidayResponse, any>({
        path: `/api/v1/backoffice/payout-management/bank-holiday/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayoutCredentialsCreate
     * @request POST:/api/v1/backoffice/payout_credentials/
     * @secure
     */
    apiV1BackofficePayoutCredentialsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/payout_credentials/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayoutsList
     * @request GET:/api/v1/backoffice/payouts/
     * @secure
     */
    apiV1BackofficePayoutsList: (
      query?: {
        /** correlative id of payout */
        correlative_id?: string;
        /** status of payout */
        status?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>[], any>({
        path: `/api/v1/backoffice/payouts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayoutsRetrieve
     * @request GET:/api/v1/backoffice/payouts/{id}/
     * @secure
     */
    apiV1BackofficePayoutsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/payouts/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficePayoutsRegisterPayoutBalanceCreate
     * @request POST:/api/v1/backoffice/payouts/register_payout_balance/
     * @secure
     */
    apiV1BackofficePayoutsRegisterPayoutBalanceCreate: (
      data: CreatePayoutBalanceRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/payouts/register_payout_balance/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsRetrieve
     * @request GET:/api/v1/backoffice/schools/
     * @secure
     */
    apiV1BackofficeSchoolsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/schools/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Get commissions schema configuration for a school
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsCommissionsRetrieve
     * @request GET:/api/v1/backoffice/schools/{school_id}/commissions/
     * @secure
     */
    apiV1BackofficeSchoolsCommissionsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<CommissionsSchemaResponseDTO, any>({
        path: `/api/v1/backoffice/schools/${schoolId}/commissions/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update commissions schema configuration for a school
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsCommissionsUpdate
     * @request PUT:/api/v1/backoffice/schools/{school_id}/commissions/
     * @secure
     */
    apiV1BackofficeSchoolsCommissionsUpdate: (
      schoolId: string,
      data: CommissionsSchemaRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<CommissionsSchemaUpdateResponseDTO, CommissionsUpdateErrorResponse | SchoolNotFoundResponse>({
        path: `/api/v1/backoffice/schools/${schoolId}/commissions/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsConfigsUpdate
     * @request PUT:/api/v1/backoffice/schools/{school_id}/configs/
     * @secure
     */
    apiV1BackofficeSchoolsConfigsUpdate: (schoolId: string, data: UpdateSchoolConfigDTO, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/schools/${schoolId}/configs/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description List fulfillments for a school, optionally filtered by guardian and status
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsFulfillmentsList
     * @request GET:/api/v1/backoffice/schools/{school_id}/fulfillments/
     * @secure
     */
    apiV1BackofficeSchoolsFulfillmentsList: (
      schoolId: string,
      query?: {
        /**
         * Filter fulfillments by guardian ID
         * @format uuid
         */
        guardian_id?: string;
        /** Filter fulfillments by status (e.g., NOT_PAID, PARTIAL_PAID, PAID) */
        status?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<FulfillmentResponseDTO[], any>({
        path: `/api/v1/backoffice/schools/${schoolId}/fulfillments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get fulfillments by correlative ids
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsFulfillmentsByCorrelativeGetFulfillmentsCreate
     * @request POST:/api/v1/backoffice/schools/{school_id}/fulfillments-by-correlative/get_fulfillments/
     * @secure
     */
    apiV1BackofficeSchoolsFulfillmentsByCorrelativeGetFulfillmentsCreate: (
      schoolId: string,
      data: FulfillmentRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<FulfillmentResponseDTO[], any>({
        path: `/api/v1/backoffice/schools/${schoolId}/fulfillments-by-correlative/get_fulfillments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsGuardianCreditProfileRetrieve
     * @request GET:/api/v1/backoffice/schools/{school_id}/guardian-credit-profile/
     * @secure
     */
    apiV1BackofficeSchoolsGuardianCreditProfileRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/schools/${schoolId}/guardian-credit-profile/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsGuardianCreditProfileCreate
     * @request POST:/api/v1/backoffice/schools/{school_id}/guardian-credit-profile/
     * @secure
     */
    apiV1BackofficeSchoolsGuardianCreditProfileCreate: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/schools/${schoolId}/guardian-credit-profile/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsGuardiansRetrieve
     * @request GET:/api/v1/backoffice/schools/{school_id}/guardians/
     * @secure
     */
    apiV1BackofficeSchoolsGuardiansRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/schools/${schoolId}/guardians/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsIntegrationsMassiveSyncCreate
     * @request POST:/api/v1/backoffice/schools/{school_id}/integrations/massive_sync/
     * @secure
     */
    apiV1BackofficeSchoolsIntegrationsMassiveSyncCreate: (
      schoolId: string,
      data: SyncRequest,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/schools/${schoolId}/integrations/massive_sync/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsIntegrationsSingleSyncCreate
     * @request POST:/api/v1/backoffice/schools/{school_id}/integrations/single_sync/
     * @secure
     */
    apiV1BackofficeSchoolsIntegrationsSingleSyncCreate: (
      schoolId: string,
      data: SingleSyncRequest,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/v1/backoffice/schools/${schoolId}/integrations/single_sync/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsMembersRetrieve
     * @request GET:/api/v1/backoffice/schools/{school_id}/members/
     * @secure
     */
    apiV1BackofficeSchoolsMembersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/backoffice/schools/${schoolId}/members/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description List orders for a school, filtered by optional status and/or guardian
     *
     * @tags api
     * @name ApiV1BackofficeSchoolsOrdersList
     * @request GET:/api/v1/backoffice/schools/{school_id}/orders/
     * @secure
     */
    apiV1BackofficeSchoolsOrdersList: (
      schoolId: string,
      query?: {
        /**
         * Filter orders by guardian ID
         * @format uuid
         */
        guardian_id?: string;
        /** Filter by optional orders (true for optional orders) */
        optional?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<OptionalOrderResponseDTO[], any>({
        path: `/api/v1/backoffice/schools/${schoolId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Obtiene metadatos de los filtros disponibles
     *
     * @tags Guardian ViewSet for communications
     * @name ApiV1CommunicationsGuardiansFiltersMetadataRetrieve
     * @request GET:/api/v1/communications/guardians/filters-metadata/
     * @secure
     */
    apiV1CommunicationsGuardiansFiltersMetadataRetrieve: (params: RequestParams = {}) =>
      this.request<ListGuardianFiltersMetadataDTO, any>({
        path: `/api/v1/communications/guardians/filters-metadata/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1CommunicationsGuardiansGetGuardiansCreate
     * @request POST:/api/v1/communications/guardians/get_guardians/
     * @secure
     */
    apiV1CommunicationsGuardiansGetGuardiansCreate: (data: ListGuardianResponseDTO, params: RequestParams = {}) =>
      this.request<ListGuardianResponseDTO, any>({
        path: `/api/v1/communications/guardians/get_guardians/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsRetrieve
     * @request GET:/api/v1/dashboard/concepts/
     * @secure
     */
    apiV1DashboardConceptsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsCreate
     * @request POST:/api/v1/dashboard/concepts/
     * @secure
     */
    apiV1DashboardConceptsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsOrdersList
     * @request GET:/api/v1/dashboard/concepts/{concept_id}/orders/
     * @secure
     */
    apiV1DashboardConceptsOrdersList: (
      conceptId: string,
      query?: {
        bank_account?: string;
        multiple_search?: string;
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        optional?: boolean;
        /** Ordering */
        ordering?: (
          | '-last_order_price'
          | '-name'
          | '-school_cycle_name'
          | '-students_assigned_count'
          | '-type'
          | 'last_order_price'
          | 'name'
          | 'school_cycle_name'
          | 'students_assigned_count'
          | 'type'
        )[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedOrderList, any>({
        path: `/api/v1/dashboard/concepts/${conceptId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsOrdersUpdate
     * @request PUT:/api/v1/dashboard/concepts/{concept_id}/orders/{id}/
     * @secure
     */
    apiV1DashboardConceptsOrdersUpdate: (conceptId: string, id: string, data: Order, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/v1/dashboard/concepts/${conceptId}/orders/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsOrdersPartialUpdate
     * @request PATCH:/api/v1/dashboard/concepts/{concept_id}/orders/{id}/
     * @secure
     */
    apiV1DashboardConceptsOrdersPartialUpdate: (
      conceptId: string,
      id: string,
      data: PatchedOrder,
      params: RequestParams = {}
    ) =>
      this.request<Order, any>({
        path: `/api/v1/dashboard/concepts/${conceptId}/orders/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsOrdersDestroy
     * @request DELETE:/api/v1/dashboard/concepts/{concept_id}/orders/{id}/
     * @secure
     */
    apiV1DashboardConceptsOrdersDestroy: (conceptId: string, id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/${conceptId}/orders/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsRetrieve2
     * @request GET:/api/v1/dashboard/concepts/{id}/
     * @secure
     */
    apiV1DashboardConceptsRetrieve2: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsUpdate
     * @request PUT:/api/v1/dashboard/concepts/{id}/
     * @secure
     */
    apiV1DashboardConceptsUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/${id}/`,
        method: 'PUT',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsPartialUpdate
     * @request PATCH:/api/v1/dashboard/concepts/{id}/
     * @secure
     */
    apiV1DashboardConceptsPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsDestroy
     * @request DELETE:/api/v1/dashboard/concepts/{id}/
     * @secure
     */
    apiV1DashboardConceptsDestroy: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Get all distinct product keys (tax codes) for concepts
     *
     * @tags api
     * @name ApiV1DashboardConceptsProductKeysList
     * @request GET:/api/v1/dashboard/concepts/product_keys/
     * @secure
     */
    apiV1DashboardConceptsProductKeysList: (
      query?: {
        /** Input string to be echoed back */
        input?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProductServiceCatalog[], ProductServiceCatalogError>({
        path: `/api/v1/dashboard/concepts/product_keys/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all distinct tax units for concepts
     *
     * @tags api
     * @name ApiV1DashboardConceptsTaxUnitsRetrieve
     * @request GET:/api/v1/dashboard/concepts/tax_units/
     * @secure
     */
    apiV1DashboardConceptsTaxUnitsRetrieve: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/api/v1/dashboard/concepts/tax_units/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Obtiene una lista de tutores que cumplen con los filtros especificados.
     *
     * @tags api
     * @name ApiV1DashboardGuardiansList
     * @request GET:/api/v1/dashboard/guardians/
     * @secure
     */
    apiV1DashboardGuardiansList: (
      query?: {
        block_cash_payments?: boolean;
        /**
         * @format email
         * @minLength 1
         */
        email?: string;
        /** @minLength 1 */
        email__icontains?: string;
        /** @minLength 1 */
        first_name__icontains?: string;
        /** @minLength 1 */
        last_name__icontains?: string;
        /** @minLength 1 */
        phone?: string;
        /** @format uuid */
        school_id?: string;
        /** @minLength 1 */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<GuardianResponse[], any>({
        path: `/api/v1/dashboard/guardians/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansFulfillmentsList
     * @request GET:/api/v1/dashboard/guardians/{guardian_id}/fulfillments/
     * @secure
     */
    apiV1DashboardGuardiansFulfillmentsList: (
      guardianId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        due_status?: 'future' | 'outstanding';
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | 'due')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school?: string;
        /** @format uuid */
        school_cycle?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardDependentFulfillmentList, any>({
        path: `/api/v1/dashboard/guardians/${guardianId}/fulfillments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansFulfillmentsColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/guardians/{guardian_id}/fulfillments/columns/
     * @secure
     */
    apiV1DashboardGuardiansFulfillmentsColumnsRetrieve: (guardianId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/guardians/${guardianId}/fulfillments/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansFulfillmentsXlsV2Create
     * @request POST:/api/v1/dashboard/guardians/{guardian_id}/fulfillments/xls_v2/
     * @secure
     */
    apiV1DashboardGuardiansFulfillmentsXlsV2Create: (
      guardianId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        due_status?: 'future' | 'outstanding';
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | 'due')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school?: string;
        /** @format uuid */
        school_cycle?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/guardians/${guardianId}/fulfillments/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansOptionalOrdersList
     * @request GET:/api/v1/dashboard/guardians/{guardian_id}/optional-orders/
     * @secure
     */
    apiV1DashboardGuardiansOptionalOrdersList: (
      guardianId: string,
      query?: {
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        /** Ordering */
        ordering?: ('-price' | '-sold_units' | '-stock' | 'price' | 'sold_units' | 'stock')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** @format uuid */
        school?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedGuardianDependentOrderList, any>({
        path: `/api/v1/dashboard/guardians/${guardianId}/optional-orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansOrdersList
     * @request GET:/api/v1/dashboard/guardians/{guardian_id}/orders/
     * @secure
     */
    apiV1DashboardGuardiansOrdersList: (
      guardianId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardDependentOrderList, any>({
        path: `/api/v1/dashboard/guardians/${guardianId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Actualiza campos del tutor. Actualmente soporta block_cash_payments.
     *
     * @tags api
     * @name ApiV1DashboardGuardiansUpdatePartialUpdate
     * @request PATCH:/api/v1/dashboard/guardians/{guardian_id}/update/
     * @secure
     */
    apiV1DashboardGuardiansUpdatePartialUpdate: (
      guardianId: string,
      data: PatchedUpdateGuardianRequest,
      params: RequestParams = {}
    ) =>
      this.request<GuardianResponse, any>({
        path: `/api/v1/dashboard/guardians/${guardianId}/update/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansRetrieve
     * @request GET:/api/v1/dashboard/guardians/{id}/
     * @secure
     */
    apiV1DashboardGuardiansRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<DashboardGuardian, any>({
        path: `/api/v1/dashboard/guardians/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansUpdate
     * @request PUT:/api/v1/dashboard/guardians/{id}/
     * @secure
     */
    apiV1DashboardGuardiansUpdate: (id: string, data: DashboardGuardianSlim, params: RequestParams = {}) =>
      this.request<DashboardGuardianSlim, any>({
        path: `/api/v1/dashboard/guardians/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansPartialUpdate
     * @request PATCH:/api/v1/dashboard/guardians/{id}/
     * @secure
     */
    apiV1DashboardGuardiansPartialUpdate: (
      id: string,
      data: PatchedDashboardGuardianSlim,
      params: RequestParams = {}
    ) =>
      this.request<DashboardGuardianSlim, any>({
        path: `/api/v1/dashboard/guardians/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansOutboundCreate
     * @request POST:/api/v1/dashboard/guardians/{id}/outbound/
     * @secure
     */
    apiV1DashboardGuardiansOutboundCreate: (
      id: string,
      data: DashboardGuardianSendOutboundRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<
        PatchedDashboardGuardianSendOutboundResponseDTO,
        {
          error?: string;
        }
      >({
        path: `/api/v1/dashboard/guardians/${id}/outbound/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardGuardiansVerifyGuardiansCreate
     * @request POST:/api/v1/dashboard/guardians/verify_guardians/
     * @secure
     */
    apiV1DashboardGuardiansVerifyGuardiansCreate: (data: GuardianFacturamaValidateIds, params: RequestParams = {}) =>
      this.request<GuardianFacturamaValidated[], any>({
        path: `/api/v1/dashboard/guardians/verify_guardians/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardReportsExcelRetrieve
     * @request GET:/api/v1/dashboard/reports/excel/{id}/
     * @secure
     */
    apiV1DashboardReportsExcelRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/reports/excel/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardReportsZipRetrieve
     * @request GET:/api/v1/dashboard/reports/zip/{id}/
     * @secure
     */
    apiV1DashboardReportsZipRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/reports/zip/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsList
     * @request GET:/api/v1/dashboard/schools/
     * @secure
     */
    apiV1DashboardSchoolsList: (params: RequestParams = {}) =>
      this.request<DashboardSchool[], any>({
        path: `/api/v1/dashboard/schools/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsRetrieve
     * @request GET:/api/v1/dashboard/schools/{id}/
     * @secure
     */
    apiV1DashboardSchoolsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<DashboardSchoolWithStudents, any>({
        path: `/api/v1/dashboard/schools/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update school information including logo upload
     *
     * @tags api
     * @name SchoolsUpdate
     * @request PUT:/api/v1/dashboard/schools/{id}/
     * @secure
     */
    schoolsUpdate: (id: string, data: DashboardSchoolUpdate, params: RequestParams = {}) =>
      this.request<DashboardSchoolUpdate, any>({
        path: `/api/v1/dashboard/schools/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partially update school information including logo upload
     *
     * @tags api
     * @name SchoolsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{id}/
     * @secure
     */
    schoolsPartialUpdate: (id: string, data: PatchedDashboardSchoolUpdate, params: RequestParams = {}) =>
      this.request<DashboardSchoolUpdate, any>({
        path: `/api/v1/dashboard/schools/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsResumeRetrieve
     * @request GET:/api/v1/dashboard/schools/{id}/resume/
     * @secure
     */
    apiV1DashboardSchoolsResumeRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<DashboardSchoolFilters, any>({
        path: `/api/v1/dashboard/schools/${id}/resume/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/admins/
     * @secure
     */
    apiV1DashboardSchoolsAdminsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedBaseAdminList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/admins/
     * @secure
     */
    apiV1DashboardSchoolsAdminsCreate: (schoolId: string, data: CreateAdmin, params: RequestParams = {}) =>
      this.request<CreateAdmin, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/admins/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAdminsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DetailAdmin, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/admins/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAdminsUpdate: (id: string, schoolId: string, data: DetailAdmin, params: RequestParams = {}) =>
      this.request<DetailAdmin, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/admins/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAdminsPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedDetailAdmin,
      params: RequestParams = {}
    ) =>
      this.request<DetailAdmin, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/admins/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAdminsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags unused
     * @name ApiV1DashboardSchoolsAdminsPermissionsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/admins/{id}/permissions/
     * @secure
     */
    apiV1DashboardSchoolsAdminsPermissionsUpdate: (
      id: string,
      schoolId: string,
      data: Membership,
      params: RequestParams = {}
    ) =>
      this.request<Membership, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/${id}/permissions/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsMeRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/admins/me/
     * @secure
     */
    apiV1DashboardSchoolsAdminsMeRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<DetailAdmin, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/admins/me/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAttributesList
     * @request GET:/api/v1/dashboard/schools/{school_id}/attributes/
     * @secure
     */
    apiV1DashboardSchoolsAttributesList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAttributesList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/attributes/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAttributesCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/attributes/
     * @secure
     */
    apiV1DashboardSchoolsAttributesCreate: (schoolId: string, data: Attributes, params: RequestParams = {}) =>
      this.request<Attributes, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/attributes/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAttributesRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/attributes/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAttributesRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<Attributes, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/attributes/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAttributesUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/attributes/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAttributesUpdate: (
      id: string,
      schoolId: string,
      data: Attributes,
      params: RequestParams = {}
    ) =>
      this.request<Attributes, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/attributes/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAttributesPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/attributes/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAttributesPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedAttributes,
      params: RequestParams = {}
    ) =>
      this.request<Attributes, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/attributes/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsAttributesDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/attributes/{id}/
     * @secure
     */
    apiV1DashboardSchoolsAttributesDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/attributes/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsBankAccountsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/bank_accounts/
     * @secure
     */
    apiV1DashboardSchoolsBankAccountsList: (
      schoolId: string,
      query?: {
        /** Filter by archived status */
        archived?: boolean;
        /** Ordering */
        ordering?: ('-id' | 'id')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSlimBankAccountList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new bank account for the school. Only staff users can create bank accounts.
     *
     * @tags api
     * @name BankAccountsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/bank_accounts/
     * @secure
     */
    bankAccountsCreate: (schoolId: string, data: SlimBankAccount, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsBankAccountsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/bank_accounts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsBankAccountsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<SlimBankAccount, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsBankAccountsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/bank_accounts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsBankAccountsUpdate: (
      id: string,
      schoolId: string,
      data: SlimBankAccount,
      params: RequestParams = {}
    ) =>
      this.request<SlimBankAccount, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Archive or unarchive a bank account. Only users with appropriate permissions can modify bank accounts.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsBankAccountsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/bank_accounts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsBankAccountsPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedSlimBankAccount,
      params: RequestParams = {}
    ) =>
      this.request<SlimBankAccount, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsBankAccountsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/bank_accounts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsBankAccountsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Reassign concepts and payout configs by category to target bank accounts. To reassign all concepts to a single bank account, include all concept types with the same target.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsBankAccountsReassignCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/bank_accounts/{id}/reassign/
     * @secure
     */
    apiV1DashboardSchoolsBankAccountsReassignCreate: (
      id: string,
      schoolId: string,
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<
        {
          success?: boolean;
          message?: string;
          summary?: {
            concepts_updated?: number;
            payout_configs_updated?: number;
            source_bank_account_id?: string;
            reassignments?: {
              target_bank_account_id?: string;
              concepts_updated?: number;
              payout_configs_updated?: number;
            }[];
          };
        },
        any
      >({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/${id}/reassign/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve the paginated history of all bank account changes for a school including reassignments, deactivations, and deletions. Returns 50 entries per page by default.
     *
     * @tags api
     * @name BankAccountsHistoryList
     * @request GET:/api/v1/dashboard/schools/{school_id}/bank_accounts/history/
     * @secure
     */
    bankAccountsHistoryList: (
      schoolId: string,
      query?: {
        /** Filter by archived status */
        archived?: boolean;
        /** Ordering */
        ordering?: ('-id' | 'id')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedBankAccountHistoryList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/bank_accounts/history/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionEfficiencyColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/collection_efficiency/columns/
     * @secure
     */
    apiV1DashboardSchoolsCollectionEfficiencyColumnsRetrieve: (
      schoolId: string,
      query?: {
        concept_types?: BaseEnum[];
        concepts?: ConceptSmall[];
        school_cycle?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collection_efficiency/columns/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionEfficiencyXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/collection_efficiency/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsCollectionEfficiencyXlsV2Create: (
      schoolId: string,
      query?: {
        concept_types?: BaseEnum[];
        concepts?: ConceptSmall[];
        school_cycle?: string;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collection_efficiency/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/collections/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSlimStudentSerializerV2List, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collections/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/collections/{id}/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<SlimStudentSerializerV2, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collections/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionsConceptTypesRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/collections/concept_types/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsConceptTypesRetrieve: (
      schoolId: string,
      query: {
        /** School Cycle */
        school_cycle: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ConceptTypes[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collections/concept_types/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionsGraphicCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/collections/graphic/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsGraphicCreate: (
      schoolId: string,
      data: CollectionsGraphicRequest,
      params: RequestParams = {}
    ) =>
      this.request<CollectionsGraphicResponse[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collections/graphic/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCollectionsTableRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/collections/table/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsTableRetrieve: (
      schoolId: string,
      query: {
        /** Concepts */
        concepts: string;
        /** Month */
        month: number;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** School Cycle */
        school_cycle: string;
        /** Year */
        year: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSlimStudentList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collections/table/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School Concept ViewSet
     * @name ApiV1DashboardSchoolsConceptsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/
     * @secure
     */
    apiV1DashboardSchoolsConceptsList: (
      schoolId: string,
      query?: {
        bank_account?: string;
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        optional?: boolean;
        /** Ordering */
        ordering?: (
          | '-last_order_price'
          | '-name'
          | '-school_cycle_name'
          | '-students_assigned_count'
          | '-type'
          | 'last_order_price'
          | 'name'
          | 'school_cycle_name'
          | 'students_assigned_count'
          | 'type'
        )[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** Type of the concept. */
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseConcept[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/concepts/
     * @secure
     */
    apiV1DashboardSchoolsConceptsCreate: (schoolId: string, data: CreateConcept, params: RequestParams = {}) =>
      this.request<CreateConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags ConceptAvailability by Concept Controller
     * @name ApiV1DashboardSchoolsConceptsConceptAutoAssignList
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/{concept_id}/concept_auto_assign/
     * @secure
     */
    apiV1DashboardSchoolsConceptsConceptAutoAssignList: (
      conceptId: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<ListConceptAutoAssignResponseDTO[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${conceptId}/concept_auto_assign/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags ConceptAvailability by Concept Controller
     * @name ApiV1DashboardSchoolsConceptsConceptAutoAssignCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/concepts/{concept_id}/concept_auto_assign/
     * @secure
     */
    apiV1DashboardSchoolsConceptsConceptAutoAssignCreate: (
      conceptId: string,
      schoolId: string,
      data: CreateConceptAutoAssignRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<CreateConceptAutoAssignResponseDTO[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${conceptId}/concept_auto_assign/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags ConceptAvailability by Concept Controller
     * @name ApiV1DashboardSchoolsConceptsConceptAutoAssignRemove
     * @request POST:/api/v1/dashboard/schools/{school_id}/concepts/{concept_id}/concept_auto_assign/remove/
     * @secure
     */
    apiV1DashboardSchoolsConceptsConceptAutoAssignRemove: (
      conceptId: string,
      schoolId: string,
      data: DeleteConceptAutoAssignRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${conceptId}/concept_auto_assign/remove/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsOrdersList
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/{concept_id}/orders/
     * @secure
     */
    apiV1DashboardSchoolsConceptsOrdersList: (
      conceptId: string,
      schoolId: string,
      query?: {
        /** Ordering */
        ordering?: ('-delinquent_students' | '-due' | 'delinquent_students' | 'due')[];
        /** Search by order name */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ConceptOrdersListSuccessResponse[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${conceptId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsConceptsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DetailConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/concepts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsConceptsUpdate: (
      id: string,
      schoolId: string,
      data: DetailConcept,
      params: RequestParams = {}
    ) =>
      this.request<DetailConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/concepts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsConceptsPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedDetailConcept,
      params: RequestParams = {}
    ) =>
      this.request<DetailConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/concepts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsConceptsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsChangeOrderPricesPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/concepts/{id}/change_order_prices/
     * @secure
     */
    apiV1DashboardSchoolsConceptsChangeOrderPricesPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedChangeOrderPricesRequest,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${id}/change_order_prices/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Retrieve a list of students for a given concept.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsStudentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/{id}/students/
     * @secure
     */
    apiV1DashboardSchoolsConceptsStudentsList: (
      id: string,
      schoolId: string,
      query?: {
        bank_account?: string;
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        optional?: boolean;
        /** Which field to use when ordering the results. Available choices: first_name, section, amount_to_pay (prefix with - for descending) */
        ordering?: '-amount_to_pay' | '-first_name' | '-section' | 'amount_to_pay' | 'first_name' | 'section';
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** Type of the concept. */
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Include payment data in the response */
        with_payment_data?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedConceptStudentList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/${id}/students/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsBatchCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/concepts/batch/
     * @secure
     */
    apiV1DashboardSchoolsConceptsBatchCreate: (schoolId: string, data: DetailConcept, params: RequestParams = {}) =>
      this.request<DetailConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/batch/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsCreateWithAttributesCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/concepts/create_with_attributes/
     * @secure
     */
    apiV1DashboardSchoolsConceptsCreateWithAttributesCreate: (
      schoolId: string,
      data: CreateConceptWithAttributes,
      params: RequestParams = {}
    ) =>
      this.request<CreateConceptWithAttributes, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/create_with_attributes/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsCreateWithSinglePaymentCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/concepts/create_with_single_payment/
     * @secure
     */
    apiV1DashboardSchoolsConceptsCreateWithSinglePaymentCreate: (
      schoolId: string,
      data: CreateConceptWithSinglePayment,
      params: RequestParams = {}
    ) =>
      this.request<CreateConceptWithSinglePayment, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/create_with_single_payment/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/filters/
     * @secure
     */
    apiV1DashboardSchoolsConceptsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsProductKeysRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/product_keys/
     * @secure
     */
    apiV1DashboardSchoolsConceptsProductKeysRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<DetailConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/product_keys/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsTaxUnitsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/tax_units/
     * @secure
     */
    apiV1DashboardSchoolsConceptsTaxUnitsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<DetailConcept, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/concepts/tax_units/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCyclesList
     * @request GET:/api/v1/dashboard/schools/{school_id}/cycles/
     * @secure
     */
    apiV1DashboardSchoolsCyclesList: (
      schoolId: string,
      query?: {
        /** Filter by active status */
        is_active?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<SchoolCycle[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/cycles/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCyclesActivatePartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/cycles/{id}/activate/
     * @secure
     */
    apiV1DashboardSchoolsCyclesActivatePartialUpdate: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/cycles/${id}/activate/`,
        method: 'PATCH',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCyclesValidateActivateCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/cycles/{id}/validate_activate/
     * @secure
     */
    apiV1DashboardSchoolsCyclesValidateActivateCreate: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/cycles/${id}/validate_activate/`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCyclesCurrentRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/cycles/current/
     * @secure
     */
    apiV1DashboardSchoolsCyclesCurrentRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolCycleCurrent, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/cycles/current/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCyclesStatusChangeCycleRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/cycles/status_change_cycle/
     * @secure
     */
    apiV1DashboardSchoolsCyclesStatusChangeCycleRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolCycleStatus, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/cycles/status_change_cycle/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsCyclesTokenList
     * @request GET:/api/v1/dashboard/schools/{school_id}/cycles/token/
     * @secure
     */
    apiV1DashboardSchoolsCyclesTokenList: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolCycle[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/cycles/token/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve historic delinquency stats filtered by various parameters.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDelinquencyHistoricList
     * @summary Retrieve historic delinquency stats
     * @request GET:/api/v1/dashboard/schools/{school_id}/delinquency/historic/
     * @secure
     */
    apiV1DashboardSchoolsDelinquencyHistoricList: (
      schoolId: string,
      query?: {
        /** Filter by concept IDs (comma-separated UUIDs). */
        concepts?: string;
        /**
         * Filter by end date (YYYY-MM-DD).
         * @format date
         */
        end_date?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Filter by start date (YYYY-MM-DD).
         * @format date
         */
        start_date?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDelinquencyStatsHistoricList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/delinquency/historic/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDelinquencyStatsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/delinquency/stats/
     * @secure
     */
    apiV1DashboardSchoolsDelinquencyStatsList: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        concepts?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DelinquencyQuantity[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/delinquency/stats/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDelinquencyStudentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/delinquency/students/
     * @secure
     */
    apiV1DashboardSchoolsDelinquencyStudentsList: (
      schoolId: string,
      query: {
        /** Concepts to filter by */
        concepts: string[];
        /**
         * End date for delinquency calculation
         * @format date
         */
        end_date?: string;
        is_active?: boolean;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Start date for delinquency calculation
         * @format date
         */
        start_date?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDelinquencyStudentList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/delinquency/students/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDelinquencyStudentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/delinquency/students/{id}/
     * @secure
     */
    apiV1DashboardSchoolsDelinquencyStudentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DelinquencyStudent, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/delinquency/students/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description - Class that implements this mixin and need overwrite get_serializer_context must call super().get_serializer_context() - This class must be in first posición in the class inheritance
     *
     * @tags Excel Delinquency Students
     * @name ApiV1DashboardSchoolsDelinquencyStudentsExcelCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/delinquency/students/excel/
     * @secure
     */
    apiV1DashboardSchoolsDelinquencyStudentsExcelCreate: (
      schoolId: string,
      query: {
        /** Concepts to filter by */
        concepts: string[];
        /**
         * End date for delinquency calculation
         * @format date
         */
        end_date?: string;
        is_active?: boolean;
        /**
         * Start date for delinquency calculation
         * @format date
         */
        start_date?: string;
      },
      data: ExcelReport,
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/delinquency/students/excel/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDueOrdersResumeRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/due_orders/resume/
     * @secure
     */
    apiV1DashboardSchoolsDueOrdersResumeRetrieve: (
      schoolId: string,
      query?: {
        /** SchoolCycleId */
        school_cycle?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardSchoolDueOrdersResume, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/due_orders/resume/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Students Due Orders ViewSet
     * @name ApiV1DashboardSchoolsDueOrdersStudentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/due_orders/students/
     * @secure
     */
    apiV1DashboardSchoolsDueOrdersStudentsList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by delinquency value */
        delinquency?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by student inscription status */
        inscription_status?: ('Inscrito' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: (
          | '-due_orders'
          | '-due_orders_total'
          | '-first_name'
          | '-last_name'
          | '-level'
          | '-section'
          | 'due_orders'
          | 'due_orders_total'
          | 'first_name'
          | 'last_name'
          | 'level'
          | 'section'
        )[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentListList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/due_orders/students/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDueOrdersStudentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/due_orders/students/{id}/
     * @secure
     */
    apiV1DashboardSchoolsDueOrdersStudentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardStudentDetail, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/due_orders/students/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDueOrdersStudentsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/due_orders/students/filters/
     * @secure
     */
    apiV1DashboardSchoolsDueOrdersStudentsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewStudents, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/due_orders/students/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFiscalEntitiesList
     * @request GET:/api/v1/dashboard/schools/{school_id}/fiscal_entities/
     * @secure
     */
    apiV1DashboardSchoolsFiscalEntitiesList: (schoolId: string, params: RequestParams = {}) =>
      this.request<FiscalEntity[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fiscal_entities/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new fiscal entity for the school. Only staff users can create fiscal entities.
     *
     * @tags api
     * @name FiscalEntitiesCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/fiscal_entities/
     * @secure
     */
    fiscalEntitiesCreate: (schoolId: string, data: FiscalEntity, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fiscal_entities/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFiscalEntitiesRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/fiscal_entities/{id}/
     * @secure
     */
    apiV1DashboardSchoolsFiscalEntitiesRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<FiscalEntity, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fiscal_entities/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Esta es el endpoint para devolver el listado de fulfillments por colegio
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/fulfillments/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsList: (
      schoolId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardFulfillmentListSerializerV2List, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/fulfillments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardFulfillment, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsAvoidScholarshipPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/fulfillments/{id}/avoid_scholarship/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsAvoidScholarshipPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedAvoidScholarship,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/${id}/avoid_scholarship/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsEditBasePartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/fulfillments/{id}/edit_base/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsEditBasePartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedEditFulfillmentBase,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/${id}/edit_base/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsEditDuePartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/fulfillments/{id}/edit_due/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsEditDuePartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedEditFulfillmentDue,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/${id}/edit_due/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsForceScholarshipPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/fulfillments/{id}/force_scholarship/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsForceScholarshipPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedForceScholarship,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/${id}/force_scholarship/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsSwitchInterestForgivenPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/fulfillments/{id}/switch_interest_forgiven/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsSwitchInterestForgivenPartialUpdate: (
      id: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/${id}/switch_interest_forgiven/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/fulfillments/columns/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description - Class that implements this mixin and need overwrite get_serializer_context must call super().get_serializer_context() - This class must be in first posición in the class inheritance
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsExcelCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/fulfillments/excel/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsExcelCreate: (schoolId: string, data: ExcelReport, params: RequestParams = {}) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/excel/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsHistoricRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/fulfillments/historic/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsHistoricRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/historic/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/fulfillments/pdf/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsPdfRetrieve: (
      schoolId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/fulfillments/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsXlsV2Create: (
      schoolId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFulfillmentsXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/fulfillments/xml/
     * @secure
     */
    apiV1DashboardSchoolsFulfillmentsXmlRetrieve: (
      schoolId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/fulfillments/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsGuardiansList
     * @request GET:/api/v1/dashboard/schools/{school_id}/guardians/
     * @secure
     */
    apiV1DashboardSchoolsGuardiansList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSlimGuardianList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/guardians/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsGuardiansCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/guardians/
     * @secure
     */
    apiV1DashboardSchoolsGuardiansCreate: (schoolId: string, data: CreateAssignGuardian, params: RequestParams = {}) =>
      this.request<DashboardGuardianSlim, RetrieveGuardian>({
        path: `/api/v1/dashboard/schools/${schoolId}/guardians/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsGuardiansRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/guardians/{id}/
     * @secure
     */
    apiV1DashboardSchoolsGuardiansRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/guardians/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsGuardiansInfoRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/guardians/{id}/info/
     * @secure
     */
    apiV1DashboardSchoolsGuardiansInfoRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardGuardian, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/guardians/${id}/info/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsGuardiansPortalUrlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/guardians/{id}/portal_url/
     * @secure
     */
    apiV1DashboardSchoolsGuardiansPortalUrlRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<GuardianSignIn, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/guardians/${id}/portal_url/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInscriptionsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/inscriptions/{id}/
     * @secure
     */
    apiV1DashboardSchoolsInscriptionsUpdate: (
      id: string,
      schoolId: string,
      data: InscriptionUpdate,
      params: RequestParams = {}
    ) =>
      this.request<InscriptionUpdate, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/inscriptions/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInscriptionsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/inscriptions/{id}/
     * @secure
     */
    apiV1DashboardSchoolsInscriptionsPartialUpdate: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/inscriptions/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInscriptionsSectionsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/inscriptions/sections/
     * @secure
     */
    apiV1DashboardSchoolsInscriptionsSectionsCreate: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/inscriptions/sections/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoiceSeriesList
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoice_series/
     * @secure
     */
    apiV1DashboardSchoolsInvoiceSeriesList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedInvoiceSeriesList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoice_series/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint con el listado de facturas por colegio
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesList
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoices/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedListDashboardInvoiceResponseDTOList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesCreate: (
      schoolId: string,
      data: CreateDashboardInvoiceRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<CreateDashboardInvoiceResponseDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint para obtener una factura por id
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoices/{id}/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<RetrieveDashboardInvoiceResponseDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint para cancelar una factura
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/invoices/{id}/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to emit credit notes for an invoice
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesCreditNoteCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/{id}/credit_note/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesCreditNoteCreate: (
      id: string,
      schoolId: string,
      data: CreateDashboardCreditNoteRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<CreateDashboardCreditNoteResponseDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/${id}/credit_note/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint to send an email with the invoice attached to the guardian
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesSendEmailCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/{id}/send_email/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesSendEmailCreate: (
      id: string,
      schoolId: string,
      data: InvoiceSendEmailRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/${id}/send_email/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesZipInvoiceCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/{id}/zip_invoice/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesZipInvoiceCreate: (
      id: string,
      schoolId: string,
      query?: {
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/${id}/zip_invoice/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoices/columns/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoices/filters/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewInvoice, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoices/pdf/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesPdfRetrieve: (
      schoolId: string,
      query?: {
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generar una reinvoice.
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesReinvoiceCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/reinvoice/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesReinvoiceCreate: (
      schoolId: string,
      data: ReinvoiceRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinvoiceRequestDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/reinvoice/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Reintentar factura en error.
     *
     * @tags School Invoice ViewSet
     * @name ApiV1DashboardSchoolsInvoicesRetryCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/retry/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesRetryCreate: (schoolId: string, data: RetryRequestDTO, params: RequestParams = {}) =>
      this.request<RetryRequestDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/retry/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/invoices/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesXlsV2Create: (
      schoolId: string,
      query?: {
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsInvoicesXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/invoices/xml/
     * @secure
     */
    apiV1DashboardSchoolsInvoicesXmlRetrieve: (
      schoolId: string,
      query?: {
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/invoices/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for managing school levels. This viewset handles CRUD operations for school levels, with special handling for list and create operations.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsLevelsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/levels/
     * @secure
     */
    apiV1DashboardSchoolsLevelsList: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<InternalSchool[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/levels/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for managing school levels. This viewset handles CRUD operations for school levels, with special handling for list and create operations.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsLevelsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/levels/
     * @secure
     */
    apiV1DashboardSchoolsLevelsCreate: (schoolId: string, data: LevelCreate, params: RequestParams = {}) =>
      this.request<LevelCreate, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/levels/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List massive concept assignments filtered by various parameters.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsList
     * @summary List massive concept assignments
     * @request GET:/api/v1/dashboard/schools/{school_id}/massive_assignments/
     * @secure
     */
    apiV1DashboardSchoolsMassiveAssignmentsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedMassiveConceptAssignmentHistoryList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/massive_assignments/
     * @secure
     */
    apiV1DashboardSchoolsMassiveAssignmentsCreate: (
      schoolId: string,
      data: CreateMassiveConceptAssignments,
      params: RequestParams = {}
    ) =>
      this.request<MassiveConceptAssignmentHistory, MassiveConceptAssignmentHistory>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/massive_assignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveAssignmentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<MassiveConceptAssignmentHistory, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/massive_assignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveAssignmentsUpdate: (
      id: string,
      schoolId: string,
      data: MassiveConceptAssignmentHistory,
      params: RequestParams = {}
    ) =>
      this.request<MassiveConceptAssignmentHistory, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/massive_assignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveAssignmentsPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedMassiveConceptAssignmentHistory,
      params: RequestParams = {}
    ) =>
      this.request<MassiveConceptAssignmentHistory, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/massive_assignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveAssignmentsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DestroyMassiveConceptAssignment, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/${id}/`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsCreate: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsRetrieve2
     * @request GET:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsRetrieve2: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsUpdate: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/${id}/`,
        method: 'PUT',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsPartialUpdate: (
      id: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Returns the status and details of a specific MassiveConceptDissasignment based on its ID.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsStatusRetrieve
     * @summary Retrieve the Status of a Massive Concept Dissasignment
     * @request GET:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/{id}/status/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsStatusRetrieve: (
      id: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<MassiveConceptDissasignment, NotFound>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/${id}/status/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsAssignmentStatusForStudentsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/assignment_status_for_students/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsAssignmentStatusForStudentsCreate: (
      schoolId: string,
      data: AssignmentStatusRequest,
      params: RequestParams = {}
    ) =>
      this.request<StudentStatusSummary, BadRequestResponse>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/assignment_status_for_students/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveDissassignmentsDissasignCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/massive_dissassignments/dissasign/
     * @secure
     */
    apiV1DashboardSchoolsMassiveDissassignmentsDissasignCreate: (
      schoolId: string,
      data: MassiveConceptDissasignmentsDissasign,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_dissassignments/dissasign/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create massive scholarship assignment with sponsored payment pre-validation. Query Parameters: - confirm_sponsored_payment: Set to true to bypass sponsored payment warning
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveScholarshipAssignmentsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/massive_scholarship_assignments/
     * @secure
     */
    apiV1DashboardSchoolsMassiveScholarshipAssignmentsCreate: (
      schoolId: string,
      data: MassiveScholarshipAssignmentCreateRequest,
      query?: {
        /** Set to true to confirm massive assignment despite sponsored payment warning */
        confirm_sponsored_payment?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<MassiveScholarshipAssignmentCreateResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_scholarship_assignments/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveScholarshipAssignmentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/massive_scholarship_assignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveScholarshipAssignmentsRetrieve: (
      id: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<MassiveScholarshipAssignmentRetrieveResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_scholarship_assignments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveScholarshipAssignmentsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/massive_scholarship_assignments/{id}/
     * @secure
     */
    apiV1DashboardSchoolsMassiveScholarshipAssignmentsDestroy: (
      id: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_scholarship_assignments/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsOptionalOrdersList
     * @request GET:/api/v1/dashboard/schools/{school_id}/optional-orders/
     * @secure
     */
    apiV1DashboardSchoolsOptionalOrdersList: (
      schoolId: string,
      query?: {
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        /** Ordering */
        ordering?: ('-price' | '-sold_units' | '-stock' | 'price' | 'sold_units' | 'stock')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** @format uuid */
        school?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedOptionalOrderList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/optional-orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Optional Orders
     * @name ApiV1DashboardSchoolsOptionalConceptsOrdersList
     * @request GET:/api/v1/dashboard/schools/{school_id}/optional_concepts/{concept_id}/orders/
     * @secure
     */
    apiV1DashboardSchoolsOptionalConceptsOrdersList: (
      conceptId: string,
      schoolId: string,
      query?: {
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        /** Ordering */
        ordering?: ('-price' | '-sold_units' | '-stock' | 'price' | 'sold_units' | 'stock')[];
        /** @format uuid */
        school?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<OptionalConceptOrders[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/optional_concepts/${conceptId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School Payins ViewSet
     * @name ApiV1DashboardSchoolsPayinsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins/
     * @secure
     */
    apiV1DashboardSchoolsPayinsList: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        collected_at_school?: boolean;
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        is_manual?: boolean;
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-created'
          | '-created_by'
          | '-paid_date'
          | '-total'
          | 'correlative_id'
          | 'created'
          | 'created_by'
          | 'paid_date'
          | 'total'
        )[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** Multiple values may be separated by commas. */
        users?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedPayinListResponseDTOList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/payins/
     * @secure
     */
    apiV1DashboardSchoolsPayinsCreate: (schoolId: string, data: DashboardPayin, params: RequestParams = {}) =>
      this.request<DashboardPayin, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins/{id}/
     * @secure
     */
    apiV1DashboardSchoolsPayinsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardPayinDetail, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/payins/{id}/
     * @secure
     */
    apiV1DashboardSchoolsPayinsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsExcelColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins/excel/columns/
     * @secure
     */
    apiV1DashboardSchoolsPayinsExcelColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/excel/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsExcelXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/payins/excel/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsPayinsExcelXlsV2Create: (schoolId: string, params: RequestParams = {}) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/excel/xls_v2/`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins/filters/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewPayins, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins/pdf/
     * @secure
     */
    apiV1DashboardSchoolsPayinsPdfRetrieve: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        collected_at_school?: boolean;
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        is_manual?: boolean;
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-created'
          | '-created_by'
          | '-paid_date'
          | '-total'
          | 'correlative_id'
          | 'created'
          | 'created_by'
          | 'paid_date'
          | 'total'
        )[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** Multiple values may be separated by commas. */
        users?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins/xml/
     * @secure
     */
    apiV1DashboardSchoolsPayinsXmlRetrieve: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        collected_at_school?: boolean;
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        is_manual?: boolean;
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-created'
          | '-created_by'
          | '-paid_date'
          | '-total'
          | 'correlative_id'
          | 'created'
          | 'created_by'
          | 'paid_date'
          | 'total'
        )[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** Multiple values may be separated by commas. */
        users?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School PayinFulfillment ViewSet
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsList: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        billing_to?: string[];
        collected_at?: ('collected_at_portal' | 'collected_at_school')[];
        /** Type of the concept. */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        invoice_statuses?: ('canceled' | 'canceling' | 'failed' | 'not_requested' | 'pending' | 'success')[];
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-created'
          | '-fulfillment_correlative_id'
          | '-invoice_status'
          | '-payin_correlative_id'
          | '-payin_paid_date'
          | 'created'
          | 'fulfillment_correlative_id'
          | 'invoice_status'
          | 'payin_correlative_id'
          | 'payin_paid_date'
        )[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Multiple values may be separated by commas. */
        registered_by?: string[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardPayinFulfillmentList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/columns/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/filters/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewPayinFulfillment, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/pdf/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsPdfRetrieve: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        billing_to?: string[];
        collected_at?: ('collected_at_portal' | 'collected_at_school')[];
        /** Type of the concept. */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        invoice_statuses?: ('canceled' | 'canceling' | 'failed' | 'not_requested' | 'pending' | 'success')[];
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-created'
          | '-fulfillment_correlative_id'
          | '-invoice_status'
          | '-payin_correlative_id'
          | '-payin_paid_date'
          | 'created'
          | 'fulfillment_correlative_id'
          | 'invoice_status'
          | 'payin_correlative_id'
          | 'payin_paid_date'
        )[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Multiple values may be separated by commas. */
        registered_by?: string[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsXlsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/xls/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsXlsCreate: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        billing_to?: string[];
        collected_at?: ('collected_at_portal' | 'collected_at_school')[];
        /** Type of the concept. */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        invoice_statuses?: ('canceled' | 'canceling' | 'failed' | 'not_requested' | 'pending' | 'success')[];
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-created'
          | '-fulfillment_correlative_id'
          | '-invoice_status'
          | '-payin_correlative_id'
          | '-payin_paid_date'
          | 'created'
          | 'fulfillment_correlative_id'
          | 'invoice_status'
          | 'payin_correlative_id'
          | 'payin_paid_date'
        )[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Multiple values may be separated by commas. */
        registered_by?: string[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/xls/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsXlsV2Create: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        billing_to?: string[];
        collected_at?: ('collected_at_portal' | 'collected_at_school')[];
        /** Type of the concept. */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        invoice_statuses?: ('canceled' | 'canceling' | 'failed' | 'not_requested' | 'pending' | 'success')[];
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-created'
          | '-fulfillment_correlative_id'
          | '-invoice_status'
          | '-payin_correlative_id'
          | '-payin_paid_date'
          | 'created'
          | 'fulfillment_correlative_id'
          | 'invoice_status'
          | 'payin_correlative_id'
          | 'payin_paid_date'
        )[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Multiple values may be separated by commas. */
        registered_by?: string[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsXlsWSegmentsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/xls_w_segments/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsXlsWSegmentsCreate: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        billing_to?: string[];
        collected_at?: ('collected_at_portal' | 'collected_at_school')[];
        /** Type of the concept. */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        invoice_statuses?: ('canceled' | 'canceling' | 'failed' | 'not_requested' | 'pending' | 'success')[];
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-created'
          | '-fulfillment_correlative_id'
          | '-invoice_status'
          | '-payin_correlative_id'
          | '-payin_paid_date'
          | 'created'
          | 'fulfillment_correlative_id'
          | 'invoice_status'
          | 'payin_correlative_id'
          | 'payin_paid_date'
        )[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Multiple values may be separated by commas. */
        registered_by?: string[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/xls_w_segments/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payins_fulfillments/xml/
     * @secure
     */
    apiV1DashboardSchoolsPayinsFulfillmentsXmlRetrieve: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        billing_to?: string[];
        collected_at?: ('collected_at_portal' | 'collected_at_school')[];
        /** Type of the concept. */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        invoice_statuses?: ('canceled' | 'canceling' | 'failed' | 'not_requested' | 'pending' | 'success')[];
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-created'
          | '-fulfillment_correlative_id'
          | '-invoice_status'
          | '-payin_correlative_id'
          | '-payin_paid_date'
          | 'created'
          | 'fulfillment_correlative_id'
          | 'invoice_status'
          | 'payin_correlative_id'
          | 'payin_paid_date'
        )[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Multiple values may be separated by commas. */
        registered_by?: string[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School Payouts ViewSet
     * @name ApiV1DashboardSchoolsPayoutsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsList: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        ids?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-deposit_date'
          | '-orders_count'
          | '-status'
          | '-total_emitted'
          | '-transaction_started'
          | 'correlative_id'
          | 'deposit_date'
          | 'orders_count'
          | 'status'
          | 'total_emitted'
          | 'transaction_started'
        )[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** @format date */
        start_date?: string;
        statuses?: (
          | 'APPROVED_STATUS'
          | 'CANCELED_STATUS'
          | 'DECLINED_STATUS'
          | 'PROCESSING_STATUS'
          | 'SCHEDULED_STATUS'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardSchoolPayoutsList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardSchoolPayoutDetails, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/columns/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description - Class that implements this mixin and need overwrite get_serializer_context must call super().get_serializer_context() - This class must be in first posición in the class inheritance
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsExcelCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/payouts/excel/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsExcelCreate: (schoolId: string, data: ExcelReport, params: RequestParams = {}) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/excel/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/filters/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterPayouts, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/pdf/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsPdfRetrieve: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        ids?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-deposit_date'
          | '-orders_count'
          | '-status'
          | '-total_emitted'
          | '-transaction_started'
          | 'correlative_id'
          | 'deposit_date'
          | 'orders_count'
          | 'status'
          | 'total_emitted'
          | 'transaction_started'
        )[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** @format date */
        start_date?: string;
        statuses?: (
          | 'APPROVED_STATUS'
          | 'CANCELED_STATUS'
          | 'DECLINED_STATUS'
          | 'PROCESSING_STATUS'
          | 'SCHEDULED_STATUS'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsResumeRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/resume/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsResumeRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolPayoutsResume, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/resume/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/payouts/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsXlsV2Create: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        ids?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-deposit_date'
          | '-orders_count'
          | '-status'
          | '-total_emitted'
          | '-transaction_started'
          | 'correlative_id'
          | 'deposit_date'
          | 'orders_count'
          | 'status'
          | 'total_emitted'
          | 'transaction_started'
        )[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** @format date */
        start_date?: string;
        statuses?: (
          | 'APPROVED_STATUS'
          | 'CANCELED_STATUS'
          | 'DECLINED_STATUS'
          | 'PROCESSING_STATUS'
          | 'SCHEDULED_STATUS'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayoutsXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/payouts/xml/
     * @secure
     */
    apiV1DashboardSchoolsPayoutsXmlRetrieve: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        bank_accounts?: string[];
        /** @format date */
        end_date?: string;
        /** Multiple values may be separated by commas. */
        ids?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: (
          | '-correlative_id'
          | '-deposit_date'
          | '-orders_count'
          | '-status'
          | '-total_emitted'
          | '-transaction_started'
          | 'correlative_id'
          | 'deposit_date'
          | 'orders_count'
          | 'status'
          | 'total_emitted'
          | 'transaction_started'
        )[];
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** @format date */
        start_date?: string;
        statuses?: (
          | 'APPROVED_STATUS'
          | 'CANCELED_STATUS'
          | 'DECLINED_STATUS'
          | 'PROCESSING_STATUS'
          | 'SCHEDULED_STATUS'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payouts/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Create Refund
     * @name ApiV1DashboardSchoolsRefundCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/refund/
     * @secure
     */
    apiV1DashboardSchoolsRefundCreate: (
      schoolId: string,
      data: CreateRefundDashboardRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<CreateRefundDashboardResponseDTO, HTTP400BadRequest>({
        path: `/api/v1/dashboard/schools/${schoolId}/refund/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsReportsYearlyInvoicesZipYearlyInvoicesZipCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/reports/yearly_invoices_zip/yearly_invoices_zip/
     * @secure
     */
    apiV1DashboardSchoolsReportsYearlyInvoicesZipYearlyInvoicesZipCreate: (
      schoolId: string,
      data: YearlyInvoiceZipRequest,
      params: RequestParams = {}
    ) =>
      this.request<YearlyInvoiceZipResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/reports/yearly_invoices_zip/yearly_invoices_zip/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsReportsYearlyInvoicesZipYearlyInvoicesZipStatusRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/reports/yearly_invoices_zip/yearly_invoices_zip/status/
     * @secure
     */
    apiV1DashboardSchoolsReportsYearlyInvoicesZipYearlyInvoicesZipStatusRetrieve: (
      schoolId: string,
      query: {
        /** Year to check status for invoices from January 1 to December 15. */
        year: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<YearlyInvoiceZipStatusResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/reports/yearly_invoices_zip/yearly_invoices_zip/status/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School RootConcepts ViewSet
     * @name ApiV1DashboardSchoolsRootConceptsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/root_concepts/
     * @secure
     */
    apiV1DashboardSchoolsRootConceptsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardRootConceptList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/root_concepts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsRootConceptsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/root_concepts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsRootConceptsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardRootConceptDetail, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/root_concepts/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsRootConceptsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/root_concepts/filters/
     * @secure
     */
    apiV1DashboardSchoolsRootConceptsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardRootConceptDetail, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/root_concepts/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipAssignmentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarship_assignments/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipAssignmentsList: (
      schoolId: string,
      query?: {
        levels?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        scholarships?: string[];
        school_cycle?: string;
        /** A search term. */
        search?: string;
        sections?: string[];
        state?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedStudentsScholarshipList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarship_assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipAssignmentsColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarship_assignments/columns/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipAssignmentsColumnsRetrieve: (
      schoolId: string,
      query?: {
        levels?: string[];
        scholarships?: string[];
        school_cycle?: string;
        sections?: string[];
        state?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarship_assignments/columns/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipAssignmentsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarship_assignments/filters/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipAssignmentsFiltersRetrieve: (
      schoolId: string,
      query?: {
        levels?: string[];
        scholarships?: string[];
        school_cycle?: string;
        sections?: string[];
        state?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentsScholarship, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarship_assignments/filters/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipAssignmentsXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/scholarship_assignments/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipAssignmentsXlsV2Create: (
      schoolId: string,
      query?: {
        levels?: string[];
        scholarships?: string[];
        school_cycle?: string;
        /** A search term. */
        search?: string;
        sections?: string[];
        state?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarship_assignments/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Scholarships ViewSet
     * @name ApiV1DashboardSchoolsScholarshipsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarships/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipsList: (
      schoolId: string,
      query?: {
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Which field to use when ordering the results. Available choices are 'name'. */
        ordering?: '-name' | 'name';
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by scholarships */
        scholarships?: string[];
        /** Search scholarships by name */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedScholarshipListList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarships/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve a scholarship by ID
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarships/{id}/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipsRetrieve: (
      id: string,
      schoolId: string,
      query?: {
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Which field to use when ordering the results. Available choices are 'name'. */
        ordering?: '-name' | 'name';
        /** Search scholarships by name */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ScholarshipDetail, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarships/${id}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Validate if a scholarship can be updated or deleted
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipsValidateRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarships/{id}/validate/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipsValidateRetrieve: (
      id: string,
      schoolId: string,
      query?: {
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Which field to use when ordering the results. Available choices are 'name'. */
        ordering?: '-name' | 'name';
        /** Search scholarships by name */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ScholarshipValidate, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarships/${id}/validate/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsScholarshipsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarships/filters/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipsFiltersRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Which field to use when ordering the results. Available choices are 'name'. */
        ordering?: '-name' | 'name';
        /** Search scholarships by name */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<FilterViewScholarship, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarships/filters/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSectionsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/sections/
     * @secure
     */
    apiV1DashboardSchoolsSectionsList: (
      schoolId: string,
      query?: {
        /** join_by_pipe */
        join_by_pipe?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardSchoolSection[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/sections/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSectionsTokenList
     * @request GET:/api/v1/dashboard/schools/{school_id}/sections/token/
     * @secure
     */
    apiV1DashboardSchoolsSectionsTokenList: (schoolId: string, params: RequestParams = {}) =>
      this.request<SectionFilter[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/sections/token/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Crea los descuentos especiales
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSpecialDiscountsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/special_discounts/
     * @secure
     */
    apiV1DashboardSchoolsSpecialDiscountsCreate: (
      schoolId: string,
      data: CreateSpecialDiscountDashboardRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<SpecialDiscount, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/special_discounts/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSpecialDiscountsDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/special_discounts/{id}/
     * @secure
     */
    apiV1DashboardSchoolsSpecialDiscountsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/special_discounts/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSpecialOverChargesCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/special_over_charges/
     * @secure
     */
    apiV1DashboardSchoolsSpecialOverChargesCreate: (
      schoolId: string,
      data: SpecialOverCharge,
      params: RequestParams = {}
    ) =>
      this.request<SpecialOverCharge, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/special_over_charges/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSpecialOverChargesDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/special_over_charges/{id}/
     * @secure
     */
    apiV1DashboardSchoolsSpecialOverChargesDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/special_over_charges/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Validate if deleting this special overcharge would create a sponsored payment. This endpoint simulates the deletion without actually performing it, allowing the frontend to show appropriate confirmation messages.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSpecialOverChargesValidateDeletionCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/special_over_charges/{id}/validate-deletion/
     * @secure
     */
    apiV1DashboardSchoolsSpecialOverChargesValidateDeletionCreate: (
      id: string,
      schoolId: string,
      data: ValidateSpecialOverChargeDeletion,
      params: RequestParams = {}
    ) =>
      this.request<ValidateDeletionResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/special_over_charges/${id}/validate-deletion/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Stock History ViewSet
     * @name ApiV1DashboardSchoolsStockHistoryList
     * @request GET:/api/v1/dashboard/schools/{school_id}/stock-history/{stock_id}/
     * @secure
     */
    apiV1DashboardSchoolsStockHistoryList: (
      schoolId: string,
      stockId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedStockListHistoryList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/stock-history/${stockId}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStockChangeLimitPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/stock/{id}/change_limit/
     * @secure
     */
    apiV1DashboardSchoolsStockChangeLimitPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedChangeLimitRequest,
      params: RequestParams = {}
    ) =>
      this.request<ChangeLimitResponse, BadRequestResponse>({
        path: `/api/v1/dashboard/schools/${schoolId}/stock/${id}/change_limit/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStockUpdateQuantityPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/stock/{id}/update_quantity/
     * @secure
     */
    apiV1DashboardSchoolsStockUpdateQuantityPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedUpdateQuantityRequest,
      params: RequestParams = {}
    ) =>
      this.request<UpdateQuantityResponse, BadRequestResponse>({
        path: `/api/v1/dashboard/schools/${schoolId}/stock/${id}/update_quantity/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/
     * @secure
     */
    apiV1DashboardSchoolsStudentsList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentSearchList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/students/
     * @secure
     */
    apiV1DashboardSchoolsStudentsCreate: (
      schoolId: string,
      data: DashboardStudent,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudent, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/{id}/
     * @secure
     */
    apiV1DashboardSchoolsStudentsRetrieve: (
      id: string,
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentSearch, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/${id}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/students/{id}/
     * @secure
     */
    apiV1DashboardSchoolsStudentsUpdate: (
      id: string,
      schoolId: string,
      data: DashboardStudentSearch,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentSearch, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/${id}/`,
        method: 'PUT',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/students/{id}/
     * @secure
     */
    apiV1DashboardSchoolsStudentsPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedDashboardStudent,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudent, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/${id}/`,
        method: 'PATCH',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieves a list of inscriptions for a specific student by their ID.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsInscriptionsRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/{id}/inscriptions/
     * @secure
     */
    apiV1DashboardSchoolsStudentsInscriptionsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<PaginatedInscriptionList, void>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/${id}/inscriptions/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School FulfillmentDelinquency ViewSet
     * @name ApiV1DashboardSchoolsStudentsDelinquencyList
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentDelinquencyList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School FulfillmentDelinquency ViewSet
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryList
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentDelinquencySummaryList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/{id}/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryRetrieve: (
      id: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentDelinquencyDetailSummary, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/columns/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/filters/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewDelinquentStudents, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/pdf/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryPdfRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School Fulfillment Delinquency Report
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryXlsV2Create: (
      schoolId: string,
      data: FulfillmentXLSReportParameters,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/xls_v2/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencySummaryXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency-summary/xml/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencySummaryXmlRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency-summary/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencyRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency/{id}/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardStudentDelinquencyDetail, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencyColumnsRetrieve
     * @summary Retrieve available columns for custom reports
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency/columns/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyColumnsRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<ColumnsResponse, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/columns/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencyFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency/filters/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewDelinquentStudents, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencyPdfRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency/pdf/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyPdfRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags School Fulfillment Delinquency Report
     * @name ApiV1DashboardSchoolsStudentsDelinquencyXlsV2Create
     * @request POST:/api/v1/dashboard/schools/{school_id}/students/delinquency/xls_v2/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyXlsV2Create: (
      schoolId: string,
      data: FulfillmentXLSReportParameters,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/xls_v2/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencyXmlRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/delinquency/xml/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyXmlRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description - Class that implements this mixin and need overwrite get_serializer_context must call super().get_serializer_context() - This class must be in first posición in the class inheritance
     *
     * @tags Excel Students
     * @name ApiV1DashboardSchoolsStudentsExcelCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/students/excel/
     * @secure
     */
    apiV1DashboardSchoolsStudentsExcelCreate: (
      schoolId: string,
      data: ExcelReport,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by delinquency value */
        delinquency?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by student inscription status */
        inscription_status?: ('Inscrito' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: (
          | '-due_orders'
          | '-due_orders_total'
          | '-first_name'
          | '-last_name'
          | '-level'
          | '-section'
          | 'due_orders'
          | 'due_orders_total'
          | 'first_name'
          | 'last_name'
          | 'level'
          | 'section'
        )[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/excel/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/filters/
     * @secure
     */
    apiV1DashboardSchoolsStudentsFiltersRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentSearch, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/filters/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsInscriptionsSummaryRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/inscriptions/summary/
     * @secure
     */
    apiV1DashboardSchoolsStudentsInscriptionsSummaryRetrieve: (
      schoolId: string,
      query: {
        /** @format uuid */
        school_cycle_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentInscriptionsSummary, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/inscriptions/summary/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsLastEnrolledRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/last_enrolled/
     * @secure
     */
    apiV1DashboardSchoolsStudentsLastEnrolledRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentSearch, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/last_enrolled/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve a resume by school.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsResumeBySchoolV2Retrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/resume_by_school_v2/
     * @secure
     */
    apiV1DashboardSchoolsStudentsResumeBySchoolV2Retrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentResumeSerializerV2, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/resume_by_school_v2/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsValidateEnrollmentCodeRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/validate_enrollment_code/
     * @secure
     */
    apiV1DashboardSchoolsStudentsValidateEnrollmentCodeRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentSearch, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/validate_enrollment_code/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mixin que maneja la logica para crear reportes XLS. Se accede a través de la ruta /xls de la url del viewset al cual se agrega. Se espera que los siguientes atributos estén definidos en el viewset que use el mixin: - xls_filename (str): nombre del reporte que se generara - xls_serializers ([Any]): lista de serializers que se usan para serializar la data del reporte. Se usa una lista para tener la posibilidad de que el reporte tenga multiples hojas. También se asume que los serializers están dentro del archivo serializers_excel (api.reports.serializers_excel) - get_xls_queryset (Queryset): función que define el queryset a usar para generar el reporte.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsXlsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/students/xls/
     * @secure
     */
    apiV1DashboardSchoolsStudentsXlsCreate: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by active status */
        is_active?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        /** Ordering */
        ordering?: ('-first_name' | '-section' | 'first_name' | 'section')[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/xls/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Student By Level ViewSet
     * @name ApiV1DashboardSchoolsStudentsByLevelList
     * @request GET:/api/v1/dashboard/schools/{school_id}/students_by_level/{concept_id}/
     * @secure
     */
    apiV1DashboardSchoolsStudentsByLevelList: (
      conceptId: string,
      schoolId: string,
      query?: {
        /** Filter by Concept UUID(str) */
        concepts?: string[];
        /** Filter by delinquency value */
        delinquency?: ('high' | 'low' | 'mid' | 'zero')[];
        /** @format date */
        entry_date?: string;
        /** Filter by debt */
        has_debt?: boolean;
        /** A page number within the paginated result set. */
        page?: number;
        /** Filter by scholarships */
        scholarships?: string[];
        /** Filter by school cycle UUID(str) */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedStudentByLevelList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students_by_level/${conceptId}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsByLevelFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students_by_level/{concept_id}/filters/
     * @secure
     */
    apiV1DashboardSchoolsStudentsByLevelFiltersRetrieve: (
      conceptId: string,
      schoolId: string,
      params: RequestParams = {}
    ) =>
      this.request<FilterViewStudentsByLevel, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students_by_level/${conceptId}/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersList
     * @request GET:/api/v1/dashboard/schools/{school_id}/users/
     * @secure
     */
    apiV1DashboardSchoolsUsersList: (
      schoolId: string,
      query?: {
        ignore_company_members?: boolean;
        membership?: string[];
        /** @minLength 1 */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UserDTO[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/users/
     * @secure
     */
    apiV1DashboardSchoolsUsersCreate: (schoolId: string, data: CreateUpdateUserDTO, params: RequestParams = {}) =>
      this.request<UserDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/users/{id}/
     * @secure
     */
    apiV1DashboardSchoolsUsersRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<UserDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/users/{id}/
     * @secure
     */
    apiV1DashboardSchoolsUsersUpdate: (
      id: string,
      schoolId: string,
      data: CreateUpdateUserDTO,
      params: RequestParams = {}
    ) =>
      this.request<UserDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_id}/users/{id}/
     * @secure
     */
    apiV1DashboardSchoolsUsersDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<UserDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/${id}/`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersPermissionsPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_id}/users/{id}/permissions/
     * @secure
     */
    apiV1DashboardSchoolsUsersPermissionsPartialUpdate: (
      id: string,
      schoolId: string,
      data: PatchedPatchMembershipPermissionsRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<MembershipPermissionsResponseDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/${id}/permissions/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersPermissionsAllRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/users/{id}/permissions/all/
     * @secure
     */
    apiV1DashboardSchoolsUsersPermissionsAllRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<MembershipPermissionsResponseDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/${id}/permissions/all/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersByEmailRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/users/by-email/
     * @secure
     */
    apiV1DashboardSchoolsUsersByEmailRetrieve: (
      schoolId: string,
      query: {
        email: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UserDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/by-email/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersByMembershipRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/users/by-membership/
     * @secure
     */
    apiV1DashboardSchoolsUsersByMembershipRetrieve: (
      schoolId: string,
      query: {
        membership_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UserDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/by-membership/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard - Users
     * @name ApiV1DashboardSchoolsUsersFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/users/filters/
     * @secure
     */
    apiV1DashboardSchoolsUsersFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<UserListFiltersDTO, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/users/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description List all adjustment rules for a school
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesList
     * @request GET:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/
     * @secure
     */
    adjustmentRulesList: (
      schoolPk: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAdjustmentRuleList, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new adjustment rule
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesCreate
     * @request POST:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/
     * @secure
     */
    adjustmentRulesCreate: (schoolPk: string, data: AdjustmentRule, params: RequestParams = {}) =>
      this.request<AdjustmentRule, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get details of a specific adjustment rule
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/{id}/
     * @secure
     */
    adjustmentRulesRetrieve: (id: string, schoolPk: string, params: RequestParams = {}) =>
      this.request<AdjustmentRule, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an adjustment rule
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/{id}/
     * @secure
     */
    adjustmentRulesUpdate: (id: string, schoolPk: string, data: AdjustmentRule, params: RequestParams = {}) =>
      this.request<AdjustmentRule, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partially update an adjustment rule
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesPartialUpdate
     * @request PATCH:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/{id}/
     * @secure
     */
    adjustmentRulesPartialUpdate: (
      id: string,
      schoolPk: string,
      data: PatchedAdjustmentRule,
      params: RequestParams = {}
    ) =>
      this.request<AdjustmentRule, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Soft delete an adjustment rule (sets is_active=False)
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesDestroy
     * @request DELETE:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/{id}/
     * @secure
     */
    adjustmentRulesDestroy: (id: string, schoolPk: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Create all adjustment rules at once (used in onboarding and reconfiguration)
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesBulkCreate
     * @request POST:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/bulk-create/
     * @secure
     */
    adjustmentRulesBulkCreate: (
      schoolPk: string,
      data: {
        /** True for independent mode (all on base), False for sequential mode (cascading) */
        apply_independently: boolean;
        rules: {
          rule_type?: 'scholarship' | 'early_bird' | 'interest' | 'special_discount' | 'special_overcharge';
          order?: number;
          is_active?: boolean;
          config?: object;
        }[];
      },
      params: RequestParams = {}
    ) =>
      this.request<
        {
          message?: string;
          rules_created?: number;
          apply_discounts_independently?: boolean;
          recalculation_triggered?: boolean;
          created?: AdjustmentRule[];
        },
        any
      >({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/bulk-create/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get configuration change history from custom AdjustmentRuleConfigurationHistory table. Each record represents one bulk_create operation with complete snapshot.
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesConfigurationHistory
     * @request GET:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/configuration-history/
     * @secure
     */
    adjustmentRulesConfigurationHistory: (
      schoolPk: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedConfigurationHistoryList, any>({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/configuration-history/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Simulate adjustment calculations without side effects (for real-time preview). Adjustments can use either percentage (e.g., "10.5") or fixed amount (e.g., "1000.00"), but not both.
     *
     * @tags Adjustment Rules
     * @name AdjustmentRulesSimulate
     * @request POST:/api/v1/dashboard/schools/{school_pk}/adjustment-rules/simulate/
     * @secure
     */
    adjustmentRulesSimulate: (schoolPk: string, data: Simulate, params: RequestParams = {}) =>
      this.request<
        {
          base_amount?: string;
          mode?: string;
          steps?: {
            name?: string;
            base?: string;
            percentage?: string;
            applied?: string;
            balance?: string;
          }[];
          final_amount?: string;
        },
        any
      >({
        path: `/api/v1/dashboard/schools/${schoolPk}/adjustment-rules/simulate/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve the default CFDI configuration. Returns a mapping of tax regimes to concept types and their corresponding CFDI codes.
     *
     * @tags api
     * @name ApiV1DashboardSchoolsDefaultCfdiConfigRetrieve
     * @request GET:/api/v1/dashboard/schools/default-cfdi-config/
     * @secure
     */
    apiV1DashboardSchoolsDefaultCfdiConfigRetrieve: (params: RequestParams = {}) =>
      this.request<
        Record<
          string,
          {
            MONTHLY_FEE?: string | null;
            INSCRIPTION?: string | null;
            REINSCRIPTION?: string | null;
            EXTRACURRICULAR?: string | null;
            SPORTS?: string | null;
            CAFETERIA?: string | null;
            BOOKS_AND_MATERIALS?: string | null;
            EXAMS_AND_CERTIFICATES?: string | null;
            UNIFORMS_AND_MERCH?: string | null;
            PRE_DEBT?: string | null;
            TRANSPORT?: string | null;
            DONATION?: string | null;
            EVENTS?: string | null;
            TRIPS?: string | null;
            INSURANCE?: string | null;
            OTHER?: string | null;
          }
        >,
        any
      >({
        path: `/api/v1/dashboard/schools/default-cfdi-config/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsFiltersRetrieve
     * @request GET:/api/v1/dashboard/schools/filters/{school_id}/
     * @secure
     */
    apiV1DashboardSchoolsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardSchoolWithStudents, any>({
        path: `/api/v1/dashboard/schools/filters/${schoolId}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsSectionsRetrieve
     * @request GET:/api/v1/dashboard/schools/sections/{id}/
     * @secure
     */
    apiV1DashboardSchoolsSectionsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/sections/${id}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardStudentsRetrieve
     * @request GET:/api/v1/dashboard/students/{id}/
     * @secure
     */
    apiV1DashboardStudentsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<DashboardStudent, any>({
        path: `/api/v1/dashboard/students/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardStudentsUpdate
     * @request PUT:/api/v1/dashboard/students/{id}/
     * @secure
     */
    apiV1DashboardStudentsUpdate: (id: string, data: DashboardStudent, params: RequestParams = {}) =>
      this.request<DashboardStudent, any>({
        path: `/api/v1/dashboard/students/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardStudentsPartialUpdate
     * @request PATCH:/api/v1/dashboard/students/{id}/
     * @secure
     */
    apiV1DashboardStudentsPartialUpdate: (id: string, data: PatchedDashboardStudent, params: RequestParams = {}) =>
      this.request<DashboardStudent, any>({
        path: `/api/v1/dashboard/students/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardStudentsInactivateDestroy
     * @request DELETE:/api/v1/dashboard/students/{id}/inactivate/
     * @secure
     */
    apiV1DashboardStudentsInactivateDestroy: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${id}/inactivate/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardStudentsReactivatePartialUpdate
     * @request PATCH:/api/v1/dashboard/students/{id}/reactivate/
     * @secure
     */
    apiV1DashboardStudentsReactivatePartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<SuccessResponse, any>({
        path: `/api/v1/dashboard/students/${id}/reactivate/`,
        method: 'PATCH',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsList
     * @request GET:/api/v1/dashboard/students/{student_id}/assignments/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsList: (
      studentId: string,
      query?: {
        ended?: boolean;
        optional?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentAssignment[], any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsCreate
     * @request POST:/api/v1/dashboard/students/{student_id}/assignments/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsCreate: (
      studentId: string,
      data: StudentAssignmentDetail,
      params: RequestParams = {}
    ) =>
      this.request<StudentAssignmentDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/assignments/{id}/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<StudentAssignmentDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsUpdate
     * @request PUT:/api/v1/dashboard/students/{student_id}/assignments/{id}/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsUpdate: (
      id: string,
      studentId: string,
      data: StudentAssignmentDetail,
      params: RequestParams = {}
    ) =>
      this.request<StudentAssignmentDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsPartialUpdate
     * @request PATCH:/api/v1/dashboard/students/{student_id}/assignments/{id}/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsPartialUpdate: (
      id: string,
      studentId: string,
      data: PatchedStudentAssignmentDetail,
      params: RequestParams = {}
    ) =>
      this.request<StudentAssignmentDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsDestroy
     * @request DELETE:/api/v1/dashboard/students/{student_id}/assignments/{id}/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsDestroy: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAssignmentsDestroyOptionalAssignmentDestroy
     * @request DELETE:/api/v1/dashboard/students/{student_id}/assignments/{id}/destroy_optional_assignment/
     * @secure
     */
    apiV1DashboardStudentsAssignmentsDestroyOptionalAssignmentDestroy: (
      id: string,
      studentId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/assignments/${id}/destroy_optional_assignment/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAvailableScholarshipsList
     * @request GET:/api/v1/dashboard/students/{student_id}/available_scholarships/
     * @secure
     */
    apiV1DashboardStudentsAvailableScholarshipsList: (studentId: string, params: RequestParams = {}) =>
      this.request<AvailableScholarship[], any>({
        path: `/api/v1/dashboard/students/${studentId}/available_scholarships/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAvailableScholarshipsCreate
     * @request POST:/api/v1/dashboard/students/{student_id}/available_scholarships/
     * @secure
     */
    apiV1DashboardStudentsAvailableScholarshipsCreate: (
      studentId: string,
      data: AvailableScholarship,
      params: RequestParams = {}
    ) =>
      this.request<AvailableScholarship, any>({
        path: `/api/v1/dashboard/students/${studentId}/available_scholarships/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsAvailableScholarshipsRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/available_scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsAvailableScholarshipsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<AvailableScholarshipDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/available_scholarships/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsConceptsList
     * @request GET:/api/v1/dashboard/students/{student_id}/concepts/
     * @secure
     */
    apiV1DashboardStudentsConceptsList: (
      studentId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        cycle_id?: string[];
        optional?: boolean;
        /** Type of the concept. */
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentConcept[], any>({
        path: `/api/v1/dashboard/students/${studentId}/concepts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsConceptsRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/concepts/{id}/
     * @secure
     */
    apiV1DashboardStudentsConceptsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<StudentConceptDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/concepts/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsExpiredScholarshipsList
     * @request GET:/api/v1/dashboard/students/{student_id}/expired_scholarships/
     * @secure
     */
    apiV1DashboardStudentsExpiredScholarshipsList: (
      studentId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedScholarshipExpiredList, any>({
        path: `/api/v1/dashboard/students/${studentId}/expired_scholarships/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsExpiredScholarshipsRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/expired_scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsExpiredScholarshipsRetrieve: (id: number, studentId: string, params: RequestParams = {}) =>
      this.request<ScholarshipExpiredDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/expired_scholarships/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsFulfillmentsList
     * @request GET:/api/v1/dashboard/students/{student_id}/fulfillments/
     * @secure
     */
    apiV1DashboardStudentsFulfillmentsList: (
      studentId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardFulfillmentListList, any>({
        path: `/api/v1/dashboard/students/${studentId}/fulfillments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsFulfillmentsRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/fulfillments/{id}/
     * @secure
     */
    apiV1DashboardStudentsFulfillmentsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<DashboardFulfillment, any>({
        path: `/api/v1/dashboard/students/${studentId}/fulfillments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsFulfillmentsPdfRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/fulfillments/pdf/
     * @secure
     */
    apiV1DashboardStudentsFulfillmentsPdfRetrieve: (
      studentId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/students/${studentId}/fulfillments/pdf/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsFulfillmentsXmlRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/fulfillments/xml/
     * @secure
     */
    apiV1DashboardStudentsFulfillmentsXmlRetrieve: (
      studentId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | '-paid_date' | 'due' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school_cycle?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ZipReport, any>({
        path: `/api/v1/dashboard/students/${studentId}/fulfillments/xml/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsGuardiansCreate
     * @request POST:/api/v1/dashboard/students/{student_id}/guardians/
     * @secure
     */
    apiV1DashboardStudentsGuardiansCreate: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/guardians/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsGuardiansDestroy
     * @request DELETE:/api/v1/dashboard/students/{student_id}/guardians/{id}/
     * @secure
     */
    apiV1DashboardStudentsGuardiansDestroy: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/guardians/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsOrdersList
     * @request GET:/api/v1/dashboard/students/{student_id}/orders/
     * @secure
     */
    apiV1DashboardStudentsOrdersList: (
      studentId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        /** Ordering */
        ordering?: ('-due' | 'due')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** @format uuid */
        school_cycle?: string;
        status?: ('DUE' | 'OUTSTANDING' | 'PAID' | 'PENDING')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardDependentOrderList, any>({
        path: `/api/v1/dashboard/students/${studentId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsOrdersRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/orders/{id}/
     * @secure
     */
    apiV1DashboardStudentsOrdersRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<DashboardDependentOrderDetail, any>({
        path: `/api/v1/dashboard/students/${studentId}/orders/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description - Class that implements this mixin and need overwrite get_serializer_context must call super().get_serializer_context() - This class must be in first posición in the class inheritance
     *
     * @tags api
     * @name ApiV1DashboardStudentsOrdersExcelCreate
     * @request POST:/api/v1/dashboard/students/{student_id}/orders/excel/
     * @secure
     */
    apiV1DashboardStudentsOrdersExcelCreate: (studentId: string, data: ExcelReport, params: RequestParams = {}) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/students/${studentId}/orders/excel/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsScholarshipsList
     * @request GET:/api/v1/dashboard/students/{student_id}/scholarships/
     * @secure
     */
    apiV1DashboardStudentsScholarshipsList: (
      studentId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** SchoolCycleId */
        school_cycle_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedScholarshipList, any>({
        path: `/api/v1/dashboard/students/${studentId}/scholarships/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsScholarshipsDestroy
     * @request DELETE:/api/v1/dashboard/students/{student_id}/scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsScholarshipsDestroy: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/scholarships/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsList
     * @request GET:/api/v1/dashboard/students/{student_id}/student_scholarships/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsList: (
      studentId: string,
      query?: {
        /** ScholarshipId */
        scholarship_id?: string;
        /** SchoolCycleId */
        school_cycle_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentScholarshipRetrieve[], any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create scholarship assignments with sponsored payment pre-validation. Query Parameters: - confirm_sponsored_payment: Set to true to bypass sponsored payment warning
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsCreate
     * @request POST:/api/v1/dashboard/students/{student_id}/student_scholarships/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsCreate: (
      studentId: string,
      data: StudentScholarshipCreate[],
      query?: {
        /** Set to true to confirm scholarship assignment despite sponsored payment warning */
        confirm_sponsored_payment?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentScholarshipCreate, any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsRetrieve
     * @request GET:/api/v1/dashboard/students/{student_id}/student_scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<StudentScholarshipRetrieve, any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsUpdate
     * @request PUT:/api/v1/dashboard/students/{student_id}/student_scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsUpdate: (
      id: string,
      studentId: string,
      data: StudentScholarshipUpdate[],
      params: RequestParams = {}
    ) =>
      this.request<StudentScholarshipUpdate, any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsPartialUpdate
     * @request PATCH:/api/v1/dashboard/students/{student_id}/student_scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsPartialUpdate: (
      id: string,
      studentId: string,
      data: PatchedStudentScholarshipCreate,
      params: RequestParams = {}
    ) =>
      this.request<StudentScholarshipCreate, any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsDestroy
     * @request DELETE:/api/v1/dashboard/students/{student_id}/student_scholarships/{id}/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsDestroy: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV1DashboardStudentsStudentScholarshipsManyDestroy
     * @request DELETE:/api/v1/dashboard/students/{student_id}/student_scholarships/many/
     * @secure
     */
    apiV1DashboardStudentsStudentScholarshipsManyDestroy: (
      studentId: string,
      query?: {
        /** Scholarship Ids */
        scholarship_ids?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/students/${studentId}/student_scholarships/many/`,
        method: 'DELETE',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Create a new table link with filters and column customizer
     *
     * @tags Table Links
     * @name ApiV1DashboardTableLinksCreateCreate
     * @request POST:/api/v1/dashboard/table-links/create/
     * @secure
     */
    apiV1DashboardTableLinksCreateCreate: (data: TableLinkCreateRequest, params: RequestParams = {}) =>
      this.request<TableLinkResponse, ErrorResponse>({
        path: `/api/v1/dashboard/table-links/create/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve a table link by its hash value
     *
     * @tags Table Links
     * @name ApiV1DashboardTableLinksHashRetrieve
     * @request GET:/api/v1/dashboard/table-links/hash/{hash}/
     * @secure
     */
    apiV1DashboardTableLinksHashRetrieve: (hash: string, params: RequestParams = {}) =>
      this.request<TableLinkResponse, ErrorResponse>({
        path: `/api/v1/dashboard/table-links/hash/${hash}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a table link with new filters or column customizer
     *
     * @tags Table Links
     * @name ApiV1DashboardTableLinksUpdateUpdate
     * @request PUT:/api/v1/dashboard/table-links/update/{hash}/
     * @secure
     */
    apiV1DashboardTableLinksUpdateUpdate: (hash: string, data: TableLinkUpdateRequest, params: RequestParams = {}) =>
      this.request<TableLinkResponse, ErrorResponse>({
        path: `/api/v1/dashboard/table-links/update/${hash}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new table link or update if exists based on user, school, and table name
     *
     * @tags Table Links
     * @name ApiV1DashboardTableLinksUpsertCreate
     * @request POST:/api/v1/dashboard/table-links/upsert/
     * @secure
     */
    apiV1DashboardTableLinksUpsertCreate: (data: TableLinkCreateRequest, params: RequestParams = {}) =>
      this.request<TableLinkResponse, ErrorResponse>({
        path: `/api/v1/dashboard/table-links/upsert/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardianNotificationUpdate
     * @request PUT:/api/v1/guardian_notification/{id}/
     * @secure
     */
    apiV1GuardianNotificationUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/guardian_notification/${id}/`,
        method: 'PUT',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardianNotificationPartialUpdate
     * @request PATCH:/api/v1/guardian_notification/{id}/
     * @secure
     */
    apiV1GuardianNotificationPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/guardian_notification/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardianNotificationOpenedUpdate
     * @request PUT:/api/v1/guardian_notification/{id}/opened/
     * @secure
     */
    apiV1GuardianNotificationOpenedUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/guardian_notification/${id}/opened/`,
        method: 'PUT',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansRetrieve
     * @request GET:/api/v1/guardians/{id}/
     * @secure
     */
    apiV1GuardiansRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansUpdate
     * @request PUT:/api/v1/guardians/{id}/
     * @secure
     */
    apiV1GuardiansUpdate: (id: string, data: RetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansPartialUpdate
     * @request PATCH:/api/v1/guardians/{id}/
     * @secure
     */
    apiV1GuardiansPartialUpdate: (
      id: string,
      data: PatchedUpdateGuardian,
      query?: {
        /** Force update out onboarding stage */
        force?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<UpdateGuardian, any>({
        path: `/api/v1/guardians/${id}/`,
        method: 'PATCH',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansValidateBillingCreate
     * @request POST:/api/v1/guardians/{id}/validate_billing/
     * @secure
     */
    apiV1GuardiansValidateBillingCreate: (id: string, data: RetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/${id}/validate_billing/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansAssignBillingPartialUpdate
     * @request PATCH:/api/v1/guardians/assign_billing/
     * @secure
     */
    apiV1GuardiansAssignBillingPartialUpdate: (data: PatchedRetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/assign_billing/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansAssignBillingsPartialUpdate
     * @request PATCH:/api/v1/guardians/assign_billings/
     * @secure
     */
    apiV1GuardiansAssignBillingsPartialUpdate: (data: PatchedAssignBillings, params: RequestParams = {}) =>
      this.request<AssignBillings, any>({
        path: `/api/v1/guardians/assign_billings/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansAuthCreate
     * @request POST:/api/v1/guardians/auth/
     * @secure
     */
    apiV1GuardiansAuthCreate: (data: AuthRequest, params: RequestParams = {}) =>
      this.request<RetrieveGuardianWithToken, any>({
        path: `/api/v1/guardians/auth/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansExternalAuthCreate
     * @request POST:/api/v1/guardians/external_auth/
     * @secure
     */
    apiV1GuardiansExternalAuthCreate: (data: ExternalAuthRequest, params: RequestParams = {}) =>
      this.request<RetrieveGuardianWithToken, any>({
        path: `/api/v1/guardians/external_auth/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginCreate
     * @request POST:/api/v1/guardians/login/
     * @secure
     */
    apiV1GuardiansLoginCreate: (data: GuardianLogin, params: RequestParams = {}) =>
      this.request<GuardianLoginResponse, any>({
        path: `/api/v1/guardians/login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginRetrieve
     * @request GET:/api/v1/guardians/login/{id}/
     * @secure
     */
    apiV1GuardiansLoginRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginUpdate
     * @request PUT:/api/v1/guardians/login/{id}/
     * @secure
     */
    apiV1GuardiansLoginUpdate: (id: string, data: RetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginPartialUpdate
     * @request PATCH:/api/v1/guardians/login/{id}/
     * @secure
     */
    apiV1GuardiansLoginPartialUpdate: (
      id: string,
      data: PatchedUpdateGuardian,
      query?: {
        /** Force update out onboarding stage */
        force?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<UpdateGuardian, any>({
        path: `/api/v1/guardians/login/${id}/`,
        method: 'PATCH',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginValidateBillingCreate
     * @request POST:/api/v1/guardians/login/{id}/validate_billing/
     * @secure
     */
    apiV1GuardiansLoginValidateBillingCreate: (id: string, data: RetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/${id}/validate_billing/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginAssignBillingPartialUpdate
     * @request PATCH:/api/v1/guardians/login/assign_billing/
     * @secure
     */
    apiV1GuardiansLoginAssignBillingPartialUpdate: (data: PatchedRetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/assign_billing/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginAssignBillingsPartialUpdate
     * @request PATCH:/api/v1/guardians/login/assign_billings/
     * @secure
     */
    apiV1GuardiansLoginAssignBillingsPartialUpdate: (data: PatchedAssignBillings, params: RequestParams = {}) =>
      this.request<AssignBillings, any>({
        path: `/api/v1/guardians/login/assign_billings/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginAuthCreate
     * @request POST:/api/v1/guardians/login/auth/
     * @secure
     */
    apiV1GuardiansLoginAuthCreate: (data: AuthRequest, params: RequestParams = {}) =>
      this.request<RetrieveGuardianWithToken, any>({
        path: `/api/v1/guardians/login/auth/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginExternalAuthCreate
     * @request POST:/api/v1/guardians/login/external_auth/
     * @secure
     */
    apiV1GuardiansLoginExternalAuthCreate: (data: ExternalAuthRequest, params: RequestParams = {}) =>
      this.request<RetrieveGuardianWithToken, any>({
        path: `/api/v1/guardians/login/external_auth/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginLoginCreate
     * @request POST:/api/v1/guardians/login/login/
     * @secure
     */
    apiV1GuardiansLoginLoginCreate: (data: GuardianLogin, params: RequestParams = {}) =>
      this.request<GuardianLoginResponse, any>({
        path: `/api/v1/guardians/login/login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginMeRetrieve
     * @request GET:/api/v1/guardians/login/me/
     * @secure
     */
    apiV1GuardiansLoginMeRetrieve: (params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/me/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginSchoolLoginCreate
     * @request POST:/api/v1/guardians/login/school_login/
     * @secure
     */
    apiV1GuardiansLoginSchoolLoginCreate: (data: RetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/school_login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginSendCodeCreate
     * @request POST:/api/v1/guardians/login/send_code/
     * @secure
     */
    apiV1GuardiansLoginSendCodeCreate: (data: SendCodeRequest, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/login/send_code/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansLoginVerifyGuardiansCreate
     * @request POST:/api/v1/guardians/login/verify_guardians/
     * @secure
     */
    apiV1GuardiansLoginVerifyGuardiansCreate: (data: GuardianFacturamaValidateIds, params: RequestParams = {}) =>
      this.request<GuardianFacturamaValidated[], any>({
        path: `/api/v1/guardians/login/verify_guardians/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansMeRetrieve
     * @request GET:/api/v1/guardians/me/
     * @secure
     */
    apiV1GuardiansMeRetrieve: (params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/me/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansSchoolLoginCreate
     * @request POST:/api/v1/guardians/school_login/
     * @secure
     */
    apiV1GuardiansSchoolLoginCreate: (data: RetrieveGuardian, params: RequestParams = {}) =>
      this.request<RetrieveGuardian, any>({
        path: `/api/v1/guardians/school_login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansShortUrlsList
     * @request GET:/api/v1/guardians/short_urls/
     * @secure
     */
    apiV1GuardiansShortUrlsList: (
      query: {
        /** @minLength 1 */
        hash: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UrlShortenerResponse[], any>({
        path: `/api/v1/guardians/short_urls/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1GuardiansVerifyGuardiansCreate
     * @request POST:/api/v1/guardians/verify_guardians/
     * @secure
     */
    apiV1GuardiansVerifyGuardiansCreate: (data: GuardianFacturamaValidateIds, params: RequestParams = {}) =>
      this.request<GuardianFacturamaValidated[], any>({
        path: `/api/v1/guardians/verify_guardians/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Webhook to receive kushki notifications.
     *
     * @tags api
     * @name ApiV1KushkiPayoutStatusCreate
     * @request POST:/api/v1/kushki/payout_status/
     * @secure
     */
    apiV1KushkiPayoutStatusCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/kushki/payout_status/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1KushkiCheckoutNotificationsCreate
     * @request POST:/api/v1/kushki_checkout/notifications/
     * @secure
     */
    apiV1KushkiCheckoutNotificationsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/kushki_checkout/notifications/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description List all kushki Checkout preferences
     *
     * @tags api
     * @name ApiV1KushkiCheckoutPreferencesCreate
     * @request POST:/api/v1/kushki_checkout/preferences/
     * @secure
     */
    apiV1KushkiCheckoutPreferencesCreate: (data: CreateKushkiPreference, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v1/kushki_checkout/preferences/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1PayinsStatsRetrieve
     * @request GET:/api/v1/payins/stats/
     * @secure
     */
    apiV1PayinsStatsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/payins/stats/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Create Checkout
     *
     * @tags api
     * @name ApiV1PaymentsV2CheckoutCreate
     * @request POST:/api/v1/payments_v2/checkout/
     * @secure
     */
    apiV1PaymentsV2CheckoutCreate: (data: PaymentRequest, params: RequestParams = {}) =>
      this.request<PaymentResponse, any>({
        path: `/api/v1/payments_v2/checkout/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mark Payment as Blocked
     *
     * @tags api
     * @name ApiV1PaymentsV2MarkPaymentAsBlockedCreate
     * @request POST:/api/v1/payments_v2/mark_payment_as_blocked/
     * @secure
     */
    apiV1PaymentsV2MarkPaymentAsBlockedCreate: (data: PaymentBlockedRequest, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/v1/payments_v2/mark_payment_as_blocked/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get Payment Status
     *
     * @tags api
     * @name ApiV1PaymentsV2PaymentStatusRetrieve
     * @request GET:/api/v1/payments_v2/payment-status/{payment_id}/
     * @secure
     */
    apiV1PaymentsV2PaymentStatusRetrieve: (paymentId: string, params: RequestParams = {}) =>
      this.request<
        {
          /** Payment status */
          status?: string;
          /** Payment content */
          content?: object;
        },
        void
      >({
        path: `/api/v1/payments_v2/payment-status/${paymentId}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all features available for the user
     *
     * @tags api
     * @name ApiV1PortalFeaturesList
     * @request GET:/api/v1/portal/features/
     * @secure
     */
    apiV1PortalFeaturesList: (params: RequestParams = {}) =>
      this.request<FeatureToggle[], any>({
        path: `/api/v1/portal/features/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsRetrieve
     * @request GET:/api/v1/schools/{id}/
     * @secure
     */
    apiV1SchoolsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<School, any>({
        path: `/api/v1/schools/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description List blocked periods for school
     *
     * @tags api
     * @name ApiV1SchoolsBlockedPeriodsList
     * @request GET:/api/v1/schools/{school_id}/blocked-periods/
     * @secure
     */
    apiV1SchoolsBlockedPeriodsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSchoolBlockedPeriodResponseList, any>({
        path: `/api/v1/schools/${schoolId}/blocked-periods/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create school blocked period
     *
     * @tags api
     * @name ApiV1SchoolsBlockedPeriodsCreate
     * @request POST:/api/v1/schools/{school_id}/blocked-periods/
     * @secure
     */
    apiV1SchoolsBlockedPeriodsCreate: (
      schoolId: string,
      data: CreateSchoolBlockedPeriodRequest,
      params: RequestParams = {}
    ) =>
      this.request<SchoolBlockedPeriodResponse, void>({
        path: `/api/v1/schools/${schoolId}/blocked-periods/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete school blocked period
     *
     * @tags api
     * @name ApiV1SchoolsBlockedPeriodsDestroy
     * @request DELETE:/api/v1/schools/{school_id}/blocked-periods/{id}/
     * @secure
     */
    apiV1SchoolsBlockedPeriodsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/v1/schools/${schoolId}/blocked-periods/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Check if payments are blocked for a school
     *
     * @tags api
     * @name ApiV1SchoolsBlockedPeriodsCheckRetrieve
     * @request GET:/api/v1/schools/{school_id}/blocked-periods/check/
     * @secure
     */
    apiV1SchoolsBlockedPeriodsCheckRetrieve: (
      schoolId: string,
      query?: {
        /** @format date */
        date?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<CheckBlockActiveResponse, void>({
        path: `/api/v1/schools/${schoolId}/blocked-periods/check/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create school blocked period without restrictions (Staff only)
     *
     * @tags api
     * @name ApiV1SchoolsBlockedPeriodsWithoutRestrictionsCreate
     * @request POST:/api/v1/schools/{school_id}/blocked-periods/without-restrictions/
     * @secure
     */
    apiV1SchoolsBlockedPeriodsWithoutRestrictionsCreate: (
      schoolId: string,
      data: CreateSchoolBlockedPeriodRequest,
      params: RequestParams = {}
    ) =>
      this.request<SchoolBlockedPeriodResponse, void>({
        path: `/api/v1/schools/${schoolId}/blocked-periods/without-restrictions/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) fulfillments.
     *
     * @tags api
     * @name ApiV1SchoolsFulfillmentsList
     * @request GET:/api/v1/schools/{school_id}/fulfillments/
     * @secure
     */
    apiV1SchoolsFulfillmentsList: (schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardFulfillment[], any>({
        path: `/api/v1/schools/${schoolId}/fulfillments/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for managing school levels. This viewset handles CRUD operations for school levels, with special handling for list and create operations.
     *
     * @tags api
     * @name ApiV1SchoolsLevelsList
     * @request GET:/api/v1/schools/{school_id}/levels/
     * @secure
     */
    apiV1SchoolsLevelsList: (
      schoolId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<InternalSchool[], any>({
        path: `/api/v1/schools/${schoolId}/levels/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for managing school levels. This viewset handles CRUD operations for school levels, with special handling for list and create operations.
     *
     * @tags api
     * @name ApiV1SchoolsLevelsCreate
     * @request POST:/api/v1/schools/{school_id}/levels/
     * @secure
     */
    apiV1SchoolsLevelsCreate: (schoolId: string, data: LevelCreate, params: RequestParams = {}) =>
      this.request<LevelCreate, any>({
        path: `/api/v1/schools/${schoolId}/levels/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsOnlineStoreList
     * @request GET:/api/v1/schools/{school_id}/online-store/
     * @secure
     */
    apiV1SchoolsOnlineStoreList: (
      schoolId: string,
      query?: {
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        /** Ordering */
        ordering?: ('-price' | '-sold_units' | '-stock' | 'price' | 'sold_units' | 'stock')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** @format uuid */
        school?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedOptionalOrderList, any>({
        path: `/api/v1/schools/${schoolId}/online-store/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsOptionalOrdersList
     * @request GET:/api/v1/schools/{school_id}/optional-orders/
     * @secure
     */
    apiV1SchoolsOptionalOrdersList: (
      schoolId: string,
      query?: {
        multiple_search?: string;
        /** Offering of the concept */
        offering?: ('MIX' | 'OPEN_LOOP' | 'SCHOLAR')[];
        /** Ordering */
        ordering?: ('-price' | '-sold_units' | '-stock' | 'price' | 'sold_units' | 'stock')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** @format uuid */
        school?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedGuardianDependentOrderList, any>({
        path: `/api/v1/schools/${schoolId}/optional-orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) fulfillment.
     *
     * @tags api
     * @name ApiV1SchoolsOrdersList
     * @request GET:/api/v1/schools/{school_id}/orders/
     * @secure
     */
    apiV1SchoolsOrdersList: (
      schoolId: string,
      query?: {
        collected_at?: 'collected_at_portal' | 'collected_at_school';
        /** Type of the concept. */
        concept_type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        due_status?: 'future' | 'outstanding';
        /** @format date */
        end_date?: string;
        /** Group */
        group?: 'delinquent';
        /** Multiple values may be separated by commas. */
        guardians?: string[];
        /** Multiple values may be separated by commas. */
        ids?: string[];
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-due' | 'due')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Type of the payin */
        payment_methods?: (
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'compensation'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'giving'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school?: string;
        /** @format uuid */
        school_cycle?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** @format uuid */
        student?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedGuardianDependentFulfillmentList, any>({
        path: `/api/v1/schools/${schoolId}/orders/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) orders.
     *
     * @tags api
     * @name ApiV1SchoolsPayinsList
     * @request GET:/api/v1/schools/{school_id}/payins/
     * @secure
     */
    apiV1SchoolsPayinsList: (schoolId: string, params: RequestParams = {}) =>
      this.request<GuardianDependentPayin[], any>({
        path: `/api/v1/schools/${schoolId}/payins/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) orders.
     *
     * @tags api
     * @name ApiV1SchoolsPayinsDestroy
     * @request DELETE:/api/v1/schools/{school_id}/payins/{id}/
     * @secure
     */
    apiV1SchoolsPayinsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/schools/${schoolId}/payins/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Report a payment as paid, updating the timestamp.
     *
     * @tags api
     * @name ApiV1SchoolsPayinsReportAsPaidCreate
     * @request POST:/api/v1/schools/{school_id}/payins/{id}/report-as-paid/
     * @secure
     */
    apiV1SchoolsPayinsReportAsPaidCreate: (
      id: string,
      schoolId: string,
      data: UserReportAsPaid,
      params: RequestParams = {}
    ) =>
      this.request<void, Record<string, any>>({
        path: `/api/v1/schools/${schoolId}/payins/${id}/report-as-paid/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Endpoint to send invoices via email to guardian.
     *
     * @tags api
     * @name ApiV1SchoolsPayinsSendInvoicesToEmailCreate
     * @request POST:/api/v1/schools/{school_id}/payins/{id}/send_invoices_to_email/
     * @secure
     */
    apiV1SchoolsPayinsSendInvoicesToEmailCreate: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<GuardianDependentPayin, any>({
        path: `/api/v1/schools/${schoolId}/payins/${id}/send_invoices_to_email/`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint to upload file as proof that payment was done.
     *
     * @tags api
     * @name ApiV1SchoolsPayinsUploadProofOfPaymentUpdate
     * @request PUT:/api/v1/schools/{school_id}/payins/{id}/upload-proof-of-payment/
     * @secure
     */
    apiV1SchoolsPayinsUploadProofOfPaymentUpdate: (
      id: string,
      schoolId: string,
      data: PayinProofOfPaymentRequest,
      params: RequestParams = {}
    ) =>
      this.request<GuardianDependentPayin, any>({
        path: `/api/v1/schools/${schoolId}/payins/${id}/upload-proof-of-payment/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSectionsList
     * @request GET:/api/v1/schools/{school_id}/sections/
     * @secure
     */
    apiV1SchoolsSectionsList: (
      schoolId: string,
      query?: {
        /** join_by_pipe */
        join_by_pipe?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardSchoolSection[], any>({
        path: `/api/v1/schools/${schoolId}/sections/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSignupCreate
     * @request POST:/api/v1/schools/{school_id}/signup/
     * @secure
     */
    apiV1SchoolsSignupCreate: (schoolId: string, data: SignupGuardian, params: RequestParams = {}) =>
      this.request<
        {
          /** @example "guardians/xxxxxxxxx/auth?token=xxxxxxxxxxxx" */
          url: string;
        },
        RetrieveGuardian
      >({
        path: `/api/v1/schools/${schoolId}/signup/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSubscriptionsList
     * @request GET:/api/v1/schools/{school_id}/subscriptions/
     * @secure
     */
    apiV1SchoolsSubscriptionsList: (schoolId: string, params: RequestParams = {}) =>
      this.request<ListSubscriptionResponseDTO[], any>({
        path: `/api/v1/schools/${schoolId}/subscriptions/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSubscriptionsCreate
     * @request POST:/api/v1/schools/{school_id}/subscriptions/
     * @secure
     */
    apiV1SchoolsSubscriptionsCreate: (
      schoolId: string,
      data: CreateSubscriptionRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<CreateSubscriptionRequestDTO, any>({
        path: `/api/v1/schools/${schoolId}/subscriptions/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSubscriptionsRetrieve
     * @request GET:/api/v1/schools/{school_id}/subscriptions/{id}/
     * @secure
     */
    apiV1SchoolsSubscriptionsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<RetrieveSubscriptionResponseDTO, any>({
        path: `/api/v1/schools/${schoolId}/subscriptions/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSubscriptionsDestroy
     * @request DELETE:/api/v1/schools/{school_id}/subscriptions/{id}/
     * @secure
     */
    apiV1SchoolsSubscriptionsDestroy: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/schools/${schoolId}/subscriptions/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SchoolsSubscriptionsConceptsList
     * @request GET:/api/v1/schools/{school_id}/subscriptions/concepts/
     * @secure
     */
    apiV1SchoolsSubscriptionsConceptsList: (schoolId: string, params: RequestParams = {}) =>
      this.request<RetrieveSubscribableConceptsResponseDTO[], any>({
        path: `/api/v1/schools/${schoolId}/subscriptions/concepts/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Validate order stock quantity
     * @name ApiV1SchoolsValidateStockCreate
     * @request POST:/api/v1/schools/{school_id}/validate_stock/
     * @secure
     */
    apiV1SchoolsValidateStockCreate: (schoolId: string, data: OrderStockValidate, params: RequestParams = {}) =>
      this.request<OrderStockValidateResponse[], any>({
        path: `/api/v1/schools/${schoolId}/validate_stock/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SlackInteractionCreate
     * @request POST:/api/v1/slack/interaction/
     * @secure
     */
    apiV1SlackInteractionCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/slack/interaction/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description ViewSet for students dependent of a guardian
     *
     * @tags api
     * @name ApiV1StudentsList
     * @request GET:/api/v1/students/
     * @secure
     */
    apiV1StudentsList: (params: RequestParams = {}) =>
      this.request<GuardianStudent[], any>({
        path: `/api/v1/students/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for students dependent of a guardian
     *
     * @tags api
     * @name ApiV1StudentsCreate
     * @request POST:/api/v1/students/
     * @secure
     */
    apiV1StudentsCreate: (data: GuardianStudentCreate[], params: RequestParams = {}) =>
      this.request<GuardianStudentCreate[], any>({
        path: `/api/v1/students/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for students dependent of a guardian
     *
     * @tags api
     * @name ApiV1StudentsRetrieve
     * @request GET:/api/v1/students/{student_id}/
     * @secure
     */
    apiV1StudentsRetrieve: (studentId: string, params: RequestParams = {}) =>
      this.request<GuardianStudent, any>({
        path: `/api/v1/students/${studentId}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for students dependent of a guardian
     *
     * @tags api
     * @name ApiV1StudentsUpdate
     * @request PUT:/api/v1/students/{student_id}/
     * @secure
     */
    apiV1StudentsUpdate: (studentId: string, data: GuardianStudent, params: RequestParams = {}) =>
      this.request<GuardianStudent, any>({
        path: `/api/v1/students/${studentId}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description ViewSet for students dependent of a guardian
     *
     * @tags api
     * @name ApiV1StudentsPartialUpdate
     * @request PATCH:/api/v1/students/{student_id}/
     * @secure
     */
    apiV1StudentsPartialUpdate: (studentId: string, data: PatchedGuardianStudent, params: RequestParams = {}) =>
      this.request<GuardianStudent, any>({
        path: `/api/v1/students/${studentId}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) orders.
     *
     * @tags api
     * @name ApiV1StudentsOrdersList
     * @request GET:/api/v1/students/{student_id}/orders/
     * @secure
     */
    apiV1StudentsOrdersList: (studentId: string, params: RequestParams = {}) =>
      this.request<StudentOrder[], any>({
        path: `/api/v1/students/${studentId}/orders/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) orders.
     *
     * @tags api
     * @name ApiV1StudentsOrdersRetrieve
     * @request GET:/api/v1/students/{student_id}/orders/{id}/
     * @secure
     */
    apiV1StudentsOrdersRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<DetailedStudentOrder, any>({
        path: `/api/v1/students/${studentId}/orders/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Viewset to interact with a student (payment) orders.
     *
     * @tags api
     * @name ApiV1StudentsOrdersInvoiceUrlsRetrieve
     * @request GET:/api/v1/students/{student_id}/orders/{id}/invoice_urls/
     * @secure
     */
    apiV1StudentsOrdersInvoiceUrlsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<InvoiceUrls, any>({
        path: `/api/v1/students/${studentId}/orders/${id}/invoice_urls/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1SubscriptionsNotificationsCreate
     * @request POST:/api/v1/subscriptions/notifications/
     * @secure
     */
    apiV1SubscriptionsNotificationsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/subscriptions/notifications/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Returns the authentication url given a phone number.
     *
     * @tags api
     * @name ApiV1TrebleGuardianUrlCreate
     * @request POST:/api/v1/treble/guardian_url/
     * @secure
     */
    apiV1TrebleGuardianUrlCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/treble/guardian_url/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Returns the authentication url and subscription info for a guardian.
     *
     * @tags api
     * @name ApiV1TwilioGuardianUrlCreate
     * @request POST:/api/v1/twilio/guardian_url/
     * @secure
     */
    apiV1TwilioGuardianUrlCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/twilio/guardian_url/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1UsersCreate
     * @request POST:/api/v1/users/
     * @secure
     */
    apiV1UsersCreate: (data: CreateUser, params: RequestParams = {}) =>
      this.request<CreateUser, any>({
        path: `/api/v1/users/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates,retrieves and auth user accounts
     *
     * @tags api
     * @name ApiV1UsersRetrieve
     * @request GET:/api/v1/users/{id}/
     * @secure
     */
    apiV1UsersRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/v1/users/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates,retrieves and auth user accounts
     *
     * @tags api
     * @name ApiV1UsersUpdate
     * @request PUT:/api/v1/users/{id}/
     * @secure
     */
    apiV1UsersUpdate: (id: string, data: User, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/v1/users/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates,retrieves and auth user accounts
     *
     * @tags api
     * @name ApiV1UsersPartialUpdate
     * @request PATCH:/api/v1/users/{id}/
     * @secure
     */
    apiV1UsersPartialUpdate: (id: string, data: PatchedUser, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/v1/users/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates,retrieves and auth user accounts
     *
     * @tags api
     * @name ApiV1UsersAuthCreate
     * @request POST:/api/v1/users/auth/
     */
    apiV1UsersAuthCreate: (data: AuthDashboardRequestDTO, params: RequestParams = {}) =>
      this.request<AuthDashboardResponseDTO, any>({
        path: `/api/v1/users/auth/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates,retrieves and auth user accounts
     *
     * @tags api
     * @name ApiV1UsersEmailCreate
     * @request POST:/api/v1/users/email/
     * @secure
     */
    apiV1UsersEmailCreate: (data: EmailRequestDTO, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/v1/users/email/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates,retrieves and auth user accounts
     *
     * @tags unused
     * @name ApiV1UsersMeRetrieve
     * @request GET:/api/v1/users/me/
     * @secure
     */
    apiV1UsersMeRetrieve: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/v1/users/me/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description List all commissions checkout preferences
     *
     * @tags api
     * @name ApiV1ValidatePreferencesCreate
     * @request POST:/api/v1/validate/preferences/
     * @secure
     */
    apiV1ValidatePreferencesCreate: (data: ValidatePreference, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v1/validate/preferences/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns students grouped by level. Supports required_fields parameter to validate student information completeness and add counters.
     *
     * @tags Student By Level ViewSet V2
     * @name ApiV2DashboardSchoolsStudentsByLevelList
     * @request GET:/api/v2/dashboard/schools/{school_id}/students_by_level/
     * @secure
     */
    apiV2DashboardSchoolsStudentsByLevelList: (
      schoolId: string,
      query?: {
        /** Filter by Concept UUID(str) */
        concepts?: string[];
        /** Filter by delinquency value */
        delinquency?: ('high' | 'low' | 'mid' | 'zero')[];
        /** @format date */
        entry_date?: string;
        /** Filter by debt */
        has_debt?: boolean;
        /** A page number within the paginated result set. */
        page?: number;
        /** Comma-separated list of fields to validate for completeness. Valid values: name, last_name, enrollment_code, identifier, photo, level, grade, group. */
        required_fields?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        /** Filter by school cycle UUID(str) */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedStudentByLevelSerializerV2List, any>({
        path: `/api/v2/dashboard/schools/${schoolId}/students_by_level/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV2DashboardSchoolsStudentsByLevelFiltersRetrieve
     * @request GET:/api/v2/dashboard/schools/{school_id}/students_by_level/filters/
     * @secure
     */
    apiV2DashboardSchoolsStudentsByLevelFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewStudentsByLevel, any>({
        path: `/api/v2/dashboard/schools/${schoolId}/students_by_level/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV2DashboardStudentsConceptsList
     * @request GET:/api/v2/dashboard/students/{student_id}/concepts/
     * @secure
     */
    apiV2DashboardStudentsConceptsList: (
      studentId: string,
      query?: {
        /** Multiple values may be separated by commas. */
        cycle_id?: string[];
        optional?: boolean;
        /** Type of the concept. */
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentConcept[], any>({
        path: `/api/v2/dashboard/students/${studentId}/concepts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generic Viewset extension for endpoint with a student_id in the kwargs
     *
     * @tags api
     * @name ApiV2DashboardStudentsConceptsRetrieve
     * @request GET:/api/v2/dashboard/students/{student_id}/concepts/{id}/
     * @secure
     */
    apiV2DashboardStudentsConceptsRetrieve: (id: string, studentId: string, params: RequestParams = {}) =>
      this.request<StudentConceptDetailSerializerV2, any>({
        path: `/api/v2/dashboard/students/${studentId}/concepts/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description This endpoint replaces the /api/internal/schools/reminders/paidreminder/ and it doesn't support pagination
     *
     * @tags api
     * @name ApiV2InternalSchoolsPaymentReminderCreate
     * @request POST:/api/v2/internal/schools/payment-reminder/
     * @secure
     */
    apiV2InternalSchoolsPaymentReminderCreate: (data: PaymentReminderRequest[], params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v2/internal/schools/payment-reminder/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV2SchoolsPayinsList
     * @request GET:/api/v2/schools/{school_id}/payins/
     * @secure
     */
    apiV2SchoolsPayinsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedGuardianListPayinSerializerV2List, any>({
        path: `/api/v2/schools/${schoolId}/payins/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV2SchoolsPayinsRetrieve
     * @request GET:/api/v2/schools/{school_id}/payins/{id}/
     * @secure
     */
    apiV2SchoolsPayinsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<GuardianPayinSerializerV2, any>({
        path: `/api/v2/schools/${schoolId}/payins/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV2SchoolsInscriptionsCheckPaymentsCreate
     * @request POST:/api/v2/schools/inscriptions/check_payments/
     * @secure
     */
    apiV2SchoolsInscriptionsCheckPaymentsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v2/schools/inscriptions/check_payments/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV2SchoolsSchoolCycleRetrieve
     * @request GET:/api/v2/schools/school_cycle/{school_cycle_id}/
     * @secure
     */
    apiV2SchoolsSchoolCycleRetrieve: (schoolCycleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v2/schools/school_cycle/${schoolCycleId}/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV2StudentsUploadPhotoUpdate
     * @request PUT:/api/v2/students/{id}/upload_photo/
     * @secure
     */
    apiV2StudentsUploadPhotoUpdate: (id: string, data: UploadPhotoDTO, params: RequestParams = {}) =>
      this.request<UploadPhotoResponseDTO, any>({
        path: `/api/v2/students/${id}/upload_photo/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Students Due Orders ViewSet
     * @name ApiV4DashboardSchoolsDueOrdersStudentsList
     * @request GET:/api/v4/dashboard/schools/{school_id}/due_orders/students/
     * @secure
     */
    apiV4DashboardSchoolsDueOrdersStudentsList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by delinquency value */
        delinquency?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by student inscription status */
        inscription_status?: ('Inscrito' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
        is_active?: boolean;
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Ordering */
        ordering?: (
          | '-created'
          | '-due_orders'
          | '-due_orders_total'
          | '-due_total'
          | '-enrollment_code'
          | '-first_name'
          | '-last_name'
          | '-level'
          | '-section'
          | 'created'
          | 'due_orders'
          | 'due_orders_total'
          | 'due_total'
          | 'enrollment_code'
          | 'first_name'
          | 'last_name'
          | 'level'
          | 'section'
        )[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentListDueOrderSerializerV4List, any>({
        path: `/api/v4/dashboard/schools/${schoolId}/due_orders/students/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV4DashboardSchoolsDueOrdersStudentsRetrieve
     * @request GET:/api/v4/dashboard/schools/{school_id}/due_orders/students/{id}/
     * @secure
     */
    apiV4DashboardSchoolsDueOrdersStudentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardStudentDetail, any>({
        path: `/api/v4/dashboard/schools/${schoolId}/due_orders/students/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV4DashboardSchoolsDueOrdersStudentsFiltersRetrieve
     * @request GET:/api/v4/dashboard/schools/{school_id}/due_orders/students/filters/
     * @secure
     */
    apiV4DashboardSchoolsDueOrdersStudentsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewStudents, any>({
        path: `/api/v4/dashboard/schools/${schoolId}/due_orders/students/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV4DashboardSchoolsDueOrdersStudentsXlsCreate
     * @request POST:/api/v4/dashboard/schools/{school_id}/due_orders/students/xls/
     * @secure
     */
    apiV4DashboardSchoolsDueOrdersStudentsXlsCreate: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'DONATION'
          | 'EVENTS'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'INSURANCE'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'TRIPS'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Filter by Concept */
        concepts?: string[];
        /** Filter by delinquency value */
        delinquency?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by only due_orders of MONTHLY_FEE concept type */
        due_monthly_concepts?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by due_orders value */
        due_orders?: ('high' | 'low' | 'mid' | 'zero')[];
        /** Filter by fulfillment status */
        fulfillment_statuses?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Filter by guardian UUID(str) */
        guardian?: string[];
        /** Search by identifier */
        identifier?: string;
        /** Filter by student inscription status */
        inscription_status?: ('Inscrito' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
        is_active?: boolean;
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Ordering */
        ordering?: (
          | '-created'
          | '-due_orders'
          | '-due_orders_total'
          | '-due_total'
          | '-enrollment_code'
          | '-first_name'
          | '-last_name'
          | '-level'
          | '-section'
          | 'created'
          | 'due_orders'
          | 'due_orders_total'
          | 'due_total'
          | 'enrollment_code'
          | 'first_name'
          | 'last_name'
          | 'level'
          | 'section'
        )[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        scholarship_school_cycle?: string;
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
        /** Filter by state */
        state?: ('active' | 'dropped_out' | 'graduated' | 'inactive' | 'lead' | 'new_student')[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v4/dashboard/schools/${schoolId}/due_orders/students/xls/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV4DashboardTriggerSaveActionGuardiansCreate
     * @request POST:/api/v4/dashboard/trigger-save-action/guardians/{guardian_id}/
     * @secure
     */
    apiV4DashboardTriggerSaveActionGuardiansCreate: (guardianId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v4/dashboard/trigger-save-action/guardians/${guardianId}/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV4DashboardTriggerSaveActionStudentsCreate
     * @request POST:/api/v4/dashboard/trigger-save-action/students/{student_id}/
     * @secure
     */
    apiV4DashboardTriggerSaveActionStudentsCreate: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v4/dashboard/trigger-save-action/students/${studentId}/`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  };
  bookKeeper = {
    /**
     * @description Update Concept
     *
     * @tags book-keeper
     * @name BookKeeperConceptsPartialUpdate
     * @request PATCH:/book-keeper/concepts/{id}/
     * @secure
     */
    bookKeeperConceptsPartialUpdate: (
      id: string,
      data: PatchedBookKeeperUpdateConceptRequest,
      params: RequestParams = {}
    ) =>
      this.request<BookKeeperUpdateConceptResponse, Record<string, any>>({
        path: `/book-keeper/concepts/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get history changes for a model filtered by school
     *
     * @tags book-keeper
     * @name BookKeeperHistorySchoolsList
     * @request GET:/book-keeper/history/schools/{school_id}/
     * @secure
     */
    bookKeeperHistorySchoolsList: (
      schoolId: string,
      query: {
        /** Exclude changes with no user associated (default: true) */
        exclude_empty_users?: boolean;
        /** Comma-separated list of field names to exclude from comparison. Ignored if include_fields is specified. */
        exclude_fields?: string;
        /** Exclude changes made by staff users (default: true) */
        exclude_staff?: boolean;
        /** Comma-separated history types to filter by. Valid values: created, changed, deleted */
        history_types?: string;
        /** Comma-separated list of field names to include in comparison. When specified, only these fields will be tracked. Takes priority over exclude_fields. */
        include_fields?: string;
        /** Model identifier in format app_label.ModelName (e.g., schools.School, payins.Concept) */
        model_name: string;
        /** Optional: ID of specific object to filter history (UUID or integer) */
        object_id?: string;
        /** Page number for pagination */
        page?: number;
        /** Number of items per page (default: 10, max: 100) */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        PaginatedHistoryListResponseList,
        {
          detail?: string;
        }
      >({
        path: `/book-keeper/history/schools/${schoolId}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new massive concept assignment
     *
     * @tags book-keeper
     * @name BookKeeperMassiveConceptAssignmentsCreate
     * @request POST:/book-keeper/massive_concept_assignments/
     * @secure
     */
    bookKeeperMassiveConceptAssignmentsCreate: (data: Record<string, any>, params: RequestParams = {}) =>
      this.request<
        Record<string, any>,
        {
          detail?: string;
        }
      >({
        path: `/book-keeper/massive_concept_assignments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get massive concept assignment by ID
     *
     * @tags book-keeper
     * @name BookKeeperMassiveConceptAssignmentsRetrieve
     * @request GET:/book-keeper/massive_concept_assignments/{id}/
     * @secure
     */
    bookKeeperMassiveConceptAssignmentsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<
        Record<string, any>,
        {
          detail?: string;
        }
      >({
        path: `/book-keeper/massive_concept_assignments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cancel a massive concept assignment
     *
     * @tags book-keeper
     * @name BookKeeperMassiveConceptAssignmentsDestroy
     * @request DELETE:/book-keeper/massive_concept_assignments/{id}/
     * @secure
     */
    bookKeeperMassiveConceptAssignmentsDestroy: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          detail?: string;
        },
        {
          detail?: string;
        }
      >({
        path: `/book-keeper/massive_concept_assignments/${id}/`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get order by ID
     *
     * @tags book-keeper
     * @name BookKeeperOrdersRetrieve
     * @request GET:/book-keeper/orders/{id}/
     * @secure
     */
    bookKeeperOrdersRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<
        BookKeeperUpdateOrderResponse,
        {
          detail?: string;
        }
      >({
        path: `/book-keeper/orders/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update order. All orders must belong to the same school.
     *
     * @tags book-keeper
     * @name BookKeeperOrdersUpdate
     * @request PUT:/book-keeper/orders/{id}/
     * @secure
     */
    bookKeeperOrdersUpdate: (id: string, data: BookKeeperOrderUpdateRequest, params: RequestParams = {}) =>
      this.request<
        BookKeeperUpdateOrderResponse,
        {
          detail?: string;
        }
      >({
        path: `/book-keeper/orders/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags book-keeper
     * @name BookKeeperOrdersPartialUpdate
     * @request PATCH:/book-keeper/orders/{id}/
     * @secure
     */
    bookKeeperOrdersPartialUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/book-keeper/orders/${id}/`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),
  };
}
