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

/** AdmissionStepEntity */
export interface AdmissionStepEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Student Lead Id */
  student_lead_id?: string | null;
  /** @default "to_do" */
  status?: AdmissionStepStatus | null;
  /** School Step Id */
  school_step_id?: string | null;
  school_step?: SchoolStepEntity | null;
  enabled_rules?: EnabledRules | null;
}

/** AdmissionStepStatus */
export enum AdmissionStepStatus {
  ToDo = 'to_do',
  InProgress = 'in_progress',
  Completed = 'completed',
}

/** AnswerEntity */
export interface AnswerEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Answer */
  answer?: string;
  /**
   * Answered By
   * @format uuid
   */
  answered_by?: string;
  /**
   * Answered For
   * @format uuid
   */
  answered_for?: string;
  /**
   * Question Id
   * @format uuid
   */
  question_id?: string;
  question?: QuestionEntity | null;
  /**
   * Form Id
   * @format uuid
   */
  form_id?: string;
  /** Field Type */
  field_type?: string;
}

/** ApplicationFormEntity */
export interface ApplicationFormEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Curp */
  curp?: string | null;
  /** Birthplace */
  birthplace?: string | null;
  /** Is Outside Mx */
  is_outside_mx?: boolean | null;
  /** Nationality */
  nationality?: string | null;
  /** Homephone */
  homephone?: string | null;
  /** Address */
  address?: string | null;
  /** Interior Number */
  interior_number?: string | null;
  /** Neighborhood */
  neighborhood?: string | null;
  /** Municipality */
  municipality?: string | null;
  /** State */
  state?: string | null;
  /** Zipcode */
  zipcode?: string | null;
  /** Guardian Relationship */
  guardian_relationship?: string | null;
  /** Guardian Occupation */
  guardian_occupation?: string | null;
  /** Guardian Workplace */
  guardian_workplace?: string | null;
  /** Guardian Workphone */
  guardian_workphone?: string | null;
  /** Guardian Id */
  guardian_id?: string | null;
  /** Accept Truthfulness */
  accept_truthfulness?: boolean | null;
  /** Student Lead Id */
  student_lead_id?: string | null;
  /** Changed By */
  changed_by?: string | null;
}

/** AvailableRulesType */
export enum AvailableRulesType {
  Guardian = 'guardian',
  School = 'school',
}

/** Body_create_file_api_v1_files__school_id__post */
export interface BodyCreateFileApiV1FilesSchoolIdPost {
  /**
   * File In
   * @format binary
   */
  file_in: File;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
}

/** Body_upload_photo_api_v1_admissions__pk__upload_photo_patch */
export interface BodyUploadPhotoApiV1AdmissionsPkUploadPhotoPatch {
  /**
   * File In
   * Student Lead Photo
   * @format binary
   */
  file_in: File;
}

/** CreateAdmissionStepDTO */
export interface CreateAdmissionStepDTO {
  status: AdmissionStepStatus;
  /**
   * School Step Id
   * @format uuid
   */
  school_step_id: string;
  /**
   * Student Lead Id
   * @format uuid
   */
  student_lead_id: string;
}

/** CreateEntityQuestionDTO */
export interface CreateEntityQuestionDTO {
  /** Original Name */
  original_name: string;
  /** Name */
  name: string | null;
  /** Description */
  description: string | null;
  /** Type */
  type: string | null;
  /** Is Visible */
  is_visible: boolean;
  /** Is Required */
  is_required: boolean;
  extra?: QuestionExtra | null;
}

/** CreateFormDTO */
export interface CreateFormDTO {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Layout */
  layout: FormSectionDTO[];
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /** Category */
  category?: string | null;
  /** Template Id */
  template_id?: string | null;
}

/** CreateGuardianLeadDTO */
export interface CreateGuardianLeadDTO {
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  /** Accept Terms */
  accept_terms?: boolean | null;
  /** Relationship */
  relationship?: string | null;
  /** Has Student Custody */
  has_student_custody?: boolean | null;
}

/** CreateQuestionDTO */
export interface CreateQuestionDTO {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Type */
  type: string;
  extra?: QuestionExtra | null;
}

/** CreateSchoolStepResourceDto */
export interface CreateSchoolStepResourceDto {
  /** Source */
  source: string;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** @default "file" */
  type?: SchoolStepResourceType;
  /** Order */
  order?: number | null;
}

/** CreateSchoolStepsDTO */
export interface CreateSchoolStepsDTO {
  /** Name */
  name: string;
  /** Order */
  order: number;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  status: SchoolStepStatusEnum;
  /** Description */
  description: string;
  actions: SchoolStepActions;
  tag?: SchoolStepTags | null;
  type?: SchoolStepTypeEnum | null;
  /** Id */
  id?: string | null;
  /** Rules */
  rules?: SchoolStepRules[] | null;
  /** Deleted At */
  deleted_at?: string | null;
}

/** CreateSignatureTemplateDTO */
export interface CreateSignatureTemplateDTO {
  /**
   * School Step Id
   * @format uuid
   */
  school_step_id: string;
  /**
   * Signature Template Id
   * @format uuid
   */
  signature_template_id: string;
  /** Level Ids */
  level_ids?: string[] | null;
  /** Order */
  order: number;
}

/** CreateStudentLeadDTO */
export interface CreateStudentLeadDTO {
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /**
   * Birthdate
   * @format date
   */
  birthdate: string;
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
   * School Id
   * @format uuid
   */
  school_id: string;
  /** @default "initial" */
  status?: StatusEnum;
  guardian_lead?: CreateGuardianLeadDTO | null;
  /** Origin School */
  origin_school?: string | null;
  /** Comment */
  comment?: string | null;
  gender?: GenderEnum | null;
  /** Created By */
  created_by?: string | null;
  /** Change Reason */
  change_reason?: string | null;
  /** Meet Reason */
  meet_reason?: string | null;
}

/** CreateTemplateDTO */
export interface CreateTemplateDTO {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Layout */
  layout: TemplateSectionDTO[];
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /** Category */
  category?: string | null;
}

/** EnabledRules */
export interface EnabledRules {
  /** School */
  school: boolean;
  /** Guardian */
  guardian: boolean;
}

/** EntityQuestionEntity */
export interface EntityQuestionEntity {
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
  /** Is Visible */
  is_visible?: boolean;
  /** Is Required */
  is_required?: boolean;
  type?: QuestionTypeEnum | null;
  extra?: QuestionExtra | null;
  /**
   * Entity Id
   * @format uuid
   */
  entity_id?: string;
  /**
   * Question Id
   * @format uuid
   */
  question_id?: string;
  question?: QuestionEntity;
}

