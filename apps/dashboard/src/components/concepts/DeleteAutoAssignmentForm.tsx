import {
  ConceptAutoAssignedGrade,
  ConceptAutoAssignedLevel,
  ConceptAutoAssignedSection,
  ListConceptAutoAssignResponseDTO,
} from '@cometa/trpc/src/types';
import { forwardRef, useEffect } from 'react';
import { z } from 'zod';
import { DataNode } from 'rc-tree/lib/interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import TreeCheckbox from './components/TreeCheckbox';

function conceptAutoAssignToTreeData(
  data: (
    | ListConceptAutoAssignResponseDTO
    | ConceptAutoAssignedSection
    | ConceptAutoAssignedGrade
    | ConceptAutoAssignedLevel
  )[]
): DataNode[] {
  return data.map((item) => {
    const renderChildren = (
      children:
        | ListConceptAutoAssignResponseDTO
        | ConceptAutoAssignedSection
        | ConceptAutoAssignedGrade
        | ConceptAutoAssignedLevel
    ) => {
      if ('sections' in children) return conceptAutoAssignToTreeData(children.sections);
      if ('grades' in children) return conceptAutoAssignToTreeData(children.grades);
      return null;
    };

    const transformedChildren = renderChildren(item) ?? [];

    const transformedNode: DataNode = {
      key: 'concept_availability_id' in item ? (item.concept_availability_id as string) : item.id,
      title: item.name,
      disabled: 'is_already_assigned' in item ? item.is_already_assigned : item.is_all_assigned,
      children: transformedChildren,
      isLeaf: transformedChildren.length === 0,
    };

    return transformedNode;
  });
}

const schema = z.object({
  checkedData: z.object({
    checkedKeys: z.string().array().min(1, 'Selecciona al menos una sesión'),
    checkedKeysLeaf: z.string().array().min(1, 'Selecciona al menos una sesión'),
  }),
});

export type DeleteAutoAssignmentFormSchema = z.infer<typeof schema>;

interface DeleteAutoAssignmentFormProps {
  onSubmit: (data: DeleteAutoAssignmentFormSchema) => void;
  onValidChange?: (value: boolean) => void;
  autoAssignList?: ListConceptAutoAssignResponseDTO[];
  isLoading?: boolean;
}

const DeleteAutoAssignmentForm = forwardRef<HTMLFormElement, DeleteAutoAssignmentFormProps>(
  ({ autoAssignList, onSubmit, onValidChange, isLoading = false }, ref) => {
    const treeDataNodes = conceptAutoAssignToTreeData(autoAssignList ?? []);
    const treeData = treeDataNodes.filter(({ children }) => children && children.length > 0);

    const { control, formState, handleSubmit } = useForm<DeleteAutoAssignmentFormSchema>({
      resolver: zodResolver(schema),
      defaultValues: {
        checkedData: {
          checkedKeys: [],
          checkedKeysLeaf: [],
        },
      },
    });

    useEffect(() => {
      if (onValidChange) onValidChange(formState.isValid);
    }, [formState.isValid, onValidChange]);

    return (
      <form className="space-y-6" ref={ref} onSubmit={handleSubmit(onSubmit)}>
        <div className="px-8">
          <span className="text-lg font-bold">
            Selecciona a que niveles, grados o secciones le quitarás la autoasignación.
          </span>
        </div>
        <Controller
          control={control}
          name="checkedData"
          render={({ field }) => (
            <TreeCheckbox
              isLoading={isLoading || treeData.length === 0}
              treeData={treeData}
              onCheck={(checkedKeys) => {
                field.onChange(checkedKeys);
              }}
            />
          )}
        />
      </form>
    );
  }
);

export default DeleteAutoAssignmentForm;
