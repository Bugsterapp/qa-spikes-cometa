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

/** AcademicConfigEntity */
export interface AcademicConfigEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** @default "level" */
  origin_type?: AcademicConfigOriginTypeEnum;
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  scoring?: ScoringConfig | null;
  attendance?: AttendanceConfig | null;
  sep?: SEPConfig | null;
}

/** AcademicConfigOriginTypeEnum */
export enum AcademicConfigOriginTypeEnum {
  Level = 'level',
  Grade = 'grade',
  Group = 'group',
  Classroom = 'classroom',
}

/** AcademicSchoolConfigEntity */
export interface AcademicSchoolConfigEntity {
  /**
   * Decimal Places
   * @default 1
   */
  decimal_places?: number | null;
  /** @default "round_half_up" */
  rounding_criteria?: RoundingCriteria | null;
  /**
   * Lock Evaluation Score Editing After Period Close
   * @default true
   */
  lock_evaluation_score_editing_after_period_close?: boolean;
  /**
   * Restrict Report Card For Debtors
   * @default true
   */
  restrict_report_card_for_debtors?: boolean;
}

/** Address */
export interface Address {
  /** Id */
  id?: string | null;
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

/** AddressCreate */
export interface AddressCreate {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
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

/** AddressUpdate */
export interface AddressUpdate {
  /** Id */
  id?: string | null;
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
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
}

/** AdmissionConceptLevelEntity */
export interface AdmissionConceptLevelEntity {
  /** Id */
  id: string;
  /** Level Ids */
  level_ids: string[];
}

/** AssignmentNotesDTO */
export interface AssignmentNotesDTO {
  /**
   * Classroom Student Assignment Id
   * @format uuid
   */
  classroom_student_assignment_id: string;
  /** Notes */
  notes: EvaluationNoteEntity[];
}

/** AssignmentScoresDTO */
export interface AssignmentScoresDTO {
  /**
   * Classroom Student Assignment Id
   * @format uuid
   */
  classroom_student_assignment_id: string;
  /** Scores */
  scores: EvaluationScoreEntity[];
  /** Average */
  average?: number | null;
}

/** AsyncCredentialGenerationResponseDTO */
export interface AsyncCredentialGenerationResponseDTO {
  /** Message */
  message: string;
  /** School Id */
  school_id: string;
  /** Template Id */
  template_id: string;
  /** Email */
  email: string;
}

/**
 * AttendanceAgentRequest
 * @example {"context_id":"123e4567-e89b-12d3-a456-426614174002","context_type":"group","date":"2024-01-15","evaluation_period_id":"123e4567-e89b-12d3-a456-426614174001","input":"Hoy faltaron Diego y Camila","school_id":"123e4567-e89b-12d3-a456-426614174000","taken_by_id":"123e4567-e89b-12d3-a456-426614174003"}
 */
export interface AttendanceAgentRequest {
  /**
   * Input
   * Texto del docente o audio base64
   */
  input: string;
  /**
   * School Id
   * School ID
   * @format uuid
   */
  school_id: string;
  /**
   * Evaluation Period Id
   * Evaluation period ID
   * @format uuid
   */
  evaluation_period_id: string;
  /**
   * Context Type
   * Type of attendance: 'group' for daily, 'classroom' for subject
   */
  context_type: 'group' | 'classroom';
  /**
   * Context Id
   * Group or classroom ID
   * @format uuid
   */
  context_id: string;
  /**
   * Date
   * Date for attendance
   * @format date
   */
  date: string;
  /**
   * Taken By Id
   * User ID taking attendance
   * @format uuid
   */
  taken_by_id: string;
  /**
   * Confirm
   * If True, save the records after preview
   * @default false
   */
  confirm?: boolean;
}

/**
 * AttendanceAgentResponse
 * @example {"message":"Encontré 2 ausentes: Diego López, Camila García","output":{"message":"Se identificaron 2 estudiantes ausentes","needs_clarification":false,"records":[{"confidence":0.95,"status":"absent","student_id":"123e4567-e89b-12d3-a456-426614174004","student_name":"Diego López"},{"confidence":0.92,"status":"absent","student_id":"123e4567-e89b-12d3-a456-426614174005","student_name":"Camila García"}],"success":true},"success":true,"transcription":"Hoy faltaron Diego y Camila"}
 */
export interface AttendanceAgentResponse {
  /**
   * Success
   * Whether the request was processed successfully
   */
  success: boolean;
  /**
   * Message
   * Human-readable message
   */
  message: string;
  /**
   * Transcription
   * Transcribed text (if audio was provided)
   */
  transcription?: string | null;
  /** Structured output with attendance preview */
  output?: AttendanceOutput | null;
}

/** AttendanceConfig */
export interface AttendanceConfig {
  context: AttendanceContextTypeEnum;
  granularity: AttendanceGranularityTypeEnum;
}

/** AttendanceContextTypeEnum */
export enum AttendanceContextTypeEnum {
  Group = 'group',
  Classroom = 'classroom',
}

/** AttendanceGranularityTypeEnum */
export enum AttendanceGranularityTypeEnum {
  Daily = 'daily',
  PerModule = 'per_module',
}

/**
 * AttendanceOutput
 * Structured output from the attendance agent.
 *
 * Returned to the frontend for display and confirmation.
 */
export interface AttendanceOutput {
  /**
   * Success
   * Whether the agent successfully processed the request
   */
  success: boolean;
  /**
   * Records
   * Preview of attendance records to be created
   */
  records?: AttendanceRecordPreview[];
  /**
   * Needs Clarification
   * True if the agent needs more information
   * @default false
   */
  needs_clarification?: boolean;
  /**
   * Clarification Question
   * Question to ask the teacher for clarification
   */
  clarification_question?: string | null;
  /**
   * Message
   * Human-readable message for the teacher
   */
  message: string;
  /**
   * Unmatched Names
   * Names mentioned that couldn't be matched to roster
   */
  unmatched_names?: string[];
}

/** AttendanceRecordCountResultDTO */
export interface AttendanceRecordCountResultDTO {
  /** Total */
  total: number;
  /** By Context */
  by_context?: Record<string, number> | null;
}

/** AttendanceRecordEntity */
export interface AttendanceRecordEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  status: AttendanceStatusEnum;
  /** Recorded By Id */
  recorded_by_id?: string | null;
  /** Notes */
  notes?: string | null;
  student?: MainStudentEntity | null;
  session?: AttendanceSessionEntity | null;
  /** Is Present */
  is_present: boolean;
}

/** AttendanceRecordIncludeEnum */
export enum AttendanceRecordIncludeEnum {
  Student = 'student',
  Session = 'session',
}

/** AttendanceRecordItemDTO */
export interface AttendanceRecordItemDTO {
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  status?: AttendanceStatusEnum | null;
  /** Notes */
  notes?: string | null;
}

/** AttendanceRecordPreview */
export interface AttendanceRecordPreview {
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /** Student Name */
  student_name: string;
  status: AttendanceStatusEnum;
  /**
   * Confidence
   * Confidence score from fuzzy matching (0.0 - 1.0)
   * @min 0
   * @max 1
   * @default 1
   */
  confidence?: number;
  /**
   * Matched
   * Whether the student was successfully matched from the roster
   * @default true
   */
  matched?: boolean;
  /**
   * Mentioned Name
   * Original name mentioned by teacher (if fuzzy matched)
   */
  mentioned_name?: string | null;
}

/** AttendanceSessionEntity */
export interface AttendanceSessionEntity {
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
  /**
   * Evaluation Period Id
   * @format uuid
   */
  evaluation_period_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  /**
   * Context Id
   * @format uuid
   */
  context_id: string;
  context_type: AttendanceContextTypeEnum;
  /**
   * Is Closed
   * @default false
   */
  is_closed?: boolean;
  /** Module Number */
  module_number?: number | null;
  /** Taken By Id */
  taken_by_id?: string | null;
  /** Notes */
  notes?: string | null;
  group?: SrcAcademicDomainEntitiesStructureGroupEntity | null;
  classroom?: ClassroomEntity | null;
  evaluation_period?: EvaluationPeriodEntity | null;
}

/** AttendanceSessionIncludeEnum */
export enum AttendanceSessionIncludeEnum {
  Group = 'group',
  Classroom = 'classroom',
  EvaluationPeriod = 'evaluation_period',
}

/** AttendanceStatusEnum */
export enum AttendanceStatusEnum {
  Present = 'present',
  Absent = 'absent',
  Late = 'late',
  Justified = 'justified',
}

/** AvailableStudentsForAttendanceDTO */
export interface AvailableStudentsForAttendanceDTO {
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /** Student */
  student?:
    | SrcInscriptionsDomainEntitiesStudentStudentEntity
    | SrcAcademicDomainEntitiesClassroomStudentAssignmentStudentEntity
    | null;
  /**
   * Has Record
   * @default false
   */
  has_record?: boolean;
  current_status?: AttendanceStatusEnum | null;
}

/** Body_create_file_api_v1_files__school_id__post */
export interface BodyCreateFileApiV1FilesSchoolIdPost {
  /**
   * Files In
   * Archivos a subir
   */
  files_in: File[];
  /**
   * Entity Id
   * ID de la entidad relacionada
   * @format uuid
   */
  entity_id: string;
  /**
   * Created By
   * ID del usuario que crea el archivo
   * @format uuid
   */
  created_by: string;
  /**
   * Name
   * Nombre del archivo
   */
  name?: string | null;
  /**
   * Description
   * Descripción del archivo
   */
  description?: string | null;
  /**
   * Type Id
   * ID del tipo de archivo
   */
  type_id?: string | null;
  /**
   * Tag
   * Tag del archivo
   */
  tag?: string | null;
}

/** Body_create_file_detail_api_v1_files_file_detail__file_id__post */
export interface BodyCreateFileDetailApiV1FilesFileDetailFileIdPost {
  /**
   * File In
   * Archivo a subir
   * @format binary
   */
  file_in: File;
  /**
   * Created By
   * ID del usuario que crea el archivo
   * @format uuid
   */
  created_by: string;
}

/** Body_create_template_api_v1_signatures_templates__post */
export interface BodyCreateTemplateApiV1SignaturesTemplatesPost {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  category: TemplateCategory;
  /** Name */
  name: string;
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /**
   * Pdf File
   * @format binary
   */
  pdf_file: File;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  /** Description */
  description?: string | null;
  /**
   * Requires Signature
   * @default true
   */
  requires_signature?: boolean;
  /** @default "simple" */
  signature_type?: SignatureType;
  /**
   * Expiration Days
   * @default 30
   */
  expiration_days?: number;
}

/** Body_process_enrollment_codes_api_v1_backoffice_inscriptions_process_enrollment_codes_csv_post */
export interface BodyProcessEnrollmentCodesApiV1BackofficeInscriptionsProcessEnrollmentCodesCsvPost {
  /**
   * Csv File
   * @format binary
   */
  csv_file: File;
}

/** Body_update_main_student_photo_api_v1_students__student_id__photo_put */
export interface BodyUpdateMainStudentPhotoApiV1StudentsStudentIdPhotoPut {
  /**
   * Photo In
   * Student photo
   * @format binary
   */
  photo_in: File;
}

/** BulkCreateAttendanceRecordDTO */
export interface BulkCreateAttendanceRecordDTO {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Records */
  records: AttendanceRecordItemDTO[];
  /** Recorded By Id */
  recorded_by_id?: string | null;
}

/** BulkCreateAttendanceSessionDTO */
export interface BulkCreateAttendanceSessionDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Evaluation Period Id
   * @format uuid
   */
  evaluation_period_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  /**
   * Context Id
   * @format uuid
   */
  context_id: string;
  context_type: AttendanceContextTypeEnum;
  /** Taken By Id */
  taken_by_id?: string | null;
  /** Notes */
  notes?: string | null;
  /**
   * Records
   * @default []
   */
  records?: AttendanceRecordItemDTO[];
  /** Recorded By Id */
  recorded_by_id?: string | null;
}

/** BulkCreateClassroomStudentAssignmentDTO */
export interface BulkCreateClassroomStudentAssignmentDTO {
  /**
   * Classroom Id
   * @format uuid
   */
  classroom_id: string;
  /** Student Ids */
  student_ids: string[];
}

/** BulkUpdateAttendanceRecordDTO */
export interface BulkUpdateAttendanceRecordDTO {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Records */
  records: BulkUpdateAttendanceRecordItemDTO[];
}

/** BulkUpdateAttendanceRecordItemDTO */
export interface BulkUpdateAttendanceRecordItemDTO {
  /**
   * Record Id
   * @format uuid
   */
  record_id: string;
  status?: AttendanceStatusEnum | null;
  /** Notes */
  notes?: string | null;
}

/** BulkUpdateRequestDTO */
export interface BulkUpdateRequestDTO {
  /**
   * Inscription Ids
   * @minItems 1
   */
  inscription_ids: string[];
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
}

/** CheckboxFieldMetaDTO */
export interface CheckboxFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "checkbox"
   */
  type?: 'checkbox';
  /** Values */
  values?: CheckboxValueDTO[] | null;
  /** Validationrule */
  validationRule?: string | null;
  /** Validationlength */
  validationLength?: number | null;
  /**
   * Direction
   * @default "vertical"
   */
  direction?: 'vertical' | 'horizontal';
}

/** CheckboxValueDTO */
export interface CheckboxValueDTO {
  /** Id */
  id: number;
  /** Checked */
  checked: boolean;
  /** Value */
  value: string;
}

/** ClassroomEntity */
export interface ClassroomEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /**
   * Course Id
   * @format uuid
   */
  course_id: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /** Evaluation Period Id */
  evaluation_period_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
  /**
   * Variant
   * @default ""
   */
  variant?: string;
  /** Student Assignment Count */
  student_assignment_count?: number | null;
  level?: SrcAcademicDomainEntitiesStructureLevelEntity | null;
  grade?: SrcAcademicDomainEntitiesStructureGradeEntity | null;
  course?: CourseEntity | null;
  group?: SrcAcademicDomainEntitiesStructureGroupEntity | null;
  school_cycle?: CycleEntity | null;
}

/** ClassroomFilterValueDTO */
export interface ClassroomFilterValueDTO {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Name
   * @default ""
   */
  name?: string;
  /**
   * Description
   * @default ""
   */
  description?: string;
}

/** ClassroomIncludeEnum */
export enum ClassroomIncludeEnum {
  Course = 'course',
  Teachers = 'teachers',
  StudentAssignmentCount = 'student_assignment_count',
  Level = 'level',
  Grade = 'grade',
  Group = 'group',
  SchoolCycle = 'school_cycle',
}

/** ClassroomListFilterValuesDTO */
export interface ClassroomListFilterValuesDTO {
  /**
   * Levels
   * @default []
   */
  levels?: ClassroomFilterValueDTO[];
  /**
   * Grades
   * @default []
   */
  grades?: ClassroomFilterValueDTO[];
  /**
   * Groups
   * @default []
   */
  groups?: ClassroomFilterValueDTO[];
  /**
   * Courses
   * @default []
   */
  courses?: ClassroomFilterValueDTO[];
}

/** ClassroomStudentAssignmentEntity */
export interface ClassroomStudentAssignmentEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Classroom Id
   * @format uuid
   */
  classroom_id: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  student?: SrcAcademicDomainEntitiesClassroomStudentAssignmentStudentEntity | null;
}

/** ClassroomStudentAssignmentIncludeEnum */
export enum ClassroomStudentAssignmentIncludeEnum {
  Student = 'student',
}

/** ClassroomTeacherAssignmentEntity */
export interface ClassroomTeacherAssignmentEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Classroom Id
   * @format uuid
   */
  classroom_id: string;
  /**
   * Membership Id
   * @format uuid
   */
  membership_id: string;
}

/**
 * ColorScheme
 * Color scheme configuration for the credential
 */
export interface ColorScheme {
  /** Background color configuration with primary and secondary colors */
  background: ColorSchemeBackground;
  /**
   * Text Color
   * Text color in hex format
   * @pattern ^#[0-9A-Fa-f]{6}$
   */
  text_color: string;
}

/**
 * ColorSchemeBackground
 * Background color configuration with primary and secondary colors
 */
export interface ColorSchemeBackground {
  /**
   * Primary
   * Primary background color in hex format
   * @pattern ^#[0-9A-Fa-f]{6}$
   */
  primary: string;
  /**
   * Secondary
   * Secondary background color in hex format
   * @pattern ^#[0-9A-Fa-f]{6}$
   */
  secondary: string;
}

/** ColumnsConfig */
export interface ColumnsConfig {
  /** Column Id */
  column_id: string;
  /** Column Name */
  column_name: string;
  /** Is Visible */
  is_visible: boolean;
  /** Order */
  order: number;
}

/** CountResultDTO */
export interface CountResultDTO {
  /** Count */
  count: number;
}

/** Country */
export interface Country {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
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

/** CountryCreate */
export interface CountryCreate {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string | null;
  /** Code */
  code?: string | null;
  /** Calling Code */
  calling_code?: string | null;
}

/** CourseEntity */
export interface CourseEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /**
   * Course Group Id
   * @format uuid
   */
  course_group_id: string;
  course_group?: CourseGroupEntity | null;
  sep_category?: CourseSEPCategoryEnum | null;
}

/** CourseGroupEntity */
export interface CourseGroupEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  sep_category?: CourseGroupSEPCategoryEnum | null;
}

/** CourseGroupSEPCategoryEnum */
export enum CourseGroupSEPCategoryEnum {
  Languages = 'languages',
  KnowledgeAndScientificThinking = 'knowledge_and_scientific_thinking',
  EthicsNatureAndSocieties = 'ethics_nature_and_societies',
  HumanAndCommunity = 'human_and_community',
}

/** CourseSEPCategoryEnum */
export enum CourseSEPCategoryEnum {
  Spanish = 'spanish',
  IndigenousLanguageAsMotherTongue = 'indigenous_language_as_mother_tongue',
  IndigenousLanguageAsSecondLanguage = 'indigenous_language_as_second_language',
  English = 'english',
  Arts = 'arts',
  Mathematics = 'mathematics',
  Biology = 'biology',
  Physics = 'physics',
  Chemistry = 'chemistry',
  CivicAndEthicalFormation = 'civic_and_ethical_formation',
  History = 'history',
  Geography = 'geography',
  PhysicalEducation = 'physical_education',
  Technology = 'technology',
  SocioemotionalEducation = 'socioemotional_education',
}

/** CreateAttendanceRecordDTO */
export interface CreateAttendanceRecordDTO {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  status?: AttendanceStatusEnum | null;
  /** Recorded By Id */
  recorded_by_id?: string | null;
  /** Notes */
  notes?: string | null;
}

/** CreateAttendanceSessionDTO */
export interface CreateAttendanceSessionDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Evaluation Period Id
   * @format uuid
   */
  evaluation_period_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  /**
   * Context Id
   * @format uuid
   */
  context_id: string;
  context_type: AttendanceContextTypeEnum;
  /** Taken By Id */
  taken_by_id?: string | null;
  /** Notes */
  notes?: string | null;
}

/** CreateClassroomDTO */
export interface CreateClassroomDTO {
  /**
   * Course Id
   * @format uuid
   */
  course_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /** Group Id */
  group_id?: string | null;
  /** Level Id */
  level_id?: string | null;
  /**
   * Variant
   * @default ""
   */
  variant?: string;
}

/** CreateClassroomStudentAssignmentDTO */
export interface CreateClassroomStudentAssignmentDTO {
  /**
   * Classroom Id
   * @format uuid
   */
  classroom_id: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
}

/** CreateClassroomTeacherAssignmentDTO */
export interface CreateClassroomTeacherAssignmentDTO {
  /**
   * Classroom Id
   * @format uuid
   */
  classroom_id: string;
  /**
   * Membership Id
   * @format uuid
   */
  membership_id: string;
}

/** CreateCourseDTO */
export interface CreateCourseDTO {
  /** Name */
  name: string;
  /**
   * Course Group Id
   * @format uuid
   */
  course_group_id: string;
}

/** CreateCourseGroupDTO */
export interface CreateCourseGroupDTO {
  /** Name */
  name: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
}

/** CreateCredentialTemplateDTO */
export interface CreateCredentialTemplateDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Name */
  name: string;
  type: CredentialTemplateType;
  /** Config */
  config:
    | ({
        type: 'guardian';
      } & GuardianCredentialConfigSchemaInput)
    | ({
        type: 'student';
      } & StudentCredentialConfigSchemaInput)
    | ({
        type: 'teacher';
      } & TeacherCredentialConfigSchemaInput);
}

/** CreateDocumentInstanceDTO */
export interface CreateDocumentInstanceDTO {
  /**
   * Template Id
   * @format uuid
   */
  template_id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Signer Id
   * @format uuid
   */
  signer_id: string;
  /**
   * Signer Email
   * @format email
   */
  signer_email: string;
  /** Signer Name */
  signer_name: string;
  /** External Id */
  external_id?: string | null;
  /** Module */
  module?: string | null;
  /** Metadata */
  metadata?: Record<string, any>;
  /** Expires In Days */
  expires_in_days?: number | null;
  /**
   * Send Immediately
   * @default false
   */
  send_immediately?: boolean;
  /** Notification Message */
  notification_message?: string | null;
}

/** CreateEvaluationPeriodDTO */
export interface CreateEvaluationPeriodDTO {
  /** Name */
  name: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
}

/** CreateGradeAndGroupsDTO */
export interface CreateGradeAndGroupsDTO {
  grade: CreateGradeDTO;
  /** Groups */
  groups?: CreateGroupDTO[] | null;
}

/** CreateGradeDTO */
export interface CreateGradeDTO {
  /** Name */
  name: string;
  /** Is Last */
  is_last: boolean;
  /** Next Id */
  next_id?: string | null;
  /** Id */
  id?: string | null;
}

/** CreateGroupDTO */
export interface CreateGroupDTO {
  /** Name */
  name: string;
  /** Is Last */
  is_last?: boolean | null;
  /** Next Id */
  next_id?: string | null;
}

/** CreateInscriptionDTO */
export interface CreateInscriptionDTO {
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /**
   * Section Id
   * @format uuid
   */
  section_id: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
}

/** CreateInscriptionRequest */
export interface CreateInscriptionRequest {
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  status?: InscriptionStatusEnum | null;
  /**
   * Section Id
   * @format uuid
   */
  section_id: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
  /** Group Id */
  group_id?: string | null;
}

/** CreateLevelDTO */
export interface CreateLevelDTO {
  /** Name */
  name: string;
  type: LevelType;
  /** Order */
  order?: number | null;
}

/** CreateOrganizationDTO */
export interface CreateOrganizationDTO {
  /** Name */
  name: string;
}