/** FileEntity */
export interface FileEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** File Name */
  file_name?: string | null;
  /** File Type */
  file_type?: string | null;
  /** File Reference */
  file_reference?: string | null;
  /** School Id */
  school_id?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
}

/** FormAnswerDTO */
export interface FormAnswerDTO {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Answer */
  answer: string;
  /** Answered For */
  answered_for: string;
  /** Question */
  question: string;
  /** Question Id */
  question_id: string;
}

/** FormCompletionResponseDTO */
export interface FormCompletionResponseDTO {
  /** Is Completed */
  is_completed: boolean;
}

/** FormEntity */
export interface FormEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string;
  /** Description */
  description?: string | null;
  /**
   * Created By
   * @format uuid
   */
  created_by?: string;
  /** Category */
  category?: string | null;
  /** Layout */
  layout?: FormSection[];
  /** Template Id */
  template_id?: string | null;
}

/** FormQuestionDTO */
export interface FormQuestionDTO {
  /** Id */
  id: string;
  /** Name */
  name: string;
}

/** FormSection */
export interface FormSection {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Questions */
  questions: QuestionEntity[][];
}

/** FormSectionDTO */
export interface FormSectionDTO {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Questions */
  questions: CreateEntityQuestionDTO[][];
}

/** GenderEnum */
export enum GenderEnum {
  Male = 'male',
  Female = 'female',
}

/** GuardianLeadEntity */
export interface GuardianLeadEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  gender?: GenderEnum | null;
  /** Birthdate */
  birthdate?: string | null;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Relationship */
  relationship?: string | null;
  /** Occupation */
  occupation?: string | null;
  /** Workplace */
  workplace?: string | null;
  /** Workphone */
  workphone?: string | null;
  /** External Id */
  external_id?: string | null;
  /** Accept Terms */
  accept_terms?: boolean | null;
  /** Has Student Custody */
  has_student_custody?: boolean | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** LeadsExistResponseDTO */
export interface LeadsExistResponseDTO {
  /** Has Leads */
  has_leads: boolean;
}

/** ListStudentLeadDTO */
export interface ListStudentLeadDTO {
  /** First Name */
  first_name: string;
  /** Last Name */
  last_name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Created At */
  created_at: string | null;
  /** School Cycle Name */
  school_cycle_name: string;
  /** Section Name */
  section_name: string;
  /** Level */
  level: string;
  status: StatusEnum;
  /** Admission Steps */
  admission_steps: AdmissionStepEntity[];
  /** External Id */
  external_id?: string | null;
  /** Origin School */
  origin_school?: string | null;
  /** Comment */
  comment?: string | null;
}

/** MedicalFormEntity */
export interface MedicalFormEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Blood Type */
  blood_type?: string | null;
  /** Weight */
  weight?: number | null;
  /** Height */
  height?: number | null;
  /** Laterality */
  laterality?: string | null;
  /** Family History */
  family_history?: string | null;
  /** Personal History */
  personal_history?: string | null;
  /** Current Ailments */
  current_ailments?: string | null;
  /** Recent Interventions */
  recent_interventions?: string | null;
  /** Other History */
  other_history?: string | null;
  /** Has Allergies */
  has_allergies?: boolean | null;
  /** Drug Allergies */
  drug_allergies?: string | null;
  /** Food Allergies */
  food_allergies?: string | null;
  /** Plant Allergies */
  plant_allergies?: string | null;
  /** Other Allergies */
  other_allergies?: string | null;
  /** Dietary Restrictions */
  dietary_restrictions?: string | null;
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
  /** Accept Truthfulness */
  accept_truthfulness?: boolean | null;
  /** Student Lead Id */
  student_lead_id?: string | null;
  /** Changed By */
  changed_by?: string | null;
}

/** PageResponse */
export interface PageResponseListStudentLeadDTO {
  /** Page Number */
  page_number: number;
  /** Page Size */
  page_size: number;
  /** Total Pages */
  total_pages: number;
  /** Total Records */
  total_records: number;
  /** Results */
  results: ListStudentLeadDTO[];
}

/** QuestionEntity */
export interface QuestionEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string;
  /** Description */
  description?: string | null;
  type?: QuestionTypeEnum;
  extra?: QuestionExtra | null;
  entity_question?: EntityQuestionEntity | null;
}

/** QuestionExtra */
export interface QuestionExtra {
  /** Options */
  options?: string[] | null;
  /** Variant */
  variant?: string | null;
  /** Orientation */
  orientation?: string | null;
  /** No Label */
  no_label?: boolean | null;
  /** Extra Field Condition */
  extra_field_condition?: string | null;
  /** Extra Field */
  extra_field?: string | null;
  /** Visible Condition */
  visible_condition?: string[] | null;
}

/** QuestionTypeEnum */
export enum QuestionTypeEnum {
  Text = 'text',
  Select = 'select',
  Multiselect = 'multiselect',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Textarea = 'textarea',
}

/** ReportDataDTO */
export interface ReportDataDTO {
  /** Form Name */
  form_name?: string | null;
  /** Questions */
  questions?: FormQuestionDTO[] | null;
  /** Answers */
  answers?: Record<string, FormAnswerDTO[]> | null;
}

/** SchoolStepAction */
export interface SchoolStepAction {
  /**
   * Label
   * @default ""
   */
  label?: string;
  /**
   * Redirect Url
   * @default ""
   */
  redirect_url?: string;
}

/** SchoolStepActions */
export interface SchoolStepActions {
  to_do?: SchoolStepAction;
  in_progress?: SchoolStepAction;
  completed?: SchoolStepAction;
}

/** SchoolStepDocsEntity */
export interface SchoolStepDocsEntity {
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
  /** Tag */
  tag?: string | null;
  /** Order */
  order?: number | null;
  school_step?: SchoolStepEntity | null;
  /**
   * Active
   * @default true
   */
  active?: boolean;
  /**
   * Is Required
   * @default true
   */
  is_required?: boolean;
  /** Level Ids */
  level_ids?: string | null;
}

/** SchoolStepEntity */
export interface SchoolStepEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string | null;
  /** Order */
  order?: number | null;
  type?: SchoolStepTypeEnum | null;
  /** School Id */
  school_id?: string | null;
  /** @default "inactive" */
  status?: SchoolStepStatusEnum | null;
  /** Description */
  description?: string | null;
  actions?: SchoolStepActions | null;
  /** Rules */
  rules?: SchoolStepRules[] | null;
  tag?: SchoolStepTags | null;
  /** Deleted At */
  deleted_at?: string | null;
}

