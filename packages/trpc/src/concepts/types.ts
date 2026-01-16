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

/** AdjustmentDTO */
export interface AdjustmentDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Status */
  status: string;
  calculation: CalculationDTO;
  applicability: ApplicabilityDTO;
  context: InstitutionalContextDTO;
  /** Createdat */
  createdAt: string;
  /** Modifiedat */
  modifiedAt: string;
  /** Createdbyid */
  createdById?: string | null;
  /** Updatedbyid */
  updatedById?: string | null;
}

/** AdjustmentDto */
export interface AdjustmentDto {
  /**
   * Type
   * @pattern ^(EARLY_PAYMENT_DISCOUNT|INTEREST)$
   */
  type: string;
  calculation: SrcContextsSharedInfrastructureApiDtosSharedDtosCalculationDto;
  applicability?: SrcContextsSharedInfrastructureApiDtosSharedDtosApplicabilityDto | null;
}

/** ApplicabilityDTO */
export interface ApplicabilityDTO {
  /** Scope */
  scope: string;
  /** Categories */
  categories?: string[] | null;
  /** Specificconcepts */
  specificConcepts?: (string | Record<string, any>)[] | null;
  /** Excludedconcepts */
  excludedConcepts?: (string | Record<string, any>)[] | null;
  /** Timeconstraint */
  timeConstraint?: Record<string, any> | null;
}

/** AvailabilityDTO */
export interface AvailabilityDTO {
  /**
   * Startdate
   * @format date-time
   */
  startDate: string;
  /** Enddate */
  endDate?: string | null;
}

/** AvailabilityPeriodDto */
export interface AvailabilityPeriodDto {
  /**
   * Startdate
   * @format date-time
   */
  startDate: string;
  /** Enddate */
  endDate?: string | null;
}

/** AvailabilityPeriodResponse */
export interface AvailabilityPeriodResponse {
  /**
   * Startdate
   * @format date-time
   */
  startDate: string;
  /** Enddate */
  endDate?: string | null;
}

/** BankAccountResponse */
export interface BankAccountResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Publicsummary */
  publicSummary: string;
  /** Accountnumber */
  accountNumber: string;
}

/** BaseDueStrategyDto */
export interface BaseDueStrategyDto {
  /**
   * Type
   * @pattern ^(SPECIFIC_DAY_OF_MONTH|DAYS_AFTER_SELECTION|SPECIFIC_DATES|RECURRENCE_RULE)$
   */
  type: string;
  /** Dayofmonth */
  dayOfMonth?: number | null;
  /** Daysafterselection */
  daysAfterSelection?: number | null;
  /** Specificdates */
  specificDates?: string[] | null;
  /** Rrulepattern */
  rrulePattern?: string | null;
  /** Rrulestartdate */
  rruleStartDate?: string | null;
}

/** BaseInstallmentAmountDto */
export interface BaseInstallmentAmountDto {
  /**
   * Installmentnumber
   * Installment sequence number
   */
  installmentNumber: number;
  amount: BaseMoneyDto;
}

/** BaseMoneyDto */
export interface BaseMoneyDto {
  /** Amount */
  amount: number | string;
  /**
   * Currency
   * @minLength 3
   * @maxLength 3
   */
  currency: string;
}

/** BasePaymentScheduleOptionDto */
export interface BasePaymentScheduleOptionDto {
  /** Name */
  name?: string | null;
  /**
   * Numberofpayments
   * @exclusiveMin 0
   */
  numberOfPayments: number;
  installmentAmount: BaseMoneyDto;
  dueStrategy: BaseDueStrategyDto;
  /**
   * Isdefault
   * @default false
   */
  isDefault?: boolean;
  /** Selectiondeadline */
  selectionDeadline?: string | null;
  /** Earlypaymentdiscounts */
  earlyPaymentDiscounts?: AdjustmentDto[] | null;
  /** Latepaymentinterests */
  latePaymentInterests?: AdjustmentDto[] | null;
  /** Installmentamounts */
  installmentAmounts?: BaseInstallmentAmountDto[] | null;
}

/** BasePricingModelDto */
export interface BasePricingModelDto {
  /** Name */
  name?: string | null;
  /**
   * Type
   * @pattern ^(STANDARD|TIERED|PROMOTIONAL|SEGMENTED)$
   */
  type: string;
  /**
   * Applicableto
   * @pattern ^(STUDENT|EXTERNAL|ALL)$
   */
  applicableTo: string;
  /** Channels */
  channels: string[];
  /** Scheduleoptions */
  scheduleOptions: BasePaymentScheduleOptionDto[];
}

/** Body_upload_temporary_files_api_v1_media_upload_temporary_post */
export interface BodyUploadTemporaryFilesApiV1MediaUploadTemporaryPost {
  /**
   * Files
   * List of files to upload.
   */
  files: File[];
}

/** BulkCancelReservationsDto */
export interface BulkCancelReservationsDto {
  /**
   * Orderid
   * Order ID for which the reservations should be cancelled
   */
  orderId: string;
  /**
   * Cancelledbyid
   * ID of the user cancelling the reservations
   */
  cancelledById?: string | null;
}

/** BulkCancelReservationsResponse */
export interface BulkCancelReservationsResponse {
  /** Cancelledreservations */
  cancelledReservations: BulkReservationItem[];
}

/** BulkConfirmReservationsDto */
export interface BulkConfirmReservationsDto {
  /**
   * Orderid
   * Order ID for which the reservations should be confirmed
   */
  orderId: string;
  /**
   * Confirmedbyid
   * ID of the user confirming the reservations
   */
  confirmedById?: string | null;
}

/** BulkConfirmReservationsResponse */
export interface BulkConfirmReservationsResponse {
  /** Confirmedreservations */
  confirmedReservations: BulkReservationItem[];
}

/** BulkReservationItem */
export interface BulkReservationItem {
  /** Id */
  id: string;
  /** Itemid */
  itemId: string;
}

/** BulkReservationResponse */
export interface BulkReservationResponse {
  /** Reservations */
  reservations: BulkReservationItem[];
}

/** CalculationDTO */
export interface CalculationDTO {
  /** Type */
  type: string;
  /** Value */
  value: string | number;
}

/** ConceptCategory */
export enum ConceptCategory {
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

/** ConceptCategoryDetail */
export interface ConceptCategoryDetail {
  /** Id */
  id: string;
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Is Active */
  is_active: boolean;
}

/** ConceptDTO */
export interface ConceptDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Category */
  category: string;
  /** Categoryid */
  categoryId: string;
  /** Institutionalunitid */
  institutionalUnitId: string;
}

/** ConceptOfferingResponse */
export interface ConceptOfferingResponse {
  /** Id */
  id: string;
  concept: ConceptDTO;
  /** Pricingmodels */
  pricingModels: PricingModelDTO[];
  availability: AvailabilityDTO;
  /** Cycleid */
  cycleId?: string | null;
  /** Status */
  status: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
  /** Createdbyid */
  createdById?: string | null;
  /** Modifiedbyid */
  modifiedById?: string | null;
}