/** CreateReinscriptionConfigDTO */
export interface CreateReinscriptionConfigDTO {
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/** CreateReinscriptionStepConceptDTO */
export interface CreateReinscriptionStepConceptDTO {
  /**
   * Reinscription Step Id
   * @format uuid
   */
  reinscription_step_id: string;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Concept Ids */
  concept_ids: string[];
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/** CreateReinscriptionStepDTO */
export interface CreateReinscriptionStepDTO {
  /**
   * Reinscription Config Id
   * @format uuid
   */
  reinscription_config_id: string;
  /** Title */
  title: string;
  type: ReinscriptionStepTypeEnum;
  /** Description */
  description?: string | null;
  /** Config */
  config?: Record<string, any> | null;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /** Order */
  order: number;
}

/** CreateSchoolCycleRequest */
export interface CreateSchoolCycleRequest {
  /** Name */
  name: string;
  /** School Id */
  school_id?: string | null;
  /** Year Start */
  year_start?: number | null;
  /** Year End */
  year_end?: number | null;
  /** Month Start */
  month_start?: number | null;
  /** Month End */
  month_end?: number | null;
  /** Day Start */
  day_start?: number | null;
  /** Day End */
  day_end?: number | null;
  /** Next Id */
  next_id?: string | null;
  /**
   * Is Active
   * @default false
   */
  is_active?: boolean;
}

/** CreateSchoolRequestDTO */
export interface CreateSchoolRequestDTO {
  /** Name */
  name: string;
  /** Phone */
  phone: string;
  /** Email */
  email: string;
  /** Institutional Id */
  institutional_id: string;
  /** Organization Id */
  organization_id?: string | null;
  organization?: CreateOrganizationDTO | null;
}

/** CreateScoreCardSubmissionDTO */
export interface CreateScoreCardSubmissionDTO {
  /**
   * Evaluation Period Id
   * @format uuid
   */
  evaluation_period_id: string;
  /**
   * Requested By Id
   * @format uuid
   */
  requested_by_id: string;
  /**
   * Filters Json
   * @default {}
   */
  filters_json?: Record<string, any> | null;
}

/** CreateStudentAndGuardianDTO */
export interface CreateStudentAndGuardianDTO {
  student: StudentCreateDTO;
  guardian: GuardianCreateDTO;
  /** Relationship */
  relationship?: string | null;
  /** Has Student Custody */
  has_student_custody?: boolean | null;
}

/** CreateStudentAndGuardianResultDTO */
export interface CreateStudentAndGuardianResultDTO {
  student: MainStudentEntity;
  guardian: GuardianEntity;
  /** Guardian Created */
  guardian_created: boolean;
  link: StudentGuardianLinkEntity;
}

/** CreateTeacherProfileDTO */
export interface CreateTeacherProfileDTO {
  /**
   * Membership Id
   * @format uuid
   */
  membership_id: string;
  /**
   * Role
   * @default ""
   */
  role?: string;
}

/** CredentialTemplateEntity */
export interface CredentialTemplateEntity {
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
  /** Name */
  name: string;
  type: CredentialTemplateType;
  /** Config */
  config:
    | ({
        type: 'guardian';
      } & GuardianCredentialConfigSchemaOutput)
    | ({
        type: 'student';
      } & StudentCredentialConfigSchemaOutput)
    | ({
        type: 'teacher';
      } & TeacherCredentialConfigSchemaOutput);
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
}

/** CredentialTemplateType */
export enum CredentialTemplateType {
  Student = 'student',
  Guardian = 'guardian',
  Teacher = 'teacher',
}

/** CycleEntity */
export interface CycleEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** DateFieldMetaDTO */
export interface DateFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "date"
   */
  type?: 'date';
  /** Textalign */
  textAlign?: 'left' | 'center' | 'right' | null;
}

/** DocumentInstanceEntity */
export interface DocumentInstanceEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Template Id
   * @format uuid
   */
  template_id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Signer Id
   * @format uuid
   */
  signer_id: string;
  /** External Id */
  external_id?: string | null;
  /** Module */
  module?: string | null;
  /** Provider Document Id */
  provider_document_id?: string | null;
  /** Signing Token */
  signing_token?: string | null;
  /** Signing Url */
  signing_url?: string | null;
  status: DocumentInstanceStatus;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Modified At
   * @format date-time
   */
  modified_at: string;
  /** Sent At */
  sent_at?: string | null;
  /** Opened At */
  opened_at?: string | null;
  /** Signed At */
  signed_at?: string | null;
  /** Expires At */
  expires_at?: string | null;
  /** Deleted At */
  deleted_at?: string | null;
  /**
   * Document Metadata
   * @default {}
   */
  document_metadata?: Record<string, any>;
  /** Signature Records */
  signature_records?: SignatureRecordEntity[] | null;
  /**
   * Is Signed
   * Check if document has been signed
   */
  is_signed: boolean;
  /**
   * Is Expired
   * Check if document has expired
   */
  is_expired: boolean;
}

/** DocumentInstanceStatus */
export enum DocumentInstanceStatus {
  Pending = 'pending',
  Signed = 'signed',
}

/** DocumentTemplateEntity */
export interface DocumentTemplateEntity {
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
  /** School Cycle Id */
  school_cycle_id?: string | null;
  category: TemplateCategory;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Provider Template Id */
  provider_template_id?: string | null;
  /** Pdf Template Path */
  pdf_template_path?: string | null;
  /** Field Mappings */
  field_mappings?: Record<string, any>;
  /**
   * Requires Signature
   * @default true
   */
  requires_signature?: boolean;
  /** @default "simple" */
  signature_type?: SignatureType;
  /**
   * Expiration Days
   * @default 30
   */
  expiration_days?: number;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Deleted */
  deleted?: string | null;
}

/** DropdownFieldMetaDTO */
export interface DropdownFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "dropdown"
   */
  type?: 'dropdown';
  /** Values */
  values?: DropdownValueDTO[] | null;
  /** Defaultvalue */
  defaultValue?: string | null;
}

/** DropdownValueDTO */
export interface DropdownValueDTO {
  /** Value */
  value: string;
}

/** EmailFieldMetaDTO */
export interface EmailFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "email"
   */
  type?: 'email';
  /** Textalign */
  textAlign?: 'left' | 'center' | 'right' | null;
}

/** EnrollmentCodeResultDTO */
export interface EnrollmentCodeResultDTO {
  /** Enrollment Code */
  enrollment_code: string;
}

/** EnrollmentContextInputDTO */
export interface EnrollmentContextInputDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  student: StudentEntityContextDTO;
}

/** EnrollmentContextMetadataDTO */
export interface EnrollmentContextMetadataDTO {
  /** Schema */
  schema?: Record<string, any>;
  /** Functions */
  functions: TemplateFunctionMetadataDTO[];
}

/** EnrollmentStudentDTO */
export interface EnrollmentStudentDTO {
  student: StudentUpdateDTO;
  inscription: CreateInscriptionDTO;
}

/** EnrollmentStudentResultDTO */
export interface EnrollmentStudentResultDTO {
  student: MainStudentEntity;
  inscription: SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity;
}

/** EvaluationNoteEntity */
export interface EvaluationNoteEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Note */
  note: string;
  /** @default "period" */
  origin_type?: EvaluationNoteOriginTypeEnum;
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /**
   * Classroom Student Assignment Id
   * @format uuid
   */
  classroom_student_assignment_id: string;
}

/** EvaluationNoteOriginTypeEnum */
export enum EvaluationNoteOriginTypeEnum {
  Period = 'period',
}

/** EvaluationNoteSystem */
export enum EvaluationNoteSystem {
  ShortText = 'short_text',
  LongText = 'long_text',
}

/** EvaluationNotesByAssignmentCriteriaEnum */
export enum EvaluationNotesByAssignmentCriteriaEnum {
  Student = 'student',
  Classroom = 'classroom',
}

/** EvaluationPeriodEntity */
export interface EvaluationPeriodEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  status: EvaluationPeriodStatusEnum;
}

/** EvaluationPeriodStatusEnum */
export enum EvaluationPeriodStatusEnum {
  Completed = 'completed',
  InProgress = 'in_progress',
  NotStarted = 'not_started',
  Undefined = 'undefined',
}

/** EvaluationScoreEntity */
export interface EvaluationScoreEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Score */
  score: number;
  /** @default "period" */
  origin_type?: EvaluationScoreOriginTypeEnum;
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /**
   * Classroom Student Assignment Id
   * @format uuid
   */
  classroom_student_assignment_id: string;
}

/** EvaluationScoreOriginTypeEnum */
export enum EvaluationScoreOriginTypeEnum {
  Period = 'period',
}

/** EvaluationScoreSystem */
export enum EvaluationScoreSystem {
  Numeric = 'numeric',
}

/** EvaluationScoresByAssignmentCriteriaEnum */
export enum EvaluationScoresByAssignmentCriteriaEnum {
  Student = 'student',
  Classroom = 'classroom',
}

/** EvaluationScoresStatsByOriginCriteriaEnum */
export enum EvaluationScoresStatsByOriginCriteriaEnum {
  Classroom = 'classroom',
  LevelAndSchoolCycle = 'level_and_school_cycle',
}

/**
 * FieldConfig
 * Configuration for a single field display
 */
export interface FieldConfig {
  /**
   * Show
   * Whether to show this field
   */
  show: boolean;
  /**
   * Color
   * Field color in hex format
   * @pattern ^#[0-9A-Fa-f]{6}$
   */
  color: string;
  /**
   * Editable
   * Whether this field is editable
   * @default true
   */
  editable?: boolean | null;
  /**
   * Value
   * Optional predefined value for the field
   */
  value?: string | null;
}

/** FileDetailEntity */
export interface FileDetailEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** File Id */
  file_id?: string | null;
  /** Path */
  path?: string | null;
  /** Size */
  size?: number | null;
  /** Created By */
  created_by?: string | null;
  /** Download Url */
  download_url?: string | null;
  /** Inline Url */
  inline_url?: string | null;
}

/** FileEntity */
export interface FileEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** School Id */
  school_id?: string | null;
  /** Entity Id */
  entity_id?: string | null;
  /** Type Id */
  type_id?: string | null;
  /** Tag */
  tag?: string | null;
  /** Created By */
  created_by?: string | null;
  /** File Details */
  file_details?: FileDetailEntity[] | null;
  /** Download Url */
  download_url?: string | null;
  /** Inline Url */
  inline_url?: string | null;
}

/**
 * FileField
 * File field configuration (e.g., signature, seal)
 */
export interface FileField {
  /**
   * Show
   * Whether to show this field
   */
  show: boolean;
  /**
   * File Id
   * File ID reference (not validated)
   */
  file_id?: string | null;
}

/** FilterValueDTO */
export interface FilterValueDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
}

/**
 * FreeTextField
 * Free text field configuration
 */
export interface FreeTextField {
  /**
   * Show
   * Whether to show this field
   */
  show: boolean;
  /**
   * Color
   * Text color in hex format
   * @pattern ^#[0-9A-Fa-f]{6}$
   */
  color: string;
  /**
   * Value
   * Text value to display
   */
  value: string;
}

/** GenerateFilteredCredentialsDTO */
export interface GenerateFilteredCredentialsDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Level Ids */
  level_ids?: string[] | null;
  /** Section Ids */
  section_ids?: string[] | null;
  /** Student Ids */
  student_ids?: string[] | null;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  /** Status */
  status?: InscriptionStatusEnum[] | null;
}

/** GradeGroupEntity */
export interface GradeGroupEntity {
  grade?: SrcSchoolsApiDomainEntitiesGradeEntity | null;
  /** Groups */
  groups?: SrcSchoolsApiDomainEntitiesGroupEntity[] | null;
}

/** GradeIncludeDTO */
export enum GradeIncludeDTO {
  Groups = 'groups',
  Level = 'level',
}

/**
 * GuardianBackFields
 * Fields displayed on the back of a guardian credential
 */
export interface GuardianBackFields {
  /** Free text field configuration */
  free_text: FreeTextField;
  /** File field configuration (e.g., signature, seal) */
  signature: FileField;
  /** File field configuration (e.g., signature, seal) */
  digital_seal: FileField;
}

/** GuardianCreateDTO */
export interface GuardianCreateDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Phone */
  phone: string;
  /** Tax Id */
  tax_id?: string | null;
  preferred_medium?: GuardianPreferredMedium | null;
  onboarding_stage?: GuardianOnboardingStage | null;
  /** Send Emails */
  send_emails?: boolean | null;
  /** Send Whatsapps */
  send_whatsapps?: boolean | null;
  /** Accept Terms */
  accept_terms?: boolean | null;
  /** Deleted */
  deleted?: string | null;
  /** Occupation */
  occupation?: string | null;
  /** Workplace */
  workplace?: string | null;
  /** Workphone */
  workphone?: string | null;
  /** Gender */
  gender?: string | null;
}

/**
 * GuardianCredentialConfigSchema
 * Complete configuration schema for guardian credentials
 */
export interface GuardianCredentialConfigSchemaInput {
  /**
   * Type
   * Credential type discriminator
   * @default "guardian"
   */
  type?: 'guardian';
  /**
   * Orientation
   * Credential orientation
   */
  orientation: 'portrait' | 'landscape';
  /** Color scheme configuration for the credential */
  color_scheme: ColorScheme;
  /** Fields displayed on the front of a guardian credential */
  front_fields: GuardianFrontFields;
  /** Fields displayed on the back of a guardian credential */
  back_fields: GuardianBackFields;
}

/**
 * GuardianCredentialConfigSchema
 * Complete configuration schema for guardian credentials
 */
export interface GuardianCredentialConfigSchemaOutput {
  /**
   * Type
   * Credential type discriminator
   * @default "guardian"
   */
  type?: 'guardian';
  /**
   * Orientation
   * Credential orientation
   */
  orientation: 'portrait' | 'landscape';
  /** Color scheme configuration for the credential */
  color_scheme: ColorScheme;
  /** Fields displayed on the front of a guardian credential */
  front_fields: GuardianFrontFields;
  /** Fields displayed on the back of a guardian credential */
  back_fields: GuardianBackFields;
}

/** GuardianEntity */
export interface GuardianEntity {
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
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Phone */
  phone: string;
  /**
   * Tax Id
   * @default ""
   */
  tax_id?: string;
  /** @default "EMAIL" */
  preferred_medium?: GuardianPreferredMedium;
  /** @default "PROFILE" */
  onboarding_stage?: GuardianOnboardingStage;
  /**
   * Send Emails
   * @default true
   */
  send_emails?: boolean;
  /**
   * Send Whatsapps
   * @default true
   */
  send_whatsapps?: boolean;
  /** External Id */
  external_id?: string | null;
  /** Billing Name */
  billing_name?: string | null;
  /** Taxing Type */
  taxing_type?: string | null;
  /** Taxing System */
  taxing_system?: string | null;
  /** Created By Id */
  created_by_id?: string | null;
  /** Deleted */
  deleted?: string | null;
  /** Occupation */
  occupation?: string | null;
  /** Workplace */
  workplace?: string | null;
  /** Workphone */
  workphone?: string | null;
  /** Gender */
  gender?: string | null;
  /** Hash */
  hash?: string | null;
  /** Token Version */
  token_version?: number | null;
}

/**
 * GuardianFrontFields
 * Fields displayed on the front of a guardian credential
 */
export interface GuardianFrontFields {
  /**
   * Configuration for a single field display
   * @default {"show":true,"color":"#FFFFFF","editable":false}
   */
  name?: FieldConfig;
  /**
   * Configuration for a single field display
   * @default {"show":true,"color":"#FFFFFF","editable":false}
   */
  last_name?: FieldConfig;
}

/** GuardianOnboardingStage */
export enum GuardianOnboardingStage {
  PROFILE = 'PROFILE',
  BILLING = 'BILLING',
  CFDI = 'CFDI',
  STUDENTS = 'STUDENTS',
  COMPLETED = 'COMPLETED',
}

/** GuardianPreferredMedium */
export enum GuardianPreferredMedium {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

/** GuardianUpdateDTO */
export interface GuardianUpdateDTO {
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Tax Id */
  tax_id?: string | null;
  preferred_medium?: GuardianPreferredMedium | null;
  onboarding_stage?: GuardianOnboardingStage | null;
  /** Send Emails */
  send_emails?: boolean | null;
  /** Send Whatsapps */
  send_whatsapps?: boolean | null;
  /** Accept Terms */
  accept_terms?: boolean | null;
  /** Deleted */
  deleted?: string | null;
  /** Occupation */
  occupation?: string | null;
  /** Workplace */
  workplace?: string | null;
  /** Workphone */
  workphone?: string | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** InitialsFieldMetaDTO */
export interface InitialsFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "initials"
   */
  type?: 'initials';
  /** Textalign */
  textAlign?: 'left' | 'center' | 'right' | null;
}

/** InscriptionConfigEntity */
export interface InscriptionConfigEntity {
  /** Dates */
  dates?: InscriptionDateEntity[] | null;
  steps?: InscriptionStepsEntity | null;
}

/** InscriptionDateEntity */
export interface InscriptionDateEntity {
  /** School Cycle Id */
  school_cycle_id: string;
  /**
   * Start
   * @format date
   */
  start: string;
  /**
   * End
   * @format date
   */
  end: string;
  /** Is Active */
  is_active: boolean;
  /** Id */
  id?: string | null;
}

/** InscriptionEnrollmentResponseDTO */
export interface InscriptionEnrollmentResponseDTO {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Student Enrollment Code */
  student_enrollment_code: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /** Student Name */
  student_name: string;
  /** Student Last Name */
  student_last_name: string;
  /** Level */
  level?: string | null;
  /** Grade */
  grade?: string | null;
  /** Group */
  group?: string | null;
}

/** InscriptionFiltersResponseDTO */
export interface InscriptionFiltersResponseDTO {
  /** Sections */
  sections: FilterValueDTO[];
  /** Inscription Status */
  inscription_status: FilterValueDTO[];
  /** Student State */
  student_state: FilterValueDTO[];
  /** Is Assigned */
  is_assigned: FilterValueDTO[];
  /** Payment Status */
  payment_status: FilterValueDTO[];
  /** Is Data Completed */
  is_data_completed: FilterValueDTO[];
  /** Are Consentments Completed */
  are_consentments_completed: FilterValueDTO[];
}

/** InscriptionGradeSummaryDTO */
export interface InscriptionGradeSummaryDTO {
  /** Grade */
  grade: string;
  /** Reinscriptions */
  reinscriptions: number;
  /** Pending Reinscriptions */
  pending_reinscriptions: number;
  /** New Incomes */
  new_incomes: number;
  /** Pending Incomes */
  pending_incomes: number;
  /** Total Quotas */
  total_quotas?: number | null;
  /** Free Quotas */
  free_quotas?: number | null;
  /** Leads */
  leads?: number | null;
}

/** InscriptionIncludeEnum */
export enum InscriptionIncludeEnum {
  Student = 'student',
  SchoolCycle = 'school_cycle',
  Section = 'section',
  Level = 'level',
  Grade = 'grade',
  Group = 'group',
}

/** InscriptionListResponseDTO */
export interface InscriptionListResponseDTO {
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  status: InscriptionStatusEnum;
  /** Section Name */
  section_name?: string | null;
  section?: SrcInscriptionsDomainEntitiesSectionSectionEntity | null;
}

/** InscriptionResponseDTO */
export interface InscriptionResponseDTO {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /** Section Id */
  section_id?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
  /** Status */
  status?: string | null;
}

/** InscriptionStatus */
export enum InscriptionStatus {
  Inscrito = 'Inscrito',
  Reinscrito = 'Reinscrito',
  NoInscrito = 'No inscrito',
  Pendiente = 'Pendiente',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

/** InscriptionStatusEnum */
export enum InscriptionStatusEnum {
  Inscrito = 'Inscrito',
  Reinscrito = 'Reinscrito',
  Pendiente = 'Pendiente',
  NoInscrito = 'No inscrito',
}

/** InscriptionStepsEntity */
export interface InscriptionStepsEntity {
  /** Enable Personal Step */
  enable_personal_step: boolean;
  /** Enable Medical Step */
  enable_medical_step: boolean;
  /** Enable Consentments Step */
  enable_consentments_step: boolean;
  /**
   * Enable Documents Step
   * @default false
   */
  enable_documents_step?: boolean;
}

/** InscriptionSummaryResponseDTO */
export interface InscriptionSummaryResponseDTO {
  /** Total Current Reinscripted */
  total_current_reinscripted: number;
  /** Total Should Be Reinscripted */
  total_should_be_reinscripted: number;
  /** Total New Inscriptions */
  total_new_inscriptions: number;
  /** Total Pending Inscriptions */
  total_pending_inscriptions: number;
  /** Total */
  total: number;
}

/** InscriptionUpdateDTO */
export interface InscriptionUpdateDTO {
  /** Personal Step Completed At */
  personal_step_completed_at?: string | null;
  /** Medical Step Completed At */
  medical_step_completed_at?: string | null;
  /** Consentments Step Completed At */
  consentments_step_completed_at?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
}

/** LevelIncludeDTO */
export enum LevelIncludeDTO {
  Grades = 'grades',
  Groups = 'groups',
}

/** LevelType */
export enum LevelType {
  PRE_SCHOOL = 'PRE_SCHOOL',
  ELEMENTARY = 'ELEMENTARY',
  MIDDLE = 'MIDDLE',
  MIDDLEHIGH = 'MIDDLE-HIGH',
  HIGH = 'HIGH',
}

/** MainStudentEntity */
export interface MainStudentEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Photo */
  photo?: string | null;
  /** Identifier */
  identifier?: string | null;
  /** Birthdate */
  birthdate?: string | null;
  /** Gender */
  gender?: string | null;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  section?: SrcStudentsEntitiesSectionEntity | null;
  /** @default "new_student" */
  state?: StudentState;
  /** Enrollment Code */
  enrollment_code?: string | null;
  /**
   * Inscriptions
   * @default []
   */
  inscriptions?: SrcStudentsEntitiesInscriptionEntity[] | null;
  /** Entry Date */
  entry_date?: string | null;
  /** Created By Id */
  created_by_id?: string | null;
  /** Billing Guardian Id */
  billing_guardian_id?: string | null;
  /** Credential Expiration Date */
  credential_expiration_date?: string | null;
  /** Deleted */
  deleted?: string | null;
}

/** MedicalInfoCreate */
export interface MedicalInfoCreate {
  /** Personal History */
  personal_history?: string | null;
  /** Family History */
  family_history?: string | null;
  /** Food Allergies */
  food_allergies?: string | null;
  /** Drug Allergies */
  drug_allergies?: string | null;
  /** Plant Allergies */
  plant_allergies?: string | null;
  /** Other Allergies */
  other_allergies?: string | null;
  /** Blood Type Code */
  blood_type_code?: string | null;
  /** Weight */
  weight?: number | null;
  /** Height */
  height?: number | null;
  /** Laterality */
  laterality?: string | null;
  /** Current Ailments */
  current_ailments?: string | null;
  /** Recent Interventions */
  recent_interventions?: string | null;
  /** Other History */
  other_history?: string | null;
  /** Has Allergies */
  has_allergies?: boolean | null;
  /** Require Drugs */
  require_drugs?: boolean | null;
  /** Drugs */
  drugs?: string | null;
  /** Authorize Emergency Transfer */
  authorize_emergency_transfer?: boolean | null;
  /** Authorize Physical Activity */
  authorize_physical_activity?: boolean | null;
  /** Emergency Contact Id */
  emergency_contact_id?: string | null;
  /** Emergency Contact Name */
  emergency_contact_name?: string | null;
  /** Emergency Contact Phone */
  emergency_contact_phone?: string | null;
  /** Emergency Contact Relationship */
  emergency_contact_relationship?: string | null;
  /** Has Private Doctor */
  has_private_doctor?: boolean | null;
  /** Doctor Name */
  doctor_name?: string | null;
  /** Doctor Phone */
  doctor_phone?: string | null;
  /** Doctor Clinic */
  doctor_clinic?: string | null;
  /** Has Private Insurance */
  has_private_insurance?: boolean | null;
  /** Pending Vaccines */
  pending_vaccines?: string | null;
  /** Comments */
  comments?: string | null;
}

/** MedicalInfoEntity */
export interface MedicalInfoEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Personal History */
  personal_history?: string | null;
  /** Family History */
  family_history?: string | null;
  /** Food Allergies */
  food_allergies?: string | null;
  /** Drug Allergies */
  drug_allergies?: string | null;
  /** Plant Allergies */
  plant_allergies?: string | null;
  /** Other Allergies */
  other_allergies?: string | null;
  /** Dietary Restrictions */
  dietary_restrictions?: string | null;
  /** Blood Type Code */
  blood_type_code?: string | null;
  /** Weight */
  weight?: number | null;
  /** Height */
  height?: number | null;
  /** Laterality */
  laterality?: string | null;
  /** Current Ailments */
  current_ailments?: string | null;
  /** Recent Interventions */
  recent_interventions?: string | null;
  /** Other History */
  other_history?: string | null;
  /** Has Allergies */
  has_allergies?: boolean | null;
  /** Require Drugs */
  require_drugs?: boolean | null;
  /** Drugs */
  drugs?: string | null;
  /** Authorize Emergency Transfer */
  authorize_emergency_transfer?: boolean | null;
  /** Authorize Physical Activity */
  authorize_physical_activity?: boolean | null;
  /** Emergency Contact Id */
  emergency_contact_id?: string | null;
  /** Emergency Contact Name */
  emergency_contact_name?: string | null;
  /** Emergency Contact Phone */
  emergency_contact_phone?: string | null;
  /** Emergency Contact Relationship */
  emergency_contact_relationship?: string | null;
  /** Has Private Doctor */
  has_private_doctor?: boolean | null;
  /** Doctor Name */
  doctor_name?: string | null;
  /** Doctor Phone */
  doctor_phone?: string | null;
  /** Doctor Clinic */
  doctor_clinic?: string | null;
  /** Has Private Insurance */
  has_private_insurance?: boolean | null;
  /** Has All Vaccines */
  has_all_vaccines?: boolean | null;
  /** Pending Vaccines */
  pending_vaccines?: string | null;
  /** Comments */
  comments?: string | null;
}

