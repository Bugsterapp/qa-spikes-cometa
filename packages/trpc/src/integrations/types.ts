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

/** BaseResponseModel[BlockedFieldsResponseDTO] */
export interface BaseResponseModelBlockedFieldsResponseDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  data: BlockedFieldsResponseDTO;
}

/** BaseResponseModel[EncryptFulfillmentsResponseDTO] */
export interface BaseResponseModelEncryptFulfillmentsResponseDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data transfer object for the encryption response. */
  data: EncryptFulfillmentsResponseDTO;
}

/** BaseResponseModel[GenerateCredentialsResponseDTO] */
export interface BaseResponseModelGenerateCredentialsResponseDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data transfer object for the credentials generation response. */
  data: GenerateCredentialsResponseDTO;
}

/** BaseResponseModel[IgnoredSyncEntityDTO] */
export interface BaseResponseModelIgnoredSyncEntityDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for IgnoredSyncEntity response */
  data: IgnoredSyncEntityDTO;
}

/** BaseResponseModel[IntegrationSummaryDTO] */
export interface BaseResponseModelIntegrationSummaryDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for integration summary including type detection */
  data: IntegrationSummaryDTO;
}

/** BaseResponseModel[List[StudentSyncOriginDTO]] */
export interface BaseResponseModelListStudentSyncOriginDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: StudentSyncOriginDTO[];
}

/** BaseResponseModel[List[dict]] */
export interface BaseResponseModelListDict {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: Record<string, any>[];
}

/** BaseResponseModel[ReferenceDTO] */
export interface BaseResponseModelReferenceDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for Reference response */
  data: ReferenceDTO;
}

/** BaseResponseModel[StudentSyncOriginDTO] */
export interface BaseResponseModelStudentSyncOriginDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for StudentSyncOrigin response */
  data: StudentSyncOriginDTO;
}

/** BaseResponseModel[SupportedPartners] */
export interface BaseResponseModelSupportedPartners {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /**
   * Defines the supported partners for integration.
   *
   * Attributes:
   *     Additio: Represents the Additio partner
   *     PowerSchool: Represents the PowerSchool partner
   *     Colegium: Represents the Colegium partner
   *     Schools: Represents the Schools partner
   *     Unsupported: Represents an unsupported partner
   */
  data: SupportedPartners;
}

/** BaseResponseModel[TenantIntegrationConfigDTO] */
export interface BaseResponseModelTenantIntegrationConfigDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for TenantIntegrationConfig entity */
  data: TenantIntegrationConfigDTO;
}

/** BaseResponseModel[TenantIntegrationConfigWithSourcesDTO] */
export interface BaseResponseModelTenantIntegrationConfigWithSourcesDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for TenantIntegrationConfig response with N-to-1 support */
  data: TenantIntegrationConfigWithSourcesDTO;
}

/** BaseResponseModel[TenantIntegrationDTO] */
export interface BaseResponseModelTenantIntegrationDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for TenantIntegration entity */
  data: TenantIntegrationDTO;
}

/** BaseResponseModel[TenantIntegrationInspectionCreateDTO] */
export interface BaseResponseModelTenantIntegrationInspectionCreateDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for TenantIntegrationInspection entity */
  data: TenantIntegrationInspectionCreateDTO;
}

/** BaseResponseModel[TenantIntegrationInspectionDTO] */
export interface BaseResponseModelTenantIntegrationInspectionDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** DTO for TenantIntegrationInspection entity */
  data: TenantIntegrationInspectionDTO;
}

/** BaseResponseModel[TenantIntegrationSynchronizationDTO] */
export interface BaseResponseModelTenantIntegrationSynchronizationDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  data: TenantIntegrationSynchronizationDTO;
}

/** BaseResponseModel[ValidateCredentialsResponseDTO] */
export interface BaseResponseModelValidateCredentialsResponseDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data transfer object for the credentials validation response. */
  data: ValidateCredentialsResponseDTO;
}

/** BaseResponseModel[dict] */
export interface BaseResponseModelDict {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: Record<string, any>;
}

/** BaseResponseModel[dict[str, Union[list[ReferenceDTO], PaginationMetadata]]] */
export interface BaseResponseModelDictStrUnionListReferenceDTOPaginationMetadata {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: Record<string, ReferenceDTO[] | PaginationMetadata>;
}

/** BaseResponseModel[dict[str, Union[list[TenantIntegrationDTO], PaginationMetadata]]] */
export interface BaseResponseModelDictStrUnionListTenantIntegrationDTOPaginationMetadata {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: Record<string, TenantIntegrationDTO[] | PaginationMetadata>;
}

/** BaseResponseModel[list[IgnoredSyncEntityDTO]] */
export interface BaseResponseModelListIgnoredSyncEntityDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: IgnoredSyncEntityDTO[];
}

/** BaseResponseModel[list[TenantIntegrationSynchronizationDTO]] */
export interface BaseResponseModelListTenantIntegrationSynchronizationDTO {
  /** Error */
  error: boolean;
  /** Message */
  message: string;
  /** Data */
  data: TenantIntegrationSynchronizationDTO[];
}

/** BlockedFieldsResponseDTO */
export interface BlockedFieldsResponseDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Partner */
  partner: string;
  /** Blocked Fields */
  blocked_fields: Record<string, string[]>;
}

/**
 * EncryptFulfillmentsRequestDTO
 * Data transfer object for the encryption request.
 */
export interface EncryptFulfillmentsRequestDTO {
  /**
   * Fulfillments
   * List of fulfillments to encrypt
   * @minItems 1
   */
  fulfillments: FulfillmentRequestDTO[];
}

/**
 * EncryptFulfillmentsResponseDTO
 * Data transfer object for the encryption response.
 */
export interface EncryptFulfillmentsResponseDTO {
  /**
   * Url
   * Encrypted URL with query parameters
   */
  url: string;
  /**
   * Fulfillment Count
   * Number of fulfillments encrypted
   * @min 1
   */
  fulfillment_count: number;
}

/** EntityType */
export enum EntityType {
  School = 'school',
  Guardian = 'guardian',
  Student = 'student',
  Level = 'level',
  Term = 'term',
  Section = 'section',
  Grade = 'grade',
  Group = 'group',
}

/**
 * FulfillmentRequestDTO
 * Data transfer object for a single fulfillment request.
 */
export interface FulfillmentRequestDTO {
  /**
   * Concept
   * Fulfillment concept description
   * @minLength 1
   */
  concept: string;
  /**
   * Student Id
   * Student identifier (typically UUID)
   * @minLength 1
   */
  student_id: string;
  /**
   * Price
   * Fulfillment price (must be non-negative)
   * @min 0
   */
  price: number;
}

/**
 * GenerateCredentialsResponseDTO
 * Data transfer object for the credentials generation response.
 */
export interface GenerateCredentialsResponseDTO {
  /**
   * Iv
   * Initialization vector for decryption (Base64URL encoded)
   */
  iv: string;
  /**
   * Data
   * Encrypted data (Base64URL encoded)
   */
  data: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/**
 * IgnoredSyncEntityCreateDTO
 * DTO for creating an IgnoredSyncEntity
 */
export interface IgnoredSyncEntityCreateDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Entity Type */
  entity_type: string;
  /** Entity Id */
  entity_id: string;
  /** Source Partner */
  source_partner: string;
  /** Reason */
  reason?: string | null;
}

/**
 * IgnoredSyncEntityDTO
 * DTO for IgnoredSyncEntity response
 */
