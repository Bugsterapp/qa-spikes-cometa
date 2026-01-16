import type { Meta, StoryObj } from '@storybook/react';
import { Label, Checkbox, Input } from '@cometa/recreo/v2';

const meta: Meta<typeof Label> = {
  title: 'V2/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
      description: 'ID del elemento al que se asocia el label',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
    children: {
      control: 'text',
      description: 'Contenido del label',
    },
    ref: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - caso básico
export const Default: Story = {
  args: {
    children: 'Etiqueta por defecto',
  },
};

// Label con input
export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Correo electrónico</Label>
      <Input id="email" type="email" placeholder="tu@ejemplo.com" />
    </div>
  ),
};

// Label con checkbox
export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Acepto los términos y condiciones</Label>
    </div>
  ),
};

// Label con descripción
export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="username">Nombre de usuario</Label>
      <Input id="username" placeholder="Ingresa tu nombre de usuario" />
      <p className="text-sm text-muted-foreground">Este será tu nombre público en la plataforma</p>
    </div>
  ),
};

// Label requerido
export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="password">
        Contraseña <span className="text-red-500">*</span>
      </Label>
      <Input id="password" type="password" placeholder="Ingresa tu contraseña" />
    </div>
  ),
};

// Label deshabilitado
export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="disabled-input" className="opacity-50">
        Campo deshabilitado
      </Label>
      <Input id="disabled-input" disabled placeholder="Este campo está deshabilitado" />
    </div>
  ),
};

// Label con formato personalizado
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-lg font-bold text-blue-600">
          Título del proyecto
        </Label>
        <Input id="title" placeholder="Nombre del proyecto" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs uppercase tracking-wide text-gray-500">
          Descripción
        </Label>
        <Input id="description" placeholder="Breve descripción" />
      </div>
    </div>
  ),
};

// Formulario completo
export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="form-name">
          Nombre completo <span className="text-red-500">*</span>
        </Label>
        <Input id="form-name" placeholder="Juan Pérez" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input id="form-email" type="email" placeholder="juan@ejemplo.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-phone">Teléfono</Label>
        <Input id="form-phone" type="tel" placeholder="+1 (555) 123-4567" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="form-newsletter" />
        <Label htmlFor="form-newsletter">Suscribirse al newsletter</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="form-terms" />
        <Label htmlFor="form-terms">
          Acepto los{' '}
          <a href="#" className="text-blue-600 hover:underline">
            términos y condiciones
          </a>
        </Label>
      </div>
    </div>
  ),
};
