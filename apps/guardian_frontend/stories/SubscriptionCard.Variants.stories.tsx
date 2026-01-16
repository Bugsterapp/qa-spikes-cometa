import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { SubscriptionCardActive, SubscriptionCardAvailable } from '~/components/SubscriptionCard.Variants';
import { StudentMock } from './mocks/SubscriptionCard.Variants';
import { SessionProvider } from 'next-auth/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Subscriptions/Subscriptions Cards',
  component: SubscriptionCardActive,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Cards for subscription orders rendered in subscription page' },
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    student: { control: 'object' },
    href: { control: 'text' },
    concept: { control: 'text' },
    payDate: { control: 'text' },
  },
  args: {
    student: StudentMock({}),
    href: '/#',
    concept: 'Colegiatura Secundaria',
    payDate: '2022-01-01',
  },
  decorators: [
    (Story) => (
      <SessionProvider>
        <div style={{ minWidth: 448 }}>
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
} satisfies Meta<typeof SubscriptionCardActive>;

export default meta;

type ActiveStory = StoryObj<typeof SubscriptionCardActive>;

export const Active: ActiveStory = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const header = canvas.getByText(/COBRO AUTOMÁTICO/i);
    const info = canvas.getByText('Colegiatura Secundaria');
    const goToDetail = canvas.getByText(/Ver información/i);
    await expect(header).toBeVisible();
    await expect(info).toBeVisible();
    await expect(goToDetail).toBeVisible();
    await expect(goToDetail).toHaveAttribute('href', '/#');
  },
};

type AvailableStory = StoryObj<typeof SubscriptionCardAvailable>;

export const Available: AvailableStory = {
  argTypes: {
    onChange: { action: 'onChange' },
    price: { control: 'number' },
    conceptName: { control: 'text' },
    nextDue: { control: 'text' },
    selected: { control: 'boolean' },
  },
  render: (args) => <SubscriptionCardAvailable {...args} />,
  args: {
    disabled: false,
    selected: false,
    price: 100,
    conceptName: 'Colegiatura Secundaria',
    nextDue: '2022-01-01',
  },
  parameters: {
    controls: { exclude: ['hasDueOrders'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const info = canvas.getByText('Colegiatura Secundaria');
    const footer = canvas.getByTestId(/subscription-card-footer/i);
    const buttonSelect = canvas.getByRole('button');
    await expect(info).toBeVisible();
    await expect(footer).toBeVisible();
    await expect(buttonSelect).toBeVisible();

    await expect(buttonSelect).toHaveTextContent('SELECCIONAR');

    // await userEvent.click(buttonSelect);
  },
};

export const AvailableWithDue: AvailableStory = {
  render: Available.render,
  args: { ...Available.args, hasDueOrder: true, hrefToPay: '#' },
  parameters: {
    controls: { include: [] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const bannerError = canvas.getByText(
      /No puedes domiciliarte a este concepto porque tienes una orden vencida pendiente/i
    );
    const goToPay = canvas.getByText(/Ir a pagar/i);
    const info = canvas.getByText('Colegiatura Secundaria');
    const footer = canvas.getByTestId(/subscription-card-footer/i);
    const buttonSelect = footer.getElementsByTagName('button')[0];

    await expect(info).toBeVisible();
    await expect(footer).toBeVisible();

    await expect(buttonSelect).toBeVisible();
    await expect(buttonSelect).toBeDisabled();

    await expect(bannerError).toBeVisible();
    await expect(goToPay).toBeVisible();
  },
};
