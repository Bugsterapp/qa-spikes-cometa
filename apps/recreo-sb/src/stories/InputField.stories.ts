import type { Meta, StoryObj } from '@storybook/react';
import { InputField } from '@cometa/recreo/components/ui/InputField';

const meta = {
  title: 'Components/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
      defaultValue: 'text',
    },
    placeholder: {
      control: 'text',
      defaultValue: 'Enter text...',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    className: {
      control: 'text',
    },
    ref: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email address...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    type: 'text',
    defaultValue: 'This is a pre-filled value',
  },
};

export const WithCustomWidth: Story = {
  args: {
    type: 'text',
    placeholder: 'Custom width input',
    className: 'w-[300px]',
  },
};
