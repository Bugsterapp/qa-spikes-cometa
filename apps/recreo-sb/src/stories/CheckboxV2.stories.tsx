import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, Label } from '@cometa/recreo/v2';

const meta: Meta<typeof Checkbox> = {
  title: 'V2/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado del checkbox',
    },
    checked: {
      control: 'boolean',
      description: 'Estado del checkbox (controlado)',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Estado inicial del checkbox (no controlado)',
    },
    onCheckedChange: {
      action: 'checkedChange',
      description: 'Función que se ejecuta cuando cambia el estado',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
    ref: {
      table: { disable: true },
    },
    asChild: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - caso básico
export const Default: Story = {
  args: {
    id: 'default-checkbox',
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor="default-checkbox">Acepto los términos y condiciones</Label>
    </div>
  ),
};

// Checkbox marcado por defecto
export const DefaultChecked: Story = {
  args: {
    id: 'checked-checkbox',
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor="checked-checkbox">Recibir notificaciones por email</Label>
    </div>
  ),
};

// Checkbox deshabilitado
export const Disabled: Story = {
  args: {
    id: 'disabled-checkbox',
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor="disabled-checkbox">Opción no disponible</Label>
    </div>
  ),
};

// Checkbox deshabilitado y marcado
export const DisabledChecked: Story = {
  args: {
    id: 'disabled-checked-checkbox',
    disabled: true,
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor="disabled-checked-checkbox">Configuración obligatoria</Label>
    </div>
  ),
};

// Checkbox como en la imagen - alineación correcta
export const CheckboxWithDescriptionCometa: Story = {
  args: {
    id: 'cometa-description',
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-start gap-2">
      <Checkbox {...args} />
      <div className="grid gap-1.5">
        <Label htmlFor="cometa-description">Checkbox Text</Label>
        <p className="text-sm text-muted-foreground">This is a checkbox description.</p>
      </div>
    </div>
  ),
};

// Lista de múltiples checkboxes
export const MultipleOptions: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Selecciona tus intereses:</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox id="option1" />
          <Label htmlFor="option1">Tecnología</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="option2" defaultChecked />
          <Label htmlFor="option2">Diseño</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="option3" />
          <Label htmlFor="option3">Marketing</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="option4" />
          <Label htmlFor="option4">Desarrollo</Label>
        </div>
      </div>
    </div>
  ),
};

// Ejemplo card-like como en shadcn/ui
export const CardLikeExample: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold">Checkbox estilo Card (shadcn/ui)</h3>

      <Label className="cursor-pointer hover:bg-gray-50 flex items-start gap-2 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
        <Checkbox
          id="card-example-1"
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-base leading-none font-medium">Habilitar notificaciones</p>
          <p className="text-muted-foreground text-sm">
            Puedes habilitar o deshabilitar las notificaciones en cualquier momento.
          </p>
        </div>
      </Label>

      <Label className="cursor-pointer hover:bg-gray-50 flex items-start gap-2 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
        <Checkbox
          id="card-example-2"
          defaultChecked
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-base leading-none font-medium">Acepto los términos y condiciones</p>
          <p className="text-muted-foreground text-sm">
            Al marcar esta casilla, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </Label>

      <Label className="cursor-pointer hover:bg-gray-50 flex items-start gap-2 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
        <Checkbox
          id="card-example-3"
          defaultChecked
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <div className="flex flex-col gap-1.5 font-normal">
          <p className="text-base leading-none font-medium">Recibir newsletter</p>
          <p className="text-muted-foreground text-sm">
            Recibe nuestras actualizaciones semanales y ofertas especiales.
          </p>
        </div>
      </Label>
    </div>
  ),
};