/** MedicalInfoUpdate */
export interface MedicalInfoUpdate {
  /** Id */
  id: string | null;
  /** Personal History */
  personal_history?: string | null;
  /** Family History */
  family_history?: string | null;
  /** Food Allergies */
  food_allergies?: string | null;
  /** Drug Allergies */
  drug_allergies?: string | null;
  /** Plant Allergies */
  plant_allergies?: string | null;
  /** Other Allergies */
  other_allergies?: string | null;
  /** Blood Type Code */
  blood_type_code?: string | null;
}

/** MedicalInfoUpdateDTO */
export interface MedicalInfoUpdateDTO {
  /** Personal History */
  personal_history?: string | null;
  /** Family History */
  family_history?: string | null;
  /** Food Allergies */
  food_allergies?: string | null;
  /** Drug Allergies */
  drug_allergies?: string | null;
  /** Plant Allergies */
  plant_allergies?: string | null;
  /** Other Allergies */
  other_allergies?: string | null;
  /** Dietary Restrictions */
  dietary_restrictions?: string | null;
  /** Blood Type Code */
  blood_type_code?: string | null;
  /** Weight */
  weight?: number | null;
  /** Height */
  height?: number | null;
  /** Laterality */
  laterality?: string | null;
  /** Current Ailments */
  current_ailments?: string | null;
  /** Recent Interventions */
  recent_interventions?: string | null;
  /** Other History */
  other_history?: string | null;
  /** Has Allergies */
  has_allergies?: boolean | null;
  /** Require Drugs */
  require_drugs?: boolean | null;
  /** Drugs */
  drugs?: string | null;
  /** Authorize Emergency Transfer */
  authorize_emergency_transfer?: boolean | null;
  /** Authorize Physical Activity */
  authorize_physical_activity?: boolean | null;
  /** Emergency Contact Id */
  emergency_contact_id?: string | null;
  /** Emergency Contact Name */
  emergency_contact_name?: string | null;
  /** Emergency Contact Phone */
  emergency_contact_phone?: string | null;
  /** Emergency Contact Relationship */
  emergency_contact_relationship?: string | null;
  /** Has Private Doctor */
  has_private_doctor?: boolean | null;
  /** Doctor Name */
  doctor_name?: string | null;
  /** Doctor Phone */
  doctor_phone?: string | null;
  /** Doctor Clinic */
  doctor_clinic?: string | null;
  /** Has Private Insurance */
  has_private_insurance?: boolean | null;
  /** Has All Vaccines */
  has_all_vaccines?: boolean | null;
  /** Pending Vaccines */
  pending_vaccines?: string | null;
  /** Comments */
  comments?: string | null;
}

/** NameFieldMetaDTO */
export interface NameFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "name"
   */
  type?: 'name';
  /** Textalign */
  textAlign?: 'left' | 'center' | 'right' | null;
}

/** NotesByAssignmentDTO */
export interface NotesByAssignmentDTO {
  /** Assignment Notes */
  assignment_notes: AssignmentNotesDTO[];
}

/** NumberFieldMetaDTO */
export interface NumberFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "number"
   */
  type?: 'number';
  /** Numberformat */
  numberFormat?: string | null;
  /** Value */
  value?: string | null;
  /** Minvalue */
  minValue?: number | null;
  /** Maxvalue */
  maxValue?: number | null;
  /** Textalign */
  textAlign?: 'left' | 'center' | 'right' | null;
  /** Lineheight */
  lineHeight?: number | null;
  /** Letterspacing */
  letterSpacing?: number | null;
  /** Verticalalign */
  verticalAlign?: 'top' | 'middle' | 'bottom' | null;
}

/** PageResponse */
export interface PageResponseInscriptionEntity {
  /** Page Number */
  page_number: number;
  /** Page Size */
  page_size: number;
  /** Total Pages */
  total_pages: number;
  /** Total Records */
  total_records: number;
  /** Results */
  results?: SrcStudentsEntitiesInscriptionEntity[] | null;
}

/** PageResponse */
export interface PageResponseStudentEntity {
  /** Page Number */
  page_number: number;
  /** Page Size */
  page_size: number;
  /** Total Pages */
  total_pages: number;
  /** Total Records */
  total_records: number;
  /** Results */
  results?: SrcStudentsEntitiesStudentEntity[] | null;
}

/** PaginatedResponse[ClassroomEntity] */
export interface PaginatedResponseClassroomEntity {
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Results */
  results: ClassroomEntity[];
  /** Has More */
  has_more: boolean;
}

/** PaginatedResponse[CredentialTemplateEntity] */
export interface PaginatedResponseCredentialTemplateEntity {
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Results */
  results: CredentialTemplateEntity[];
  /** Has More */
  has_more: boolean;
}

/** PermissionAgreementsEntity */
export interface PermissionAgreementsEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Image Usage */
  image_usage?: boolean | null;
  /** Student Transport */
  student_transport?: boolean | null;
  /** Auth External Care */
  auth_external_care?: boolean | null;
  /** Privacy Notice */
  privacy_notice?: boolean | null;
  /** Allow Solo Departure */
  allow_solo_departure?: boolean | null;
  /** School Regulations */
  school_regulations?: boolean | null;
  /** Hospital Transfer */
  hospital_transfer?: boolean | null;
}

/** PermissionsAgreementsUpdate */
export interface PermissionsAgreementsUpdate {
  /** Id */
  id: string | null;
  /** Image Usage */
  image_usage: boolean | null;
  /** Student Transport */
  student_transport: boolean | null;
  /** Auth External Care */
  auth_external_care: boolean | null;
  /** Privacy Notice */
  privacy_notice: boolean | null;
  /** Allow Solo Departure */
  allow_solo_departure: boolean | null;
  /** School Regulations */
  school_regulations: boolean | null;
  /** Hospital Transfer */
  hospital_transfer: boolean | null;
}

/** RadioFieldMetaDTO */
export interface RadioFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "radio"
   */
  type?: 'radio';
  /** Values */
  values?: RadioValueDTO[] | null;
  /**
   * Direction
   * @default "vertical"
   */
  direction?: 'vertical' | 'horizontal';
}

/** RadioValueDTO */
export interface RadioValueDTO {
  /** Id */
  id: number;
  /** Checked */
  checked: boolean;
  /** Value */
  value: string;
}

/** ReinscriptionConfigEntity */
export interface ReinscriptionConfigEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /** Steps */
  steps?: ReinscriptionStepEntity[] | null;
}

/** ReinscriptionConfigIncludeEnum */
export enum ReinscriptionConfigIncludeEnum {
  Steps = 'steps',
}

/** ReinscriptionStepConceptEntity */
export interface ReinscriptionStepConceptEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Reinscription Step Id
   * @format uuid
   */
  reinscription_step_id: string;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Concept Ids */
  concept_ids: string[];
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/** ReinscriptionStepEntity */
export interface ReinscriptionStepEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Reinscription Config Id
   * @format uuid
   */
  reinscription_config_id: string;
  /** Title */
  title: string;
  type: ReinscriptionStepTypeEnum;
  /** Description */
  description?: string | null;
  /** Config */
  config?: ReinscriptionStepFormConfig | Record<string, any> | null;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /** Order */
  order: number;
}

/** ReinscriptionStepFormConfig */
export interface ReinscriptionStepFormConfig {
  /**
   * Form Id
   * @format uuid
   */
  form_id: string;
}

/** ReinscriptionStepIncludeEnum */
export enum ReinscriptionStepIncludeEnum {
  Config = 'config',
  Concepts = 'concepts',
}

/** ReinscriptionStepTypeEnum */
export enum ReinscriptionStepTypeEnum {
  StudentInfo = 'student_info',
  MedicalInfo = 'medical_info',
  GuardianInfo = 'guardian_info',
  Concepts = 'concepts',
  Forms = 'forms',
  Documents = 'documents',
}

/** RequestInscriptionIncludeEnum */
export enum RequestInscriptionIncludeEnum {
  Section = 'section',
}

/** RequestSchoolCycleIncludeEnum */
export enum RequestSchoolCycleIncludeEnum {
  NextCycle = 'next_cycle',
}

/** RoundingCriteria */
export enum RoundingCriteria {
  RoundHalfUp = 'round_half_up',
  RoundDown = 'round_down',
  RoundUp = 'round_up',
  Standard = 'standard',
  SepReport = 'sep_report',
}

/** SEPCourseDTO */
export interface SEPCourseDTO {
  category: CourseSEPCategoryEnum;
  /** Label */
  label: string;
}

/** SEPCourseGroupDTO */
export interface SEPCourseGroupDTO {
  category: CourseGroupSEPCategoryEnum;
  /** Label */
  label: string;
  /** Courses */
  courses: SEPCourseDTO[];
}

/** SEPCourseGroupScoresDTO */
export interface SEPCourseGroupScoresDTO {
  /**
   * Course Group Id
   * @format uuid
   */
  course_group_id: string;
  /** Course Group Name */
  course_group_name: string;
  /** Period Scores */
  period_scores: SEPPeriodScoreDTO[];
  /** Course Group Average */
  course_group_average?: number | null;
}

/** SEPPeriodAbsenceDTO */
export interface SEPPeriodAbsenceDTO {
  /**
   * Period Id
   * @format uuid
   */
  period_id: string;
  /** Period Name */
  period_name: string;
  /**
   * Absences
   * @default 0
   */
  absences?: number;
}

/** SEPPeriodScoreDTO */
export interface SEPPeriodScoreDTO {
  /**
   * Period Id
   * @format uuid
   */
  period_id: string;
  /** Period Name */
  period_name: string;
  /** Score */
  score?: number | null;
}

/** SEPReportResultDTO */
export interface SEPReportResultDTO {
  /** Students */
  students: SEPReportStudent[];
  /** Periods */
  periods: EvaluationPeriodEntity[];
  /** Course Groups */
  course_groups: CourseGroupEntity[];
}

/** SEPReportStudent */
export interface SEPReportStudent {
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /** Course Group Scores */
  course_group_scores: SEPCourseGroupScoresDTO[];
  student?: MainStudentEntity | null;
  inscription?: SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity | null;
  /** Final Average */
  final_average?: number | null;
  /**
   * Period Absences
   * @default []
   */
  period_absences?: SEPPeriodAbsenceDTO[];
}

/** SchoolConfigEntity */
export interface SchoolConfigEntity {
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
  /** Admission Concepts */
  admission_concepts?: AdmissionConceptLevelEntity[] | null;
  /** Admission Whatsapp Phone */
  admission_whatsapp_phone?: string | null;
  /** Admission Message */
  admission_message?: string | null;
  inscriptions?: InscriptionConfigEntity | null;
  /** Enrollment Code Template */
  enrollment_code_template?: string | null;
  /**
   * Enable Enrollment Code Generation
   * @default false
   */
  enable_enrollment_code_generation?: boolean;
  /**
   * School Correlative
   * @default 1
   */
  school_correlative?: number;
  /** Hidden Medical Form Fields */
  hidden_medical_form_fields?: string | null;
  /** Hidden Application Form Fields */
  hidden_application_form_fields?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  academic?: AcademicSchoolConfigEntity | null;
}

/** SchoolConfigUpsertDTO */
export interface SchoolConfigUpsertDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Admission Concepts */
  admission_concepts?: AdmissionConceptLevelEntity[] | null;
  inscriptions?: InscriptionConfigEntity | null;
  /** Admission Whatsapp Phone */
  admission_whatsapp_phone?: string | null;
  /** Admission Message */
  admission_message?: string | null;
  /** Enrollment Code Template */
  enrollment_code_template?: string | null;
  /** Enable Enrollment Code Generation */
  enable_enrollment_code_generation?: boolean | null;
  /** School Correlative */
  school_correlative?: number | null;
  /** Hidden Medical Form Fields */
  hidden_medical_form_fields?: string | null;
  /** Hidden Application Form Fields */
  hidden_application_form_fields?: string | null;
  academic?: AcademicSchoolConfigEntity | null;
}

/** SchoolCycleGradeDTO */
export interface SchoolCycleGradeDTO {
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
  /** Inscriptions Quota */
  inscriptions_quota: number;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean | null;
}

/** SchoolCycleGradeEntity */
export interface SchoolCycleGradeEntity {
  /** Id */
  id?: string | null;
  /** Created */
  created?: string | null;
  /** Modified */
  modified?: string | null;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Inscriptions Quota */
  inscriptions_quota?: number | null;
  /** Is Active */
  is_active?: boolean | null;
  grade?: SrcStudentsEntitiesGradeEntity | null;
  level?: SrcStudentsEntitiesLevelEntity | null;
}

/** SchoolEntity */
export interface SchoolEntity {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Short Slug */
  short_slug: string;
  /** Slug Name */
  slug_name?: string | null;
  /** Phone */
  phone: string;
  /** Email */
  email: string;
  /**
   * Organization Id
   * @format uuid
   */
  organization_id: string;
  /** Institutional Id */
  institutional_id: string;
  /** Config Dashboard */
  config_dashboard?: Record<string, boolean | string | null> | null;
  /** Config Portal */
  config_portal?: Record<string, boolean> | null;
  /** Cfdi Use Config */
  cfdi_use_config?: Record<string, Record<string, string | null>> | null;
  /** Status */
  status: string;
  /** Country */
  country: string;
  /** State */
  state: string;
  /** City */
  city: string;
  /** Address Name */
  address_name: string;
  /** Address Number */
  address_number: string;
  /** Postal Code */
  postal_code: string;
  /** Partial Payment Interest Type */
  partial_payment_interest_type: string;
  /** Partial Payment Interest Freeze */
  partial_payment_interest_freeze: boolean;
  /** Scholarship Lost Config */
  scholarship_lost_config: string;
  /** Discount Order */
  discount_order: string;
  /** Scholarship Is Accumulative */
  scholarship_is_accumulative: boolean;
  /** Is Provider */
  is_provider: boolean;
  /** Does Invoice */
  does_invoice: boolean;
  /** Can Invoice To General Public */
  can_invoice_to_general_public: boolean;
  /** Apply Discounts Independently */
  apply_discounts_independently: boolean;
  /** Counter Id */
  counter_id?: string | null;
  /** Logo */
  logo?: string | null;
  school_type?: SchoolType | null;
}

/** SchoolType */
export enum SchoolType {
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

/** ScoreCardDownloadResultDTO */
export interface ScoreCardDownloadResultDTO {
  /** Download Url */
  download_url: string;
}

/** ScoreCardSubmissionEntity */
export interface ScoreCardSubmissionEntity {
  /**
   * Id
   * Unique identifier
   * @format uuid
   */
  id?: string;
  /**
   * Campaign Id
   * Campaign ID from Comms service
   */
  campaign_id?: string | null;
  /**
   * Evaluation Period Id
   * Evaluation Period ID for score cards
   * @format uuid
   */
  evaluation_period_id: string;
  /**
   * Requested By Id
   * User ID who requested the submission
   * @format uuid
   */
  requested_by_id: string;
  /**
   * Requested At
   * Timestamp when submission was requested
   * @format date-time
   */
  requested_at: string;
  /**
   * Current status of the submission
   * @default "created"
   */
  status?: ScoreCardSubmissionStatus;
  /**
   * Started At
   * Timestamp when processing started
   */
  started_at?: string | null;
  /**
   * Finished At
   * Timestamp when processing finished
   */
  finished_at?: string | null;
  /**
   * Filters Json
   * Filters used to select students
   */
  filters_json?: Record<string, any>;
  /**
   * Created
   * @format date-time
   */
  created?: string;
  /**
   * Modified
   * @format date-time
   */
  modified?: string;
  /** Deleted */
  deleted?: string | null;
  /**
   * Deleted By Cascade
   * @default false
   */
  deleted_by_cascade?: boolean;
}

/** ScoreCardSubmissionStatus */
export enum ScoreCardSubmissionStatus {
  Created = 'created',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
}

/** ScoresByAssignmentDTO */
export interface ScoresByAssignmentDTO {
  /** Assignment Scores */
  assignment_scores: AssignmentScoresDTO[];
  /** Average */
  average?: number | null;
}

/** ScoringConfig */
export interface ScoringConfig {
  /** @default "numeric" */
  evaluation_score_system?: EvaluationScoreSystem | null;
  /**
   * Decimal Places
   * @default 1
   */
  decimal_places?: number;
  /** @default "standard" */
  rounding_criteria?: RoundingCriteria | null;
  evaluation_note_system?: EvaluationNoteSystem | null;
}

/** SepEducationalLevel */
export enum SepEducationalLevel {
  Preschool = 'preschool',
  Elementary = 'elementary',
  MiddleSchool = 'middle_school',
  HighSchool = 'high_school',
}

/** SignatureEventType */
export enum SignatureEventType {
  DocumentSent = 'document_sent',
  SignatureCompleted = 'signature_completed',
}

/** SignatureFieldMetaDTO */
export interface SignatureFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "signature"
   */
  type?: 'signature';
}

/** SignatureRecordEntity */
export interface SignatureRecordEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Document Instance Id
   * @format uuid
   */
  document_instance_id: string;
  /**
   * Signer Id
   * @format uuid
   */
  signer_id: string;
  event_type: SignatureEventType;
  /**
   * Event Timestamp
   * @format date-time
   */
  event_timestamp: string;
  /** Ip Address */
  ip_address?: string | null;
  /** User Agent */
  user_agent?: string | null;
  /**
   * Location Data
   * @default {}
   */
  location_data?: Record<string, any>;
  /**
   * Signature Metadata
   * @default {}
   */
  signature_metadata?: Record<string, any>;
}

/** SignatureType */
export enum SignatureType {
  Simple = 'simple',
  Advanced = 'advanced',
  Qualified = 'qualified',
}

/** State */
export interface State {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
}

/** StateCreate */
export interface StateCreate {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
}

/** StatsByOriginResultDTO */
export interface StatsByOriginResultDTO {
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /** Registered Count */
  registered_count: number;
  /** Expected Count */
  expected_count: number;
  /** Progress */
  progress: number;
}

/**
 * StudentBackFields
 * Fields displayed on the back of a student credential
 */
export interface StudentBackFields {
  /** Free text field configuration */
  free_text: FreeTextField;
  /** File field configuration (e.g., signature, seal) */
  signature: FileField;
  /** File field configuration (e.g., signature, seal) */
  digital_seal: FileField;
}

/** StudentCreate */
export interface StudentCreate {
  /**
   * Id
   * @format uuid
   */
  id?: string;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /**
   * Student Id
   * @format uuid
   */
  student_id?: string;
  /**
   * School Id
   * @format uuid
   */
  school_id?: string;
  address?: AddressCreate | null;
  medical_info?: MedicalInfoCreate | null;
  permissions_agreements?: PermissionAgreementsEntity | null;
  /** Nationality Code */
  nationality_code?: string | null;
  /** Birth Place Id */
  birth_place_id?: string | null;
  /** Note */
  note?: string | null;
}

/** StudentCreateDTO */
export interface StudentCreateDTO {
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Photo */
  photo?: string | null;
  /** Identifier */
  identifier?: string | null;
  /** Birthdate */
  birthdate?: string | null;
  /** Gender */
  gender?: string | null;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  state?: StudentState | null;
  /** Enrollment Code */
  enrollment_code?: string | null;
  /** Entry Date */
  entry_date?: string | null;
}

/**
 * StudentCredentialConfigSchema
 * Complete configuration schema for student credentials
 */
export interface StudentCredentialConfigSchemaInput {
  /**
   * Type
   * Credential type discriminator
   * @default "student"
   */
  type?: 'student';
  /**
   * Orientation
   * Credential orientation
   */
  orientation: 'portrait' | 'landscape';
  /** Color scheme configuration for the credential */
  color_scheme: ColorScheme;
  /** Fields displayed on the front of a student credential */
  front_fields: StudentFrontFields;
  /** Fields displayed on the back of a student credential */
  back_fields: StudentBackFields;
}

/**
 * StudentCredentialConfigSchema
 * Complete configuration schema for student credentials
 */
export interface StudentCredentialConfigSchemaOutput {
  /**
   * Type
   * Credential type discriminator
   * @default "student"
   */
  type?: 'student';
  /**
   * Orientation
   * Credential orientation
   */
  orientation: 'portrait' | 'landscape';
  /** Color scheme configuration for the credential */
  color_scheme: ColorScheme;
  /** Fields displayed on the front of a student credential */
  front_fields: StudentFrontFields;
  /** Fields displayed on the back of a student credential */
  back_fields: StudentBackFields;
}

/** StudentEntityContextDTO */
export interface StudentEntityContextDTO {
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Identifier */
  identifier?: string | null;
  /** Gender */
  gender?: string | null;
  /** Entry Date */
  entry_date?: string | null;
}

/**
 * StudentFrontFields
 * Fields displayed on the front of a student credential
 */
export interface StudentFrontFields {
  /**
   * Configuration for a single field display
   * @default {"show":true,"color":"#FFFFFF","editable":false}
   */
  name?: FieldConfig;
  /**
   * Configuration for a single field display
   * @default {"show":true,"color":"#FFFFFF","editable":false}
   */
  last_name?: FieldConfig;
  /** Configuration for a single field display */
  enrollment_code: FieldConfig;
  /** Configuration for a single field display */
  identifier: FieldConfig;
  /** Configuration for a single field display */
  school_cycle: FieldConfig;
  /** Configuration for a single field display */
  expires_at: FieldConfig;
  /**
   * Configuration for a single field display
   * @default {"show":false,"color":"#FFFFFF","editable":false}
   */
  cct_identifier?: FieldConfig;
  /** Configuration for a single field display */
  level: FieldConfig;
  /** Configuration for a single field display */
  grade: FieldConfig;
}

/** StudentGuardianLinkEntity */
export interface StudentGuardianLinkEntity {
  /** Id */
  id?: number | null;
  /**
   * Guardian Id
   * @format uuid
   */
  guardian_id: string;
  /**
   * Student Id
   * @format uuid
   */
  student_id: string;
  /** Relationship */
  relationship?: string | null;
  /** Has Student Custody */
  has_student_custody?: boolean | null;
}

/** StudentGuardianLinkUpsertInputDTO */
export interface StudentGuardianLinkUpsertInputDTO {
  /** Guardian Id */
  guardian_id?: string | null;
  /** Guardian Ids */
  guardian_ids?: string[] | null;
  /** Student Id */
  student_id?: string | null;
  /** Student Ids */
  student_ids?: string[] | null;
  /** Relationship */
  relationship?: string | null;
  /** Has Student Custody */
  has_student_custody?: boolean | null;
}

/** StudentGuardianLinkUpsertResultDTO */
export interface StudentGuardianLinkUpsertResultDTO {
  link: StudentGuardianLinkEntity;
  /** Created */
  created: boolean;
}

/** StudentState */
export enum StudentState {
  Lead = 'lead',
  NewStudent = 'new_student',
  Active = 'active',
  Inactive = 'inactive',
  Graduated = 'graduated',
  DroppedOut = 'dropped_out',
}

/** StudentUpdate */
export interface StudentUpdate {
  /** Nationality Code */
  nationality_code?: string | null;
  /** Birth Place Id */
  birth_place_id?: string | null;
  address?: AddressUpdate | null;
  medical_info?: MedicalInfoUpdate | null;
  permissions_agreements?: PermissionsAgreementsUpdate | null;
  /** Note */
  note?: string | null;
}

/** StudentUpdateDTO */
export interface StudentUpdateDTO {
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Identifier */
  identifier?: string | null;
  /** Birthdate */
  birthdate?: string | null;
  /** Gender */
  gender?: string | null;
  /** Enrollment Code */
  enrollment_code?: string | null;
  /** Entry Date */
  entry_date?: string | null;
  state?: StudentState | null;
}

/** TableConfigEntity */
export interface TableConfigEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /** Table Name */
  table_name: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Columns Config */
  columns_config?: ColumnsConfig[] | null;
  /** Filters Config */
  filters_config?: Record<string, any> | null;
  /** Modified At */
  modified_at?: string | null;
}

