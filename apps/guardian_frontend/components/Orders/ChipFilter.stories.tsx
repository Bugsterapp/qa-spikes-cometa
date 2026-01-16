import { Meta, StoryObj } from '@storybook/react';
import { expect, spyOn, userEvent, within } from '@storybook/test';
import ChipFilter from '~/components/Orders/ChipFilter';

const meta: Meta<typeof ChipFilter> = {
  title: 'Orders/Chip Filter',
  component: ChipFilter,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    docs: {
      description: { component: 'Filter with options' },
    },
  },

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {},
  args: {
    options: [
      {
        value: 'All',
        displayValue: 'All',
      },
      {
        value: 'Active',
        displayValue: 'Active',
      },
      {
        value: 'Inactive',
        displayValue: 'Inactive',
      },
      {
        value: 'Some',
        displayValue: 'Some',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 30 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type ChipFilterStory = StoryObj<typeof ChipFilter>;

export const ChipFilterStory: ChipFilterStory = {
  render: ({ ...args }) => <ChipFilter {...args} />,
  args: {
    // eslint-disable-next-line no-console
    onChange: (value: string) => console.log(`Selected: ${value}`),
    className: 'test',
    value: 'Active',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const items = canvas.getAllByRole('radio');

    await expect(items).toHaveLength(4);

    const selectedItem = canvas.getByLabelText('Active');
    await expect(selectedItem).toBeChecked();

    items.forEach(async (item) => {
      await expect(item).toBeVisible();
    });

    const onClickEvent = spyOn(console, 'log');

    await userEvent.click(items[0]);

    await expect(onClickEvent).toHaveBeenCalledWith(`Selected: ${args.options[0].value}`);

    const newSelectedItem = canvas.getByLabelText('All');
    await expect(newSelectedItem).toBeChecked();

    await expect(items[0]).toHaveClass('bg-[#4D5FFE] text-white border-[#4D5FFE]');

    const rootElement = document.getElementsByClassName('embla')[0];

    await expect(rootElement).toHaveClass('test');
  },
};