/** SchoolStepResourceEntity */
export interface SchoolStepResourceEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Source */
  source: string;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Type */
  type: string;
  /** Order */
  order?: number | null;
  school_step?: SchoolStepEntity | null;
  /**
   * School Step Id
   * @format uuid
   */
  school_step_id: string;
}

/** SchoolStepResourceType */
export enum SchoolStepResourceType {
  File = 'file',
  Url = 'url',
}

/** SchoolStepRules */
export interface SchoolStepRules {
  apply_for: AvailableRulesType;
  /** Specific Rules */
  specific_rules: SpecificRule[];
}

/** SchoolStepStatusEnum */
export enum SchoolStepStatusEnum {
  Active = 'active',
  Inactive = 'inactive',
  Draft = 'draft',
}

/** SchoolStepTags */
export enum SchoolStepTags {
  ScholarInfo = 'scholar_info',
  PaymentFee = 'payment_fee',
  ApplicationForm = 'application_form',
  MedicalForm = 'medical_form',
  PsychopedagogicalForm = 'psychopedagogical_form',
  ConsentForm = 'consent_form',
  VisitSchool = 'visit_school',
  AdmissionExam = 'admission_exam',
  Documents = 'documents',
  DocumentsValidation = 'documents_validation',
  Free = 'free',
}

/** SchoolStepTagsDTO */
export enum SchoolStepTagsDTO {
  ScholarInfo = 'scholar_info',
  PaymentFee = 'payment_fee',
  ApplicationForm = 'application_form',
  MedicalForm = 'medical_form',
  PsychopedagogicalForm = 'psychopedagogical_form',
  ConsentForm = 'consent_form',
  VisitSchool = 'visit_school',
  AdmissionExam = 'admission_exam',
  Documents = 'documents',
  DocumentsValidation = 'documents_validation',
  Free = 'free',
}

/** SchoolStepTypeEnum */
export enum SchoolStepTypeEnum {
  Upload = 'upload',
  Form = 'form',
  Review = 'review',
  Url = 'url',
  Free = 'free',
  Payment = 'payment',
  DocsValidation = 'docs_validation',
  VisitSchool = 'visit_school',
  AdmissionExam = 'admission_exam',
  Signature = 'signature',
}

/** SignatureTemplateEntity */
export interface SignatureTemplateEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * School Step Id
   * @format uuid
   */
  school_step_id: string;
  /**
   * Signature Template Id
   * @format uuid
   */
  signature_template_id: string;
  /** Order */
  order: number;
  /** Level Ids */
  level_ids?: string[] | null;
}

/** SpecificRule */
export interface SpecificRule {
  /** Condition */
  condition: string;
  /** Value */
  value: string;
  /** Action */
  action?: string | null;
}

/** StatusEnum */
export enum StatusEnum {
  Initial = 'initial',
  Admitted = 'admitted',
  DroppedOut = 'dropped_out',
  NotAdmitted = 'not_admitted',
}

/** StudentLeadEntity */
export interface StudentLeadEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  gender?: GenderEnum | null;
  /** Birthdate */
  birthdate?: string | null;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  /** Section Id */
  section_id?: string | null;
  /** Section Name */
  section_name?: string | null;
  /** School Cycle Name */
  school_cycle_name?: string | null;
  /** School Id */
  school_id?: string | null;
  /** @default "initial" */
  status?: StatusEnum | null;
  /** Origin School */
  origin_school?: string | null;
  /** Comment */
  comment?: string | null;
  /** Guardian Leads */
  guardian_leads?: GuardianLeadEntity[] | null;
  /** Custom Answers */
  custom_answers?: object[] | null;
  /** Admission Steps */
  admission_steps?: AdmissionStepEntity[] | null;
  /** External Id */
  external_id?: string | null;
  /** Created By */
  created_by?: string | null;
  /** Change Reason */
  change_reason?: string | null;
  /** Meet Reason */
  meet_reason?: string | null;
  /** Curp */
  curp?: string | null;
  /** Dropped Out Reason */
  dropped_out_reason?: string | null;
  /** Photo Url */
  photo_url?: string | null;
  /** Level Id */
  level_id?: string | null;
}

/** TemplateEntity */
export interface TemplateEntity {
  /** Id */
  id?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Modified At */
  modified_at?: string | null;
  /** Name */
  name?: string;
  /** Description */
  description?: string | null;
  /**
   * Created By
   * @format uuid
   */
  created_by?: string;
  /** Category */
  category?: string | null;
  /** Layout */
  layout?: TemplateSection[];
  /** School Id */
  school_id?: string | null;
}

/** TemplateSection */
export interface TemplateSection {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Questions */
  questions: QuestionEntity[][];
}

/** TemplateSectionDTO */
export interface TemplateSectionDTO {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Questions */
  questions: CreateEntityQuestionDTO[][];
}

/** UpdateAdmissionStepDTO */
export interface UpdateAdmissionStepDTO {
  status: AdmissionStepStatus;
}

/** UpdateFormDTO */
export interface UpdateFormDTO {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Layout */
  layout: FormSectionDTO[];
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /** Category */
  category?: string | null;
}

/** UpdateQuestionDTO */
export interface UpdateQuestionDTO {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Type */
  type: string;
  extra?: QuestionExtra | null;
}

/** UpdateSchoolStepResourceDto */
export interface UpdateSchoolStepResourceDto {
  /** Source */
  source?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  type?: SchoolStepResourceType | null;
  /** Order */
  order?: number | null;
}

/** UpdateSignatureTemplateDTO */
export interface UpdateSignatureTemplateDTO {
  /** Signature Template Id */
  signature_template_id?: string | null;
  /** Level Ids */
  level_ids?: string[] | null;
  /** Order */
  order?: number | null;
}

/** UpdateStudentLeadDTO */
export interface UpdateStudentLeadDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
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
   * Identifier
   * @maxLength 20
   */
  identifier: string;
  /**
   * Enrollment Code
   * @maxLength 50
   */
  enrollment_code: string;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  status?: StatusEnum | null;
  /** Entry Date */
  entry_date?: string | null;
}

