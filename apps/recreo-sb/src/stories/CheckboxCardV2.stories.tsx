import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxCard } from '@cometa/recreo/v2';

const meta: Meta<typeof CheckboxCard> = {
  title: 'V2/CheckboxCard',
  component: CheckboxCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título principal del checkbox card',
    },
    description: {
      control: 'text',
      description: 'Descripción opcional debajo del título',
    },
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
      description: 'Clases CSS adicionales para el checkbox',
    },
    cardClassName: {
      control: 'text',
      description: 'Clases CSS adicionales para el contenedor card',
    },
    titleClassName: {
      control: 'text',
      description: 'Clases CSS adicionales para el título',
    },
    descriptionClassName: {
      control: 'text',
      description: 'Clases CSS adicionales para la descripción',
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
    id: 'default-checkbox-card',
    title: 'Habilitar notificaciones',
    description: 'Recibe actualizaciones importantes sobre tu cuenta.',
  },
};

// Solo título, sin descripción
export const TitleOnly: Story = {
  args: {
    id: 'title-only-checkbox-card',
    title: 'Acepto los términos y condiciones',
  },
};

// Checkbox marcado por defecto
export const DefaultChecked: Story = {
  args: {
    id: 'checked-checkbox-card',
    title: 'Recibir newsletter',
    description: 'Recibe nuestras actualizaciones semanales y ofertas especiales.',
    defaultChecked: true,
  },
};

// Checkbox deshabilitado
export const Disabled: Story = {
  args: {
    id: 'disabled-checkbox-card',
    title: 'Función premium',
    description: 'Esta función requiere una suscripción premium.',
    disabled: true,
  },
};

// Checkbox deshabilitado y marcado
export const DisabledChecked: Story = {
  args: {
    id: 'disabled-checked-checkbox-card',
    title: 'Configuración obligatoria',
    description: 'Esta configuración es requerida por las políticas de la empresa.',
    disabled: true,
    defaultChecked: true,
  },
};

// Con descripción larga
export const LongDescription: Story = {
  args: {
    id: 'long-description-checkbox-card',
    title: 'Acepto los términos y condiciones',
    description:
      'Al marcar esta casilla, aceptas nuestros términos de servicio, política de privacidad y te comprometes a utilizar el servicio de manera responsable. También aceptas recibir comunicaciones importantes sobre tu cuenta.',
  },
};

// Lista de múltiples checkbox cards
export const MultipleCards: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Configuración de la cuenta</h3>

      <CheckboxCard
        id="notifications"
        title="Notificaciones por email"
        description="Recibe actualizaciones importantes sobre tu cuenta."
        defaultChecked
      />

      <CheckboxCard
        id="newsletter"
        title="Newsletter semanal"
        description="Recibe nuestras actualizaciones semanales y ofertas especiales."
      />

      <CheckboxCard
        id="marketing"
        title="Comunicaciones de marketing"
        description="Recibe información sobre nuevos productos y promociones."
      />

      <CheckboxCard
        id="terms"
        title="Acepto los términos y condiciones"
        description="Al marcar esta casilla, aceptas nuestros términos de servicio y política de privacidad."
      />
    </div>
  ),
};
