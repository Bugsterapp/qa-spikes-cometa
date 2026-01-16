import {
  ConceptAutoAssignedGrade,
  ConceptAutoAssignedLevel,
  ConceptAutoAssignedSection,
  ListConceptAutoAssignResponseDTO,
} from '@cometa/trpc/src/types';
import { forwardRef, useEffect, useState } from 'react';
import { z } from 'zod';
import Tree, { TreeNode, TreeNodeProps } from 'rc-tree';
import IcArrow from '/public/assets/icons/ic_arrow_right.svg';
import { DataNode } from 'rc-tree/lib/interface';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from '../atoms/RadixCheckbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

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
      key: item.id,
      title: item.name,
      disableCheckbox: false,
      children: transformedChildren,
      isLeaf: transformedChildren.length === 0,
    };

    return transformedNode;
  });
}

interface TreeCheckboxProps {
  treeData: DataNode[];
  onCheck?: ({ checkedKeys, checkedSections }: { checkedKeys: string[]; checkedSections: string[] }) => void;
  className?: string;
  isLoading?: boolean;
}

const TreeCheckbox = ({ treeData, onCheck, className, isLoading }: TreeCheckboxProps) => {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [checkedKeysLeaf, setCheckedKeysLeaf] = useState<string[]>([]);

  const switcher = (obj: TreeNodeProps<DataNode>) => {
    if (obj.isLeaf) {
      return;
    }
    return (
      <span className="w-1">
        <IcArrow className={`${obj.expanded && 'rotate-90'} cursor-pointer`} />
      </span>
    );
  };
  const handleCheck = (checked: CheckedState, node: DataNode) => {
    let checkedKeysToSave = [...checkedIds];
    let checkedKeysLeafToSave = [...checkedKeysLeaf];

    const addNodeAndChildren = (node: DataNode) => {
      if (!checkedKeysToSave.includes(node.key as string) && !node.disableCheckbox) {
        checkedKeysToSave.push(node.key as string);
        if (node.isLeaf) checkedKeysLeafToSave.push(node.key as string);
      }
      if (node.children && node.children.length > 0 && !node.disableCheckbox) {
        node.children.forEach((child) => addNodeAndChildren(child));
      }
    };

    const removeParents = (node: DataNode) => {
      treeData.forEach((item) => {
        const childToRemove = item.children?.find((child) => child.key === node.key);
        if (childToRemove) {
          checkedKeysToSave = checkedKeysToSave.filter((id) => id !== item.key);
        } else {
          item.children?.forEach((child) => {
            const grandChildToRemove = child.children?.find((grandChild) => grandChild.key === node.key);
            if (grandChildToRemove) {
              checkedKeysToSave = checkedKeysToSave.filter((id) => id !== item.key);
              checkedKeysToSave = checkedKeysToSave.filter((id) => id !== child.key);
            }
          });
        }
      });
    };
    const removeNodeAndChildren = (node: DataNode) => {
      checkedKeysToSave = checkedKeysToSave.filter((item) => item !== node.key);
      checkedKeysLeafToSave = checkedKeysLeafToSave.filter((item) => item !== node.key);
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => removeNodeAndChildren(child));
      }
    };

    if (checked) {
      addNodeAndChildren(node);
    } else {
      removeParents(node);
      removeNodeAndChildren(node);
    }

    setCheckedIds(checkedKeysToSave);
    setCheckedKeysLeaf(checkedKeysLeafToSave);
    onCheck?.({
      checkedKeys: checkedKeysToSave,
      checkedSections: checkedKeysLeafToSave,
    });
  };

  const renderTreeNodesLoading = () =>
    Array.from({ length: 2 }).map((_, indexFirst) => (
      <TreeNode
        title={
          <div className="flex flex-row items-center ml-3">
            <span className="h-5 text-sm text-center">Cargando...</span>
          </div>
        }
        key={`loading-${indexFirst}`}
        icon={() => <Checkbox disabled />}
        className="flex flex-row items-center justify-center"
        isLeaf={false}
      >
        {Array.from({ length: 1 }).map((_, indexSecond) => (
          <TreeNode
            title={
              <div className="flex flex-row items-center ml-3">
                <span className="h-5 text-sm text-center">Cargando...</span>
              </div>
            }
            key={`loading-${indexFirst}-${indexSecond}`}
            icon={() => <Checkbox disabled />}
            className="flex flex-row items-center justify-center"
          />
        ))}
      </TreeNode>
    ));

  const renderTreeNodes = (data: DataNode[]) =>
    data.map((item) => (
      <TreeNode
        title={
          <div className="flex flex-row items-center ml-3">
            <span className="h-5 text-sm text-center">{item.title?.toString()}</span>
          </div>
        }
        key={item.key}
        icon={(node) => {
          const { disableCheckbox, checked, halfChecked } = node;
          return (
            <Checkbox
              checked={checked ? true : halfChecked ? 'indeterminate' : false}
              disabled={disableCheckbox}
              onCheckedChange={(checked) => {
                handleCheck(checked, item);
              }}
            />
          );
        }}
        className="flex flex-row items-center justify-center"
      >
        {item.children ? renderTreeNodes(item.children) : null}
      </TreeNode>
    ));

  return (
    <Tree
      checkable
      defaultExpandAll={isLoading}
      checkedKeys={checkedIds}
      selectable={false}
      switcherIcon={switcher}
      showIcon
      className={className}
    >
      {isLoading ? renderTreeNodesLoading() : renderTreeNodes(treeData)}
    </Tree>
  );
};

const schema = z.object({
  checkedData: z.object({
    checkedKeys: z.string().array().min(1, 'Selecciona al menos una sesión'),
    checkedSections: z.string().array().min(1, 'Selecciona al menos una sesión'),
  }),
});

export type EditAutoAssignmentFormSchema = z.infer<typeof schema>;

interface EditAutoAssignmentFormProps {
  onSubmit: (data: EditAutoAssignmentFormSchema) => void;
  onValidChange?: (value: boolean) => void;
  autoAssignList?: ListConceptAutoAssignResponseDTO[];
  isLoading?: boolean;
}

const EditAutoAssignmentForm = forwardRef<HTMLFormElement, EditAutoAssignmentFormProps>(
  ({ autoAssignList, onSubmit, onValidChange, isLoading = false }, ref) => {
    const treeDataNodes = conceptAutoAssignToTreeData(autoAssignList ?? []);
    const treeData = treeDataNodes.filter(({ children }) => children && children.length > 0);

    const { control, formState, handleSubmit } = useForm<EditAutoAssignmentFormSchema>({
      resolver: zodResolver(schema),
      defaultValues: {
        checkedData: {
          checkedKeys: [],
          checkedSections: [],
        },
      },
    });

    useEffect(() => {
      if (onValidChange) onValidChange(formState.isValid);
    }, [formState.isValid, onValidChange]);

    return (
      <form className="space-y-6" ref={ref} onSubmit={handleSubmit(onSubmit)}>
        <div className="px-8">
          <span className="text-lg font-bold">Selecciona a que niveles, grados o secciones estará</span>
        </div>
        <div className="px-4">
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
        </div>
      </form>
    );
  }
);

export default EditAutoAssignmentForm;
