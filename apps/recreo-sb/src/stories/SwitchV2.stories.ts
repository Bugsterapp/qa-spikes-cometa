import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@cometa/recreo/v2';

// Definimos el tipo correcto para el componente
const meta: Meta<typeof Switch> = {
  title: 'V2/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Estado del switch (activado/desactivado)',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Estado inicial del switch',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
      description: 'Deshabilita el switch',
    },
    onCheckedChange: {
      description: 'Función llamada cuando cambia el estado',
      action: 'checked changed',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
    // Ocultamos props internos
    ref: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Variante principal
export const Default: Story = {
  args: {},
};

// Estados iniciales
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

// Estados
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

// Ejemplos de uso
export const WithCustomClass: Story = {
  args: {
    className: 'data-[state=checked]:bg-purple-500',
  },
};
