export type MultipleSelectionProps = {
  children: React.ReactNode;
  onChange: (selectedItems: string[]) => void;
  options: { label: string; value: string }[];
};

export type MultipleSelectionContextType = {
  isOpen: boolean;
  getToggleButtonProps: (props?: any) => any;
  getLabelProps: (props?: any) => any;
  getMenuProps: (props?: any) => any;
  highlightedIndex: number;
  getItemProps: (props?: any) => any;
  selectedItem: MultipleSelectionProps['options'][0] | null;
  selectedItems: MultipleSelectionProps['options'];
};

export type MultipleSelectionContextProps = {
  children: React.ReactNode;
  value: MultipleSelectionContextType;
};

export type GenericProps = {
  children: React.ReactNode;
};

export type ItemProps = {
  children: React.ReactNode;
  index: number;
  item: MultipleSelectionProps['options'][number];
};
