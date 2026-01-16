import { cn } from '@cometa/utils';
import { EmptyState } from './empty-state';
import { DocumentEmptyIcon, HelpIcon } from '../../icons';
import { ChevronLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type PhoneMockupProps = {
  children: React.ReactNode;
  className?: string;
};

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-72 h-[600px] bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-[45px] p-1 shadow-2xl">
        <div className="w-full h-full bg-black rounded-[40px] relative">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
          <div className="absolute top-2 left-[calc(50%-46px)] h-3 w-3 bg-neutral-900 rounded-full z-10" />

          <div className="absolute inset-2 bg-white rounded-[35px] overflow-hidden">{children}</div>
        </div>
      </div>

      <div className="absolute inset-0 bg-black opacity-20 rounded-[45px] transform translate-y-2 -z-10" />
    </div>
  );
}

type PhoneContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PhoneContainer({ children, className }: PhoneContainerProps) {
  return (
    <div className={cn('h-full overflow-y-auto scroll-hidden font-lota antialiased', className)}>
      {children}

      <HelpIcon className="fixed bottom-10 right-6 w-10 h-10" />
    </div>
  );
}

type PhoneHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  isMain?: boolean;
};

export function PhoneHeader({ title, subtitle, description, isMain = false }: PhoneHeaderProps) {
  if (isMain) {
    return (
      <>
        <div className="bg-galaxy-600 bg-[url('/assets/admissions/section-bg.svg')] bg-center px-4 pb-6 pt-10 text-white flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <h3 className="text-[10px]">{title}</h3>
          </div>
          {subtitle ? <p className="text-sm font-semibold">{subtitle}</p> : null}
          {description ? <p className="text-[10px]">{description}</p> : null}
        </div>
        <div className="h-2 bg-white -mt-2 rounded-t-lg" />
      </>
    );
  }

  return (
    <div className="px-4 pb-2 pt-10 flex flex-col gap-2 text-neutral-900">
      <div className="flex items-center gap-1">
        <ChevronLeftIcon className="w-6 h-6 rounded-full bg-neutral-100 p-1" />
        <span className="text-xs font-semibold uppercase text-neutral-700">Volver</span>
      </div>

      {title ? <h3 className="font-semibold">{title}</h3> : null}
      {description ? <p className="text-[10px]">{description}</p> : null}
    </div>
  );
}

type PhoneBodyProps = {
  children: React.ReactNode;
  className?: string;
  isFullHeight?: boolean;
};

export function PhoneBody({ children, className, isFullHeight = false }: PhoneBodyProps) {
  return (
    <div
      className={cn(
        'h-[calc(100%-140px)] overflow-y-auto scroll-hidden p-4 pt-2 relative',
        { 'h-full': isFullHeight },
        className
      )}
    >
      <div className="pointer-events-none">{children}</div>
      <div className="absolute inset-0 pointer-events-auto" />
    </div>
  );
}

export function PhoneEmptyState() {
  return (
    <PhoneContainer>
      <EmptyState
        icon={<DocumentEmptyIcon />}
        title="Vista previa vacía"
        description="Se mostrará en cuanto configures el primer documento."
      />
    </PhoneContainer>
  );
}

export function detectFieldType(
  field: string,
  label: string,
  type?: string
): 'select' | 'multiselect' | 'radio' | 'textarea' | 'checkbox' | 'input' {
  const labelLower = label.toLowerCase();
  const typeLower = type?.toString().toLowerCase() || '';

  if (
    [
      'blood_type',
      'laterality',
      'emergency_contact_relationship',
      'nationality',
      'state',
      'guardian_relationship',
      'additional_guardian_relationship',
    ].includes(field) ||
    typeLower.includes('select') ||
    typeLower.includes('dropdown') ||
    typeLower.includes('option')
  ) {
    return 'select';
  }

  if (
    ['family_history', 'personal_history', 'current_ailments', 'drugs'].includes(field) ||
    typeLower.includes('multi') ||
    typeLower.includes('checkbox_group')
  ) {
    return 'multiselect';
  }

  if (
    [
      'has_allergies',
      'require_drugs',
      'authorize_emergency_transfer',
      'authorize_physical_activity',
      'has_private_doctor',
      'has_private_insurance',
      'has_all_vaccines',
      'is_outside_mx',
    ].includes(field) ||
    typeLower.includes('radio') ||
    typeLower.includes('boolean') ||
    labelLower.includes('¿')
  ) {
    return 'radio';
  }

  if (
    [
      'recent_interventions',
      'other_history',
      'drug_allergies',
      'food_allergies',
      'plant_allergies',
      'other_allergies',
      'dietary_restrictions',
      'pending_vaccines',
      'comments',
    ].includes(field) ||
    typeLower.includes('text_area') ||
    typeLower.includes('textarea') ||
    typeLower.includes('long_text')
  ) {
    return 'textarea';
  }

  if (
    field === 'accept_truthfulness' ||
    typeLower.includes('checkbox') ||
    labelLower.includes('acepto') ||
    labelLower.includes('autorizo')
  ) {
    return 'checkbox';
  }

  return 'input';
}

