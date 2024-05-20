import type { Meta, ReactRenderer, StoryObj } from '@storybook/react';
import { userEvent, within, expect, waitFor } from '@storybook/test';
import { StepFunction } from '@storybook/types';
import { OrderCardNotDue, OrderCardDue, OrderCardProps } from '~/components/OrderCard.Variants';
import { OrderCardMock } from './mocks/OrderCard';
import { useArgs } from '@storybook/preview-api';
import { GuardianDependentFulfillment } from '@cometa/trpc';

function useUpdateSelected(args: Readonly<OrderCardProps>) {
  const [{ selected }, updateArgs] = useArgs<typeof args>();

  const onChange = (order: GuardianDependentFulfillment) => {
    args.onChangeFulfillment(order);
    updateArgs({ selected: !selected });
  };

  return onChange;
}

async function testButtonSelect(
  buttonSelect: HTMLElement,
  args: Readonly<OrderCardProps>,
  step: StepFunction<ReactRenderer, Readonly<OrderCardProps>>
) {
  await step('Clicking the select button should toggle the selected state and call the onChange callback', async () => {
    await expect(buttonSelect).toHaveTextContent('SELECCIONAR');

    await userEvent.click(buttonSelect);
    await expect(args.onChangeFulfillment).toHaveBeenCalled();
    await waitFor(() => expect(buttonSelect).toHaveTextContent('SELECCIONADO'));

    await userEvent.click(buttonSelect);
    await expect(args.onChangeFulfillment).toHaveBeenCalled();
    await waitFor(() => expect(buttonSelect).toHaveTextContent('SELECCIONAR'));
  });
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Guardian Home/Order Cards',
  component: OrderCardNotDue,
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onChange = useUpdateSelected(args);

    return <OrderCardNotDue {...args} onChangeFulfillment={onChange} />;
  },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Cards for payment orders rendered in guardian home' },
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    order: { control: 'object' },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
    onChangeFulfillment: { action: 'onChangeFulfillment', table: { disable: true } },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { order: OrderCardMock({ status: 'NOT_PAID', interest: undefined }) },
} satisfies Meta<typeof OrderCardNotDue>;

export default meta;

type NotDueStory = StoryObj<typeof OrderCardNotDue>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const NotDueCard: NotDueStory = {
  args: { disabled: false },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const buttonSelect = canvas.getByRole('button');

    testButtonSelect(buttonSelect, args, step);
  },
};

type DueStory = StoryObj<typeof OrderCardDue>;

export const DueCard: DueStory = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onChange = useUpdateSelected(args);

    return <OrderCardDue {...args} onChangeFulfillment={onChange} />;
  },
  args: { disabled: false, order: OrderCardMock({ status: 'NOT_PAID' }) },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByText('VENCIDA');
    const dueCopy = canvas.getByText('Venció:');

    const details = canvas.getByText('Ver detalles');

    await userEvent.click(details);
    await expect(canvas.getByText('Monto original:')).toBeVisible();
    await expect(dueCopy).toBeVisible();
    await expect(header).toBeVisible();

    const buttonSelect = canvas.getByRole('button');
    testButtonSelect(buttonSelect, args, step);
  },
};