/** TableConfigUpsertDTO */
export interface TableConfigUpsertDTO {
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /** Table Name */
  table_name: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Columns Config */
  columns_config?: ColumnsConfig[] | null;
  /** Filters Config */
  filters_config?: Record<string, any> | null;
  /** Id */
  id?: string | null;
}

/**
 * TeacherBackFields
 * Fields displayed on the back of a teacher credential
 */
export interface TeacherBackFields {
  /** Free text field configuration */
  free_text: FreeTextField;
  /** File field configuration (e.g., signature, seal) */
  signature: FileField;
  /** File field configuration (e.g., signature, seal) */
  digital_seal: FileField;
}

/**
 * TeacherCredentialConfigSchema
 * Complete configuration schema for teacher credentials
 */
export interface TeacherCredentialConfigSchemaInput {
  /**
   * Type
   * Credential type discriminator
   * @default "teacher"
   */
  type?: 'teacher';
  /**
   * Orientation
   * Credential orientation
   */
  orientation: 'portrait' | 'landscape';
  /** Color scheme configuration for the credential */
  color_scheme: ColorScheme;
  /** Fields displayed on the front of a teacher credential */
  front_fields: TeacherFrontFields;
  /** Fields displayed on the back of a teacher credential */
  back_fields: TeacherBackFields;
}

/**
 * TeacherCredentialConfigSchema
 * Complete configuration schema for teacher credentials
 */
export interface TeacherCredentialConfigSchemaOutput {
  /**
   * Type
   * Credential type discriminator
   * @default "teacher"
   */
  type?: 'teacher';
  /**
   * Orientation
   * Credential orientation
   */
  orientation: 'portrait' | 'landscape';
  /** Color scheme configuration for the credential */
  color_scheme: ColorScheme;
  /** Fields displayed on the front of a teacher credential */
  front_fields: TeacherFrontFields;
  /** Fields displayed on the back of a teacher credential */
  back_fields: TeacherBackFields;
}

/**
 * TeacherFrontFields
 * Fields displayed on the front of a teacher credential
 */
export interface TeacherFrontFields {
  /**
   * Configuration for a single field display
   * @default {"show":true,"color":"#FFFFFF","editable":false}
   */
  name?: FieldConfig;
  /**
   * Configuration for a single field display
   * @default {"show":true,"color":"#FFFFFF","editable":false}
   */
  last_name?: FieldConfig;
}

/** TeacherProfileEntity */
export interface TeacherProfileEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Membership Id
   * @format uuid
   */
  membership_id: string;
  /**
   * Role
   * @default ""
   */
  role?: string;
}

/** TemplateCategory */
export enum TemplateCategory {
  Admission = 'admission',
  Reinscription = 'reinscription',
  Contract = 'contract',
  Generic = 'generic',
}

/** TemplateEditAccessDTO */
export interface TemplateEditAccessDTO {
  /** Id */
  id: string;
  /** Token */
  token: string;
  /** Expires In */
  expires_in: number;
}

/** TemplateFieldEntity */
export interface TemplateFieldEntity {
  /** Id */
  id: string;
  /** Page */
  page: number;
  /** Positionx */
  positionX: string;
  /** Positiony */
  positionY: string;
  /** Width */
  width: string;
  /** Height */
  height: string;
  type: TemplateFieldType;
  /** Fieldmeta */
  fieldMeta?:
    | (
        | ({
            type: 'checkbox';
          } & CheckboxFieldMetaDTO)
        | ({
            type: 'date';
          } & DateFieldMetaDTO)
        | ({
            type: 'dropdown';
          } & DropdownFieldMetaDTO)
        | ({
            type: 'email';
          } & EmailFieldMetaDTO)
        | ({
            type: 'initials';
          } & InitialsFieldMetaDTO)
        | ({
            type: 'name';
          } & NameFieldMetaDTO)
        | ({
            type: 'number';
          } & NumberFieldMetaDTO)
        | ({
            type: 'radio';
          } & RadioFieldMetaDTO)
        | ({
            type: 'signature';
          } & SignatureFieldMetaDTO)
        | ({
            type: 'text';
          } & TextFieldMetaDTO)
      )
    | null;
}

/** TemplateFieldType */
export enum TemplateFieldType {
  SIGNATURE = 'SIGNATURE',
  FREE_SIGNATURE = 'FREE_SIGNATURE',
  INITIALS = 'INITIALS',
  NAME = 'NAME',
  EMAIL = 'EMAIL',
  DATE = 'DATE',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
}

/** TemplateFunctionMetadataDTO */
export interface TemplateFunctionMetadataDTO {
  /** Name */
  name: string;
  /** Args Count */
  args_count: number;
}

/** TextFieldMetaDTO */
export interface TextFieldMetaDTO {
  /** Label */
  label?: string | null;
  /** Placeholder */
  placeholder?: string | null;
  /** Required */
  required?: boolean | null;
  /** Readonly */
  readOnly?: boolean | null;
  /** Fontsize */
  fontSize?: number | null;
  /**
   * Type
   * @default "text"
   */
  type?: 'text';
  /** Text */
  text?: string | null;
  /** Characterlimit */
  characterLimit?: number | null;
  /** Textalign */
  textAlign?: 'left' | 'center' | 'right' | null;
  /** Lineheight */
  lineHeight?: number | null;
  /** Letterspacing */
  letterSpacing?: number | null;
  /** Verticalalign */
  verticalAlign?: 'top' | 'middle' | 'bottom' | null;
}

/** TransferStudentsRequestDTO */
export interface TransferStudentsRequestDTO {
  /**
   * Inscription Ids
   * @minItems 1
   */
  inscription_ids: string[];
  /**
   * Target School Cycle Id
   * @format uuid
   */
  target_school_cycle_id: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
  /** Group Id */
  group_id?: string | null;
  /**
   * Bypass Enrollment Code
   * @default false
   */
  bypass_enrollment_code?: boolean;
  /**
   * Bypass Identifier
   * @default false
   */
  bypass_identifier?: boolean;
}

/** TransferredStudentResponseDTO */
export interface TransferredStudentResponseDTO {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Identifier */
  identifier?: string | null;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /**
   * New Inscription Id
   * @format uuid
   */
  new_inscription_id: string;
}

/** UpdateAttendanceRecordDTO */
export interface UpdateAttendanceRecordDTO {
  status?: AttendanceStatusEnum | null;
  /** Notes */
  notes?: string | null;
}

/** UpdateAttendanceSessionDTO */
export interface UpdateAttendanceSessionDTO {
  /** Notes */
  notes?: string | null;
  /** Is Closed */
  is_closed?: boolean | null;
  /** Taken By Id */
  taken_by_id?: string | null;
}

/** UpdateClassroomDTO */
export interface UpdateClassroomDTO {
  /** Variant */
  variant?: string | null;
}

/** UpdateCorrelativeResultDTO */
export interface UpdateCorrelativeResultDTO {
  /** Updated */
  updated: boolean;
  /** Reason */
  reason: string;
  /** New Correlative */
  new_correlative?: number | null;
}

/** UpdateCourseDTO */
export interface UpdateCourseDTO {
  /** Name */
  name?: string | null;
  /** Course Group Id */
  course_group_id?: string | null;
  sep_category?: CourseSEPCategoryEnum | null;
}

/** UpdateCourseGroupDTO */
export interface UpdateCourseGroupDTO {
  /** Name */
  name?: string | null;
  sep_category?: CourseGroupSEPCategoryEnum | null;
}

/** UpdateCredentialTemplateDTO */
export interface UpdateCredentialTemplateDTO {
  /** School Id */
  school_id?: string | null;
  /** Name */
  name?: string | null;
  type?: CredentialTemplateType | null;
  /** Config */
  config?:
    | (
        | ({
            type: 'guardian';
          } & GuardianCredentialConfigSchemaInput)
        | ({
            type: 'student';
          } & StudentCredentialConfigSchemaInput)
        | ({
            type: 'teacher';
          } & TeacherCredentialConfigSchemaInput)
      )
    | null;
}

/** UpdateDocumentStatusDTO */
export interface UpdateDocumentStatusDTO {
  status: DocumentInstanceStatus;
  /** Metadata */
  metadata?: Record<string, any>;
}

/** UpdateEvaluationPeriodDTO */
export interface UpdateEvaluationPeriodDTO {
  /** Name */
  name?: string | null;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
}

/** UpdateFileDTO */
export interface UpdateFileDTO {
  /** Entity Id */
  entity_id?: string | null;
  /** Type Id */
  type_id?: string | null;
  /** Created By */
  created_by?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Tag */
  tag?: string | null;
}

/** UpdateGradeAndGroupDTO */
export interface UpdateGradeAndGroupDTO {
  grade: UpdateGradeDTO;
  /** Groups */
  groups?: UpdateGroupDTO[] | null;
}

/** UpdateGradeDTO */
export interface UpdateGradeDTO {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name?: string | null;
  /** Is Last */
  is_last?: boolean | null;
  /** Next Id */
  next_id?: string | null;
  /** Level Id */
  level_id?: string | null;
}

/** UpdateGroupDTO */
export interface UpdateGroupDTO {
  /** Id */
  id?: string | null;
  /** Name */
  name?: string | null;
}

/** UpdateInscriptionRequest */
export interface UpdateInscriptionRequest {
  /** Section Id */
  section_id?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
  /** Personal Step Completed At */
  personal_step_completed_at?: string | null;
  /** Medical Step Completed At */
  medical_step_completed_at?: string | null;
  /** Consentments Step Completed At */
  consentments_step_completed_at?: string | null;
}

/** UpdateLevelDTO */
export interface UpdateLevelDTO {
  /** Name */
  name?: string | null;
  type?: LevelType | null;
  /** Order */
  order?: number | null;
}

/** UpdateReinscriptionConfigDTO */
export interface UpdateReinscriptionConfigDTO {
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** Is Active */
  is_active?: boolean | null;
}

/** UpdateReinscriptionStepConceptDTO */
export interface UpdateReinscriptionStepConceptDTO {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Concept Ids */
  concept_ids?: string[] | null;
  /** Is Active */
  is_active?: boolean | null;
}

/** UpdateReinscriptionStepDTO */
export interface UpdateReinscriptionStepDTO {
  /** Title */
  title?: string | null;
  type?: ReinscriptionStepTypeEnum | null;
  /** Description */
  description?: string | null;
  /** Config */
  config?: Record<string, any> | null;
  /** Is Active */
  is_active?: boolean | null;
  /** Order */
  order?: number | null;
}

/** UpdateSchoolCycleRequest */
export interface UpdateSchoolCycleRequest {
  /** Name */
  name?: string | null;
  /** Year Start */
  year_start?: number | null;
  /** Year End */
  year_end?: number | null;
  /** Month Start */
  month_start?: number | null;
  /** Month End */
  month_end?: number | null;
  /** Day Start */
  day_start?: number | null;
  /** Day End */
  day_end?: number | null;
  /** Next Id */
  next_id?: string | null;
}

/** UpdateStudentFile */
export interface UpdateStudentFile {
  /**
   * Entity Id
   * @format uuid
   */
  entity_id: string;
}

/** UpdateTeacherProfileDTO */
export interface UpdateTeacherProfileDTO {
  /** Role */
  role?: string | null;
}

/** UpsertAcademicConfigDTO */
export interface UpsertAcademicConfigDTO {
  origin_type: AcademicConfigOriginTypeEnum;
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /**
   * School Cycle Id
   * @format uuid
   */
  school_cycle_id: string;
  scoring?: ScoringConfig | null;
  attendance?: AttendanceConfig | null;
  sep?: SEPConfig | null;
}

/** UpsertEvaluationNoteDTO */
export interface UpsertEvaluationNoteDTO {
  /** Note */
  note: string;
  origin_type: EvaluationNoteOriginTypeEnum;
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /**
   * Classroom Student Assignment Id
   * @format uuid
   */
  classroom_student_assignment_id: string;
}

/** UpsertEvaluationScoreDTO */
export interface UpsertEvaluationScoreDTO {
  /** Score */
  score: number;
  origin_type: EvaluationScoreOriginTypeEnum;
  /**
   * Origin Id
   * @format uuid
   */
  origin_id: string;
  /**
   * Classroom Student Assignment Id
   * @format uuid
   */
  classroom_student_assignment_id: string;
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

/** StudentEntity */
export interface SrcAcademicDomainEntitiesClassroomStudentAssignmentStudentEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
}

/** GradeEntity */
export interface SrcAcademicDomainEntitiesStructureGradeEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** GroupEntity */
export interface SrcAcademicDomainEntitiesStructureGroupEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** LevelEntity */
export interface SrcAcademicDomainEntitiesStructureLevelEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** GradeEntity */
export interface SrcInscriptionsDomainEntitiesGradeGradeEntity {
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
  name: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /** Next Id */
  next_id?: string | null;
}

/** GroupEntity */
export interface SrcInscriptionsDomainEntitiesGroupGroupEntity {
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
  name: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
}

/** InscriptionEntity */
export interface SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity {
  /**
   * Id
   * @format uuid
   */
  id?: string;
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
  /** School Cycle Id */
  school_cycle_id?: string | null;
  /** Student Id */
  student_id?: string | null;
  status?: InscriptionStatusEnum | null;
  /** Section Id */
  section_id?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
  /** Personal Step Completed At */
  personal_step_completed_at?: string | null;
  /** Medical Step Completed At */
  medical_step_completed_at?: string | null;
  /** Consentments Step Completed At */
  consentments_step_completed_at?: string | null;
  student?: SrcInscriptionsDomainEntitiesStudentStudentEntity | null;
  school_cycle?: SrcInscriptionsDomainEntitiesSchoolCycleSchoolCycleEntity | null;
  section?: SrcInscriptionsDomainEntitiesSectionSectionEntity | null;
  level?: SrcInscriptionsDomainEntitiesLevelLevelEntity | null;
  grade?: SrcInscriptionsDomainEntitiesGradeGradeEntity | null;
  group?: SrcInscriptionsDomainEntitiesGroupGroupEntity | null;
}

/** LevelEntity */
export interface SrcInscriptionsDomainEntitiesLevelLevelEntity {
  /** Id */
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
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Name */
  name: string;
}

/** SchoolCycleEntity */
export interface SrcInscriptionsDomainEntitiesSchoolCycleSchoolCycleEntity {
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
  name: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Next Id */
  next_id?: string | null;
  /** Year Start */
  year_start?: number | null;
  /** Year End */
  year_end?: number | null;
  /** Is Active */
  is_active?: boolean | null;
}

/** SectionEntity */
export interface SrcInscriptionsDomainEntitiesSectionSectionEntity {
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
  /** Grade */
  grade: string;
  /**
   * Level Id
   * @format uuid
   */
  level_id: string;
  /** Without Group */
  without_group: boolean;
  /** Last Section */
  last_section: boolean;
  /** Group */
  group?: string | null;
  /** Next Id */
  next_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
  level?: SrcInscriptionsDomainEntitiesLevelLevelEntity | null;
}

/** StudentEntity */
export interface SrcInscriptionsDomainEntitiesStudentStudentEntity {
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
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Enrollment Code */
  enrollment_code?: string | null;
  /** Identifier */
  identifier?: string | null;
  /** Photo */
  photo?: string | null;
}

/** SchoolCycleEntity */
export interface SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity {
  /**
   * Id
   * @format uuid
   */
  id?: string;
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
  name: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Next Id */
  next_id?: string | null;
  /** Year Start */
  year_start?: number | null;
  /** Year End */
  year_end?: number | null;
  /** Month Start */
  month_start?: number | null;
  /** Month End */
  month_end?: number | null;
  /** Day Start */
  day_start?: number | null;
  /** Day End */
  day_end?: number | null;
  /**
   * Is Active
   * @default false
   */
  is_active?: boolean;
  next_cycle?: SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity | null;
}

/** GradeEntity */
export interface SrcSchoolsApiDomainEntitiesGradeEntity {
  /** Name */
  name: string;
  /** Is Last */
  is_last: boolean;
  /** Level Id */
  level_id?: string | null;
  /** Next Id */
  next_id?: string | null;
  /** Id */
  id?: string | null;
  level?: SrcSchoolsApiDomainEntitiesLevelEntity | null;
  /** Groups */
  groups?: SrcSchoolsApiDomainEntitiesGroupEntity[] | null;
}

/** GroupEntity */
export interface SrcSchoolsApiDomainEntitiesGroupEntity {
  /** Name */
  name: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
  /** Is Last */
  is_last: boolean;
  /** Next Id */
  next_id?: string | null;
  /** Id */
  id?: string | null;
  /** Deleted */
  deleted?: string | null;
  grade?: SrcSchoolsApiDomainEntitiesGradeEntity | null;
}

/** LevelEntity */
export interface SrcSchoolsApiDomainEntitiesLevelEntity {
  /** Name */
  name: string;
  type: LevelType;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Grades */
  grades?: SrcSchoolsApiDomainEntitiesGradeEntity[];
  /** Order */
  order?: number | null;
  /** Id */
  id?: string | null;
}

/** SectionEntity */
export interface SrcSchoolsApiDomainEntitiesSectionEntity {
  /** Grade */
  grade?: string | null;
  /** Group */
  group?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Without Group */
  without_group?: boolean | null;
  /** Last Section */
  last_section?: boolean | null;
  /** Next Id */
  next_id?: string | null;
  /** Id */
  id?: string | null;
  /** Name */
  name?: string | null;
  level?: SrcSchoolsApiDomainEntitiesLevelEntity | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Related Group Id */
  related_group_id?: string | null;
  grade_entity?: SrcSchoolsApiDomainEntitiesGradeEntity | null;
  /** Deleted */
  deleted?: string | null;
}

/** GradeEntity */
export interface SrcStudentsEntitiesGradeEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** InscriptionEntity */
export interface SrcStudentsEntitiesInscriptionEntity {
  /** Id */
  id?: string | null;
  /** Created */
  created?: string | null;
  /** Modified */
  modified?: string | null;
  /** Student Id */
  student_id?: string | null;
  student?: MainStudentEntity | null;
  school_cycle?: SrcStudentsEntitiesSchoolCycleEntity | null;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  section?: SrcStudentsEntitiesSectionEntity | null;
  /** Section Id */
  section_id?: string | null;
  /** Deleted */
  deleted?: string | null;
  /** Deleted By Cascade */
  deleted_by_cascade?: boolean;
  status?: InscriptionStatus | null;
  /** Is Assigned */
  is_assigned?: boolean | null;
  /** Payment Status */
  payment_status?: string | null;
  /** Personal Step Completed At */
  personal_step_completed_at?: string | null;
  /** Medical Step Completed At */
  medical_step_completed_at?: string | null;
  /** Consentments Step Completed At */
  consentments_step_completed_at?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Grade Id */
  grade_id?: string | null;
  /** Group Id */
  group_id?: string | null;
}

/** LevelEntity */
export interface SrcStudentsEntitiesLevelEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type?: string | null;
  /** Grades */
  grades?: SrcStudentsEntitiesGradeEntity[];
}

/** SchoolCycleEntity */
export interface SrcStudentsEntitiesSchoolCycleEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Is Active */
  is_active: boolean;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Year Start */
  year_start?: number | null;
  /** Year End */
  year_end?: number | null;
}

/** SectionEntity */
export interface SrcStudentsEntitiesSectionEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Grade Id
   * @format uuid
   */
  grade_id: string;
  /** Grade */
  grade: string;
  /** Related Group Id */
  related_group_id?: string | null;
  /** Group */
  group?: string | null;
  /** Level Id */
  level_id?: string | null;
  /** Level Name */
  level_name?: string | null;
  /** Level Type */
  level_type?: string | null;
  /** Last Section */
  last_section?: boolean | null;
  /** Without Group */
  without_group?: boolean | null;
  /** Next Id */
  next_id?: string | null;
}

