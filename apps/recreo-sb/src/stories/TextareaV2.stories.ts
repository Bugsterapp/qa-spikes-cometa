import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@cometa/recreo/v2';

// Metadata del componente
const meta: Meta<typeof Textarea> = {
  title: 'V2/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Texto de placeholder para el textarea',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
    isError: {
      control: 'boolean',
      description: 'Estado de error - muestra estilos de error',
    },
    rows: {
      control: 'number',
      description: 'Número de filas del textarea',
      defaultValue: 4,
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
    // Props a ocultar
    ref: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - caso de uso básico
export const Default: Story = {
  args: {
    placeholder: 'Escribe tu mensaje aquí...',
  },
};

// Con contenido inicial
export const WithContent: Story = {
  args: {
    placeholder: 'Escribe tu mensaje aquí...',
    defaultValue: 'Este es un ejemplo de contenido inicial en el textarea.',
  },
};

// Estado deshabilitado
export const Disabled: Story = {
  args: {
    placeholder: 'Escribe tu mensaje aquí...',
    disabled: true,
  },
};

// Estado de error
export const Error: Story = {
  args: {
    placeholder: 'Escribe tu mensaje aquí...',
    isError: true,
    defaultValue: 'Este contenido tiene un error',
  },
};

// Con filas específicas
export const WithRows: Story = {
  args: {
    placeholder: 'Textarea con 6 filas...',
    rows: 6,
  },
};

// Con clases personalizadas
export const WithCustomClass: Story = {
  args: {
    placeholder: 'Textarea con estilos personalizados...',
    className: 'border-primary',
  },
};

// Ejemplo de uso con límite de caracteres
export const WithCharacterCount: Story = {
  args: {
    placeholder: 'Máximo 100 caracteres...',
    maxLength: 100,
  },
};