/** UpdateStudentLeadInfoDTO */
export interface UpdateStudentLeadInfoDTO {
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Birthdate */
  birthdate?: string | null;
  /** School Cycle Id */
  school_cycle_id?: string | null;
  /** Section Id */
  section_id?: string | null;
  /** Origin School */
  origin_school?: string | null;
  /** Comment */
  comment?: string | null;
  gender?: GenderEnum | null;
}

/** UpdateStudentLeadStatusDTO */
export interface UpdateStudentLeadStatusDTO {
  status?: StatusEnum | null;
  /** Dropped Out Reason */
  dropped_out_reason?: string | null;
}

/** UpdateTemplateDTO */
export interface UpdateTemplateDTO {
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Layout */
  layout: TemplateSectionDTO[];
  /**
   * Created By
   * @format uuid
   */
  created_by: string;
  /** Category */
  category?: string | null;
}

/** UploadPhotoResponseDTO */
export interface UploadPhotoResponseDTO {
  /** Photo */
  photo: string;
}

/** UpsertAdmissionStepDTO */
export interface UpsertAdmissionStepDTO {
  /**
   * Student Lead Id
   * @format uuid
   */
  student_lead_id: string;
  /**
   * School Step Id
   * @format uuid
   */
  school_step_id: string;
  status: AdmissionStepStatus;
}

/** UpsertAnswerDTO */
export interface UpsertAnswerDTO {
  /** Answer */
  answer: string;
  /**
   * Answered By
   * @format uuid
   */
  answered_by: string;
  /**
   * Answered For
   * @format uuid
   */
  answered_for: string;
  /**
   * Question Id
   * @format uuid
   */
  question_id: string;
  /**
   * Form Id
   * @format uuid
   */
  form_id: string;
  /** Field Type */
  field_type: string;
}

/** UpsertApplicationFormDto */
export interface UpsertApplicationFormDto {
  /** Curp */
  curp: string;
  /** Birthplace */
  birthplace: string;
  /** Is Outside Mx */
  is_outside_mx: boolean;
  /** Nationality */
  nationality: string;
  /** Homephone */
  homephone: string;
  /** Address */
  address: string;
  /** Interior Number */
  interior_number: string;
  /** Neighborhood */
  neighborhood: string;
  /** Municipality */
  municipality: string;
  /** State */
  state: string;
  /** Zipcode */
  zipcode: string;
  /** Guardian Relationship */
  guardian_relationship: string;
  /**
   * Student Lead Id
   * @format uuid
   */
  student_lead_id: string;
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  /** Guardian Id */
  guardian_id: string;
  /** Guardian Occupation */
  guardian_occupation?: string | null;
  /** Guardian Workplace */
  guardian_workplace?: string | null;
  /** Guardian Workphone */
  guardian_workphone?: string | null;
  /** Additional Guardian Id */
  additional_guardian_id?: string | null;
  /** Additional Guardian Email */
  additional_guardian_email?: string | null;
  /** Additional Guardian Phone */
  additional_guardian_phone?: string | null;
  /** Additional Guardian First Name */
  additional_guardian_first_name?: string | null;
  /** Additional Guardian Last Name */
  additional_guardian_last_name?: string | null;
  /** Additional Guardian Relationship */
  additional_guardian_relationship?: string | null;
  /** Additional Guardian Occupation */
  additional_guardian_occupation?: string | null;
  /** Additional Guardian Workplace */
  additional_guardian_workplace?: string | null;
  /** Additional Guardian Workphone */
  additional_guardian_workphone?: string | null;
  /** Accept Truthfulness */
  accept_truthfulness?: boolean | null;
  /** Changed By */
  changed_by?: string | null;
}

/** UpsertMedicalFormDto */
export interface UpsertMedicalFormDto {
  /**
   * Student Lead Id
   * @format uuid
   */
  student_lead_id: string;
  /** Blood Type */
  blood_type: string;
  /** Weight */
  weight: number;
  /** Height */
  height: number;
  /** Laterality */
  laterality: string;
  /** Family History */
  family_history?: string | null;
  /** Personal History */
  personal_history?: string | null;
  /** Current Ailments */
  current_ailments?: string | null;
  /** Recent Interventions */
  recent_interventions?: string | null;
  /** Other History */
  other_history?: string | null;
  /**
   * Has Allergies
   * @default false
   */
  has_allergies?: boolean;
  /** Drug Allergies */
  drug_allergies?: string | null;
  /** Food Allergies */
  food_allergies?: string | null;
  /** Plant Allergies */
  plant_allergies?: string | null;
  /** Other Allergies */
  other_allergies?: string | null;
  /** Dietary Restrictions */
  dietary_restrictions?: string | null;
  /**
   * Require Drugs
   * @default false
   */
  require_drugs?: boolean;
  /** Drugs */
  drugs?: string | null;
  /**
   * Authorize Emergency Transfer
   * @default false
   */
  authorize_emergency_transfer?: boolean;
  /**
   * Authorize Physical Activity
   * @default false
   */
  authorize_physical_activity?: boolean;
  /** Emergency Contact Id */
  emergency_contact_id?: string | null;
  /** Emergency Contact Name */
  emergency_contact_name?: string | null;
  /** Emergency Contact Phone */
  emergency_contact_phone?: string | null;
  /** Emergency Contact Relationship */
  emergency_contact_relationship?: string | null;
  /**
   * Has Private Doctor
   * @default false
   */
  has_private_doctor?: boolean;
  /** Doctor Name */
  doctor_name?: string | null;
  /** Doctor Phone */
  doctor_phone?: string | null;
  /** Doctor Clinic */
  doctor_clinic?: string | null;
  /**
   * Has Private Insurance
   * @default false
   */
  has_private_insurance?: boolean;
  /** Has All Vaccines */
  has_all_vaccines?: boolean | null;
  /** Pending Vaccines */
  pending_vaccines?: string | null;
  /** Comments */
  comments?: string | null;
  /** Accept Truthfulness */
  accept_truthfulness?: boolean | null;
  /** Changed By */
  changed_by?: string | null;
}

/** UpsertSchoolStepDocsDTO */
export interface UpsertSchoolStepDocsDTO {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Tag */
  tag: string;
  /** Order */
  order: number;
  /**
   * School Step Id
   * @format uuid
   */
  school_step_id: string;
  /**
   * Active
   * @default true
   */
  active?: boolean;
  /**
   * Is Required
   * @default true
   */
  is_required?: boolean;
  /** Id */
  id?: string | null;
  /** Level Ids */
  level_ids?: string | null;
}

/** UrlFileEntity */
export interface UrlFileEntity {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Url */
  url: string;
  /** Expires */
  expires: number;
  /** File Name */
  file_name?: string | null;
  /** File Reference */
  file_reference?: string | null;
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
}

