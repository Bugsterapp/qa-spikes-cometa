import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import * as Tabs from '~/components/Tabs';

const meta: Meta<typeof Tabs.Tabs> = {
  title: 'Tabs',
  component: Tabs.Tabs,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Tabs to switch between different type of contents' },
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
};

export default meta;

type TabsStory = StoryObj<typeof Tabs.Tabs>;

export const TabsStory: TabsStory = {
  render: () => (
    <Tabs.Tabs defaultValue="A">
      <Tabs.TabsTrigger value="A">Tab A</Tabs.TabsTrigger>
      <Tabs.TabsTrigger value="B">Tab B</Tabs.TabsTrigger>
      <Tabs.TabsContent value="A">This is Content A</Tabs.TabsContent>
      <Tabs.TabsContent value="B">This is Content B</Tabs.TabsContent>
    </Tabs.Tabs>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const tabA = canvas.getByText('Tab A');
    const tabB = canvas.getByText('Tab B');

    await step('Intial state tabs working as expected', async () => {
      const contentA = await canvas.getByText('This is Content A');
      const contentB = canvas.queryByText('This is Content B');
      expect(contentA).toBeVisible();
      expect(contentB).toBeNull();
    });

    await step('Tabs are switchable as expected', async () => {
      userEvent.click(tabB);

      const hiddenContentA = await canvas.findByText('This is Content A');

      const contentB = await canvas.findByText('This is Content B');
      expect(contentB).toBeVisible();
      expect(hiddenContentA).not.toBeVisible();

      userEvent.click(tabA);
      const shownContentA = await canvas.findByText('This is Content A');
      expect(shownContentA).toBeVisible();
    });
  },
};
