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

/** Action */
export interface Action {
  action_type: ActionType;
  /**
   * Date
   * @format date-time
   */
  date: string;
}

/** ActionType */
export enum ActionType {
  READ = 'READ',
  ANSWERED = 'ANSWERED',
  SIGNED = 'SIGNED',
}

/** Answer */
export interface Answer {
  /** Question Id */
  question_id?: string | null;
  /**
   * Responsed At
   * @default "2026-01-12T17:09:45.834982"
   */
  responsed_at?: string | null;
  /** Response */
  response?: string | null;
  /** Response Id */
  response_id?: string | null;
}

/** AnswerSubmit */
export interface AnswerSubmit {
  /** Question Id */
  question_id: string;
  /**
   * Responsed At
   * @default "2026-01-12T17:09:45.836304"
   */
  responsed_at?: string | null;
  /** Response */
  response: string;
  /** Response Id */
  response_id?: string | null;
}

/** Body_create_communication_dashboard__post */
export interface BodyCreateCommunicationDashboardPost {
  /** Cover Image */
  cover_image?: File | null;
  /**
   * Files List
   * @default []
   */
  files_list?: File[] | null;
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /**
   * Requires Signature
   * @default false
   */
  requires_signature?: boolean;
  /** Response Deadline */
  response_deadline?: string | null;
  /** Communication Status */
  communication_status: string;
  /** Form */
  form?: string | null;
  /** Filters */
  filters?: string | null;
  /** Execution Time */
  execution_time?: string | null;
}

/** Body_update_communication_dashboard__communication_id__put */
export interface BodyUpdateCommunicationDashboardCommunicationIdPut {
  /** Cover Image */
  cover_image?: File | null;
  /**
   * Files List
   * @default []
   */
  files_list?: File[] | null;
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Communication Status */
  communication_status: string;
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /**
   * Requires Signature
   * @default false
   */
  requires_signature?: boolean;
  /** Response Deadline */
  response_deadline?: string | null;
  /** Form */
  form?: string | null;
  /** Filters */
  filters?: string | null;
  /** Execution Time */
  execution_time?: string | null;
}

/** CampaignStatus */
export enum CampaignStatus {
  Active = 'active',
  Completed = 'completed',
  Draft = 'draft',
  Executing = 'executing',
  Failed = 'failed',
  Paused = 'paused',
}

/** Communication */
export interface Communication {
  /** Id */
  id?: string | null;
  /**
   * Created At
   * Fecha de creación del comunicado
   */
  created_at?: string | null;
  /**
   * Updated At
   * Fecha de última actualización del comunicado
   */
  updated_at?: string | null;
  /**
   * Title
   * Título del comunicado
   * @minLength 1
   */
  title: string;
  /**
   * Description
   * Descripción o mensaje del comunicado
   * @minLength 1
   */
  description: string;
  /**
   * School Id
   * ID de la escuela
   * @format uuid
   */
  school_id: string;
  /**
   * Created By
   * ID del usuario que crea el comunicado
   * @format uuid
   */
  created_by: string;
  /**
   * Filters
   * Lista de filtros del comunicado
   */
  filters: object;
  /**
   * Form
   * Formulario del comunicado
   */
  form: FormDTO | FormCreate | null;
  /**
   * Execution Time
   * Fecha y hora de envío del comunicado
   * @format date-time
   */
  execution_time: string;
  /**
   * Requires Signature
   * Indica si se requiere firma obligatoria
   * @default false
   */
  requires_signature?: boolean;
  /**
   * Response Deadline
   * Fecha máxima para responder el comunicado
   */
  response_deadline?: string | null;
  /**
   * Requires Response
   * Indica si al menos una pregunta requiere respuesta obligatoria
   */
  requires_response?: boolean | null;
  /**
   * Segment Id
   * ID del segmento del comunicado
   */
  segment_id: string;
  /**
   * Template Id
   * ID del template del comunicado
   */
  template_id: string;
  /**
   * Status
   * Estado del comunicado
   */
  status?: string | null;
  /**
   * Event Name
   * Nombre del evento del comunicado
   */
  event_name?: string | null;
  /**
   * Cover Image
   * URL de la imagen de portada del comunicado
   */
  cover_image?: string | null;
  /**
   * Cover Image Feed
   * URL de la imagen de portada para feed del comunicado
   */
  cover_image_feed?: string | null;
  /**
   * Cover Image Detail
   * URL de la imagen de portada para detalle del comunicado
   */
  cover_image_detail?: string | null;
  /**
   * Files List
   * Lista de archivos adjuntos del comunicado
   */
  files_list?: string[] | null;
  /**
   * Creator Name
   * Nombre del usuario que creó el comunicado
   */
  creator_name?: string | null;
  /**
   * Notifications Count
   * Cantidad de notificaciones del comunicado
   * @default 0
   */
  notifications_count?: number | null;
  /**
   * Notifications Sent Count
   * Cantidad de notificaciones enviadas con éxito del comunicado
   * @default 0
   */
  notifications_sent_count?: number | null;
  /**
   * Notifications Read Count
   * Cantidad de notificaciones leídas del comunicado
   * @default 0
   */
  notifications_read_count?: number | null;
  /**
   * Notifications Answered Count
   * Cantidad de notificaciones respondidas del comunicado
   * @default 0
   */
  notifications_answered_count?: number | null;
}

