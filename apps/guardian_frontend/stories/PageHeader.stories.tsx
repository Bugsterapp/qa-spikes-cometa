import { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '~/components/PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Pages/PageHeader',
  component: PageHeader,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Header for pages in guardian portal' },
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    // onClickBack: { control: 'boolean' },
  },
};

export default meta;

type PageHeaderStory = StoryObj<typeof PageHeader>;

export const PageHeaderStory: PageHeaderStory = {
  render: ({ onClickBack, ...args }) => (
    <PageHeader onClickBack={onClickBack ? () => alert('Go back!') : undefined} {...args} />
  ),
  args: {
    title: 'This is a title for a page',
    onClickBack: () => alert('Go back!'),
  },
};