/** ConceptResponse */
export interface ConceptResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Category */
  category: string;
  /**
   * Categoryid
   * @format uuid
   */
  categoryId: string;
  context: InstitutionalContextResponse;
  /** Isbillable */
  isBillable: boolean;
  taxSettings: TaxSettingsResponse;
  /** Description */
  description?: string | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Modifiedat
   * @format date-time
   */
  modifiedAt: string;
  /** Createdbyid */
  createdById: string | null;
  /** Modifiedbyid */
  modifiedById: string | null;
  /** Deletedat */
  deletedAt: string | null;
  /** Requiresinventorytracking */
  requiresInventoryTracking: boolean;
}

/** CreateAdjustmentDto */
export interface CreateAdjustmentDto {
  /**
   * Name
   * @minLength 3
   * @maxLength 150
   */
  name: string;
  /**
   * Type
   * @pattern ^(SCHOLARSHIP|EARLY_PAYMENT_DISCOUNT|SPECIAL_DISCOUNT|SURCHARGE|INTEREST)$
   */
  type: string;
  calculation: SrcContextsSharedInfrastructureApiDtosSharedDtosCalculationDto;
  applicability: SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosCreateAdjustmentApplicabilityDto;
  institutionalContext: SrcContextsSharedInfrastructureApiDtosSharedDtosInstitutionalContextDto;
  /**
   * Createdbyid
   * ID of the user creating the adjustment
   */
  createdById?: string | null;
}

/** CreateBulkInventoryReservationDto */
export interface CreateBulkInventoryReservationDto {
  /**
   * Orderid
   * Order ID for which the reservations are being made
   * @format uuid
   */
  orderId: string;
  /**
   * Createdbyid
   * ID of the user creating the reservations
   */
  createdById?: string | null;
  /**
   * Items
   * List of items to reserve
   * @minItems 1
   */
  items: ReservationItemDto[];
}

/** CreateConceptDto */
export interface CreateConceptDto {
  /**
   * Name
   * @minLength 2
   * @maxLength 150
   */
  name: string;
  /**
   * Category
   * @format uuid
   */
  category: string;
  institutionalContext: SrcContextsSharedInfrastructureApiDtosSharedDtosInstitutionalContextDto;
  /** Isbillable */
  isBillable: boolean;
  taxSettings: TaxSettingsDto;
  /** Description */
  description?: string | null;
  /** Createdbyid */
  createdById?: string | null;
  /**
   * Requiresinventorytracking
   * @default false
   */
  requiresInventoryTracking?: boolean;
}

/** CreateConceptOfferingDto */
export interface CreateConceptOfferingDto {
  /** Pricingmodels */
  pricingModels: BasePricingModelDto[];
  availability: AvailabilityPeriodDto;
  /**
   * Createdbyid
   * ID of the user creating the concept offering
   */
  createdById?: string | null;
  /** Cycleid */
  cycleId?: string | null;
}

/** CreateInventoryAdjustmentDto */
export interface CreateInventoryAdjustmentDto {
  /** Quantitychange */
  quantityChange: number;
  /**
   * Reason
   * @pattern ^(INITIAL_SETUP|PURCHASE|SALE|RETURN|DAMAGE|LOSS|QUALITY_CONTROL|RECOUNT|OTHER)$
   */
  reason: string;
  /** Notes */
  notes?: string | null;
  /** Referenceid */
  referenceId?: string | null;
  /**
   * Performedbyid
   * @format uuid
   */
  performedById: string;
}

/** CreateInventoryReservationDto */
export interface CreateInventoryReservationDto {
  /**
   * Orderid
   * Order ID for which the reservation is being made
   * @format uuid
   */
  orderId: string;
  /**
   * Quantity
   * Quantity to reserve
   * @exclusiveMin 0
   */
  quantity: number;
  /**
   * Createdbyid
   * ID of the user creating the reservation
   */
  createdById?: string | null;
}

/** CreateProductListingDto */
export interface CreateProductListingDto {
  /**
   * Name
   * @minLength 2
   * @maxLength 150
   */
  name: string;
  availabilityPeriod: AvailabilityPeriodDto;
  /**
   * Applicableto
   * @pattern ^(STUDENT|EXTERNAL|ALL)$
   */
  applicableTo: string;
  /** Channels */
  channels: string[];
  /** Tempimages */
  tempImages?: TempImageDto[] | null;
  tempCoverImage?: TempImageDto | null;
  /**
   * Createdbyid
   * @format uuid
   */
  createdById: string;
}

/** CreateProductVariantDto */
export interface CreateProductVariantDto {
  /**
   * Name
   * @minLength 2
   * @maxLength 150
   */
  name: string;
  unitCost: BaseMoneyDto;
  /**
   * Tracksinventory
   * @default true
   */
  tracksInventory?: boolean;
  /** Initialstock */
  initialStock?: number | null;
  /**
   * Hasunlimitedstock
   * @default false
   */
  hasUnlimitedStock?: boolean;
  /**
   * Reorderthreshold
   * @min 0
   * @default 0
   */
  reorderThreshold?: number;
  /** Attributes */
  attributes?: Record<string, string> | null;
  /** Description */
  description?: string | null;
  /** Tempimages */
  tempImages?: TempImageDto[] | null;
  tempCoverImage?: TempImageDto | null;
  /**
   * Createdbyid
   * @format uuid
   */
  createdById: string;
}

/** DueStrategyDTO */
export interface DueStrategyDTO {
  /** Type */
  type: string;
  /** Specificdates */
  specificDates?: string[] | null;
  /** Rrulepattern */
  rrulePattern?: string | null;
  /** Rrulestartdate */
  rruleStartDate?: string | null;
}

/** FileResponse */
export interface FileResponse {
  /** Key */
  key: string;
  /** Url */
  url?: string | null;
  /** Mimetype */
  mimeType: string;
  /** Originalname */
  originalName?: string | null;
}

/** FiscalEntityResponse */
export interface FiscalEntityResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/**
 * HealthResponse
 * @example {"status":"healthy"}
 */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ImageDto */
export interface ImageDto {
  /** Key */
  key: string;
  /** Originalname */
  originalName?: string | null;
}

/** InstallmentAmountDTO */
export interface InstallmentAmountDTO {
  /** Installmentnumber */
  installmentNumber: number;
  amount: MoneyDTO;
  /** Paymentdate */
  paymentDate?: string | null;
}

/** InstitutionalContextDTO */
export interface InstitutionalContextDTO {
  /** Unittype */
  unitType: string;
  /** Unitid */
  unitId: string;
}

/** InstitutionalContextResponse */
export interface InstitutionalContextResponse {
  /** Unittype */
  unitType: string;
  /**
   * Unitid
   * @format uuid
   */
  unitId: string;
}

/** InstitutionalUnitType */
export enum InstitutionalUnitType {
  SCHOOL = 'SCHOOL',
  CAMPUS = 'CAMPUS',
  PROGRAM = 'PROGRAM',
  SCHOOL_GROUP = 'SCHOOL_GROUP',
}

/** InventoryAdjustmentResponse */
export interface InventoryAdjustmentResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Itemid
   * @format uuid
   */
  itemId: string;
  /** Quantitychange */
  quantityChange: number;
  /** Reason */
  reason: string;
  /** Notes */
  notes?: string | null;
  /** Referenceid */
  referenceId?: string | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Deletedat */
  deletedAt?: string | null;
  /** Createdbyid */
  createdById?: string | null;
  /** Updatedbyid */
  updatedById?: string | null;
}

/** InventoryInfoResponse */
export interface InventoryInfoResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Availablequantity */
  availableQuantity: number;
}

