import type { Meta, StoryObj } from '@storybook/react';
import { CartItemsMock, DependentWithColorMock, OrderItemsResumeMock } from '~/stories/mocks/ResumeCard';
import { expect, userEvent, within } from '@storybook/test';
import { formatPrice } from '~/utils/orders';
import OrderResumeCard, { OrderResumeCardProps } from './OrderResumeCard';
import { SessionProvider } from 'next-auth/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof OrderResumeCard> = {
  title: 'Guardian Home/Resume Cards',
  component: OrderResumeCard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Cards for resume in subscription page' },
    },
    controls: { exclude: ['id', 'Tour'] },
  },
  argTypes: {
    isLoading: { control: 'boolean' },
    isLoadingVerify: { control: 'boolean' },
    showVerifyRFC: { control: 'boolean' },
    currency: { control: 'select', options: ['MXN', 'USD', 'EUR', 'JPY'] },
    dependent: { control: 'object' },
    onAssignRFC: { action: 'onAssignRFC', table: { disable: true } },
  },
  args: {
    total: 12581.25,
    currency: 'MXN',
    showVerifyRFC: true,
    isLoading: false,
    isLoadingVerify: false,
    items: OrderItemsResumeMock([]),
    cartItems: CartItemsMock,
    dependent: DependentWithColorMock({}),
  },

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionProvider>
        <div style={{ minWidth: 448 }}>
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};

export default meta;

type CardResumeStory = StoryObj<typeof OrderResumeCard>;

const testBase = async (canvasElement: HTMLElement, args: Readonly<OrderResumeCardProps>) => {
  const canvas = within(canvasElement);

  const studentInfo = canvas.getByText(/Estudiante:/i);
  const studentName = canvas.getByText(args.dependent.first_name.toUpperCase());

  const details = canvas.getByText(/Órdenes por pagar/i);
  const countItemsElement = details.nextSibling;

  await userEvent.click(details);

  args.items.forEach((item) => {
    const itemElement = canvas.getByText(item.name);
    expect(itemElement).toBeVisible();
    expect(itemElement.nextSibling).toHaveTextContent(
      formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount, args.currency)
    );
  });

  await expect(countItemsElement).toHaveTextContent(`${args.items.length}`);
  await expect(studentInfo).toBeVisible();
  await expect(studentName).toBeVisible();
  await expect(details).toBeVisible();
};

const testButton = async (canvasElement: HTMLElement, args: Readonly<OrderResumeCardProps>) => {
  const canvas = within(canvasElement);
  const button = canvas.getByText(/CAMBIAR/i);
  await userEvent.click(button);
  await expect(args.onAssignRFC).toHaveBeenCalled();
};

export const WithRFC: CardResumeStory = {
  play: async ({ canvasElement, args }) => {
    testBase(canvasElement, args);
    testButton(canvasElement, args);

    const canvas = within(canvasElement);

    const RFCInfo = canvas.getByText(/Facturación:/i);
    const RFCName = RFCInfo.parentElement;

    await expect(RFCInfo).toBeVisible();
    await expect(RFCName).toBeVisible();

    await expect(RFCName).toHaveTextContent(args.dependent.billing_guardian?.billing_name ?? '');
  },
};

export const WithOutRFC: CardResumeStory = {
  args: {
    dependent: DependentWithColorMock({
      billing_guardian: undefined,
    }),
  },
  play: async ({ canvasElement, args }) => {
    testBase(canvasElement, args);
    testButton(canvasElement, args);

    const canvas = within(canvasElement);

    const RFCEmpty = canvas.getByText(/No hay facturación/i);

    await expect(RFCEmpty).toBeVisible();
  },
};

export const Loader: CardResumeStory = {
  args: {
    ...WithOutRFC.args,
    isLoading: true,
  },
  play: async ({ canvasElement, args }) => {
    testBase(canvasElement, args);
    const canvas = within(canvasElement);
    const loader = canvas.getByTestId('loader');

    await expect(loader).toBeVisible();
  },
};

export const LoaderVerify: CardResumeStory = {
  args: {
    ...WithOutRFC.args,
    isLoadingVerify: true,
  },
  play: async ({ canvasElement, args, ...other }) => {
    testBase(canvasElement, args);
    await Loader.play?.({ canvasElement, args, ...other });

    const canvas = within(canvasElement);
    const verifyLoader = canvas.getByText(/Verificando RFC/i);

    await expect(verifyLoader).toBeVisible();
  },
};