export interface IgnoredSyncEntityDTO {
  /** Id */
  id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Entity Type */
  entity_type: string;
  /** Entity Id */
  entity_id: string;
  /** Source Partner */
  source_partner: string;
  /** Reason */
  reason?: string | null;
  /** Is Active */
  is_active: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/**
 * IntegrationSummaryDTO
 * DTO for integration summary including type detection
 */
export interface IntegrationSummaryDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Integration Type */
  integration_type: string;
  /** Name */
  name: string;
  /** Partner */
  partner: string;
  /** Managed Entity Types */
  managed_entity_types: string[];
  /** Is Active */
  is_active: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /** Source Count */
  source_count: number;
  /** Sources */
  sources?: Record<string, any>[] | null;
}

/**
 * ManagedEntityType
 * Enum for managed entity types
 */
export enum ManagedEntityType {
  Student = 'student',
  Guardian = 'guardian',
  Section = 'section',
  Level = 'level',
  Inscription = 'inscription',
  StudentGuardian = 'student_guardian',
}

/** PaginationMetadata */
export interface PaginationMetadata {
  /** Total */
  total: number;
  /** Limit */
  limit?: number | null;
  /** Offset */
  offset?: number | null;
  /** Next Page */
  next_page?: string | null;
  /** Previous Page */
  previous_page?: string | null;
}

/**
 * ReferenceCreateDTO
 * DTO for creating a Reference
 */
export interface ReferenceCreateDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  entity_type: EntityType;
  /** Target Entity Id */
  target_entity_id: string;
  /** Source Entity Id */
  source_entity_id: string;
  partner?: SupportedPartners | null;
  /** Source Context */
  source_context?: string | null;
  /**
   * Allow Update
   * @default true
   */
  allow_update?: boolean;
}

/**
 * ReferenceDTO
 * DTO for Reference response
 */
export interface ReferenceDTO {
  /** Id */
  id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Entity Type */
  entity_type: string;
  /** Target Entity Id */
  target_entity_id: string;
  /** Source Entity Id */
  source_entity_id: string;
  /** Partner */
  partner?: string | null;
  /** Source Context */
  source_context?: string | null;
  /**
   * Allow Update
   * @default true
   */
  allow_update?: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/**
 * ReferenceUpdateDTO
 * DTO for updating a Reference
 */
export interface ReferenceUpdateDTO {
  /** Target Entity Id */
  target_entity_id?: string | null;
  /** Source Entity Id */
  source_entity_id?: string | null;
  partner?: SupportedPartners | null;
  /** Source Context */
  source_context?: string | null;
  /** Allow Update */
  allow_update?: boolean | null;
}

/**
 * SourceConfigurationCreateDTO
 * DTO for creating SourceConfiguration in N-to-1 integrations
 */
export interface SourceConfigurationCreateDTO {
  /** Source Id */
  source_id: string;
  /** Name */
  name: string;
  /** Env Vars */
  env_vars: Record<string, any>;
  /**
   * Grade Range
   * @maxItems 2
   * @minItems 2
   */
  grade_range: any[];
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/**
 * SourceConfigurationDTO
 * DTO for SourceConfiguration response
 */
export interface SourceConfigurationDTO {
  /** Source Id */
  source_id: string;
  /** Name */
  name: string;
  /** Env Vars */
  env_vars: Record<string, any>;
  /**
   * Grade Range
   * @maxItems 2
   * @minItems 2
   */
  grade_range: any[];
  /** Is Active */
  is_active: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/**
 * StudentSyncOriginCreateDTO
 * DTO for creating a StudentSyncOrigin.
 *
 * This is called by System B before creating a student in Cometa from PowerSchool.
 */
export interface StudentSyncOriginCreateDTO {
  /** Source Student Id */
  source_student_id: string;
  /** School Id */
  school_id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /**
   * Origin
   * @default "powerschool"
   */
  origin?: string;
}

/**
 * StudentSyncOriginDTO
 * DTO for StudentSyncOrigin response
 */
export interface StudentSyncOriginDTO {
  /** Id */
  id: string;
  /** Source Student Id */
  source_student_id: string;
  /** Cometa Student Id */
  cometa_student_id?: string | null;
  /** School Id */
  school_id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Origin */
  origin: string;
  /** Status */
  status: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
}

/**
 * StudentSyncOriginUpdateDTO
 * DTO for updating a StudentSyncOrigin.
 *
 * This is called by System B after creating a student in Cometa,
 * to update the record with the Cometa student ID.
 */
export interface StudentSyncOriginUpdateDTO {
  /** Cometa Student Id */
  cometa_student_id?: string | null;
  /** Status */
  status?: string | null;
}

/**
 * SupportedPartners
 * Defines the supported partners for integration.
 *
 * Attributes:
 *     Additio: Represents the Additio partner
 *     PowerSchool: Represents the PowerSchool partner
 *     Colegium: Represents the Colegium partner
 *     Schools: Represents the Schools partner
 *     Unsupported: Represents an unsupported partner
 */
export enum SupportedPartners {
  Additio = 'additio',
  Powerschool = 'powerschool',
  Cometa = 'cometa',
  Crediko = 'crediko',
  Colegium = 'colegium',
  Schools = 'schools',
}

/** Surface */
export enum Surface {
  Dashboard = 'dashboard',
  Portal = 'portal',
  Backoffice = 'backoffice',
}

/**
 * TenantIntegrationConfigCreateDTO
 * DTO for TenantIntegrationConfig entity
 */
export interface TenantIntegrationConfigCreateDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Managed Entity Types */
  managed_entity_types: ManagedEntityType[];
  /** Sso Is Active */
  sso_is_active: boolean;
  /**
   * Sso Is Idp Provider
   * @default false
   */
  sso_is_idp_provider?: boolean;
  /**
   * Is Integration Active
   * @default false
   */
  is_integration_active?: boolean;
  /**
   * Is Source Of Truth
   * @default false
   */
  is_source_of_truth?: boolean;
}

/**
 * TenantIntegrationConfigCreateWithSourcesDTO
 * DTO for creating TenantIntegrationConfig with N-to-1 support
 */
export interface TenantIntegrationConfigCreateWithSourcesDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Managed Entity Types */
  managed_entity_types: ManagedEntityType[];
  /** Sso Is Active */
  sso_is_active: boolean;
  /**
   * Sso Is Idp Provider
   * @default false
   */
  sso_is_idp_provider?: boolean;
  /**
   * Is Integration Active
   * @default false
   */
  is_integration_active?: boolean;
  /**
   * Is Source Of Truth
   * @default false
   */
  is_source_of_truth?: boolean;
  /** Source Configurations */
  source_configurations?: SourceConfigurationCreateDTO[] | null;
}

/**
 * TenantIntegrationConfigDTO
 * DTO for TenantIntegrationConfig entity
 */
export interface TenantIntegrationConfigDTO {
  /** Id */
  id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Managed Entity Types */
  managed_entity_types: string[];
  /** Sso Is Active */
  sso_is_active: boolean;
  /** Sso Is Idp Provider */
  sso_is_idp_provider: boolean;
  /** Is Integration Active */
  is_integration_active: boolean;
  /** Is Source Of Truth */
  is_source_of_truth: boolean;
}

/**
 * TenantIntegrationConfigUpdateDTO
 * DTO for TenantIntegrationConfig entity
 */
export interface TenantIntegrationConfigUpdateDTO {
  /** Managed Entity Types */
  managed_entity_types: ManagedEntityType[];
  /** Sso Is Active */
  sso_is_active: boolean;
  /** Sso Is Idp Provider */
  sso_is_idp_provider: boolean;
  /** Is Integration Active */
  is_integration_active: boolean;
  /** Is Source Of Truth */
  is_source_of_truth: boolean;
}

/**
 * TenantIntegrationConfigWithSourcesDTO
 * DTO for TenantIntegrationConfig response with N-to-1 support
 */
export interface TenantIntegrationConfigWithSourcesDTO {
  /** Id */
  id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Managed Entity Types */
  managed_entity_types: string[];
  /** Sso Is Active */
  sso_is_active: boolean;
  /** Sso Is Idp Provider */
  sso_is_idp_provider: boolean;
  /** Is Integration Active */
  is_integration_active: boolean;
  /** Is Source Of Truth */
  is_source_of_truth: boolean;
  /** Source Configurations */
  source_configurations?: SourceConfigurationDTO[] | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
}

/**
 * TenantIntegrationCreateDTO
 * DTO for TenantIntegration entity
 */
export interface TenantIntegrationCreateDTO {
  /** Tenant Id */
  tenant_id: string;
  /** Name */
  name: string;
  /** Env Vars */
  env_vars: Record<string, any>;
  /**
   * Defines the supported partners for integration.
   *
   * Attributes:
   *     Additio: Represents the Additio partner
   *     PowerSchool: Represents the PowerSchool partner
   *     Colegium: Represents the Colegium partner
   *     Schools: Represents the Schools partner
   *     Unsupported: Represents an unsupported partner
   */
  partner: SupportedPartners;
}

/**
 * TenantIntegrationDTO
 * DTO for TenantIntegration entity
 */
export interface TenantIntegrationDTO {
  /** Id */
  id: string;
  /** Tenant Id */
  tenant_id: string;
  /** Name */
  name: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at: string | null;
  /** Env Vars */
  env_vars: Record<string, any>;
  /** Partner */
  partner: string;
}

/**
 * TenantIntegrationInfoDTO
 * Data transfer object for tenant integration information.
 */
export interface TenantIntegrationInfoDTO {
  /**
   * Tenant Integration Id
   * Tenant integration unique identifier
   */
  tenant_integration_id: string;
  /**
   * Name
   * Integration name
   */
  name: string;
  /**
   * Partner
   * Partner name
   */
  partner: string;
  /**
   * Tenant Id
   * Tenant identifier
   */
  tenant_id: string;
}

/**
 * TenantIntegrationInspectionCreateDTO
 * DTO for TenantIntegrationInspection entity
 */
export interface TenantIntegrationInspectionCreateDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** @default "started" */
  status?: TenantIntegrationInspectionStatus;
  /**
   * Synchronized Entities Count
   * @default 0
   */
  synchronized_entities_count?: number;
  /**
   * Discrepancies Entities Count
   * @default 0
   */
  discrepancies_entities_count?: number;
  /**
   * Unsynchronized Entities Count
   * @default 0
   */
  unsynchronized_entities_count?: number;
  /**
   * Total Entities
   * @default 0
   */
  total_entities?: number;
  /**
   * Synchronized Entities Percentage
   * @default 0
   */
  synchronized_entities_percentage?: number;
}