/** InventoryItemResponse */
export interface InventoryItemResponse {
  /** Id */
  id: string;
  /** Variantid */
  variantId: string;
  /** Onhandquantity */
  onHandQuantity: number;
  /** Reservedquantity */
  reservedQuantity: number;
  /** Reorderthreshold */
  reorderThreshold: number;
  /** Hasunlimitedstock */
  hasUnlimitedStock: boolean;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /** Updatedat */
  updatedAt: string | null;
  /** Deletedat */
  deletedAt: string | null;
  /** Createdbyid */
  createdById: string;
  /** Updatedbyid */
  updatedById: string | null;
}

/** InventoryReservationResponse */
export interface InventoryReservationResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Itemid
   * @format uuid
   */
  itemId: string;
  /**
   * Orderid
   * @format uuid
   */
  orderId: string;
  /** Quantity */
  quantity: number;
  /** Status */
  status: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Expiresat
   * @format date-time
   */
  expiresAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Deletedat */
  deletedAt?: string | null;
  /** Createdbyid */
  createdById?: string | null;
  /** Updatedbyid */
  updatedById?: string | null;
}

/** MediaUploadResponse */
export interface MediaUploadResponse {
  /**
   * Message
   * @default "Files uploaded to temporary location successfully."
   */
  message?: string;
  /**
   * Uploaded Files
   * List of details for each uploaded file.
   */
  uploaded_files: UploadedFileDetail[];
}

/** MoneyDTO */
export interface MoneyDTO {
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
}

/** MoneyResponse */
export interface MoneyResponse {
  /** Amount */
  amount: string;
  /** Currency */
  currency: string;
}

/** PaginatedResponse */
export interface PaginatedResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: any[];
}

/** PaginatedResponse[ConceptOfferingResponse] */
export interface PaginatedResponseConceptOfferingResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: ConceptOfferingResponse[];
}

/** PaginatedResponse[ConceptResponse] */
export interface PaginatedResponseConceptResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: ConceptResponse[];
}

/** PaginatedResponse[InventoryAdjustmentResponse] */
export interface PaginatedResponseInventoryAdjustmentResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: InventoryAdjustmentResponse[];
}

/** PaginatedResponse[InventoryReservationResponse] */
export interface PaginatedResponseInventoryReservationResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: InventoryReservationResponse[];
}

/** PaginatedResponse[ProductListingResponse] */
export interface PaginatedResponseProductListingResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: ProductListingResponse[];
}

/** PaginatedResponse[ProductVariantResponse] */
export interface PaginatedResponseProductVariantResponse {
  /** Count */
  count: number;
  /** Totalpages */
  totalPages: number;
  /** Currentpage */
  currentPage: number;
  /** Results */
  results: ProductVariantResponse[];
}

/** PaymentScheduleOptionDTO */
export interface PaymentScheduleOptionDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Numberofpayments */
  numberOfPayments: number;
  installmentAmount: MoneyDTO;
  totalAmount: MoneyDTO;
  dueStrategy: DueStrategyDTO;
  /** Isdefault */
  isDefault: boolean;
  /** Selectiondeadline */
  selectionDeadline?: string | null;
  /** Installmentamounts */
  installmentAmounts: InstallmentAmountDTO[];
  /** Earlypaymentdiscounts */
  earlyPaymentDiscounts?: string[] | null;
  /** Latepaymentinterests */
  latePaymentInterests?: string[] | null;
}

/** PricingModelDTO */
export interface PricingModelDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Applicableto */
  applicableTo: string;
  /** Channels */
  channels: string[];
  /** Type */
  type: string;
  /** Scheduleoptions */
  scheduleOptions: PaymentScheduleOptionDTO[];
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** ProductListingResponse */
export interface ProductListingResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /**
   * Conceptid
   * @format uuid
   */
  conceptId: string;
  availabilityPeriod: AvailabilityPeriodResponse;
  /** Applicableto */
  applicableTo: string;
  /** Channels */
  channels: string[];
  /** Images */
  images: FileResponse[];
  coverImage?: FileResponse | null;
  /** Isactive */
  isActive: boolean;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Createdbyid */
  createdById?: string | null;
  /** Updatedbyid */
  updatedById?: string | null;
  /** Deletedat */
  deletedAt?: string | null;
}

/** ProductVariantResponse */
export interface ProductVariantResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Productlistingid
   * @format uuid
   */
  productListingId: string;
  /** Sku */
  sku: string;
  /** Name */
  name: string;
  unitCost: MoneyResponse;
  /** Description */
  description?: string | null;
  /** Attributes */
  attributes?: Record<string, string> | null;
  /** Images */
  images: FileResponse[];
  coverImage?: FileResponse | null;
  /** Isactive */
  isActive: boolean;
  /** Tracksinventory */
  tracksInventory: boolean;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Createdbyid */
  createdById?: string | null;
  /** Updatedbyid */
  updatedById?: string | null;
  /** Deletedat */
  deletedAt?: string | null;
}

/** ProductVariantWithInventoryResponse */
export interface ProductVariantWithInventoryResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Productlistingid
   * @format uuid
   */
  productListingId: string;
  /** Sku */
  sku: string;
  /** Name */
  name: string;
  unitCost: MoneyResponse;
  /** Description */
  description?: string | null;
  /** Attributes */
  attributes?: Record<string, string> | null;
  /** Images */
  images: FileResponse[];
  coverImage?: FileResponse | null;
  /** Isactive */
  isActive: boolean;
  /** Tracksinventory */
  tracksInventory: boolean;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Createdbyid */
  createdById?: string | null;
  /** Updatedbyid */
  updatedById?: string | null;
  /** Deletedat */
  deletedAt?: string | null;
  inventory?: InventoryInfoResponse | null;
}

/** ReservationConfirmationDto */
export interface ReservationConfirmationDto {
  /**
   * Confirmedbyid
   * @format uuid
   */
  confirmedById: string;
}

/** ReservationItemDto */
export interface ReservationItemDto {
  /**
   * Itemid
   * ID of the inventory item to reserve
   */
  itemId: string;
  /**
   * Quantity
   * Quantity to reserve
   * @exclusiveMin 0
   */
  quantity: number;
}

/** TaxSettingsDto */
export interface TaxSettingsDto {
  /** Hassalestax */
  hasSalesTax: boolean;
  /** Taxcode */
  taxCode?: string | null;
  /** Taxunit */
  taxUnit?: string | null;
  /** Useeducationcomplement */
  useEducationComplement: boolean;
  /** Institutionalid */
  institutionalId?: string | null;
  /**
   * Fiscalentityid
   * @format uuid
   */
  fiscalEntityId: string;
  /**
   * Bankaccountid
   * @format uuid
   */
  bankAccountId: string;
}

/** TaxSettingsResponse */
export interface TaxSettingsResponse {
  /** Hassalestax */
  hasSalesTax: boolean;
  /** Taxcode */
  taxCode: string | null;
  /** Taxunit */
  taxUnit: string | null;
  /** Useeducationcomplement */
  useEducationComplement: boolean;
  /** Institutionalid */
  institutionalId: string | null;
  fiscalEntity: FiscalEntityResponse;
  bankAccount: BankAccountResponse;
}

