import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import CheckoutFooter, {
  ContainerInfo,
  CheckoutFooterButton,
  LabelItemsCount,
  TotalAmount,
} from '~/components/CheckoutFooter';

const meta: Meta<typeof CheckoutFooter> = {
  title: 'Checkout Footer',
  component: CheckoutFooter,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    docs: {
      description: { component: 'Footer to show info and make actions about the checkout' },
    },
  },

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean', defaultValue: true },
    children: { control: 'text', defaultValue: 'This is a footer of checkout' },
    className: {
      table: {
        disable: true,
      },
    },
  },
  args: { children: 'This is a footer of checkout' },
  decorators: [
    (Story) => (
      <div style={{ padding: 30 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type CheckoutFooterStoryType = StoryObj<typeof CheckoutFooter>;

type CheckoutFooterAmountStoryType = StoryObj<{
  amount: number;
  count: number;
  open: boolean;
  onClick: () => void;
  textButton: string;
  loadingButton: boolean;
  label: string;
  currency: string;
}>;

export const CheckoutFooterStory: CheckoutFooterStoryType = {
  args: { open: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = canvas.getByTestId('checkout-footer');
    await expect(footer).toHaveTextContent(args.children as string);
  },
};

export const CheckoutFooterAmountStory: CheckoutFooterAmountStoryType = {
  args: {
    amount: 1000,
    open: true,
    loadingButton: false,
    count: 10,
    textButton: 'Continuar',
    label: 'Total',
    currency: 'MXN',
  },
  render: ({ onClick, open, amount, currency, label, textButton, loadingButton, count }) => (
    <CheckoutFooter open={open}>
      <ContainerInfo>
        <LabelItemsCount count={count}>{label}</LabelItemsCount>
        <TotalAmount amount={amount} currency={currency} />
      </ContainerInfo>
      <CheckoutFooterButton onClick={onClick} loading={loadingButton}>
        {textButton}
      </CheckoutFooterButton>
    </CheckoutFooter>
  ),
  argTypes: {
    onClick: { action: 'clicked', table: { disable: true } },
    currency: { control: 'select', options: ['MXN', 'USD', 'EUR', 'JPY'] },
  },
  parameters: {
    controls: { exclude: ['children'] },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 30 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = canvas.getByTestId('checkout-footer');
    const button = canvas.getByRole('button');
    const amount = canvas.getByRole('heading');
    const label = canvas.getByText(args.label);
    const count = canvas.getByText(args.count.toString());

    await expect(footer).toHaveTextContent(args.label);
    await expect(amount).toHaveTextContent('$1,000.00');
    await expect(count).toHaveTextContent('10');
    await expect(label).toHaveTextContent('Total');
    await expect(button).toHaveTextContent(args.textButton);

    await userEvent.click(button);
  },
};