/**
 * TenantIntegrationInspectionDTO
 * DTO for TenantIntegrationInspection entity
 */
export interface TenantIntegrationInspectionDTO {
  /** Id */
  id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  status: TenantIntegrationInspectionStatus;
  /** Synchronized Entities Count */
  synchronized_entities_count: number;
  /** Discrepancies Entities Count */
  discrepancies_entities_count: number;
  /** Unsynchronized Entities Count */
  unsynchronized_entities_count: number;
  /** Total Entities */
  total_entities: number;
  /** Synchronized Entities Percentage */
  synchronized_entities_percentage: number;
}

/** TenantIntegrationInspectionStatus */
export enum TenantIntegrationInspectionStatus {
  Started = 'started',
  InProgress = 'in_progress',
  Completed = 'completed',
}

/** TenantIntegrationSynchronizationCreateDTO */
export interface TenantIntegrationSynchronizationCreateDTO {
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /**
   * Synchronization Is Active
   * @default false
   */
  synchronization_is_active?: boolean;
}

/** TenantIntegrationSynchronizationDTO */
export interface TenantIntegrationSynchronizationDTO {
  /** Id */
  id: string;
  /** Tenant Integration Id */
  tenant_integration_id: string;
  /** Synchronization Is Active */
  synchronization_is_active: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
}

/**
 * ValidateCredentialsRequestDTO
 * Data transfer object for the credentials validation request.
 */
export interface ValidateCredentialsRequestDTO {
  /**
   * Iv
   * Initialization vector (Base64URL encoded)
   * @minLength 1
   */
  iv: string;
  /**
   * Data
   * Encrypted data (Base64URL encoded)
   * @minLength 1
   */
  data: string;
}

/**
 * ValidateCredentialsResponseDTO
 * Data transfer object for the credentials validation response.
 */