/** StudentEntity */
export interface SrcStudentsEntitiesStudentEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Student Id */
  student_id?: string | null;
  /** School Id */
  school_id?: string | null;
  address?: Address | null;
  medical_info?: MedicalInfoEntity | null;
  permissions_agreements?: PermissionAgreementsEntity | null;
  /** Note */
  note?: string | null;
  /** Nationality Code */
  nationality_code?: string | null;
  birth_place?: State | null;
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
 * @title /api/v1
 * @version 0.1.0
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
     * @tags location
     * @name GetCountryApiV1LocationCountriesPkGet
     * @summary Get Country
     * @request GET:/api/v1/location/countries/{pk}
     * @secure
     */
    getCountryApiV1LocationCountriesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<Country, HTTPValidationError>({
        path: `/api/v1/location/countries/${pk}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags location
     * @name GetCountriesApiV1LocationCountriesGet
     * @summary Get Countries
     * @request GET:/api/v1/location/countries
     * @secure
     */
    getCountriesApiV1LocationCountriesGet: (params: RequestParams = {}) =>
      this.request<Country[], any>({
        path: `/api/v1/location/countries`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags location
     * @name CreateCountryApiV1LocationCountriesPost
     * @summary Create Country
     * @request POST:/api/v1/location/countries
     * @secure
     */
    createCountryApiV1LocationCountriesPost: (data: CountryCreate, params: RequestParams = {}) =>
      this.request<Country, HTTPValidationError>({
        path: `/api/v1/location/countries`,
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
     * @tags location
     * @name GetStateApiV1LocationStatesPkGet
     * @summary Get State
     * @request GET:/api/v1/location/states/{pk}
     * @secure
     */
    getStateApiV1LocationStatesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<State, HTTPValidationError>({
        path: `/api/v1/location/states/${pk}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags location
     * @name GetStatesApiV1LocationStatesGet
     * @summary Get States
     * @request GET:/api/v1/location/states
     * @secure
     */
    getStatesApiV1LocationStatesGet: (params: RequestParams = {}) =>
      this.request<State[], any>({
        path: `/api/v1/location/states`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags location
     * @name CreateStateApiV1LocationStatesPost
     * @summary Create State
     * @request POST:/api/v1/location/states
     * @secure
     */
    createStateApiV1LocationStatesPost: (data: StateCreate, params: RequestParams = {}) =>
      this.request<State, HTTPValidationError>({
        path: `/api/v1/location/states`,
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
     * @tags location
     * @name GetAddressApiV1LocationAddressesPkGet
     * @summary Get Address
     * @request GET:/api/v1/location/addresses/{pk}
     * @secure
     */
    getAddressApiV1LocationAddressesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<Address, HTTPValidationError>({
        path: `/api/v1/location/addresses/${pk}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags location
     * @name UpdateAddressApiV1LocationAddressesPkPut
     * @summary Update Address
     * @request PUT:/api/v1/location/addresses/{pk}
     * @secure
     */
    updateAddressApiV1LocationAddressesPkPut: (pk: string, data: AddressUpdate, params: RequestParams = {}) =>
      this.request<Address, HTTPValidationError>({
        path: `/api/v1/location/addresses/${pk}`,
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
     * @tags location
     * @name GetAddressesApiV1LocationAddressesGet
     * @summary Get Addresses
     * @request GET:/api/v1/location/addresses
     * @secure
     */
    getAddressesApiV1LocationAddressesGet: (params: RequestParams = {}) =>
      this.request<Address[], any>({
        path: `/api/v1/location/addresses`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags location
     * @name CreateAddressApiV1LocationAddressesPost
     * @summary Create Address
     * @request POST:/api/v1/location/addresses
     * @secure
     */
    createAddressApiV1LocationAddressesPost: (data: AddressCreate, params: RequestParams = {}) =>
      this.request<Address, HTTPValidationError>({
        path: `/api/v1/location/addresses`,
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
     * @tags student
     * @name GetStudentApiV1StudentPkGet
     * @summary Get Student
     * @request GET:/api/v1/student/{pk}
     * @secure
     */
    getStudentApiV1StudentPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<SrcStudentsEntitiesStudentEntity, HTTPValidationError>({
        path: `/api/v1/student/${pk}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags student
     * @name ListStudentsApiV1StudentGet
     * @summary List Students
     * @request GET:/api/v1/student/
     * @secure
     */
    listStudentsApiV1StudentGet: (
      query?: {
        /**
         * Page
         * @min 1
         * @max 100
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @min 1
         * @max 100
         * @default 50
         */
        limit?: number;
        /** Student Id */
        student_id?: string[] | null;
        /** School Id */
        school_id?: string[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<PageResponseStudentEntity, HTTPValidationError>({
        path: `/api/v1/student/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags student
     * @name CreateStudentApiV1StudentPost
     * @summary Create Student
     * @request POST:/api/v1/student/
     * @secure
     */
    createStudentApiV1StudentPost: (data: StudentCreate, params: RequestParams = {}) =>
      this.request<SrcStudentsEntitiesStudentEntity, HTTPValidationError>({
        path: `/api/v1/student/`,
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
     * @tags student
     * @name UpdateStudentApiV1StudentStudentIdPut
     * @summary Update Student
     * @request PUT:/api/v1/student/{student_id}
     * @secure
     */
    updateStudentApiV1StudentStudentIdPut: (studentId: string, data: StudentUpdate, params: RequestParams = {}) =>
      this.request<SrcStudentsEntitiesStudentEntity, HTTPValidationError>({
        path: `/api/v1/student/${studentId}`,
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
     * @tags student
     * @name UpdateStudentMedicalInfoApiV1StudentStudentIdMedicalInfoPut
     * @summary Update Student Medical Info
     * @request PUT:/api/v1/student/{student_id}/medical-info
     * @secure
     */
    updateStudentMedicalInfoApiV1StudentStudentIdMedicalInfoPut: (
      studentId: string,
      data: MedicalInfoUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<MedicalInfoEntity, HTTPValidationError>({
        path: `/api/v1/student/${studentId}/medical-info`,
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
     * @tags student
     * @name UpdateStudentFilesApiV1StudentStudentIdFilesPut
     * @summary Update Student Files
     * @request PUT:/api/v1/student/{student_id}/files
     * @secure
     */
    updateStudentFilesApiV1StudentStudentIdFilesPut: (
      studentId: string,
      data: UpdateStudentFile,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/student/${studentId}/files`,
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
     * @tags students, api-cometa
     * @name GetEnrollmentContextMetadataApiV1StudentsEnrollmentContextMetadataGet
     * @summary Get Enrollment Context Metadata
     * @request GET:/api/v1/students/enrollment-context-metadata
     * @secure
     */
    getEnrollmentContextMetadataApiV1StudentsEnrollmentContextMetadataGet: (params: RequestParams = {}) =>
      this.request<EnrollmentContextMetadataDTO, any>({
        path: `/api/v1/students/enrollment-context-metadata`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags students, api-cometa
     * @name GenerateEnrollmentCodeApiV1StudentsEnrollmentCodePost
     * @summary Generate Enrollment Code
     * @request POST:/api/v1/students/enrollment-code
     * @secure
     */
    generateEnrollmentCodeApiV1StudentsEnrollmentCodePost: (
      data: EnrollmentContextInputDTO,
      params: RequestParams = {}
    ) =>
      this.request<EnrollmentCodeResultDTO, HTTPValidationError>({
        path: `/api/v1/students/enrollment-code`,
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
     * @tags students, api-cometa
     * @name ListMainStudentsApiV1StudentsGet
     * @summary List Main Students
     * @request GET:/api/v1/students/
     * @secure
     */
    listMainStudentsApiV1StudentsGet: (
      query?: {
        /** Id */
        id?: string | string[] | null;
        /** School Id */
        school_id?: string | null;
        /** Guardian Id */
        guardian_id?: string | null;
        /** Enrollment Codes */
        enrollment_codes?: string[] | null;
        /** Billing Guardian Id */
        billing_guardian_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<MainStudentEntity[], HTTPValidationError>({
        path: `/api/v1/students/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags students, api-cometa
     * @name CreateMainStudentApiV1StudentsPost
     * @summary Create Main Student
     * @request POST:/api/v1/students/
     * @secure
     */
    createMainStudentApiV1StudentsPost: (data: StudentCreateDTO, params: RequestParams = {}) =>
      this.request<MainStudentEntity, HTTPValidationError>({
        path: `/api/v1/students/`,
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
     * @tags students, api-cometa
     * @name CreateStudentAndGuardianApiV1StudentsWithGuardianPost
     * @summary Create Student And Guardian
     * @request POST:/api/v1/students/with-guardian
     * @secure
     */
    createStudentAndGuardianApiV1StudentsWithGuardianPost: (
      data: CreateStudentAndGuardianDTO,
      params: RequestParams = {}
    ) =>
      this.request<CreateStudentAndGuardianResultDTO, HTTPValidationError>({
        path: `/api/v1/students/with-guardian`,
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
     * @tags students, api-cometa
     * @name GetMainStudentApiV1StudentsStudentIdGet
     * @summary Get Main Student
     * @request GET:/api/v1/students/{student_id}
     * @secure
     */
    getMainStudentApiV1StudentsStudentIdGet: (studentId: string, params: RequestParams = {}) =>
      this.request<MainStudentEntity, HTTPValidationError>({
        path: `/api/v1/students/${studentId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags students, api-cometa
     * @name UpdateMainStudentApiV1StudentsStudentIdPatch
     * @summary Update Main Student
     * @request PATCH:/api/v1/students/{student_id}
     * @secure
     */
    updateMainStudentApiV1StudentsStudentIdPatch: (
      studentId: string,
      data: StudentUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<MainStudentEntity, HTTPValidationError>({
        path: `/api/v1/students/${studentId}`,
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
     * @tags students, api-cometa
     * @name DeleteStudentApiV1StudentsStudentIdDelete
     * @summary Delete Student
     * @request DELETE:/api/v1/students/{student_id}
     * @secure
     */
    deleteStudentApiV1StudentsStudentIdDelete: (studentId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/students/${studentId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags students, api-cometa
     * @name EnrollStudentApiV1StudentsStudentIdEnrollPost
     * @summary Enroll Student
     * @request POST:/api/v1/students/{student_id}/enroll
     * @secure
     */
    enrollStudentApiV1StudentsStudentIdEnrollPost: (
      studentId: string,
      data: EnrollmentStudentDTO,
      params: RequestParams = {}
    ) =>
      this.request<EnrollmentStudentResultDTO, HTTPValidationError>({
        path: `/api/v1/students/${studentId}/enroll`,
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
     * @tags students, api-cometa
     * @name UpdateMainStudentPhotoApiV1StudentsStudentIdPhotoPut
     * @summary Update Main Student Photo
     * @request PUT:/api/v1/students/{student_id}/photo
     * @secure
     */
    updateMainStudentPhotoApiV1StudentsStudentIdPhotoPut: (
      studentId: string,
      data: BodyUpdateMainStudentPhotoApiV1StudentsStudentIdPhotoPut,
      params: RequestParams = {}
    ) =>
      this.request<MainStudentEntity, HTTPValidationError>({
        path: `/api/v1/students/${studentId}/photo`,
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
     * @tags students, api-cometa
     * @name GetStudentGuardiansApiV1StudentsStudentIdGuardiansGet
     * @summary Get Student Guardians
     * @request GET:/api/v1/students/{student_id}/guardians
     * @secure
     */
    getStudentGuardiansApiV1StudentsStudentIdGuardiansGet: (studentId: string, params: RequestParams = {}) =>
      this.request<GuardianEntity[], HTTPValidationError>({
        path: `/api/v1/students/${studentId}/guardians`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags students, api-cometa
     * @name UpdateCorrelativeApiV1StudentsStudentIdCorrelativePost
     * @summary Update Correlative
     * @request POST:/api/v1/students/{student_id}/correlative
     * @secure
     */
    updateCorrelativeApiV1StudentsStudentIdCorrelativePost: (studentId: string, params: RequestParams = {}) =>
      this.request<UpdateCorrelativeResultDTO, HTTPValidationError>({
        path: `/api/v1/students/${studentId}/correlative`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags guardians, api-cometa
     * @name CreateGuardianApiV1GuardiansPost
     * @summary Create Guardian
     * @request POST:/api/v1/guardians/
     * @secure
     */
    createGuardianApiV1GuardiansPost: (data: GuardianCreateDTO, params: RequestParams = {}) =>
      this.request<GuardianEntity, HTTPValidationError>({
        path: `/api/v1/guardians/`,
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
     * @tags guardians, api-cometa
     * @name GetGuardiansApiV1GuardiansGet
     * @summary Get Guardians
     * @request GET:/api/v1/guardians/
     * @secure
     */
    getGuardiansApiV1GuardiansGet: (
      query?: {
        /** Id */
        id?: string | null;
        /** Student Id */
        student_id?: string | null;
        /** Email */
        email?: string | null;
        /** Phone */
        phone?: string | null;
        /** Ids */
        ids?: string[] | null;
        /**
         * Include Deleted
         * @default false
         */
        include_deleted?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<GuardianEntity[], HTTPValidationError>({
        path: `/api/v1/guardians/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags guardians, api-cometa
     * @name GetGuardianApiV1GuardiansGuardianIdGet
     * @summary Get Guardian
     * @request GET:/api/v1/guardians/{guardian_id}
     * @secure
     */
    getGuardianApiV1GuardiansGuardianIdGet: (guardianId: string, params: RequestParams = {}) =>
      this.request<GuardianEntity, HTTPValidationError>({
        path: `/api/v1/guardians/${guardianId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags guardians, api-cometa
     * @name UpdateGuardianApiV1GuardiansGuardianIdPatch
     * @summary Update Guardian
     * @request PATCH:/api/v1/guardians/{guardian_id}
     * @secure
     */
    updateGuardianApiV1GuardiansGuardianIdPatch: (
      guardianId: string,
      data: GuardianUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<GuardianEntity, HTTPValidationError>({
        path: `/api/v1/guardians/${guardianId}`,
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
     * @tags guardians, api-cometa
     * @name DeleteGuardianApiV1GuardiansGuardianIdDelete
     * @summary Delete Guardian
     * @request DELETE:/api/v1/guardians/{guardian_id}
     * @secure
     */
    deleteGuardianApiV1GuardiansGuardianIdDelete: (guardianId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/guardians/${guardianId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags student-guardian-links, api-cometa
     * @name UpsertStudentGuardianLinkApiV1StudentGuardianLinksPut
     * @summary Upsert Student Guardian Link
     * @request PUT:/api/v1/student-guardian-links/
     * @secure
     */
    upsertStudentGuardianLinkApiV1StudentGuardianLinksPut: (
      data: StudentGuardianLinkUpsertInputDTO,
      params: RequestParams = {}
    ) =>
      this.request<StudentGuardianLinkUpsertResultDTO, HTTPValidationError>({
        path: `/api/v1/student-guardian-links/`,
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
     * @tags table_config
     * @name GetTableConfigsApiV1TableConfigGet
     * @summary Get Table Configs
     * @request GET:/api/v1/table_config/
     * @secure
     */
    getTableConfigsApiV1TableConfigGet: (
      query: {
        /**
         * User Id
         * @format uuid
         */
        user_id: string;
        /** Table Name */
        table_name: string;
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<TableConfigEntity[], HTTPValidationError>({
        path: `/api/v1/table_config/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags table_config
     * @name UpsertTableConfigApiV1TableConfigPost
     * @summary Upsert Table Config
     * @request POST:/api/v1/table_config/
     * @secure
     */
    upsertTableConfigApiV1TableConfigPost: (data: TableConfigUpsertDTO, params: RequestParams = {}) =>
      this.request<TableConfigEntity, HTTPValidationError>({
        path: `/api/v1/table_config/`,
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
     * @tags inscriptions
     * @name ListInscriptionsApiV1InscriptionGet
     * @summary List Inscriptions
     * @request GET:/api/v1/inscription/
     * @secure
     */
    listInscriptionsApiV1InscriptionGet: (
      query: {
        /**
         * Page
         * @min 1
         * @max 100
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @min 1
         * @max 100
         * @default 50
         */
        limit?: number;
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
        /** Inscription Status */
        inscription_status?: string[] | null;
        /** Section Ids */
        section_ids?: string[] | null;
        /** Group By */
        group_by?: string | null;
        /** Order By */
        order_by?: string | null;
        /** Search */
        search?: string | null;
        /** Student State */
        student_state?: string[] | null;
        /** Is Assigned */
        is_assigned?: boolean | null;
        /** Tab */
        tab?: 'reinscriptions' | 'new_inscriptions';
        /** Payment Status */
        payment_status?: string[] | null;
        /** Is Data Completed */
        is_data_completed?: boolean | null;
        /** Are Consentments Completed */
        are_consentments_completed?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<
        PageResponseInscriptionEntity | Record<string, SrcStudentsEntitiesInscriptionEntity[]>,
        HTTPValidationError
      >({
        path: `/api/v1/inscription/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions
     * @name GetSummaryListApiV1InscriptionSummaryListGet
     * @summary Get Summary List
     * @request GET:/api/v1/inscription/summary-list
     * @secure
     */
    getSummaryListApiV1InscriptionSummaryListGet: (
      query: {
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
        /** Inscription Status */
        inscription_status?: string[] | null;
        /** Section Ids */
        section_ids?: string[] | null;
        /** Group By */
        group_by?: string | null;
        /** Order By */
        order_by?: string | null;
        /** Search */
        search?: string | null;
        /** Student State */
        student_state?: string[] | null;
        /** Is Assigned */
        is_assigned?: boolean | null;
        /** Tab */
        tab?: 'reinscriptions' | 'new_inscriptions';
        /** Payment Status */
        payment_status?: string[] | null;
        /** Is Data Completed */
        is_data_completed?: boolean | null;
        /** Are Consentments Completed */
        are_consentments_completed?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<InscriptionGradeSummaryDTO[], HTTPValidationError>({
        path: `/api/v1/inscription/summary-list`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions
     * @name ListFiltersApiV1InscriptionFiltersGet
     * @summary List Filters
     * @request GET:/api/v1/inscription/filters
     * @secure
     */
    listFiltersApiV1InscriptionFiltersGet: (
      query: {
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<InscriptionFiltersResponseDTO, HTTPValidationError>({
        path: `/api/v1/inscription/filters`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions
     * @name GetSummaryApiV1InscriptionSummaryGet
     * @summary Get Summary
     * @request GET:/api/v1/inscription/summary
     * @secure
     */
    getSummaryApiV1InscriptionSummaryGet: (
      query: {
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<InscriptionSummaryResponseDTO, HTTPValidationError>({
        path: `/api/v1/inscription/summary`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions
     * @name UpdateInscriptionApiV1InscriptionInscriptionIdPatch
     * @summary Update Inscription
     * @request PATCH:/api/v1/inscription/{inscription_id}
     * @secure
     */
    updateInscriptionApiV1InscriptionInscriptionIdPatch: (
      inscriptionId: string,
      data: InscriptionUpdateDTO,
      params: RequestParams = {}
    ) =>
      this.request<SrcStudentsEntitiesInscriptionEntity, HTTPValidationError>({
        path: `/api/v1/inscription/${inscriptionId}`,
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
     * @tags school-cycle-grades
     * @name GetSchoolCycleGradesApiV1SchoolCycleGradesSchoolCycleIdGet
     * @summary Get School Cycle Grades
     * @request GET:/api/v1/school-cycle-grades/{school_cycle_id}
     * @secure
     */
    getSchoolCycleGradesApiV1SchoolCycleGradesSchoolCycleIdGet: (schoolCycleId: string, params: RequestParams = {}) =>
      this.request<SchoolCycleGradeEntity[], HTTPValidationError>({
        path: `/api/v1/school-cycle-grades/${schoolCycleId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school-cycle-grades
     * @name UpsertSchoolCycleGradeApiV1SchoolCycleGradesPost
     * @summary Upsert School Cycle Grade
     * @request POST:/api/v1/school-cycle-grades/
     * @secure
     */
    upsertSchoolCycleGradeApiV1SchoolCycleGradesPost: (data: SchoolCycleGradeDTO[], params: RequestParams = {}) =>
      this.request<SchoolCycleGradeEntity[], HTTPValidationError>({
        path: `/api/v1/school-cycle-grades/`,
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
     * @tags levels
     * @name GetLevelsApiV1LevelsGet
     * @summary Get Levels
     * @request GET:/api/v1/levels/
     * @secure
     */
    getLevelsApiV1LevelsGet: (
      query: {
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcStudentsEntitiesLevelEntity[], HTTPValidationError>({
        path: `/api/v1/levels/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscription_reports
     * @name GetInscriptionReportApiV1InscriptionReportSummaryGet
     * @summary Get Inscription Report
     * @request GET:/api/v1/inscription/report/summary
     * @secure
     */
    getInscriptionReportApiV1InscriptionReportSummaryGet: (
      query: {
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
        /** Inscription Status */
        inscription_status?: string[] | null;
        /** Section Ids */
        section_ids?: string[] | null;
        /** Group By */
        group_by?: string | null;
        /** Order By */
        order_by?: string | null;
        /** Search */
        search?: string | null;
        /** Student State */
        student_state?: string[] | null;
        /** Is Assigned */
        is_assigned?: boolean | null;
        /** Tab */
        tab?: 'reinscriptions' | 'new_inscriptions';
        /** Payment Status */
        payment_status?: string[] | null;
        /** Is Data Completed */
        is_data_completed?: boolean | null;
        /** Are Consentments Completed */
        are_consentments_completed?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/inscription/report/summary`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name CreateFileApiV1FilesSchoolIdPost
     * @summary Create File
     * @request POST:/api/v1/files/{school_id}
     * @secure
     */
    createFileApiV1FilesSchoolIdPost: (
      schoolId: string,
      data: BodyCreateFileApiV1FilesSchoolIdPost,
      params: RequestParams = {}
    ) =>
      this.request<FileEntity, HTTPValidationError>({
        path: `/api/v1/files/${schoolId}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name ListFilesApiV1FilesGet
     * @summary List Files
     * @request GET:/api/v1/files/
     * @secure
     */
    listFilesApiV1FilesGet: (
      query: {
        /**
         * Entity Id
         * @format uuid
         */
        entity_id: string;
        /**
         * Download
         * @default false
         */
        download?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<FileEntity[], HTTPValidationError>({
        path: `/api/v1/files/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name GetFileApiV1FilesFileIdGet
     * @summary Get File
     * @request GET:/api/v1/files/{file_id}
     * @secure
     */
    getFileApiV1FilesFileIdGet: (
      fileId: string,
      query?: {
        /**
         * Download
         * @default false
         */
        download?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<FileEntity, HTTPValidationError>({
        path: `/api/v1/files/${fileId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name UpdateFileApiV1FilesFileIdPatch
     * @summary Update File
     * @request PATCH:/api/v1/files/{file_id}
     * @secure
     */
    updateFileApiV1FilesFileIdPatch: (fileId: string, data: UpdateFileDTO, params: RequestParams = {}) =>
      this.request<FileEntity, HTTPValidationError>({
        path: `/api/v1/files/${fileId}`,
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
     * @tags files
     * @name DeleteFileApiV1FilesPkDelete
     * @summary Delete File
     * @request DELETE:/api/v1/files/{pk}
     * @secure
     */
    deleteFileApiV1FilesPkDelete: (pk: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/files/${pk}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name CreateFileDetailApiV1FilesFileDetailFileIdPost
     * @summary Create File Detail
     * @request POST:/api/v1/files/file_detail/{file_id}
     * @secure
     */
    createFileDetailApiV1FilesFileDetailFileIdPost: (
      fileId: string,
      data: BodyCreateFileDetailApiV1FilesFileDetailFileIdPost,
      params: RequestParams = {}
    ) =>
      this.request<FileDetailEntity, HTTPValidationError>({
        path: `/api/v1/files/file_detail/${fileId}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name DeleteFileDetailApiV1FilesFileDetailFileDetailIdDelete
     * @summary Delete File Detail
     * @request DELETE:/api/v1/files/file_detail/{file_detail_id}
     * @secure
     */
    deleteFileDetailApiV1FilesFileDetailFileDetailIdDelete: (fileDetailId: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/files/file_detail/${fileDetailId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name ListCredentialTemplatesApiV1CredentialsTemplatesGet
     * @summary List Credential Templates
     * @request GET:/api/v1/credentials/templates/
     * @secure
     */
    listCredentialTemplatesApiV1CredentialsTemplatesGet: (
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @default 20
         */
        limit?: number;
        /** Id */
        id?: string | null;
        /** School Id */
        school_id?: string | null;
        /** Name */
        name?: string | null;
        type?: CredentialTemplateType | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResponseCredentialTemplateEntity, HTTPValidationError>({
        path: `/api/v1/credentials/templates/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name CreateCredentialTemplateApiV1CredentialsTemplatesPost
     * @summary Create Credential Template
     * @request POST:/api/v1/credentials/templates/
     * @secure
     */
    createCredentialTemplateApiV1CredentialsTemplatesPost: (
      data: CreateCredentialTemplateDTO,
      params: RequestParams = {}
    ) =>
      this.request<CredentialTemplateEntity, HTTPValidationError>({
        path: `/api/v1/credentials/templates/`,
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
     * @tags credentials
     * @name GetCredentialTemplateApiV1CredentialsTemplatesTemplateIdGet
     * @summary Get Credential Template
     * @request GET:/api/v1/credentials/templates/{template_id}
     * @secure
     */
    getCredentialTemplateApiV1CredentialsTemplatesTemplateIdGet: (templateId: string, params: RequestParams = {}) =>
      this.request<CredentialTemplateEntity, HTTPValidationError>({
        path: `/api/v1/credentials/templates/${templateId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name UpdateCredentialTemplateApiV1CredentialsTemplatesTemplateIdPatch
     * @summary Update Credential Template
     * @request PATCH:/api/v1/credentials/templates/{template_id}
     * @secure
     */
    updateCredentialTemplateApiV1CredentialsTemplatesTemplateIdPatch: (
      templateId: string,
      data: UpdateCredentialTemplateDTO,
      params: RequestParams = {}
    ) =>
      this.request<CredentialTemplateEntity, HTTPValidationError>({
        path: `/api/v1/credentials/templates/${templateId}`,
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
     * @tags credentials
     * @name DeleteCredentialTemplateApiV1CredentialsTemplatesTemplateIdDelete
     * @summary Delete Credential Template
     * @request DELETE:/api/v1/credentials/templates/{template_id}
     * @secure
     */
    deleteCredentialTemplateApiV1CredentialsTemplatesTemplateIdDelete: (
      templateId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/credentials/templates/${templateId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Generate a credential PDF based on the specified template. Currently uses mocked student data. Args: template_id: Credential template ID school_id: School ID download: If True, download the file. If False, show it inline in the browser
     *
     * @tags credentials
     * @name MockedGenerateCredentialPdfApiV1CredentialsTemplatesTemplateIdMockedGeneratePdfGet
     * @summary Mocked Generate Credential Pdf
     * @request GET:/api/v1/credentials/templates/{template_id}/mocked-generate-pdf
     * @secure
     */
    mockedGenerateCredentialPdfApiV1CredentialsTemplatesTemplateIdMockedGeneratePdfGet: (
      templateId: string,
      query?: {
        /**
         * School Id
         * School ID
         * @format uuid
         */
        school_id?: string;
        /**
         * Download
         * @default false
         */
        download?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/credentials/templates/${templateId}/mocked-generate-pdf`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Generate credentials ZIP with flexible filtering via inscriptions. Returns ZIP structure: {level_name}/{section_grade}.pdf Args: template_id: Credential template ID dto: Request body containing: - school_id: School ID (required) - level_ids: Optional list of level IDs to filter - section_ids: Optional list of section IDs to filter - student_ids: Optional list of student IDs to filter - school_cycle_id: Optional school cycle ID (defaults to active cycle) - status: Optional inscription status filter (defaults to active inscriptions) Returns: ZIP file organized by level folders containing section PDFs
     *
     * @tags credentials
     * @name GenerateFilteredCredentialsZipApiV1CredentialsTemplatesTemplateIdGenerateFilteredZipPost
     * @summary Generate Filtered Credentials Zip
     * @request POST:/api/v1/credentials/templates/{template_id}/generate-filtered-zip
     * @secure
     */
    generateFilteredCredentialsZipApiV1CredentialsTemplatesTemplateIdGenerateFilteredZipPost: (
      templateId: string,
      data: GenerateFilteredCredentialsDTO,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/credentials/templates/${templateId}/generate-filtered-zip`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Generate credentials ZIP asynchronously. Returns 202 and sends email when ready.
     *
     * @tags credentials
     * @name GenerateFilteredCredentialsZipAsyncApiV1CredentialsTemplatesTemplateIdGenerateFilteredZipAsyncPost
     * @summary Generate Filtered Credentials Zip Async
     * @request POST:/api/v1/credentials/templates/{template_id}/generate-filtered-zip-async
     * @secure
     */
    generateFilteredCredentialsZipAsyncApiV1CredentialsTemplatesTemplateIdGenerateFilteredZipAsyncPost: (
      templateId: string,
      data: GenerateFilteredCredentialsDTO,
      params: RequestParams = {}
    ) =>
      this.request<AsyncCredentialGenerationResponseDTO, HTTPValidationError>({
        path: `/api/v1/credentials/templates/${templateId}/generate-filtered-zip-async`,
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
     * @tags school_configs
     * @name UpsertSchoolConfigApiV1SchoolConfigsPut
     * @summary Upsert School Config
     * @request PUT:/api/v1/school-configs
     * @secure
     */
    upsertSchoolConfigApiV1SchoolConfigsPut: (data: SchoolConfigUpsertDTO, params: RequestParams = {}) =>
      this.request<SchoolConfigEntity, HTTPValidationError>({
        path: `/api/v1/school-configs`,
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
     * @tags school_configs
     * @name GetSchoolConfigApiV1SchoolConfigsSchoolIdGet
     * @summary Get School Config
     * @request GET:/api/v1/school-configs/{school_id}
     * @secure
     */
    getSchoolConfigApiV1SchoolConfigsSchoolIdGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolConfigEntity | null, HTTPValidationError>({
        path: `/api/v1/school-configs/${schoolId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_configs
     * @name DeleteSchoolConfigApiV1SchoolConfigsSchoolIdDelete
     * @summary Delete School Config
     * @request DELETE:/api/v1/school-configs/{school_id}
     * @secure
     */
    deleteSchoolConfigApiV1SchoolConfigsSchoolIdDelete: (schoolId: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/school-configs/${schoolId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name CreateLevelApiV1SchoolsSchoolIdLevelsPost
     * @summary Create Level
     * @request POST:/api/v1/schools/{school_id}/levels/
     * @secure
     */
    createLevelApiV1SchoolsSchoolIdLevelsPost: (schoolId: string, data: CreateLevelDTO, params: RequestParams = {}) =>
      this.request<SrcSchoolsApiDomainEntitiesLevelEntity, HTTPValidationError>({
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
     * @tags schools
     * @name GetLevelsApiV1SchoolsSchoolIdLevelsGet
     * @summary Get Levels
     * @request GET:/api/v1/schools/{school_id}/levels/
     * @secure
     */
    getLevelsApiV1SchoolsSchoolIdLevelsGet: (
      schoolId: string,
      query?: {
        /**
         * Include
         * @default []
         */
        include?: LevelIncludeDTO[];
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesLevelEntity[], HTTPValidationError>({
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
     * @tags schools
     * @name UpdateLevelApiV1SchoolsSchoolIdLevelsLevelIdPatch
     * @summary Update Level
     * @request PATCH:/api/v1/schools/{school_id}/levels/{level_id}
     * @secure
     */
    updateLevelApiV1SchoolsSchoolIdLevelsLevelIdPatch: (
      schoolId: string,
      levelId: string,
      data: UpdateLevelDTO,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesLevelEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}`,
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
     * @tags schools
     * @name GetLevelApiV1SchoolsSchoolIdLevelsLevelIdGet
     * @summary Get Level
     * @request GET:/api/v1/schools/{school_id}/levels/{level_id}
     * @secure
     */
    getLevelApiV1SchoolsSchoolIdLevelsLevelIdGet: (
      schoolId: string,
      levelId: string,
      query?: {
        /**
         * Include
         * @default []
         */
        include?: LevelIncludeDTO[];
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesLevelEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name DeleteLevelApiV1SchoolsSchoolIdLevelsLevelIdDelete
     * @summary Delete Level
     * @request DELETE:/api/v1/schools/{school_id}/levels/{level_id}
     * @secure
     */
    deleteLevelApiV1SchoolsSchoolIdLevelsLevelIdDelete: (
      schoolId: string,
      levelId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name CreateGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesPost
     * @summary Create Grade
     * @request POST:/api/v1/schools/{school_id}/levels/{level_id}/grades
     * @secure
     */
    createGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesPost: (
      schoolId: string,
      levelId: string,
      data: CreateGradeDTO,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesGradeEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades`,
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
     * @tags schools
     * @name GetGradesApiV1SchoolsSchoolIdLevelsLevelIdGradesGet
     * @summary Get Grades
     * @request GET:/api/v1/schools/{school_id}/levels/{level_id}/grades
     * @secure
     */
    getGradesApiV1SchoolsSchoolIdLevelsLevelIdGradesGet: (
      schoolId: string,
      levelId: string,
      query?: {
        /**
         * Include
         * @default []
         */
        include?: GradeIncludeDTO[];
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesGradeEntity[], HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name DeleteGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdDelete
     * @summary Delete Grade
     * @request DELETE:/api/v1/schools/{school_id}/levels/{level_id}/grades/{grade_id}
     * @secure
     */
    deleteGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdDelete: (
      schoolId: string,
      levelId: string,
      gradeId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades/${gradeId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name GetGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGet
     * @summary Get Grade
     * @request GET:/api/v1/schools/{school_id}/levels/{level_id}/grades/{grade_id}
     * @secure
     */
    getGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGet: (
      schoolId: string,
      levelId: string,
      gradeId: string,
      query?: {
        /**
         * Include
         * @default []
         */
        include?: GradeIncludeDTO[];
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesGradeEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades/${gradeId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name CreateGradeAndGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesAndGroupsPost
     * @summary Create Grade And Group
     * @request POST:/api/v1/schools/{school_id}/levels/{level_id}/grades_and_groups
     * @secure
     */
    createGradeAndGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesAndGroupsPost: (
      schoolId: string,
      levelId: string,
      data: CreateGradeAndGroupsDTO,
      params: RequestParams = {}
    ) =>
      this.request<GradeGroupEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades_and_groups`,
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
     * @tags schools
     * @name UpdateGradeAndGroupsApiV1SchoolsSchoolIdLevelsLevelIdGradesAndGroupsPatch
     * @summary Update Grade And Groups
     * @request PATCH:/api/v1/schools/{school_id}/levels/{level_id}/grades_and_groups
     * @secure
     */
    updateGradeAndGroupsApiV1SchoolsSchoolIdLevelsLevelIdGradesAndGroupsPatch: (
      schoolId: string,
      levelId: string,
      data: UpdateGradeAndGroupDTO,
      params: RequestParams = {}
    ) =>
      this.request<GradeGroupEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades_and_groups`,
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
     * @tags schools
     * @name CreateGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsPost
     * @summary Create Group
     * @request POST:/api/v1/schools/{school_id}/levels/{level_id}/grades/{grade_id}/groups
     * @secure
     */
    createGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsPost: (
      schoolId: string,
      levelId: string,
      gradeId: string,
      data: CreateGroupDTO,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesGroupEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades/${gradeId}/groups`,
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
     * @tags schools
     * @name GetGroupsApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGet
     * @summary Get Groups
     * @request GET:/api/v1/schools/{school_id}/levels/{level_id}/grades/{grade_id}/groups
     * @secure
     */
    getGroupsApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGet: (
      schoolId: string,
      levelId: string,
      gradeId: string,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesGroupEntity[], HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades/${gradeId}/groups`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name GetGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGroupIdGet
     * @summary Get Group
     * @request GET:/api/v1/schools/{school_id}/levels/{level_id}/grades/{grade_id}/groups/{group_id}
     * @secure
     */
    getGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGroupIdGet: (
      schoolId: string,
      levelId: string,
      gradeId: string,
      groupId: string,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesGroupEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades/${gradeId}/groups/${groupId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name DeleteGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGroupIdDelete
     * @summary Delete Group
     * @request DELETE:/api/v1/schools/{school_id}/levels/{level_id}/grades/{grade_id}/groups/{group_id}
     * @secure
     */
    deleteGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGroupIdDelete: (
      schoolId: string,
      levelId: string,
      gradeId: string,
      groupId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/levels/${levelId}/grades/${gradeId}/groups/${groupId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name GetCurrentApiV1SchoolsSchoolIdSchoolCyclesCurrentGet
     * @summary Get Current
     * @request GET:/api/v1/schools/{school_id}/school-cycles/current
     * @secure
     */
    getCurrentApiV1SchoolsSchoolIdSchoolCyclesCurrentGet: (
      schoolId: string,
      query?: {
        /**
         * Include
         * @default []
         */
        include?: RequestSchoolCycleIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/school-cycles/current`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name ListApiV1SchoolsSchoolIdSchoolCyclesGet
     * @summary List
     * @request GET:/api/v1/schools/{school_id}/school-cycles/
     * @secure
     */
    listApiV1SchoolsSchoolIdSchoolCyclesGet: (
      schoolId: string,
      query?: {
        /** Name */
        name?: string | null;
        /** Next Id */
        next_id?: string | null;
        /** Is Active */
        is_active?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity[], HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/school-cycles/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name CreateApiV1SchoolsSchoolIdSchoolCyclesPost
     * @summary Create
     * @request POST:/api/v1/schools/{school_id}/school-cycles/
     * @secure
     */
    createApiV1SchoolsSchoolIdSchoolCyclesPost: (
      schoolId: string,
      data: CreateSchoolCycleRequest,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/school-cycles/`,
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
     * @tags schools
     * @name GetApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdGet
     * @summary Get
     * @request GET:/api/v1/schools/{school_id}/school-cycles/{school_cycle_id}
     * @secure
     */
    getApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdGet: (
      schoolId: string,
      schoolCycleId: string,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/school-cycles/${schoolCycleId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name UpdateApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdPut
     * @summary Update
     * @request PUT:/api/v1/schools/{school_id}/school-cycles/{school_cycle_id}
     * @secure
     */
    updateApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdPut: (
      schoolId: string,
      schoolCycleId: string,
      data: UpdateSchoolCycleRequest,
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolCyclesDomainEntitiesSchoolCycleSchoolCycleEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/school-cycles/${schoolCycleId}`,
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
     * @tags schools
     * @name DeleteApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdDelete
     * @summary Delete
     * @request DELETE:/api/v1/schools/{school_id}/school-cycles/{school_cycle_id}
     * @secure
     */
    deleteApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdDelete: (
      schoolId: string,
      schoolCycleId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}/school-cycles/${schoolCycleId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name GetSectionsApiV1SchoolsSectionsGet
     * @summary Get Sections
     * @request GET:/api/v1/schools/sections/
     * @secure
     */
    getSectionsApiV1SchoolsSectionsGet: (
      query?: {
        /** School Id */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcSchoolsApiDomainEntitiesSectionEntity[], HTTPValidationError>({
        path: `/api/v1/schools/sections/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name GetSectionApiV1SchoolsSectionsSectionIdGet
     * @summary Get Section
     * @request GET:/api/v1/schools/sections/{section_id}
     * @secure
     */
    getSectionApiV1SchoolsSectionsSectionIdGet: (sectionId: string, params: RequestParams = {}) =>
      this.request<SrcSchoolsApiDomainEntitiesSectionEntity, HTTPValidationError>({
        path: `/api/v1/schools/sections/${sectionId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name GetSchoolApiV1SchoolsSchoolIdGet
     * @summary Get School
     * @request GET:/api/v1/schools/{school_id}
     * @secure
     */
    getSchoolApiV1SchoolsSchoolIdGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<SchoolEntity, HTTPValidationError>({
        path: `/api/v1/schools/${schoolId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags schools
     * @name CreateSchoolApiV1SchoolsPost
     * @summary Create School
     * @request POST:/api/v1/schools/
     * @secure
     */
    createSchoolApiV1SchoolsPost: (data: CreateSchoolRequestDTO, params: RequestParams = {}) =>
      this.request<SchoolEntity, HTTPValidationError>({
        path: `/api/v1/schools/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Transfer students from one school to another by duplicating student records with all data (including guardians, medical info, etc.). Only cross-school transfers are allowed.
     *
     * @tags backoffice, backoffice
     * @name TransferStudentsApiV1BackofficeTransferStudentsPost
     * @summary Transfer students between schools
     * @request POST:/api/v1/backoffice/transfer-students
     * @secure
     */
    transferStudentsApiV1BackofficeTransferStudentsPost: (
      data: TransferStudentsRequestDTO,
      params: RequestParams = {}
    ) =>
      this.request<TransferredStudentResponseDTO[], HTTPValidationError>({
        path: `/api/v1/backoffice/transfer-students`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Process enrollment codes from CSV file and return a list of enrollment data
     *
     * @tags backoffice, backoffice
     * @name ProcessEnrollmentCodesApiV1BackofficeInscriptionsProcessEnrollmentCodesCsvPost
     * @summary Process enrollment codes from CSV file
     * @request POST:/api/v1/backoffice/inscriptions/process-enrollment-codes-csv
     * @secure
     */
    processEnrollmentCodesApiV1BackofficeInscriptionsProcessEnrollmentCodesCsvPost: (
      query: {
        /** School Cycle Id */
        school_cycle_id: string;
        /**
         * Header
         * @default false
         */
        header?: boolean;
      },
      data: BodyProcessEnrollmentCodesApiV1BackofficeInscriptionsProcessEnrollmentCodesCsvPost,
      params: RequestParams = {}
    ) =>
      this.request<InscriptionEnrollmentResponseDTO[], HTTPValidationError>({
        path: `/api/v1/backoffice/inscriptions/process-enrollment-codes-csv`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, course_groups
     * @name ListCourseGroupsApiV1AcademicCourseGroupsGet
     * @summary List Course Groups
     * @request GET:/api/v1/academic/course-groups/
     * @secure
     */
    listCourseGroupsApiV1AcademicCourseGroupsGet: (
      query: {
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<CourseGroupEntity[], HTTPValidationError>({
        path: `/api/v1/academic/course-groups/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, course_groups
     * @name CreateCourseGroupApiV1AcademicCourseGroupsPost
     * @summary Create Course Group
     * @request POST:/api/v1/academic/course-groups/
     * @secure
     */
    createCourseGroupApiV1AcademicCourseGroupsPost: (data: CreateCourseGroupDTO, params: RequestParams = {}) =>
      this.request<CourseGroupEntity, HTTPValidationError>({
        path: `/api/v1/academic/course-groups/`,
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
     * @tags academic, course_groups
     * @name GetCourseGroupApiV1AcademicCourseGroupsCourseGroupIdGet
     * @summary Get Course Group
     * @request GET:/api/v1/academic/course-groups/{course_group_id}
     * @secure
     */
    getCourseGroupApiV1AcademicCourseGroupsCourseGroupIdGet: (courseGroupId: string, params: RequestParams = {}) =>
      this.request<CourseGroupEntity, HTTPValidationError>({
        path: `/api/v1/academic/course-groups/${courseGroupId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, course_groups
     * @name UpdateCourseGroupApiV1AcademicCourseGroupsCourseGroupIdPatch
     * @summary Update Course Group
     * @request PATCH:/api/v1/academic/course-groups/{course_group_id}
     * @secure
     */
    updateCourseGroupApiV1AcademicCourseGroupsCourseGroupIdPatch: (
      courseGroupId: string,
      data: UpdateCourseGroupDTO,
      params: RequestParams = {}
    ) =>
      this.request<CourseGroupEntity, HTTPValidationError>({
        path: `/api/v1/academic/course-groups/${courseGroupId}`,
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
     * @tags academic, course_groups
     * @name DeleteCourseGroupApiV1AcademicCourseGroupsCourseGroupIdDelete
     * @summary Delete Course Group
     * @request DELETE:/api/v1/academic/course-groups/{course_group_id}
     * @secure
     */
    deleteCourseGroupApiV1AcademicCourseGroupsCourseGroupIdDelete: (
      courseGroupId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/course-groups/${courseGroupId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, courses
     * @name ListCoursesApiV1AcademicCoursesGet
     * @summary List Courses
     * @request GET:/api/v1/academic/courses/
     * @secure
     */
    listCoursesApiV1AcademicCoursesGet: (
      query?: {
        /**
         * Course Group Id
         * Filter by course group ID
         */
        course_group_id?: string | null;
        /**
         * School Id
         * Filter by school ID
         */
        school_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<CourseEntity[], HTTPValidationError>({
        path: `/api/v1/academic/courses/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, courses
     * @name CreateCourseApiV1AcademicCoursesPost
     * @summary Create Course
     * @request POST:/api/v1/academic/courses/
     * @secure
     */
    createCourseApiV1AcademicCoursesPost: (data: CreateCourseDTO, params: RequestParams = {}) =>
      this.request<CourseEntity, HTTPValidationError>({
        path: `/api/v1/academic/courses/`,
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
     * @tags academic, courses
     * @name GetCourseApiV1AcademicCoursesCourseIdGet
     * @summary Get Course
     * @request GET:/api/v1/academic/courses/{course_id}
     * @secure
     */
    getCourseApiV1AcademicCoursesCourseIdGet: (courseId: string, params: RequestParams = {}) =>
      this.request<CourseEntity, HTTPValidationError>({
        path: `/api/v1/academic/courses/${courseId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, courses
     * @name UpdateCourseApiV1AcademicCoursesCourseIdPatch
     * @summary Update Course
     * @request PATCH:/api/v1/academic/courses/{course_id}
     * @secure
     */
    updateCourseApiV1AcademicCoursesCourseIdPatch: (
      courseId: string,
      data: UpdateCourseDTO,
      params: RequestParams = {}
    ) =>
      this.request<CourseEntity, HTTPValidationError>({
        path: `/api/v1/academic/courses/${courseId}`,
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
     * @tags academic, courses
     * @name DeleteCourseApiV1AcademicCoursesCourseIdDelete
     * @summary Delete Course
     * @request DELETE:/api/v1/academic/courses/{course_id}
     * @secure
     */
    deleteCourseApiV1AcademicCoursesCourseIdDelete: (courseId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/courses/${courseId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classrooms
     * @name ListClassroomsApiV1AcademicClassroomsGet
     * @summary List Classrooms
     * @request GET:/api/v1/academic/classrooms/
     * @secure
     */
    listClassroomsApiV1AcademicClassroomsGet: (
      query?: {
        /**
         * Page
         * @default 1
         */
        page?: number;
        /**
         * Limit
         * @default 20
         */
        limit?: number;
        /** Id */
        id?: string | string[] | null;
        /** Course Id */
        course_id?: string | string[] | null;
        /** Grade Id */
        grade_id?: string | string[] | null;
        /** Group Id */
        group_id?: string | string[] | null;
        /** Level Id */
        level_id?: string | string[] | null;
        /** School Cycle Id */
        school_cycle_id?: string | null;
        /** Include */
        include?: ClassroomIncludeEnum[];
        /** Search */
        search?: string | null;
        /** Variant */
        variant?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResponseClassroomEntity, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classrooms
     * @name CreateClassroomApiV1AcademicClassroomsPost
     * @summary Create Classroom
     * @request POST:/api/v1/academic/classrooms/
     * @secure
     */
    createClassroomApiV1AcademicClassroomsPost: (data: CreateClassroomDTO, params: RequestParams = {}) =>
      this.request<ClassroomEntity, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/`,
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
     * @tags academic, classrooms
     * @name CountClassroomsApiV1AcademicClassroomsCountGet
     * @summary Count Classrooms
     * @request GET:/api/v1/academic/classrooms/count
     * @secure
     */
    countClassroomsApiV1AcademicClassroomsCountGet: (
      query?: {
        /**
         * Id
         * Filter by classroom ID
         */
        id?: string | string[] | null;
        /**
         * Course Id
         * Filter by course ID
         */
        course_id?: string | string[] | null;
        /**
         * Grade Id
         * Filter by grade ID
         */
        grade_id?: string | string[] | null;
        /**
         * Group Id
         * Filter by group ID
         */
        group_id?: string | string[] | null;
        /**
         * Level Id
         * Filter by level ID
         */
        level_id?: string | string[] | null;
        /**
         * School Cycle Id
         * Filter by school cycle ID
         */
        school_cycle_id?: string | null;
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ClassroomIncludeEnum[];
        /**
         * Search
         * Search by name
         */
        search?: string | null;
        /**
         * Variant
         * Filter by variant
         */
        variant?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<CountResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/count`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classrooms
     * @name GetClassroomFiltersApiV1AcademicClassroomsFiltersGet
     * @summary Get Classroom Filters
     * @request GET:/api/v1/academic/classrooms/filters
     * @secure
     */
    getClassroomFiltersApiV1AcademicClassroomsFiltersGet: (
      query: {
        /**
         * School Id
         * School ID
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassroomListFilterValuesDTO, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/filters`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classrooms
     * @name GetClassroomApiV1AcademicClassroomsClassroomIdGet
     * @summary Get Classroom
     * @request GET:/api/v1/academic/classrooms/{classroom_id}
     * @secure
     */
    getClassroomApiV1AcademicClassroomsClassroomIdGet: (
      classroomId: string,
      query?: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ClassroomIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassroomEntity, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/${classroomId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classrooms
     * @name UpdateClassroomApiV1AcademicClassroomsClassroomIdPatch
     * @summary Update Classroom
     * @request PATCH:/api/v1/academic/classrooms/{classroom_id}
     * @secure
     */
    updateClassroomApiV1AcademicClassroomsClassroomIdPatch: (
      classroomId: string,
      data: UpdateClassroomDTO,
      params: RequestParams = {}
    ) =>
      this.request<ClassroomEntity, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/${classroomId}`,
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
     * @tags academic, classrooms
     * @name DeleteClassroomApiV1AcademicClassroomsClassroomIdDelete
     * @summary Delete Classroom
     * @request DELETE:/api/v1/academic/classrooms/{classroom_id}
     * @secure
     */
    deleteClassroomApiV1AcademicClassroomsClassroomIdDelete: (classroomId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/classrooms/${classroomId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_student_assignments
     * @name ListClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsGet
     * @summary List Classroom Student Assignments
     * @request GET:/api/v1/academic/classroom-student-assignments/
     * @secure
     */
    listClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsGet: (
      query?: {
        /**
         * Classroom Id
         * Filter by classroom ID
         */
        classroom_id?: string | null;
        /**
         * Student Id
         * Filter by student ID
         */
        student_id?: string | null;
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ClassroomStudentAssignmentIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassroomStudentAssignmentEntity[], HTTPValidationError>({
        path: `/api/v1/academic/classroom-student-assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_student_assignments
     * @name CreateClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsPost
     * @summary Create Classroom Student Assignment
     * @request POST:/api/v1/academic/classroom-student-assignments/
     * @secure
     */
    createClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsPost: (
      data: CreateClassroomStudentAssignmentDTO,
      params: RequestParams = {}
    ) =>
      this.request<ClassroomStudentAssignmentEntity, HTTPValidationError>({
        path: `/api/v1/academic/classroom-student-assignments/`,
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
     * @tags academic, classroom_student_assignments
     * @name GetClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsAssignmentIdGet
     * @summary Get Classroom Student Assignment
     * @request GET:/api/v1/academic/classroom-student-assignments/{assignment_id}
     * @secure
     */
    getClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsAssignmentIdGet: (
      assignmentId: string,
      query?: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ClassroomStudentAssignmentIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassroomStudentAssignmentEntity, HTTPValidationError>({
        path: `/api/v1/academic/classroom-student-assignments/${assignmentId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_student_assignments
     * @name DeleteClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsAssignmentIdDelete
     * @summary Delete Classroom Student Assignment
     * @request DELETE:/api/v1/academic/classroom-student-assignments/{assignment_id}
     * @secure
     */
    deleteClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsAssignmentIdDelete: (
      assignmentId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/classroom-student-assignments/${assignmentId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_student_assignments
     * @name BulkCreateClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsBulkPost
     * @summary Bulk Create Classroom Student Assignments
     * @request POST:/api/v1/academic/classroom-student-assignments/bulk
     * @secure
     */
    bulkCreateClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsBulkPost: (
      data: BulkCreateClassroomStudentAssignmentDTO,
      params: RequestParams = {}
    ) =>
      this.request<ClassroomStudentAssignmentEntity[], HTTPValidationError>({
        path: `/api/v1/academic/classroom-student-assignments/bulk`,
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
     * @tags academic, classroom_teacher_assignments
     * @name ListClassroomTeacherAssignmentsApiV1AcademicClassroomTeacherAssignmentsGet
     * @summary List Classroom Teacher Assignments
     * @request GET:/api/v1/academic/classroom-teacher-assignments/
     * @secure
     */
    listClassroomTeacherAssignmentsApiV1AcademicClassroomTeacherAssignmentsGet: (
      query?: {
        /**
         * Classroom Id
         * Filter by classroom ID
         */
        classroom_id?: string | string[] | null;
        /**
         * Membership Id
         * Filter by membership ID
         */
        membership_id?: string | string[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ClassroomTeacherAssignmentEntity[], HTTPValidationError>({
        path: `/api/v1/academic/classroom-teacher-assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_teacher_assignments
     * @name CreateClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsPost
     * @summary Create Classroom Teacher Assignment
     * @request POST:/api/v1/academic/classroom-teacher-assignments/
     * @secure
     */
    createClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsPost: (
      data: CreateClassroomTeacherAssignmentDTO,
      params: RequestParams = {}
    ) =>
      this.request<ClassroomTeacherAssignmentEntity, HTTPValidationError>({
        path: `/api/v1/academic/classroom-teacher-assignments/`,
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
     * @tags academic, classroom_teacher_assignments
     * @name CountClassroomTeacherAssignmentsApiV1AcademicClassroomTeacherAssignmentsCountGet
     * @summary Count Classroom Teacher Assignments
     * @request GET:/api/v1/academic/classroom-teacher-assignments/count
     * @secure
     */
    countClassroomTeacherAssignmentsApiV1AcademicClassroomTeacherAssignmentsCountGet: (
      query?: {
        /**
         * Classroom Id
         * Filter by classroom ID
         */
        classroom_id?: string | string[] | null;
        /**
         * Membership Id
         * Filter by membership ID
         */
        membership_id?: string | string[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<CountResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/classroom-teacher-assignments/count`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_teacher_assignments
     * @name GetClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsAssignmentIdGet
     * @summary Get Classroom Teacher Assignment
     * @request GET:/api/v1/academic/classroom-teacher-assignments/{assignment_id}
     * @secure
     */
    getClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsAssignmentIdGet: (
      assignmentId: string,
      params: RequestParams = {}
    ) =>
      this.request<ClassroomTeacherAssignmentEntity, HTTPValidationError>({
        path: `/api/v1/academic/classroom-teacher-assignments/${assignmentId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, classroom_teacher_assignments
     * @name DeleteClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsAssignmentIdDelete
     * @summary Delete Classroom Teacher Assignment
     * @request DELETE:/api/v1/academic/classroom-teacher-assignments/{assignment_id}
     * @secure
     */
    deleteClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsAssignmentIdDelete: (
      assignmentId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/classroom-teacher-assignments/${assignmentId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_periods
     * @name ListEvaluationPeriodsApiV1AcademicEvaluationPeriodsGet
     * @summary List Evaluation Periods
     * @request GET:/api/v1/academic/evaluation-periods/
     * @secure
     */
    listEvaluationPeriodsApiV1AcademicEvaluationPeriodsGet: (
      query: {
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
        /** Level Id */
        level_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<EvaluationPeriodEntity[], HTTPValidationError>({
        path: `/api/v1/academic/evaluation-periods/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_periods
     * @name CreateEvaluationPeriodApiV1AcademicEvaluationPeriodsPost
     * @summary Create Evaluation Period
     * @request POST:/api/v1/academic/evaluation-periods/
     * @secure
     */
    createEvaluationPeriodApiV1AcademicEvaluationPeriodsPost: (
      data: CreateEvaluationPeriodDTO,
      params: RequestParams = {}
    ) =>
      this.request<EvaluationPeriodEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-periods/`,
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
     * @tags academic, evaluation_periods
     * @name GetEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdGet
     * @summary Get Evaluation Period
     * @request GET:/api/v1/academic/evaluation-periods/{evaluation_period_id}
     * @secure
     */
    getEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdGet: (
      evaluationPeriodId: string,
      params: RequestParams = {}
    ) =>
      this.request<EvaluationPeriodEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-periods/${evaluationPeriodId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_periods
     * @name UpdateEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdPatch
     * @summary Update Evaluation Period
     * @request PATCH:/api/v1/academic/evaluation-periods/{evaluation_period_id}
     * @secure
     */
    updateEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdPatch: (
      evaluationPeriodId: string,
      data: UpdateEvaluationPeriodDTO,
      params: RequestParams = {}
    ) =>
      this.request<EvaluationPeriodEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-periods/${evaluationPeriodId}`,
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
     * @tags academic, evaluation_periods
     * @name DeleteEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdDelete
     * @summary Delete Evaluation Period
     * @request DELETE:/api/v1/academic/evaluation-periods/{evaluation_period_id}
     * @secure
     */
    deleteEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdDelete: (
      evaluationPeriodId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-periods/${evaluationPeriodId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_scores
     * @name CountEvaluationScoresApiV1AcademicEvaluationScoresCountGet
     * @summary Count Evaluation Scores
     * @request GET:/api/v1/academic/evaluation-scores/count
     * @secure
     */
    countEvaluationScoresApiV1AcademicEvaluationScoresCountGet: (
      query: {
        /**
         * Classroom Student Assignment Id
         * Classroom Student Assignment ID to get scores for
         * @format uuid
         */
        classroom_student_assignment_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<CountResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-scores/count`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_scores
     * @name ListEvaluationScoresByAssignmentApiV1AcademicEvaluationScoresByAssignmentGet
     * @summary List Evaluation Scores By Assignment
     * @request GET:/api/v1/academic/evaluation-scores/by-assignment
     * @secure
     */
    listEvaluationScoresByAssignmentApiV1AcademicEvaluationScoresByAssignmentGet: (
      query: {
        /**
         * Classroom Id
         * Filter by classroom ID
         */
        classroom_id?: string | null;
        /**
         * Student Id
         * Filter by student ID
         */
        student_id?: string | null;
        /**
         * School Cycle Id
         * Filter by school cycle ID
         */
        school_cycle_id?: string | null;
        /** Filter by criteria */
        criteria: EvaluationScoresByAssignmentCriteriaEnum;
      },
      params: RequestParams = {}
    ) =>
      this.request<ScoresByAssignmentDTO, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-scores/by-assignment`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_scores
     * @name GetEvaluationScoresStatsByOriginApiV1AcademicEvaluationScoresStatsByOriginGet
     * @summary Get Evaluation Scores Stats By Origin
     * @request GET:/api/v1/academic/evaluation-scores/stats-by-origin
     * @secure
     */
    getEvaluationScoresStatsByOriginApiV1AcademicEvaluationScoresStatsByOriginGet: (
      query: {
        /**
         * Classroom Id
         * Filter by classroom ID
         */
        classroom_id?: string | null;
        /**
         * Level Id
         * Filter by level ID
         */
        level_id?: string | null;
        /**
         * School Cycle Id
         * Filter by school cycle ID
         */
        school_cycle_id?: string | null;
        /** Filter by criteria */
        criteria: EvaluationScoresStatsByOriginCriteriaEnum;
      },
      params: RequestParams = {}
    ) =>
      this.request<StatsByOriginResultDTO[], HTTPValidationError>({
        path: `/api/v1/academic/evaluation-scores/stats-by-origin`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_scores
     * @name GetEvaluationScoreApiV1AcademicEvaluationScoresEvaluationScoreIdGet
     * @summary Get Evaluation Score
     * @request GET:/api/v1/academic/evaluation-scores/{evaluation_score_id}
     * @secure
     */
    getEvaluationScoreApiV1AcademicEvaluationScoresEvaluationScoreIdGet: (
      evaluationScoreId: string,
      params: RequestParams = {}
    ) =>
      this.request<EvaluationScoreEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-scores/${evaluationScoreId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_scores
     * @name DeleteEvaluationScoreApiV1AcademicEvaluationScoresEvaluationScoreIdDelete
     * @summary Delete Evaluation Score
     * @request DELETE:/api/v1/academic/evaluation-scores/{evaluation_score_id}
     * @secure
     */
    deleteEvaluationScoreApiV1AcademicEvaluationScoresEvaluationScoreIdDelete: (
      evaluationScoreId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-scores/${evaluationScoreId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_scores
     * @name UpsertEvaluationScoreApiV1AcademicEvaluationScoresPut
     * @summary Upsert Evaluation Score
     * @request PUT:/api/v1/academic/evaluation-scores/
     * @secure
     */
    upsertEvaluationScoreApiV1AcademicEvaluationScoresPut: (
      data: UpsertEvaluationScoreDTO,
      params: RequestParams = {}
    ) =>
      this.request<EvaluationScoreEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-scores/`,
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
     * @tags academic, evaluation_notes
     * @name CountEvaluationNotesApiV1AcademicEvaluationNotesCountGet
     * @summary Count Evaluation Notes
     * @request GET:/api/v1/academic/evaluation-notes/count
     * @secure
     */
    countEvaluationNotesApiV1AcademicEvaluationNotesCountGet: (
      query: {
        /**
         * Classroom Student Assignment Id
         * Classroom Student Assignment ID to get notes for
         * @format uuid
         */
        classroom_student_assignment_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<CountResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-notes/count`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_notes
     * @name ListEvaluationNotesByAssignmentApiV1AcademicEvaluationNotesByAssignmentGet
     * @summary List Evaluation Notes By Assignment
     * @request GET:/api/v1/academic/evaluation-notes/by-assignment
     * @secure
     */
    listEvaluationNotesByAssignmentApiV1AcademicEvaluationNotesByAssignmentGet: (
      query: {
        /** Criteria: student or classroom */
        criteria: EvaluationNotesByAssignmentCriteriaEnum;
        /**
         * Classroom Id
         * Classroom ID (for classroom criteria)
         */
        classroom_id?: string | null;
        /**
         * Student Id
         * Student ID (for student criteria)
         */
        student_id?: string | null;
        /**
         * School Cycle Id
         * School cycle ID (for student criteria)
         */
        school_cycle_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<NotesByAssignmentDTO, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-notes/by-assignment`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_notes
     * @name GetEvaluationNoteApiV1AcademicEvaluationNotesEvaluationNoteIdGet
     * @summary Get Evaluation Note
     * @request GET:/api/v1/academic/evaluation-notes/{evaluation_note_id}
     * @secure
     */
    getEvaluationNoteApiV1AcademicEvaluationNotesEvaluationNoteIdGet: (
      evaluationNoteId: string,
      params: RequestParams = {}
    ) =>
      this.request<EvaluationNoteEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-notes/${evaluationNoteId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_notes
     * @name DeleteEvaluationNoteApiV1AcademicEvaluationNotesEvaluationNoteIdDelete
     * @summary Delete Evaluation Note
     * @request DELETE:/api/v1/academic/evaluation-notes/{evaluation_note_id}
     * @secure
     */
    deleteEvaluationNoteApiV1AcademicEvaluationNotesEvaluationNoteIdDelete: (
      evaluationNoteId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-notes/${evaluationNoteId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, evaluation_notes
     * @name UpsertEvaluationNoteApiV1AcademicEvaluationNotesPut
     * @summary Upsert Evaluation Note
     * @request PUT:/api/v1/academic/evaluation-notes/
     * @secure
     */
    upsertEvaluationNoteApiV1AcademicEvaluationNotesPut: (data: UpsertEvaluationNoteDTO, params: RequestParams = {}) =>
      this.request<EvaluationNoteEntity, HTTPValidationError>({
        path: `/api/v1/academic/evaluation-notes/`,
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
     * @tags academic, academic_configs
     * @name ListAcademicConfigsApiV1AcademicAcademicConfigsGet
     * @summary List Academic Configs
     * @request GET:/api/v1/academic/academic-configs/
     * @secure
     */
    listAcademicConfigsApiV1AcademicAcademicConfigsGet: (
      query?: {
        /**
         * Id
         * Filter by level config ID
         */
        id?: string | null;
        /**
         * Origin Type
         * Filter by origin type
         */
        origin_type?: AcademicConfigOriginTypeEnum | null;
        /**
         * Origin Id
         * Filter by origin ID
         */
        origin_id?: string | string[] | null;
        /**
         * School Cycle Id
         * Filter by school cycle ID
         */
        school_cycle_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<AcademicConfigEntity[], HTTPValidationError>({
        path: `/api/v1/academic/academic-configs/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, academic_configs
     * @name UpsertAcademicConfigApiV1AcademicAcademicConfigsPut
     * @summary Upsert Academic Config
     * @request PUT:/api/v1/academic/academic-configs/
     * @secure
     */
    upsertAcademicConfigApiV1AcademicAcademicConfigsPut: (data: UpsertAcademicConfigDTO, params: RequestParams = {}) =>
      this.request<AcademicConfigEntity, HTTPValidationError>({
        path: `/api/v1/academic/academic-configs/`,
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
     * @tags academic, academic_configs
     * @name GetAcademicConfigApiV1AcademicAcademicConfigsAcademicConfigIdGet
     * @summary Get Academic Config
     * @request GET:/api/v1/academic/academic-configs/{academic_config_id}
     * @secure
     */
    getAcademicConfigApiV1AcademicAcademicConfigsAcademicConfigIdGet: (
      academicConfigId: string,
      params: RequestParams = {}
    ) =>
      this.request<AcademicConfigEntity, HTTPValidationError>({
        path: `/api/v1/academic/academic-configs/${academicConfigId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, academic_configs
     * @name DeleteAcademicConfigApiV1AcademicAcademicConfigsAcademicConfigIdDelete
     * @summary Delete Academic Config
     * @request DELETE:/api/v1/academic/academic-configs/{academic_config_id}
     * @secure
     */
    deleteAcademicConfigApiV1AcademicAcademicConfigsAcademicConfigIdDelete: (
      academicConfigId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/academic-configs/${academicConfigId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, score_card_submissions
     * @name CreateScoreCardSubmissionApiV1AcademicScoreCardSubmissionsPost
     * @summary Create Score Card Submission
     * @request POST:/api/v1/academic/score-card-submissions/
     * @secure
     */
    createScoreCardSubmissionApiV1AcademicScoreCardSubmissionsPost: (
      data: CreateScoreCardSubmissionDTO,
      params: RequestParams = {}
    ) =>
      this.request<ScoreCardSubmissionEntity, HTTPValidationError>({
        path: `/api/v1/academic/score-card-submissions/`,
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
     * @tags academic, score_card_submissions
     * @name ListScoreCardSubmissionsApiV1AcademicScoreCardSubmissionsGet
     * @summary List Score Card Submissions
     * @request GET:/api/v1/academic/score-card-submissions/
     * @secure
     */
    listScoreCardSubmissionsApiV1AcademicScoreCardSubmissionsGet: (
      query?: {
        /**
         * Evaluation Period Id
         * Filter by evaluation period ID
         */
        evaluation_period_id?: string | null;
        /**
         * Requested By Id
         * Filter by user who requested the submission
         */
        requested_by_id?: string | null;
        /**
         * Level Id
         * Filter by level ID
         */
        level_id?: string | null;
        /**
         * School Cycle Id
         * Filter by school cycle ID
         */
        school_cycle_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ScoreCardSubmissionEntity[], HTTPValidationError>({
        path: `/api/v1/academic/score-card-submissions/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, score_card_submissions
     * @name GetScoreCardSubmissionReportApiV1AcademicScoreCardSubmissionsReportGet
     * @summary Get Score Card Submission Report
     * @request GET:/api/v1/academic/score-card-submissions/report
     * @secure
     */
    getScoreCardSubmissionReportApiV1AcademicScoreCardSubmissionsReportGet: (
      query: {
        /**
         * Campaign Id
         * Campaign ID for the report
         * @minLength 23
         */
        campaign_id: string;
        /**
         * Score Card Submission Id
         * Score card submission ID for the report
         */
        score_card_submission_id: string;
        /**
         * School Id
         * School ID for the report
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/academic/score-card-submissions/report`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, score_card_submissions
     * @name GetScoreCardSubmissionApiV1AcademicScoreCardSubmissionsSubmissionIdGet
     * @summary Get Score Card Submission
     * @request GET:/api/v1/academic/score-card-submissions/{submission_id}
     * @secure
     */
    getScoreCardSubmissionApiV1AcademicScoreCardSubmissionsSubmissionIdGet: (
      submissionId: string,
      params: RequestParams = {}
    ) =>
      this.request<ScoreCardSubmissionEntity, HTTPValidationError>({
        path: `/api/v1/academic/score-card-submissions/${submissionId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, teacher_profiles
     * @name ListTeacherProfilesApiV1AcademicTeacherProfilesGet
     * @summary List Teacher Profiles
     * @request GET:/api/v1/academic/teacher-profiles/
     * @secure
     */
    listTeacherProfilesApiV1AcademicTeacherProfilesGet: (
      query?: {
        /**
         * School Id
         * Filter teacher profiles by school ID
         */
        school_id?: string | null;
        /**
         * Membership Id
         * Filter teacher profiles by membership ID
         */
        membership_id?: string | string[] | null;
        /**
         * Role
         * Filter teacher profiles by role
         */
        role?: string | string[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<TeacherProfileEntity[], HTTPValidationError>({
        path: `/api/v1/academic/teacher-profiles/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, teacher_profiles
     * @name CreateTeacherProfileApiV1AcademicTeacherProfilesPost
     * @summary Create Teacher Profile
     * @request POST:/api/v1/academic/teacher-profiles/
     * @secure
     */
    createTeacherProfileApiV1AcademicTeacherProfilesPost: (data: CreateTeacherProfileDTO, params: RequestParams = {}) =>
      this.request<TeacherProfileEntity, HTTPValidationError>({
        path: `/api/v1/academic/teacher-profiles/`,
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
     * @tags academic, teacher_profiles
     * @name GetTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdGet
     * @summary Get Teacher Profile
     * @request GET:/api/v1/academic/teacher-profiles/{teacher_profile_id}
     * @secure
     */
    getTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdGet: (
      teacherProfileId: string,
      params: RequestParams = {}
    ) =>
      this.request<TeacherProfileEntity, HTTPValidationError>({
        path: `/api/v1/academic/teacher-profiles/${teacherProfileId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, teacher_profiles
     * @name UpdateTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdPatch
     * @summary Update Teacher Profile
     * @request PATCH:/api/v1/academic/teacher-profiles/{teacher_profile_id}
     * @secure
     */
    updateTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdPatch: (
      teacherProfileId: string,
      data: UpdateTeacherProfileDTO,
      params: RequestParams = {}
    ) =>
      this.request<TeacherProfileEntity, HTTPValidationError>({
        path: `/api/v1/academic/teacher-profiles/${teacherProfileId}`,
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
     * @tags academic, teacher_profiles
     * @name DeleteTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdDelete
     * @summary Delete Teacher Profile
     * @request DELETE:/api/v1/academic/teacher-profiles/{teacher_profile_id}
     * @secure
     */
    deleteTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdDelete: (
      teacherProfileId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/teacher-profiles/${teacherProfileId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, score_cards
     * @name GenerateScoreCardApiV1AcademicScoreCardsGet
     * @summary Generate Score Card
     * @request GET:/api/v1/academic/score-cards/
     * @secure
     */
    generateScoreCardApiV1AcademicScoreCardsGet: (
      query: {
        /**
         * Student Id
         * Student ID to generate score card for
         * @format uuid
         */
        student_id: string;
        /**
         * School Cycle Id
         * School cycle ID to generate score card for
         * @format uuid
         */
        school_cycle_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ScoreCardDownloadResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/score-cards/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, score_cards
     * @name GenerateSepReportApiV1AcademicScoreCardsSepReportGet
     * @summary Generate Sep Report
     * @request GET:/api/v1/academic/score-cards/sep/report
     * @secure
     */
    generateSepReportApiV1AcademicScoreCardsSepReportGet: (
      query: {
        /**
         * Level Id
         * Level ID to filter evaluation scores by course group
         * @format uuid
         */
        level_id: string;
        /**
         * School Cycle Id
         * School Cycle ID to filter evaluation scores by course group
         * @format uuid
         */
        school_cycle_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/academic/score-cards/sep/report`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, score_cards
     * @name GetSepReportDataApiV1AcademicScoreCardsSepGet
     * @summary Get Sep Report Data
     * @request GET:/api/v1/academic/score-cards/sep
     * @secure
     */
    getSepReportDataApiV1AcademicScoreCardsSepGet: (
      query: {
        /**
         * Level Id
         * Level ID to filter evaluation scores by course group
         * @format uuid
         */
        level_id: string;
        /**
         * School Cycle Id
         * School Cycle ID to filter evaluation scores by course group
         * @format uuid
         */
        school_cycle_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<SEPReportResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/score-cards/sep`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_sessions
     * @name ListAttendanceSessionsApiV1AcademicAttendanceSessionsGet
     * @summary List Attendance Sessions
     * @request GET:/api/v1/academic/attendance/sessions/
     * @secure
     */
    listAttendanceSessionsApiV1AcademicAttendanceSessionsGet: (
      query?: {
        /**
         * School Id
         * Filter by school ID
         */
        school_id?: string | null;
        /**
         * Evaluation Period Id
         * Filter by evaluation period ID
         */
        evaluation_period_id?: string | null;
        /**
         * Date
         * Filter by exact date
         */
        date?: string | null;
        /**
         * Context Id
         * Filter by context ID (group or classroom)
         */
        context_id?: string | null;
        /**
         * Context Type
         * Filter by context type (group or classroom)
         */
        context_type?: AttendanceContextTypeEnum | null;
        /**
         * Is Closed
         * Filter by closed status
         */
        is_closed?: boolean | null;
        /**
         * Taken By Id
         * Filter by user who took attendance
         */
        taken_by_id?: string | null;
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: AttendanceSessionIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<AttendanceSessionEntity[], HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_sessions
     * @name CreateAttendanceSessionApiV1AcademicAttendanceSessionsPost
     * @summary Create Attendance Session
     * @request POST:/api/v1/academic/attendance/sessions/
     * @secure
     */
    createAttendanceSessionApiV1AcademicAttendanceSessionsPost: (
      data: CreateAttendanceSessionDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceSessionEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/`,
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
     * @tags academic, attendance_sessions
     * @name GetAvailableStudentsApiV1AcademicAttendanceSessionsAvailableStudentsGet
     * @summary Get Available Students
     * @request GET:/api/v1/academic/attendance/sessions/available-students
     * @secure
     */
    getAvailableStudentsApiV1AcademicAttendanceSessionsAvailableStudentsGet: (
      query?: {
        /**
         * Session Id
         * Attendance session ID (optional if context_id and context_type provided)
         */
        session_id?: string | null;
        /**
         * Context Id
         * Context ID - group or classroom (required if no session_id)
         */
        context_id?: string | null;
        /**
         * Context Type
         * Context type - group or classroom (required if no session_id)
         */
        context_type?: AttendanceContextTypeEnum | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<AvailableStudentsForAttendanceDTO[], HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/available-students`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_sessions
     * @name GetAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdGet
     * @summary Get Attendance Session
     * @request GET:/api/v1/academic/attendance/sessions/{session_id}
     * @secure
     */
    getAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdGet: (
      sessionId: string,
      query?: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: AttendanceSessionIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<AttendanceSessionEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/${sessionId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_sessions
     * @name UpdateAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdPatch
     * @summary Update Attendance Session
     * @request PATCH:/api/v1/academic/attendance/sessions/{session_id}
     * @secure
     */
    updateAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdPatch: (
      sessionId: string,
      data: UpdateAttendanceSessionDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceSessionEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/${sessionId}`,
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
     * @tags academic, attendance_sessions
     * @name DeleteAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdDelete
     * @summary Delete Attendance Session
     * @request DELETE:/api/v1/academic/attendance/sessions/{session_id}
     * @secure
     */
    deleteAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdDelete: (
      sessionId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/${sessionId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_sessions
     * @name BulkCreateAttendanceSessionApiV1AcademicAttendanceSessionsBulkPost
     * @summary Bulk Create Attendance Session
     * @request POST:/api/v1/academic/attendance/sessions/bulk
     * @secure
     */
    bulkCreateAttendanceSessionApiV1AcademicAttendanceSessionsBulkPost: (
      data: BulkCreateAttendanceSessionDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceSessionEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/sessions/bulk`,
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
     * @tags academic, attendance_records
     * @name ListAttendanceRecordsApiV1AcademicAttendanceRecordsGet
     * @summary List Attendance Records
     * @request GET:/api/v1/academic/attendance/records/
     * @secure
     */
    listAttendanceRecordsApiV1AcademicAttendanceRecordsGet: (
      query?: {
        /**
         * Session Id
         * Filter by session ID
         */
        session_id?: string | null;
        /**
         * Student Id
         * Filter by student ID
         */
        student_id?: string | null;
        /**
         * Evaluation Period Id
         * Filter by evaluation period IDs
         */
        evaluation_period_id?: string | string[] | null;
        /**
         * Status
         * Filter by attendance status
         */
        status?: AttendanceStatusEnum | null;
        /**
         * Is Present
         * Filter by presence status
         */
        is_present?: boolean | null;
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: AttendanceRecordIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordEntity[], HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_records
     * @name CreateAttendanceRecordApiV1AcademicAttendanceRecordsPost
     * @summary Create Attendance Record
     * @request POST:/api/v1/academic/attendance/records/
     * @secure
     */
    createAttendanceRecordApiV1AcademicAttendanceRecordsPost: (
      data: CreateAttendanceRecordDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/`,
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
     * @tags academic, attendance_records
     * @name CountAttendanceRecordsApiV1AcademicAttendanceRecordsCountGet
     * @summary Count Attendance Records
     * @request GET:/api/v1/academic/attendance/records/count
     * @secure
     */
    countAttendanceRecordsApiV1AcademicAttendanceRecordsCountGet: (
      query: {
        /**
         * Student Id
         * Student ID (required)
         * @format uuid
         */
        student_id: string;
        /**
         * Evaluation Period Id
         * Filter by evaluation period ID(s)
         */
        evaluation_period_id?: string | string[] | null;
        /**
         * School Cycle Id
         * Filter by school cycle ID
         */
        school_cycle_id?: string | null;
        /**
         * Is Present
         * Filter by presence status (default: false for absences)
         * @default false
         */
        is_present?: boolean;
        /**
         * Context Type
         * Filter by context type (GROUP, CLASSROOM)
         */
        context_type?: AttendanceContextTypeEnum | null;
        /**
         * Include By Context
         * Include breakdown by context_id
         * @default false
         */
        include_by_context?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordCountResultDTO, HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/count`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_records
     * @name GetAttendanceRecordApiV1AcademicAttendanceRecordsRecordIdGet
     * @summary Get Attendance Record
     * @request GET:/api/v1/academic/attendance/records/{record_id}
     * @secure
     */
    getAttendanceRecordApiV1AcademicAttendanceRecordsRecordIdGet: (
      recordId: string,
      query?: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: AttendanceRecordIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/${recordId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_records
     * @name UpdateAttendanceRecordApiV1AcademicAttendanceRecordsRecordIdPatch
     * @summary Update Attendance Record
     * @request PATCH:/api/v1/academic/attendance/records/{record_id}
     * @secure
     */
    updateAttendanceRecordApiV1AcademicAttendanceRecordsRecordIdPatch: (
      recordId: string,
      data: UpdateAttendanceRecordDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordEntity, HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/${recordId}`,
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
     * @tags academic, attendance_records
     * @name DeleteAttendanceRecordApiV1AcademicAttendanceRecordsRecordIdDelete
     * @summary Delete Attendance Record
     * @request DELETE:/api/v1/academic/attendance/records/{record_id}
     * @secure
     */
    deleteAttendanceRecordApiV1AcademicAttendanceRecordsRecordIdDelete: (
      recordId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/${recordId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags academic, attendance_records
     * @name BulkCreateAttendanceRecordsApiV1AcademicAttendanceRecordsBulkPost
     * @summary Bulk Create Attendance Records
     * @request POST:/api/v1/academic/attendance/records/bulk
     * @secure
     */
    bulkCreateAttendanceRecordsApiV1AcademicAttendanceRecordsBulkPost: (
      data: BulkCreateAttendanceRecordDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordEntity[], HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/bulk`,
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
     * @tags academic, attendance_records
     * @name BulkUpdateAttendanceRecordsApiV1AcademicAttendanceRecordsBulkPatch
     * @summary Bulk Update Attendance Records
     * @request PATCH:/api/v1/academic/attendance/records/bulk
     * @secure
     */
    bulkUpdateAttendanceRecordsApiV1AcademicAttendanceRecordsBulkPatch: (
      data: BulkUpdateAttendanceRecordDTO,
      params: RequestParams = {}
    ) =>
      this.request<AttendanceRecordEntity[], HTTPValidationError>({
        path: `/api/v1/academic/attendance/records/bulk`,
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
     * @tags academic, sep_categories
     * @name GetSepCourseGroupStructureApiV1AcademicSepCategoriesGet
     * @summary Get Sep Course Group Structure
     * @request GET:/api/v1/academic/sep-categories/
     * @secure
     */
    getSepCourseGroupStructureApiV1AcademicSepCategoriesGet: (params: RequestParams = {}) =>
      this.request<SEPCourseGroupDTO[], any>({
        path: `/api/v1/academic/sep-categories/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_configs
     * @name ListReinscriptionConfigsApiV1ReinscriptionsConfigsGet
     * @summary List Reinscription Configs
     * @request GET:/api/v1/reinscriptions/configs/
     * @secure
     */
    listReinscriptionConfigsApiV1ReinscriptionsConfigsGet: (
      query: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ReinscriptionConfigIncludeEnum[];
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
        /** Is Active */
        is_active?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionConfigEntity[], HTTPValidationError>({
        path: `/api/v1/reinscriptions/configs/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_configs
     * @name CreateReinscriptionConfigApiV1ReinscriptionsConfigsPost
     * @summary Create Reinscription Config
     * @request POST:/api/v1/reinscriptions/configs/
     * @secure
     */
    createReinscriptionConfigApiV1ReinscriptionsConfigsPost: (
      data: CreateReinscriptionConfigDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionConfigEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/configs/`,
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
     * @tags reinscriptions, reinscription_configs
     * @name GetReinscriptionConfigApiV1ReinscriptionsConfigsConfigIdGet
     * @summary Get Reinscription Config
     * @request GET:/api/v1/reinscriptions/configs/{config_id}
     * @secure
     */
    getReinscriptionConfigApiV1ReinscriptionsConfigsConfigIdGet: (
      configId: string,
      query?: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ReinscriptionConfigIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionConfigEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/configs/${configId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_configs
     * @name UpdateReinscriptionConfigApiV1ReinscriptionsConfigsConfigIdPatch
     * @summary Update Reinscription Config
     * @request PATCH:/api/v1/reinscriptions/configs/{config_id}
     * @secure
     */
    updateReinscriptionConfigApiV1ReinscriptionsConfigsConfigIdPatch: (
      configId: string,
      data: UpdateReinscriptionConfigDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionConfigEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/configs/${configId}`,
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
     * @tags reinscriptions, reinscription_configs
     * @name DeleteReinscriptionConfigApiV1ReinscriptionsConfigsConfigIdDelete
     * @summary Delete Reinscription Config
     * @request DELETE:/api/v1/reinscriptions/configs/{config_id}
     * @secure
     */
    deleteReinscriptionConfigApiV1ReinscriptionsConfigsConfigIdDelete: (configId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/reinscriptions/configs/${configId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_steps
     * @name ListReinscriptionStepsApiV1ReinscriptionsStepsGet
     * @summary List Reinscription Steps
     * @request GET:/api/v1/reinscriptions/steps/
     * @secure
     */
    listReinscriptionStepsApiV1ReinscriptionsStepsGet: (
      query?: {
        /**
         * Include
         * Include related entities
         * @default []
         */
        include?: ReinscriptionStepIncludeEnum[];
        /** Reinscription Config Id */
        reinscription_config_id?: string | null;
        /** Type */
        type?: ReinscriptionStepTypeEnum | null;
        /** Is Active */
        is_active?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepEntity[], HTTPValidationError>({
        path: `/api/v1/reinscriptions/steps/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_steps
     * @name CreateReinscriptionStepApiV1ReinscriptionsStepsPost
     * @summary Create Reinscription Step
     * @request POST:/api/v1/reinscriptions/steps/
     * @secure
     */
    createReinscriptionStepApiV1ReinscriptionsStepsPost: (
      data: CreateReinscriptionStepDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/steps/`,
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
     * @tags reinscriptions, reinscription_steps
     * @name GetReinscriptionStepApiV1ReinscriptionsStepsStepIdGet
     * @summary Get Reinscription Step
     * @request GET:/api/v1/reinscriptions/steps/{step_id}
     * @secure
     */
    getReinscriptionStepApiV1ReinscriptionsStepsStepIdGet: (stepId: string, params: RequestParams = {}) =>
      this.request<ReinscriptionStepEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/steps/${stepId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_steps
     * @name UpdateReinscriptionStepApiV1ReinscriptionsStepsStepIdPatch
     * @summary Update Reinscription Step
     * @request PATCH:/api/v1/reinscriptions/steps/{step_id}
     * @secure
     */
    updateReinscriptionStepApiV1ReinscriptionsStepsStepIdPatch: (
      stepId: string,
      data: UpdateReinscriptionStepDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/steps/${stepId}`,
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
     * @tags reinscriptions, reinscription_steps
     * @name DeleteReinscriptionStepApiV1ReinscriptionsStepsStepIdDelete
     * @summary Delete Reinscription Step
     * @request DELETE:/api/v1/reinscriptions/steps/{step_id}
     * @secure
     */
    deleteReinscriptionStepApiV1ReinscriptionsStepsStepIdDelete: (stepId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/reinscriptions/steps/${stepId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_step_concepts
     * @name ListReinscriptionStepConceptsApiV1ReinscriptionsStepConceptsGet
     * @summary List Reinscription Step Concepts
     * @request GET:/api/v1/reinscriptions/step-concepts/
     * @secure
     */
    listReinscriptionStepConceptsApiV1ReinscriptionsStepConceptsGet: (
      query?: {
        /** Reinscription Step Id */
        reinscription_step_id?: string | null;
        /** Is Active */
        is_active?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepConceptEntity[], HTTPValidationError>({
        path: `/api/v1/reinscriptions/step-concepts/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_step_concepts
     * @name CreateReinscriptionStepConceptApiV1ReinscriptionsStepConceptsPost
     * @summary Create Reinscription Step Concept
     * @request POST:/api/v1/reinscriptions/step-concepts/
     * @secure
     */
    createReinscriptionStepConceptApiV1ReinscriptionsStepConceptsPost: (
      data: CreateReinscriptionStepConceptDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepConceptEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/step-concepts/`,
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
     * @tags reinscriptions, reinscription_step_concepts
     * @name GetReinscriptionStepConceptApiV1ReinscriptionsStepConceptsConceptIdGet
     * @summary Get Reinscription Step Concept
     * @request GET:/api/v1/reinscriptions/step-concepts/{concept_id}
     * @secure
     */
    getReinscriptionStepConceptApiV1ReinscriptionsStepConceptsConceptIdGet: (
      conceptId: string,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepConceptEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/step-concepts/${conceptId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reinscriptions, reinscription_step_concepts
     * @name UpdateReinscriptionStepConceptApiV1ReinscriptionsStepConceptsConceptIdPatch
     * @summary Update Reinscription Step Concept
     * @request PATCH:/api/v1/reinscriptions/step-concepts/{concept_id}
     * @secure
     */
    updateReinscriptionStepConceptApiV1ReinscriptionsStepConceptsConceptIdPatch: (
      conceptId: string,
      data: UpdateReinscriptionStepConceptDTO,
      params: RequestParams = {}
    ) =>
      this.request<ReinscriptionStepConceptEntity, HTTPValidationError>({
        path: `/api/v1/reinscriptions/step-concepts/${conceptId}`,
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
     * @tags reinscriptions, reinscription_step_concepts
     * @name DeleteReinscriptionStepConceptApiV1ReinscriptionsStepConceptsConceptIdDelete
     * @summary Delete Reinscription Step Concept
     * @request DELETE:/api/v1/reinscriptions/step-concepts/{concept_id}
     * @secure
     */
    deleteReinscriptionStepConceptApiV1ReinscriptionsStepConceptsConceptIdDelete: (
      conceptId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/reinscriptions/step-concepts/${conceptId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Process attendance registration using voice (audio) or text input. The `input` field accepts either: - Plain text (e.g., "Hoy faltaron Diego y Camila") - Base64 encoded audio (automatically detected by audio headers) The agent will: 1. Detect if input is text or audio 2. Transcribe audio if provided 3. Analyze the teacher's input 4. Match mentioned student names against the roster 5. Return a preview of attendance records **Example request:** ```json { "input": "Hoy faltaron Diego y Camila", "school_id": "...", "evaluation_period_id": "...", "context_type": "group", "context_id": "...", "date": "2024-12-04", "taken_by_id": "..." } ```
     *
     * @tags ai, AI, AI - Attendance Agent
     * @name ProcessAttendanceApiV1AiAttendanceProcessPost
     * @summary Process attendance via text or audio
     * @request POST:/api/v1/ai/attendance/process
     * @secure
     */
    processAttendanceApiV1AiAttendanceProcessPost: (data: AttendanceAgentRequest, params: RequestParams = {}) =>
      this.request<AttendanceAgentResponse, HTTPValidationError>({
        path: `/api/v1/ai/attendance/process`,
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
     * @tags signatures, templates
     * @name ListTemplatesApiV1SignaturesTemplatesGet
     * @summary List Templates
     * @request GET:/api/v1/signatures/templates/
     * @secure
     */
    listTemplatesApiV1SignaturesTemplatesGet: (
      query?: {
        /** Id */
        id?: string | string[] | null;
        /** School Id */
        school_id?: string | null;
        /** School Cycle Id */
        school_cycle_id?: string | null;
        /** Category */
        category?: TemplateCategory | null;
        /** Is Active */
        is_active?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<DocumentTemplateEntity[], HTTPValidationError>({
        path: `/api/v1/signatures/templates/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name CreateTemplateApiV1SignaturesTemplatesPost
     * @summary Create Template
     * @request POST:/api/v1/signatures/templates/
     * @secure
     */
    createTemplateApiV1SignaturesTemplatesPost: (
      data: BodyCreateTemplateApiV1SignaturesTemplatesPost,
      params: RequestParams = {}
    ) =>
      this.request<DocumentTemplateEntity, HTTPValidationError>({
        path: `/api/v1/signatures/templates/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name GetTemplateApiV1SignaturesTemplatesTemplateIdGet
     * @summary Get Template
     * @request GET:/api/v1/signatures/templates/{template_id}
     * @secure
     */
    getTemplateApiV1SignaturesTemplatesTemplateIdGet: (templateId: string, params: RequestParams = {}) =>
      this.request<DocumentTemplateEntity, HTTPValidationError>({
        path: `/api/v1/signatures/templates/${templateId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name DeleteTemplateApiV1SignaturesTemplatesTemplateIdDelete
     * @summary Delete Template
     * @request DELETE:/api/v1/signatures/templates/{template_id}
     * @secure
     */
    deleteTemplateApiV1SignaturesTemplatesTemplateIdDelete: (templateId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/signatures/templates/${templateId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name GetTemplateFieldsApiV1SignaturesTemplatesTemplateIdFieldsGet
     * @summary Get Template Fields
     * @request GET:/api/v1/signatures/templates/{template_id}/fields
     * @secure
     */
    getTemplateFieldsApiV1SignaturesTemplatesTemplateIdFieldsGet: (templateId: string, params: RequestParams = {}) =>
      this.request<TemplateFieldEntity[], HTTPValidationError>({
        path: `/api/v1/signatures/templates/${templateId}/fields`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name DownloadTemplateFileApiV1SignaturesTemplatesTemplateIdFileDownloadGet
     * @summary Download Template File
     * @request GET:/api/v1/signatures/templates/{template_id}/file/download
     * @secure
     */
    downloadTemplateFileApiV1SignaturesTemplatesTemplateIdFileDownloadGet: (
      templateId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/signatures/templates/${templateId}/file/download`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name GenerateTemplateEditAccessApiV1SignaturesTemplatesTemplateIdEditAccessPost
     * @summary Generate Template Edit Access
     * @request POST:/api/v1/signatures/templates/{template_id}/edit-access
     * @secure
     */
    generateTemplateEditAccessApiV1SignaturesTemplatesTemplateIdEditAccessPost: (
      templateId: string,
      params: RequestParams = {}
    ) =>
      this.request<TemplateEditAccessDTO, HTTPValidationError>({
        path: `/api/v1/signatures/templates/${templateId}/edit-access`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, templates
     * @name ListTemplateDocumentsApiV1SignaturesTemplatesTemplateIdDocumentsGet
     * @summary List Template Documents
     * @request GET:/api/v1/signatures/templates/{template_id}/documents
     * @secure
     */
    listTemplateDocumentsApiV1SignaturesTemplatesTemplateIdDocumentsGet: (
      templateId: string,
      query?: {
        /** Status */
        status?: DocumentInstanceStatus | null;
        /** From Date */
        from_date?: string | null;
        /** To Date */
        to_date?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<DocumentInstanceEntity[], HTTPValidationError>({
        path: `/api/v1/signatures/templates/${templateId}/documents`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a document instance from a template. The document envelope is always created and distributed immediately, making it ready for signing. The response includes signing_url. If send_immediately=True, a notification email will be sent to the signer via the communications microservice.
     *
     * @tags signatures, documents
     * @name CreateDocumentInstanceApiV1SignaturesDocumentsInstancesPost
     * @summary Create Document Instance
     * @request POST:/api/v1/signatures/documents/instances
     * @secure
     */
    createDocumentInstanceApiV1SignaturesDocumentsInstancesPost: (
      data: CreateDocumentInstanceDTO,
      params: RequestParams = {}
    ) =>
      this.request<DocumentInstanceEntity, HTTPValidationError>({
        path: `/api/v1/signatures/documents/instances`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List document instances with filters
     *
     * @tags signatures, documents
     * @name ListDocumentsApiV1SignaturesDocumentsInstancesGet
     * @summary List Documents
     * @request GET:/api/v1/signatures/documents/instances
     * @secure
     */
    listDocumentsApiV1SignaturesDocumentsInstancesGet: (
      query?: {
        /** School Id */
        school_id?: string | null;
        /** Signer Id */
        signer_id?: string | null;
        /** External Id */
        external_id?: string | null;
        /** Module */
        module?: string | null;
        /** Status */
        status?: DocumentInstanceStatus | null;
        /** From Date */
        from_date?: string | null;
        /** To Date */
        to_date?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<DocumentInstanceEntity[], HTTPValidationError>({
        path: `/api/v1/signatures/documents/instances`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get document instance by ID
     *
     * @tags signatures, documents
     * @name GetDocumentApiV1SignaturesDocumentsInstancesDocumentIdGet
     * @summary Get Document
     * @request GET:/api/v1/signatures/documents/instances/{document_id}
     * @secure
     */
    getDocumentApiV1SignaturesDocumentsInstancesDocumentIdGet: (documentId: string, params: RequestParams = {}) =>
      this.request<DocumentInstanceEntity, HTTPValidationError>({
        path: `/api/v1/signatures/documents/instances/${documentId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get signature event history for a document
     *
     * @tags signatures, documents
     * @name GetSignatureHistoryApiV1SignaturesDocumentsInstancesDocumentIdHistoryGet
     * @summary Get Signature History
     * @request GET:/api/v1/signatures/documents/instances/{document_id}/history
     * @secure
     */
    getSignatureHistoryApiV1SignaturesDocumentsInstancesDocumentIdHistoryGet: (
      documentId: string,
      params: RequestParams = {}
    ) =>
      this.request<SignatureRecordEntity[], HTTPValidationError>({
        path: `/api/v1/signatures/documents/instances/${documentId}/history`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signatures, documents
     * @name DownloadDocumentFileApiV1SignaturesDocumentsInstancesDocumentIdFileDownloadGet
     * @summary Download Document File
     * @request GET:/api/v1/signatures/documents/instances/{document_id}/file/download
     * @secure
     */
    downloadDocumentFileApiV1SignaturesDocumentsInstancesDocumentIdFileDownloadGet: (
      documentId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/signatures/documents/instances/${documentId}/file/download`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update document status from frontend when user signs. Currently only supports PENDING → SIGNED transition.
     *
     * @tags signatures, documents
     * @name UpdateDocumentStatusApiV1SignaturesDocumentsInstancesDocumentIdStatusPatch
     * @summary Update Document Status
     * @request PATCH:/api/v1/signatures/documents/instances/{document_id}/status
     * @secure
     */
    updateDocumentStatusApiV1SignaturesDocumentsInstancesDocumentIdStatusPatch: (
      documentId: string,
      data: UpdateDocumentStatusDTO,
      params: RequestParams = {}
    ) =>
      this.request<DocumentInstanceEntity, HTTPValidationError>({
        path: `/api/v1/signatures/documents/instances/${documentId}/status`,
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
     * @tags inscriptions_v2, inscriptions
     * @name CreateApiV2InscriptionsPost
     * @summary Create
     * @request POST:/api/v2/inscriptions/
     * @secure
     */
    createApiV2InscriptionsPost: (data: CreateInscriptionRequest, params: RequestParams = {}) =>
      this.request<SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity, HTTPValidationError>({
        path: `/api/v2/inscriptions/`,
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
     * @tags inscriptions_v2, inscriptions
     * @name ListApiV2InscriptionsGet
     * @summary List
     * @request GET:/api/v2/inscriptions/
     * @secure
     */
    listApiV2InscriptionsGet: (
      query: {
        /**
         * Include
         * @default []
         */
        include?: RequestInscriptionIncludeEnum[];
        /**
         * Student Id
         * @format uuid
         */
        student_id: string;
        /** School Cycle Id */
        school_cycle_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<InscriptionListResponseDTO[], HTTPValidationError>({
        path: `/api/v2/inscriptions/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions_v2, inscriptions
     * @name GetApiV2InscriptionsInscriptionIdGet
     * @summary Get
     * @request GET:/api/v2/inscriptions/{inscription_id}
     * @secure
     */
    getApiV2InscriptionsInscriptionIdGet: (
      inscriptionId: string,
      query?: {
        /**
         * Include
         * @default []
         */
        include?: InscriptionIncludeEnum[];
      },
      params: RequestParams = {}
    ) =>
      this.request<SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity, HTTPValidationError>({
        path: `/api/v2/inscriptions/${inscriptionId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions_v2, inscriptions
     * @name UpdateApiV2InscriptionsInscriptionIdPatch
     * @summary Update
     * @request PATCH:/api/v2/inscriptions/{inscription_id}
     * @secure
     */
    updateApiV2InscriptionsInscriptionIdPatch: (
      inscriptionId: string,
      data: UpdateInscriptionRequest,
      params: RequestParams = {}
    ) =>
      this.request<SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity, HTTPValidationError>({
        path: `/api/v2/inscriptions/${inscriptionId}`,
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
     * @tags inscriptions_v2, inscriptions
     * @name DeleteApiV2InscriptionsInscriptionIdDelete
     * @summary Delete
     * @request DELETE:/api/v2/inscriptions/{inscription_id}
     * @secure
     */
    deleteApiV2InscriptionsInscriptionIdDelete: (inscriptionId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v2/inscriptions/${inscriptionId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions_v2, inscriptions
     * @name UpdateStatusApiV2InscriptionsInscriptionIdUpdateStatusPatch
     * @summary Update Status
     * @request PATCH:/api/v2/inscriptions/{inscription_id}/update_status
     * @secure
     */
    updateStatusApiV2InscriptionsInscriptionIdUpdateStatusPatch: (inscriptionId: string, params: RequestParams = {}) =>
      this.request<SrcInscriptionsDomainEntitiesInscriptionInscriptionEntity, HTTPValidationError>({
        path: `/api/v2/inscriptions/${inscriptionId}/update_status`,
        method: 'PATCH',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags inscriptions_v2, inscriptions
     * @name BulkUpdateApiV2InscriptionsBulkUpdatePut
     * @summary Bulk Update
     * @request PUT:/api/v2/inscriptions/bulk_update
     * @secure
     */
    bulkUpdateApiV2InscriptionsBulkUpdatePut: (data: BulkUpdateRequestDTO, params: RequestParams = {}) =>
      this.request<InscriptionResponseDTO[], HTTPValidationError>({
        path: `/api/v2/inscriptions/bulk_update`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
