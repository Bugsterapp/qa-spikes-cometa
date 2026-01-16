import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@cometa/recreo/v2';
import { Mail, Loader2 } from 'lucide-react';

const meta = {
  title: 'V2/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'neutral', 'light', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Button variant (shadcn/ui based + Cometa variants)',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    asChild: {
      control: 'boolean',
      defaultValue: false,
      description: 'Render as child element',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    // Ocultamos props internos de Storybook
    ref: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variantes principales
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

// Nuevas variantes de Cometa
export const Neutral: Story = {
  args: {
    children: 'Button',
    variant: 'neutral',
  },
};

export const Light: Story = {
  args: {
    children: 'Button',
    variant: 'light',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Button',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

// Tamaños
export const Small: Story = {
  args: {
    children: 'Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Button',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Send email',
  },
  render: (args) => (
    <Button {...args}>
      <Mail className="h-4 w-4" />
    </Button>
  ),
};

// Estados
export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    variant: 'default',
  },
  render: (args) => (
    <Button {...args}>
      <Loader2 className="h-4 w-4 animate-spin" />
      Please wait
    </Button>
  ),
};

export const LoadingSecondary: Story = {
  args: {
    disabled: true,
    variant: 'secondary',
  },
  render: (args) => (
    <Button {...args}>
      <Loader2 className="h-4 w-4 animate-spin" />
      Saving changes
    </Button>
  ),
};

export const LoadingLarge: Story = {
  args: {
    disabled: true,
    variant: 'default',
    size: 'lg',
  },
  render: (args) => (
    <Button {...args}>
      <Loader2 className="h-4 w-4 animate-spin" />
      Processing payment
    </Button>
  ),
};

// Ejemplos de uso
export const WithCustomClass: Story = {
  args: {
    children: 'Custom',
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
  },
};

export const AsChild: Story = {
  args: {
    children: 'Link Button',
    variant: 'outline',
    asChild: true,
  },
};
