import { Meta, StoryObj } from '@storybook/react';
import { Drawer } from '~/components/Drawer';
import { useArgs } from '@storybook/preview-api';
import { Button } from '~/components/atoms/Button';
import { expect, userEvent, within } from '@storybook/test';

const meta: Meta = {
  title: 'Drawers',
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Dynamic drawers to display information and actions' },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
  },
  args: {
    title: 'This is an example of a Title',
    description: 'This is a description, you can also add components to it!',
  },
};

export default meta;

type DrawerStory = StoryObj<{ open: boolean; title: string; description: string }>;

export const DrawerStory: DrawerStory = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ open }, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-md">
        <button onClick={() => updateArgs({ open: true })}>Open</button>

        <Drawer open={open} onClose={() => updateArgs({ open: false })}>
          <Drawer.Title className="mt-4 max-w-[290px] mx-auto">{args.title}</Drawer.Title>
          <Drawer.Description className="my-5">{args.description}</Drawer.Description>
          <Button size="small" className="mt-auto" onClick={() => updateArgs({ open: false })}>
            Close Drawer
          </Button>
        </Drawer>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const openButton = canvas.getByText('Open');

    await userEvent.click(openButton);

    // workaround for testing interaction of React Portal components
    const canvasParent = within(canvasElement.parentElement as HTMLElement);

    expect(await canvasParent.findByText('This is an example of a Title')).toBeInTheDocument();
    expect(canvasParent.getByText('This is a description, you can also add components to it!')).toBeInTheDocument();
    const closeButton = canvasParent.getByRole('button', { name: 'Close Drawer' });
    expect(closeButton).toBeVisible();
  },
};
