import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem, RadioCard, Label } from '@cometa/recreo/v2';

const meta: Meta<typeof RadioGroup> = {
  title: 'V2/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Valor del elemento seleccionado',
    },
    defaultValue: {
      control: 'text',
      description: 'Valor inicial seleccionado',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
      description: 'Deshabilita todo el grupo de radio buttons',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      defaultValue: 'vertical',
      description: 'Orientación del grupo',
    },
    onValueChange: {
      description: 'Función llamada cuando cambia la selección',
      action: 'value changed',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales para el grupo',
    },
    // Ocultamos props internos
    ref: {
      table: {
        disable: true,
      },
    },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

// Variante principal
export const Default: Story = {
  args: {},
};

// Con valor inicial
export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'comfortable',
  },
};

// Orientación horizontal
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    className: 'flex flex-row gap-6',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="h1" />
        <Label htmlFor="h1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="h2" />
        <Label htmlFor="h2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="h3" />
        <Label htmlFor="h3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

// Estado deshabilitado
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'comfortable',
  },
};

// Item individual deshabilitado
export const WithDisabledItem: Story = {
  args: {},
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="d1" />
        <Label htmlFor="d1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="d2" disabled />
        <Label htmlFor="d2">Comfortable (Disabled)</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="d3" />
        <Label htmlFor="d3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

// Ejemplo oficial de shadcn/ui
export const ShadcnExample: Story = {
  args: {
    defaultValue: 'comfortable',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

// Radio group con descripciones
export const WithDescription: Story = {
  args: {
    defaultValue: 'standard',
    className: 'gap-4',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-start gap-3">
        <RadioGroupItem value="free" id="free-plan" />
        <div className="grid gap-1.5">
          <Label htmlFor="free-plan">Plan Gratuito</Label>
          <p className="text-sm text-muted-foreground">Perfecto para empezar. Incluye funcionalidades básicas.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RadioGroupItem value="standard" id="standard-plan" />
        <div className="grid gap-1.5">
          <Label htmlFor="standard-plan">Plan Estándar</Label>
          <p className="text-sm text-muted-foreground">
            Para equipos pequeños. Incluye colaboración y más almacenamiento.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RadioGroupItem value="premium" id="premium-plan" />
        <div className="grid gap-1.5">
          <Label htmlFor="premium-plan">Plan Premium</Label>
          <p className="text-sm text-muted-foreground">
            Para empresas. Funcionalidades avanzadas y soporte prioritario.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};

// Radio cards estilo CheckboxCard
export const RadioCardExample: Story = {
  args: {
    defaultValue: 'standard',
    className: 'gap-4',
  },
  render: (args) => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold">Radio Cards (estilo CheckboxCard)</h3>
      <RadioGroup {...args}>
        <RadioCard
          value="free"
          id="free-plan-card"
          title="Plan Gratuito"
          description="Perfecto para empezar. Incluye funcionalidades básicas y almacenamiento limitado."
        />
        <RadioCard
          value="standard"
          id="standard-plan-card"
          title="Plan Estándar"
          description="Para equipos pequeños. Incluye colaboración y más almacenamiento."
        />
        <RadioCard
          value="premium"
          id="premium-plan-card"
          title="Plan Premium"
          description="Para empresas. Funcionalidades avanzadas y soporte prioritario 24/7."
        />
      </RadioGroup>
    </div>
  ),
};
