import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  useCombobox,
} from '@cometa/recreo/v2';
import { Plus } from 'lucide-react';

const meta: Meta<typeof Combobox> = {
  title: 'V2/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Estado controlado del popover',
    },
    value: {
      control: 'text',
      description: 'Valor seleccionado (controlado)',
    },
    onValueChange: {
      action: 'valueChange',
      description: 'Función llamada cuando cambia el valor',
    },
    onOpenChange: {
      action: 'openChange',
      description: 'Función llamada cuando cambia el estado del popover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const foods = [
  { value: 'pizza', label: 'Pizza' },
  { value: 'tacos', label: 'Tacos' },
  { value: 'sushi', label: 'Sushi' },
  { value: 'hamburguesa', label: 'Hamburguesa' },
  { value: 'pasta', label: 'Pasta' },
  { value: 'enchiladas', label: 'Enchiladas' },
  { value: 'ramen', label: 'Ramen' },
  { value: 'burrito', label: 'Burrito' },
];

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('');

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[300px]" placeholder="Selecciona tu comida...">
          {foods.find((food) => food.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Buscar comida..." />
          <ComboboxList>
            <ComboboxEmpty className="px-2 py-1.5 text-gray-400">No se encontró la comida</ComboboxEmpty>
            <ComboboxGroup>
              {foods.map((food) => (
                <ComboboxItem key={food.value} value={food.value}>
                  {food.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('pizza');

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[300px]" placeholder="Selecciona tu comida...">
          {foods.find((food) => food.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Buscar comida..." />
          <ComboboxList>
            <ComboboxEmpty className="px-2 py-1.5 text-gray-400">No se encontró la comida</ComboboxEmpty>
            <ComboboxGroup>
              {foods.map((food) => (
                <ComboboxItem key={food.value} value={food.value}>
                  {food.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const WithClientFiltering: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('');
    // eslint-disable-next-line
    const [searchValue, setSearchValue] = React.useState('');

    const filteredFoods = foods.filter((food) => food.label.toLowerCase().includes(searchValue.toLowerCase()));

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[250px]" placeholder="Selecciona tu comida...">
          {foods.find((food) => food.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Buscar comida..." onValueChange={setSearchValue} />
          <ComboboxList>
            <ComboboxEmpty className="px-2 py-1.5 text-gray-400">No se encontró la comida</ComboboxEmpty>
            <ComboboxGroup>
              {filteredFoods.map((food) => (
                <ComboboxItem key={food.value} value={food.value}>
                  {food.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const WithCreateNew: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('');
    // eslint-disable-next-line
    const [items, setItems] = React.useState(foods);
    // eslint-disable-next-line
    const [searchValue, setSearchValue] = React.useState('');

    const filteredItems = items.filter((item) =>
      item.label.toLowerCase().trim().includes(searchValue.toLowerCase().trim())
    );

    const handleCreate = (newValue: string) => {
      const newItem = {
        value: newValue.toLowerCase().replaceAll(' ', ''),
        label: newValue,
      };
      setItems([newItem, ...items]);
      setTimeout(() => {
        setValue(newItem.value);
      });
      setSearchValue('');
    };

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[250px]" placeholder="Selecciona o crea...">
          {items.find((item) => item.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Buscar o crear..." onValueChange={setSearchValue} />
          <ComboboxList>
            <ComboboxGroup>
              {filteredItems.map((item) => (
                <ComboboxItem key={item.value} value={item.value}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
            {filteredItems.length === 0 && searchValue && (
              <ComboboxItem value={searchValue} onSelect={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear &quot;{searchValue}&quot;
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('');

    const options = [
      { value: 'pizza', label: 'Pizza', category: 'Italiana' },
      { value: 'pasta', label: 'Pasta', category: 'Italiana' },
      { value: 'tacos', label: 'Tacos', category: 'Mexicana' },
      { value: 'enchiladas', label: 'Enchiladas', category: 'Mexicana' },
      { value: 'sushi', label: 'Sushi', category: 'Japonesa' },
      { value: 'ramen', label: 'Ramen', category: 'Japonesa' },
    ];

    const groupedOptions = options.reduce((acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    }, {} as Record<string, typeof options>);

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[250px]" placeholder="Selecciona tu comida...">
          {options.find((option) => option.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Buscar comida..." />
          <ComboboxList>
            <ComboboxEmpty className="px-2 py-1.5 text-gray-400">No se encontró la comida</ComboboxEmpty>
            {Object.entries(groupedOptions).map(([category, items]) => (
              <ComboboxGroup key={category}>
                {items.map((item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const CustomWidth: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('');

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[350px]" placeholder="Selecciona tu comida...">
          {foods.find((food) => food.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent className="w-[350px]">
          <ComboboxInput placeholder="Buscar comida..." />
          <ComboboxList>
            <ComboboxEmpty className="px-2 py-1.5 text-gray-400">No se encontró la comida</ComboboxEmpty>
            <ComboboxGroup>
              {foods.map((food) => (
                <ComboboxItem key={food.value} value={food.value}>
                  {food.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('pizza');

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[300px]" placeholder="Selecciona tu comida..." disabled>
          {foods.find((food) => food.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Buscar comida..." />
          <ComboboxList>
            <ComboboxEmpty className="px-2 py-1.5 text-gray-400">No se encontró la comida</ComboboxEmpty>
            <ComboboxGroup>
              {foods.map((food) => (
                <ComboboxItem key={food.value} value={food.value}>
                  {food.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const AdvancedWithHook: Story = {
  render: () => {
    // eslint-disable-next-line
    const [value, setValue] = React.useState('');
    // eslint-disable-next-line
    const [items, setItems] = React.useState(foods);

    const ComboboxContent_Custom = () => {
      const { searchValue } = useCombobox();
      const filteredItems = items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));

      const handleCreate = () => {
        const newItem = {
          value: searchValue.toLowerCase().replace(/\s+/g, '-'),
          label: searchValue,
        };
        setItems([...items, newItem]);
        setValue(newItem.value);
      };

      return (
        <>
          <ComboboxInput placeholder="Buscar o crear comida..." />
          <ComboboxList>
            {filteredItems.length > 0 ? (
              <ComboboxGroup>
                {filteredItems.map((item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ) : (
              searchValue && (
                <ComboboxItem value={searchValue} onSelect={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{searchValue}&quot;
                </ComboboxItem>
              )
            )}
          </ComboboxList>
        </>
      );
    };

    return (
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[280px]" placeholder="Selecciona o crea tu comida...">
          {items.find((item) => item.value === value)?.label}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxContent_Custom />
        </ComboboxContent>
      </Combobox>
    );
  },
};
