import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@cometa/recreo';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'Button',
    color: 'galaxy',
    variant: 'solid',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'solid-light', 'text'],
    },
    color: {
      control: 'select',
      options: ['galaxy', 'black', 'legacy'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    isLoading: {
      control: 'boolean',
      defaultValue: false,
    },
    asChild: {
      table: {
        disable: true,
      },
    },
    ref: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'solid',
    size: 'medium',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
  },
};

export const SolidLight: Story = {
  args: {
    children: 'Button',
    variant: 'solid-light',
  },
};

export const Text: Story = {
  args: {
    children: 'Button',
    variant: 'text',
  },
};

export const Galaxy: Story = {
  args: {
    children: 'Button',
    color: 'galaxy',
  },
};

export const Black: Story = {
  args: {
    children: 'Button',
    color: 'black',
  },
};

export const Legacy: Story = {
  args: {
    children: 'Button',
    color: 'legacy',
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Button',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    children: 'Button',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    children: 'Button',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
    variant: 'solid',
  },
};

export const Loading: Story = {
  args: {
    children: 'Button',
    variant: 'solid',
    color: 'galaxy',
    isLoading: true,
  },
};
