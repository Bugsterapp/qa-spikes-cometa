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

/** Address */
export interface Address {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Created */
  created?: string | null;
  /** Modified */
  modified?: string | null;
  /** Deleted */
  deleted?: string | null;
  /**
   * Deleted By Cascade
   * @default false
   */
  deleted_by_cascade?: boolean;
  /**
   * Archived
   * @default false
   */
  archived?: boolean;
  /** Street */
  street?: string | null;
  /** Interior Number */
  interior_number?: string | null;
  /** Neighborhood */
  neighborhood?: string | null;
  state?: State | null;
  /** Zip Code */
  zip_code?: string | null;
  /** Municipality */
  municipality?: string | null;
  /** Home Phone */
  home_phone?: string | null;
}

/** Country */
export interface Country {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Created */
  created?: string | null;
  /** Modified */
  modified?: string | null;
  /** Deleted */
  deleted?: string | null;
  /**
   * Deleted By Cascade
   * @default false
   */
  deleted_by_cascade?: boolean;
  /**
   * Archived
   * @default false
   */
  archived?: boolean;
  /**
   * Name
   * @default ""
   */
  name?: string;
  /**
   * Code
   * @default ""
   */
  code?: string;
  /**
   * Calling Code
   * @default ""
   */
  calling_code?: string;
}

/** CreateAddressDTO */
export interface CreateAddressDTO {
  /** Street */
  street?: string | null;
  /** Interior Number */
  interior_number?: string | null;
  /** Neighborhood */
  neighborhood?: string | null;
  /** Zip Code */
  zip_code?: string | null;
  /** State Id */
  state_id?: string | null;
  /** Municipality */
  municipality?: string | null;
  /** Home Phone */
  home_phone?: string | null;
}

/** CreateCountryDTO */
export interface CreateCountryDTO {
  /** Name */
  name: string;
  /** Code */
  code: string;
  /** Calling Code */
  calling_code: string;
}

/** CreateStateDTO */
export interface CreateStateDTO {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** State */
export interface State {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Created */
  created?: string | null;
  /** Modified */
  modified?: string | null;
  /** Deleted */
  deleted?: string | null;
  /**
   * Deleted By Cascade
   * @default false
   */
  deleted_by_cascade?: boolean;
  /**
   * Archived
   * @default false
   */
  archived?: boolean;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
}

/** UpdateAddressDTO */
export interface UpdateAddressDTO {
  /** Street */
  street?: string | null;
  /** Interior Number */
  interior_number?: string | null;
  /** Neighborhood */
  neighborhood?: string | null;
  /** Municipality */
  municipality?: string | null;
  /** Zip Code */
  zip_code?: string | null;
  /** Home Phone */
  home_phone?: string | null;
  /** State Id */
  state_id?: string | null;
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
 * @title cometa
 * @version 0.1.0
 * @license Proprietary
 * @contact Cometa Development Team <dev@cometa.com>
 *
 *
 *     ## Cometa - Modular Monolith Backend
 *
 *     A scalable FastAPI-based monolith built with modern Python practices.
 *
 *     ### Architecture
 *     - **Modular monolith** with clear bounded contexts
 *     - **Async/await** for high-performance I/O operations
 *     - **Type-safe** with comprehensive type hints and validation
 *
 *     ### Features
 *     - Automatic interactive API documentation
 *     - Request/response validation with Pydantic
 *     - Comprehensive error handling
 *     - Database migrations with Alembic
 *
 *     ### Technology Stack
 *     - **Framework**: FastAPI + Uvicorn
 *     - **Database**: PostgreSQL with async SQLAlchemy
 *     - **Type Checking**: basedpyright
 *     - **Code Quality**: Ruff (linting + formatting)
 *     - **Package Manager**: uv (10-100x faster than pip)
 *
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags health
     * @name HealthCheckApiV1HealthGet
     * @summary Health Check
     * @request GET:/api/v1/health
     */
    healthCheckApiV1HealthGet: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/v1/health`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name GetCountryApiV1LocationsCountriesPkGet
     * @summary Get Country
     * @request GET:/api/v1/locations/countries/{pk}
     */
    getCountryApiV1LocationsCountriesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<Country, HTTPValidationError>({
        path: `/api/v1/locations/countries/${pk}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name GetCountriesApiV1LocationsCountriesGet
     * @summary Get Countries
     * @request GET:/api/v1/locations/countries
     */
    getCountriesApiV1LocationsCountriesGet: (params: RequestParams = {}) =>
      this.request<Country[], any>({
        path: `/api/v1/locations/countries`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name CreateCountryApiV1LocationsCountriesPost
     * @summary Create Country
     * @request POST:/api/v1/locations/countries
     */
    createCountryApiV1LocationsCountriesPost: (data: CreateCountryDTO, params: RequestParams = {}) =>
      this.request<Country, HTTPValidationError>({
        path: `/api/v1/locations/countries`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name GetStateApiV1LocationsStatesPkGet
     * @summary Get State
     * @request GET:/api/v1/locations/states/{pk}
     */
    getStateApiV1LocationsStatesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<State, HTTPValidationError>({
        path: `/api/v1/locations/states/${pk}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name GetStatesApiV1LocationsStatesGet
     * @summary Get States
     * @request GET:/api/v1/locations/states
     */
    getStatesApiV1LocationsStatesGet: (params: RequestParams = {}) =>
      this.request<State[], any>({
        path: `/api/v1/locations/states`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name CreateStateApiV1LocationsStatesPost
     * @summary Create State
     * @request POST:/api/v1/locations/states
     */
    createStateApiV1LocationsStatesPost: (data: CreateStateDTO, params: RequestParams = {}) =>
      this.request<State, HTTPValidationError>({
        path: `/api/v1/locations/states`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name GetAddressApiV1LocationsAddressesPkGet
     * @summary Get Address
     * @request GET:/api/v1/locations/addresses/{pk}
     */
    getAddressApiV1LocationsAddressesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<Address, HTTPValidationError>({
        path: `/api/v1/locations/addresses/${pk}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name UpdateAddressApiV1LocationsAddressesPkPut
     * @summary Update Address
     * @request PUT:/api/v1/locations/addresses/{pk}
     */
    updateAddressApiV1LocationsAddressesPkPut: (pk: string, data: UpdateAddressDTO, params: RequestParams = {}) =>
      this.request<Address, HTTPValidationError>({
        path: `/api/v1/locations/addresses/${pk}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name GetAddressesApiV1LocationsAddressesGet
     * @summary Get Addresses
     * @request GET:/api/v1/locations/addresses
     */
    getAddressesApiV1LocationsAddressesGet: (params: RequestParams = {}) =>
      this.request<Address[], any>({
        path: `/api/v1/locations/addresses`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags locations
     * @name CreateAddressApiV1LocationsAddressesPost
     * @summary Create Address
     * @request POST:/api/v1/locations/addresses
     */
    createAddressApiV1LocationsAddressesPost: (data: CreateAddressDTO, params: RequestParams = {}) =>
      this.request<Address, HTTPValidationError>({
        path: `/api/v1/locations/addresses`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
