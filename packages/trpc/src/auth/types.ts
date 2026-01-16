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

/** ApiCometaUser */
export interface ApiCometaUser {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Name */
  name?: string | null;
  /** Is Staff */
  is_staff: boolean;
  /**
   * Date Joined
   * @format date-time
   */
  date_joined: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** LoginRequest */
export interface LoginRequest {
  /** Username */
  username: string;
  /** Password */
  password: string;
}

/** LoginResponse */
export interface LoginResponse {
  /** Token */
  token: string;
  /** Refresh Token */
  refresh_token: string;
  /** Expires In */
  expires_in: number;
  /** Refresh Expires In */
  refresh_expires_in: number;
  user: ApiCometaUser;
}

/** LogoutRequest */
export interface LogoutRequest {
  /**
   * Refresh Token
   * Refresh token cannot be empty
   * @minLength 1
   */
  refresh_token: string;
}

/** LogoutResponse */
export interface LogoutResponse {
  /** Message */
  message: string;
}

/** PasswordResetRequest */
export interface PasswordResetRequest {
  /** Email */
  email: string;
}

/** PasswordResetResponse */
export interface PasswordResetResponse {
  /** Message */
  message: string;
  /** Success */
  success: boolean;
}

/** RefreshTokenRequest */
export interface RefreshTokenRequest {
  /**
   * Refresh Token
   * Refresh token cannot be empty
   * @minLength 1
   */
  refresh_token: string;
}

/** RefreshTokenResponse */
export interface RefreshTokenResponse {
  /** Access Token */
  access_token: string;
  /** Expires In */
  expires_in: number;
  /** Refresh Token */
  refresh_token: string;
  /** Refresh Expires In */
  refresh_expires_in: number;
}

/** StaffUserCreateRequest */
export interface StaffUserCreateRequest {
  /**
   * First Name
   * @minLength 1
   * @maxLength 100
   */
  first_name: string;
  /**
   * Last Name
   * @minLength 1
   * @maxLength 100
   */
  last_name: string;
  /** Email */
  email: string;
  /** Mobile */
  mobile: string;
  /** Password */
  password?: string | null;
}

/** UserCreateRequest */
export interface UserCreateRequest {
  /**
   * First Name
   * @minLength 1
   * @maxLength 100
   */
  first_name: string;
  /**
   * Last Name
   * @minLength 1
   * @maxLength 100
   */
  last_name: string;
  /** Email */
  email: string;
  /** Mobile */
  mobile?: string | null;
  /** Membership */
  membership: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
}

/** UserResponse */
export interface UserResponse {
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
  membership?: string | null;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /**
   * Is Staff
   * @default false
   */
  is_staff?: boolean;
  /** Last Login */
  last_login?: string | null;
}

/** UserUpdateRequest */
export interface UserUpdateRequest {
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Email */
  email?: string | null;
  /** Mobile */
  mobile?: string | null;
  /** Membership */
  membership?: string | null;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
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
 * @title Cometa Auth Service
 * @version 0.1.0
 *
 * Authentication service for Cometa
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  health = {
    /**
     * No description
     *
     * @tags Health, health
     * @name HealthCheckHealthGet
     * @summary Health Check
     * @request GET:/health
     */
    healthCheckHealthGet: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/health`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  api = {
    /**
     * @description Authenticate user with legacy migration support
     *
     * @tags auth
     * @name AuthenticateWithLegacyMigrationApiV1AuthLoginPost
     * @summary Authenticate user
     * @request POST:/api/v1/auth/login
     */
    authenticateWithLegacyMigrationApiV1AuthLoginPost: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, void | HTTPValidationError>({
        path: `/api/v1/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Refresh access token using refresh token
     *
     * @tags auth
     * @name RefreshTokenApiV1AuthRefreshPost
     * @summary Refresh access token
     * @request POST:/api/v1/auth/refresh
     */
    refreshTokenApiV1AuthRefreshPost: (data: RefreshTokenRequest, params: RequestParams = {}) =>
      this.request<RefreshTokenResponse, void | HTTPValidationError>({
        path: `/api/v1/auth/refresh`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Logout user and invalidate token
     *
     * @tags auth
     * @name LogoutApiV1AuthLogoutPost
     * @summary Logout user
     * @request POST:/api/v1/auth/logout
     */
    logoutApiV1AuthLogoutPost: (data: LogoutRequest, params: RequestParams = {}) =>
      this.request<LogoutResponse, void | HTTPValidationError>({
        path: `/api/v1/auth/logout`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Send a password reset email to a user
     *
     * @tags auth
     * @name RequestPasswordResetApiV1AuthResetPasswordPost
     * @summary Request password reset
     * @request POST:/api/v1/auth/reset-password
     */
    requestPasswordResetApiV1AuthResetPasswordPost: (data: PasswordResetRequest, params: RequestParams = {}) =>
      this.request<PasswordResetResponse, void | HTTPValidationError>({
        path: `/api/v1/auth/reset-password`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new user
     *
     * @tags users
     * @name CreateUserApiV1UsersPost
     * @summary Create user
     * @request POST:/api/v1/users/
     */
    createUserApiV1UsersPost: (data: UserCreateRequest, params: RequestParams = {}) =>
      this.request<UserResponse, void | HTTPValidationError>({
        path: `/api/v1/users/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an existing user
     *
     * @tags users
     * @name UpdateUserApiV1UsersUserIdPatch
     * @summary Update user
     * @request PATCH:/api/v1/users/{user_id}
     */
    updateUserApiV1UsersUserIdPatch: (userId: string, data: UserUpdateRequest, params: RequestParams = {}) =>
      this.request<UserResponse, void | HTTPValidationError>({
        path: `/api/v1/users/${userId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new staff user
     *
     * @tags users
     * @name CreateStaffUserApiV1UsersStaffPost
     * @summary Create staff user
     * @request POST:/api/v1/users/staff
     */
    createStaffUserApiV1UsersStaffPost: (data: StaffUserCreateRequest, params: RequestParams = {}) =>
      this.request<UserResponse, void | HTTPValidationError>({
        path: `/api/v1/users/staff`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