/** TaxSettingsUpdateDto */
export interface TaxSettingsUpdateDto {
  /** Hassalestax */
  hasSalesTax?: boolean | null;
  /** Taxcode */
  taxCode?: string | null;
  /** Taxunit */
  taxUnit?: string | null;
  /** Useeducationcomplement */
  useEducationComplement?: boolean | null;
  /** Institutionalid */
  institutionalId?: string | null;
  /** Fiscalentityid */
  fiscalEntityId?: string | null;
  /** Bankaccountid */
  bankAccountId?: string | null;
}

/** TempImageDto */
export interface TempImageDto {
  /** Key */
  key: string;
  /** Originalname */
  originalName: string;
}

/** TimeConstraintDto */
export interface TimeConstraintDto {
  /**
   * Type
   * @pattern ^(BEFORE_DUE_DATE|AFTER_DUE_DATE|BETWEEN_DATES)$
   */
  type: string;
  /** Daysbeforeduedate */
  daysBeforeDueDate?: number | null;
  /** Daysafterduedate */
  daysAfterDueDate?: number | null;
  /**
   * Includesduedate
   * @default false
   */
  includesDueDate?: boolean | null;
  /** Startdate */
  startDate?: string | null;
  /** Enddate */
  endDate?: string | null;
  /** Recurrencefrequency */
  recurrenceFrequency?: string | null;
}

/** UpdateConceptDto */
export interface UpdateConceptDto {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /** Isbillable */
  isBillable?: boolean | null;
  taxSettings?: TaxSettingsUpdateDto | null;
  /**
   * Updatedbyid
   * @format uuid
   */
  updatedById: string;
  /** Requiresinventorytracking */
  requiresInventoryTracking?: boolean | null;
}

/** UpdateConceptOfferingDto */
export interface UpdateConceptOfferingDto {
  /** Pricingmodels */
  pricingModels: UpdatePricingModelDto[];
  availability?: AvailabilityPeriodDto | null;
  /**
   * Modifiedbyid
   * ID of the user modifying the concept offering
   */
  modifiedById: string;
  /** Cycleid */
  cycleId?: string | null;
}

/** UpdateInventoryItemDto */
export interface UpdateInventoryItemDto {
  /**
   * Reorderthreshold
   * New reorder threshold value. Must be non-negative.
   */
  reorderThreshold?: number | null;
  /**
   * Updatedbyid
   * ID of the user making the update. Required.
   * @format uuid
   */
  updatedById: string;
}

/** UpdatePaymentScheduleOptionDto */
export interface UpdatePaymentScheduleOptionDto {
  /** Name */
  name?: string | null;
  /**
   * Numberofpayments
   * @exclusiveMin 0
   */
  numberOfPayments: number;
  installmentAmount: BaseMoneyDto;
  dueStrategy: BaseDueStrategyDto;
  /**
   * Isdefault
   * @default false
   */
  isDefault?: boolean;
  /** Selectiondeadline */
  selectionDeadline?: string | null;
  /** Earlypaymentdiscounts */
  earlyPaymentDiscounts?:
    | SrcContextsAcademicFinanceConceptsInfrastructureApiDtosConceptOfferingCommonDtosUpdateAdjustmentDto[]
    | null;
  /** Latepaymentinterests */
  latePaymentInterests?:
    | SrcContextsAcademicFinanceConceptsInfrastructureApiDtosConceptOfferingCommonDtosUpdateAdjustmentDto[]
    | null;
  /** Installmentamounts */
  installmentAmounts?: BaseInstallmentAmountDto[] | null;
  /**
   * Id
   * Schedule option ID
   */
  id?: string | null;
}

/** UpdatePricingModelDto */
export interface UpdatePricingModelDto {
  /** Name */
  name?: string | null;
  /**
   * Type
   * @pattern ^(STANDARD|TIERED|PROMOTIONAL|SEGMENTED)$
   */
  type: string;
  /**
   * Applicableto
   * @pattern ^(STUDENT|EXTERNAL|ALL)$
   */
  applicableTo: string;
  /** Channels */
  channels: string[];
  /** Scheduleoptions */
  scheduleOptions: UpdatePaymentScheduleOptionDto[];
  /**
   * Id
   * Pricing model ID
   */
  id?: string | null;
}

/** UpdateProductListingDto */
export interface UpdateProductListingDto {
  /** Name */
  name?: string | null;
  availabilityPeriod?: AvailabilityPeriodDto | null;
  /** Applicableto */
  applicableTo?: string | null;
  /** Channels */
  channels?: string[] | null;
  /** Images */
  images?: ImageDto[] | null;
  coverImage?: ImageDto | null;
  /** Isactive */
  isActive?: boolean | null;
  /**
   * Updatedbyid
   * @format uuid
   */
  updatedById: string;
}

/** UpdateProductVariantDto */
export interface UpdateProductVariantDto {
  /** Name */
  name?: string | null;
  unitCost?: BaseMoneyDto | null;
  /** Description */
  description?: string | null;
  /** Attributes */
  attributes?: Record<string, string> | null;
  /** Isactive */
  isActive?: boolean | null;
  /** Images */
  images?: TempImageDto[] | null;
  coverImage?: TempImageDto | null;
  /**
   * Updatedbyid
   * @format uuid
   */
  updatedById: string;
}

/** UploadedFileDetail */
export interface UploadedFileDetail {
  /**
   * Temp File Key
   * The S3 key for the temporarily uploaded file.
   */
  temp_file_key: string;
  /**
   * Original Filename
   * The original name of the uploaded file.
   */
  original_filename: string;
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

/** ApplicabilityDto */
export interface SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosCreateAdjustmentApplicabilityDto {
  /**
   * Scope
   * @pattern ^(ALL_CATEGORIES|BY_CATEGORY|SPECIFIC_CONCEPTS)$
   */
  scope: string;
  /** Categories */
  categories?: ConceptCategory[] | null;
  /** Specificconcepts */
  specificConcepts?: string[] | null;
  /** Excludedconcepts */
  excludedConcepts?: string[] | null;
  timeConstraint?: TimeConstraintDto | null;
}

/** ApplicabilityDto */
export interface SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentApplicabilityDto {
  /** Scope */
  scope?: string | null;
  /** Categories */
  categories?: ConceptCategory[] | null;
  /** Specificconcepts */
  specificConcepts?: string[] | null;
  /** Excludedconcepts */
  excludedConcepts?: string[] | null;
}

/** CalculationDto */
export interface SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentCalculationDto {
  /** Type */
  type?: string | null;
  /** Value */
  value?: number | string | null;
}

/** InstitutionalContextDto */
export interface SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentInstitutionalContextDto {
  /** Unittype */
  unitType: string | null;
  /** Unitid */
  unitId: string | null;
}

/** UpdateAdjustmentDto */
export interface SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentUpdateAdjustmentDto {
  /** Name */
  name?: string | null;
  /** Type */
  type?: string | null;
  calculation?: SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentCalculationDto | null;
  applicability?: SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentApplicabilityDto | null;
  institutionalContext?: SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentInstitutionalContextDto | null;
  /**
   * Updatedbyid
   * @format uuid
   */
  updatedById: string;
}

/** UpdateAdjustmentDto */
export interface SrcContextsAcademicFinanceConceptsInfrastructureApiDtosConceptOfferingCommonDtosUpdateAdjustmentDto {
  /**
   * Type
   * @pattern ^(EARLY_PAYMENT_DISCOUNT|INTEREST)$
   */
  type: string;
  calculation: SrcContextsSharedInfrastructureApiDtosSharedDtosCalculationDto;
  applicability?: SrcContextsSharedInfrastructureApiDtosSharedDtosApplicabilityDto | null;
  /**
   * Id
   * Adjustment ID
   */
  id?: string | null;
}

/** ApplicabilityDto */
export interface SrcContextsSharedInfrastructureApiDtosSharedDtosApplicabilityDto {
  /**
   * Scope
   * @pattern ^(ALL_CATEGORIES|BY_CATEGORY|SPECIFIC_CONCEPTS)$
   */
  scope: string;
  /** Specificconcepts */
  specificConcepts?: string[] | null;
  timeConstraint?: TimeConstraintDto | null;
}

/** CalculationDto */
export interface SrcContextsSharedInfrastructureApiDtosSharedDtosCalculationDto {
  /**
   * Type
   * @pattern ^(PERCENTAGE|FIXED_AMOUNT)$
   */
  type: string;
  /** Value */
  value: number | string;
}

/** InstitutionalContextDto */
export interface SrcContextsSharedInfrastructureApiDtosSharedDtosInstitutionalContextDto {
  unitType: InstitutionalUnitType;
  /**
   * Unitid
   * @format uuid
   */
  unitId: string;
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
 * @title Concepts Service API
 * @version 1.0.0
 *
 * API para gestión de cobranzas
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Health
   * @name HealthCheckGet
   * @summary Health check endpoint
   * @request GET:/
   */
  healthCheckGet = (params: RequestParams = {}) =>
    this.request<HealthResponse, any>({
      path: `/`,
      method: 'GET',
      format: 'json',
      ...params,
    });