export function PhoneFieldPreview({ field, label, type }: { field?: string; label: string; type?: string }) {
  const fieldType = detectFieldType(field || '', label, type);

  if (fieldType === 'select') {
    return (
      <div className="bg-white border border-neutral-200 rounded p-2 text-neutral-400 text-xs flex justify-between items-center">
        <span>{label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  }

  if (fieldType === 'multiselect') {
    return (
      <div className="bg-white border border-neutral-200 rounded p-2 text-neutral-400 text-xs flex justify-between items-center">
        <span>{label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  }

  if (fieldType === 'radio') {
    return (
      <div className="space-y-1">
        <p className="text-xs text-neutral-700">{label}</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-neutral-300 rounded-full bg-white" />
            <span className="text-xs text-neutral-700">Sí</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-neutral-300 rounded-full bg-white" />
            <span className="text-xs text-neutral-700">No</span>
          </div>
        </div>
      </div>
    );
  }

  if (fieldType === 'textarea') {
    return <div className="bg-white border border-neutral-200 rounded p-2 h-12 text-neutral-400 text-xs">{label}</div>;
  }

  if (fieldType === 'checkbox') {
    return (
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 border border-neutral-300 rounded bg-white" />
        <span className="text-xs text-neutral-700">{label}</span>
      </div>
    );
  }

  return <div className="bg-white border border-neutral-200 rounded p-2 text-neutral-400 text-xs">{label}</div>;
}

export function PhoneSectionPreview({
  title,
  fields,
  fieldLabels,
}: {
  title: string;
  fields: string[];
  fieldLabels: Record<string, string>;
}) {
  return (
    <div className="bg-neutral-25 border border-neutral-100 rounded-lg p-4">
      <h3 className="text-neutral-900 font-semibold mb-2 text-xs">{title}</h3>

      <div className="space-y-3">
        {fields.map((field) => (
          <motion.div
            key={field}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
              layout: { duration: 0.3, ease: 'easeInOut' },
            }}
          >
            <PhoneFieldPreview field={field} label={fieldLabels[field] || field} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function PhoneBooleanSectionPreview({
  title,
  questions,
}: {
  title: string;
  questions: Array<{ id: string; label: string; description?: string; type?: any }>;
}) {
  return (
    <div className="bg-neutral-25 border border-neutral-100 rounded-lg p-4">
      <h3 className="text-neutral-900 font-semibold text-xs">{title}</h3>

      <div className="space-y-4">
        {questions.map((question) => (
          <motion.div
            key={question.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
              layout: { duration: 0.3, ease: 'easeInOut' },
            }}
            className="space-y-1"
          >
            <h4 className="text-xs font-semibold text-neutral-900">{question.label}</h4>

            {question.description ? (
              <p className="text-[10px] text-neutral-700 leading-relaxed">{question.description}</p>
            ) : null}

            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-neutral-300 rounded-full bg-white" />
                <span className="text-xs text-neutral-700">Sí, acepto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-neutral-300 rounded-full bg-white" />
                <span className="text-xs text-neutral-700">No acepto</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function PhoneStepsPreview({
  steps,
  currentStepId,
  maxVisibleSteps = 6,
}: {
  steps: Array<{ id?: string | null; name?: string | null; description?: string | null }>;
  currentStepId: string | null | undefined;
  maxVisibleSteps?: number;
}) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  function getVisibleSteps() {
    if (steps.length <= maxVisibleSteps) {
      return steps;
    }

    let startIndex = Math.max(0, currentStepIndex - 1);
    const endIndex = Math.min(steps.length, startIndex + maxVisibleSteps);

    if (endIndex - startIndex < maxVisibleSteps && steps.length >= maxVisibleSteps) {
      startIndex = Math.max(0, endIndex - maxVisibleSteps);
    }

    return steps.slice(startIndex, endIndex);
  }

  const visibleSteps = getVisibleSteps();

  return (
    <div className="space-y-3">
      {visibleSteps.map((step, index) => {
        const isCurrentStep = step.id === currentStepId;

        return (
          <div key={step.id || index} className="relative flex items-start">
            <div className="absolute left-0 top-3 -bottom-6 flex flex-col items-center">
              <div
                className={cn('w-4 h-4 rounded-full border flex items-center justify-center', {
                  'border-galaxy-500 bg-galaxy-100': isCurrentStep,
                  'border-neutral-300 bg-white': !isCurrentStep,
                })}
              />
              {index < visibleSteps.length - 1 ? <div className="w-[1px] flex-1 bg-neutral-300" /> : null}
            </div>

            <div
              className={cn('w-full ml-8 px-3 py-2 border rounded-lg', {
                'border-galaxy-300 bg-galaxy-50': isCurrentStep,
                'border-neutral-300 bg-white': !isCurrentStep,
              })}
            >
              <h3 className="font-semibold text-sm text-neutral-900">{step.name || 'Sin título'}</h3>
              <p className="text-[10px] mb-2 mt-1 text-neutral-700">{step.description || 'Sin descripción'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
