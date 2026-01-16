import { FormSection as Layout } from '@cometa/trpc/src/admissions/types';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DynamicQuestionsSection } from './DynamicQuestionsSection';

type Validations = {
  visibleConditionValue?: string | null;
};

type FormSectionProps = {
  section: Layout;
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  extraFields: [Record<string, string>, Dispatch<SetStateAction<Record<string, string>>>];
  validations?: Validations;
  cols?: number;
};

export function DynamicFormSection({ section, form, extraFields, validations, cols }: FormSectionProps) {
  return (
    <>
      <Title section={section} />
      <DynamicQuestionsSection
        section={section}
        form={form}
        extraFields={extraFields}
        validations={validations}
        cols={cols}
      />
    </>
  );
}

function Title({ section }: { section: { name: string; description: string } }) {
  if (!section.name) return null;

  return (
    <div className="mb-4">
      <h3 className="text-[#1c1c1d] font-bold text-xl">{section.name}</h3>
      <p className="text-[#3e4559] my-1">{section.description}</p>
    </div>
  );
}
