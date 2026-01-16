'use client';

import type { AnswerEntity, FormSection as Layout } from '@cometa/trpc/src/admissions/types';
import { DynamicFormSection, useDynamicFormControl } from '@cometa/dynamic-forms';
import { Dispatch, ReactNode, SetStateAction } from 'react';

type Validations = {
  visibleConditionValue?: string | null;
};

type FormBuilderProps = {
  layout: Layout[];
  children: ReactNode;
  onSubmit: (data: any) => void;
  answers: AnswerEntity[] | undefined;
  extraFields: [Record<string, string>, Dispatch<SetStateAction<Record<string, string>>>];
  validations?: Validations;
};

export function FormBuilder({ layout, children, onSubmit, answers, extraFields, validations }: FormBuilderProps) {
  const { form } = useDynamicFormControl(layout, answers, {}, validations);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {layout.map((section) => (
        <div key={section.name} className="bg-[#fbfcfd] border border-[#e4ebf6] rounded-lg p-6">
          <DynamicFormSection section={section} form={form} extraFields={extraFields} validations={validations} />
        </div>
      ))}

      {children}
    </form>
  );
}

function Layout({ section }: { section: { name: string; description: string } }) {
  if (!section.name) return null;

  return (
    <div className="mb-4">
      <h3 className="text-[#1c1c1d] font-bold text-xl">{section.name}</h3>
      <p className="text-[#3e4559] my-1">{section.description}</p>
    </div>
  );
}