/**
 * CommunicationDetail
 * Communication model with FileMetadata for dashboard detail and feed detail endpoints.
 */
export interface CommunicationDetail {
  /** Id */
  id?: string | null;
  /**
   * Created At
   * Fecha de creación del comunicado
   */
  created_at?: string | null;
  /**
   * Updated At
   * Fecha de última actualización del comunicado
   */
  updated_at?: string | null;
  /**
   * Title
   * Título del comunicado
   * @minLength 1
   */
  title: string;
  /**
   * Description
   * Descripción o mensaje del comunicado
   * @minLength 1
   */
  description: string;
  /**
   * School Id
   * ID de la escuela
   * @format uuid
   */
  school_id: string;
  /**
   * Created By
   * ID del usuario que crea el comunicado
   * @format uuid
   */
  created_by: string;
  /**
   * Creator Name
   * Nombre del usuario que creó el comunicado
   */
  creator_name?: string | null;
  /**
   * School Name
   * Nombre de la escuela
   */
  school_name?: string | null;
  /**
   * School Logo
   * Logo de la escuela
   */
  school_logo?: string | null;
  /**
   * Filters
   * Lista de filtros del comunicado
   */
  filters: object;
  /**
   * Form
   * Formulario del comunicado
   */
  form: FormDTO | FormCreate | null;
  /**
   * Execution Time
   * Fecha y hora de envío del comunicado
   * @format date-time
   */
  execution_time: string;
  /**
   * Requires Signature
   * Indica si se requiere firma obligatoria
   * @default false
   */
  requires_signature?: boolean;
  /**
   * Response Deadline
   * Fecha máxima para responder el comunicado
   */
  response_deadline?: string | null;
  /**
   * Requires Response
   * Indica si al menos una pregunta requiere respuesta obligatoria
   */
  requires_response?: boolean | null;
  /**
   * Segment Id
   * ID del segmento del comunicado
   */
  segment_id: string;
  /**
   * Template Id
   * ID del template del comunicado
   */
  template_id: string;
  /**
   * Status
   * Estado del comunicado
   */
  status?: string | null;
  /**
   * Event Name
   * Nombre del evento del comunicado
   */
  event_name?: string | null;
  /** Metadatos de la imagen de portada del comunicado */
  cover_image?: FileMetadata | null;
  /** Metadatos de la imagen de portada para feed del comunicado */
  cover_image_feed?: FileMetadata | null;
  /** Metadatos de la imagen de portada para detalle del comunicado */
  cover_image_detail?: FileMetadata | null;
  /**
   * Files List
   * Lista de metadatos de archivos adjuntos del comunicado
   */
  files_list?: FileMetadata[] | null;
  /**
   * Notifications Count
   * Cantidad de notificaciones del comunicado
   * @default 0
   */
  notifications_count?: number | null;
  /**
   * Notifications Sent Count
   * Cantidad de notificaciones enviadas con éxito del comunicado
   * @default 0
   */
  notifications_sent_count?: number | null;
  /**
   * Notifications Read Count
   * Cantidad de notificaciones leídas del comunicado
   * @default 0
   */
  notifications_read_count?: number | null;
  /**
   * Notifications Answered Count
   * Cantidad de notificaciones respondidas del comunicado
   * @default 0
   */
  notifications_answered_count?: number | null;
}

