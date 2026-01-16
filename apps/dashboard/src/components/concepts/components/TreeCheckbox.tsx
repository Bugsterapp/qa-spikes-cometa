import { useState } from 'react';
import Tree, { TreeNode, TreeNodeProps } from 'rc-tree';
import { convertDataToEntities } from 'rc-tree/lib/utils/treeUtil';
import getEntity from 'rc-tree/lib/utils/keyUtil';
import IcArrow from '/public/assets/icons/ic_arrow_right.svg';
import { DataEntity, DataNode, KeyEntities } from 'rc-tree/lib/interface';
import { CheckedState } from '@radix-ui/react-checkbox';
import { cn } from '@cometa/utils';
import { Checkbox } from '../../atoms/RadixCheckbox';

const TreeNodesLoading = () => (
  <>
    {Array.from({ length: 2 }).map((_, indexFirst) => (
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
            isLeaf
            key={`loading-${indexFirst}-${indexSecond}`}
            icon={() => <Checkbox disabled />}
            className="flex flex-row items-center justify-center"
          />
        ))}
      </TreeNode>
    ))}
  </>
);

const getCheckedHalfKeys = (keyEntities: KeyEntities, checkedIds: string[]) => {
  const halfCheckedKeys: string[] = [];
  checkedIds.forEach((key) => {
    const entity = getEntity(keyEntities, key);
    const addParents = ({ parent }: DataEntity) => {
      const allChildrenChecked = parent?.children?.every((child) => checkedIds.includes(child.key as string));
      if (parent && !allChildrenChecked) {
        halfCheckedKeys.push(parent.key as string);
        addParents(parent);
      }
    };
    addParents(entity);
  });

  return halfCheckedKeys;
};

interface TreeCheckboxProps {
  treeData: DataNode[];
  onCheck?: ({ checkedKeys, checkedKeysLeaf }: { checkedKeys: string[]; checkedKeysLeaf: string[] }) => void;
  className?: string;
  isLoading?: boolean;
  initialCheckedKeys?: string[];
}

const TreeCheckbox = ({ treeData, onCheck, className, isLoading, initialCheckedKeys = [] }: TreeCheckboxProps) => {
  const [checkedIds, setCheckedIds] = useState<string[]>(initialCheckedKeys);
  const [checkedKeysLeaf, setCheckedKeysLeaf] = useState<string[]>([]);
  const entities = convertDataToEntities(treeData);
  const halfChecked = getCheckedHalfKeys(entities.keyEntities, checkedIds);

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

    const newEntity = getEntity(entities.keyEntities, node.key as string);

    const addParents = ({ parent }: DataEntity) => {
      const allChildrenChecked = parent?.children?.every((child) => checkedKeysToSave.includes(child.key as string));

      if (parent && !checkedKeysToSave.includes(parent.key as string) && allChildrenChecked)
        checkedKeysToSave.push(parent.key as string);

      if (parent?.parent) addParents(parent);
    };

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
      if (!node.disableCheckbox && !node.disabled)
        checkedKeysToSave = checkedKeysToSave.filter((item) => item !== node.key);

      if (node.isLeaf) checkedKeysLeafToSave = checkedKeysLeafToSave.filter((item) => item !== node.key);

      if (node.children && node.children.length > 0) node.children.forEach((child) => removeNodeAndChildren(child));
    };

    if (checked) {
      addNodeAndChildren(node);
      addParents(newEntity);
    } else {
      removeParents(node);
      removeNodeAndChildren(node);
    }

    setCheckedIds(checkedKeysToSave);
    setCheckedKeysLeaf(checkedKeysLeafToSave);
    onCheck?.({
      checkedKeys: checkedKeysToSave,
      checkedKeysLeaf: checkedKeysLeafToSave,
    });
  };

  const renderTreeNodes = (data: DataNode[], hidenChip = false) =>
    data.map((item) => {
      const entity = getEntity<DataNode>(entities.keyEntities, item.key as string);

      return (
        <TreeNode
          title={
            <label
              htmlFor={`checkbox-${item.key}`}
              className={cn('flex flex-row items-center justify-between ml-3 pr-6 cursor-pointer', {
                'cursor-not-allowed': item.disabled,
              })}
            >
              <span className="h-5 text-sm text-center">{item.title?.toString()}</span>

              {initialCheckedKeys.includes(item.key as string) && !hidenChip && (
                <div className="px-2 py-px bg-[#1890ff]/10 rounded-md justify-start items-start inline-flex">
                  <span className="text-center text-[#1890ff] text-xs font-bold leading-tight">
                    Ya es auto asignable
                  </span>
                </div>
              )}
            </label>
          }
          disableCheckbox={item.disabled}
          disabled={item.disabled}
          key={item.key}
          icon={(node) => {
            const { checked, halfChecked } = node;
            return (
              <Checkbox
                id={`checkbox-${item.key}`}
                checked={checked ? true : halfChecked ? 'indeterminate' : false}
                disabled={item.disabled}
                onCheckedChange={(checked) => {
                  handleCheck(checked, item);
                }}
              />
            );
          }}
          className={cn('flex flex-row items-center justify-center', {
            'cursor-not-allowed': item.disabled,
            'bg-[#F3F6FB]': entity.level === 0,
            'bg-[#FBFCFD]': entity.level === 1,
            'bg-white': entity.level === 2,
          })}
        >
          {item.children ? renderTreeNodes(item.children, initialCheckedKeys.includes(item.key as string)) : null}
        </TreeNode>
      );
    });

  return (
    <Tree
      checkable
      checkStrictly
      defaultExpandAll={isLoading}
      checkedKeys={{
        checked: checkedIds,
        halfChecked,
      }}
      selectable={false}
      switcherIcon={switcher}
      showIcon
      className={className}
    >
      {isLoading ? <TreeNodesLoading /> : renderTreeNodes(treeData)}
    </Tree>
  );
};

export default TreeCheckbox;
