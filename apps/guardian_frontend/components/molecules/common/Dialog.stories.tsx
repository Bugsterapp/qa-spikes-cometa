import { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { expect, userEvent, within } from '@storybook/test';
import Dialog from '~/components/molecules/common/Dialog';

const meta: Meta = {
  title: 'Dialog',
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Dynamic dialog to display information and actions' },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: { table: { disable: true } },
  },
  args: {
    content: 'This is an example of a content',
  },
};

export default meta;

type DialogStory = StoryObj<{ open: boolean; content: string }>;

export const DialogStory: DialogStory = {
  argTypes: {
    content: {
      control: 'text',
      table: { disable: false },
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ open }, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-md">
        <button onClick={() => updateArgs({ open: true })}>Open</button>
        <Dialog open={open} handleClose={() => updateArgs({ open: false })}>
          <Dialog.Content className="w-screen px-5">
            <div className="flex flex-col space-y-6">
              <span className="text-sm text-center">{args.content}</span>
              <Dialog.Close
                className="text-sm text-blue-100 bg-white border border-black rounded-lg cursor-pointer hover:text-opacity-75"
                onClick={() => updateArgs({ open: false })}
              >
                Close Dialog
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const openButton = canvas.getByText('Open');

    await userEvent.click(openButton);

    // workaround for testing interaction of React Portal components
    const canvasParent = within(canvasElement.parentElement as HTMLElement);

    expect(await canvasParent.findByText('This is an example of a content')).toBeInTheDocument();
    const closeButton = canvasParent.getByRole('button', { name: 'Close Dialog' });
    expect(closeButton).toBeVisible();
    await userEvent.click(closeButton);
  },
};