/** CommunicationListDTO */
export interface CommunicationListDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Execution Time
   * @format date-time
   */
  execution_time: string;
  status: CampaignStatus;
  /** Notifications Count */
  notifications_count: number;
  /** Notifications Sent Count */
  notifications_sent_count: number;
  /** Notifications Answered Count */
  notifications_answered_count: number;
  /** Notifications Read Count */
  notifications_read_count: number;
}

/** FeedNotification */
export interface FeedNotification {
  /** Id */
  id?: string | null;
  communication?: Communication | null;
  /** Status */
  status: string;
  guardian: Guardian;
  /** Answers */
  answers?: Answer[] | null;
  /** History */
  history?: Action[] | null;
}

/**
 * FeedNotificationDetail
 * FeedNotification model for detail endpoints with CommunicationDetail (FileMetadata objects).
 */
export interface FeedNotificationDetail {
  /** Id */
  id?: string | null;
  communication?: CommunicationDetail | null;
  /** Status */
  status: string;
  guardian: Guardian;
  /** Answers */
  answers?: Answer[] | null;
  /** History */
  history?: Action[] | null;
}

/** FileMetadata */
export interface FileMetadata {
  /**
   * Name
   * Original file name
   */
  name: string;
  /**
   * Size
   * File size in bytes
   */
  size?: number | null;
  /**
   * Extension
   * File extension
   */
  extension: string;
  /**
   * Url
   * File URL
   */
  url: string;
}

/** FormCreate */
export interface FormCreate {
  /**
   * Questions
   * Preguntas del formulario
   */
  questions?: QuestionCreate[];
}

/** FormDTO */
export interface FormDTO {
  /** Name */
  name?: string | null;
  /**
   * Questions
   * @default []
   */
  questions?: QuestionDTO[];
}

/** FormSubmit */
export interface FormSubmit {
  /** Answers */
  answers: AnswerSubmit[];
}

/** GroupByType */
export enum GroupByType {
  Student = 'student',
}

/** GroupedNotificationByStudentItem */
export interface GroupedNotificationByStudentItem {
  /** Id */
  id: string;
  /** Status */
  status: string;
  student: Student;
  /** Guardians */
  guardians: GuardianNotification[];
}

/** Guardian */
export interface Guardian {
  /** Id */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  student: Student;
}

