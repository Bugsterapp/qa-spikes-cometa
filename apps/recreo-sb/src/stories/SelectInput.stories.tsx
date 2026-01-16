import type { Meta, StoryObj } from '@storybook/react';
import {
  SelectInput,
  SelectInputContent,
  SelectInputGroup,
  SelectInputItem,
  SelectInputLabel,
  SelectInputTrigger,
  SelectInputValue,
} from '@cometa/recreo/components/ui/SelectInput';

const meta = {
  title: 'Components/SelectInput',
  component: SelectInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story) => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// A helper component to render a complete Select
const SelectDemo = () => (
  <SelectInput>
    <SelectInputTrigger className="w-full">
      <SelectInputValue placeholder="Select a fruit" />
    </SelectInputTrigger>
    <SelectInputContent>
      <SelectInputGroup>
        <SelectInputLabel>Fruits</SelectInputLabel>
        <SelectInputItem value="apple">Apple</SelectInputItem>
        <SelectInputItem value="banana">Banana</SelectInputItem>
        <SelectInputItem value="orange">Orange</SelectInputItem>
        <SelectInputItem value="grape">Grape</SelectInputItem>
        <SelectInputItem value="mango">Mango</SelectInputItem>
      </SelectInputGroup>
    </SelectInputContent>
  </SelectInput>
);

export const Default: Story = {
  render: () => <SelectDemo />,
};

export const Disabled: Story = {
  render: () => (
    <SelectInput disabled>
      <SelectInputTrigger className="w-full">
        <SelectInputValue placeholder="Disabled" />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputGroup>
          <SelectInputItem value="apple">Apple</SelectInputItem>
          <SelectInputItem value="banana">Banana</SelectInputItem>
        </SelectInputGroup>
      </SelectInputContent>
    </SelectInput>
  ),
};

export const WithError: Story = {
  render: () => (
    <SelectInput>
      <SelectInputTrigger className="w-full" isError>
        <SelectInputValue placeholder="Error state" />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputGroup>
          <SelectInputItem value="apple">Apple</SelectInputItem>
          <SelectInputItem value="banana">Banana</SelectInputItem>
          <SelectInputItem value="orange">Orange</SelectInputItem>
        </SelectInputGroup>
      </SelectInputContent>
    </SelectInput>
  ),
};

export const WithoutLabel: Story = {
  render: () => (
    <SelectInput>
      <SelectInputTrigger className="w-full">
        <SelectInputValue placeholder="Select a fruit" />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputItem value="apple">Apple</SelectInputItem>
        <SelectInputItem value="banana">Banana</SelectInputItem>
        <SelectInputItem value="orange">Orange</SelectInputItem>
      </SelectInputContent>
    </SelectInput>
  ),
};

export const CustomWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <SelectInput>
      <SelectInputTrigger className="w-full">
        <SelectInputValue placeholder="Wider select" />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputItem value="option1">This is a wider option to demonstrate</SelectInputItem>
        <SelectInputItem value="option2">Another example option with truncation</SelectInputItem>
        <SelectInputItem value="option3">
          A third example with extremely long text that should be truncated
        </SelectInputItem>
      </SelectInputContent>
    </SelectInput>
  ),
};

export const NarrowWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '150px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <SelectInput>
      <SelectInputTrigger className="w-full">
        <SelectInputValue placeholder="Narrow" />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputItem value="option1">Short text</SelectInputItem>
        <SelectInputItem value="option2">Longer option text</SelectInputItem>
      </SelectInputContent>
    </SelectInput>
  ),
};

export const LongSelectedValue: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <SelectInput defaultValue="verylong">
      <SelectInputTrigger className="w-full">
        <SelectInputValue />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputItem value="short">Short option</SelectInputItem>
        <SelectInputItem value="medium">Medium length option</SelectInputItem>
        <SelectInputItem value="verylong">
          This is a very long option that should be truncated when selected
        </SelectInputItem>
      </SelectInputContent>
    </SelectInput>
  ),
};

export const WithScroll: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <SelectInput>
      <SelectInputTrigger className="w-full">
        <SelectInputValue placeholder="Scroll to see more" />
      </SelectInputTrigger>
      <SelectInputContent>
        <SelectInputGroup>
          <SelectInputLabel>Many Options</SelectInputLabel>
          {Array.from({ length: 30 }).map((_, i) => (
            <SelectInputItem value={`option${i + 1}`} key={i}>
              Option {i + 1}
            </SelectInputItem>
          ))}
        </SelectInputGroup>
      </SelectInputContent>
    </SelectInput>
  ),
};
