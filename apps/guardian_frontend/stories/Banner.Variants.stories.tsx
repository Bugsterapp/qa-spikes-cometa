import { Meta, StoryObj } from '@storybook/react';
import { Banner } from '~/components/Banner';
import * as OrderCard from '~/components/OrderCard';

const meta: Meta<typeof Banner> = {
  title: 'Banners',
  component: Banner,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: { component: 'Banner to show infos, warnings or errors' },
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    intent: { control: 'select', options: ['warning', 'info', 'error'], defaultValue: '' },
    size: {
      control: 'select',
      defaultValue: '',
      options: ['', 'hero'],
    },
    children: { control: 'text', defaultValue: 'This is a banner' },
    className: {
      table: {
        disable: true,
      },
    },
  },
  args: { children: 'This is a banner' },
};

export default meta;

type BannerStory = StoryObj<typeof Banner>;

export const BannerStory: BannerStory = {};

export const BannerWarning: BannerStory = {
  args: { intent: 'warning', children: 'This is a warning' },
};

export const BannerInfo: BannerStory = {
  args: { intent: 'info', children: 'This is an info' },
  parameters: {
    controls: { include: [] },
  },
};

export const BannerError: BannerStory = {
  args: { intent: 'error', children: 'This is an error' },
  parameters: {
    controls: { include: [] },
  },
};

export const BannerSizeHero: BannerStory = {
  args: { children: 'This is a banner with hero size', size: 'hero' },
  parameters: {
    controls: { include: [] },
  },
};

export const BannerInCard: BannerStory = {
  render: (args) => (
    <OrderCard.Root status="subscription">
      <OrderCard.Content>
        <Banner {...args} />
        <OrderCard.Info>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dicta animi ipsa similique ipsam eius reprehenderit
          deleniti enim aspernatur. Maxime, adipisci! At harum tempore est repudiandae incidunt aperiam velit suscipit
          eaque.
        </OrderCard.Info>
        <OrderCard.Footer>Footer</OrderCard.Footer>
      </OrderCard.Content>
    </OrderCard.Root>
  ),
  args: { children: 'This is a banner in a card', size: 'hero' },
};
