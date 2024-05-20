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

export interface AffectedConcept {
  /** @format uuid */
  id: string;
  name: string;
  /** @format double */
  prev_price: number;
  /** @format double */
  new_price: number;
  fulfillments: any[];
}

export enum AffectedConceptTypesEnum {
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

export interface AssignmentStatusRequest {
  concept_id: string;
  students_ids: string[];
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
}

export interface BadRequestResponse {
  error: string;
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
  school_cycle: string;
  students_assigned_count: string;
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
  billable_dependents: SlimStudent[];
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
  section: string;
  billing_guardian: BillingGuardian;
  guardians: Guardian[];
  /** Workaround for self-onboarding process. Signals when student has concept generated. */
  is_ready?: boolean;
}

export enum BlankEnum {
  Value = '',
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

export interface ChangeLimitResponse {
  message: string;
}

export enum CollectedAtEnum {
  PortalDePagosCometa = 'Portal de pagos Cometa',
  DirectoAColegio = 'Directo a Colegio',
}

export interface CollectionsGraphic {
  period: Period;
  total_students: number;
  on_time_students: OnTimeStudentsStatistics;
  delinquent_students: DelinquentStudentsStatistics;
}

export interface CollectionsTable {
  count: number;
  next: string;
  previous: string;
  results: SlimStudent[];
  delinquent_students: number;
  /** @format double */
  payment_compliance_percentage: number;
}

export interface ColumnsResponse {
  columns: Record<string, string>;
}

export enum CompoundingEnum {
  SINGLE = 'SINGLE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  MONTHLY = 'MONTHLY',
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Concept {
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
  optional: string;
  subscription: string;
  /** Defines whether the concept can be billed, as long as the payment is made through the dashboard. */
  is_billable: boolean;
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
  /**
   * Private identifier inside school.
   * @maxLength 50
   */
  enrollment_code?: string | null;
  /** Section name */
  section?: string;
  /** Level name */
  level?: string;
  orders_to_pay: string;
  orders_payed: string;
  orders_to_pay_in_process: string;
  amount_paid: string;
  amount_to_pay: string;
  can_be_deassigned: string;
  concept_assignment_id: string;
}

export interface ConceptTypes {
  type: string;
  name: string;
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
  type: Type68EEnum;
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
  /** Indicates if concept must be use educational complement on billing. */
  use_education_complement?: boolean;
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
  type: Type68EEnum;
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
  orders?: OrderStock[];
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
  type: Type68EEnum;
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

export interface CreateMerPagoCPPreference {
  /** @format uuid */
  guardian: string;
  items: CreateServicePreferenceItem[];
  preference_type: PreferenceTypeEnum;
  back_urls?: Record<string, string>;
}

export interface CreateMercadoPagoCPGatewayNotification {
  notification: Record<string, any>;
}

export interface CreateServicePreferenceItem {
  /** @format uuid */
  student: string;
  /** @format uuid */
  order: string;
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
  /** @maxLength 128 */
  password: string;
  /** @maxLength 150 */
  first_name?: string;
  /**
   * Email address
   * Email address of the user.
   * @format email
   * @maxLength 254
   */
  email: string;
  auth_token: string;
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
  student_id: string;
  /** Student first name */
  student_first_name: string;
  /**
   * Total amount of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  total: string;
  /**
   * Subtotal amount of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  subtotal: string;
  /**
   * Discount of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  discount: string;
  /**
   * Interest of fulfillment
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
  student_id: string;
  /** Student first name */
  first_name: string;
  /** List of paid orders */
  orders: string[];
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
  /**
   * Date when order due
   * @format date
   */
  due: string | null;
  /** Status of the student order (legacy version). */
  status: string;
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
  /**
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  tax_amount: string;
  /**
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  pre_tax_price_amount: string;
  /** Final amount to be paid(after discounts and interests). */
  final_amount: string;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  currency: string;
  /**
   * Date when order due
   * @format date
   */
  due: string | null;
  /** Status of the student order (legacy version). */
  status: string;
  /** Interest amount of fulfillment(order-student). */
  interest: string;
  /** Discount amount of fulfillment(order-student). */
  discount: string;
  discount_breakdown: string;
  /** Boolean indicates if first payin associated to order is pending. */
  pending: boolean;
  dependent: string;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current pending amount to be paid. */
  pending_amount: string;
  /** Fulfillment id for order student. */
  fulfillment_id: string;
  payins: string;
  special_over_charges: string;
}

export interface DashboardFulfillment {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
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
  /**
   * Interest of fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  interest: string;
  /**
   * Discount of fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
  payout: string;
  /**
   * Current pending amount to paid.
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  guardian_commission: string;
  /** Indicates if the interest of the fulfillment are forgiven */
  interest_forgiven?: boolean;
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  paid_amount: string;
  /** Estado calculado en base a los estados de los Invoices de los payinFulfillments del fulfillment  */
  invoice_status: string;
  /** Indicate if first payment of fulfillment is collected at school. */
  collected_at_school: string;
  payout: string;
  invoices: string;
  is_sponsored: string;
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
  amount: string;
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
  invoice_status: string;
  /** Indicate if first payment of fulfillment is collected at school. */
  collected_at_school: string;
  payout: string;
  payins: Payin[];
  invoices: string;
  is_sponsored: string;
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
  type: Type787Enum;
  total_currency: string;
  invoices_pdfs: string;
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
  type: Type787Enum | NullEnum | null;
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
  transaction_reference: string;
  sender_account_number: string;
  card_last_digits: string;
  bank_name: string;
}

export interface DashboardPayinFulfillment {
  id: number;
  is_partial: boolean;
  total_paid: string;
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
  /**
   * A ModelSerializer that takes an additional `fields` argument that
   * controls which fields should be displayed.
   */
  invoice: Invoice;
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
  type: Type68EEnum;
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
  type: Type68EEnum;
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
}

export interface DashboardSchoolPayoutDetails {
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  /** Public summary for bank account related to payout. */
  bank_account: string;
  /** Account number for bank account related to payout. */
  bank_account_number: string;
  commission: string;
  payin_fulfillments: string;
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
  total_received: string;
  total_emitted: string;
  /**
   * Date when transaction must be started, this in an approximation.
   * @format date
   */
  scheduled_date?: string | null;
  orders_count: string;
  /** Unique correlative identifier for the object inside a school. */
  correlative_id: string;
  deposit_date: string;
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
   * @maxLength 50
   */
  grade: string;
  /**
   * Internal name for section inside a grade.
   * @maxLength 9
   */
  group?: string | null;
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
  levels: DashboardLevel[];
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
  school_cycle_id: string | null;
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
  level?: string;
  /** Section name */
  section?: string;
  total_debt: string;
  fulfillments: string;
  /** True when the student is currently active. */
  is_active?: boolean;
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
  level?: string;
  /** Section name */
  section?: string;
  total_debt: string;
  number_of_past_due_orders: string;
  fulfillments: string;
  guardians: string;
  /** True when the student is currently active. */
  is_active?: boolean;
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
  /** The current inscription status for the next cycle */
  inscription_status?: InscriptionStatusEnum;
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  inscription_section: InscriptionSection[];
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
  section?: string;
  level?: string;
  due_orders: string;
  due_total_price: string;
  has_partial_payins: string;
  /** True when the student is currently active. */
  is_active?: boolean;
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
}

export interface DashboardStudentListDueOrderSerializerV2 {
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
  section?: string;
  level?: string;
  due_orders: string;
  due_total_price: string;
  has_partial_payins: string;
  /** True when the student is currently active. */
  is_active?: boolean;
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
}

export interface DashboardStudentListDueOrderSerializerV3 {
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
}

export interface DashboardStudentResume {
  total: number;
  active_students: number;
  inactive_students: number;
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
  /** Level name */
  level?: string;
  /** Section name */
  section?: string;
  guardians: SlimGuardian[];
  /** True when the student is currently active. */
  is_active?: boolean;
  /** The current inscription status for the next cycle */
  inscription_status?: InscriptionStatusEnum;
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
  section?: string;
  /** Level name */
  level?: string;
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
  permission_set: string;
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
   * @maxLength 55
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
  concept: Concept;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  price_currency: string;
  /**
   * Date when order due
   * @format date
   */
  due: string | null;
  /** Status of the student order (legacy version). */
  status: string;
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
  payins: Payin[];
  invoice: Invoice;
  dependent: SlimStudent;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  /** Commission amount charged based on payin type. */
  commissions: string;
  /** Commission amount charged to guardian based on payin type. */
  guardian_commission: string;
  is_sponsored: string;
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

export interface ExternalAuthRequest {
  external_id: string;
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

export interface FilterPayouts {
  bank_accounts: BasicBankAccount[];
  statuses: BaseEnum[];
}

export interface FilterViewConcept {
  type: BaseEnum[];
  school_cycles: BaseEnum[];
}

export interface FilterViewDelinquentStudents {
  due_orders: BaseEnum[];
  concepts: Concept[];
  concept_types: BaseEnum[];
  due_monthly_concepts: BaseEnum[];
  orders: Order[];
  levels: Level[];
  sections: Section[];
  fulfillment_statuses: BaseEnum[];
  school_cycles: SchoolCycle[];
  is_active: BaseEnum[];
}

export interface FilterViewPayinFulfillment {
  collected_at: BaseEnum[];
  concepts: Concept[];
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

export interface FilterViewStudents {
  levels: Level[];
  sections: Section[];
  concepts: Concept[];
  scholarships: Scholarship[];
  due_orders: BaseEnum[];
  active: BaseEnum[];
  inscription_status: BaseEnum[];
  paid_status: BaseEnum[];
}

export interface FilterViewStudentsByLevel {
  concepts: Concept[];
  scholarships: Scholarship[];
  due_orders: BaseEnum[];
  has_debt: BaseEnum[];
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
}

export enum GenderEnum {
  M = 'M',
  F = 'F',
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
}

export interface GuardianDependentFulfillment {
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
  payins: Payin[];
  /**
   * Original amount to be paid(before discounts and interests), belongs to order price amount.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  /** Schema of detailed discounts aplied to fulfillment. */
  discount_breakdown?: Record<string, any>;
  concept: ConceptSerializerStatic;
  invoices: Invoice[];
  order_type: string;
  /**
   * Total guardian commission (commission + tax).
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  guardian_commission: string;
}

export interface GuardianDependentOrder {
  id: string;
  /**
   * Order name, tipically have format "ConceptName - DueMonth, DueYear"
   * @maxLength 250
   */
  name: string;
  student: SlimStudent;
  /**
   * Date when order due
   * @format date
   */
  due?: string | null;
  concept: ConceptSerializerStatic;
  /**
   * Original amount to be paid(before discounts and interests), belongs to order price amount.
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  discount_breakdown: {
    /** @format decimal */
    total?: string;
    details?: {
      scholarships?: {
        /** @format decimal */
        total?: string;
        details?: {
          id?: string;
          name?: string;
          /** @format decimal */
          discount?: string;
          active?: boolean;
        }[];
      };
      special?: {
        /** @format decimal */
        total?: string;
        details?: {
          id?: string;
          name?: string;
          /** @format decimal */
          discount?: string;
          type?: string;
        }[];
      };
      early_bird?: {
        /** @format decimal */
        total?: string;
        details?: {
          name?: string;
          /** @format decimal */
          discount?: string;
          until_date?: string;
        }[];
      };
    };
  };
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
  acquired: string;
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
  type: Type787Enum | NullEnum | null;
  /** Method of the payin, include but to limited to: Visa, Mastercard, Kushki, oxxo. */
  method: string | null;
  /** Payment status for the payin. */
  status: StatusC9FEnum;
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
  payment_method: PaymentMethodEnum;
  /** Source from where the payin was paid */
  collected_at: CollectedAtEnum;
  /**
   * Total paid amount
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  total_paid: string;
  payin_fulfillments: CustomPayinFulfillmentSerializerV2[];
}

export interface GuardianStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id: string;
  billing_guardian: BillingGuardian;
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
  school_cycle: string;
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
   * @maxLength 50
   */
  grade: string;
  /**
   * Internal name for section inside a grade.
   * @maxLength 9
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
}

export interface InvoiceUrls {
  pdfs: string[];
  xmls: string[];
}

/**
 * A ModelSerializer that takes an additional `fields` argument that
 * controls which fields should be displayed.
 */
export interface Level {
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

export interface ListDashboardInvoiceResponseDTO {
  id: string;
  client_identifier: string;
  billing_guardian_name: string;
  status: StatusCf3Enum;
  order_id: string;
  order_name: string;
  payment_amount: string;
  guardian_name: string;
  fiscal_identifier: string;
  payment_date: string;
  student_name: string;
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
  status?: MassiveConceptAssignmentHistoryStatusEnum;
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

export enum MassiveConceptAssignmentHistoryStatusEnum {
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

export enum MethodEnum {
  MAIL = 'MAIL',
  WHATSAPP = 'WHATSAPP',
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

export interface OrderWithAttributes {
  /**
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  order_price: string;
  attributes: AttributeCreate[];
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
}

export interface PaginatedDashboardPayinList {
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
  results?: DashboardPayin[];
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

export interface PaginatedDashboardStudentListDueOrderSerializerV2List {
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
  results?: DashboardStudentListDueOrderSerializerV2[];
}

export interface PaginatedDashboardStudentListDueOrderSerializerV3List {
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
  results?: DashboardStudentListDueOrderSerializerV3[];
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

export interface PaginatedSectionUpdateList {
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
  results?: SectionUpdate[];
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

export interface PatchedDashboardGuardian {
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
  due_total?: string;
  billing_info?: BillingGuardianInfo;
  dependents?: DashboardStudentDetail[];
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
  school_cycle_id?: string | null;
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
  permission_set?: string;
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
}

export interface PatchedGuardianStudent {
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  id?: string;
  billing_guardian?: BillingGuardian;
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
  status?: MassiveConceptAssignmentHistoryStatusEnum;
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
  status: StatusC9FEnum;
  /** Type of the payin */
  type: Type787Enum | NullEnum | null;
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  total_paid: string;
  /** Fullname of user who creates the object. */
  created_by_fullname?: string;
  /** Place where payin in collected. */
  collected_at: string;
  invoices: Invoice[];
}

export interface PayinFulfillmentDetail {
  id: number;
  is_partial: boolean;
  /**
   * Total paid amount for payin fulfillment.
   * @format decimal
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
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
  paid_date: string;
}

export enum PaymentMethodEnum {
  CuentaMercadoPago = 'Cuenta Mercado Pago',
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
}

export interface PaymentReminderRequest {
  school_id: string;
  start_date: string;
  end_date: string;
  concept_type: string;
  level_type: string;
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
  id: string;
  client_identifier: string;
  billing_guardian_name: string;
  status: StatusCf3Enum;
  order_id: string;
  order_name: string;
  payment_amount: string;
  guardian_name: string;
  invoice_date: string;
  iva: string;
  retentions: string;
  payment_method: string;
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
  token: string;
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
  affected_concept_types?: AffectedConceptTypesEnum[];
  concepts?: string[];
  /**
   * Created at
   * Date time on which the object was created.
   * @format date-time
   */
  created: string;
  /** Date when scholarship was assigned, for thispurpose is the last date of modification for StudentScholarship */
  assigned_at: string;
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

export enum ScholarshipLostConfigEnum {
  NotLost = 'not_lost',
  ByOrder = 'by_order',
  ByStudent = 'by_student',
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
  /** Current status of the school */
  status?: SchoolImportStatusEnum;
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

export enum SchoolImportStatusEnum {
  Operando = 'operando',
  Baja = 'baja',
  Onboarding = 'onboarding',
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

export interface SectionUpdate {
  /**
   * Grade of the section.
   * @maxLength 50
   */
  grade: string;
  /**
   * Internal name for section inside a grade.
   * @maxLength 9
   */
  group?: string | null;
  /**
   * Unique identifier for the object.
   * @format uuid
   */
  level: string;
}

export interface SendCodeRequest {
  method: MethodEnum;
  value: string;
}

export enum ServiceEnum {
  MERPAGO_CP = 'MERPAGO_CP',
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
   * @pattern ^-?\d{0,6}(?:\.\d{0,2})?$
   */
  guardian_commission: string;
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
   * @maxLength 55
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
  level?: string;
  /** Section name */
  section?: string;
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
  type: SpecialDiscountTypeEnum;
}

export enum SpecialDiscountTypeEnum {
  INTEREST_FORG = 'INTEREST_FORG',
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  FIXED = 'FIXED',
  BRILLAMONT = 'BRILLAMONT',
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

export enum StatusC9FEnum {
  Approved = 'approved',
  Authorized = 'authorized',
  Pending = 'pending',
  InProcess = 'in_process',
  InMediation = 'in_mediation',
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
  concept: Concept;
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
  concept: Concept;
  /** Order name, tipically have format "ConceptName - DueMonth, DueYear" */
  name: string;
  /**
   * Price of the order
   * @format decimal
   * @pattern ^-?\d{0,12}(?:\.\d{0,2})?$
   */
  price: string;
  price_currency: string;
  /**
   * Date when order due
   * @format date
   */
  due: string | null;
  /** Status of the student order (legacy version). */
  status: string;
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
  payins: Payin[];
  invoice: Invoice;
  dependent: SlimStudent;
  /** Boolean indicates if first payin_fulfillment associated to order is partial. */
  has_partial_payins: boolean;
  /** Current paid amount for fulfillment */
  paid_amount: string;
  /** Commission amount charged based on payin type. */
  commissions: string;
  /** Commission amount charged to guardian based on payin type. */
  guardian_commission: string;
  is_sponsored: string;
}

export interface StudentStatusSummary {
  no_debt: number;
  partial_paid: number;
  due: number;
  status: string;
}

export interface SubscriptionStudentDTO {
  /** @format uuid */
  id: string;
  full_name: string;
  billing_guardian_name: string;
}

export interface SuccessResponse {
  message: string;
  massive_dissasignment_id: string;
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

export enum Type68EEnum {
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
}

export enum Type787Enum {
  AccountMoney = 'account_money',
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
}

export enum TypeF30Enum {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  FIXED = 'FIXED',
  BRILLAMONT = 'BRILLAMONT',
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

export interface UserReportAsPaid {
  is_paid: boolean;
}

export interface ValidateOptionalOrderStudent {
  /** @format uuid */
  order: string;
  /** @format uuid */
  student: string;
}

export interface ValidatePreference {
  /** @format uuid */
  guardian: string;
  items: CreateServicePreferenceItem[];
  preference_type: PreferenceTypeEnum;
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
  would_be_due: string;
  /** Indicated if student has this order a paid, partial paid or pending. */
  has_fulfillment: string;
  /** Indicates if student not have this order. */
  is_skipped: string;
  /**
   * Reflects the price of the fulfillment associated with the order if it exists and is paid.
   * @format decimal
   */
  fulfillment_amount?: string | null;
  /** Indicates if the order is associated with an optional concept. */
  optional: boolean;
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
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        );
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
      const r = response as HttpResponse<T, E>;
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
        multiple_search?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsProductKeysRetrieve
     * @request GET:/api/v1/dashboard/concepts/product_keys/
     * @secure
     */
    apiV1DashboardConceptsProductKeysRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/product_keys/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV1DashboardConceptsTaxUnitsRetrieve
     * @request GET:/api/v1/dashboard/concepts/tax_units/
     * @secure
     */
    apiV1DashboardConceptsTaxUnitsRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/concepts/tax_units/`,
        method: 'GET',
        secure: true,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        due_status?: 'future' | 'outstanding';
        /** @format date */
        end_date?: string;
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
     * @name ApiV1DashboardGuardiansOptionalOrdersList
     * @request GET:/api/v1/dashboard/guardians/{guardian_id}/optional-orders/
     * @secure
     */
    apiV1DashboardGuardiansOptionalOrdersList: (
      guardianId: string,
      query?: {
        multiple_search?: string;
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
    apiV1DashboardGuardiansUpdate: (id: string, data: DashboardGuardian, params: RequestParams = {}) =>
      this.request<DashboardGuardian, any>({
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
    apiV1DashboardGuardiansPartialUpdate: (id: string, data: PatchedDashboardGuardian, params: RequestParams = {}) =>
      this.request<DashboardGuardian, any>({
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
    apiV1DashboardGuardiansOutboundCreate: (id: string, data: DashboardGuardian, params: RequestParams = {}) =>
      this.request<DashboardGuardian, any>({
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
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsResumeRetrieve
     * @request GET:/api/v1/dashboard/schools/{id}/resume/
     * @secure
     */
    apiV1DashboardSchoolsResumeRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<DashboardSchoolWithStudents, any>({
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
     * @tags api
     * @name ApiV1DashboardSchoolsAdminsPermissionsUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/admins/{id}/permissions/
     * @secure
     */
    apiV1DashboardSchoolsAdminsPermissionsUpdate: (
      id: string,
      schoolId: string,
      data: DetailAdmin,
      params: RequestParams = {}
    ) =>
      this.request<DetailAdmin, any>({
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
      },
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collection_efficiency/xls_v2/`,
        method: 'POST',
        query: query,
        secure: true,
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
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSlimStudentList, any>({
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
      this.request<SlimStudent, any>({
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
      this.request<ConceptTypes, any>({
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
     * @name ApiV1DashboardSchoolsCollectionsGraphicList
     * @request GET:/api/v1/dashboard/schools/{school_id}/collections/graphic/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsGraphicList: (
      schoolId: string,
      query: {
        /** Concepts */
        concepts: string[];
        /** School Cycle */
        school_cycle: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<CollectionsGraphic[], any>({
        path: `/api/v1/dashboard/schools/${schoolId}/collections/graphic/`,
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
     * @name ApiV1DashboardSchoolsCollectionsTableRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/collections/table/
     * @secure
     */
    apiV1DashboardSchoolsCollectionsTableRetrieve: (
      schoolId: string,
      query: {
        /** Concepts */
        concepts: string[];
        /** Month */
        month: number;
        /** School Cycle */
        school_cycle: string;
        /** Year */
        year: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<CollectionsTable, any>({
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
        multiple_search?: string;
        /** Multiple values may be separated by commas. */
        school_cycles?: string[];
        /** Type of the concept. */
        type?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
     * @tags api
     * @name ApiV1DashboardSchoolsConceptsOrdersList
     * @request GET:/api/v1/dashboard/schools/{school_id}/concepts/{concept_id}/orders/
     * @secure
     */
    apiV1DashboardSchoolsConceptsOrdersList: (
      conceptId: string,
      schoolId: string,
      query?: {
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
        multiple_search?: string;
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
     * @name ApiV1DashboardSchoolsDelinquencyHistoricList
     * @request GET:/api/v1/dashboard/schools/{school_id}/delinquency/historic/
     * @secure
     */
    apiV1DashboardSchoolsDelinquencyHistoricList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
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
    apiV1DashboardSchoolsDueOrdersResumeRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/due_orders/resume/`,
        method: 'GET',
        secure: true,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        inscription_status?: ('Inscrito' | 'NOT_AVAILABLE' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
        is_active?: boolean;
        /** Filter by level UUID(str), use "null" for students without level */
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
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-paid_date' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Type of the payin */
        payment_methods?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-paid_date' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-paid_date' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** A search term. */
        search?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
    apiV1DashboardSchoolsGuardiansCreate: (schoolId: string, data: SlimGuardian, params: RequestParams = {}) =>
      this.request<SlimGuardian, any>({
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
     * @tags api
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
     * No description
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
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsMassiveAssignmentsList
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
      this.request<CreateMassiveConceptAssignments, any>({
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
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/massive_assignments/${id}/`,
        method: 'DELETE',
        secure: true,
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
      this.request<PaginatedDashboardPayinList, any>({
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
     * @description - Class that implements this mixin and need overwrite get_serializer_context must call super().get_serializer_context() - This class must be in first posición in the class inheritance
     *
     * @tags api
     * @name ApiV1DashboardSchoolsPayinsExcelCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/payins/excel/
     * @secure
     */
    apiV1DashboardSchoolsPayinsExcelCreate: (schoolId: string, data: ExcelReport, params: RequestParams = {}) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins/excel/`,
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
        /** A search term. */
        search?: string;
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
        /** A search term. */
        search?: string;
        /** @format date */
        start_date?: string;
        /** Multiple values may be separated by commas. */
        students?: string[];
        /** Type of the payin */
        types?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
     * @tags School PayinFulfillment ViewSet
     * @name ApiV1DashboardSchoolsPayinsFulfillmentsColumnsRetrieve
     * @summary Retrieve Available Columns
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
      data: DashboardPayinFulfillment,
      params: RequestParams = {}
    ) =>
      this.request<DashboardPayinFulfillment, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/payins_fulfillments/xls_v2/`,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        ordering?: ('-created' | '-paid_date' | 'created' | 'paid_date')[];
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
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
        ordering?: ('-transaction_started' | 'transaction_started')[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
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
        ordering?: ('-transaction_started' | 'transaction_started')[];
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
      this.request<DashboardSchoolPayoutDetails, any>({
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
        ordering?: ('-transaction_started' | 'transaction_started')[];
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
     * @name ApiV1DashboardSchoolsScholarshipsList
     * @request GET:/api/v1/dashboard/schools/{school_id}/scholarships/
     * @secure
     */
    apiV1DashboardSchoolsScholarshipsList: (
      schoolId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedScholarshipList, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/scholarships/`,
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
     * @name ApiV1DashboardSchoolsSpecialDiscountsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/special_discounts/
     * @secure
     */
    apiV1DashboardSchoolsSpecialDiscountsCreate: (
      schoolId: string,
      data: SpecialDiscount,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
     * @description Edit a section for a specific student by their ID.
     *
     * @tags Students
     * @name ApiV1DashboardSchoolsStudentsEditSectionUpdate
     * @request PUT:/api/v1/dashboard/schools/{school_id}/students/{id}/edit-section/
     * @secure
     */
    apiV1DashboardSchoolsStudentsEditSectionUpdate: (
      id: string,
      schoolId: string,
      data: SectionUpdate,
      query?: {
        /** ID de la sección a editar */
        section_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedSectionUpdateList, void>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/${id}/edit-section/`,
        method: 'PUT',
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsDelinquencyXlsCreate
     * @request POST:/api/v1/dashboard/schools/{school_id}/students/delinquency/xls/
     * @secure
     */
    apiV1DashboardSchoolsStudentsDelinquencyXlsCreate: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/delinquency/xls/`,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        inscription_status?: ('Inscrito' | 'NOT_AVAILABLE' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
        is_active?: boolean;
        /** Filter by level UUID(str), use "null" for students without level */
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
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
     * No description
     *
     * @tags api
     * @name ApiV1DashboardSchoolsStudentsInscriptionsSummaryRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/inscriptions/summary/
     * @secure
     */
    apiV1DashboardSchoolsStudentsInscriptionsSummaryRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/inscriptions/summary/`,
        method: 'GET',
        secure: true,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
     * @name ApiV1DashboardSchoolsStudentsResumeBySchoolRetrieve
     * @request GET:/api/v1/dashboard/schools/{school_id}/students/resume_by_school/
     * @secure
     */
    apiV1DashboardSchoolsStudentsResumeBySchoolRetrieve: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<DashboardStudentResume, any>({
        path: `/api/v1/dashboard/schools/${schoolId}/students/resume_by_school/`,
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Filter by level UUID(str), use "null" for students without level */
        levels?: string[];
        /** Filter by order UUID(str) */
        orders?: string[];
        /** Filter by scholarships */
        scholarships?: string[];
        /**
         * Filter by school cycle UUID(str)
         * @format uuid
         */
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-paid_date' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** A page number within the paginated result set. */
        page?: number;
        /** Type of the payin */
        payment_methods?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-paid_date' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        /** Multiple values may be separated by commas. */
        invoice_status?: ('canceled' | 'canceling' | 'failed' | 'multiple' | 'not_requested' | 'pending' | 'success')[];
        is_manual?: boolean;
        /** Multiple values may be separated by commas. */
        levels?: string[];
        multiple_search?: string;
        /** Ordering */
        ordering?: ('-paid_date' | 'paid_date')[];
        /** Multiple values may be separated by commas. */
        orders?: string[];
        /** Type of the payin */
        payment_methods?: (
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
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
     * @description Webhook to receive mercadopago notifications.
     *
     * @tags api
     * @name ApiV1MpcpNotificationsCreate
     * @request POST:/api/v1/mpcp/notifications/
     * @secure
     */
    apiV1MpcpNotificationsCreate: (data: CreateMercadoPagoCPGatewayNotification, params: RequestParams = {}) =>
      this.request<CreateMercadoPagoCPGatewayNotification, any>({
        path: `/api/v1/mpcp/notifications/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Exec Mercadopago checkout preferences
     *
     * @tags api
     * @name ApiV1MpcpPreferencesCreate
     * @request POST:/api/v1/mpcp/preferences/
     * @secure
     */
    apiV1MpcpPreferencesCreate: (data: CreateMerPagoCPPreference, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/v1/mpcp/preferences/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
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
     * No description
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
        /** @format uuid */
        school?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<GuardianDependentOrder[], any>({
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
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
          | 'UNIFORMS_AND_MERCH'
        )[];
        /** Multiple values may be separated by commas. */
        concepts?: string[];
        due_status?: 'future' | 'outstanding';
        /** @format date */
        end_date?: string;
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
          | 'account_money'
          | 'atm'
          | 'bank_transfer'
          | 'cash_payroll'
          | 'credit'
          | 'credit_card'
          | 'debit_card'
          | 'deposit_cash'
          | 'deposit_check'
          | 'direct_debit'
          | 'multipay'
          | 'nominal_check'
          | 'prepaid_card'
          | 'ticket'
          | null
        )[];
        /** @format uuid */
        school?: string;
        /** Multiple values may be separated by commas. */
        sections?: string[];
        /** @format date */
        start_date?: string;
        /** Payment status of the fulfillment */
        status?: ('NOT_PAID' | 'PAID' | 'PARTIAL_PAID' | 'WAITING_PAID')[];
        /** Multiple values may be separated by commas. */
        students?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<GuardianDependentFulfillment[], any>({
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
     * @tags api
     * @name ApiV1SchoolsRetrieve
     * @request GET:/api/v1/schools/{short_slug}/
     * @secure
     */
    apiV1SchoolsRetrieve: (shortSlug: string, params: RequestParams = {}) =>
      this.request<School, any>({
        path: `/api/v1/schools/${shortSlug}/`,
        method: 'GET',
        secure: true,
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
     * @description Creates user accounts
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
     * @secure
     */
    apiV1UsersAuthCreate: (data: User, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/v1/users/auth/`,
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
     * No description
     *
     * @tags Students Due Orders ViewSet
     * @name ApiV2DashboardSchoolsDueOrdersStudentsList
     * @request GET:/api/v2/dashboard/schools/{school_id}/due_orders/students/
     * @secure
     */
    apiV2DashboardSchoolsDueOrdersStudentsList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        inscription_status?: ('Inscrito' | 'NOT_AVAILABLE' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
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
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentListDueOrderSerializerV2List, any>({
        path: `/api/v2/dashboard/schools/${schoolId}/due_orders/students/`,
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
     * @name ApiV2DashboardSchoolsDueOrdersStudentsRetrieve
     * @request GET:/api/v2/dashboard/schools/{school_id}/due_orders/students/{id}/
     * @secure
     */
    apiV2DashboardSchoolsDueOrdersStudentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardStudentDetail, any>({
        path: `/api/v2/dashboard/schools/${schoolId}/due_orders/students/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV2DashboardSchoolsDueOrdersStudentsFiltersRetrieve
     * @request GET:/api/v2/dashboard/schools/{school_id}/due_orders/students/filters/
     * @secure
     */
    apiV2DashboardSchoolsDueOrdersStudentsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewStudents, any>({
        path: `/api/v2/dashboard/schools/${schoolId}/due_orders/students/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV2DashboardSchoolsDueOrdersStudentsXlsCreate
     * @request POST:/api/v2/dashboard/schools/{school_id}/due_orders/students/xls/
     * @secure
     */
    apiV2DashboardSchoolsDueOrdersStudentsXlsCreate: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        inscription_status?: ('Inscrito' | 'NOT_AVAILABLE' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
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
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v2/dashboard/schools/${schoolId}/due_orders/students/xls/`,
        method: 'POST',
        query: query,
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
     * @tags Students Due Orders ViewSet
     * @name ApiV3DashboardSchoolsDueOrdersStudentsList
     * @request GET:/api/v3/dashboard/schools/{school_id}/due_orders/students/
     * @secure
     */
    apiV3DashboardSchoolsDueOrdersStudentsList: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        inscription_status?: ('Inscrito' | 'NOT_AVAILABLE' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
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
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDashboardStudentListDueOrderSerializerV3List, any>({
        path: `/api/v3/dashboard/schools/${schoolId}/due_orders/students/`,
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
     * @name ApiV3DashboardSchoolsDueOrdersStudentsRetrieve
     * @request GET:/api/v3/dashboard/schools/{school_id}/due_orders/students/{id}/
     * @secure
     */
    apiV3DashboardSchoolsDueOrdersStudentsRetrieve: (id: string, schoolId: string, params: RequestParams = {}) =>
      this.request<DashboardStudentDetail, any>({
        path: `/api/v3/dashboard/schools/${schoolId}/due_orders/students/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint que lista los queryparams (y valores) disponibles para el endpoint raiz
     *
     * @tags api
     * @name ApiV3DashboardSchoolsDueOrdersStudentsFiltersRetrieve
     * @request GET:/api/v3/dashboard/schools/{school_id}/due_orders/students/filters/
     * @secure
     */
    apiV3DashboardSchoolsDueOrdersStudentsFiltersRetrieve: (schoolId: string, params: RequestParams = {}) =>
      this.request<FilterViewStudents, any>({
        path: `/api/v3/dashboard/schools/${schoolId}/due_orders/students/filters/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags api
     * @name ApiV3DashboardSchoolsDueOrdersStudentsXlsCreate
     * @request POST:/api/v3/dashboard/schools/{school_id}/due_orders/students/xls/
     * @secure
     */
    apiV3DashboardSchoolsDueOrdersStudentsXlsCreate: (
      schoolId: string,
      query?: {
        /** Filter by concept type */
        concept_types?: (
          | 'BOOKS_AND_MATERIALS'
          | 'CAFETERIA'
          | 'EXAMS_AND_CERTIFICATES'
          | 'EXTRACURRICULAR'
          | 'INSCRIPTION'
          | 'MONTHLY_FEE'
          | 'OTHER'
          | 'PRE_DEBT'
          | 'REINSCRIPTION'
          | 'SPORTS'
          | 'TRANSPORT'
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
        inscription_status?: ('Inscrito' | 'NOT_AVAILABLE' | 'No inscrito' | 'Pendiente' | 'Reinscrito')[];
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
        /** Filter by scholarships */
        scholarships?: string[];
        school_cycle?: string;
        /** Search by fullname or enrollment code */
        search?: string;
        /** Filter by section UUID(str), use "null" for students without section */
        sections?: string[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ExcelReport, any>({
        path: `/api/v3/dashboard/schools/${schoolId}/due_orders/students/xls/`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