  api = {
    /**
     * @description Lists adjustments of a specific type for an institutional unit (e.g., school) with optional filtering and sorting. Filter format: filters[index][field]=name &filters[index][operator]=eq &filters[index][value]=value Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) Example queries: - All adjustments: /adjustments - Filter by name: /adjustments?filters[0][field]=name &filters[0][operator]=contains &filters[0][value]=scholarship - Filter by institutional_unit_id: /adjustments?filters[0][field]=institutional_unit_id &filters[0][operator]=eq &filters[0][value]=your-id - Filter by type: /adjustments?filters[0][field]=type &filters[0][operator]=eq &filters[0][value]=SCHOLARSHIP Pagination: - Page: /adjustments?page=2 - Page size: /adjustments?page_size=10 Ordering: - Order by field: /adjustments?order_by=name&order_type=asc - Order by field (descending): /adjustments?order_by=name&order_type=desc
     *
     * @tags adjustments
     * @name FindAdjustmentsApiV1AdjustmentsGet
     * @summary List adjustments
     * @request GET:/api/v1/adjustments
     * @secure
     */
    findAdjustmentsApiV1AdjustmentsGet: (params: RequestParams = {}) =>
      this.request<PaginatedResponse, void>({
        path: `/api/v1/adjustments`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a new adjustment (scholarship, discount, etc.) with the specified configuration. The adjustment can be configured with: - Different calculation types (percentage or fixed amount) - Various applicability scopes (all categories, specific categories, or specific concepts) - Optional time constraints for payment conditions - Institutional context defining where the adjustment applies ### Applicability Scope Configuration Options - **BY_CATEGORY**: - Specify one or more `categories`. - It's **not** necessary to send `specificConcepts` belonging to those categories. - Optionally, you can send a list of `excludedConcepts` (concept IDs) that should not be affected by this adjustment within the specified categories. - Example: Apply to `MONTHLY_FEE` category but exclude concept ID `a9d99337-6a62-42a8-b872-79abd2dbb1ef`. - **SPECIFIC_CONCEPTS**: - Specify one or more `specificConcepts` (concept IDs) that this adjustment will affect. - **Do not** specify `categories` when using this scope. - `excludedConcepts` is not applicable here. - **ALL_CATEGORIES**: - This is a wildcard to create an adjustment that affects all concept categories. - No need to specify `categories`, `specificConcepts`, or `excludedConcepts`.
     *
     * @tags adjustments
     * @name CreateAdjustmentApiV1AdjustmentsPost
     * @summary Create a new adjustment
     * @request POST:/api/v1/adjustments
     * @secure
     */
    createAdjustmentApiV1AdjustmentsPost: (data: CreateAdjustmentDto, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/adjustments`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates an adjustment (scholarship, discount, etc.) with the specified configuration. The adjustment can be configured with: - Different calculation types (percentage or fixed amount) - Various applicability scopes (all categories, specific categories, or specific concepts) - Optional time constraints for payment conditions - Institutional context defining where the adjustment applies
     *
     * @tags adjustments
     * @name UpdateAdjustmentApiV1AdjustmentsAdjustmentIdPatch
     * @summary Update an adjustment
     * @request PATCH:/api/v1/adjustments/{adjustment_id}
     * @secure
     */
    updateAdjustmentApiV1AdjustmentsAdjustmentIdPatch: (
      adjustmentId: string,
      data: SrcContextsAcademicFinanceAdjustmentsInfrastructureApiDtosUpdateAdjustmentUpdateAdjustmentDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/adjustments/${adjustmentId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes an existing adjustment by its ID. The adjustment will be soft-deleted, making it unavailable for future operations while preserving its history in the system. For scholarship type adjustments, deletion will be prevented if: - The scholarship is assigned to one or more students - The scholarship has already been applied to one or more payment
     *
     * @tags adjustments
     * @name DeleteAdjustmentApiV1AdjustmentsAdjustmentIdDelete
     * @summary Delete an adjustment
     * @request DELETE:/api/v1/adjustments/{adjustment_id}
     * @secure
     */
    deleteAdjustmentApiV1AdjustmentsAdjustmentIdDelete: (adjustmentId: string, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/adjustments/${adjustmentId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieves an adjustment by its ID.
     *
     * @tags adjustments
     * @name FindAdjustmentByIdApiV1AdjustmentsAdjustmentIdGet
     * @summary Find an adjustment by ID
     * @request GET:/api/v1/adjustments/{adjustment_id}
     * @secure
     */
    findAdjustmentByIdApiV1AdjustmentsAdjustmentIdGet: (adjustmentId: string, params: RequestParams = {}) =>
      this.request<AdjustmentDTO, void | HTTPValidationError>({
        path: `/api/v1/adjustments/${adjustmentId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists concepts with optional filtering and sorting. Filter format: filters[index][field]=name &filters[index][operator]=eq &filters[index][value]=value Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) - in: Value is in a comma-separated list Example queries: - All concepts: /concepts - Filter by name: /concepts?filters[0][field]=name &filters[0][operator]=contains &filters[0][value]=fee - Pagination: /concepts?page_size=10&page=2 - Sorting: /concepts?order_by=name&order_type=asc
     *
     * @tags concepts
     * @name FindConceptsApiV1ConceptsGet
     * @summary List concepts
     * @request GET:/api/v1/concepts
     * @secure
     */
    findConceptsApiV1ConceptsGet: (params: RequestParams = {}) =>
      this.request<PaginatedResponseConceptResponse, void>({
        path: `/api/v1/concepts`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a new concept with the specified configuration. A concept represents a billable item or service that can be offered to students or external users. It can be configured with: - Name and category - Optional or mandatory status - Tax settings - Institutional context defining where the concept applies
     *
     * @tags concepts
     * @name CreateConceptApiV1ConceptsPost
     * @summary Create a new concept
     * @request POST:/api/v1/concepts
     * @secure
     */
    createConceptApiV1ConceptsPost: (data: CreateConceptDto, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/concepts`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a new concept offering with the specified pricing models and availability period. A concept offering can be configured with: - Different pricing models - Payment schedule options - Early payment discounts and late payment interests - Availability period defining when the offering is valid
     *
     * @tags concept-offerings
     * @name CreateConceptOfferingApiV1ConceptsConceptIdOfferingsPost
     * @summary Create a new concept offering
     * @request POST:/api/v1/concepts/{concept_id}/offerings
     * @secure
     */
    createConceptOfferingApiV1ConceptsConceptIdOfferingsPost: (
      conceptId: string,
      data: CreateConceptOfferingDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}/offerings`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists concept offerings with optional filtering and sorting. Filter format: filters[index][field]=status &filters[index][operator]=eq &filters[index][value]=ACTIVE Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) - in: Value is in a comma-separated list Example queries: - All offerings of a concept: /concepts/{concept_id}/offerings - Filter by status: /offerings?filters[0][field]=status &filters[0][operator]=eq &filters[0][value]=ACTIVE - Pagination: /offerings?page_size=10&page=2 - Sorting: /offerings?order_by=created_at&order_type=desc
     *
     * @tags concept-offerings
     * @name FindConceptOfferingsApiV1ConceptsConceptIdOfferingsGet
     * @summary List concept offerings
     * @request GET:/api/v1/concepts/{concept_id}/offerings
     * @secure
     */
    findConceptOfferingsApiV1ConceptsConceptIdOfferingsGet: (conceptId: string, params: RequestParams = {}) =>
      this.request<PaginatedResponseConceptOfferingResponse, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}/offerings`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a new product listing for a given concept. A product listing represents an offering with a name, availability period, user types, channels, and optional images.
     *
     * @tags product-listings
     * @name CreateProductListingApiV1ConceptsConceptIdProductListingsPost
     * @summary Create a new product listing
     * @request POST:/api/v1/concepts/{concept_id}/product-listings
     * @secure
     */
    createProductListingApiV1ConceptsConceptIdProductListingsPost: (
      conceptId: string,
      data: CreateProductListingDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}/product-listings`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists product listings with optional filtering and sorting. Filter format: filters[index][field]=name &filters[index][operator]=eq &filters[index][value]=value Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) - in: Value is in a comma-separated list Example queries: - All product listings of a concept: /concepts/{concept_id}/product-listings - Filter by name: /product-listings?filters[0][field]=name &filters[0][operator]=contains &filters[0][value]=fee - Pagination: /product-listings?page_size=10&page=2 - Sorting: /product-listings?order_by=name&order_type=asc
     *
     * @tags product-listings
     * @name FindProductListingsApiV1ConceptsConceptIdProductListingsGet
     * @summary List product listings
     * @request GET:/api/v1/concepts/{concept_id}/product-listings
     * @secure
     */
    findProductListingsApiV1ConceptsConceptIdProductListingsGet: (conceptId: string, params: RequestParams = {}) =>
      this.request<PaginatedResponseProductListingResponse, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}/product-listings`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates an existing concept with the specified configuration. A concept represents a billable item or service that can be offered to students or external users. It can be updated with: - Name and category - Billable status - Tax settings
     *
     * @tags concepts
     * @name UpdateConceptApiV1ConceptsConceptIdPatch
     * @summary Update a concept
     * @request PATCH:/api/v1/concepts/{concept_id}
     * @secure
     */
    updateConceptApiV1ConceptsConceptIdPatch: (conceptId: string, data: UpdateConceptDto, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieves a concept by its ID.
     *
     * @tags concepts
     * @name FindConceptByIdApiV1ConceptsConceptIdGet
     * @summary Find a concept by ID
     * @request GET:/api/v1/concepts/{concept_id}
     * @secure
     */
    findConceptByIdApiV1ConceptsConceptIdGet: (conceptId: string, params: RequestParams = {}) =>
      this.request<ConceptResponse, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes an existing concept by its ID. The concept will be soft-deleted, making it unavailable for future operations while preserving its history in the system.
     *
     * @tags concepts
     * @name DeleteConceptApiV1ConceptsConceptIdDelete
     * @summary Delete a concept
     * @request DELETE:/api/v1/concepts/{concept_id}
     * @secure
     */
    deleteConceptApiV1ConceptsConceptIdDelete: (conceptId: string, params: RequestParams = {}) =>
      this.request<void, void | HTTPValidationError>({
        path: `/api/v1/concepts/${conceptId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Lists all active concept categories.
     *
     * @tags concept-categories
     * @name FindConceptCategoriesApiV1ConceptCategoriesGet
     * @summary List all concept categories
     * @request GET:/api/v1/concept-categories
     * @secure
     */
    findConceptCategoriesApiV1ConceptCategoriesGet: (params: RequestParams = {}) =>
      this.request<ConceptCategoryDetail[], void>({
        path: `/api/v1/concept-categories`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Replaces an existing concept offering with the complete state provided in the payload. - All nested entities (pricing models, payment schedule options, etc.) will be replaced by those present in the payload. - Any nested entity not included in the payload will be deleted from the offering. - This endpoint requires the client to send the full resource state, not just partial updates.
     *
     * @tags concept-offerings
     * @name UpdateConceptOfferingApiV1ConceptOfferingsOfferingIdPut
     * @summary Replace a concept offering
     * @request PUT:/api/v1/concept-offerings/{offering_id}
     * @secure
     */
    updateConceptOfferingApiV1ConceptOfferingsOfferingIdPut: (
      offeringId: string,
      data: UpdateConceptOfferingDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/concept-offerings/${offeringId}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieves a concept offering by its ID.
     *
     * @tags concept-offerings
     * @name FindConceptOfferingByIdApiV1ConceptOfferingsOfferingIdGet
     * @summary Find a concept offering by ID
     * @request GET:/api/v1/concept-offerings/{offering_id}
     * @secure
     */
    findConceptOfferingByIdApiV1ConceptOfferingsOfferingIdGet: (offeringId: string, params: RequestParams = {}) =>
      this.request<ConceptOfferingResponse, void | HTTPValidationError>({
        path: `/api/v1/concept-offerings/${offeringId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes an existing concept offering by its ID. The concept offering will be soft-deleted, making it unavailable for future operations while preserving its history in the system.
     *
     * @tags concept-offerings
     * @name DeleteConceptOfferingApiV1ConceptOfferingsOfferingIdDelete
     * @summary Delete a concept offering
     * @request DELETE:/api/v1/concept-offerings/{offering_id}
     * @secure
     */
    deleteConceptOfferingApiV1ConceptOfferingsOfferingIdDelete: (offeringId: string, params: RequestParams = {}) =>
      this.request<void, void | HTTPValidationError>({
        path: `/api/v1/concept-offerings/${offeringId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Retrieves a product listing by its ID.
     *
     * @tags product-listings
     * @name FindProductListingByIdApiV1ProductListingsProductListingIdGet
     * @summary Find a product listing by ID
     * @request GET:/api/v1/product-listings/{product_listing_id}
     * @secure
     */
    findProductListingByIdApiV1ProductListingsProductListingIdGet: (
      productListingId: string,
      params: RequestParams = {}
    ) =>
      this.request<ProductListingResponse, void | HTTPValidationError>({
        path: `/api/v1/product-listings/${productListingId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes an existing product listing by its ID. The product listing will be soft-deleted, making it unavailable for future operations while preserving its history in the system.
     *
     * @tags product-listings
     * @name DeleteProductListingApiV1ProductListingsProductListingIdDelete
     * @summary Delete a product listing
     * @request DELETE:/api/v1/product-listings/{product_listing_id}
     * @secure
     */
    deleteProductListingApiV1ProductListingsProductListingIdDelete: (
      productListingId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, void | HTTPValidationError>({
        path: `/api/v1/product-listings/${productListingId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Updates an existing product listing for a given concept. A product listing represents an offering with a name, availability period, user types, channels, and optional images. Allows partial update of fields.
     *
     * @tags product-listings
     * @name UpdateProductListingApiV1ProductListingsProductListingIdPatch
     * @summary Update a product listing
     * @request PATCH:/api/v1/product-listings/{product_listing_id}
     * @secure
     */
    updateProductListingApiV1ProductListingsProductListingIdPatch: (
      productListingId: string,
      data: UpdateProductListingDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/product-listings/${productListingId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a new product variant associated with an existing product listing. A variant represents a specific configuration of the product, with name, cost, attributes, temporary images, and optional description. The listing ID must be a valid UUID and must exist in the system.
     *
     * @tags product-variants
     * @name CreateProductVariantApiV1ProductListingsProductListingIdVariantsPost
     * @summary Create a new product variant
     * @request POST:/api/v1/product-listings/{product_listing_id}/variants
     * @secure
     */
    createProductVariantApiV1ProductListingsProductListingIdVariantsPost: (
      productListingId: string,
      data: CreateProductVariantDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/product-listings/${productListingId}/variants`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists product variants with optional filtering and sorting. Filter format: filters[index][field]=name &filters[index][operator]=eq &filters[index][value]=value Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) - in: Value is in a comma-separated list Example queries: - All variants of a product listing: /product-listings/{product_listing_id}/variants - Filter by name: /variants?filters[0][field]=name &filters[0][operator]=contains &filters[0][value]=fee - Pagination: /variants?page_size=10&page=2 - Sorting: /variants?order_by=name&order_type=asc
     *
     * @tags product-variants
     * @name FindProductVariantsApiV1ProductListingsProductListingIdVariantsGet
     * @summary List product variants
     * @request GET:/api/v1/product-listings/{product_listing_id}/variants
     * @secure
     */
    findProductVariantsApiV1ProductListingsProductListingIdVariantsGet: (
      productListingId: string,
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResponseProductVariantResponse, void | HTTPValidationError>({
        path: `/api/v1/product-listings/${productListingId}/variants`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieves a product variant by its ID.
     *
     * @tags product-variants
     * @name FindProductVariantWithInventoryInfoApiV1ProductVariantsProductVariantIdGet
     * @summary Find a product variant by ID
     * @request GET:/api/v1/product-variants/{product_variant_id}
     * @secure
     */
    findProductVariantWithInventoryInfoApiV1ProductVariantsProductVariantIdGet: (
      productVariantId: string,
      params: RequestParams = {}
    ) =>
      this.request<ProductVariantWithInventoryResponse, void | HTTPValidationError>({
        path: `/api/v1/product-variants/${productVariantId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes an existing product variant by its ID. The product variant will be soft-deleted, making it unavailable for future operations while preserving its history in the system.
     *
     * @tags product-variants
     * @name DeleteProductVariantApiV1ProductVariantsProductVariantIdDelete
     * @summary Delete a product variant
     * @request DELETE:/api/v1/product-variants/{product_variant_id}
     * @secure
     */
    deleteProductVariantApiV1ProductVariantsProductVariantIdDelete: (
      productVariantId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, void | HTTPValidationError>({
        path: `/api/v1/product-variants/${productVariantId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Updates an existing product variant.
     *
     * @tags product-variants
     * @name UpdateProductVariantApiV1ProductVariantsProductVariantIdPatch
     * @summary Update a Product Variant
     * @request PATCH:/api/v1/product-variants/{product_variant_id}
     * @secure
     */
    updateProductVariantApiV1ProductVariantsProductVariantIdPatch: (
      productVariantId: string,
      data: UpdateProductVariantDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/product-variants/${productVariantId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieves an inventory item by its ID.
     *
     * @tags inventory-items
     * @name FindInventoryItemByIdApiV1InventoryItemsInventoryItemIdGet
     * @summary Find an inventory item by ID
     * @request GET:/api/v1/inventory-items/{inventory_item_id}
     * @secure
     */
    findInventoryItemByIdApiV1InventoryItemsInventoryItemIdGet: (inventoryItemId: string, params: RequestParams = {}) =>
      this.request<InventoryItemResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-items/${inventoryItemId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partially updates an inventory item. Currently supports updating: - reorder_threshold: The threshold at which reordering should be considered This operation is atomic - if any part of the update fails, the entire transaction is rolled back.
     *
     * @tags inventory-items
     * @name UpdateInventoryItemApiV1InventoryItemsItemIdPatch
     * @summary Update an inventory item
     * @request PATCH:/api/v1/inventory-items/{item_id}
     * @secure
     */
    updateInventoryItemApiV1InventoryItemsItemIdPatch: (
      itemId: string,
      data: UpdateInventoryItemDto,
      params: RequestParams = {}
    ) =>
      this.request<InventoryItemResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-items/${itemId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a manual adjustment to the on-hand quantity of an inventory item. This operation is atomic - both the inventory quantity update and the audit record creation happen in the same transaction. If either operation fails, the entire transaction is rolled back. The quantity_change can be positive (increase stock) or negative (decrease stock). Negative adjustments that would result in negative stock will be rejected.
     *
     * @tags inventory-items
     * @name CreateInventoryAdjustmentApiV1InventoryItemsItemIdAdjustmentsPost
     * @summary Create a manual inventory adjustment
     * @request POST:/api/v1/inventory-items/{item_id}/adjustments
     * @secure
     */
    createInventoryAdjustmentApiV1InventoryItemsItemIdAdjustmentsPost: (
      itemId: string,
      data: CreateInventoryAdjustmentDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/inventory-items/${itemId}/adjustments`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists inventory adjustments with optional filtering and sorting. Filter format: filters[index][field]=name &filters[index][operator]=eq &filters[index][value]=value Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) - in: Value is in a comma-separated list Example queries: - All adjustments of a inventory item: /inventory-items/{item_id}/adjustments - Filter by name: /adjustments?filters[0][field]=name &filters[0][operator]=contains &filters[0][value]=fee - Pagination: /adjustments?page_size=10&page=2 - Sorting: /adjustments?order_by=name&order_type=asc
     *
     * @tags inventory-items
     * @name FindInventoryAdjustmentsApiV1InventoryItemsItemIdAdjustmentsGet
     * @summary List inventory adjustments
     * @request GET:/api/v1/inventory-items/{item_id}/adjustments
     * @secure
     */
    findInventoryAdjustmentsApiV1InventoryItemsItemIdAdjustmentsGet: (itemId: string, params: RequestParams = {}) =>
      this.request<PaginatedResponseInventoryAdjustmentResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-items/${itemId}/adjustments`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a reservation for a specific quantity of an inventory item. This operation is atomic - both the inventory reserved quantity update and the reservation record creation happen in the same transaction. If either operation fails, the entire transaction is rolled back. The reservation will be created with a PENDING status and will expire after a default period if not confirmed or cancelled. Reservations cannot be created if there is insufficient available stock (on_hand_quantity - reserved_quantity).
     *
     * @tags inventory-items
     * @name CreateInventoryReservationApiV1InventoryItemsItemIdReservationsPost
     * @summary Create an inventory reservation
     * @request POST:/api/v1/inventory-items/{item_id}/reservations
     * @secure
     */
    createInventoryReservationApiV1InventoryItemsItemIdReservationsPost: (
      itemId: string,
      data: CreateInventoryReservationDto,
      params: RequestParams = {}
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/api/v1/inventory-items/${itemId}/reservations`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists inventory reservations with optional filtering and sorting. Filter format: filters[index][field]=name &filters[index][operator]=eq &filters[index][value]=value Available operators: - eq: Equal to - neq: Not equal to - gt: Greater than - lt: Less than - gte: Greater than or equal to - lte: Less than or equal to - contains: Contains substring (case-insensitive) - not_contains: Does not contain substring (case-insensitive) - in: Value is in a comma-separated list Example queries: - All reservations of a inventory item: /inventory-items/{item_id}/reservations - Filter by name: /reservations?filters[0][field]=name &filters[0][operator]=contains &filters[0][value]=fee - Pagination: /reservations?page_size=10&page=2 - Sorting: /reservations?order_by=name&order_type=asc
     *
     * @tags inventory-items
     * @name FindInventoryReservationsApiV1InventoryItemsItemIdReservationsGet
     * @summary List inventory reservations
     * @request GET:/api/v1/inventory-items/{item_id}/reservations
     * @secure
     */
    findInventoryReservationsApiV1InventoryItemsItemIdReservationsGet: (itemId: string, params: RequestParams = {}) =>
      this.request<PaginatedResponseInventoryReservationResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-items/${itemId}/reservations`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates multiple reservations for inventory items in a single atomic transaction. This operation is atomic - either all reservations are created successfully, or none are. If any reservation fails (e.g., due to insufficient stock), the entire transaction is rolled back. Each reservation will be created with a PENDING status and will expire after a default period if not confirmed or cancelled. Reservations cannot be created if there is insufficient available stock (on_hand_quantity - reserved_quantity).
     *
     * @tags inventory-reservations
     * @name CreateBulkInventoryReservationApiV1InventoryReservationsBulkPost
     * @summary Create multiple inventory reservations in a single atomic operation
     * @request POST:/api/v1/inventory-reservations/bulk
     * @secure
     */
    createBulkInventoryReservationApiV1InventoryReservationsBulkPost: (
      data: CreateBulkInventoryReservationDto,
      params: RequestParams = {}
    ) =>
      this.request<BulkReservationResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-reservations/bulk`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cancels a pending inventory reservation and releases the reserved stock. This operation is atomic - both the reservation status update and the inventory reserved quantity update happen in the same transaction. If either operation fails, the entire transaction is rolled back. Only reservations in PENDING status can be cancelled. Attempting to cancel a reservation that is already CONFIRMED, CANCELLED, or EXPIRED will result in an error.
     *
     * @tags inventory-reservations
     * @name CancelInventoryReservationApiV1InventoryReservationsReservationIdDelete
     * @summary Cancel an inventory reservation
     * @request DELETE:/api/v1/inventory-reservations/{reservation_id}
     * @secure
     */
    cancelInventoryReservationApiV1InventoryReservationsReservationIdDelete: (
      reservationId: string,
      query?: {
        /** Cancelled By Id */
        cancelled_by_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<void, void | HTTPValidationError>({
        path: `/api/v1/inventory-reservations/${reservationId}`,
        method: 'DELETE',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Confirms an inventory reservation, updates the inventory item stock, and creates an adjustment record.
     *
     * @tags inventory-reservations
     * @name ConfirmInventoryReservationApiV1InventoryReservationsReservationIdConfirmationPost
     * @summary Confirm an inventory reservation
     * @request POST:/api/v1/inventory-reservations/{reservation_id}/confirmation
     * @secure
     */
    confirmInventoryReservationApiV1InventoryReservationsReservationIdConfirmationPost: (
      reservationId: string,
      data: ReservationConfirmationDto,
      params: RequestParams = {}
    ) =>
      this.request<InventoryReservationResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-reservations/${reservationId}/confirmation`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cancels all inventory reservations associated with a specific order ID in a single atomic transaction. This operation is atomic - either all reservations are cancelled successfully, or none are. If any reservation cancellation fails (e.g., due to invalid status), the entire transaction is rolled back. Only reservations in PENDING status can be cancelled. Attempting to cancel a reservation that is already CONFIRMED, CANCELLED, or EXPIRED will result in an error.
     *
     * @tags inventory-reservations
     * @name BulkCancelInventoryReservationsApiV1InventoryReservationsBulkCancelPost
     * @summary Cancel multiple inventory reservations in a single atomic operation
     * @request POST:/api/v1/inventory-reservations/bulk-cancel
     * @secure
     */
    bulkCancelInventoryReservationsApiV1InventoryReservationsBulkCancelPost: (
      data: BulkCancelReservationsDto,
      params: RequestParams = {}
    ) =>
      this.request<BulkCancelReservationsResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-reservations/bulk-cancel`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Confirms all inventory reservations associated with a specific order ID in a single atomic transaction. This operation is atomic - either all reservations are confirmed successfully, or none are. If any reservation confirmation fails (e.g., due to invalid status), the entire transaction is rolled back. Only reservations in PENDING status can be confirmed. Attempting to confirm a reservation that is already CONFIRMED, CANCELLED, or EXPIRED will result in an error.
     *
     * @tags inventory-reservations
     * @name BulkConfirmInventoryReservationsApiV1InventoryReservationsBulkConfirmPost
     * @summary Confirm multiple inventory reservations in a single atomic operation
     * @request POST:/api/v1/inventory-reservations/bulk-confirm
     * @secure
     */
    bulkConfirmInventoryReservationsApiV1InventoryReservationsBulkConfirmPost: (
      data: BulkConfirmReservationsDto,
      params: RequestParams = {}
    ) =>
      this.request<BulkConfirmReservationsResponse, void | HTTPValidationError>({
        path: `/api/v1/inventory-reservations/bulk-confirm`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Uploads one or more files to a temporary location in S3. The files are stored with a unique prefix and are intended to be moved to a permanent location later, typically when an associated entity (e.g., ProductListing) is created or updated. Returns a list of temporary S3 keys and original filenames for the uploaded files.
     *
     * @tags Media Uploads
     * @name UploadTemporaryFilesApiV1MediaUploadTemporaryPost
     * @summary Upload files to a temporary S3 location
     * @request POST:/api/v1/media/upload-temporary
     * @secure
     */
    uploadTemporaryFilesApiV1MediaUploadTemporaryPost: (
      data: BodyUploadTemporaryFilesApiV1MediaUploadTemporaryPost,
      params: RequestParams = {}
    ) =>
      this.request<MediaUploadResponse, void | HTTPValidationError>({
        path: `/api/v1/media/upload-temporary`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),
  };
}
