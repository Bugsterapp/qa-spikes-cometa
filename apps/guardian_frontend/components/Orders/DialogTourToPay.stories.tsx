import { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import DialogTourToPay from '~/components/Orders/DialogTourToPay';
import { expect, userEvent, within } from '@storybook/test';

const meta: Meta = {
  title: 'Dialog/DialogTourToPay',
  component: DialogTourToPay,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Dynamic dialog to display information and actions' },
    },
  },
  args: { open: false, hasDue: false },
  argTypes: {
    onCancel: {
      action: 'onCancel',
      table: { disable: true },
    },
    onSuccess: {
      action: 'onSuccess',
      table: { disable: true },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type DialogTourToPayStoryType = StoryObj<typeof DialogTourToPay>;

export const DialogTourToPayStory: DialogTourToPayStoryType = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ open, hasDue, onCancel, onSuccess }, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-md">
        <button
          onClick={() => {
            updateArgs({ open: true });
          }}
        >
          Open
        </button>
        <DialogTourToPay
          open={open}
          hasDue={hasDue}
          onSuccess={() => {
            updateArgs({ open: false });
            onSuccess();
          }}
          onCancel={() => {
            updateArgs({ open: false });
            onCancel();
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open');
    await userEvent.click(openButton);

    const canvasParent = within(canvasElement.parentElement as HTMLElement);
    const dialogElement = await canvasParent.findByRole('dialog');
    expect(dialogElement).toBeInTheDocument();

    const dialog = within(dialogElement);
    expect(dialog.getByRole('heading', { name: '¿Quieres ver como realizar tu primer pago?' })).toBeInTheDocument();

    const successButton = dialog.getByRole('button', { name: 'SI' });
    const cancelButton = dialog.getByRole('button', { name: 'Por ahora no' });

    expect(successButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    await userEvent.click(cancelButton);
  },
};
