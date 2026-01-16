import type { Meta, StoryObj } from '@storybook/react';
import { RadioCard, RadioGroup } from '@cometa/recreo/v2';

const meta: Meta<typeof RadioCard> = {
  title: 'V2/RadioCard',
  component: RadioCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Valor del radio option (requerido)',
    },
    title: {
      control: 'text',
      description: 'Título principal del radio card',
    },
    description: {
      control: 'text',
      description: 'Descripción opcional debajo del título',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado del radio button',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales para el radio button',
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
  render: (args) => (
    <RadioGroup defaultValue={args.value} className="max-w-md">
      <RadioCard {...args} />
    </RadioGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - caso básico
export const Default: Story = {
  args: {
    id: 'default-radio-card',
    value: 'standard',
    title: 'Plan Estándar',
    description: 'Para equipos pequeños. Incluye colaboración y más almacenamiento.',
  },
};

// Solo título, sin descripción
export const TitleOnly: Story = {
  args: {
    id: 'title-only-radio-card',
    value: 'basic',
    title: 'Plan Básico',
  },
};

// Radio card preseleccionado
export const Selected: Story = {
  args: {
    id: 'selected-radio-card',
    value: 'premium',
    title: 'Plan Premium',
    description: 'Para empresas. Funcionalidades avanzadas y soporte prioritario.',
  },
  render: (args) => (
    <RadioGroup defaultValue="premium" className="max-w-md">
      <RadioCard {...args} />
    </RadioGroup>
  ),
};

// Radio card deshabilitado
export const Disabled: Story = {
  args: {
    id: 'disabled-radio-card',
    value: 'enterprise',
    title: 'Plan Enterprise',
    description: 'Disponible próximamente. Contacta con ventas para más información.',
    disabled: true,
  },
};

// Con descripción larga
export const LongDescription: Story = {
  args: {
    id: 'long-description-radio-card',
    value: 'professional',
    title: 'Plan Profesional',
    description:
      'Ideal para equipos medianos y grandes. Incluye todas las funcionalidades del plan estándar, más herramientas avanzadas de colaboración, integraciones personalizadas, soporte prioritario 24/7 y análisis detallados.',
  },
};

// Múltiples radio cards (ejemplo completo)
export const MultipleCards: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Selecciona tu plan</h3>

      <RadioGroup defaultValue="standard" className="gap-3">
        <RadioCard
          id="free-plan"
          value="free"
          title="Plan Gratuito"
          description="Perfecto para empezar. Incluye funcionalidades básicas."
        />

        <RadioCard
          id="standard-plan"
          value="standard"
          title="Plan Estándar"
          description="Para equipos pequeños. Incluye colaboración y más almacenamiento."
        />

        <RadioCard
          id="premium-plan"
          value="premium"
          title="Plan Premium"
          description="Para empresas. Funcionalidades avanzadas y soporte prioritario."
        />

        <RadioCard
          id="enterprise-plan"
          value="enterprise"
          title="Plan Enterprise"
          description="Solución personalizada para grandes organizaciones."
          disabled
        />
      </RadioGroup>
    </div>
  ),
};

// Radio card disabled unchecked
export const DisabledUnchecked: Story = {
  args: {
    id: 'disabled-unchecked-radio-card',
    value: 'unavailable',
    title: 'Plan No Disponible',
    description: 'Esta opción no está disponible actualmente.',
    disabled: true,
  },
  render: (args) => (
    <RadioGroup defaultValue="other" className="max-w-md">
      <RadioCard {...args} />
    </RadioGroup>
  ),
};

// Ejemplo con diferentes tamaños de contenido
export const VariedContent: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Opciones de contenido variado</h3>

      <RadioGroup defaultValue="medium" className="gap-3">
        <RadioCard id="short-content" value="short" title="Corto" description="Descripción breve." />

        <RadioCard
          id="medium-content"
          value="medium"
          title="Contenido Medio"
          description="Esta es una descripción de longitud media que proporciona más contexto sobre la opción."
        />

        <RadioCard
          id="long-content"
          value="long"
          title="Contenido Extenso con Título Largo"
          description="Esta es una descripción muy larga que demuestra cómo el componente maneja contenido extenso. Incluye múltiples líneas de texto y proporciona información detallada sobre todas las características y beneficios de esta opción particular."
        />
      </RadioGroup>
    </div>
  ),
};
