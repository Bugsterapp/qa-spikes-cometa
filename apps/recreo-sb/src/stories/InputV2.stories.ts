import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@cometa/recreo/v2';

const meta = {
  title: 'V2/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter text...',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    isError: {
      control: 'boolean',
      description: 'Error state with red border and background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    // Ocultar props internos
    ref: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variantes principales
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

// Estados
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Default value',
    placeholder: 'Placeholder',
  },
};

// Error states
export const Error: Story = {
  args: {
    placeholder: 'This field has an error',
    isError: true,
  },
};

export const ErrorWithValue: Story = {
  args: {
    defaultValue: 'Invalid input value',
    isError: true,
  },
};