/** GuardianNotification */
export interface GuardianNotification {
  /** Id */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  /** Notification Id */
  notification_id: string;
  /** Notification Status */
  notification_status: string;
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** PaginatedResult */
export interface PaginatedResultCommunicationListDTO {
  /** Items */
  items: CommunicationListDTO[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Previous */
  previous?: number | null;
  /** Next */
  next?: number | null;
}

/** PaginatedResult */
export interface PaginatedResultGroupedNotificationByStudentItem {
  /** Items */
  items: GroupedNotificationByStudentItem[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Previous */
  previous?: number | null;
  /** Next */
  next?: number | null;
}

/** PaginatedResult */
export interface PaginatedResultSmallFeedNotification {
  /** Items */
  items: SmallFeedNotification[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Previous */
  previous?: number | null;
  /** Next */
  next?: number | null;
}

/** QuestionCreate */
export interface QuestionCreate {
  /**
   * Statement
   * Enunciado de la pregunta
   */
  statement: string;
  question_type: QuestionType;
  /**
   * Is Required
   * Indica si la pregunta es obligatoria
   * @default false
   */
  is_required?: boolean;
  /**
   * Options
   * Opciones de la pregunta
   */
  options?: string[] | null;
}

/** QuestionDTO */
export interface QuestionDTO {
  /** Id */
  id: string;
  /** Statement */
  statement: string;
  question_type: QuestionType;
  /** Is Required */
  is_required: boolean;
  /** Options */
  options?: QuestionOption[] | null;
}

/** QuestionOption */
export interface QuestionOption {
  /** Id */
  id: string;
  /** Label */
  label: string;
  /** Value */
  value: string;
}

/** QuestionType */
export enum QuestionType {
  Text = 'text',
  Options = 'options',
}

/** SmallFeedNotification */
export interface SmallFeedNotification {
  /** Id */
  id: string;
  student?: Student | null;
  /** Answers */
  answers?: Answer[] | null;
}

/** Student */
export interface Student {
  /** Id */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** School */
  school: string;
  /** Level */
  level?: string | null;
  /** Grade */
  grade?: string | null;
  /** Photo */
  photo?: string | null;
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
 * @title FastAPI
 * @version 0.1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  dashboard = {
    /**
     * @description Create a new communication
     *
     * @tags dashboard
     * @name CreateCommunicationDashboardPost
     * @summary Create Communication
     * @request POST:/dashboard/
     * @secure
     */
    createCommunicationDashboardPost: (data: BodyCreateCommunicationDashboardPost, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/dashboard/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.UrlEncoded,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a communication
     *
     * @tags dashboard
     * @name UpdateCommunicationDashboardCommunicationIdPut
     * @summary Update Communication
     * @request PUT:/dashboard/{communication_id}
     * @secure
     */
    updateCommunicationDashboardCommunicationIdPut: (
      communicationId: string,
      data: BodyUpdateCommunicationDashboardCommunicationIdPut,
      params: RequestParams = {}
    ) =>
      this.request<Communication, HTTPValidationError>({
        path: `/dashboard/${communicationId}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.UrlEncoded,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a communication
     *
     * @tags dashboard
     * @name DeleteCommunicationDashboardCommunicationIdDelete
     * @summary Delete Communication
     * @request DELETE:/dashboard/{communication_id}
     * @secure
     */
    deleteCommunicationDashboardCommunicationIdDelete: (communicationId: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/dashboard/${communicationId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a communication with creator and school information. **Optional Authentication:** - Include `auth` header with token to get school information - Format: `auth: Token your_token_here`
     *
     * @tags dashboard
     * @name GetCommunicationDashboardCommunicationIdGet
     * @summary Get Communication
     * @request GET:/dashboard/{communication_id}
     * @secure
     */
    getCommunicationDashboardCommunicationIdGet: (communicationId: string, params: RequestParams = {}) =>
      this.request<CommunicationDetail, HTTPValidationError>({
        path: `/dashboard/${communicationId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Obtener el listado de comunicaciones
     *
     * @tags dashboard
     * @name GetDashboardListDashboardSchoolIdListGet
     * @summary Get Dashboard List
     * @request GET:/dashboard/{school_id}/list
     * @secure
     */
    getDashboardListDashboardSchoolIdListGet: (
      schoolId: string,
      query?: {
        /** @default "completed" */
        status?: CampaignStatus;
        /**
         * Page
         * The page number to retrieve, starting from 1
         * @min 1
         * @max 100
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * The number of items per page
         * @min 1
         * @max 100
         * @default 10
         */
        limit?: number;
        /**
         * Offset
         * The number of items to skip before starting to collect the result set
         */
        offset?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResultCommunicationListDTO, HTTPValidationError>({
        path: `/dashboard/${schoolId}/list`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Download all notifications of a campaign as CSV
     *
     * @tags dashboard
     * @name DownloadNotificationsCsvDashboardCommunicationIdExportNotificationsGet
     * @summary Download Notifications Csv
     * @request GET:/dashboard/{communication_id}/export-notifications
     * @secure
     */
    downloadNotificationsCsvDashboardCommunicationIdExportNotificationsGet: (
      communicationId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/dashboard/${communicationId}/export-notifications`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Get filtered notifications from a communication/campaign This endpoint retrieves notifications with optional filtering, grouping and pagination. Args: communication_id: UUID of the communication/campaign filters: JSON string containing filter criteria (e.g., {"status": "READ"}) group_by: Optional grouping field (e.g., "student") pagination: Pagination parameters (page, limit, offset) Returns: PaginatedResult[SmallFeedNotification]: Paginated list of filtered notifications when no grouping PaginatedResult[GroupedNotificationByStudentItem]: Paginated list of grouped notifications when group_by is provided Raises: HTTPException: 400 if filters JSON is invalid HTTPException: 404 if communication not found HTTPException: 500 for other errors
     *
     * @tags dashboard
     * @name GetFilteredNotificationsDashboardCommunicationsCommunicationIdNotificationsFilteredGet
     * @summary Get Filtered Notifications
     * @request GET:/dashboard/communications/{communication_id}/notifications/filtered
     * @secure
     */
    getFilteredNotificationsDashboardCommunicationsCommunicationIdNotificationsFilteredGet: (
      communicationId: string,
      query?: {
        /**
         * Filters
         * JSON string of filters to apply
         * @default "{}"
         */
        filters?: string | null;
        /**
         * Group By
         * Group notifications by field (e.g., student)
         */
        group_by?: GroupByType | null;
        /**
         * Page
         * The page number to retrieve, starting from 1
         * @min 1
         * @max 100
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * The number of items per page
         * @min 1
         * @max 100
         * @default 10
         */
        limit?: number;
        /**
         * Offset
         * The number of items to skip before starting to collect the result set
         */
        offset?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        PaginatedResultSmallFeedNotification | PaginatedResultGroupedNotificationByStudentItem,
        HTTPValidationError
      >({
        path: `/dashboard/communications/${communicationId}/notifications/filtered`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  app = {
    /**
     * No description
     *
     * @tags app
     * @name GetUserFeedAppFeedSchoolIdUserIdGet
     * @summary Get User Feed
     * @request GET:/app/feed/{school_id}/{user_id}
     * @secure
     */
    getUserFeedAppFeedSchoolIdUserIdGet: (
      schoolId: string,
      userId: string,
      query?: {
        /**
         * Limit
         * Limit the number of notifications returned
         */
        limit?: number | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<FeedNotification[], HTTPValidationError>({
        path: `/app/feed/${schoolId}/${userId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags app
     * @name GetUserFeedDetailAppFeedFeedNotificationIdGet
     * @summary Get User Feed Detail
     * @request GET:/app/feed/{feed_notification_id}
     * @secure
     */
    getUserFeedDetailAppFeedFeedNotificationIdGet: (feedNotificationId: string, params: RequestParams = {}) =>
      this.request<FeedNotificationDetail, HTTPValidationError>({
        path: `/app/feed/${feedNotificationId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags app
     * @name UpdateFeedNotificationAppFeedFeedNotificationIdUpdatePost
     * @summary Update Feed Notification
     * @request POST:/app/feed/{feed_notification_id}/update
     * @secure
     */
    updateFeedNotificationAppFeedFeedNotificationIdUpdatePost: (
      feedNotificationId: string,
      query: {
        new_status: ActionType;
      },
      params: RequestParams = {}
    ) =>
      this.request<FeedNotification, HTTPValidationError>({
        path: `/app/feed/${feedNotificationId}/update`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags app
     * @name CompleteFormAppFeedFeedNotificationIdCompletePost
     * @summary Complete Form
     * @request POST:/app/feed/{feed_notification_id}/complete
     * @secure
     */
    completeFormAppFeedFeedNotificationIdCompletePost: (
      feedNotificationId: string,
      data: FormSubmit,
      params: RequestParams = {}
    ) =>
      this.request<FeedNotification, HTTPValidationError>({
        path: `/app/feed/${feedNotificationId}/complete`,
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
     * @secure
     */
    healthCheckHealthyGet: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/healthy`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
