import type { Meta, StoryObj } from '@storybook/react';
import { DependentWithColorMock, SubscriptionItemsResumeMock } from './mocks/ResumeCard';
import { SelectedSchoolMock } from './mocks/SelectedSchool';
import { expect, userEvent, within } from '@storybook/test';
import {
  SubscriptionCardResume,
  SubscriptionCardResumeProps,
} from '~/pages/guardians/[guardianHash]/subscriptions/resume';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof SubscriptionCardResume> = {
  title: 'Subscriptions/Resume Cards',
  component: SubscriptionCardResume,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Cards for resume in subscription page' },
    },
  },
  argTypes: {
    dependent: { control: 'object' },
    selectedSchool: { control: 'object' },
    onAssignRFC: { action: 'onAssignRFC', table: { disable: true } },
    isLoading: { control: 'boolean' },
    isLoadingVerify: { control: 'boolean' },
    items: { control: 'array' },
  },
  args: {
    dependent: DependentWithColorMock({}),
    selectedSchool: SelectedSchoolMock({}),
    isLoading: false,
    isLoadingVerify: false,
    items: SubscriptionItemsResumeMock([]),
  },

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 448 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type CardResumeStory = StoryObj<typeof SubscriptionCardResume>;

const testBase = async (canvasElement: HTMLElement, args: Readonly<SubscriptionCardResumeProps>) => {
  const canvas = within(canvasElement);

  const studentInfo = canvas.getByText(/Estudiante:/i);
  const studentName = canvas.getByText(args.dependent.first_name.toUpperCase());

  const details = canvas.getByText(/Domiciliaciones/i);
  const countItemsElement = details.nextSibling;

  await userEvent.click(details);

  args.items.forEach((item) => {
    const itemElement = canvas.getByText(item.concept_name);
    expect(itemElement).toBeVisible();
  });

  await expect(countItemsElement).toHaveTextContent(`${args.items.length}`);
  await expect(studentInfo).toBeVisible();
  await expect(studentName).toBeVisible();
  await expect(details).toBeVisible();
};

const testButton = async (canvasElement: HTMLElement, args: Readonly<SubscriptionCardResumeProps>) => {
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
    items: SubscriptionItemsResumeMock([
      {
        id: '2fee4b1b-1b1b-4b1b-8b1b-1b1b1b1b1b1b',
        concept_name: 'Música y arte',
      },
    ]),
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