/** ValidateFormCompletionDTO */
export interface ValidateFormCompletionDTO {
  /**
   * School Id
   * @format uuid
   */
  school_id: string;
  tag: SchoolStepTags;
  /**
   * Answered For
   * @format uuid
   */
  answered_for: string;
  /** Level Id */
  level_id?: string | null;
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
 * @title admissions
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
      this.request<Record<string, string | string[]>, any>({
        path: `/api/v1/health`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name GetAdmissionsReportApiV1AdmissionsReportGet
     * @summary Get Admissions Report
     * @request GET:/api/v1/admissions/report
     */
    getAdmissionsReportApiV1AdmissionsReportGet: (
      query: {
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
        /** Status */
        status?: string[] | null;
        /** School Cycle Id */
        school_cycle_id?: string[] | null;
        /** Section Id */
        section_id?: string[] | null;
        /** Search */
        search?: string | null;
        /** Guardian Lead Id */
        guardian_lead_id?: string[] | null;
        /** External Guardian Id */
        external_guardian_id?: string[] | null;
        /** Sorting */
        sorting?: string | null;
        /** Completed School Step Ids */
        completed_school_step_ids?: string[] | null;
        /** External Id */
        external_id?: string[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/admissions/report`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name GetAdmissionApiV1AdmissionsPkGet
     * @summary Get Admission
     * @request GET:/api/v1/admissions/{pk}
     */
    getAdmissionApiV1AdmissionsPkGet: (
      pk: string,
      query?: {
        /**
         * Include Names
         * @default true
         */
        include_names?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<StudentLeadEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name UpdateAdmissionApiV1AdmissionsPkPatch
     * @summary Update Admission
     * @request PATCH:/api/v1/admissions/{pk}
     */
    updateAdmissionApiV1AdmissionsPkPatch: (pk: string, data: UpdateStudentLeadDTO, params: RequestParams = {}) =>
      this.request<StudentLeadEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name DeleteAdmissionApiV1AdmissionsPkDelete
     * @summary Delete Admission
     * @request DELETE:/api/v1/admissions/{pk}
     */
    deleteAdmissionApiV1AdmissionsPkDelete: (pk: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}`,
        method: 'DELETE',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name ListAdmissionsApiV1AdmissionsGet
     * @summary List Admissions
     * @request GET:/api/v1/admissions/
     */
    listAdmissionsApiV1AdmissionsGet: (
      query: {
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
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
        /** Status */
        status?: string[] | null;
        /** School Cycle Id */
        school_cycle_id?: string[] | null;
        /** Section Id */
        section_id?: string[] | null;
        /** Search */
        search?: string | null;
        /** Guardian Lead Id */
        guardian_lead_id?: string[] | null;
        /** External Guardian Id */
        external_guardian_id?: string[] | null;
        /** Sorting */
        sorting?: string | null;
        /** Completed School Step Ids */
        completed_school_step_ids?: string[] | null;
        /** External Id */
        external_id?: string[] | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<PageResponseListStudentLeadDTO, HTTPValidationError>({
        path: `/api/v1/admissions/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name CreateAdmissionApiV1AdmissionsPost
     * @summary Create Admission
     * @request POST:/api/v1/admissions/
     */
    createAdmissionApiV1AdmissionsPost: (data: CreateStudentLeadDTO, params: RequestParams = {}) =>
      this.request<StudentLeadEntity, HTTPValidationError>({
        path: `/api/v1/admissions/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name SchoolCycleHasLeadsApiV1AdmissionsSchoolIdSchoolCyclesSchoolCycleIdLeadsExistsGet
     * @summary School Cycle Has Leads
     * @request GET:/api/v1/admissions/{school_id}/school-cycles/{school_cycle_id}/leads/exists
     */
    schoolCycleHasLeadsApiV1AdmissionsSchoolIdSchoolCyclesSchoolCycleIdLeadsExistsGet: (
      schoolId: string,
      schoolCycleId: string,
      params: RequestParams = {}
    ) =>
      this.request<LeadsExistResponseDTO, HTTPValidationError>({
        path: `/api/v1/admissions/${schoolId}/school-cycles/${schoolCycleId}/leads/exists`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name UpdateAdmissionStatusApiV1AdmissionsPkStatusPatch
     * @summary Update Admission Status
     * @request PATCH:/api/v1/admissions/{pk}/status
     */
    updateAdmissionStatusApiV1AdmissionsPkStatusPatch: (
      pk: string,
      data: UpdateStudentLeadStatusDTO,
      params: RequestParams = {}
    ) =>
      this.request<StudentLeadEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/status`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name UploadPhotoApiV1AdmissionsPkUploadPhotoPatch
     * @summary Upload Photo
     * @request PATCH:/api/v1/admissions/{pk}/upload_photo
     */
    uploadPhotoApiV1AdmissionsPkUploadPhotoPatch: (
      pk: string,
      data: BodyUploadPhotoApiV1AdmissionsPkUploadPhotoPatch,
      params: RequestParams = {}
    ) =>
      this.request<UploadPhotoResponseDTO, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/upload_photo`,
        method: 'PATCH',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name FiltersApiV1AdmissionsFiltersSchoolIdGet
     * @summary Filters
     * @request GET:/api/v1/admissions/filters/{school_id}
     */
    filtersApiV1AdmissionsFiltersSchoolIdGet: (schoolId: string, params: RequestParams = {}) =>
      this.request<object, HTTPValidationError>({
        path: `/api/v1/admissions/filters/${schoolId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name GetGroupedLeadsBySectionApiV1AdmissionsSchoolIdGroupedBySectionGet
     * @summary Get Grouped Leads By Section
     * @request GET:/api/v1/admissions/{school_id}/grouped-by-section
     */
    getGroupedLeadsBySectionApiV1AdmissionsSchoolIdGroupedBySectionGet: (
      schoolId: string,
      query: {
        /**
         * School Cycle Id
         * @format uuid
         */
        school_cycle_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, number>, HTTPValidationError>({
        path: `/api/v1/admissions/${schoolId}/grouped-by-section`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name GetApplicationFormApiV1AdmissionsPkApplicationFormGet
     * @summary Get Application Form
     * @request GET:/api/v1/admissions/{pk}/application-form
     */
    getApplicationFormApiV1AdmissionsPkApplicationFormGet: (pk: string, params: RequestParams = {}) =>
      this.request<ApplicationFormEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/application-form`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name UpsertApplicationFormApiV1AdmissionsPkApplicationFormPut
     * @summary Upsert Application Form
     * @request PUT:/api/v1/admissions/{pk}/application-form
     */
    upsertApplicationFormApiV1AdmissionsPkApplicationFormPut: (
      pk: string,
      data: UpsertApplicationFormDto,
      params: RequestParams = {}
    ) =>
      this.request<ApplicationFormEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/application-form`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name GetMedicalFormApiV1AdmissionsPkMedicalFormGet
     * @summary Get Medical Form
     * @request GET:/api/v1/admissions/{pk}/medical-form
     */
    getMedicalFormApiV1AdmissionsPkMedicalFormGet: (pk: string, params: RequestParams = {}) =>
      this.request<MedicalFormEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/medical-form`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name UpsertMedicalFormApiV1AdmissionsPkMedicalFormPut
     * @summary Upsert Medical Form
     * @request PUT:/api/v1/admissions/{pk}/medical-form
     */
    upsertMedicalFormApiV1AdmissionsPkMedicalFormPut: (
      pk: string,
      data: UpsertMedicalFormDto,
      params: RequestParams = {}
    ) =>
      this.request<MedicalFormEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/medical-form`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name GetMedicalFormFieldsApiV1AdmissionsMedicalFormFieldsGet
     * @summary Get Medical Form Fields
     * @request GET:/api/v1/admissions/medical-form/fields
     */
    getMedicalFormFieldsApiV1AdmissionsMedicalFormFieldsGet: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/api/v1/admissions/medical-form/fields`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name UpdateStudentLeadApiV1AdmissionsPkStudentLeadPut
     * @summary Update Student Lead
     * @request PUT:/api/v1/admissions/{pk}/student-lead
     */
    updateStudentLeadApiV1AdmissionsPkStudentLeadPut: (
      pk: string,
      data: UpdateStudentLeadInfoDTO,
      params: RequestParams = {}
    ) =>
      this.request<StudentLeadEntity, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/student-lead`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admissions
     * @name DownloadAdmissionPdfApiV1AdmissionsPkPdfGet
     * @summary Download Admission Pdf
     * @request GET:/api/v1/admissions/{pk}/pdf
     */
    downloadAdmissionPdfApiV1AdmissionsPkPdfGet: (
      pk: string,
      query?: {
        /**
         * Download
         * @default true
         */
        download?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/admissions/${pk}/pdf`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name GetSchoolStepsApiV1SchoolStepSchoolIdGet
     * @summary Get School Steps
     * @request GET:/api/v1/school_step/{school_id}
     */
    getSchoolStepsApiV1SchoolStepSchoolIdGet: (
      schoolId: string,
      query?: {
        /**
         * Include Deleted
         * @default false
         */
        include_deleted?: boolean;
        /** Type */
        type?: SchoolStepTypeEnum | null;
        /** Tag */
        tag?: SchoolStepTags | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<SchoolStepEntity[], HTTPValidationError>({
        path: `/api/v1/school_step/${schoolId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name CreateSchoolStepsApiV1SchoolStepPost
     * @summary Create School Steps
     * @request POST:/api/v1/school_step/
     */
    createSchoolStepsApiV1SchoolStepPost: (
      data: CreateSchoolStepsDTO[],
      query?: {
        /**
         * Include Deleted
         * @default false
         */
        include_deleted?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<SchoolStepEntity[], HTTPValidationError>({
        path: `/api/v1/school_step/`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name DeleteSchoolStepApiV1SchoolStepSchoolStepIdDelete
     * @summary Delete School Step
     * @request DELETE:/api/v1/school_step/{school_step_id}
     */
    deleteSchoolStepApiV1SchoolStepSchoolStepIdDelete: (schoolStepId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/school_step/${schoolStepId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name UpsertSchoolStepDocsApiV1SchoolStepDocsPost
     * @summary Upsert School Step Docs
     * @request POST:/api/v1/school_step/docs
     */
    upsertSchoolStepDocsApiV1SchoolStepDocsPost: (data: UpsertSchoolStepDocsDTO[], params: RequestParams = {}) =>
      this.request<SchoolStepDocsEntity[], HTTPValidationError>({
        path: `/api/v1/school_step/docs`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name GetSchoolStepDocsApiV1SchoolStepSchoolStepIdDocsGet
     * @summary Get School Step Docs
     * @request GET:/api/v1/school_step/{school_step_id}/docs
     */
    getSchoolStepDocsApiV1SchoolStepSchoolStepIdDocsGet: (
      schoolStepId: string,
      query?: {
        /** Active */
        active?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<SchoolStepDocsEntity[], HTTPValidationError>({
        path: `/api/v1/school_step/${schoolStepId}/docs`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name GetSchoolStepDocsTagsApiV1SchoolStepDocsTagsGet
     * @summary Get School Step Docs Tags
     * @request GET:/api/v1/school_step/docs/tags
     */
    getSchoolStepDocsTagsApiV1SchoolStepDocsTagsGet: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/api/v1/school_step/docs/tags`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name GetSchoolStepDocByIdApiV1SchoolStepDocsSchoolStepDocIdGet
     * @summary Get School Step Doc By Id
     * @request GET:/api/v1/school_step/docs/{school_step_doc_id}
     */
    getSchoolStepDocByIdApiV1SchoolStepDocsSchoolStepDocIdGet: (schoolStepDocId: string, params: RequestParams = {}) =>
      this.request<SchoolStepDocsEntity, HTTPValidationError>({
        path: `/api/v1/school_step/docs/${schoolStepDocId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name ListSchoolStepResourcesApiV1SchoolStepSchoolStepIdResourcesGet
     * @summary List School Step Resources
     * @request GET:/api/v1/school_step/{school_step_id}/resources
     */
    listSchoolStepResourcesApiV1SchoolStepSchoolStepIdResourcesGet: (
      schoolStepId: string,
      params: RequestParams = {}
    ) =>
      this.request<SchoolStepResourceEntity[], HTTPValidationError>({
        path: `/api/v1/school_step/${schoolStepId}/resources`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name CreateSchoolStepResourcesApiV1SchoolStepSchoolStepIdResourcesPost
     * @summary Create School Step Resources
     * @request POST:/api/v1/school_step/{school_step_id}/resources
     */
    createSchoolStepResourcesApiV1SchoolStepSchoolStepIdResourcesPost: (
      schoolStepId: string,
      data: CreateSchoolStepResourceDto,
      params: RequestParams = {}
    ) =>
      this.request<SchoolStepResourceEntity, HTTPValidationError>({
        path: `/api/v1/school_step/${schoolStepId}/resources`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name UpdateSchoolStepResourceApiV1SchoolStepSchoolStepIdResourcesResourceIdPatch
     * @summary Update School Step Resource
     * @request PATCH:/api/v1/school_step/{school_step_id}/resources/{resource_id}
     */
    updateSchoolStepResourceApiV1SchoolStepSchoolStepIdResourcesResourceIdPatch: (
      schoolStepId: string,
      resourceId: string,
      data: UpdateSchoolStepResourceDto,
      params: RequestParams = {}
    ) =>
      this.request<SchoolStepResourceEntity, HTTPValidationError>({
        path: `/api/v1/school_step/${schoolStepId}/resources/${resourceId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags school_step
     * @name DeleteSchoolStepResourceApiV1SchoolStepSchoolStepIdResourcesResourceIdDelete
     * @summary Delete School Step Resource
     * @request DELETE:/api/v1/school_step/{school_step_id}/resources/{resource_id}
     */
    deleteSchoolStepResourceApiV1SchoolStepSchoolStepIdResourcesResourceIdDelete: (
      schoolStepId: string,
      resourceId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/school_step/${schoolStepId}/resources/${resourceId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admission_step
     * @name UpdateAdmissionStepApiV1AdmissionStepPkPut
     * @summary Update Admission Step
     * @request PUT:/api/v1/admission_step/{pk}
     */
    updateAdmissionStepApiV1AdmissionStepPkPut: (
      pk: string,
      data: UpdateAdmissionStepDTO,
      params: RequestParams = {}
    ) =>
      this.request<AdmissionStepEntity, HTTPValidationError>({
        path: `/api/v1/admission_step/${pk}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admission_step
     * @name CreateAdmissionStepApiV1AdmissionStepPost
     * @summary Create Admission Step
     * @request POST:/api/v1/admission_step/
     */
    createAdmissionStepApiV1AdmissionStepPost: (data: CreateAdmissionStepDTO, params: RequestParams = {}) =>
      this.request<AdmissionStepEntity, HTTPValidationError>({
        path: `/api/v1/admission_step/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags admission_step
     * @name UpsertAdmissionStepApiV1AdmissionStepPut
     * @summary Upsert Admission Step
     * @request PUT:/api/v1/admission_step/
     */
    upsertAdmissionStepApiV1AdmissionStepPut: (data: UpsertAdmissionStepDTO, params: RequestParams = {}) =>
      this.request<AdmissionStepEntity, HTTPValidationError>({
        path: `/api/v1/admission_step/`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
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
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags files
     * @name GetFilesApiV1FilesSchoolIdGet
     * @summary Get Files
     * @request GET:/api/v1/files/{school_id}
     */
    getFilesApiV1FilesSchoolIdGet: (
      schoolId: string,
      query?: {
        /** Ids */
        ids?: string[];
        /**
         * Download
         * @default false
         */
        download?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<UrlFileEntity[], HTTPValidationError>({
        path: `/api/v1/files/${schoolId}`,
        method: 'GET',
        query: query,
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
     */
    deleteFileApiV1FilesPkDelete: (pk: string, params: RequestParams = {}) =>
      this.request<any, HTTPValidationError>({
        path: `/api/v1/files/${pk}`,
        method: 'DELETE',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signature_templates
     * @name CreateSignatureTemplateApiV1SignatureTemplatesPost
     * @summary Create Signature Template
     * @request POST:/api/v1/signature_templates/
     */
    createSignatureTemplateApiV1SignatureTemplatesPost: (
      data: CreateSignatureTemplateDTO,
      params: RequestParams = {}
    ) =>
      this.request<SignatureTemplateEntity, HTTPValidationError>({
        path: `/api/v1/signature_templates/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signature_templates
     * @name ListSignatureTemplatesApiV1SignatureTemplatesGet
     * @summary List Signature Templates
     * @request GET:/api/v1/signature_templates/
     */
    listSignatureTemplatesApiV1SignatureTemplatesGet: (
      query?: {
        /** School Step Id */
        school_step_id?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<SignatureTemplateEntity[], HTTPValidationError>({
        path: `/api/v1/signature_templates/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signature_templates
     * @name GetSignatureTemplateApiV1SignatureTemplatesIdGet
     * @summary Get Signature Template
     * @request GET:/api/v1/signature_templates/{id}
     */
    getSignatureTemplateApiV1SignatureTemplatesIdGet: (id: string, params: RequestParams = {}) =>
      this.request<SignatureTemplateEntity, HTTPValidationError>({
        path: `/api/v1/signature_templates/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signature_templates
     * @name UpdateSignatureTemplateApiV1SignatureTemplatesIdPatch
     * @summary Update Signature Template
     * @request PATCH:/api/v1/signature_templates/{id}
     */
    updateSignatureTemplateApiV1SignatureTemplatesIdPatch: (
      id: string,
      data: UpdateSignatureTemplateDTO,
      params: RequestParams = {}
    ) =>
      this.request<SignatureTemplateEntity, HTTPValidationError>({
        path: `/api/v1/signature_templates/${id}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags signature_templates
     * @name DeleteSignatureTemplateApiV1SignatureTemplatesIdDelete
     * @summary Delete Signature Template
     * @request DELETE:/api/v1/signature_templates/{id}
     */
    deleteSignatureTemplateApiV1SignatureTemplatesIdDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/signature_templates/${id}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name GetFormsApiV1FormsGet
     * @summary Get Forms
     * @request GET:/api/v1/forms/
     */
    getFormsApiV1FormsGet: (
      query?: {
        /** Tag */
        tag?: SchoolStepTags | null;
        /** School Id */
        school_id?: string | null;
        /** Category */
        category?: string | null;
        /** Created By */
        created_by?: string | null;
        /** Include Layout */
        include_layout?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<FormEntity[], HTTPValidationError>({
        path: `/api/v1/forms/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name CreateFormApiV1FormsPost
     * @summary Create Form
     * @request POST:/api/v1/forms/
     */
    createFormApiV1FormsPost: (data: CreateFormDTO, params: RequestParams = {}) =>
      this.request<FormEntity, HTTPValidationError>({
        path: `/api/v1/forms/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name GetFormApiV1FormsPkGet
     * @summary Get Form
     * @request GET:/api/v1/forms/{pk}
     */
    getFormApiV1FormsPkGet: (
      pk: string,
      query?: {
        /** School Id */
        school_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<FormEntity, HTTPValidationError>({
        path: `/api/v1/forms/${pk}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name UpdateFormApiV1FormsPkPatch
     * @summary Update Form
     * @request PATCH:/api/v1/forms/{pk}
     */
    updateFormApiV1FormsPkPatch: (pk: string, data: UpdateFormDTO, params: RequestParams = {}) =>
      this.request<FormEntity, HTTPValidationError>({
        path: `/api/v1/forms/${pk}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name DeleteFormApiV1FormsPkDelete
     * @summary Delete Form
     * @request DELETE:/api/v1/forms/{pk}
     */
    deleteFormApiV1FormsPkDelete: (pk: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/forms/${pk}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name GetAnswersApiV1FormsPkAnswersGet
     * @summary Get Answers
     * @request GET:/api/v1/forms/{pk}/answers
     */
    getAnswersApiV1FormsPkAnswersGet: (
      pk: string,
      query: {
        /**
         * Answered For
         * @format uuid
         */
        answered_for: string;
        /** Answered By */
        answered_by?: string | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<AnswerEntity[], HTTPValidationError>({
        path: `/api/v1/forms/${pk}/answers`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name UpsertAnswersAndCompleteStepApiV1FormsPkAnswersPut
     * @summary Upsert Answers And Complete Step
     * @request PUT:/api/v1/forms/{pk}/answers
     */
    upsertAnswersAndCompleteStepApiV1FormsPkAnswersPut: (
      pk: string,
      data: UpsertAnswerDTO[],
      params: RequestParams = {}
    ) =>
      this.request<AnswerEntity[], HTTPValidationError>({
        path: `/api/v1/forms/${pk}/answers`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags forms
     * @name ValidateFormCompletionApiV1FormsValidateCompletionPost
     * @summary Validate Form Completion
     * @request POST:/api/v1/forms/validate-completion
     */
    validateFormCompletionApiV1FormsValidateCompletionPost: (
      data: ValidateFormCompletionDTO,
      params: RequestParams = {}
    ) =>
      this.request<FormCompletionResponseDTO, HTTPValidationError>({
        path: `/api/v1/forms/validate-completion`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name GetQuestionsApiV1QuestionsGet
     * @summary Get Questions
     * @request GET:/api/v1/questions/
     */
    getQuestionsApiV1QuestionsGet: (params: RequestParams = {}) =>
      this.request<QuestionEntity[], any>({
        path: `/api/v1/questions/`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name CreateQuestionsApiV1QuestionsPost
     * @summary Create Questions
     * @request POST:/api/v1/questions/
     */
    createQuestionsApiV1QuestionsPost: (data: CreateQuestionDTO[], params: RequestParams = {}) =>
      this.request<QuestionEntity[], HTTPValidationError>({
        path: `/api/v1/questions/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name UpdateQuestionApiV1QuestionsPkPatch
     * @summary Update Question
     * @request PATCH:/api/v1/questions/{pk}
     */
    updateQuestionApiV1QuestionsPkPatch: (pk: string, data: UpdateQuestionDTO, params: RequestParams = {}) =>
      this.request<QuestionEntity, HTTPValidationError>({
        path: `/api/v1/questions/${pk}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags answers
     * @name UpsertAnswersApiV1AnswersPut
     * @summary Upsert Answers
     * @request PUT:/api/v1/answers/
     */
    upsertAnswersApiV1AnswersPut: (data: UpsertAnswerDTO[], params: RequestParams = {}) =>
      this.request<AnswerEntity[], HTTPValidationError>({
        path: `/api/v1/answers/`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags templates
     * @name GetTemplatesApiV1TemplatesGet
     * @summary Get Templates
     * @request GET:/api/v1/templates/
     */
    getTemplatesApiV1TemplatesGet: (
      query?: {
        /** Tag */
        tag?: SchoolStepTags | null;
        /** School Id */
        school_id?: string | null;
        /** Category */
        category?: string | null;
        /** Created By */
        created_by?: string | null;
        /** Include Layout */
        include_layout?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<TemplateEntity[], HTTPValidationError>({
        path: `/api/v1/templates/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags templates
     * @name CreateTemplateApiV1TemplatesPost
     * @summary Create Template
     * @request POST:/api/v1/templates/
     */
    createTemplateApiV1TemplatesPost: (data: CreateTemplateDTO, params: RequestParams = {}) =>
      this.request<TemplateEntity, HTTPValidationError>({
        path: `/api/v1/templates/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags templates
     * @name GetTemplateApiV1TemplatesPkGet
     * @summary Get Template
     * @request GET:/api/v1/templates/{pk}
     */
    getTemplateApiV1TemplatesPkGet: (pk: string, params: RequestParams = {}) =>
      this.request<TemplateEntity, HTTPValidationError>({
        path: `/api/v1/templates/${pk}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags templates
     * @name UpdateTemplateApiV1TemplatesPkPatch
     * @summary Update Template
     * @request PATCH:/api/v1/templates/{pk}
     */
    updateTemplateApiV1TemplatesPkPatch: (pk: string, data: UpdateTemplateDTO, params: RequestParams = {}) =>
      this.request<TemplateEntity, HTTPValidationError>({
        path: `/api/v1/templates/${pk}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags templates
     * @name DeleteTemplateApiV1TemplatesPkDelete
     * @summary Delete Template
     * @request DELETE:/api/v1/templates/{pk}
     */
    deleteTemplateApiV1TemplatesPkDelete: (pk: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/templates/${pk}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags reports
     * @name ExtractFormDataApiV1ReportsGet
     * @summary Extract Form Data
     * @request GET:/api/v1/reports/
     */
    extractFormDataApiV1ReportsGet: (
      query: {
        tag: SchoolStepTagsDTO;
        /**
         * School Id
         * @format uuid
         */
        school_id: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ReportDataDTO, HTTPValidationError>({
        path: `/api/v1/reports/`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags backoffice
     * @name ResetAdmissionsSelfServiceApiV1BackofficeSchoolIdResetDelete
     * @summary Reset Admissions Self Service
     * @request DELETE:/api/v1/backoffice/{school_id}/reset
     */
    resetAdmissionsSelfServiceApiV1BackofficeSchoolIdResetDelete: (schoolId: string, params: RequestParams = {}) =>
      this.request<void, HTTPValidationError>({
        path: `/api/v1/backoffice/${schoolId}/reset`,
        method: 'DELETE',
        ...params,
      }),
  };
}