export interface ValidateCredentialsResponseDTO {
  /**
   * Tenant Id
   * Tenant identifier
   */
  tenant_id: string;
  /**
   * Integrations
   * List of available integrations for the tenant
   */
  integrations: TenantIntegrationInfoDTO[];
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
 * @title Integrations API
 * @version 1.0.0
 *
 * API for managing integrations
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  shared = {
    /**
     * No description
     *
     * @tags tenants
     * @name GetBlockedFieldsSharedApiV1TenantsBlockedFieldsGet
     * @summary Get Blocked Fields
     * @request GET:/shared/api/v1/tenants/blocked-fields
     * @secure
     */
    getBlockedFieldsSharedApiV1TenantsBlockedFieldsGet: (
      query: {
        /** UI surface to filter blocked fields */
        surface: Surface;
        /**
         * School Id
         * School ID to resolve tenant integration from
         */
        school_id?: string | null;
        /**
         * Tenant Id
         * Tenant ID to use when there is no direct school_id mapping
         */
        tenant_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelBlockedFieldsResponseDTO, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/blocked-fields`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Saves a new partner. Parameters ---------- - partner : SupportedPartners The partner to save, must be one of the supported partner types. Returns -------- JSONResponse with BaseResponseModel - 201: Partner saved successfully - 400: Invalid partner data - 422: Validation error - 500: Unexpected server error
     *
     * @tags tenants
     * @name SavePartnerSharedApiV1TenantsPartnersPost
     * @summary Save Partner
     * @request POST:/shared/api/v1/tenants/partners
     * @secure
     */
    savePartnerSharedApiV1TenantsPartnersPost: (
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelSupportedPartners>({
        path: `/shared/api/v1/tenants/partners`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Saves a new tenant integration. Parameters ---------- tenant : TenantIntegrationDTO The tenant integration data to save, containing tenant and partner information tenant_repository : Repository Repository instance for tenant integration operations partner_repository : Repository Repository instance for partner operations Returns -------- JSONResponse with BaseResponseModel - 201: Tenant integration saved successfully - 400: Invalid tenant data or duplicate integration - 422: Validation error - 500: Unexpected server error
     *
     * @tags tenants
     * @name SaveTenantSharedApiV1TenantsPost
     * @summary Save Tenant
     * @request POST:/shared/api/v1/tenants/
     * @secure
     */
    saveTenantSharedApiV1TenantsPost: (data: TenantIntegrationCreateDTO, params: RequestParams = {}) =>
      this.request<any, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description GetTenants retrieves all tenant integrations with pagination support Args: request (Request): FastAPI request object tenant_repository (Repository): Repository for tenant integrations pagination_service (PaginationService): Service for handling pagination limit (int | None): Maximum number of records to return offset (int | None): Number of records to skip tenant_id (str): Tenant integration ID to retrieve partners (SupportedPartners | None): Supported partners Returns: JSONResponse: JSON response containing list of integrations or error
     *
     * @tags tenants
     * @name GetTenantsSharedApiV1TenantsGet
     * @summary Get Tenants
     * @request GET:/shared/api/v1/tenants/
     * @secure
     */
    getTenantsSharedApiV1TenantsGet: (
      query?: {
        /**
         * Tenant Id
         * Tenant integration ID to retrieve
         */
        tenant_id?: string | null;
        /**
         * Partners
         * Partner name to retrieve
         */
        partners?: SupportedPartners | null;
        /**
         * Limit
         * Maximum number of records to return
         * @example 10
         */
        limit?: number | null;
        /**
         * Offset
         * Number of records to skip
         * @example 0
         */
        offset?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDictStrUnionListTenantIntegrationDTOPaginationMetadata, HTTPValidationError>({
        path: `/shared/api/v1/tenants/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all tenant integration synchronizations, optionally filtered by tenant_integration_id.
     *
     * @tags tenants, tenants, synchronizations
     * @name GetTenantIntegrationSynchronizationsSharedApiV1TenantsSynchronizationsGet
     * @summary Get Tenant Integration Synchronizations
     * @request GET:/shared/api/v1/tenants/synchronizations
     * @secure
     */
    getTenantIntegrationSynchronizationsSharedApiV1TenantsSynchronizationsGet: (
      query?: {
        /**
         * Tenant Integration Id
         * Filter by tenant integration ID
         */
        tenant_integration_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        BaseResponseModelListTenantIntegrationSynchronizationDTO,
        BaseResponseModelDict | HTTPValidationError
      >({
        path: `/shared/api/v1/tenants/synchronizations`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new tenant integration synchronization.
     *
     * @tags tenants, tenants, synchronizations
     * @name CreateTenantIntegrationSynchronizationSharedApiV1TenantsSynchronizationsPost
     * @summary Create Tenant Integration Synchronization
     * @request POST:/shared/api/v1/tenants/synchronizations
     * @secure
     */
    createTenantIntegrationSynchronizationSharedApiV1TenantsSynchronizationsPost: (
      data: TenantIntegrationSynchronizationCreateDTO,
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/synchronizations`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the synchronization_is_active status of a tenant integration synchronization.
     *
     * @tags tenants, tenants, synchronizations
     * @name UpdateTenantIntegrationSynchronizationStatusSharedApiV1TenantsSynchronizationsSynchronizationIdPatch
     * @summary Update Tenant Integration Synchronization Status
     * @request PATCH:/shared/api/v1/tenants/synchronizations/{synchronization_id}
     * @secure
     */
    updateTenantIntegrationSynchronizationStatusSharedApiV1TenantsSynchronizationsSynchronizationIdPatch: (
      synchronizationId: string,
      query: {
        /**
         * Synchronization Is Active
         * New synchronization status
         */
        synchronization_is_active: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelTenantIntegrationSynchronizationDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/synchronizations/${synchronizationId}`,
        method: 'PATCH',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Publish events for all active tenant integration synchronizations to the integrations topic. This endpoint will: 1. Find all active synchronizations in the database 2. Create integration_sync.created events for each one 3. Publish them to the integrations SNS topic for the sync queue to process
     *
     * @tags tenants, tenants, synchronizations, events
     * @name PublishActiveSynchronizationEventsSharedApiV1TenantsSynchronizationsPublishEventsPost
     * @summary Publish Active Synchronization Events
     * @request POST:/shared/api/v1/tenants/synchronizations/publish-events
     * @secure
     */
    publishActiveSynchronizationEventsSharedApiV1TenantsSynchronizationsPublishEventsPost: (
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDict, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/synchronizations/publish-events`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all ignored sync entities with optional filters.
     *
     * @tags tenants, tenants, ignored-entities
     * @name GetIgnoredSyncEntitiesSharedApiV1TenantsIgnoredEntitiesGet
     * @summary Get Ignored Sync Entities
     * @request GET:/shared/api/v1/tenants/ignored-entities
     * @secure
     */
    getIgnoredSyncEntitiesSharedApiV1TenantsIgnoredEntitiesGet: (
      query?: {
        /**
         * Tenant Integration Id
         * Filter by tenant integration ID
         */
        tenant_integration_id?: string;
        /**
         * Entity Type
         * Filter by entity type (e.g., student, section)
         */
        entity_type?: string;
        /**
         * Source Partner
         * Filter by source partner (e.g., powerschool, colegium)
         */
        source_partner?: string;
        /**
         * Is Active
         * Filter by active status
         */
        is_active?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListIgnoredSyncEntityDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/ignored-entities`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new ignored sync entity.
     *
     * @tags tenants, tenants, ignored-entities
     * @name CreateIgnoredSyncEntitySharedApiV1TenantsIgnoredEntitiesPost
     * @summary Create Ignored Sync Entity
     * @request POST:/shared/api/v1/tenants/ignored-entities
     * @secure
     */
    createIgnoredSyncEntitySharedApiV1TenantsIgnoredEntitiesPost: (
      data: IgnoredSyncEntityCreateDTO,
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/ignored-entities`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an ignored sync entity by ID.
     *
     * @tags tenants, tenants, ignored-entities
     * @name DeleteIgnoredSyncEntitySharedApiV1TenantsIgnoredEntitiesEntityIdDelete
     * @summary Delete Ignored Sync Entity
     * @request DELETE:/shared/api/v1/tenants/ignored-entities/{entity_id}
     * @secure
     */
    deleteIgnoredSyncEntitySharedApiV1TenantsIgnoredEntitiesEntityIdDelete: (
      entityId: string,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/ignored-entities/${entityId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags tenants
     * @name GetTenantSharedApiV1TenantsIdGet
     * @summary Get Tenant
     * @request GET:/shared/api/v1/tenants/{id}
     * @secure
     */
    getTenantSharedApiV1TenantsIdGet: (id: string, params: RequestParams = {}) =>
      this.request<BaseResponseModelTenantIntegrationDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags tenants
     * @name SaveTenantIntegrationConfigSharedApiV1TenantsConfigPost
     * @summary Save Tenant Integration Config
     * @request POST:/shared/api/v1/tenants/config
     * @secure
     */
    saveTenantIntegrationConfigSharedApiV1TenantsConfigPost: (
      data: TenantIntegrationConfigCreateDTO,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/shared/api/v1/tenants/config`,
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
     * @tags tenants
     * @name GetTenantIntegrationConfigSharedApiV1TenantsTenantIntegrationIdConfigGet
     * @summary Get Tenant Integration Config
     * @request GET:/shared/api/v1/tenants/{tenant_integration_id}/config
     * @secure
     */
    getTenantIntegrationConfigSharedApiV1TenantsTenantIntegrationIdConfigGet: (
      tenantIntegrationId: string,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelTenantIntegrationConfigDTO, HTTPValidationError>({
        path: `/shared/api/v1/tenants/${tenantIntegrationId}/config`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags tenants
     * @name UpdateTenantIntegrationConfigSharedApiV1TenantsTenantIntegrationIdConfigPut
     * @summary Update Tenant Integration Config
     * @request PUT:/shared/api/v1/tenants/{tenant_integration_id}/config
     * @secure
     */
    updateTenantIntegrationConfigSharedApiV1TenantsTenantIntegrationIdConfigPut: (
      tenantIntegrationId: string,
      data: TenantIntegrationConfigUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDict, HTTPValidationError>({
        path: `/shared/api/v1/tenants/${tenantIntegrationId}/config`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a multi-source tenant integration configuration including source_configurations. This endpoint allows updating N-to-1 configurations including: - Basic configuration fields (managed_entity_types, sso settings, etc.) - Source configurations (PowerSchool schools and grade ranges) - Adding, removing, or modifying individual sources
     *
     * @tags tenants
     * @name UpdateMultiSourceConfigSharedApiV1TenantsConfigMultiSourceTenantIntegrationIdPut
     * @summary Update Multi Source Config
     * @request PUT:/shared/api/v1/tenants/config-multi-source/{tenant_integration_id}
     * @secure
     */
    updateMultiSourceConfigSharedApiV1TenantsConfigMultiSourceTenantIntegrationIdPut: (
      tenantIntegrationId: string,
      data: TenantIntegrationConfigCreateWithSourcesDTO,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/config-multi-source/${tenantIntegrationId}`,
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
     * @tags tenants, tenants, sync, inspection
     * @name CreateTenantIntegrationInspectionSharedApiV1TenantsTenantIntegrationIdInspectionPost
     * @summary Create Tenant Integration Inspection
     * @request POST:/shared/api/v1/tenants/{tenant_integration_id}/inspection
     * @secure
     */
    createTenantIntegrationInspectionSharedApiV1TenantsTenantIntegrationIdInspectionPost: (
      tenantIntegrationId: string,
      data: TenantIntegrationInspectionCreateDTO,
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/${tenantIntegrationId}/inspection`,
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
     * @tags tenants
     * @name GetTenantIntegrationInspectionSharedApiV1TenantsTenantIntegrationIdInspectionGet
     * @summary Get Tenant Integration Inspection
     * @request GET:/shared/api/v1/tenants/{tenant_integration_id}/inspection
     * @secure
     */
    getTenantIntegrationInspectionSharedApiV1TenantsTenantIntegrationIdInspectionGet: (
      tenantIntegrationId: string,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelTenantIntegrationInspectionDTO, BaseResponseModelDict>({
        path: `/shared/api/v1/tenants/${tenantIntegrationId}/inspection`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a multi-source tenant integration configuration with PowerSchool sources and grade ranges. This endpoint allows creating N-to-1 configurations where multiple PowerSchool schools sync into a single Cometa tenant with grade-based segmentation.
     *
     * @tags tenants
     * @name CreateMultiSourceConfigSharedApiV1TenantsConfigMultiSourcePost
     * @summary Create Multi Source Config
     * @request POST:/shared/api/v1/tenants/config-multi-source
     * @secure
     */
    createMultiSourceConfigSharedApiV1TenantsConfigMultiSourcePost: (
      data: TenantIntegrationConfigCreateWithSourcesDTO,
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/config-multi-source`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get integration summary including type detection and source information. This endpoint provides comprehensive information about an integration including: - Integration type (legacy, single_source_new, multi_source) - Source count and details - Configuration status
     *
     * @tags tenants
     * @name GetIntegrationSummarySharedApiV1TenantsTenantIntegrationIdSummaryGet
     * @summary Get Integration Summary
     * @request GET:/shared/api/v1/tenants/{tenant_integration_id}/summary
     * @secure
     */
    getIntegrationSummarySharedApiV1TenantsTenantIntegrationIdSummaryGet: (
      tenantIntegrationId: string,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelIntegrationSummaryDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/tenants/${tenantIntegrationId}/summary`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Generates an encrypted token containing tenant_id and available integrations
     *
     * @tags credentials
     * @name GenerateCredentialsSharedApiV1CredentialsGenerateTenantIdPost
     * @summary Generate encrypted credentials token
     * @request POST:/shared/api/v1/credentials/generate/{tenant_id}
     * @secure
     */
    generateCredentialsSharedApiV1CredentialsGenerateTenantIdPost: (tenantId: string, params: RequestParams = {}) =>
      this.request<BaseResponseModelGenerateCredentialsResponseDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/credentials/generate/${tenantId}`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Validates and decrypts an encrypted token to retrieve available integrations
     *
     * @tags credentials
     * @name ValidateCredentialsSharedApiV1CredentialsValidatePost
     * @summary Validate and decrypt credentials token
     * @request POST:/shared/api/v1/credentials/validate
     * @secure
     */
    validateCredentialsSharedApiV1CredentialsValidatePost: (
      data: ValidateCredentialsRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelValidateCredentialsResponseDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/credentials/validate`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create or update a reference (upsert). If a reference with the same unique constraint fields exists, it will be updated. Otherwise, a new reference will be created. The unique constraint includes: - tenant_integration_id - entity_type - target_entity_id - source_entity_id - source_context Parameters ---------- reference : ReferenceCreateDTO The reference data to create or update Returns -------- JSONResponse with BaseResponseModel - 201: Reference created or updated successfully - 400: Invalid reference data - 422: Validation error - 500: Unexpected server error
     *
     * @tags references
     * @name UpsertReferenceSharedApiV1ReferencesPost
     * @summary Upsert Reference
     * @request POST:/shared/api/v1/references/
     * @secure
     */
    upsertReferenceSharedApiV1ReferencesPost: (data: ReferenceCreateDTO, params: RequestParams = {}) =>
      this.request<any, BaseResponseModelDict>({
        path: `/shared/api/v1/references/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get references with optional filters and pagination. Parameters ---------- request : Request FastAPI request object for pagination URL calculation reference_repository : Repository Repository instance for reference operations pagination_service : PaginationService Service for handling pagination URLs tenant_integration_id : str, optional Filter by tenant integration ID entity_type : str, optional Filter by entity type source_entity_id : str, optional Filter by source entity ID target_entity_id : str, optional Filter by target entity ID partner : str, optional Filter by partner (powerschool, additio, colegium) source_context : str, optional Filter by source context limit : int, optional Maximum number of records to return (1-100) offset : int, optional Number of records to skip Returns -------- JSONResponse with BaseResponseModel - 200: References retrieved successfully with pagination metadata - 400: Error searching for references - 500: Unexpected server error
     *
     * @tags references
     * @name GetReferencesSharedApiV1ReferencesGet
     * @summary Get References
     * @request GET:/shared/api/v1/references/
     * @secure
     */
    getReferencesSharedApiV1ReferencesGet: (
      query?: {
        /**
         * Tenant Integration Id
         * Filter by tenant integration ID
         */
        tenant_integration_id?: string | null;
        /**
         * Entity Type
         * Filter by entity type
         */
        entity_type?: string | null;
        /**
         * Source Entity Id
         * Filter by source entity ID
         */
        source_entity_id?: string | null;
        /**
         * Target Entity Id
         * Filter by target entity ID
         */
        target_entity_id?: string | null;
        /**
         * Partner
         * Filter by partner (powerschool, additio, colegium)
         */
        partner?: string | null;
        /**
         * Source Context
         * Filter by source context
         */
        source_context?: string | null;
        /**
         * Limit
         * Maximum number of records to return
         * @example 10
         */
        limit?: number | null;
        /**
         * Offset
         * Number of records to skip
         * @example 0
         */
        offset?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        BaseResponseModelDictStrUnionListReferenceDTOPaginationMetadata,
        BaseResponseModelDict | HTTPValidationError
      >({
        path: `/shared/api/v1/references/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an existing reference by ID. NOTE: tenant_integration_id cannot be updated as it's part of the reference's identity. If you need to change the tenant_integration_id, create a new reference. Parameters ---------- reference_id : str The ID of the reference to update update_data : ReferenceUpdateDTO The fields to update (target_entity_id, source_entity_id, partner, source_context) NOTE: tenant_integration_id is NOT updatable Returns -------- JSONResponse with BaseResponseModel - 200: Reference updated successfully - 404: Reference not found - 400: Invalid update data - 422: Validation error - 500: Unexpected server error
     *
     * @tags references
     * @name UpdateReferenceSharedApiV1ReferencesReferenceIdPut
     * @summary Update Reference
     * @request PUT:/shared/api/v1/references/{reference_id}
     * @secure
     */
    updateReferenceSharedApiV1ReferencesReferenceIdPut: (
      referenceId: string,
      data: ReferenceUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelReferenceDTO, BaseResponseModelDict>({
        path: `/shared/api/v1/references/${referenceId}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a reference by its ID. Parameters ---------- reference_id : str The ID of the reference to retrieve Returns -------- JSONResponse with BaseResponseModel - 200: Reference retrieved successfully - 404: Reference not found - 500: Unexpected server error
     *
     * @tags references
     * @name GetReferenceByIdSharedApiV1ReferencesReferenceIdGet
     * @summary Get Reference By Id
     * @request GET:/shared/api/v1/references/{reference_id}
     * @secure
     */
    getReferenceByIdSharedApiV1ReferencesReferenceIdGet: (referenceId: string, params: RequestParams = {}) =>
      this.request<BaseResponseModelReferenceDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/references/${referenceId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete all references for a given tenant integration ID. This endpoint removes all references associated with the specified tenant integration. This is useful for cleanup operations when a tenant integration is removed or needs to be reset. Parameters ---------- tenant_integration_id : str The ID of the tenant integration whose references should be deleted Returns -------- JSONResponse with BaseResponseModel - 200: References deleted successfully with count - 404: No references found for the tenant integration - 400: Error searching for references - 500: Unexpected server error
     *
     * @tags references
     * @name DeleteReferencesByTenantIntegrationIdSharedApiV1ReferencesTenantIntegrationTenantIntegrationIdDelete
     * @summary Delete References By Tenant Integration Id
     * @request DELETE:/shared/api/v1/references/tenant-integration/{tenant_integration_id}
     * @secure
     */
    deleteReferencesByTenantIntegrationIdSharedApiV1ReferencesTenantIntegrationTenantIntegrationIdDelete: (
      tenantIntegrationId: string,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/references/tenant-integration/${tenantIntegrationId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a student sync origin record. This endpoint should be called by System B BEFORE creating a student in Cometa from PowerSchool. It registers that the sync is originating from PowerSchool, so the handler (System A) knows not to sync it back. Parameters ---------- sync_origin : StudentSyncOriginCreateDTO The sync origin data to create Returns ------- JSONResponse with BaseResponseModel - 201: Sync origin created successfully - 409: Sync origin already exists (duplicate) - 422: Validation error - 500: Server error
     *
     * @tags sync-origins
     * @name CreateSyncOriginSharedApiV1SyncOriginsPost
     * @summary Create Sync Origin
     * @request POST:/shared/api/v1/sync-origins/
     * @secure
     */
    createSyncOriginSharedApiV1SyncOriginsPost: (data: StudentSyncOriginCreateDTO, params: RequestParams = {}) =>
      this.request<any, BaseResponseModelDict>({
        path: `/shared/api/v1/sync-origins/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get student sync origin records. This endpoint is used by the handler (System A) to check if a student was created from PowerSchool, to avoid creating duplicates. Parameters ---------- cometa_student_id : str, optional Filter by Cometa student ID source_student_id : str, optional Filter by source student ID (e.g., PowerSchool ID) school_id : str, optional Filter by school ID (required with source_student_id) tenant_integration_id : str, optional Filter by tenant integration ID (required with source_student_id) origin : str, optional Filter by origin ('powerschool' or 'cometa') Returns ------- JSONResponse with BaseResponseModel - 200: Sync origin found or empty list - 500: Server error
     *
     * @tags sync-origins
     * @name GetSyncOriginSharedApiV1SyncOriginsGet
     * @summary Get Sync Origin
     * @request GET:/shared/api/v1/sync-origins/
     * @secure
     */
    getSyncOriginSharedApiV1SyncOriginsGet: (
      query?: {
        /**
         * Cometa Student Id
         * Filter by Cometa student ID
         */
        cometa_student_id?: string | null;
        /**
         * Source Student Id
         * Filter by source student ID
         */
        source_student_id?: string | null;
        /**
         * School Id
         * Filter by school ID
         */
        school_id?: string | null;
        /**
         * Tenant Integration Id
         * Filter by tenant integration ID
         */
        tenant_integration_id?: string | null;
        /**
         * Origin
         * Filter by origin (powerschool, cometa)
         */
        origin?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelStudentSyncOriginDTO, BaseResponseModelDict | HTTPValidationError>({
        path: `/shared/api/v1/sync-origins/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a student sync origin record. This endpoint should be called by System B AFTER creating a student in Cometa, to update the record with the Cometa student ID and mark it as completed. Parameters ---------- sync_origin_id : str The ID of the sync origin to update update_data : StudentSyncOriginUpdateDTO The fields to update (cometa_student_id, status) Returns ------- JSONResponse with BaseResponseModel - 200: Sync origin updated successfully - 404: Sync origin not found - 422: Validation error - 500: Server error
     *
     * @tags sync-origins
     * @name UpdateSyncOriginSharedApiV1SyncOriginsSyncOriginIdPatch
     * @summary Update Sync Origin
     * @request PATCH:/shared/api/v1/sync-origins/{sync_origin_id}
     * @secure
     */
    updateSyncOriginSharedApiV1SyncOriginsSyncOriginIdPatch: (
      syncOriginId: string,
      data: StudentSyncOriginUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelStudentSyncOriginDTO, BaseResponseModelDict>({
        path: `/shared/api/v1/sync-origins/${syncOriginId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get pending student sync origins for a school/integration. This endpoint is used by the handler (System A) to check if there are any pending syncs from PowerSchool, to handle race conditions. Parameters ---------- school_id : str The school ID to filter by tenant_integration_id : str The tenant integration ID to filter by origin : str The origin to filter by (default: 'powerschool') Returns ------- JSONResponse with BaseResponseModel - 200: List of pending sync origins - 500: Server error
     *
     * @tags sync-origins
     * @name GetPendingSyncOriginsSharedApiV1SyncOriginsPendingGet
     * @summary Get Pending Sync Origins
     * @request GET:/shared/api/v1/sync-origins/pending
     * @secure
     */
    getPendingSyncOriginsSharedApiV1SyncOriginsPendingGet: (
      query: {
        /** School Id */
        school_id: string;
        /** Tenant Integration Id */
        tenant_integration_id: string;
        /**
         * Origin
         * Filter by origin
         * @default "powerschool"
         */
        origin?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListStudentSyncOriginDTO, HTTPValidationError | BaseResponseModelDict>({
        path: `/shared/api/v1/sync-origins/pending`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  external = {
    /**
     * @description Pull levels data from external partner system.
     *
     * @tags external, pull, levels
     * @name PullLevelsExternalApiV1TenantsTenantIdLevelsPullGet
     * @summary Pull Levels
     * @request GET:/external/api/v1/tenants/{tenant_id}/levels/pull/
     * @secure
     */
    pullLevelsExternalApiV1TenantsTenantIdLevelsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/levels/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull academic structure (levels with grades and groups) from external partner system. Args: tenant_id (str): The tenant identifier school_id (str): The school identifier (required) partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of levels with nested grades and groups if successful - 404 if tenant not found - 500 if pull operation fails
     *
     * @tags external, pull, academic-structure
     * @name PullAcademicStructureExternalApiV1TenantsTenantIdAcademicStructurePullGet
     * @summary Pull Academic Structure
     * @request GET:/external/api/v1/tenants/{tenant_id}/academic-structure/pull/
     * @secure
     */
    pullAcademicStructureExternalApiV1TenantsTenantIdAcademicStructurePullGet: (
      tenantId: string,
      query: {
        /** School Id */
        school_id: string;
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/academic-structure/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull full student contact details from external partner system. Args: tenant_id (str): The tenant identifier partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of full student contact details if successful - 404 if tenant not found - 500 if pull operation fails
     *
     * @tags external, pull, full-student-contacts
     * @name PullFullStudentContactsExternalApiV1TenantsTenantIdFullStudentContactsPullGet
     * @summary Pull Full Student Contacts
     * @request GET:/external/api/v1/tenants/{tenant_id}/full-student-contacts/pull/
     * @secure
     */
    pullFullStudentContactsExternalApiV1TenantsTenantIdFullStudentContactsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/full-student-contacts/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull schools data from external partner system. Args: tenant_id (str): The tenant identifier partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of schools if successful - 404 if tenant not found - 500 if pull operation fails
     *
     * @tags external, pull, schools
     * @name PullSchoolsExternalApiV1TenantsTenantIdSchoolsPullGet
     * @summary Pull Schools
     * @request GET:/external/api/v1/tenants/{tenant_id}/schools/pull/
     * @secure
     */
    pullSchoolsExternalApiV1TenantsTenantIdSchoolsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/schools/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull students data from external partner system. Args: tenant_id (str): The tenant identifier school_id (str | None): The school identifier (optional for partners like Colegium) partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of students if successful - 404 if tenant not found - 500 if pull operation fails
     *
     * @tags external, pull, students
     * @name PullStudentsExternalApiV1TenantsTenantIdStudentsPullGet
     * @summary Pull Students
     * @request GET:/external/api/v1/tenants/{tenant_id}/students/pull/
     * @secure
     */
    pullStudentsExternalApiV1TenantsTenantIdStudentsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/students/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull guardians data from external partner system. Args: tenant_id (str): The tenant identifier student_id (str): The student identifier school_id (str | None): The school identifier (optional for partners like Colegium) partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of guardians if successful - 404 if tenant not found or no guardians found - 500 if pull operation fails
     *
     * @tags external, pull, guardians
     * @name PullGuardiansExternalApiV1TenantsTenantIdGuardiansPullGet
     * @summary Pull Guardians
     * @request GET:/external/api/v1/tenants/{tenant_id}/guardians/pull/
     * @secure
     */
    pullGuardiansExternalApiV1TenantsTenantIdGuardiansPullGet: (
      tenantId: string,
      query: {
        /** Student Id */
        student_id: string;
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/guardians/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull plugin data from external partner system. Args: tenant_id (str): The tenant identifier partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: Response: Response containing either: - 200 with plugin data if successful - 404 if tenant not found or plugin not found - 400 if plugin not supported - 500 if pull operation fails
     *
     * @tags external, pull, plugin
     * @name PullPluginExternalApiV1TenantsTenantIdPluginsPullGet
     * @summary Pull Plugin
     * @request GET:/external/api/v1/tenants/{tenant_id}/plugins/pull/
     * @secure
     */
    pullPluginExternalApiV1TenantsTenantIdPluginsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/plugins/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull sections data from external partner system. Args: tenant_id (str): The tenant identifier school_id (str | None): The school identifier (optional for partners like Colegium) partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of sections if successful - 404 if tenant not found - 500 if pull operation fails
     *
     * @tags external, pull, sections
     * @name PullSectionsExternalApiV1TenantsTenantIdSectionsPullGet
     * @summary Pull Sections
     * @request GET:/external/api/v1/tenants/{tenant_id}/sections/pull/
     * @secure
     */
    pullSectionsExternalApiV1TenantsTenantIdSectionsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/sections/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Pull terms data from external partner system. Args: tenant_id (str): The tenant identifier school_id (str | None): The school identifier (optional for partners like Colegium) partner (PartnerEnum): The partner to pull data from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of terms if successful - 404 if tenant not found - 500 if pull operation fails
     *
     * @tags external, pull, terms
     * @name PullTermsExternalApiV1TenantsTenantIdTermsPullGet
     * @summary Pull Terms
     * @request GET:/external/api/v1/tenants/{tenant_id}/terms/pull/
     * @secure
     */
    pullTermsExternalApiV1TenantsTenantIdTermsPullGet: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/terms/pull/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Public endpoint to register a tenant integration. No authentication required.
     *
     * @tags external, register
     * @name RegisterTenantExternalApiV1TenantsTenantIdRegisterPost
     * @summary Register tenant integration (Public)
     * @request POST:/external/api/v1/tenants/{tenant_id}/register
     */
    registerTenantExternalApiV1TenantsTenantIdRegisterPost: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelListDict, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/register`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List fulfillments for a given tenant and guardian. Args: tenant_id (str): The tenant identifier guardian_id (str): The guardian identifier partner (PartnerEnum): The partner to list fulfillments from pull_service (PullServiceEntity): The pull service dependency Returns: JSONResponse: Response containing either: - 200 with list of fulfillments if successful - 500 if list operation fails
     *
     * @tags external, list, fulfillments
     * @name ListFulfillmentsExternalApiV1TenantsTenantIdFulfillmentsListGet
     * @summary List Fulfillments
     * @request GET:/external/api/v1/tenants/{tenant_id}/fulfillments/list/
     * @secure
     */
    listFulfillmentsExternalApiV1TenantsTenantIdFulfillmentsListGet: (
      tenantId: string,
      query: {
        /** Guardian Id */
        guardian_id: string;
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/fulfillments/list/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Push terms data to external partner system. Args: school_id (str | None): The school identifier (optional for partners like Colegium) term (Dict[str, Any]): The term data to push partner (PartnerEnum): The partner to push data to push_service (PushServiceEntity): The push service dependency Returns: JSONResponse: Response containing either: - 200 with pushed term data if successful - 500 if push operation fails
     *
     * @tags push, terms
     * @name PushTermsExternalApiV1TenantsTenantIdTermsPushPost
     * @summary Push Terms
     * @request POST:/external/api/v1/tenants/{tenant_id}/terms/push/
     * @secure
     */
    pushTermsExternalApiV1TenantsTenantIdTermsPushPost: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<any, BaseResponseModelDict | HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/terms/push/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Push sections data to external partner system. Args: section (Dict[str, Any]): The section data to push partner (PartnerEnum): The partner to push data to push_service (PushServiceEntity): The push service dependency school_id (str | None): The school identifier (optional for partners like Colegium) Returns: JSONResponse: Response containing either: - 200 with pushed section data if successful - 500 if push operation fails
     *
     * @tags push, sections
     * @name PushSectionsExternalApiV1TenantsTenantIdSectionsPushPost
     * @summary Push Sections
     * @request POST:/external/api/v1/tenants/{tenant_id}/sections/push/
     * @secure
     */
    pushSectionsExternalApiV1TenantsTenantIdSectionsPushPost: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/sections/push/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Push guardians data to external partner system. Args: school_id (str | None): The school identifier (optional for partners like Colegium) guardian (Dict[str, Any]): The guardian data to push partner (PartnerEnum): The partner to push data to push_service (PushServiceEntity): The push service dependency Returns: JSONResponse: Response containing either: - 200 with pushed guardian data if successful - 500 if push operation fails
     *
     * @tags push, guardians
     * @name PushGuardiansExternalApiV1TenantsTenantIdGuardiansPushPost
     * @summary Push Guardians
     * @request POST:/external/api/v1/tenants/{tenant_id}/guardians/push/
     * @secure
     */
    pushGuardiansExternalApiV1TenantsTenantIdGuardiansPushPost: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/guardians/push/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Push student data to external partner system. Args: school_id (str | None): The school identifier (optional for partners like Colegium) student (Dict[str, Any]): The student data to push partner (PartnerEnum): The partner to push data to push_service (PushServiceEntity): The push service dependency Returns: JSONResponse: Response containing either: - 200 with pushed student data if successful - 500 if push operation fails
     *
     * @tags push, students
     * @name PushStudentsExternalApiV1TenantsTenantIdStudentsPushPost
     * @summary Push Students
     * @request POST:/external/api/v1/tenants/{tenant_id}/students/push/
     * @secure
     */
    pushStudentsExternalApiV1TenantsTenantIdStudentsPushPost: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/students/push/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Push levels data to external partner system. Args: school_id (str | None): The school identifier (optional for partners like Colegium) level (Dict[str, Any]): The level data to push partner (PartnerEnum): The partner to push data to push_service (PushServiceEntity): The push service dependency Returns: JSONResponse: Response containing either: - 200 with pushed level data if successful - 500 if push operation fails
     *
     * @tags push, levels
     * @name PushLevelsExternalApiV1TenantsTenantIdLevelsPushPost
     * @summary Push Levels
     * @request POST:/external/api/v1/tenants/{tenant_id}/levels/push/
     * @secure
     */
    pushLevelsExternalApiV1TenantsTenantIdLevelsPushPost: (
      tenantId: string,
      query: {
        /**
         * Defines the supported partners for integration.
         *
         * Attributes:
         *     Additio: Represents the Additio partner
         *     PowerSchool: Represents the PowerSchool partner
         *     Colegium: Represents the Colegium partner
         *     Schools: Represents the Schools partner
         *     Unsupported: Represents an unsupported partner
         */
        partner: SupportedPartners;
        /** School Id */
        school_id?: string | null;
      },
      data: Record<string, any>,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/external/api/v1/tenants/${tenantId}/levels/push/`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  sync = {
    /**
     * No description
     *
     * @tags tenants, sync, trigger-sync
     * @name TriggerSyncSyncApiV1TenantsTenantIdActionsTriggerSyncSchoolIdPost
     * @summary Trigger Sync
     * @request POST:/sync/api/v1/tenants/{tenant_id}/actions/trigger-sync/{school_id}
     * @secure
     */
    triggerSyncSyncApiV1TenantsTenantIdActionsTriggerSyncSchoolIdPost: (
      tenantId: string,
      schoolId: string,
      query: {
        /** Source Partner */
        source_partner: string;
        /** Target Partner */
        target_partner: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/sync/api/v1/tenants/${tenantId}/actions/trigger-sync/${schoolId}`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Gets the latest inspection result for a tenant with optional filters. Parameters ---------- - tenant_integration_id : str The tenant integration ID to search for the latest inspection result. - include_discrepancies : bool (default: True) Include entities with discrepancies in the result. - include_unsynced : bool (default: True) Include unsynchronized entities in the result. - include_synced : bool (default: True) Include synchronized entities in the result. - entity_types : List[ManagedEntityType] (optional) List of entity types to filter. Returns -------- JSONResponse with BaseResponseModel - 200: Inspection result found successfully - 404: No inspection result found for tenant - 422: Validation error in request parameters - 500: Internal server error
     *
     * @tags tenants, sync, inspection
     * @name GetLastInspectionResultSyncApiV1TenantsTenantIntegrationIdInspectionLastGet
     * @summary Get Last Inspection Result
     * @request GET:/sync/api/v1/tenants/{tenant_integration_id}/inspection/last
     * @secure
     */
    getLastInspectionResultSyncApiV1TenantsTenantIntegrationIdInspectionLastGet: (
      tenantIntegrationId: string,
      query?: {
        /**
         * Include Discrepancies
         * Include entities with discrepancies
         * @default true
         */
        include_discrepancies?: boolean;
        /**
         * Include Unsynced
         * Include unsynced entities
         * @default true
         */
        include_unsynced?: boolean;
        /**
         * Include Synced
         * Include synced entities
         * @default true
         */
        include_synced?: boolean;
        /**
         * Entity Types
         * List of entity types to filter
         */
        entity_types?: ManagedEntityType[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelDict, BaseResponseModelDict>({
        path: `/sync/api/v1/tenants/${tenantIntegrationId}/inspection/last`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags tenants, sync, inspection
     * @name SyncFirstTimeSyncApiV1TenantsTenantIntegrationIdInspectionFirstTimePost
     * @summary Sync First Time
     * @request POST:/sync/api/v1/tenants/{tenant_integration_id}/inspection/first-time
     * @secure
     */
    syncFirstTimeSyncApiV1TenantsTenantIntegrationIdInspectionFirstTimePost: (
      tenantIntegrationId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/sync/api/v1/tenants/${tenantIntegrationId}/inspection/first-time`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  api = {
    /**
     * @description Encrypt fulfillments and return encrypted URL. This endpoint receives a list of fulfillment objects in the body and a supported partner as a route parameter, encrypts them using AES-256-CBC encryption with DEFLATE RAW compression, and returns a URL with the encrypted data as query parameters. The encryption process: 1. Validates the supported partner from route parameter 2. Serializes fulfillments and partner to JSON 3. Compresses JSON using DEFLATE RAW 4. Encrypts compressed data using AES-256-CBC 5. Encodes IV and encrypted data to Base64URL 6. Returns URL with iv and data query parameters Args: request: Request containing list of fulfillment objects partner: Supported partner as route parameter (additio, powerschool, cometa, crediko) Returns: JSONResponse with encrypted URL and fulfillment count
     *
     * @tags encryption
     * @name EncryptFulfillmentsApiV1EncryptionFulfillmentsPartnerPost
     * @summary Encrypt Fulfillments
     * @request POST:/api/v1/encryption/fulfillments/{partner}
     * @secure
     */
    encryptFulfillmentsApiV1EncryptionFulfillmentsPartnerPost: (
      partner: SupportedPartners,
      data: EncryptFulfillmentsRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<BaseResponseModelEncryptFulfillmentsResponseDTO, BaseResponseModelDict>({
        path: `/api/v1/encryption/fulfillments/${partner}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  healthy = {
    /**
     * No description
     *
     * @name HealthCheckHealthyGet
     * @summary Health Check
     * @request GET:/healthy
     */
    healthCheckHealthyGet: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/healthy`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
